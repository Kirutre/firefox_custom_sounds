const uploadSoundButton = document.getElementById('upload-sounds');
const soundList = document.getElementById('sound-list');
const saveSoundButton = document.getElementById('save-sound');

const getSoundLibraryState = () => {
    return browser.storage.local.get('sounds_library');
}

const generateUUID = (prefix = 'sound-') => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 5);

    return `${prefix}${timestamp}-${randomPart}`;
}

/** Convert binary data into a string
 * @param {File} file
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => { 
    const reader = new FileReader();
    
    reader.readAsDataURL(file); 
    
    reader.onload = () => resolve(reader.result);
    
    reader.onerror = error => reject(error);
  });
}

/** Update the sound related to a key
 * @param {string} soundUUID
 * @param {string} oldEventKey
 * @param {string} newEventKey 
 * @param {boolean} EventState
 */
const updateSound = async (soundUUID, oldEventKey, newEventKey, eventState = true) => {
    const storageData = await browser.storage.local.get('custom_sounds_config');
    const configs = storageData.custom_sounds_config || {};

    configs[newEventKey] = {
        soundUUID,
        active: eventState
    };

    delete configs[oldEventKey];

    await browser.storage.local.set({
        'custom_sounds_config': configs
    });
}

/** Save a sound in the storage
 * @param {File} sound
 */
const saveSound = async (sound) => { 
    const soundURL = await fileToBase64(sound);
    const soundUUID = generateUUID();

    const storageData = await getSoundLibraryState();
    const currentLibrary = storageData.sounds_library || {};

    const newLibrary = {
        ...currentLibrary,
        [soundUUID]: {
            soundURL,
            name: sound.name
        }
    };

    console.log(newLibrary);

    await browser.storage.local.set({
        'sounds_library': newLibrary
    });
}


soundList.addEventListener('click', async (e) => {
    const deleteButton = e.target.closest('.sound-delete');

    if (deleteButton) {
        const soundToDelete = deleteButton.closest('li');
    
        if (soundToDelete) {
            const UUIDToDelete = soundToDelete.dataset.uuid;

            const storageData = await getSoundLibraryState();
            const currentLibrary = storageData.sounds_library || {};

            delete currentLibrary[UUIDToDelete]
            
            browser.storage.local.set({
                'sounds_library': currentLibrary
            });

            soundToDelete.remove();
        }
    }
});

saveSoundButton.addEventListener('click', e => {
    if (uploadSoundButton.files.length > 0) {
        const sound = uploadSoundButton.files[0];

        saveSound(sound);
    }
});

// TODO: add validation to repetitive file sound (same name), add createSoundLi -> <li>, add change-key-event, in this moment i don't remember anymore, have luck tomorrow :D