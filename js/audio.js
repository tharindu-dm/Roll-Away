/**
 * Audio Manager class - Handles all game audio
 */
class AudioManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.isMuted = false;
        this.hasInteracted = false;
        
        // Initialize audio
        this.init();
        
        // Add event listener for first interaction
        document.addEventListener('click', () => this.handleFirstInteraction());
        document.addEventListener('keydown', () => this.handleFirstInteraction());
    }
    
    /**
     * Initialize audio
     */
    init() {
        try {
            // Create audio elements
            this.sounds.gameOver = new Audio('gameOver.mp3');
            this.sounds.gameWon = new Audio('gameWon.mp3');
            this.backgroundMusic = new Audio('background.mp3');
            
            // Configure background music
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.5; // 50% volume
            
            console.log("Audio initialized successfully");
        } catch (error) {
            console.error("Error initializing audio:", error);
        }
    }
    
    /**
     * Handle first user interaction
     * This is needed because browsers require user interaction before playing audio
     */
    handleFirstInteraction() {
        if (!this.hasInteracted) {
            this.hasInteracted = true;
            console.log("User has interacted with the page, audio can now play");
            
            // Now we can play audio if the game is running
            if (!this.isMuted && window.game && window.game.isRunning) {
                this.startBackgroundMusic();
            }
        }
    }
    
    /**
     * Play a sound
     * @param {string} soundName - Name of sound to play
     */
    play(soundName) {
        if (this.isMuted || !this.hasInteracted) return;
        
        try {
            if (this.sounds[soundName]) {
                // Stop and reset the sound before playing again
                this.sounds[soundName].pause();
                this.sounds[soundName].currentTime = 0;
                
                // Play the sound
                this.sounds[soundName].play().catch(error => {
                    console.warn(`Error playing ${soundName}:`, error);
                });
            }
        } catch (error) {
            console.error(`Error playing ${soundName}:`, error);
        }
    }
    
    /**
     * Start background music
     */
    startBackgroundMusic() {
        if (this.isMuted || !this.hasInteracted) return;
        
        try {
            this.backgroundMusic.play().catch(error => {
                console.warn("Error playing background music:", error);
            });
        } catch (error) {
            console.error("Error starting background music:", error);
        }
    }
    
    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        try {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        } catch (error) {
            console.error("Error stopping background music:", error);
        }
    }
    
    /**
     * Pause background music
     */
    pauseBackgroundMusic() {
        try {
            this.backgroundMusic.pause();
        } catch (error) {
            console.error("Error pausing background music:", error);
        }
    }
    
    /**
     * Resume background music
     */
    resumeBackgroundMusic() {
        if (this.isMuted || !this.hasInteracted) return;
        
        try {
            this.backgroundMusic.play().catch(error => {
                console.warn("Error resuming background music:", error);
            });
        } catch (error) {
            console.error("Error resuming background music:", error);
        }
    }
    
    /**
     * Toggle mute state
     * @returns {boolean} New mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Mute all sounds
            this.pauseBackgroundMusic();
            
            // Mute all sound effects
            for (const sound in this.sounds) {
                this.sounds[sound].pause();
            }
        } else {
            // Resume background music if game is running
            if (this.hasInteracted && window.game && !window.game.gameOver && !window.game.levelComplete && !window.game.isPaused) {
                this.resumeBackgroundMusic();
            }
        }
        
        return this.isMuted;
    }
    
    /**
     * Set mute state
     * @param {boolean} muted - Whether audio should be muted
     */
    setMute(muted) {
        if (this.isMuted !== muted) {
            this.toggleMute();
        }
    }
}
