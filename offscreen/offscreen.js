const userBrowser = typeof browser !== 'undefined' ? browser : chrome;

userBrowser.runtime.onMessage.addListener(message => {
    if (message.target === 'offscreen_audio') {
        const audio = new Audio(message.url);
        audio.volume = message.volume;

        audio.play().catch(error => console.error(`Chrome playback error: ${error}`));
    }
});