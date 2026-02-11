const userBrowser = typeof browser !== 'undefined' ? browser : chrome;

/** @returns {Promise<Object>} */
const getExtensionData = async () => {
    const data = await userBrowser.storage.local.get('custom_sounds_config');

    return data.custom_sounds_config || {};
}

/** @param {Object} data  @param {string} key   @returns {Array<Object>} */
const getActiveSounds = (data, key) => {
    return Object.values(data).filter(sound => 
        sound.eventKey === key && sound.active
    );
}

const createOffscreenDom = async () => {
    if (!userBrowser.offscreen) return;

    const contexts = await userBrowser.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] });

    if (contexts.length > 0)    return;

    await userBrowser.offscreen.createDocument({
        url: "../offscreen/offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Play event sounds"
    });
}


/** @param {string} soundURL  @param {number} volume */
const playSound = async (soundURL, volume) => {
    if (!soundURL) return;

    if (userBrowser.offscreen) {
        await createOffscreenDom();

        userBrowser.runtime.sendMessage({
            target: 'offscreen_audio',
            url: soundURL,
            volume: volume
        });
    }

    else {
        const audio = new Audio(soundURL);
        audio.volume = volume;

        audio.play().catch(error => console.error(`Firefox playback error: ${error}`));
    }
};

/** @param {string} eventName */
const playSoundByEvent = async (eventName) => {
    const storageData = await getExtensionData();
    const activeSoundsCache = getActiveSounds(storageData, eventName);

    const whiteList = ['new-tab', 'close-tab'].includes(eventName);

    const sounds = activeSoundsCache.length > 0 || whiteList
        ? activeSoundsCache
        : getActiveSounds(storageData, 'all-keys');

    if (sounds.length === 0) {
        return console.warn(`No sounds found with ${eventName} event`);
    }

    const {soundURL, volume} = sounds[Math.floor(Math.random() * sounds.length)];

    if (soundURL) {
        await playSound(soundURL, volume / 100);
    }
}


/** 
 * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated
 * @param {tabs.Tab} tab
 */
const handleTabCreated = async (tab) => {
    await playSoundByEvent('new-tab');
};

/**
 * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
 * @param {integer} tabId
 * @param {object} removeInfo Includes windowId {integer} and isWindowClosing {boolean}
 */
const handleTabRemoved = async (tabId, removeInfo) => {
    if (!removeInfo.isWindowClosing) {
        await playSoundByEvent('close-tab');
    }
};


userBrowser.tabs.onCreated.addListener(async (tab) => await handleTabCreated(tab));
userBrowser.tabs.onRemoved.addListener(async (tabId, removeInfo) => await handleTabRemoved(tabId, removeInfo));

userBrowser.runtime.onMessage.addListener(async (message) => {
    if (message.action === 'play_sound') {
        await playSoundByEvent(message.eventKey);
    }
});

//* Open the options page
userBrowser.action.onClicked.addListener(() => {
    const optionsUrl = userBrowser.runtime.getURL("options/options.html");

    userBrowser.tabs.create({url: optionsUrl});
});