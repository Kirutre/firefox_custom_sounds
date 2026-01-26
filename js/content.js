window.addEventListener('keydown', (e) => {
    browser.runtime.sendMessage({ action: 'play_sound', eventKey: e.code });
}, true);