const STORAGE_KEY_EVENT = 'eventSoundSettings';

//* ------ Browser Sounds ------

const tabSounds = {
    'tab_created': browser.runtime.getURL('sounds/new_tab.mp3'),
    'tab_removed': browser.runtime.getURL('sounds/close_tab.mp3')
};


//* ------ Playback Functions ------

/** Plays an audio file given its URL 
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

/** Check if an event sound is enabled before playing it
 * @param {string} eventName - 'tab_open' o 'tab_close'
 */
function checkAndPlayEventSound(eventName) {
    browser.storage.local.get(STORAGE_KEY_EVENT)
        .then(result => {
            const settings = result[STORAGE_KEY_EVENT] || {};

            const isEnabled = settings[eventName] !== false;

            if (isEnabled) {
                playSound(tabSounds[eventName]);
            } else {
                console.log(`Playback of ${eventName} disabled by the user`);
            }
        })
        .catch(error => {
            console.error(`Error verifying the configuration for ${eventName}: error: ${error}`);

            playSound(tabSounds[eventName]);
        });
}


//* ------ Event Handlers ------

/** Executed when a tab is created
 * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated
 * @param {tabs.Tab} tab
 */
const handleTabCreated = tab => {
    console.log(`New tab created: ${tab.id}`);

    checkAndPlayEventSound('tab_created');
};

/** Executed when a tab is removed
 * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
 * @param {integer} tabId
 * @param {object} removeInfo Includes windowId {integer} and isWindowClosing {boolean}
 */
const handleTabRemoved = (tabId, removeInfo) => {
    if (!removeInfo.isWindowClosing) {
        console.log(`Removed tab: ${tabId}`);

        checkAndPlayEventSound('tab_removed');
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