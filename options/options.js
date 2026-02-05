const uploadSoundButton = document.getElementById('upload-sounds');
const saveSoundButton = document.getElementById('save-sound');
const soundList = document.getElementById('sound-list');
const changeEventDialog = document.getElementById('modal-set-event');
const closeDialogSVG = document.getElementById('close-modal');
const saveDialogChanges = document.getElementById('save-modal-changes');
const dropdownEventListButton = document.getElementById('dropdown-button');
const dropdownEventListButtonText = document.getElementById('dropdown-button-text');
const eventListMenu = document.getElementById('dropdown-menu');
const setKeyButton = document.getElementById('set-key');

/** @returns {Promise<Object>} */
const getExtensionData = async () => {
    const data = await browser.storage.local.get('custom_sounds_config');

    return data.custom_sounds_config || {};
}

 /** @param {string} prefix     @returns {string} */
const generateUUID = (prefix = 'sound-') => {
    return `${prefix}${crypto.randomUUID()}`;
}

/** Convert binary data into string
 * @param {File} file
 * @returns {Promise<string>}
 */
const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => { 
    const reader = new FileReader();
    
    reader.readAsDataURL(file); 
    
    reader.onload = () => resolve(reader.result);
    
    reader.onerror = error => reject(error);
  });
}

/** @param {string} event   @returns {string} */
const santizeEventName = (event) => {
    return event
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/** @param {string|null} eventAction    @returns {string} */
const getButtonText = (eventAction) => {
    if (!eventAction || eventAction === 'null') {
        return 'Set an action';
    }

    return eventAction.startsWith('Key') ? eventAction.substring(3) : santizeEventName(eventAction);
}

/** @param {string} soundName   @returns {Promise<boolean>} */
const doesSoundExist = async (soundName) => {
    const storageData = await getExtensionData();

    const sounds = Object.values(storageData);

    const exists = sounds.some(sound => sound.name === soundName);

    return exists;
}

/** @param {string} eventAction  @param {string} soundUUID     @returns {Promise<boolean>} */
const isEventAlreadyUsed = async (eventAction, soundUUID) => {
    const storageData = await getExtensionData();
    const sounds = Object.entries(storageData);

    const isUsed = sounds.some(([uuid, data]) => {
        if (uuid === soundUUID) {
            return false;
        }

        return data.eventKey === eventAction;
    });

    return isUsed;
}

/** 
 * @param {string} soundUUID  @param {string} soundName
 * @param {string} eventKey   @param {boolean} state
 * @param {number} volume     @returns {HTMLLIElement}
*/
const createLiElement = (soundUUID, soundName, eventKey, state = true, volume = 100) => {
    const li = document.createElement('li');
    li.dataset.uuid = soundUUID;
    li.className = 'flex items-center justify-evenly bg-slate-900 p-3 rounded-lg shadow-md shrink';

    const pName = document.createElement('p');
    pName.className = 'text-white font-semibold text-xl w-8/12';
    pName.textContent = soundName;

    const buttonShowDialog = document.createElement('button');
    buttonShowDialog.className = 'show-dialog cursor-pointer text-white text-sm bg-violet-600 px-3 py-1 rounded-full hover:bg-violet-700 transition w-1/12';
    buttonShowDialog.textContent = getButtonText(eventKey);

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

    const divVolumeController = document.createElement('div');
    divVolumeController.className = 'relative group flex items-center justify-center w-12 h-12';

    const spanVolumeToolTip = document.createElement('span');
    spanVolumeToolTip.className = 'volume-tooltip absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-violet-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg';
    spanVolumeToolTip.textContent = `${volume}%`

    const divKnob = document.createElement('div');
    divKnob.className = 'knob w-8 h-8 bg-slate-800 rounded-full border-2 border-slate-600 cursor-pointer relative shadow-inner flex justify-center items-start pt-1 transform rotate-0 transition-transform duration-75 select-none';

    const knobRotation = (volume * 2.7) - 135;
    divKnob.style.transform = `rotate(${knobRotation}deg)`;

    const divIndicator = document.createElement('div');
    divIndicator.className = 'w-1 h-2 bg-violet-400 rounded-full shadow-lg shadow-violet-400/80';

    divKnob.append(divIndicator);
    divVolumeController.append(spanVolumeToolTip, divKnob);

    const buttonDelete = document.createElement('button');
    buttonDelete.className = 'sound-delete group w-10 h-11 cursor-pointer';
    buttonDelete.innerHTML = `
        <svg class="fill-red-600 w-full h-full" viewbox="0 -1 16 16">
            <path d="M5 5v7q0 2 2 2h2q2 0 2-2v-8h1v8q0 3-2 3h-4q-2 0-2-3v-8h1v1M6 8q0-1 .5-1 .5 0 .5 1v2q0 1-.5 1-.5 0-.5-1v-2M9 8q0-1 .5-1 .5 0 .5 1v2q0 1-.5 1-.5 0-.5-1v-2"/>
                  
            <path class="trash-can-lid transition-transform duration-300 origin-[70%_50%] group-hover:-translate-y-0.5 group-hover:rotate-12" d="M4 4q-1 0-1-.5 0-.5 1-.5h2q0-2 1-2h2q1 0 1 2h2q1 0 1 .5 0 .5-1 .5h-8M7 3v-1h2v1" fill-rule="evenodd"/>
        </svg>`;

    li.append(pName, buttonShowDialog, divSwitch, divVolumeController, buttonDelete);

    return li;
}


/** @param {string} soundUUID  @param {File} sound */
const saveSound = async (soundUUID, sound) => {
    const soundURL = await fileToBase64(sound);

    const storageData = await getExtensionData();

    const newStoragedata = {
        ...storageData,
        [soundUUID]: {
            soundURL,
            name: sound.name,
            eventKey: null,
            active: true,
            volume: 100
        }
    };

    await browser.storage.local.set({
        'custom_sounds_config': newStoragedata
    });
}

/** @param {string} soundUUID  @param {string} eventAction  @param {boolean} eventState  @param {number} */
const updateSound = async (soundUUID, eventAction, eventState, soundVolume) => {
    const storageData = await getExtensionData();

    if (!storageData[soundUUID]) {
        console.error(`Sound with UUID ${soundUUID} not found in storage`);    return;
    }

    if (eventAction !== undefined) {
        storageData[soundUUID].eventKey = eventAction;
    }

    if (eventState !== undefined) {
        storageData[soundUUID].active = eventState;
    }

    if (soundVolume !== undefined) {
        storageData[soundUUID].volume = soundVolume;
    }

    await browser.storage.local.set({
        'custom_sounds_config': storageData
    });
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
const waitForKeyPress = async () => {
    return new Promise(resolve => {
        const keyHandler = (event) => {
            event.preventDefault(); 
            
            resolve(event.code);

            window.removeEventListener('keydown', keyHandler);
        };

        window.addEventListener('keydown', keyHandler);
    });
}


/** @param {string} soundUUID */
const handleKeyChange = async (soundUUID) => {
    setKeyButton.textContent = 'Press a key...';
    setKeyButton.disabled = true;

    const newEventKey = await waitForKeyPress();

    if (await isEventAlreadyUsed(newEventKey, soundUUID)) {
        console.warn(`The key ${newEventKey} is already used`);

        setKeyButton.textContent = 'Set a key';
        setKeyButton.disabled = false;

        return;
    }

    setKeyButton.textContent = getButtonText(newEventKey);
    setKeyButton.disabled = false;

    changeEventDialog.dataset.eventAction = newEventKey;
}

/** @param {string} event */
const handleSetBrowserEvent = async (event) => {
    setKeyButton.textContent = 'Set a key';

    const soundUUID = changeEventDialog.dataset.soundUUID;
    changeEventDialog.dataset.eventAction = event;

    if (event === 'none-event') {
        setKeyButton.disabled = false;  return;
    }

    if (await isEventAlreadyUsed(event, soundUUID)) {
        console.warn(`The event ${event} is already used`);

        dropdownEventListButtonText.textContent = 'Event list';
        setKeyButton.disabled = false;

        changeEventDialog.dataset.eventAction = null;

        return;
    }

    setKeyButton.disabled = true;
}

/** @param {string} soundUUID */
const handleShowDialog = async (soundUUID) => {
    const storageData = await getExtensionData();

    const eventAction = storageData[soundUUID].eventKey;

    dropdownEventListButtonText.textContent = 'Event list';
    setKeyButton.textContent = 'Set a key';
    setKeyButton.disabled = false;

    if (eventAction === 'new-tab' || eventAction === 'close-tab') {
        dropdownEventListButtonText.textContent = getButtonText(eventAction);

        setKeyButton.disabled = true;
    } else {
        setKeyButton.textContent = getButtonText(eventAction);
    }

    changeEventDialog.dataset.soundUUID = soundUUID;

    changeEventDialog.showModal();
}

/** @param {ToggleEvent} e */
const handleOpenDropdownMenu = (e) => {
    dropdownEventListButton.classList.toggle('rounded-b-none');

    if (e.newState === 'open') {
        const rect = dropdownEventListButton.getBoundingClientRect();
            
        eventListMenu.style.top = `${rect.bottom}px`;
        eventListMenu.style.left = `${rect.left}px`;
    }
}

/** @param {HTMLDialogElement | HTMLDivElement} element */
const handleCloseWithAnimation = (element) => {
    element.classList.add('fade-out-animation');

    element.addEventListener('animationend', () => {
        element.classList.remove('fade-out-animation');

        element.tagName === 'DIALOG' ? element.close() : element.hidePopover();
    }, {once: true});
}

/** @param {PointerEvent} mouseDownEvent @param {string} soundUUID @param {HTMLDivElement} knob */
const handleVolumeChange = async (mouseDownEvent, soundUUID, knob) => {
    const tooltip = knob.previousElementSibling;
    const controller = new AbortController();
    const { signal } = controller;

    let lastPercent = 0;

    const updateValue = (e) => {
        const rect = knob.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let angleDeg = (angleRad * 180) / Math.PI + 90;

        // Limitar el arco a 270 grados
        if (angleDeg > 180) angleDeg -= 360;
        angleDeg = Math.max(-135, Math.min(135, angleDeg));

        knob.style.transform = `rotate(${angleDeg}deg)`;

        lastPercent = Math.round(((angleDeg + 135) / 270) * 100);
        tooltip.innerText = `${lastPercent}%`;
    };

    updateValue(mouseDownEvent);

    window.addEventListener('mousemove', updateValue, { signal });

    window.addEventListener('mouseup', async () => {        
        controller.abort(); 

        await updateSound(soundUUID, undefined, undefined, lastPercent);
    }, { signal, once: true });
};


saveSoundButton.addEventListener('click', async () => {
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

soundList.addEventListener('click', async (e) => {
    const deleteButton = e.target.closest('.sound-delete');
    const showDialogButton = e.target.closest('.show-dialog');
    const changeStateButton = e.target.closest('.event-check');
    

    if (deleteButton) {
        const soundLiElement = deleteButton.closest('li');

        if (soundLiElement) {
            await deleteSound(soundLiElement);
        }
    }

    if (showDialogButton) {
        const soundLiElement = showDialogButton.closest('li');

        if (soundLiElement) {
            await handleShowDialog(soundLiElement.dataset.uuid);
        }
    }

    if (changeStateButton) {
        const soundLiElement = changeStateButton.closest('li');

        if (soundLiElement) {
            await updateSound(soundLiElement.dataset.uuid, undefined, changeStateButton.checked, undefined);
        }
    }
});

soundList.addEventListener('mousedown', async (e) => {
    const volumeControllerKnob = e.target.closest('.knob');

    if (volumeControllerKnob) {
        const soundLiElement = volumeControllerKnob.closest('li');

        if (soundLiElement) {
            await handleVolumeChange(e, soundLiElement.dataset.uuid, volumeControllerKnob);
        }
    }
});

eventListMenu.addEventListener('toggle', (e) => handleOpenDropdownMenu(e));

eventListMenu.addEventListener('click', async (e) => {
    const eventButton = e.target.closest('.event-option');

    if (eventButton) {
        const event = eventButton.dataset.browserEvent;

        dropdownEventListButtonText.textContent = eventButton.textContent;

        await handleSetBrowserEvent(event);

        handleCloseWithAnimation(eventListMenu);
    }
});

setKeyButton.addEventListener('click', async () => {
    const soundUUID = changeEventDialog.dataset.soundUUID;

    await handleKeyChange(soundUUID);
});

saveDialogChanges.addEventListener('click', async () => {
    const soundUUID = changeEventDialog.dataset.soundUUID;
    let eventAction = changeEventDialog.dataset.eventAction;

    if (eventAction === 'none-event' || eventAction === 'null') {
        eventAction = null;
    }

    await updateSound(soundUUID, eventAction, undefined, undefined);

    const buttonShowDialog = document.querySelector(`[data-uuid=${soundUUID}] .show-dialog`);
    buttonShowDialog.textContent = getButtonText(eventAction);

    handleCloseWithAnimation(changeEventDialog);
});

closeDialogSVG.addEventListener('click', () => handleCloseWithAnimation(changeEventDialog));

changeEventDialog.addEventListener('click', (e) => {
    if (e.target === changeEventDialog) {
        handleCloseWithAnimation(changeEventDialog);
    }
});


addEventListener('DOMContentLoaded', async () => {
    const storageData = await getExtensionData();

    Object.entries(storageData).forEach(([soundUUID, data]) => {
        const soundLiElement =  createLiElement(soundUUID, data.name, data.eventKey, data.active, data.volume);

        soundList.appendChild(soundLiElement);
    });
});

// TODO: create the popup for alerts and warnings