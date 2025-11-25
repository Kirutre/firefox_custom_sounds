//* Extension Configuration

const STORAGE_KEY_EVENT = 'eventSoundSettings';
const STORAGE_KEY_CUSTOM = 'customSoundSettings';


//* ------ Event Configuration Loading and Saving Functions ------

// Load the state of the checkboxes from storage and update the UI
function loadEventSettings() {
    browser.storage.local.get(STORAGE_KEY_EVENT)
        .then(result => {
            const settings = result[STORAGE_KEY_EVENT] || {};
            
            // If the state is not saved, 'true' is assumed.
            document.getElementById('tab-open-toggle').checked = settings.tab_open !== false;
            document.getElementById('tab-close-toggle').checked = settings.tab_close !== false;
        })
        .catch(error => console.error(`Error loading event configuration: ${error}`));
}

// Save the state of the checkboxes in storage.
function saveEventSetting(event) {
    const toggleId = event.target.id;
    const isEnabled = event.target.checked;
    
    // Map the toggle ID to the key name
    let key;
    if (toggleId === 'tab-open-toggle') {
        key = 'tab_created';
    } else if (toggleId === 'tab-close-toggle') {
        key = 'tab_removed';
    } else {
        return;
    }

    // Get the current configuration to update only one key
    browser.storage.local.get(STORAGE_KEY_EVENT)
        .then(result => {
            const settings = result[STORAGE_KEY_EVENT] || {};
            settings[key] = isEnabled;

            browser.storage.local.set({ [STORAGE_KEY_EVENT]: settings })
                .then(() => console.log(`Event Settings '${key}' saved: ${isEnabled}`))
                .catch(error => console.error(`Error saving settings: ${error}`));
        });
}


//* ------ Logic for Custom Sounds ------

// TODO: Implement audio file uploading, Base64 conversion, or URL.createObjectURL,
// and saved along with the shortcut in browser.storage.local (STORAGE_KEY_CUSTOM).


//* ------ Initialization ------

document.addEventListener('DOMContentLoaded', () => {
    loadEventSettings();

    document.getElementById('tab-open-toggle').addEventListener('change', saveEventSetting);
    document.getElementById('tab-close-toggle').addEventListener('change', saveEventSetting);

    // TODO: Add listeners for the custom sounds section
    // document.getElementById('add-sound-button').addEventListener('click', saveCustomSound);
    // document.getElementById('shortcut-input').addEventListener('keydown', captureShortcut);
});