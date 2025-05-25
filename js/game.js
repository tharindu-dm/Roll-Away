/**
 * Main game class
 */
class Game {
    constructor() {
        // Game state
        this.isRunning = false;
        this.gameOver = false;
        this.levelComplete = false;
        this.lastTime = 0;
        
        // Key states
        this.keys = {
            left: false,
            right: false,
            jump: false,
            restart: false
        };
        
        // Initialize game components
        this.initScene();
        this.initLights();
        this.initMap();
        this.initDoors();
        this.initPlayer();
        this.initCamera();
        this.initPhysics();
        this.initUI();
        this.initEventListeners();
        
        // Start game loop
        this.start();
    }
    
    /**
     * Initialize scene and renderer
     */
    initScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }
    
    /**
     * Initialize lights
     */
    initLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
    }
    
    /**
     * Initialize game map
     */
    initMap() {
        this.map = new GameMap(this.scene);
    }
    
    /**
     * Initialize doors
     */
    initDoors() {
        this.doors = new Doors(this.scene);
    }
    
    /**
     * Initialize player
     */
    initPlayer() {
        this.player = new Tire(this.scene);
        // Set initial position higher to prevent falling through map
        this.player.reset(new THREE.Vector3(0, 10, 0));
    }
    
    /**
     * Initialize camera
     */
    initCamera() {
        this.camera = new GameCamera(this.scene);
        this.camera.setTarget(this.player.mesh);
    }
    
    /**
     * Initialize physics
     */
    initPhysics() {
        this.physics = new Physics(this.scene, this.map);
    }
    
    /**
     * Initialize UI
     */
    initUI() {
        this.ui = new UI();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Window resize
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} event - Key event
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case ' ':
                this.keys.jump = true;
                break;
            case 'Backspace':
                if (this.gameOver || this.levelComplete) {
                    this.restart();
                }
                break;
        }
    }
    
    /**
     * Handle key up events
     * @param {KeyboardEvent} event - Key event
     */
    handleKeyUp(event) {
        switch (event.key) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.jump = false;
                break;
        }
    }
    
    /**
     * Start game
     */
    start() {
        this.isRunning = true;
        this.gameOver = false;
        this.levelComplete = false;
        this.lastTime = Date.now();
        window.gameStartTime = Date.now(); // Store game start time globally
        this.animate();
    }
    
    /**
     * Game loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calculate delta time
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Skip update if game is not running
        if (!this.isRunning) return;
        
        // Update game components
        this.update(deltaTime, currentTime);
        
        // Render scene
        this.renderer.render(this.scene, this.camera.getCamera());
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last update
     * @param {number} currentTime - Current time
     */
    update(deltaTime, currentTime) {
        // Skip update if game over or level complete
        if (this.gameOver || this.levelComplete) return;
        
        // Update player
        this.player.update(
            deltaTime,
            this.keys.left,
            this.keys.right,
            this.keys.jump
        );
        
        // Update camera
        this.camera.update();
        
        // Update traps (only after game has been running for a few seconds)
        if (currentTime - this.lastTime > 5000) {
            this.doors.updateTraps(currentTime);
        }
        
        // Check door collisions
        const collisionResult = this.doors.checkCollisions(this.player.mesh);
        
        if (collisionResult.teleported) {
            // Player teleported
            this.ui.updateScore(50);
        }
        
        if (collisionResult.jumped) {
            // Player hit jumper door
            this.player.applyForce(collisionResult.jumpDirection);
            this.ui.updateScore(30);
        }
        
        if (collisionResult.trapped) {
            // Player hit trap door
            const livesLeft = this.ui.decreaseLives();
            
            // Shake camera for effect
            this.camera.shake(0.5, 500);
            
            if (livesLeft <= 0) {
                this.endGame();
            } else {
                // Reset player position but keep score
                this.player.reset(new THREE.Vector3(0, 10, 0));
            }
        }
        
        // Check if player reached goal
        if (this.map.checkGoalReached(this.player.getPosition())) {
            this.completeLevel();
        }
        
        // Check if player fell off map
        if (!this.map.isOnMap(this.player.getPosition())) {
            const livesLeft = this.ui.decreaseLives();
            
            if (livesLeft <= 0) {
                this.endGame();
            } else {
                // Reset player position but keep score
                this.player.reset(new THREE.Vector3(0, 10, 0));
            }
        }
        
        // Increment score based on time (less frequently)
        if (Math.random() < 0.01) {
            this.ui.updateScore(1);
        }
    }
    
    /**
     * End game (game over)
     */
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        this.ui.showGameOver();
    }
    
    /**
     * Complete level
     */
    completeLevel() {
        this.levelComplete = true;
        this.isRunning = false;
        
        // Bonus points for completing level
        this.ui.updateScore(500);
        this.ui.showLevelComplete();
    }
    
    /**
     * Restart game
     */
    restart() {
        // Reset game state
        this.gameOver = false;
        this.levelComplete = false;
        this.isRunning = true;
        this.lastTime = Date.now(); // Reset time to prevent immediate trap spawning
        
        // Reset UI
        this.ui.reset();
        
        // Reset player
        this.player.reset(new THREE.Vector3(0, 10, 0));
        
        // Hide UI screens
        this.ui.hideScreens();
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
