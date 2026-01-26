// Notifies the background when a key is pressed
window.addEventListener('keydown', (e) => {
    browser.runtime.sendMessage({ action: 'play_sound', eventKey: e.code });
}, true); //* I use capture phase (true) to avoid errors with navbars like the one on yt