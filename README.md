# Roll-Away

A 3D browser-based game built with Three.js where you control a rolling tire and navigate through a challenging course with various types of doors.

## How to Play

1. Open `index.html` in a modern web browser
2. Use arrow keys to control the tire:
   - Left/Right: Tilt the tire to change direction
   - Space: Jump
   - Backspace: Restart game
3. Navigate through the course to reach the goal
4. Avoid falling off the map and trap doors

## Game Features

- 3D graphics using Three.js
- Physics-based tire movement with realistic rolling
- Three lives system
- Different door types:
  - Purple Teleporter Doors: Transport to a random exit door
  - Indigo Exit Doors: Destination for teleporters (always at higher elevations)
  - Green Jumper Doors: Launch the tire in a specific direction
  - Brown Trap Doors: Take away one life if entered
- Score system
- Large map with various terrain features

## Code Structure

The game code is modularized for easier maintenance:

- `config.js`: Game constants and settings
- `utils.js`: Utility functions
- `tire.js`: Player tire object and controls
- `map.js`: Game map and terrain
- `doors.js`: All door types and their behavior
- `camera.js`: Camera movement and following
- `physics.js`: Physics calculations and collisions
- `ui.js`: User interface elements
- `game.js`: Main game loop and initialization

## Future Enhancements

- Multiple levels with increasing difficulty
- Power-ups and collectibles
- Sound effects and music
- Mobile touch controls
- Customizable tire appearance
