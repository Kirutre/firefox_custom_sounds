const uploadSoundButton = document.getElementById('upload-sounds');
const soundList = document.getElementById('sound-list');
const saveSoundButton = document.getElementById('save-sound');

/** @returns {Object} */
const getSoundLibraryState = () => {
    return browser.storage.local.get('sounds_library');
}

 /** @param {string} prefix    @returns {string} */
const generateUUID = (prefix = 'sound-') => {
    return `${prefix}${crypto.randomUUID()}`;
}

/** Check if the sound exists in the library 
 * @param {string} soundName
 * @returns {Promise<boolean>}
 */
const doesSoundExist = async (soundName) => {
    const storageData = await getSoundLibraryState();
    const soundsLibrary = storageData.sounds_library || {};

    const sounds = Object.values(soundsLibrary);

    const exists = sounds.some(sound => sound.name === soundName);

    return exists;
}

// TODO: add better error handling
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
 * @param {string} soundUUID    @param {string} oldEventKey
 * @param {string} newEventKey  @param {boolean} EventState
 */
const updateSound = async (soundUUID, oldEventKey, newEventKey, eventState = true) => {
    const storageData = await browser.storage.local.get('custom_sounds_config');
    const configs = storageData.custom_sounds_config || {};

    configs[newEventKey] = {
        soundUUID,
        active: eventState
    };

    if (oldEventKey && oldEventKey !== newEventKey) {
        delete configs[oldEventKey];
    }

    await browser.storage.local.set({
        'custom_sounds_config': configs
    });
}

/** Save a sound in the storage
 * @param {string} soundUUID  @param {File} sound
 */
const saveSound = async (soundUUID, sound) => {
    const soundURL = await fileToBase64(sound);

    const storageData = await getSoundLibraryState();
    const currentLibrary = storageData.sounds_library || {};

    const newLibrary = {
        ...currentLibrary,
        [soundUUID]: {
            soundURL,
            name: sound.name
        }
    };

    await browser.storage.local.set({
        'sounds_library': newLibrary
    });
}

/** Create a <li> element 
 * @param {string} soundUUID  @param {string} soundName
 * @returns {HTMLLIElement}
*/
const createLiElement = (soundUUID, soundName) => {
    const li = document.createElement('li');
    li.dataset.uuid = soundUUID;
    li.className = 'flex items-center justify-evenly bg-slate-900 p-3 rounded-lg shadow-md shrink';

    const pName = document.createElement('p');
    pName.className = 'text-white font-semibold text-xl w-8/12';
    pName.textContent = soundName;

    const buttonChangeKey = document.createElement('button');
    buttonChangeKey.className = 'change-event-key cursor-pointer text-white text-sm bg-violet-600 px-3 py-1 rounded-full hover:bg-violet-700 transition w-1/12';
    buttonChangeKey.textContent = 'Set an action';

    const divSwitch = document.createElement('div');
    divSwitch.className = 'relative inline-block w-15 h-5';

    const inputCheck = document.createElement('input');
    inputCheck.id = soundUUID;
    inputCheck.type = 'checkbox';
    inputCheck.className = 'event-check peer appearance-none w-15 h-6 bg-violet-950 rounded-full checked:bg-violet-700 cursor-pointer transition-colors duration-300';

    const labelCheck = document.createElement('label');
    labelCheck.htmlFor = soundUUID;
    labelCheck.className = 'absolute top-0 left-0 w-6 h-6 bg-gray-400 rounded-full border border-slate-800 transition-transform duration-500 peer-checked:translate-x-9 peer-checked:border-slate-800 peer-checked:bg-white cursor-pointer';

    divSwitch.append(inputCheck, labelCheck);

    const buttonDelete = document.createElement('button');
    buttonDelete.className = 'sound-delete group w-10 h-11 cursor-pointer';
    buttonDelete.innerHTML = `
        <svg class="fill-red-600 w-full h-full" viewbox="0 -1 16 16">
            <path d="M5 5v7q0 2 2 2h2q2 0 2-2v-8h1v8q0 3-2 3h-4q-2 0-2-3v-8h1v1M6 8q0-1 .5-1 .5 0 .5 1v2q0 1-.5 1-.5 0-.5-1v-2M9 8q0-1 .5-1 .5 0 .5 1v2q0 1-.5 1-.5 0-.5-1v-2"/>
                  
            <path class="trash-can-lid transition-transform duration-300 origin-[70%_50%] group-hover:-translate-y-0.5 group-hover:rotate-12" d="M4 4q-1 0-1-.5 0-.5 1-.5h2q0-2 1-2h2q1 0 1 2h2q1 0 1 .5 0 .5-1 .5h-8M7 3v-1h2v1" fill-rule="evenodd"/>
        </svg>`;

    li.append(pName, buttonChangeKey, divSwitch, buttonDelete);

    return li;
}

/** @param {HTMLLIElement} soundToDelete */
const deleteSound = async (soundToDelete) => {
    const UUIDToDelete = soundToDelete.dataset.uuid;

    const storageData = await getSoundLibraryState();
    const currentLibrary = storageData.sounds_library || {};

    delete currentLibrary[UUIDToDelete]
            
    browser.storage.local.set({
        'sounds_library': currentLibrary
    });

    soundToDelete.remove();
}


soundList.addEventListener('click', async (e) => {
    const deleteButton = e.target.closest('.sound-delete');

    if (deleteButton) {
        const soundToDelete = deleteButton.closest('li');
    
        if (soundToDelete) {
            await deleteSound(soundToDelete);
        }
    }
});

saveSoundButton.addEventListener('click', async (e) => {
    if (uploadSoundButton.files.length == 0) {
        console.warn('No sound files detected');    return;
    }

    const sound = uploadSoundButton.files[0];

    if (await doesSoundExist(sound.name)) {
        console.warn(`The sound ${sound.name} already exists`);    return;
    }

    const soundUUID = generateUUID();
    
    await saveSound(soundUUID, sound);

    const soundLiElement = createLiElement(soundUUID, sound.name);

    soundList.appendChild(soundLiElement);
});

addEventListener('DOMContentLoaded', async (e) => {
    const storageData = await getSoundLibraryState();
    const soundsLibrary = storageData.sounds_library || {};

    Object.entries(soundsLibrary).forEach(([soundUUID, sound]) => {
        const soundLiElement =  createLiElement(soundUUID, sound.name);

        soundList.appendChild(soundLiElement);
    });
});

// TODO: add change-key-event, in this moment i don't remember anymore, have luck tomorrow :D