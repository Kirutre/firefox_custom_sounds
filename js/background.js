let userPreferences = {
    soundsEnabledGlobal: true,

    categoryStatus: {
        tabSounds: true,
        commonKeySounds: true,
        specialKeySounds: true
    },

    specificSoundsStatus: {},

    customSounds: {}
}

browser.storage.local.get('userPreferences').then((storedPrefs) => {
    if (storedPrefs.userPreferences) {
        userPreferences = { ...userPreferences, ...storedPrefs.userPreferences};
    }

    console.log('Preferencias del usuario cargadas: ', userPreferences);

    preloadAllSounds();
});

const tabSounds = {
    'newTab': 'new_tab.mp3',
    'closeTab': 'close_tab.mp3'
};

const commonKeySounds = [
    'key_sound_1.mp3',
    'key_sound_2.mp3',
    'key_sound_3.mp3',
    'key_sound_4.mp3'
];

const specialKeySounds = {
    'spacebar': 'spacebar_sound.mp3',
    'generalSpecial': 'special_key_sound.mp3',
    'enter': 'enter_sound.mp3',
    'backspace': 'backspace_sounds.mp3'
};

const preloadedSounds = {};

const preloadAudio = (soundName, soundPathOrDataUrl) => {
    if (!preloadedSounds[soundName]) {
        const url = soundPathOrDataUrl.startsWith('data:') ? soundPathOrDataUrl : browser.runtime.getURL(`sounds/${soundPathOrDataUrl}`);
        const audio = new Audio(url);
        audio.preload = 'auto';
        preloadedSounds[soundName] = audio;
    }
};

const preloadAllSounds = () => {
    preloadAudio('newTab', tabSounds.newTab);
    preloadAudio('closeTab', tabSounds.closeTab);

    commonKeySounds.forEach((soundName, index) => {
        preloadAudio(soundName, soundName);
    });

    for (const key in specialKeySounds) {
        preloadAudio(key, specialKeySounds[key]);
    }

    [
        tabSounds.newTab, tabSounds.closeTab,
        ...commonKeySounds,
        ...Object.values(specialKeySounds)
    ].forEach(soundName => {
        if (userPreferences.specificSoundsStatus[soundName] === undefined) {
            userPreferences.specificSoundsStatus[soundName] = true;
        }
    });

    for (const alias in userPreferences.customSounds) {
        preloadAudio(alias, userPreferences.customSounds[alias]);
    }
} 

const playSound = (soundAlias, category) => {
    if (!userPreferences.soundsEnabledGlobal) return;

    if (category && userPreferences.categoryStatus[category] !== true) return;

    let actualSoundName = soundAlias;

    if (soundAlias === 'newTab') actualSoundName = tabSounds.newTab;
    else if (soundAlias === 'closeTab') actualSoundName = tabSounds.closeTab;
    else if (specialKeySounds[soundAlias]) actualSoundName = specialKeySounds[soundAlias];

    if (userPreferences.specificSoundsStatus[actualSoundName] !== true) return;

    if (preloadedSounds[soundAlias]) {
        preloadedSounds[soundAlias].currentTime = 0;
        preloadedSounds[soundAlias].play().catch(e => {
            console.error(`Error al reproducir el sonido ${soundAlias}: `, e);
        });
    }
    
    else {
        console.warn(`Sonido "${soundAlias}" no encontrado en preloadedSounds.`);
    }
};


//listeners
browser.tabs.onCreated.addListener(() => {
    playSound('newTab', 'tabSounds');
});

browser.tabs.onRemoved.addListener(() => {
    playSound('closeTab', 'tabSounds');
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'keyPress') {
        const keyPress = message.key;

        let soundAliasToPlay;
        let categoryToPlay = 'keySounds';

        if (keyPress === ' ') {
            soundAliasToPlay = 'spacebar';
            categoryToPlay = 'specialKeySounds';
        }
        
        else if (keyPress === 'Enter') {
            soundAliasToPlay = 'enter';
            categoryToPlay = 'specialKeySounds';
        }
        
        else if (keyPress === 'Backspace') {
            soundAliasToPlay = 'backspace';
            categoryToPlay = 'specialKeySounds';
        }
        
        else if (keyPress.length > 1) { // Unmarked Special Keys
            soundAliasToPlay = 'generalSpecial';
            categoryToPlay = 'specialKeySounds';
        }
        
        else {
            const randomIndex = Math.floor(Math.random() * commonKeySounds.length);
            
            soundAliasToPlay = commonKeySounds[randomIndex];
            categoryToPlay = 'commonKeySounds';            
        }

        playSound(soundAliasToPlay, categoryToPlay);
    } 

    else if (message.type === 'updatePreference') {
        if (message.category) {
            userPreferences.categoryStatus[message.category] = message.enabled;
        }

        else if (message.specificSound) {
            userPreferences.categoryStatus[message.specificSound] = message.enabled;
        }

        else if (message.customSound) {
            userPreferences.customSounds[message.customSound.alias] = message.customSound.dataUrl;
            preloadAudio(message.customSound.alias, message.customSound.dataUrl); 
        }

        browser.storgae.local.set({ userPreferences: userPreferences });
        console.log('Preferencias actualizadas y guardadas: ', userPreferences);
    }
});
