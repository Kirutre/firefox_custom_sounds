const tabSounds = {
    "newTab": "new_tab.mp3",
    "closeTab": "close_tab.mp3"
};

const commonKeySounds = [
    "key_sound_1.mp3",
    //"key_sound_2.mp3",
    //"key_sound_3.mp3",
    "key_sound_4.mp3"
];

const specialKeySounds = {
    "spacebar": "spacebar_sound.mp3",
    "common": "special_key_sound.mp3"
};


const preloadedSounds = {};

//preloads
const preloadAudio = (soundFileName) => {
    if (!preloadedSounds[soundFileName]) {
        const audio = new Audio(browser.runtime.getURL(`sounds/${soundFileName}`));
        audio.preload = 'auto';
        preloadedSounds[soundFileName] = audio;
    }
};

preloadAudio(tabSounds.newTab);
preloadAudio(tabSounds.closeTab);

commonKeySounds.forEach(soundFileName => {
    preloadAudio(soundFileName);
});

for (const key in specialKeySounds) {
    preloadAudio(specialKeySounds[key]);
}


const playSound = (soundFileName) => {
    if (preloadedSounds[soundFileName]) {
        preloadedSounds[soundFileName].currentTime = 0;
        preloadedSounds[soundFileName].play().catch(e => {
            console.error("Error al reproducir el sonido: ", e);
        });
    }
};


//listeners
browser.tabs.onCreated.addListener(() => {
    playSound(tabSounds.newTab);
});

browser.tabs.onRemoved.addListener(() => {
    playSound(tabSounds.closeTab);
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "keyPress") {
        const keyPress = message.key;

        if (keyPress === ' ') {
            playSound(specialKeySounds.spacebar)
        }

        else if (keyPress.length > 1) {
            playSound(specialKeySounds.common)
        }

        else {
            const randomIndex = Math.floor(Math.random() * commonKeySounds.length);
            playSound(commonKeySounds[randomIndex]);
        }
    }
});
