/** @returns {Promise<Object>} */
const getExtensionData = async () => {
    const data = await browser.storage.local.get('custom_sounds_config');

    return data.custom_sounds_config || {};
}


/** @param {string} soundURL  @param {number} volume */
const playSound = (soundURL, volume) => {
    if (!soundURL) {
        console.error('Sound URL not provided');    return;
    }

    const audio = new Audio(soundURL);
    audio.volume = volume;

    audio.play()
        .then(() => {
            console.log(`Sound played: ${soundURL}`);
        })
        .catch(error => {
            console.error(`Error playing sound: ${soundURL}, error: ${error}`);
        });
};

/** @param {string} eventName */
const playSoundByEvent = async (eventName) => {
    const storageData = await getExtensionData();

    const soundEntry = Object.values(storageData).find(sound =>
        sound.eventKey === eventName && sound.active === true
    );

    if (soundEntry && soundEntry.soundURL) {
        playSound(soundEntry.soundURL, soundEntry.volume / 100);
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


browser.tabs.onCreated.addListener(async (tab) => await handleTabCreated(tab));
browser.tabs.onRemoved.addListener(async (tabId, removeInfo) => await handleTabRemoved(tabId, removeInfo));

browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === 'play_sound') {
        await playSoundByEvent(message.eventKey);
    }
});

//* Open the options page
browser.action.onClicked.addListener(() => {
    const optionsUrl = browser.runtime.getURL("options/options.html");

    browser.tabs.create({
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