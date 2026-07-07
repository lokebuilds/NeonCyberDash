# 🚀 Neon Cyber Dash

A sleek, fast-paced arcade dodge game built with React Native and Expo. Pilot your neon spaceship, dodge falling hazardous energy blocks, rack up your score, and beat your personal high score!

Built entirely with React Native View components and shapes no image assets required.

---

## 🎮 Gameplay

* Move your neon spaceship left and right to avoid falling energy obstacles.
* Every hazardous block you safely dodge increases your score.
* One collision ends the game instantly.
* Your highest score is saved locally on your device and persists across sessions.

---

## ✨ Features

* Pure shape-based graphics: Spaceship and obstacles drawn entirely using React Native Views, borders, and vibrant styles without needing external image files.
* Left / right movement controls: Smooth on-screen directional buttons equipped with screen-boundary detection.
* Falling hazards: Random horizontal obstacle generation driven by a continuous, real-time physics engine loop.
* Collision engine: Instant rectangle-to-rectangle (AABB) hitbox detection between the spaceship and incoming blocks.
* Game Over screen: A full-screen dark overlay displaying your final score, high score, and a quick-restart option.
* Restart functionality: A unified state reset handler that clears scores and realigns elements for a fresh game instantly.
* Persistent high score: Stored locally on-device using AsyncStorage.
* Sleek Aesthetic: Designed with a deep midnight blue backdrop (#0B0F19), neon cyan accents (#00FFF7), and pulsing neon pink elements (#FF2E9A).

---

## 🛠️ Tech Stack

* Framework: React Native & Expo
* Persistence: AsyncStorage (local high-score storage)
* Styling: React Native StyleSheet (Absolute positioning layout)

---

## 📋 Prerequisites

Before running the project, make sure you have:
* Node.js (LTS version recommended)
* npm (comes packaged with Node.js)
* Expo Go application installed on your Android or iOS device
* A code editor such as VS Code or Cursor

---

## 🚀 Getting Started

### 1. Clone the Repository
git clone https://github.com/lokebuilds/NeonCyberDash.git
cd NeonCyberDash

### 2. Install Dependencies
npm install

### 3. Start the Development Server
npx expo start

### 4. Run the App
Open the Expo Go app on your phone, scan the QR code displayed in your terminal, and the game will boot right up!

*(Note: You can also press 'a' in the terminal to open on an Android emulator or 'i' for an iOS simulator.)*

---

## 📦 Workshop Submission Reference
This project was built incrementally following a structured AI development workflow. It has been finalized, tested, and validated under Path B (GitHub + Screen Recording) verification guidelines. 

* All game mechanics operate cleanly out of a single, highly-optimized source engine.
* State initialization cleanly resets all gameplay variables back to standard defaults upon tapping "PLAY AGAIN".

---

## 📁 Project Structure

```text
NeonCyberDash/
├── app/               # Main application routing and core logic source files
├── assets/            # App icon and splash screen assets configuration
├── components/        # Reusable global layout user interface components
├── constants/         # Static style colors, measurements, and configurations
├── hooks/             # Custom state engines and interaction handles
├── scripts/           # Automation scripts for builds and deployment tracking
├── app.json           # Global Expo configuration settings
├── package.json       # Node module dependencies and start scripts
└── README.md          # Project documentation guide
```

---

## 🎯 How to Play

1. Launch the app on your phone and tap START GAME.
2. Tap and hold the ◀ MOVE LEFT and MOVE RIGHT ▶ on-screen buttons to steer your ship.
3. Dodge the falling neon pink obstacles cascading down from above.
4. Survive as long as you can to break your personal best!
5. Tap PLAY AGAIN after a Game Over to clear the screen and launch a new round.

---

## 🗺️ Roadmap / Future Improvements

* Increasing Difficulty: Automatically ramp up the obstacle fall speed as the player's score increases.
* Multiple Hazards: Generate multiple cascading neon shapes on screen concurrently.
* Audio Layering: Integrate background electronic synthwave soundtracks and impact sound effects.
* Power-Ups: Add temporary protective neon shields or slow-motion pick-ups.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

Lokesh sai
*Built as a beginner-friendly React Native + Expo workspace.*
GitHub: @lokebuilds
