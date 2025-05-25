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
     */
    update(deltaTime, isLeftPressed, isRightPressed, isJumpPressed) {
        // Check if on ground
        this.onGround = this.mesh.position.y <= CONFIG.TIRE.RADIUS + 0.1;
        
        // Apply gravity
        if (!this.onGround) {
            this.velocity.y -= CONFIG.PHYSICS.GRAVITY;
        } else {
            // Reset vertical velocity when on ground
            this.velocity.y = Math.max(0, this.velocity.y);
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
            this.mesh.rotation.x += this.velocity.x / CONFIG.TIRE.RADIUS;
        }
        
        // Apply tilt to visual rotation
        this.mesh.rotation.z = this.tilt;
        
        // Prevent falling below ground
        if (this.mesh.position.y < CONFIG.TIRE.RADIUS) {
            this.mesh.position.y = CONFIG.TIRE.RADIUS;
            this.velocity.y = 0;
            this.onGround = true;
        }
    }
    
    /**
     * Reset tire position and velocity
     * @param {THREE.Vector3} position - New position
     */
    reset(position) {
        this.mesh.position.copy(position);
        this.velocity.set(0, 0, 0);
        this.tilt = 0;
        this.onGround = false;
        this.mesh.rotation.set(0, 0, 0);
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
