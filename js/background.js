const userBrowser = typeof browser !== 'undefined' ? browser : chrome;


const createOffscreenDom = async () => {
    const contexts = await userBrowser.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] });

    if (contexts.length > 0)    return;

    await userBrowser.offscreen.createDocument({
        url: "../offscreen/offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Play event sounds"
    });
}   


/** @returns {Promise<Object>} */
const getExtensionData = async () => {
    const data = await userBrowser.storage.local.get('custom_sounds_config');

    return data.custom_sounds_config || {};
}


/** @param {string} soundURL */
const playSound = async (soundURL) => {
    if (!soundURL) {
        console.error('Sound URL not provided');    return;
    }

    await createOffscreenDom();

    userBrowser.runtime.sendMessage({
        target: 'offscreen_audio',
        url: soundURL
    });
};

/** @param {string} eventName */
const playSoundByEvent = async (eventName) => {
    const storageData = await getExtensionData();

    const soundEntry = Object.values(storageData).find(sound =>
        sound.eventKey === eventName && sound.active === true
    );

    if (soundEntry && soundEntry.soundURL) {
        playSound(soundEntry.soundURL);
    }
}


/** 
 * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated
 * @param {tabs.Tab} tab
 */
const handleTabCreated = async (tab) => {
    console.log(`New tab created: ${tab.id}`);

    await playSoundByEvent('new-tab');
};

/**
 * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
 * @param {integer} tabId
 * @param {object} removeInfo Includes windowId {integer} and isWindowClosing {boolean}
 */
const handleTabRemoved = async (tabId, removeInfo) => {
    if (!removeInfo.isWindowClosing) {
        console.log(`Removed tab: ${tabId}`);

        await playSoundByEvent('close-tab');
    }
};


userBrowser.tabs.onCreated.addListener(tab => handleTabCreated(tab));
userBrowser.tabs.onRemoved.addListener((tabId, removeInfo) => handleTabRemoved(tabId, removeInfo));

userBrowser.runtime.onMessage.addListener(message => {
    console.log(2);

    if (message.action === 'play_sound') {
        console.log("test2")

        playSoundByEvent(message.eventKey);
    }
});

//* Open the options page
userBrowser.action.onClicked.addListener(() => {
    const optionsUrl = userBrowser.runtime.getURL("options/options.html");

    userBrowser.tabs.create({
        url: optionsUrl,
        active: true
    })
    .then(tab => {
        console.log(`Options page open in the ID tab: ${tab.id}`);
    })
    .catch(error => {
        console.error(`Error opening the options page in a new tab: ${error}`);
    });
});