# 🛡️ Sobes Focus Blocker

![Sobes Focus Blocker](./assets/showcase.gif)

**A Chrome extension that blocks focus and tab visibility tracking.**

No popups. No settings. Just works.

## 🧠 What does it do?

The extension disables JavaScript APIs that websites use to track:

* Tab switching (`visibilitychange`)
* Focus loss (`blur`, `focus`)
* Window events (`window.onfocus`, `window.onblur`)
* Real-time user activity tracking

Works on *all websites*

### 🚀 Additional features:

* **Whitelist** — add websites to the whitelist, where the extension will work
* **Copy text** — allows copying text even on websites where it is blocked

## 💼 Who needs it?

* Participating in technical interviews on platforms like **Yandex Code**
* Don't want websites to track your tab

## 🔧 Installation

1. [Download the archive](https://github.com/sobes-tech/focus-blocker/archive/refs/heads/main.zip)
2. Extract the contents
3. Go to `chrome://extensions/`
4. Enable developer mode (top right)
5. Click **"Load unpacked extension"** and select the folder

## 📖 How to use

### Copy text on pages

The extension automatically unblocks the ability to copy text on all websites. To copy elements:

1. Hold `Ctrl` (or `Cmd` on Mac) and hover over the desired element — it will be highlighted with a blue frame
2. Press `Ctrl+Alt` (or `Cmd+Alt` on Mac) to copy the entire text of the highlighted element
3. The text will be copied to the clipboard

### Whitelist

If you want to enable the extension on specific websites, add them to the whitelist:

1. Click on the extension icon in the browser toolbar
2. In the input field, enter the website domain on a new line (e.g., `example.com`)

## 🧪 Compatibility   

- **Browsers**: Chrome 111+ (Chromium-based)
- **Manifest**: V3
- **Websites**: All websites

## 🧑‍💻 About us

[Sobes.tech](https://sobes.tech) — a tool for preparing for interviews using neural networks.
The app remains invisible during screen sharing, listens to the interviewer's voice, and helps answer in real-time.
