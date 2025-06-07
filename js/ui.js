/**
 * UI class - Handles all UI elements
 */
class UI {
    constructor() {
        this.lives = CONFIG.GAME.INITIAL_LIVES;
        this.notifications = [];
        
        // Initialize UI elements
        this.livesElement = document.getElementById('lives-value');
        
        // Create timer element
        this.createTimerElement();
        
        // Create notification container
        this.createNotificationContainer();
        
        // Update initial values
        this.updateLives(this.lives);
    }
    
    /**
     * Create timer element
     */
    createTimerElement() {
        // Create timer container
        const timerContainer = document.createElement('div');
        timerContainer.id = 'timer';
        timerContainer.style.marginTop = '10px';
        
        // Create timer value element
        const timerValue = document.createElement('span');
        timerValue.id = 'timer-value';
        timerValue.textContent = '00:00.00';
        
        // Add timer label and value to container
        timerContainer.innerHTML = 'Time: ';
        timerContainer.appendChild(timerValue);
        
        // Add timer to HUD
        document.getElementById('hud').appendChild(timerContainer);
        
        // Store reference to timer element
        this.timerElement = timerValue;
    }
    
    /**
     * Create notification container
     */
    createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'score-notification';
        document.getElementById('game-container').appendChild(container);
        this.notificationContainer = container;
    }
    
    /**
     * Update lives
     * @param {number} lives - New lives value
     */
    updateLives(lives) {
        this.lives = lives;
        this.livesElement.textContent = lives;
    }
    
    /**
     * Decrease lives by 1
     * @returns {number} Remaining lives
     */
    decreaseLives() {
        this.lives--;
        this.updateLives(this.lives);
        return this.lives;
    }
    
    /**
     * Increase lives by 1
     * @returns {number} New lives count
     */
    increaseLife() {
        this.lives++;
        this.updateLives(this.lives);
        return this.lives;
    }
    
    /**
     * Update timer display
     * @param {number} timeMs - Time in milliseconds
     */
    updateTimer(timeMs) {
        const totalSeconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((timeMs % 1000) / 10); // Only show 2 digits of ms
        
        this.timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Show notification
     * @param {string} text - Notification text
     */
    showNotification(text) {
        const notification = document.createElement('div');
        notification.textContent = text;
        notification.style.animation = 'fadeInOut 2s forwards';
        
        this.notificationContainer.appendChild(notification);
        
        // Remove notification after animation completes
        setTimeout(() => {
            if (notification.parentNode === this.notificationContainer) {
                this.notificationContainer.removeChild(notification);
            }
        }, 2000);
    }
    
    /**
     * Show game over screen
     */
    showGameOver() {
        const gameOverElement = document.getElementById('game-over');
        const finalScoreElement = document.getElementById('final-score');
        
        finalScoreElement.textContent = `Lives: ${this.lives}`;
        gameOverElement.style.display = 'block';
    }
    
    /**
     * Show level complete screen
     * @param {string} completionTime - Formatted completion time
     * @param {number} livesRemaining - Number of lives remaining
     */
    showLevelComplete(completionTime, livesRemaining) {
        const levelCompleteElement = document.getElementById('level-complete');
        const completionScoreElement = document.getElementById('completion-score');
        
        // Update completion message with time and lives
        completionScoreElement.innerHTML = `
            <div class="bonus-item">Congratulations!</div>
            <div class="bonus-item">Completion Time: ${completionTime}</div>
            <div class="bonus-item">Lives Remaining: ${livesRemaining}</div>
            <div class="bonus-item">Press Backspace to try a new maze</div>
        `;
        
        levelCompleteElement.style.display = 'block';
    }
    
    /**
     * Show pause screen
     */
    showPauseScreen() {
        document.getElementById('pause-screen').style.display = 'block';
    }
    
    /**
     * Hide pause screen
     */
    hidePauseScreen() {
        document.getElementById('pause-screen').style.display = 'none';
    }
    
    /**
     * Hide all screens (game over, level complete, pause)
     */
    hideScreens() {
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('level-complete').style.display = 'none';
        document.getElementById('pause-screen').style.display = 'none';
    }
    
    /**
     * Reset UI to initial state
     */
    reset() {
        this.lives = CONFIG.GAME.INITIAL_LIVES;
        this.updateLives(this.lives);
        this.updateTimer(0);
        this.hideScreens();
        
        // Clear notifications
        while (this.notificationContainer.firstChild) {
            this.notificationContainer.removeChild(this.notificationContainer.firstChild);
        }
    }
}
