/**
 * Tire class - Handles the player's tire object
 */
class Tire {
    constructor(scene) {
        this.scene = scene;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.tilt = 0; // Current tilt angle
        this.rotation = new THREE.Euler(0, 0, 0);
        this.onGround = false;
        this.mesh = null;
        this.createTire();
    }
    
    /**
     * Create the tire mesh with treads
     */
    createTire() {
        // Create tire group
        this.mesh = new THREE.Group();
        
        // Create main tire body - a proper tire shape
        const tireGeometry = new THREE.TorusGeometry(
            CONFIG.TIRE.RADIUS, 
            CONFIG.TIRE.RADIUS / 2, 
            CONFIG.TIRE.SEGMENTS, 
            CONFIG.TIRE.SEGMENTS
        );
        const tireMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.TIRE.COLOR,
            shininess: 30
        });
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        
        // Create tire treads
        const treadCount = 8;
        const treadMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.TIRE.TREAD_COLOR 
        });
        
        for (let i = 0; i < treadCount; i++) {
            const angle = (i / treadCount) * Math.PI * 2;
            const treadGeometry = new THREE.BoxGeometry(
                0.2, 
                CONFIG.TIRE.RADIUS * 2.1,
                0.3
            );
            const tread = new THREE.Mesh(treadGeometry, treadMaterial);
            
            tread.position.x = Math.cos(angle) * CONFIG.TIRE.RADIUS;
            tread.position.y = Math.sin(angle) * CONFIG.TIRE.RADIUS;
            tread.rotation.z = angle;
            
            this.mesh.add(tread);
        }
        
        // Add tire to group
        this.mesh.add(tire);
        
        // Set initial position - higher off the ground
        this.mesh.position.set(0, 10, 0);
        
        // Add to scene
        this.scene.add(this.mesh);
    }
    
    /**
     * Update tire physics and movement
     * @param {number} deltaTime - Time since last update
     * @param {boolean} isLeftPressed - Left key pressed
     * @param {boolean} isRightPressed - Right key pressed
     * @param {boolean} isJumpPressed - Jump key pressed
     * @param {boolean} isForwardPressed - Forward key pressed
     * @param {boolean} isBackwardPressed - Backward key pressed
     */
    update(deltaTime, isLeftPressed, isRightPressed, isJumpPressed, isForwardPressed, isBackwardPressed) {
        // Check if on ground - more generous ground detection
        const groundHeight = CONFIG.TIRE.RADIUS + 0.5;
        this.onGround = this.mesh.position.y <= groundHeight;
        
        // Apply gravity - reduced for better control
        if (!this.onGround) {
            this.velocity.y -= CONFIG.PHYSICS.GRAVITY;
        } else {
            // Reset vertical velocity when on ground and ensure minimum height
            this.velocity.y = Math.max(0, this.velocity.y);
            if (this.mesh.position.y < groundHeight) {
                this.mesh.position.y = groundHeight;
            }
        }
        
        // Handle tilting
        if (isLeftPressed) {
            this.tilt -= CONFIG.TIRE.TILT_SPEED;
        } else if (isRightPressed) {
            this.tilt += CONFIG.TIRE.TILT_SPEED;
        } else {
            // Gradually reduce tilt when no keys are pressed
            this.tilt *= CONFIG.PHYSICS.TILT_DECAY;
        }
        
        // Clamp tilt to reasonable values
        this.tilt = Utils.clamp(this.tilt, -0.5, 0.5);
        
        // Handle forward/backward movement
        if (isForwardPressed) {
            this.velocity.z -= CONFIG.TIRE.ROLL_SPEED;
        } else if (isBackwardPressed) {
            this.velocity.z += CONFIG.TIRE.ROLL_SPEED;
        }
        
        // Apply tilt to velocity (causes tire to roll in tilt direction)
        this.velocity.x = this.tilt * CONFIG.TIRE.ROLL_SPEED;
        
        // Handle jumping
        if (isJumpPressed && this.onGround) {
            this.velocity.y = CONFIG.TIRE.JUMP_FORCE;
            this.onGround = false;
        }
        
        // Apply friction
        this.velocity.x *= CONFIG.PHYSICS.FRICTION;
        this.velocity.z *= CONFIG.PHYSICS.FRICTION;
        
        // Clamp velocity to max speed
        const horizontalSpeed = Math.sqrt(
            this.velocity.x * this.velocity.x + 
            this.velocity.z * this.velocity.z
        );
        
        if (horizontalSpeed > CONFIG.TIRE.MAX_SPEED) {
            const scale = CONFIG.TIRE.MAX_SPEED / horizontalSpeed;
            this.velocity.x *= scale;
            this.velocity.z *= scale;
        }
        
        // Update position
        this.mesh.position.x += this.velocity.x;
        this.mesh.position.y += this.velocity.y;
        this.mesh.position.z += this.velocity.z;
        
        // Update rotation based on movement
        if (this.onGround) {
            // Roll the tire based on movement
            this.mesh.rotation.x += this.velocity.z / CONFIG.TIRE.RADIUS;
            this.mesh.rotation.z -= this.velocity.x / CONFIG.TIRE.RADIUS;
        }
        
        // Apply tilt to visual rotation
        this.mesh.rotation.y = this.tilt;
        
        // Prevent falling below ground
        if (this.mesh.position.y < CONFIG.TIRE.RADIUS) {
            this.mesh.position.y = CONFIG.TIRE.RADIUS;
            this.velocity.y = 0;
            this.onGround = true;
        }
        
        // Prevent getting stuck in borders
        this.preventBorderStuck();
    }
    
    /**
     * Prevent the tire from getting stuck in map borders
     */
    preventBorderStuck() {
        const mapWidth = CONFIG.MAP.WIDTH;
        const mapLength = CONFIG.MAP.LENGTH;
        const buffer = 2; // Buffer to prevent getting stuck
        
        // Check if near map edges and apply a small push away from edge
        if (Math.abs(this.mesh.position.x) > mapWidth / 2 - buffer) {
            // Near left/right edge
            const pushDirection = this.mesh.position.x > 0 ? -1 : 1;
            this.velocity.x += pushDirection * 0.05;
            
            // If really stuck, force position change
            if (Math.abs(this.mesh.position.x) > mapWidth / 2) {
                this.mesh.position.x = (mapWidth / 2 - buffer) * (this.mesh.position.x > 0 ? 1 : -1);
            }
        }
        
        // Check front/back edges
        if (this.mesh.position.z < -mapLength + buffer || this.mesh.position.z > -buffer) {
            // Near front/back edge
            const pushDirection = this.mesh.position.z > -mapLength / 2 ? -1 : 1;
            this.velocity.z += pushDirection * 0.05;
            
            // If really stuck, force position change
            if (this.mesh.position.z < -mapLength) {
                this.mesh.position.z = -mapLength + buffer;
            } else if (this.mesh.position.z > 0) {
                this.mesh.position.z = -buffer;
            }
        }
    }
    
    /**
     * Reset tire position and velocity
     * @param {THREE.Vector3} position - New position
     */
    reset(position) {
        if (this.mesh) {
            this.mesh.position.copy(position);
            this.mesh.rotation.set(0, 0, 0);
            this.velocity.set(0, 0, 0);
            this.tilt = 0;
            this.onGround = false;
        }
    }
    
    /**
     * Apply force to the tire (for jumper doors)
     * @param {THREE.Vector3} force - Force vector
     */
    applyForce(force) {
        this.velocity.add(force);
    }
    
    /**
     * Get current position
     * @returns {THREE.Vector3} Current position
     */
    getPosition() {
        return this.mesh.position.clone();
    }
}
