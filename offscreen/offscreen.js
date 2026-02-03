const browser = window.browser || window.chrome;

browser.runtime.onMessage.addListener(message => {
    if (message.target === 'offscreen_audio') {
        const audio = new Audio(message.url);

        audio.play()
        .then(() => {
            console.log(`Sound played: ${message.url}`);
        })
        .catch(error => {
            console.error(`Error playing sound: ${message.url}, error: ${error}`);
        });
    }
});