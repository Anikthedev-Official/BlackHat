# ⚡ FlashEmu Pro

**The ultimate, high-performance Flash emulator for Android.** 

FlashEmu Pro isn't just a player—it's a complete input environment. It is designed to make complex Flash games (like *Stick War*) fully playable on mobile devices by bridging the gap between touchscreens and keyboard/mouse controls.

![Version](https://img.shields.io/badge/Version-Pro_0.0.2-orange)
![Platform](https://img.shields.io/badge/Platform-Android_Cordova-green)
![Engine](https://img.shields.io/badge/Engine-Ruffle-orange)

---

## 🌟 Pro Features

### 🕹️ Advanced Hybrid Input System
Stop fighting with basic touch controls. FlashEmu Pro offers three distinct interaction modes:
*   **Joystick Mode:** Classical virtual stick for movement and cursor control.
*   **Direct Touch:** The screen becomes your trackpad. Tap and slide to move the cursor instantly.
*   **Super Mode (Hybrid):** The power-user setup. The **Joystick** sends Keyboard events (WASD/Arrows) while the **Touch Screen** controls the mouse. Perfect for strategy and action games.

### 🛠️ Custom Layout Engine (Visual Editor)
Don't settle for a fixed UI. Create your own controller:
*   **Visual Editor:** A dedicated layout page to drag and drop buttons and joysticks.
*   **Precision Mapping:** Set exact X/Y percentages for every control.
*   **Universal Actions:** Map any button to a Mouse Click (L/M/R), any Keyboard key (A-Z, 0-9), or complex combos.
*   **JSON Ecosystem:** Export your custom layouts to JSON files to share your "pro setups" with other players. (will soon be added)

### 🚀 Performance & Optimization
**NOT** Built specifically to run on low-end hardware (tested on 3GB RAM / Android 8.1):
*   **Dual-Engine Architecture:** Switch between **Legacy (v2021)** for old-school compatibility and **Modern (v2026)** for the latest Ruffle features.
*   **Turbo Mode (Potato Mode):** A one-tap boost that tries disables heavy realism effects to multiply your FPS on weak GPUs.
*   **Realism Mode:** High-fidelity real-time mouse tracking for games that require precise "hover" events.
*    **WARNING:** It is strongly recommended that users refrain from executing this software on low-end devices, particularly for resource-demanding games, as the Flash-to-WebAssembly conversion process may cause compatibility and performance issues.



### 📚 Game Library & Management
*   **JSON Database:** Organize your games by category (Strategy, Action, etc.).
*   **Multi-Source Loading:** Load `.swf` files from your phone's internal storage or directly via Web URLs.
*   **Smart Boot:** A custom boot-loader with a progress bar ensures the engine is fully initialized before the game starts.

---

## 🛠️ Installation & Build Guide

### Prerequisites
*   [Node.js](https://nodejs.org/)
*   [Cordova CLI](https://cordova.apache.org/) (`npm install -g cordova`)
*   Android SDK & Build Tools (via Android Studio)

### Building the APK
1. **Clone the repo:**
   ```bash
   git clone https://github.com/Anikthedev-Official/FlashEmu.git
   cd FlashEmu

2.  Add Android platform:
    cordova platform add android
3.  Install the WebView plugin (Crucial for WASM):
    cordova plugin add cordova-plugin-ionic-webview
4.  Build the APK:
    cordova build android

📂 Project Architecture
```
├── www/
│   ├── index.html          # Main Application Shell
│   ├── config.html         # Visual Layout Editor
│   ├── config.js           # Layout Saving/Loading Logic
│   ├── app.js              # The "Brain" (Dispatcher & Engine Logic)
│   ├── style.css           # Glassmorphism & Theme Styles
│   ├── games.json          # Game Library Database
│   └── engines/
│       ├── v2021/          # Legacy Ruffle Engine (Stable for old games)
│       └── v2026/          # Modern Ruffle Engine (Latest features)
└── config.xml              # Cordova App Config
```



---

🤝 Credits

Built upon the incredible work of the Ruffle team. This project extends Ruffle's
capabilities to provide a native-feeling gaming experience on Android.

Developed with ⚡ and a lot of patience by Anikthedev-Official.


