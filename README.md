# Roll-Away Maze

![Roll-Away Maze](https://img.shields.io/badge/Roll--Away-Maze-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Three.js](https://img.shields.io/badge/Three.js-r160-green)

A challenging 3D browser-based maze game built with Three.js where you navigate a rolling tire through a randomly generated maze with special interactive elements.

## 🎮 Game Overview

Roll-Away Maze is an immersive 3D maze game where you control a tire through a procedurally generated maze. The goal is to find your way to the golden platform at the end of the maze in the shortest time possible. Along the way, you'll encounter teleporters, jumpers, and hazards that will either help or hinder your progress.

## ✨ Features

- **Procedurally Generated Mazes**: Every time you play, the maze is completely different
- **Dynamic 3D Environment**: Fully rendered 3D maze with realistic physics
- **Special Interactive Elements**:
  - **Teleporters**: Purple platforms that transport you to random elevated locations
  - **Jumpers**: Green platforms that launch you in a specific direction
  - **Traps**: Brown platforms that cost you a life when triggered
  - **Spike Traps**: Stationary hazards that take away one life
  - **Lava Areas**: Hazards that cost you a life when touched
- **Life System**: Start with 3 lives, lose a life when falling off the maze or hitting hazards
- **Extra Life Bonus**: Find the white sphere at the midpoint of the maze for an extra life
- **Time-based Scoring**: Complete the maze as quickly as possible
- **Celebration Effects**: Confetti animation when completing the maze
- **Audio System**: Background music and sound effects for game events
- **Responsive Controls**: Precise movement controls for navigating tight corridors

## 🎯 How to Play

1. **Start the Game**:
   - Click the "Click to Start" button on the start screen

2. **Controls**:
   - **Left/Right Arrows**: Roll the tire sideways
   - **Up/Down Arrows**: Roll the tire forward/backward
   - **P**: Pause game
   - **Backspace**: Restart game/Generate new maze
   - **Sound Button**: Toggle sound on/off

3. **Objective**:
   - Navigate through the maze to find the golden platform at the end
   - Complete the maze in the shortest time possible
   - Collect the white sphere at the midpoint for an extra life
   - Avoid falling off the maze and hazards that cost lives

## 🔧 Technical Implementation

The game is built using:
- **Three.js** for 3D rendering and physics
- **Procedural Generation** for creating unique mazes
- **Web Audio API** for sound effects and music
- **Modular JavaScript** for maintainable code structure
- **CSS Animations** for UI effects

## 📁 Code Structure

The game code is organized into modules:

- `config.js`: Game constants and settings
- `utils.js`: Utility functions
- `audio.js`: Audio management for music and sound effects
- `tire.js`: Player tire object with physics and movement
- `map.js`: Maze generation and rendering
- `doors.js`: Special elements (teleporters, jumpers, traps)
- `camera.js`: Camera movement and effects
- `physics.js`: Physics calculations and collisions
- `ui.js`: User interface elements and timer
- `game.js`: Main game loop and coordination

## 🚀 Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Roll-Away.git
   ```

2. Open `index.html` in a modern web browser

3. Click "Start" and enjoy the game!

## 🎵 Audio Credits

The game features three audio tracks:
- `background.mp3`: Background music during gameplay
- `gameWon.mp3`: Victory sound when completing a maze
- `gameOver.mp3`: Sound played when losing all lives

## 🔮 Future Enhancements

- Multiple difficulty levels
- Mobile touch controls
- Additional maze elements and power-ups
- Custom tire skins
- Online leaderboards
- Level editor


## 👨‍💻 Author

Created by TharinduDM - tharindudeepaloka@gmail.com

---

Enjoy the maze! 🎮
