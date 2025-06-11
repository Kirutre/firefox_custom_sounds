document.addEventListener("keydown", (event) => {
  browser.runtime.sendMessage({ type: "keyPress", key: event.key});
});
