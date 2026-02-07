/** @returns {Promise<Object>} */
const getExtensionData = async () => {
    const data = await browser.storage.local.get('custom_sounds_config');

    return data.custom_sounds_config || {};
}

/** @param {Object} data  @param {string} key   @returns {Array<Object>} */
const getActiveSounds = (data, key) => {
    return Object.values(data).filter(sound => 
        sound.eventKey === key && sound.active
    );
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

    const sounds = getActiveSounds(storageData, eventName);
    const validSounds = (sounds.length > 0 || eventName === 'all-keys') ?
        sounds :
        getActiveSounds(storageData, 'all-keys')

    if (validSounds.length === 0) {
        return console.warn(`No sounds found with ${eventName} event`);
    }

    const {soundURL, volume} = validSounds[Math.floor(Math.random() * validSounds.length)];

    if (soundURL) {
        playSound(soundURL, volume / 100);
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