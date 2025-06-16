document.addEventListener('DOMContentLoaded', () => {
    const toggleGlobalSoundsBtn = document.getElementById('toggleGlobalSounds');
    const toggleTabSoundsBtn = document.getElementById('toggleTabSounds');
    const toggleCommonKeysBtn = document.getElementById('toggleCommonKeys');
    const toggleSpecialKeysBtn = document.getElementById('toggleSpecialKeys');

    const specificSoundDropdown = document.getElementById('specificSoundDropdown');
    const toggleSpecificSoundBtn = document.getElementById('toggleSpecificSound');

    const fileUpload = document.getElementById('fileUpload');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const assignCustomSoundDropdown = document.getElementById('assignCustomSoundDropdown');
    const applyCustomSoundBtn = document.getElementById('applyCustomSound');

    let currentFile = null;

    const allSoundsMapping = [
        { alias: 'newTab', name: 'Nueva Pestaña', fileName: 'new_tab.mp3', category: 'tabSounds' },
        { alias: 'closeTab', name: 'Cerrar Pestaña', fileName: 'close_tab.mp3', category: 'tabSounds' },

        { alias: 'key_sound_1.mp3', name: 'Teclado: Sonido 1', fileName: 'key_sound_1.mp3', category: 'commonKeySounds' },
        { alias: 'key_sound_2.mp3', name: 'Teclado: Sonido 2', fileName: 'key_sound_2.mp3', category: 'commonKeySounds' },
        { alias: 'key_sound_3.mp3', name: 'Teclado: Sonido 3', fileName: 'key_sound_3.mp3', category: 'commonKeySounds' },
        { alias: 'key_sound_4.mp3', name: 'Teclado: Sonido 4', fileName: 'key_sound_4.mp3', category: 'commonKeySounds' },

        { alias: 'spacebar', name: 'Teclado: Barra Espaciadora', fileName: 'spacebar_sound.mp3', category: 'specialKeySounds' },
        { alias: 'enter', name: 'Teclado: Enter', fileName: 'enter_sound.mp3', category: 'specialKeySounds' },
        { alias: 'backspace', name: 'Teclado: Backspace', fileName: 'backspace_sound.mp3', category: 'specialKeySounds' },
        { alias: 'generalSpecial', name: 'Teclado: Tecla Especial (otras)', fileName: 'special_key_sound.mp3', category: 'specialKeySounds' },
    ];

    const initializeUI = async () => {
        const result = await browser.storage.local.get('userPreferences');
        const prefs = result.userPreferences || {};

        window.userPreferences = {
            soundsEnabledGlobal: prefs.soundsEnabledGlobal !== undefined ? prefs.soundsEnabledGlobal : true,
            categoryStatus: {
                tabSounds: prefs.categoryStatus?.tabSounds !== undefined ? prefs.categoryStatus.tabSounds : true,
                commonKeySounds: prefs.categoryStatus?.commonKeySounds !== undefined ? prefs.categoryStatus.commonKeySounds : true,
                specialKeySounds: prefs.categoryStatus?.specialKeySounds !== undefined ? prefs.categoryStatus.specialKeySounds : true,
            },
            specificSoundStatus: prefs.specificSoundStatus || {},
            customSounds: prefs.customSounds || {}
        };

        updateButtonState(toggleGlobalSoundsBtn, window.userPreferences.soundsEnabledGlobal);
        updateButtonState(toggleTabSoundsBtn, window.userPreferences.categoryStatus.tabSounds);
        updateButtonState(toggleCommonKeysBtn, window.userPreferences.categoryStatus.commonKeySounds);
        updateButtonState(toggleSpecialKeysBtn, window.userPreferences.categoryStatus.specialKeySounds);

        populateSpecificSoundDropdown();
        populateAssignCustomSoundDropdown();
    }

    const updateButtonState = (buttonElement, isActive) => {
        if (isActive) {
            buttonElement.classList.remove('inactive');
            buttonElement.classList.add('active');
            buttonElement.textContent = buttonElement.dataset.category ?
                                        buttonElement.dataset.category === 'tabSounds' ? 'Tab (Activo)' :
                                        buttonElement.dataset.category === 'commonKeySounds' ? 'Teclas Comunes (Activo)' :
                                        buttonElement.dataset.category === 'specialKeySounds' ? 'Teclas Especiales (Activo)' : 'Activar Sonidos'
                                        : 'Activar Sonidos';

        }
        
        else {
            buttonElement.classList.remove('active');
            buttonElement.classList.add('inactive');
            buttonElement.textContent = buttonElement.dataset.category ?
                                        buttonElement.dataset.category === 'tabSounds' ? 'Tab (Inactivo)' :
                                        buttonElement.dataset.category === 'commonKeySounds' ? 'Teclas Comunes (Inactivo)' :
                                        buttonElement.dataset.category === 'specialKeySounds' ? 'Teclas Especiales (Inactivo)' : 'Desactivar Sonidos'
                                        : 'Desactivar Sonidos';
        }
    }

    const populateSpecificSoundDropdown = () => {
        specificSoundDropdown.innerHTML = '<option value="" disabled selected hidden>Seleccionar Sonido</option>';

        const fragment = document.createDocumentFragment();

        const categories = {};

        allSoundsMapping.forEach(sound => {
            if (!categories[sound.category]) {
                categories[sound.category] = [];
            }

            categories[sound.category].push(sound);
        });

        for (const categoryName in categories) {
            const optgroup = document.createElement('optgroup');

            optgroup.label = categoryName;

            categories[categoryName].forEach(sound => {
                const option = document.createElement('option');
                option.value = sound.fileName;
                option.textContent = `${sound.name} (${window.userPreferences.specificSoundStatus[sound.fileName] === false ? 'OFF' : 'ON'})`;
                optgroup.appendChild(option);
            });

            fragment.appendChild(optgroup);
        }

        specificSoundDropdown.appendChild(fragment);
    }

    const populateAssignCustomSoundDropdown = () => {
        assignCustomSoundDropdown.innerHTML = '<option value="" disabled selected hidden>Asignar a...</option>';

        const fragment = document.createDocumentFragment();

        const categories = {};

        allSoundsMapping.forEach(sound => {
            if (!categories[sound.category]) {
                categories[sound.category] = [];
            }

            categories[sound.category].push(sound);
        });

        for (const categoryName in categories) {
            const optgroup = document.createElement('optgroup');

            optgroup.label = categoryName;

            categories[categoryName].forEach(sound => {
                const option = document.createElement('option');
                option.value = sound.alias;
                option.textContent = sound.name;
                optgroup.appendChild(option);
            });

            fragment.appendChild(optgroup);
        }

        assignCustomSoundDropdown.appendChild(fragment);
    }

    toggleGlobalSoundsBtn.addEventListener('click', async () => {
        window.userPreferences.soundsEnabledGlobal = !window.userPreferences.soundsEnabledGlobal;

        updateButtonState(toggleGlobalSoundsBtn, window.userPreferences.soundsEnabledGlobal);

        await browser.runtime.sendMessage({
            type: "updatePreference",
            globalEnabled: window.userPreferences.soundsEnabledGlobal
        });
    });


    document.querySelectorAll('.category-button[data-category]').forEach(button => {
        button.addEventListener('click', async () => {
            const category = button.dataset.category;

            window.userPreferences.categoryStatus[category] = !window.userPreferences.categoryStatus[category];

            updateButtonState(button, window.userPreferences.categoryStatus[category]);

            await browser.runtime.sendMessage({
                type: "updatePreference",
                category: category,
                enabled: window.userPreferences.categoryStatus[category]
            });
        });
    });

    toggleSpecificSoundBtn.addEventListener('click', async () => {
        const selectedSoundFileName = specificSoundDropdown.value;

        if (selectedSoundFileName) {
            const currentState = window.userPreferences.specificSoundStatus[selectedSoundFileName];

            window.userPreferences.specificSoundStatus[selectedSoundFileName] = !currentState;

            populateSpecificSoundDropdown();

            await browser.runtime.sendMessage({
                type: "updatePreference",
                specificSound: selectedSoundFileName,
                enabled: window.userPreferences.specificSoundStatus[selectedSoundFileName]
            });
        }
        
        else {
            alert("Por favor, selecciona un sonido para activar/desactivar.");
        }
    });


    fileUpload.addEventListener('change', (event) => {
        currentFile = event.target.files[0];

        if (currentFile) {
            fileNameDisplay.textContent = currentFile.name;
        }
        
        else {
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
        }
    });

    fileNameDisplay.addEventListener('click', () => {
        fileUpload.click();
    });

    applyCustomSoundBtn.addEventListener('click', async () => {
        const targetAlias = assignCustomSoundDropdown.value;

        if (!currentFile) {
            alert("Por favor, selecciona un archivo de audio primero.");

            return;
        }

        if (!targetAlias) {
            alert("Por favor, selecciona a qué sonido deseas asignar el archivo.");

            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            const dataUrl = e.target.result;

            window.userPreferences.customSounds[targetAlias] = dataUrl;

            await browser.runtime.sendMessage({
                type: "updatePreference",
                customSound: { alias: targetAlias, dataUrl: dataUrl }
            });

            alert(`Sonido personalizado asignado a "${allSoundsMapping.find(s => s.alias === targetAlias)?.name || targetAlias}". Recarga el popup si no escuchas el cambio.`);

            fileUpload.value = '';
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            currentFile = null;
        };

        reader.onerror = (e) => {
            console.error("Error al leer el archivo:", e);
            
            alert("Error al leer el archivo de audio.");
        };

        reader.readAsDataURL(currentFile);
    });

    initializeUI();
});