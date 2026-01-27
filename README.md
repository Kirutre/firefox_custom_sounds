# 🎵 Firefox Custom Sounds

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firefox](https://img.shields.io/badge/Firefox-Add--on-orange.svg)](https://addons.mozilla.org/firefox/)

### Available languages
[![Language: English](https://img.shields.io/badge/Language-English-blue.svg)](README.md) [![Idioma: Español](https://img.shields.io/badge/Idioma-Español-red.svg)](README.es.md)

**Firefox Custom Sounds** is an extension designed to personalize your web browsing experience by adding sound effects to different actions within the Firefox browser.

---

## 🖼️ Images
### Settings Page
![Pagina de opciones](/example_images/options_page.png "Settings page")

### Event Customization Modal
![Modal](/example_images/modal.png "Event modal")

---

## ✨ Features
- 🔊 **Custom Sounds:** currently, you can assign sounds to:
    * ➕ Open/Close tabs.
    * ⌨️ Keystrokes.

- 🛠️ **Simple Configuration:** intuitive interface to manage your audio files.

- 🚀 **Lightweight:** optimized to not affect browser performance.

## 💻 Technologies Used
* JavaScript (WebExtensionAPI): for background logic and browser events.

* HTML: for the options page.

* CSS (Tailwind CSS): for the UI design.

* Firefox Browser API: for tab management and event handling.

## ⬇️ Installation

### For Users
*Coming soon to Firefox Add-ons (AMO).* For now, you can install it manually by downloading the Release or following the development steps.

### Developer Guide (Manual Installation)
If you want to modify the extension or contribute to the code, follow these steps to set up your local environment.

1. **Clone this repository**
    ```bash
    git clone https://github.com/Kirutre/firefox_custom_sounds.git

    cd firefox_custom_sounds
    ```

2. **Styles Management (Tailwind CSS)**

    This extension uses Tailwind CSS for the interface. The output.css file is already included in the repository so the extension works immediately, but if you make design changes, you will need to recompile it.

    #### Recompile `output.css`
    1. Download the CLI executable for your operating system from [Tailwind CSS Releases](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.1.18).

    2. Place the executable in the project root and rename it to `tailwindcss-cli`.

    3. Run the following command to compile and watch changes in real-time.

    ```bash
    ./tailwindcss-cli -i ./options/input.css -o ./options/output.css --watch
    ```

    > [!TIP]
    > If you have Node.js installed, you can avoid downloading the binary manually by using:

    ```bash
    npx @tailwindcss/cli -i ./options/input.css -o ./options/output.css --watch
    ```

3. **Load in Firefox for testing**
    1. Open Firefox and type `about:debugging` in the address bar.

    2. Click on "This Firefox".

    3. Click on "Load Temporary Add-on...".

    4. Select the `manifest.json` file inside the project folder.

## 🤝 Contributing
Contributions are what make software better, and I’m excited to see what you have to offer!

1. **Fork** the proyect.

2. Create a **Branch** for your development (`git checkout -b feature/destroy-this-extension`).

3. **Commit** your changes (`git commit -m 'change 1px bug in setKeyButton radius'`).

4. **Push** to the branch (`git push origin feature/destroy-this-extension`).

5. Open a **Pull Request**.

> [!NOTE]
> Jokes aside, please be as descriptive as possible with the names you use.

## 📝 License
Distributed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## 📬 Contact
Kirutre - [GitHub](https://github.com/kirutre)

Kirutre - contact.kirutre+firefox@gmail.com

Link del proyecto: https://github.com/Kirutre/firefox_custom_sounds