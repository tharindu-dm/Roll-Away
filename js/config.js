/**
 * Game Configuration
 * Contains all game constants and settings
 */
const CONFIG = {
    // Player settings
    TIRE: {
        RADIUS: 1,
        SEGMENTS: 32,
        COLOR: 0x000000,
        TREAD_COLOR: 0x222222,
        TILT_SPEED: 0.03,
        ROLL_SPEED: 0.05, // Reduced for better control
        JUMP_FORCE: 0.3,
        MAX_SPEED: 0.3 // Reduced max speed
    },
    
    // Physics settings
    PHYSICS: {
        GRAVITY: 0.003, // Very reduced gravity
        FRICTION: 0.98,
        RESTITUTION: 0.5,
        TILT_DECAY: 0.95
    },
    
    // Map settings
    MAP: {
        WIDTH: 100,
        LENGTH: 200,
        HEIGHT: 20,
        BASE_COLOR: 0x555555,
        EDGE_HEIGHT: 2
    },
    
    // Door settings
    DOORS: {
        TELEPORTER: {
            COLOR: 0x8A2BE2, // Purple
            WIDTH: 3,
            HEIGHT: 0.1,
            DEPTH: 3
        },
        EXIT: {
            COLOR: 0x4B0082, // Indigo
            WIDTH: 3,
            HEIGHT: 0.1,
            DEPTH: 3
        },
        JUMPER: {
            COLOR: 0x00FF00, // Green
            WIDTH: 3,
            HEIGHT: 0.1,
            DEPTH: 3,
            FORCE: 1.5
        },
        TRAP: {
            COLOR: 0x8B4513, // Brown
            WIDTH: 3,
            HEIGHT: 0.1,
            DEPTH: 3
        }
    },
    
    // Game settings
    GAME: {
        INITIAL_LIVES: 3,
        TRAP_SPAWN_INTERVAL: 5000, // ms
        TRAP_DURATION: 3000, // ms
        SCORE_INCREMENT: 10,
        GOAL_COLOR: 0xFFD700 // Gold
    },
    
    // Camera settings
    CAMERA: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000,
        FOLLOW_DISTANCE: 10,
        HEIGHT: 8,
        LOOK_AHEAD: 5,
        SMOOTHING: 0.1
    }
};
