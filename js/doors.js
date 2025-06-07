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
        this.spikeTraps = [];
        this.lavaAreas = [];
        this.lastTrapTime = 0;
        
        this.createDoors();
    }
    
    /**
     * Create all door types on the map
     */
    createDoors() {
        // Use default map size from config since the map might not be initialized yet
        const mapSize = CONFIG.MAP.WIDTH;
        const cellSize = 5; // Default cell size
        
        // Wait for the maze to be fully generated
        setTimeout(() => {
            try {
                // Get valid floor positions (not inside walls)
                const floorPositions = this.getValidFloorPositions();
                
                if (floorPositions.length === 0) {
                    console.error("No valid floor positions found for doors");
                    return;
                }
                
                console.log(`Found ${floorPositions.length} valid floor positions for doors`);
                
                // Create exactly 4 teleporter doors - distributed throughout the maze
                const teleporterCount = 4;
                for (let i = 0; i < teleporterCount; i++) {
                    if (floorPositions.length > 0) {
                        const posIndex = Math.floor(Math.random() * floorPositions.length);
                        const pos = floorPositions.splice(posIndex, 1)[0];
                        
                        // Ensure the position is valid and not inside a wall
                        if (this.isValidDoorPosition(pos.x, pos.z, CONFIG.DOORS.TELEPORTER.WIDTH)) {
                            this.createTeleporterDoor(pos.x, 0.1, pos.z);
                        }
                    }
                }
                
                // Create exit doors - these will be the teleport destinations
                // Place them at higher elevations
                const exitCount = 4; // Same as teleporter count
                for (let i = 0; i < exitCount; i++) {
                    if (floorPositions.length > 0) {
                        const posIndex = Math.floor(Math.random() * floorPositions.length);
                        const pos = floorPositions.splice(posIndex, 1)[0];
                        
                        // Ensure the position is valid and not inside a wall
                        if (this.isValidDoorPosition(pos.x, pos.z, CONFIG.DOORS.EXIT.WIDTH)) {
                            const y = Utils.random(3, 6); // Higher elevation
                            this.createExitDoor(pos.x, y, pos.z);
                        }
                    }
                }
                
                // Create exactly 2 jumper doors - distributed throughout the maze
                const jumperCount = 2;
                for (let i = 0; i < jumperCount; i++) {
                    if (floorPositions.length > 0) {
                        const posIndex = Math.floor(Math.random() * floorPositions.length);
                        const pos = floorPositions.splice(posIndex, 1)[0];
                        
                        // Ensure the position is valid and not inside a wall
                        if (this.isValidDoorPosition(pos.x, pos.z, CONFIG.DOORS.JUMPER.WIDTH)) {
                            this.createJumperDoor(pos.x, 0.1, pos.z);
                        }
                    }
                }
                
                // Create trap door locations (traps will spawn here)
                const trapCount = 5;
                for (let i = 0; i < trapCount; i++) {
                    if (floorPositions.length > 0) {
                        const posIndex = Math.floor(Math.random() * floorPositions.length);
                        const pos = floorPositions.splice(posIndex, 1)[0];
                        
                        // Ensure the position is valid and not inside a wall
                        if (this.isValidDoorPosition(pos.x, pos.z, CONFIG.DOORS.TRAP.WIDTH)) {
                            this.createTrapLocation(pos.x, 0, pos.z);
                        }
                    }
                }
                
                // Create spike traps (permanent hazards)
                const spikeCount = 3;
                for (let i = 0; i < spikeCount; i++) {
                    if (floorPositions.length > 0) {
                        const posIndex = Math.floor(Math.random() * floorPositions.length);
                        const pos = floorPositions.splice(posIndex, 1)[0];
                        
                        // Ensure the position is valid and not inside a wall
                        if (this.isValidDoorPosition(pos.x, pos.z, 2.5)) {
                            const size = Utils.random(1.5, 2.5);
                            this.createSpikeTrap(pos.x, 0, pos.z, size, size);
                        }
                    }
                }
                
                // Create lava areas (instant death) - smaller for maze
                const lavaCount = 2;
                for (let i = 0; i < lavaCount; i++) {
                    if (floorPositions.length > 0) {
                        const posIndex = Math.floor(Math.random() * floorPositions.length);
                        const pos = floorPositions.splice(posIndex, 1)[0];
                        
                        // Ensure the position is valid and not inside a wall
                        if (this.isValidDoorPosition(pos.x, pos.z, 3)) {
                            const width = Utils.random(2, 3);
                            const depth = Utils.random(2, 3);
                            this.createLavaArea(pos.x, -0.5, pos.z, width, depth);
                        }
                    }
                }
                
                console.log("All doors and hazards created successfully");
            } catch (error) {
                console.error("Error creating doors:", error);
            }
        }, 1000); // Wait 1 second for maze to be fully generated
    }
    
    /**
     * Check if a door position is valid (not inside or crossing a wall)
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} size - Size of the door
     * @returns {boolean} True if position is valid
     */
    isValidDoorPosition(x, z, size) {
        try {
            if (!window.game || !window.game.map || !window.game.map.mazeWalls) {
                return true; // If we can't check, assume it's valid
            }
            
            // Create a box representing the door
            const doorBox = new THREE.Box3();
            doorBox.min.set(x - size/2 - 0.5, 0, z - size/2 - 0.5);
            doorBox.max.set(x + size/2 + 0.5, 3, z + size/2 + 0.5);
            
            // Check if door box intersects with any maze wall
            for (const wall of window.game.map.mazeWalls) {
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (doorBox.intersectsBox(wallBox)) {
                    return false; // Door would intersect with a wall
                }
            }
            
            return true; // No intersections found
        } catch (error) {
            console.error("Error checking door position:", error);
            return true; // If there's an error, assume it's valid
        }
    }
    
    /**
     * Get valid floor positions that are not inside walls
     * @returns {Array} Array of valid positions {x, z}
     */
    getValidFloorPositions() {
        const positions = [];
        
        try {
            // Check if game and map are initialized
            if (!window.game || !window.game.map) {
                console.warn("Game or map not initialized yet");
                return this.getFallbackPositions();
            }
            
            const map = window.game.map;
            const mazeSize = map.mazeSize || 15;
            const cellSize = map.cellSize || 5;
            
            // Calculate the actual map size
            const mapSize = mazeSize * cellSize;
            
            // Create a raycaster to check for walls
            const raycaster = new THREE.Raycaster();
            
            // Sample positions throughout the maze
            for (let i = 0; i < 100; i++) {
                // Generate random position within the map
                const x = Utils.random(-mapSize / 2 + cellSize, mapSize / 2 - cellSize);
                const z = Utils.random(-mapSize + cellSize, -cellSize);
                
                // Check if position is not inside a wall
                const origin = new THREE.Vector3(x, 5, z); // Start from above
                const direction = new THREE.Vector3(0, -1, 0); // Look down
                
                raycaster.set(origin, direction);
                
                // Check for intersections with maze walls
                let isInsideWall = false;
                
                if (map.mazeWalls && Array.isArray(map.mazeWalls)) {
                    const intersects = raycaster.intersectObjects(map.mazeWalls);
                    isInsideWall = intersects.length > 0;
                }
                
                // If not inside a wall, add to valid positions
                if (!isInsideWall) {
                    positions.push({ x, z });
                }
            }
            
            return positions;
        } catch (error) {
            console.error("Error getting valid floor positions:", error);
            return this.getFallbackPositions();
        }
    }
    
    /**
     * Get fallback positions if maze is not available
     * @returns {Array} Array of fallback positions
     */
    getFallbackPositions() {
        const positions = [];
        const mapSize = CONFIG.MAP.WIDTH;
        
        // Generate some random positions
        for (let i = 0; i < 30; i++) {
            const x = Utils.random(-mapSize / 2 + 5, mapSize / 2 - 5);
            const z = Utils.random(-mapSize + 5, -5);
            positions.push({ x, z });
        }
        
        return positions;
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
        
        // Create a small platform under the exit door
        const platformGeometry = new THREE.BoxGeometry(
            CONFIG.DOORS.EXIT.WIDTH + 1,
            0.5,
            CONFIG.DOORS.EXIT.DEPTH + 1
        );
        const platformMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(0, -0.3, 0);
        door.add(platform);
        
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
        // Create basic door mesh first (for backward compatibility)
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
        // Make sure it has a significant upward component
        const angle = Utils.random(0, Math.PI * 2);
        door.userData.direction = new THREE.Vector3(
            Math.cos(angle) * 0.7,
            1.0, // Strong upward force
            Math.sin(angle) * 0.7
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
     * Create a spike trap (permanent hazard)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} width - Width of spike area
     * @param {number} depth - Depth of spike area
     */
    createSpikeTrap(x, y, z, width, depth) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        
        // Create base
        const baseGeometry = new THREE.BoxGeometry(width, 0.1, depth);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        group.add(base);
        
        // Create spikes
        const spikeCount = Math.floor(width * depth * 3);
        const spikeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x888888,
            shininess: 80
        });
        
        for (let i = 0; i < spikeCount; i++) {
            const spikeGeometry = new THREE.ConeGeometry(0.15, 0.8, 4);
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            
            // Position spike randomly within trap area
            spike.position.set(
                (Math.random() - 0.5) * width * 0.8,
                0.4, // Height above base
                (Math.random() - 0.5) * depth * 0.8
            );
            
            // Rotate spike to point upward
            spike.rotation.x = Math.PI;
            
            group.add(spike);
        }
        
        this.spikeTraps.push(group);
        this.scene.add(group);
    }
    
    /**
     * Create a lava area (instant death)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} width - Width of lava area
     * @param {number} depth - Depth of lava area
     */
    createLavaArea(x, y, z, width, depth) {
        // Create lava surface
        const lavaGeometry = new THREE.BoxGeometry(width, 0.5, depth);
        const lavaMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff4500, // Orange-red
            emissive: 0xff2000,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const lava = new THREE.Mesh(lavaGeometry, lavaMaterial);
        lava.position.set(x, y, z);
        
        this.lavaAreas.push(lava);
        this.scene.add(lava);
    }
    
    /**
     * Update trap doors - spawn and remove based on timing
     * @param {number} time - Current game time
     */
    updateTraps(time) {
        // Skip if game just started
        if (time - window.gameStartTime < 10000) {
            return;
        }
        
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
        // Skip if game just started
        if (Date.now() - window.gameStartTime < 10000) {
            return;
        }
        
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
            spawnTime: Date.now(),
            triggered: false // Track if this trap has already triggered
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
            spiked: false,
            lava: false,
            jumpDirection: null
        };
        
        // Skip collision checks if game just started
        if (Date.now() - window.gameStartTime < 3000) {
            return result;
        }
        
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
                    
                    // Check if player is on top of a wall after teleporting
                    this.checkAndFixWallPosition(player);
                    
                    result.teleported = true;
                    return result;
                }
            }
        }
        
        // Check jumper collisions
        for (const jumper of this.jumpers) {
            if (Utils.checkCollision(player, jumper)) {
                // Determine approach direction based on player's velocity
                const approachDirection = new THREE.Vector3();
                
                // Get the player's velocity (from global variable)
                if (window.playerVelocity) {
                    approachDirection.copy(window.playerVelocity);
                    approachDirection.y = 0; // Ignore vertical component for approach direction
                    approachDirection.normalize();
                }
                
                result.jumped = true;
                
                // Use half the original force
                const jumpForce = CONFIG.DOORS.JUMPER.FORCE;
                
                // Calculate jump direction based on approach direction
                const jumpDirection = jumper.userData.direction.clone();
                
                // If we have a valid approach direction, use it to influence the jump
                if (approachDirection && approachDirection.lengthSq() > 0) {
                    // Invert the approach direction to "bounce" the player
                    const bounceDirection = approachDirection.clone().negate();
                    
                    // Blend the bounce direction with the jumper's direction
                    // 70% jumper direction, 30% bounce direction
                    jumpDirection.multiplyScalar(0.7);
                    bounceDirection.multiplyScalar(0.3);
                    jumpDirection.add(bounceDirection);
                    jumpDirection.normalize();
                }
                
                // Apply the jump force
                result.jumpDirection = jumpDirection.multiplyScalar(jumpForce);
                
                return result;
            }
        }
        
        // Check trap collisions
        for (const trap of this.activeTraps) {
            if (Utils.checkCollision(player, trap.mesh)) {
                // Prevent multiple collisions with the same trap
                if (!trap.triggered) {
                    trap.triggered = true;
                    result.trapped = true;
                    return result;
                }
            }
        }
        
        // Check spike trap collisions
        for (const spikeTrap of this.spikeTraps) {
            if (Utils.checkCollision(player, spikeTrap)) {
                result.spiked = true;
                return result;
            }
        }
        
        // Check lava area collisions
        for (const lava of this.lavaAreas) {
            if (Utils.checkCollision(player, lava)) {
                result.lava = true;
                return result;
            }
        }
        
        return result;
    }
    
    /**
     * Check if player is on top of a wall and fix position if needed
     * @param {THREE.Object3D} player - Player object
     */
    checkAndFixWallPosition(player) {
        try {
            // Wait a short time to ensure the player has settled after teleporting
            setTimeout(() => {
                if (!window.game || !window.game.map || !window.game.map.mazeWalls) {
                    return;
                }
                
                // Create a ray pointing downward from the player
                const raycaster = new THREE.Raycaster();
                const rayOrigin = player.position.clone();
                const rayDirection = new THREE.Vector3(0, -1, 0);
                
                raycaster.set(rayOrigin, rayDirection);
                
                // Check for intersections with maze walls
                const intersects = raycaster.intersectObjects(window.game.map.mazeWalls);
                
                // If player is on top of a wall (close intersection)
                if (intersects.length > 0 && intersects[0].distance < 2) {
                    console.log("Player on wall, moving to floor");
                    
                    // Find the nearest floor position
                    const floorPosition = this.findNearestFloorPosition(player.position);
                    
                    if (floorPosition) {
                        // Move player to the floor position
                        player.position.copy(floorPosition);
                        player.position.y += 2; // Lift slightly above floor
                        
                        // Apply a small downward velocity
                        if (window.game && window.game.player) {
                            window.game.player.velocity.y = -0.1;
                        }
                        
                        // Show notification
                        if (window.game && window.game.ui) {
                            window.game.ui.showNotification("Moved to floor!");
                        }
                    }
                }
            }, 100);
        } catch (error) {
            console.error("Error checking wall position:", error);
        }
    }
    
    /**
     * Find the nearest floor position to the given position
     * @param {THREE.Vector3} position - Current position
     * @returns {THREE.Vector3|null} Nearest floor position or null if none found
     */
    findNearestFloorPosition(position) {
        try {
            if (!window.game || !window.game.map) {
                return null;
            }
            
            const map = window.game.map;
            const mazeSize = map.mazeSize || 15;
            const cellSize = map.cellSize || 5;
            
            // Calculate the actual map size
            const mapSize = mazeSize * cellSize;
            
            // Create a raycaster to check for floors
            const raycaster = new THREE.Raycaster();
            
            // Try positions in expanding circles around the current position
            const searchRadius = 5; // Maximum search radius
            const searchSteps = 8; // Number of directions to check
            
            for (let radius = 1; radius <= searchRadius; radius++) {
                for (let i = 0; i < searchSteps; i++) {
                    const angle = (i / searchSteps) * Math.PI * 2;
                    const x = position.x + Math.cos(angle) * radius;
                    const z = position.z + Math.sin(angle) * radius;
                    
                    // Check if this position is on the floor (not inside a wall)
                    const origin = new THREE.Vector3(x, position.y + 5, z); // Start from above
                    const direction = new THREE.Vector3(0, -1, 0); // Look down
                    
                    raycaster.set(origin, direction);
                    
                    // Check for intersections with maze walls
                    let isInsideWall = false;
                    
                    if (map.mazeWalls && Array.isArray(map.mazeWalls)) {
                        const intersects = raycaster.intersectObjects(map.mazeWalls);
                        isInsideWall = intersects.length > 0;
                    }
                    
                    // If not inside a wall, this is a valid floor position
                    if (!isInsideWall) {
                        return new THREE.Vector3(x, 1, z); // Return position at floor level
                    }
                }
            }
            
            // If no valid position found, return a fallback position
            return new THREE.Vector3(0, 1, 0);
        } catch (error) {
            console.error("Error finding nearest floor position:", error);
            return null;
        }
    }
    
    /**
     * Reset all doors for a new game
     */
    reset() {
        // Remove all existing doors
        for (const teleporter of this.teleporters) {
            this.scene.remove(teleporter);
        }
        this.teleporters = [];
        
        for (const exit of this.exits) {
            this.scene.remove(exit);
        }
        this.exits = [];
        
        for (const jumper of this.jumpers) {
            this.scene.remove(jumper);
        }
        this.jumpers = [];
        
        // Remove active traps
        for (const trap of this.activeTraps) {
            this.scene.remove(trap.mesh);
        }
        this.activeTraps = [];
        
        // Reset trap locations
        this.traps = [];
        
        // Remove spike traps
        for (const spikeTrap of this.spikeTraps) {
            this.scene.remove(spikeTrap);
        }
        this.spikeTraps = [];
        
        // Remove lava areas
        for (const lava of this.lavaAreas) {
            this.scene.remove(lava);
        }
        this.lavaAreas = [];
        
        // Create new doors
        this.createDoors();
    }
}
