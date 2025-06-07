/**
 * Main game class
 */
class Game {
    constructor() {
        console.log("Game initialization started");
        
        // Game state
        this.isRunning = false;
        this.gameOver = false;
        this.levelComplete = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.jumpersUsed = 0;
        this.teleportersUsed = 0;
        
        // Make game instance globally available
        window.game = this;
        
        // Key states
        this.keys = {
            left: false,
            right: false,
            jump: false,
            restart: false
        };
        
        try {
            // Initialize audio first
            this.initAudio();
            
            // Initialize game components in the correct order
            this.initScene();
            this.initLights();
            this.initMap();
            this.initPlayer(); // Initialize player before doors
            this.initCamera();
            this.initPhysics();
            this.initUI();
            this.initEventListeners();
            this.initConfetti();
            
            // Initialize doors with a delay to avoid circular dependencies
            setTimeout(() => {
                this.initDoors();
                console.log("Doors initialized with delay");
            }, 1000);
            
            // Start game loop
            this.start();
            
            console.log("Game initialization completed");
        } catch (error) {
            console.error("Error during game initialization:", error);
        }
    }
    
    /**
     * Initialize audio
     */
    initAudio() {
        this.audio = new AudioManager();
        
        // Setup mute button
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                const isMuted = this.audio.toggleMute();
                muteButton.textContent = isMuted ? '🔇' : '🔊';
            });
        }
    }
    
    /**
     * Initialize scene and renderer
     */
    initScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        try {
            // Create renderer with error handling
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: false
            });
            
            // Set renderer properties
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Updated from outputEncoding
            
            // Add renderer to DOM
            const container = document.getElementById('game-container');
            container.appendChild(this.renderer.domElement);
            
            console.log("WebGL Renderer initialized successfully");
        } catch (error) {
            console.error("Error initializing WebGL renderer:", error);
            
            // Show error message to user
            const errorMsg = document.createElement('div');
            errorMsg.style.position = 'absolute';
            errorMsg.style.top = '50%';
            errorMsg.style.left = '50%';
            errorMsg.style.transform = 'translate(-50%, -50%)';
            errorMsg.style.color = 'white';
            errorMsg.style.fontSize = '24px';
            errorMsg.style.textAlign = 'center';
            errorMsg.innerHTML = 'Error initializing 3D renderer.<br>Please try a different browser or device.';
            document.getElementById('game-container').appendChild(errorMsg);
        }
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
        try {
            console.log("Initializing map...");
            this.map = new GameMap(this.scene);
            console.log("Map initialized successfully");
        } catch (error) {
            console.error("Error initializing map:", error);
        }
    }
    
    /**
     * Initialize doors
     */
    initDoors() {
        try {
            // Initialize doors after map is created
            setTimeout(() => {
                if (typeof Doors === 'undefined') {
                    console.error("Doors class is not defined");
                    return;
                }
                this.doors = new Doors(this.scene);
                console.log("Doors initialized with delay");
            }, 500);
        } catch (error) {
            console.error("Error initializing doors:", error);
        }
    }
    
    /**
     * Initialize player
     */
    initPlayer() {
        try {
            console.log("Initializing player...");
            this.player = new Tire(this.scene);
            // Set initial position higher to prevent falling through map
            this.player.reset(new THREE.Vector3(0, 10, 0));
            console.log("Player initialized successfully");
        } catch (error) {
            console.error("Error initializing player:", error);
        }
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
     * Initialize confetti for level completion
     */
    initConfetti() {
        this.confetti = {
            particles: [],
            colors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
            active: false,
            uiMode: false // New flag for UI-based confetti
        };
        
        // Create confetti particles
        for (let i = 0; i < 50; i++) { // Reduced from 100 to 50 to avoid overcrowding
            const geometry = new THREE.PlaneGeometry(0.2, 0.2);
            const colorIndex = Math.floor(Math.random() * this.confetti.colors.length);
            const material = new THREE.MeshBasicMaterial({
                color: this.confetti.colors[colorIndex],
                side: THREE.DoubleSide
            });
            const particle = new THREE.Mesh(geometry, material);
            
            // Hide initially
            particle.visible = false;
            
            // Add to scene and store reference
            this.scene.add(particle);
            this.confetti.particles.push({
                mesh: particle,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * -0.1 - 0.1,
                    (Math.random() - 0.5) * 0.2
                ),
                rotation: new THREE.Vector3(
                    Math.random() * 0.1,
                    Math.random() * 0.1,
                    Math.random() * 0.1
                )
            });
        }
        
        // Create UI confetti elements
        this.uiConfetti = [];
        const confettiContainer = document.createElement('div');
        confettiContainer.id = 'confetti-container';
        confettiContainer.style.position = 'absolute';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none'; // Don't block interaction
        confettiContainer.style.zIndex = '150'; // Above game, below UI
        confettiContainer.style.display = 'none'; // Hidden initially
        document.getElementById('game-container').appendChild(confettiContainer);
        
        // Create UI confetti particles
        const confettiCount = 40; // Moderate number to avoid overcrowding
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'ui-confetti';
            
            // Random color
            const colorIndex = Math.floor(Math.random() * this.confetti.colors.length);
            const color = '#' + this.confetti.colors[colorIndex].toString(16).padStart(6, '0');
            
            // Random size
            const size = Math.random() * 10 + 5; // 5-15px
            
            // Style the confetti
            confetti.style.position = 'absolute';
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            confetti.style.backgroundColor = color;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'; // Circle or square
            
            // Random starting position
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = -20 + 'px'; // Start above screen
            
            // Store animation data
            const speed = Math.random() * 2 + 1; // Fall speed
            const wobble = Math.random() * 5; // Horizontal wobble amount
            const delay = Math.random() * 10; // Delay start
            
            this.uiConfetti.push({
                element: confetti,
                speed: speed,
                wobble: wobble,
                wobbleSpeed: Math.random() * 0.1,
                wobblePos: Math.random() * Math.PI * 2,
                x: parseFloat(confetti.style.left),
                y: parseFloat(confetti.style.top),
                delay: delay,
                active: false
            });
            
            confettiContainer.appendChild(confetti);
        }
        
        this.confettiContainer = confettiContainer;
    }
    
    /**
     * Show confetti celebration
     * @param {THREE.Vector3} position - Position to show confetti
     */
    showConfetti(position) {
        // Don't show 3D confetti, only use UI confetti
        this.confetti.uiMode = true;
        
        // Show UI confetti
        this.confettiContainer.style.display = 'block';
        
        // Activate all UI confetti particles
        for (const confetti of this.uiConfetti) {
            // Reset position
            confetti.element.style.left = Math.random() * 100 + 'vw';
            confetti.element.style.top = -20 + 'px';
            confetti.x = parseFloat(confetti.element.style.left);
            confetti.y = -20;
            confetti.active = true;
        }
        
        // Start animation loop if not already running
        if (!this.confettiAnimationId) {
            this.animateUIConfetti();
        }
    }
    
    /**
     * Animate UI confetti
     */
    animateUIConfetti() {
        // Only continue if level is complete
        if (!this.levelComplete) {
            this.confettiContainer.style.display = 'none';
            this.confettiAnimationId = null;
            return;
        }
        
        // Update each confetti particle
        for (const confetti of this.uiConfetti) {
            if (confetti.active) {
                // Apply delay
                if (confetti.delay > 0) {
                    confetti.delay -= 0.1;
                    continue;
                }
                
                // Update position
                confetti.y += confetti.speed;
                confetti.wobblePos += confetti.wobbleSpeed;
                const wobbleOffset = Math.sin(confetti.wobblePos) * confetti.wobble;
                
                // Apply position
                confetti.element.style.top = confetti.y + 'px';
                confetti.element.style.left = (confetti.x + wobbleOffset) + 'px';
                
                // Reset if off screen
                if (confetti.y > window.innerHeight + 20) {
                    confetti.y = -20;
                    confetti.x = Math.random() * 100;
                    confetti.element.style.left = confetti.x + 'vw';
                }
            }
        }
        
        // Continue animation
        this.confettiAnimationId = requestAnimationFrame(() => this.animateUIConfetti());
    }
    
    /**
     * Stop confetti animation
     */
    stopConfetti() {
        if (this.confettiAnimationId) {
            cancelAnimationFrame(this.confettiAnimationId);
            this.confettiAnimationId = null;
        }
        
        // Hide UI confetti
        this.confettiContainer.style.display = 'none';
        
        // Deactivate all UI confetti particles
        for (const confetti of this.uiConfetti) {
            confetti.active = false;
        }
    }
    
    /**
     * Update confetti animation
     */
    updateConfetti() {
        // Skip if using UI confetti mode
        if (this.confetti.uiMode) return;
        
        if (!this.confetti.active) return;
        
        let allFallen = true;
        
        for (const particle of this.confetti.particles) {
            if (particle.mesh.visible) {
                // Update position
                particle.mesh.position.x += particle.velocity.x;
                particle.mesh.position.y += particle.velocity.y;
                particle.mesh.position.z += particle.velocity.z;
                
                // Update rotation
                particle.mesh.rotation.x += particle.rotation.x;
                particle.mesh.rotation.y += particle.rotation.y;
                particle.mesh.rotation.z += particle.rotation.z;
                
                // Apply "gravity"
                particle.velocity.y -= 0.001;
                
                // Check if particle has fallen below ground
                if (particle.mesh.position.y < 0) {
                    particle.mesh.visible = false;
                } else {
                    allFallen = false;
                }
            }
        }
        
        // If all particles have fallen, deactivate confetti
        if (allFallen) {
            this.confetti.active = false;
        }
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
        
        // Initialize key states
        this.keys = {
            left: false,
            right: false,
            forward: false,
            backward: false,
            jump: false
        };
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
            case 'ArrowUp':
                // Forward movement
                this.keys.forward = true;
                break;
            case 'ArrowDown':
                // Backward movement
                this.keys.backward = true;
                break;
            case ' ':
                this.keys.jump = true;
                break;
            case 'p':
            case 'P':
                // Toggle pause
                this.togglePause();
                break;
            case 'Backspace':
                // Allow restart at any time, not just on game over
                event.preventDefault(); // Prevent browser back navigation
                this.restart();
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
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'ArrowDown':
                this.keys.backward = false;
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
        this.startTime = Date.now();
        window.gameStartTime = Date.now(); // Store game start time globally
        
        // Only start background music if user has interacted with the page
        if (this.audio && this.audio.hasInteracted) {
            this.audio.startBackgroundMusic();
        }
        
        this.animate();
    }
    
    /**
     * Game loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Skip if renderer not initialized
        if (!this.renderer) {
            console.warn("Renderer not initialized, skipping animation frame");
            return;
        }
        
        try {
            // Calculate delta time
            const currentTime = Date.now();
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            // Update elapsed time if game is running
            if (this.isRunning && !this.isPaused) {
                this.elapsedTime = currentTime - this.startTime;
                
                // Update timer display
                this.ui.updateTimer(this.elapsedTime);
            }
            
            // Skip update if game is not running
            if (!this.isRunning) return;
            
            // Update game components
            this.update(deltaTime, currentTime);
            
            // Update confetti even when game is complete
            if (this.confetti && this.confetti.active) {
                this.updateConfetti();
            }
            
            // Update midpoint marker animation
            if (this.map && this.map.midpointMarker) {
                this.map.updateMidpointMarker();
            }
            
            // Render scene
            this.renderer.render(this.scene, this.camera.getCamera());
        } catch (error) {
            console.error("Error in animation loop:", error);
        }
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last update
     * @param {number} currentTime - Current time
     */
    update(deltaTime, currentTime) {
        // Skip update if game over or level complete or paused
        if (this.gameOver || this.levelComplete || this.isPaused) return;
        
        // Calculate time since game start
        const timeSinceStart = currentTime - window.gameStartTime;
        
        // Update player - only pass control inputs if player is on ground
        const isOnGround = this.player.onGround;
        this.player.update(
            deltaTime,
            isOnGround ? this.keys.left : false,
            isOnGround ? this.keys.right : false,
            isOnGround ? this.keys.forward : false,
            isOnGround ? this.keys.backward : false,
            false // Jump is always disabled
        );
        
        // Store player velocity globally for other components to access
        window.playerVelocity = this.player.velocity.clone();
        
        // Apply physics to handle collisions
        if (this.physics) {
            // Check for collisions with obstacles and terrain
            if (this.physics.checkObstacleCollision(this.player.mesh)) {
                // Handle collision response
                this.player.velocity = this.physics.handleObstacleCollision(
                    this.player.mesh, 
                    this.player.velocity
                );
            }
        }
        
        // Check if player reached the midpoint for extra life
        if (this.map.checkMidpointReached(this.player.getPosition())) {
            // Award extra life
            this.ui.increaseLife();
            
            // Show notification
            this.ui.showNotification("Extra Life Awarded!");
        }
        
        // Update camera
        this.camera.update();
        
        // Update traps (only after game has been running for a while)
        if (timeSinceStart > 10000 && this.doors) { // 10 seconds grace period
            this.doors.updateTraps(currentTime);
        }
        
        // Check door collisions (only after a few seconds)
        if (timeSinceStart > 3000 && this.doors) {
            const collisionResult = this.doors.checkCollisions(this.player.mesh);
            
            if (collisionResult.teleported) {
                // Player teleported
                this.teleportersUsed++;
            }
            
            if (collisionResult.jumped) {
                // Player hit jumper door
                this.jumpersUsed++;
                this.player.applyForce(collisionResult.jumpDirection);
            }
            
            if (collisionResult.trapped) {
                // Player hit trap door
                const livesLeft = this.ui.decreaseLives();
                
                // Shake camera for effect
                this.camera.shake(0.5, 500);
                
                if (livesLeft <= 0) {
                    // Only end game if lives are 0
                    this.endGame();
                } else {
                    // Reset player position but keep score
                    this.player.reset(new THREE.Vector3(0, 15, 0));
                }
            }
            
            // Check for spike trap collision
            if (collisionResult.spiked) {
                const livesLeft = this.ui.decreaseLives();
                
                // Stronger camera shake for spike trap
                this.camera.shake(0.8, 700);
                
                if (livesLeft <= 0) {
                    // Only end game if lives are 0
                    this.endGame();
                } else {
                    // Reset player position but keep score
                    this.player.reset(new THREE.Vector3(0, 15, 0));
                }
            }
            
            // Check for lava collision
            if (collisionResult.lava) {
                // Lava decreases lives instead of instant game over
                const livesLeft = this.ui.decreaseLives();
                
                // Violent camera shake
                this.camera.shake(1.2, 1000);
                
                if (livesLeft <= 0) {
                    // Only end game if lives are 0
                    this.endGame();
                } else {
                    // Reset player position but keep score
                    this.player.reset(new THREE.Vector3(0, 15, 0));
                }
            }
        }
        
        // Check if player reached goal
        if (this.map.checkGoalReached(this.player.getPosition())) {
            this.completeLevel();
        }
        
        // Check if player fell off map (only after grace period)
        if (timeSinceStart > 3000 && !this.map.isOnMap(this.player.getPosition())) {
            const livesLeft = this.ui.decreaseLives();
            
            if (livesLeft <= 0) {
                // Only end game if lives are 0
                this.endGame();
            } else {
                // Reset player position but keep score
                this.player.reset(new THREE.Vector3(0, 15, 0));
            }
        }
    }
    
    /**
     * Format time in milliseconds to MM:SS.mmm format
     * @param {number} timeMs - Time in milliseconds
     * @returns {string} Formatted time string
     */
    formatTime(timeMs) {
        const totalSeconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((timeMs % 1000) / 10); // Only show 2 digits of ms
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Complete level
     */
    completeLevel() {
        this.levelComplete = true;
        this.isRunning = false;
        
        // Format completion time
        const completionTime = this.formatTime(this.elapsedTime);
        
        // Show UI confetti celebration that continues until restart
        this.showConfetti();
        
        // Show completion screen with time and lives
        this.ui.showLevelComplete(completionTime, this.ui.lives);
        
        // Stop background music and play victory sound
        if (this.audio) {
            this.audio.stopBackgroundMusic();
            this.audio.play('gameWon');
        }
        
        console.log("Level complete! Time: " + completionTime + ", Lives remaining: " + this.ui.lives);
    }
    
    /**
     * End game (game over)
     */
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        this.ui.showGameOver();
        
        // Stop background music and play game over sound
        if (this.audio) {
            this.audio.stopBackgroundMusic();
            this.audio.play('gameOver');
        }
    }
    
    /**
     * Toggle game pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.isRunning = false;
            this.ui.showPauseScreen();
            
            // Pause background music
            if (this.audio) {
                this.audio.pauseBackgroundMusic();
            }
        } else {
            this.isRunning = true;
            this.ui.hidePauseScreen();
            this.lastTime = Date.now(); // Reset time to prevent jumps
            
            // Resume background music
            if (this.audio) {
                this.audio.resumeBackgroundMusic();
            }
        }
    }
    
    /**
     * Restart game
     */
    restart() {
        // Stop confetti
        this.stopConfetti();
        
        // Reset game state
        this.gameOver = false;
        this.levelComplete = false;
        this.isRunning = true;
        this.lastTime = Date.now(); // Reset time to prevent immediate trap spawning
        this.startTime = Date.now(); // Reset start time for timer
        window.gameStartTime = Date.now(); // Reset global start time
        this.elapsedTime = 0;
        this.jumpersUsed = 0;
        this.teleportersUsed = 0;
        
        // Reset UI
        this.ui.reset();
        
        // Reset player with higher position to avoid getting stuck
        this.player.reset(new THREE.Vector3(0, 15, 0));
        
        // Reset the maze
        this.map.reset();
        
        // Reset doors if they exist
        if (this.doors) {
            this.doors.reset();
        } else {
            // Initialize doors if they don't exist yet
            setTimeout(() => {
                this.doors = new Doors(this.scene);
            }, 100);
        }
        
        // Hide UI screens
        this.ui.hideScreens();
        
        // Restart background music
        if (this.audio) {
            this.audio.stopBackgroundMusic();
            this.audio.startBackgroundMusic();
        }
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
