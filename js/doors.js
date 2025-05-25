/**
 * Doors class - Handles all door types (teleporter, exit, jumper, trap)
 */
class Doors {
    constructor(scene) {
        this.scene = scene;
        this.teleporters = [];
        this.exits = [];
        this.jumpers = [];
        this.traps = [];
        this.activeTraps = [];
        this.lastTrapTime = 0;
        
        this.createDoors();
    }
    
    /**
     * Create all door types on the map
     */
    createDoors() {
        // Create teleporter doors
        this.createTeleporterDoor(-15, 0.1, -25);
        this.createTeleporterDoor(10, 0.1, -55);
        this.createTeleporterDoor(-20, 0.1, -95);
        
        // Create exit doors (always at higher elevations)
        this.createExitDoor(-20, 2.1, -80);
        this.createExitDoor(20, 3.1, -120);
        this.createExitDoor(-15, 5.1, -150);
        
        // Create jumper doors
        this.createJumperDoor(0, 0.1, -45);
        this.createJumperDoor(-10, 0.1, -75);
        this.createJumperDoor(15, 0.1, -110);
        
        // Create trap door locations (traps will spawn here)
        this.createTrapLocation(5, 0, -35);
        this.createTrapLocation(-5, 0, -65);
        this.createTrapLocation(8, 0, -85);
        this.createTrapLocation(-8, 0, -105);
        this.createTrapLocation(0, 0, -130);
    }
    
    /**
     * Create a teleporter door
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    createTeleporterDoor(x, y, z) {
        const doorGeometry = new THREE.BoxGeometry(
            CONFIG.DOORS.TELEPORTER.WIDTH,
            CONFIG.DOORS.TELEPORTER.HEIGHT,
            CONFIG.DOORS.TELEPORTER.DEPTH
        );
        const doorMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.DOORS.TELEPORTER.COLOR,
            transparent: true,
            opacity: 0.7,
            emissive: CONFIG.DOORS.TELEPORTER.COLOR,
            emissiveIntensity: 0.5
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(x, y, z);
        
        this.teleporters.push(door);
        this.scene.add(door);
    }
    
    /**
     * Create an exit door
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    createExitDoor(x, y, z) {
        const doorGeometry = new THREE.BoxGeometry(
            CONFIG.DOORS.EXIT.WIDTH,
            CONFIG.DOORS.EXIT.HEIGHT,
            CONFIG.DOORS.EXIT.DEPTH
        );
        const doorMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.DOORS.EXIT.COLOR,
            transparent: true,
            opacity: 0.7,
            emissive: CONFIG.DOORS.EXIT.COLOR,
            emissiveIntensity: 0.5
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(x, y, z);
        
        this.exits.push(door);
        this.scene.add(door);
    }
    
    /**
     * Create a jumper door
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    createJumperDoor(x, y, z) {
        const doorGeometry = new THREE.BoxGeometry(
            CONFIG.DOORS.JUMPER.WIDTH,
            CONFIG.DOORS.JUMPER.HEIGHT,
            CONFIG.DOORS.JUMPER.DEPTH
        );
        const doorMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.DOORS.JUMPER.COLOR,
            transparent: true,
            opacity: 0.7,
            emissive: CONFIG.DOORS.JUMPER.COLOR,
            emissiveIntensity: 0.5
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(x, y, z);
        
        // Add a random direction vector for this jumper
        const angle = Utils.random(0, Math.PI * 2);
        door.userData.direction = new THREE.Vector3(
            Math.cos(angle),
            0.5, // Always some upward force
            Math.sin(angle)
        ).normalize();
        
        this.jumpers.push(door);
        this.scene.add(door);
    }
    
    /**
     * Create a trap door location
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    createTrapLocation(x, y, z) {
        // Store trap location for later spawning
        this.traps.push({
            position: new THREE.Vector3(x, y, z),
            active: false,
            mesh: null
        });
    }
    
    /**
     * Update trap doors - spawn and remove based on timing
     * @param {number} time - Current game time
     */
    updateTraps(time) {
        // Check if it's time to spawn a new trap
        if (time - this.lastTrapTime > CONFIG.GAME.TRAP_SPAWN_INTERVAL) {
            this.spawnRandomTrap();
            this.lastTrapTime = time;
        }
        
        // Update active traps
        for (let i = this.activeTraps.length - 1; i >= 0; i--) {
            const trap = this.activeTraps[i];
            
            // Remove trap if it's been active too long
            if (time - trap.spawnTime > CONFIG.GAME.TRAP_DURATION) {
                this.scene.remove(trap.mesh);
                this.activeTraps.splice(i, 1);
                
                // Mark trap location as inactive
                for (const location of this.traps) {
                    if (location.mesh === trap.mesh) {
                        location.active = false;
                        location.mesh = null;
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * Spawn a random trap door
     */
    spawnRandomTrap() {
        // Find inactive trap locations
        const inactiveTraps = this.traps.filter(trap => !trap.active);
        
        if (inactiveTraps.length === 0) return;
        
        // Select random trap location
        const trapIndex = Utils.randomInt(0, inactiveTraps.length - 1);
        const trap = inactiveTraps[trapIndex];
        
        // Create trap door mesh
        const doorGeometry = new THREE.BoxGeometry(
            CONFIG.DOORS.TRAP.WIDTH,
            CONFIG.DOORS.TRAP.HEIGHT,
            CONFIG.DOORS.TRAP.DEPTH
        );
        const doorMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.DOORS.TRAP.COLOR,
            transparent: true,
            opacity: 0.7,
            emissive: CONFIG.DOORS.TRAP.COLOR,
            emissiveIntensity: 0.5
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.copy(trap.position);
        door.position.y += CONFIG.DOORS.TRAP.HEIGHT / 2;
        
        // Mark trap as active
        trap.active = true;
        trap.mesh = door;
        
        // Add to active traps
        this.activeTraps.push({
            mesh: door,
            spawnTime: Date.now()
        });
        
        this.scene.add(door);
    }
    
    /**
     * Check for collisions with doors
     * @param {THREE.Object3D} player - Player object
     * @returns {Object} Collision result
     */
    checkCollisions(player) {
        const result = {
            teleported: false,
            jumped: false,
            trapped: false,
            jumpDirection: null
        };
        
        // Check teleporter collisions
        for (const teleporter of this.teleporters) {
            if (Utils.checkCollision(player, teleporter)) {
                // Find random exit door
                if (this.exits.length > 0) {
                    const exitIndex = Utils.randomInt(0, this.exits.length - 1);
                    const exit = this.exits[exitIndex];
                    
                    // Teleport player to exit
                    const exitPos = exit.position.clone();
                    exitPos.y += 2; // Teleport slightly above exit door
                    player.position.copy(exitPos);
                    
                    result.teleported = true;
                    return result;
                }
            }
        }
        
        // Check jumper collisions
        for (const jumper of this.jumpers) {
            if (Utils.checkCollision(player, jumper)) {
                result.jumped = true;
                result.jumpDirection = jumper.userData.direction.clone()
                    .multiplyScalar(CONFIG.DOORS.JUMPER.FORCE);
                return result;
            }
        }
        
        // Check trap collisions
        for (const trap of this.activeTraps) {
            if (Utils.checkCollision(player, trap.mesh)) {
                result.trapped = true;
                return result;
            }
        }
        
        return result;
    }
}
