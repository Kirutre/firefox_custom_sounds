//* ------ Playback Functions ------

/** Plays a sound
 * @param {string} soundURL
 */
const playSound = soundURL => {
    if (!soundURL) {
        console.error('URL not provided');
        return;
    }

    const audio = new Audio(soundURL);

    audio.play()
        .then(() => {
            console.log(`Sound played: ${soundURL}`);
        })
        .catch(error => {
            console.error(`Error playing sound: ${soundURL}, error: ${error}`);
        });
};


//* ------ Event Handlers ------

/** Executed when a tab is created
 * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated
 * @param {tabs.Tab} tab
 */
const handleTabCreated = async (tab) => {
    console.log(`New tab created: ${tab.id}`);

    const storageData = await browser.storage.local.get('custom_sounds_config');
    const event = storageData.custom_sounds_config && storageData.custom_sounds_config.created_tab;

    if (event && event.active) {
        const soundURL = event.base64;

        playSound(soundURL);
    }
};

/** Executed when a tab is removed
 * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
 * @param {integer} tabId
 * @param {object} removeInfo Includes windowId {integer} and isWindowClosing {boolean}
 */
const handleTabRemoved = async (tabId, removeInfo) => {
    if (!removeInfo.isWindowClosing) {
        console.log(`Removed tab: ${tabId}`);

        const storageData = await browser.storage.local.get('custom_sounds_config');
        const event = storageData.custom_sounds_config && storageData.custom_sounds_config.removed_tab;

        if (event && event.active) {
            const soundURL = event.base64;

            playSound(soundURL);
        }
    }
};


//* ------ Listeners ------

browser.tabs.onCreated.addListener(handleTabCreated);
browser.tabs.onRemoved.addListener(handleTabRemoved);

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