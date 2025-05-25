/**
 * UI class - Handles game user interface
 */
class UI {
    constructor() {
        this.score = 0;
        this.lives = CONFIG.GAME.INITIAL_LIVES;
        this.scoreElement = document.getElementById('score-value');
        this.livesElement = document.getElementById('lives-value');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.levelCompleteElement = document.getElementById('level-complete');
        this.completionScoreElement = document.getElementById('completion-score');
        
        this.updateScore(0);
        this.updateLives(CONFIG.GAME.INITIAL_LIVES);
    }
    
    /**
     * Update score display
     * @param {number} points - Points to add
     */
    updateScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
    }
    
    /**
     * Update lives display
     * @param {number} lives - New lives count
     */
    updateLives(lives) {
        this.lives = lives;
        this.livesElement.textContent = this.lives;
    }
    
    /**
     * Decrease lives by one
     * @returns {number} Remaining lives
     */
    decreaseLives() {
        this.lives--;
        this.updateLives(this.lives);
        return this.lives;
    }
    
    /**
     * Show game over screen
     */
    showGameOver() {
        this.gameOverElement.style.display = 'block';
        this.finalScoreElement.textContent = `Final Score: ${this.score}`;
    }
    
    /**
     * Show level complete screen
     */
    showLevelComplete() {
        this.levelCompleteElement.style.display = 'block';
        this.completionScoreElement.textContent = `Score: ${this.score}`;
    }
    
    /**
     * Hide all screens
     */
    hideScreens() {
        this.gameOverElement.style.display = 'none';
        this.levelCompleteElement.style.display = 'none';
    }
    
    /**
     * Reset UI to initial state
     */
    reset() {
        this.score = 0;
        this.lives = CONFIG.GAME.INITIAL_LIVES;
        this.updateScore(0);
        this.updateLives(CONFIG.GAME.INITIAL_LIVES);
        this.hideScreens();
        
        // Ensure lives are properly displayed
        document.getElementById('lives-value').textContent = CONFIG.GAME.INITIAL_LIVES;
    }
}
