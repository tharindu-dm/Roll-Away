/**
 * Tire class - Handles the player's tire object
 */
class Tire {
    constructor(scene) {
        this.scene = scene;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.onGround = false;
        this.mesh = null;
        this.particles = {
            dust: null,
            burnout: null
        };
        this.inAir = false;
        this.canControl = true;
        this.createTire();
        this.setupParticles();
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
        this.mesh.position.set(0, 15, 0);
        
        // Add to scene
        this.scene.add(this.mesh);
    }
    
    /**
     * Setup particle systems for effects
     */
    setupParticles() {
        // Dust particles (for side movement)
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 50;
        const dustPositions = new Float32Array(dustCount * 3);
        const dustSizes = new Float32Array(dustCount);
        
        for (let i = 0; i < dustCount; i++) {
            dustPositions[i * 3] = (Math.random() - 0.5) * 2;
            dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
            dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
            dustSizes[i] = Math.random() * 0.1 + 0.05;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
        
        const dustMaterial = new THREE.PointsMaterial({
            color: 0xCCCCCC,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        
        this.particles.dust = new THREE.Points(dustGeometry, dustMaterial);
        this.particles.dust.visible = false;
        this.scene.add(this.particles.dust);
        
        // Burnout particles (for forward/backward movement)
        const burnoutGeometry = new THREE.BufferGeometry();
        const burnoutCount = 30;
        const burnoutPositions = new Float32Array(burnoutCount * 3);
        const burnoutSizes = new Float32Array(burnoutCount);
        
        for (let i = 0; i < burnoutCount; i++) {
            burnoutPositions[i * 3] = (Math.random() - 0.5) * 1;
            burnoutPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            burnoutPositions[i * 3 + 2] = (Math.random() - 0.5) * 1;
            burnoutSizes[i] = Math.random() * 0.15 + 0.05;
        }
        
        burnoutGeometry.setAttribute('position', new THREE.BufferAttribute(burnoutPositions, 3));
        burnoutGeometry.setAttribute('size', new THREE.BufferAttribute(burnoutSizes, 1));
        
        const burnoutMaterial = new THREE.PointsMaterial({
            color: 0x333333,
            size: 0.15,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true
        });
        
        this.particles.burnout = new THREE.Points(burnoutGeometry, burnoutMaterial);
        this.particles.burnout.visible = false;
        this.scene.add(this.particles.burnout);
    }
    
    /**
     * Update tire physics and movement
     * @param {number} deltaTime - Time since last update
     * @param {boolean} isLeftPressed - Left key pressed
     * @param {boolean} isRightPressed - Right key pressed
     * @param {boolean} isForwardPressed - Forward key pressed
     * @param {boolean} isBackwardPressed - Backward key pressed
     * @param {boolean} isJumpPressed - Jump key pressed
     */
    update(deltaTime, isLeftPressed, isRightPressed, isForwardPressed, isBackwardPressed, isJumpPressed) {
        // Check if on ground - more generous ground detection
        const groundHeight = CONFIG.TIRE.RADIUS + 0.5;
        this.onGround = this.mesh.position.y <= groundHeight;
        
        // Update inAir state
        if (!this.onGround) {
            this.inAir = true;
            
            // When in air, disable horizontal movement completely
            this.velocity.x *= 0.9; // Apply strong drag to gradually stop horizontal movement
            this.velocity.z *= 0.9; // Apply strong drag to gradually stop horizontal movement
            
            // Hide all particles when in air
            this.hideParticleEffect('dust');
            this.hideParticleEffect('burnout');
        } else if (this.inAir) {
            // Just landed
            this.inAir = false;
            this.canControl = true;
        }
        
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
        
        // Only allow control if on ground
        if (this.canControl && this.onGround) {
            // Handle forward/backward movement (rolling like a car tire)
            if (isForwardPressed) {
                this.velocity.z -= CONFIG.TIRE.ROLL_SPEED;
                this.showParticleEffect('burnout', 'forward');
            } else if (isBackwardPressed) {
                this.velocity.z += CONFIG.TIRE.ROLL_SPEED;
                this.showParticleEffect('burnout', 'backward');
            } else {
                this.hideParticleEffect('burnout');
            }
            
            // Handle left/right movement (flip-rolling instead of tilting)
            if (isLeftPressed) {
                this.velocity.x -= CONFIG.TIRE.ROLL_SPEED;
                this.showParticleEffect('dust', 'left');
            } else if (isRightPressed) {
                this.velocity.x += CONFIG.TIRE.ROLL_SPEED;
                this.showParticleEffect('dust', 'right');
            } else {
                this.hideParticleEffect('dust');
            }
            
            // Jumping is disabled as requested
        } else {
            // No control when in air or launched from jumper door
            // If launched from jumper door, completely zero out horizontal velocity
            if (!this.canControl) {
                this.velocity.x = 0;
                this.velocity.z = 0;
            }
            
            // Hide all particles when not in control
            this.hideParticleEffect('dust');
            this.hideParticleEffect('burnout');
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
        
        // Store previous position for collision detection
        const prevPosition = this.mesh.position.clone();
        
        // Update position
        this.mesh.position.x += this.velocity.x;
        this.mesh.position.y += this.velocity.y;
        this.mesh.position.z += this.velocity.z;
        
        // Update rotation based on movement (rolling like a real tire)
        if (this.onGround) {
            // Roll forward/backward (around X axis)
            this.mesh.rotation.x -= this.velocity.z / CONFIG.TIRE.RADIUS;
            
            // Roll left/right (around Z axis)
            this.mesh.rotation.z += this.velocity.x / CONFIG.TIRE.RADIUS;
        }
        
        // Prevent falling below ground
        if (this.mesh.position.y < CONFIG.TIRE.RADIUS) {
            this.mesh.position.y = CONFIG.TIRE.RADIUS;
            this.velocity.y = 0;
            this.onGround = true;
        }
        
        // Update particle positions
        this.updateParticles();
        
        // Prevent getting stuck in borders
        this.preventBorderStuck();
    }
    
    /**
     * Show particle effect
     * @param {string} type - Effect type ('dust' or 'burnout')
     * @param {string} direction - Movement direction
     */
    showParticleEffect(type, direction) {
        if (!this.onGround) return;
        
        const particles = this.particles[type];
        if (!particles) return;
        
        particles.visible = true;
        
        // Position particles based on tire position and direction
        particles.position.copy(this.mesh.position);
        
        // Adjust position based on direction
        if (type === 'dust') {
            particles.position.y = 0.2; // Just above ground
            if (direction === 'left') {
                particles.position.x = this.mesh.position.x + 1;
            } else if (direction === 'right') {
                particles.position.x = this.mesh.position.x - 1;
            }
        } else if (type === 'burnout') {
            particles.position.y = 0.2; // Just above ground
            if (direction === 'forward') {
                particles.position.z = this.mesh.position.z + 1;
            } else if (direction === 'backward') {
                particles.position.z = this.mesh.position.z - 1;
            }
        }
    }
    
    /**
     * Hide particle effect
     * @param {string} type - Effect type ('dust' or 'burnout')
     */
    hideParticleEffect(type) {
        const particles = this.particles[type];
        if (particles) {
            particles.visible = false;
        }
    }
    
    /**
     * Update particle positions and animations
     */
    updateParticles() {
        // Update dust particles
        if (this.particles.dust && this.particles.dust.visible) {
            const positions = this.particles.dust.geometry.attributes.position.array;
            const count = positions.length / 3;
            
            for (let i = 0; i < count; i++) {
                // Move particles outward and upward
                positions[i * 3] *= 1.05;
                positions[i * 3 + 1] += 0.02;
                positions[i * 3 + 2] *= 1.05;
                
                // Reset particles that move too far
                if (Math.abs(positions[i * 3]) > 2 || 
                    positions[i * 3 + 1] > 2 || 
                    Math.abs(positions[i * 3 + 2]) > 2) {
                    positions[i * 3] = (Math.random() - 0.5) * 0.5;
                    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
                }
            }
            
            this.particles.dust.geometry.attributes.position.needsUpdate = true;
        }
        
        // Update burnout particles
        if (this.particles.burnout && this.particles.burnout.visible) {
            const positions = this.particles.burnout.geometry.attributes.position.array;
            const count = positions.length / 3;
            
            for (let i = 0; i < count; i++) {
                // Move particles outward and upward
                positions[i * 3] *= 1.03;
                positions[i * 3 + 1] += 0.03;
                positions[i * 3 + 2] *= 1.03;
                
                // Reset particles that move too far
                if (Math.abs(positions[i * 3]) > 1.5 || 
                    positions[i * 3 + 1] > 1.5 || 
                    Math.abs(positions[i * 3 + 2]) > 1.5) {
                    positions[i * 3] = (Math.random() - 0.5) * 0.3;
                    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
                }
            }
            
            this.particles.burnout.geometry.attributes.position.needsUpdate = true;
        }
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
            this.onGround = false;
            this.inAir = false;
            this.canControl = true;
            
            // Hide all particles
            this.hideParticleEffect('dust');
            this.hideParticleEffect('burnout');
        }
    }
    
    /**
     * Apply force to the tire (for jumper doors)
     * @param {THREE.Vector3} force - Force vector
     */
    applyForce(force) {
        // Apply a stronger force for better jumper effect
        const enhancedForce = force.clone().multiplyScalar(1.5);
        this.velocity.add(enhancedForce);
        this.inAir = true;
        this.canControl = false; // Disable control until landing
        
        // Log for debugging
        console.log("Applied force:", enhancedForce);
    }
    
    /**
     * Get current position
     * @returns {THREE.Vector3} Current position
     */
    getPosition() {
        return this.mesh.position.clone();
    }
    
    /**
     * Get current elevation (y position)
     * @returns {number} Current elevation
     */
    getElevation() {
        return this.mesh.position.y;
    }
}
