const uploadSoundButton = document.getElementById('upload-sounds');
const soundList = document.getElementById('sound-list');
const saveSoundButton = document.getElementById('save-sound');
const changeEventDialog = document.getElementById('modal-set-event');
const closeDialogSVG = document.getElementById('close-modal');
const dropdownEventListButton = document.getElementById('dropdown-button');
const eventListMenu = document.getElementById('dropdown-menu');

/** @returns {Promise<Object>} */
const getExtensionData = async () => {
    const data = await browser.storage.local.get('custom_sounds_config');

    return data.custom_sounds_config || {};
}

 /** @param {string} prefix    @returns {string} */
const generateUUID = (prefix = 'sound-') => {
    return `${prefix}${crypto.randomUUID()}`;
}

/** Check if the sound exists in the storage 
 * @param {string} soundName
 * @returns {Promise<boolean>}
 */
const doesSoundExist = async (soundName) => {
    const storageData = await getExtensionData();

    console.log(storageData);

    const sounds = Object.values(storageData);

    const exists = sounds.some(sound => sound.name === soundName);

    console.log(exists);

    return exists;
}

/** Check if a event key is already used
 * @param {string} eventKey  @param {string} soundUUID
 * @returns {Promise<boolean>}
 */
const isKeyAlreadyUsed = async (eventKey, soundUUID) => {
    const storageData = await getExtensionData();
    const sounds = Object.entries(storageData);

    const isUsed = sounds.some(([uuid, data]) => {
        if (uuid === soundUUID) {
            return false;
        }

        return data.eventKey === eventKey;
    });

    return isUsed;
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
 * @param {string} soundUUID @param {string} eventKey  @param {boolean} EventState
 */
const updateSound = async (soundUUID, eventKey, eventState = true) => {
    const storageData = await getExtensionData();

    if (!storageData[soundUUID]) {
        console.error(`Sound with UUID ${soundUUID} not found in storage`);    return;
    }

    const currentState = storageData[soundUUID] ? storageData[soundUUID].active : eventState;

    storageData[soundUUID].eventKey = eventKey;
    storageData[soundUUID].active = currentState;

    await browser.storage.local.set({
        'custom_sounds_config': storageData
    });
}

/** Save a sound in the storage
 * @param {string} soundUUID  @param {File} sound
 */
const saveSound = async (soundUUID, sound) => {
    const soundURL = await fileToBase64(sound);

    const storageData = await getExtensionData();

    const newStoragedata = {
        ...storageData,
        [soundUUID]: {
            soundURL,
            name: sound.name,
            eventKey: null,
            active: true
        }
    };

    await browser.storage.local.set({
        'custom_sounds_config': newStoragedata
    });
}

/** @param {string|null} eventKey    @returns {string} */
const getButtonKeyText = (eventKey) => {
    if (!eventKey) {
        return 'Set an action';
    }

    return eventKey.startsWith('Key') ? eventKey.substring(3) : eventKey;
}

/** Create a <li> element 
 * @param {string} soundUUID  @param {string} soundName
 * @param {string} eventKey   @param {boolean} state
 * @returns {HTMLLIElement}
*/
const createLiElement = (soundUUID, soundName, eventKey, state = true) => {
    const li = document.createElement('li');
    li.dataset.uuid = soundUUID;
    li.className = 'flex items-center justify-evenly bg-slate-900 p-3 rounded-lg shadow-md shrink';

    const pName = document.createElement('p');
    pName.className = 'text-white font-semibold text-xl w-8/12';
    pName.textContent = soundName;

    const buttonShowDialog = document.createElement('button');
    buttonShowDialog.className = 'show-dialog cursor-pointer text-white text-sm bg-violet-600 px-3 py-1 rounded-full hover:bg-violet-700 transition w-1/12';
    buttonShowDialog.textContent = getButtonKeyText(eventKey);

    const divSwitch = document.createElement('div');
    divSwitch.className = 'relative inline-block w-15 h-5';

    const inputCheck = document.createElement('input');
    inputCheck.id = soundUUID;
    inputCheck.type = 'checkbox';
    inputCheck.className = 'event-check peer appearance-none w-15 h-6 bg-violet-950 rounded-full checked:bg-violet-700 cursor-pointer transition-colors duration-300';
    inputCheck.checked = state;

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

    li.append(pName, buttonShowDialog, divSwitch, buttonDelete);

    return li;
}

/** @param {HTMLLIElement} soundToDelete */
const deleteSound = async (soundToDelete) => {
    const UUIDToDelete = soundToDelete.dataset.uuid;

    const storageData = await getExtensionData();

    delete storageData[UUIDToDelete];
            
    await browser.storage.local.set({
        'custom_sounds_config': storageData
    });

    soundToDelete.remove();
}

/** @returns {Promise<string>} */
const waitForKeyPress = () => {
    return new Promise(resolve => {
        const keyHandler = (event) => {
            event.preventDefault(); 
            
            resolve(event.code);

            window.removeEventListener('keydown', keyHandler);
        };

        window.addEventListener('keydown', keyHandler);
    });
}

/** @param {HTMLLIElement} soundLiElement */
const handleKeyChange = async (soundLiElement, button) => {
    const soundUUID = soundLiElement.dataset.uuid;

    button.textContent = 'Press a key...';
    button.disabled = true;

    const newEventKey = await waitForKeyPress();

    if (await isKeyAlreadyUsed(newEventKey, soundUUID)) {
        console.warn(`The key ${newEventKey} is already used`);

        button.textContent = getButtonKeyText();
        button.disabled = false;

        return;
    }

    await updateSound(soundUUID, newEventKey);

    button.textContent = getButtonKeyText(newEventKey);
    button.disabled = false;
}

const handleShowDialog = () => {
    changeEventDialog.showModal();
}

const handleCloseDialog = () => {
    changeEventDialog.close();
}


soundList.addEventListener('click', async (e) => {
    const deleteButton = e.target.closest('.sound-delete');
    const showDialogButton = e.target.closest('.show-dialog');

    if (deleteButton) {
        const soundLiElement = deleteButton.closest('li');

        if (soundLiElement) {
            await deleteSound(soundLiElement);
        }
    }

    if (showDialogButton) {
        const soundLiElement = showDialogButton.closest('li');

        if (soundLiElement) {
            handleShowDialog();
        }
    }
});

closeDialogSVG.addEventListener('click', handleCloseDialog);

changeEventDialog.addEventListener('click', (e) => {
    if (e.target === changeEventDialog) {
        handleCloseDialog();
    }
});

eventListMenu.addEventListener('toggle', (e) => {
    dropdownEventListButton.classList.toggle('rounded-b-none');

    if (e.newState === 'open') {
        const rect = dropdownEventListButton.getBoundingClientRect();
        
        eventListMenu.style.top = `${rect.bottom}px`;
        eventListMenu.style.left = `${rect.left}px`;
    }
});

saveSoundButton.addEventListener('click', async (e) => {
    if (uploadSoundButton.files.length === 0) {
        console.warn('No sound files detected');   return;
    }

    const sound = uploadSoundButton.files[0];

    if (await doesSoundExist(sound.name)) {
        console.warn(`The sound ${sound.name} already exists`);   return;
    }

    const soundUUID = generateUUID();
    
    await saveSound(soundUUID, sound);

    const soundLiElement = createLiElement(soundUUID, sound.name);

    soundList.appendChild(soundLiElement);
});

addEventListener('DOMContentLoaded', async (e) => {
    const storageData = await getExtensionData();

    Object.entries(storageData).forEach(([soundUUID, data]) => {
        const soundLiElement =  createLiElement(soundUUID, data.name, data.eventKey, data.active);

        soundList.appendChild(soundLiElement);
    });
});

// TODO: create the popup for change-key-event, create the popup for alerts and warnings, fix the text-size bug in change-key button, add checkChangeState