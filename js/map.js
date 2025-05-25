/**
 * Map class - Handles the game map and terrain
 */
class GameMap {
    constructor(scene) {
        this.scene = scene;
        this.mapMesh = null;
        this.goalMesh = null;
        this.obstacles = [];
        this.createMap();
    }
    
    /**
     * Create the main game map
     */
    createMap() {
        // Create main map platform
        const mapGeometry = new THREE.BoxGeometry(
            CONFIG.MAP.WIDTH, 
            1, 
            CONFIG.MAP.LENGTH
        );
        const mapMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.MAP.BASE_COLOR,
            flatShading: true
        });
        this.mapMesh = new THREE.Mesh(mapGeometry, mapMaterial);
        this.mapMesh.position.set(0, -0.5, -CONFIG.MAP.LENGTH / 2);
        this.mapMesh.receiveShadow = true;
        this.scene.add(this.mapMesh);
        
        // Add map edges to prevent falling off sides
        this.addMapEdges();
        
        // Add terrain features
        this.addTerrainFeatures();
        
        // Add goal area
        this.addGoalArea();
    }
    
    /**
     * Add edges to the map to prevent falling off
     */
    addMapEdges() {
        const edgeGeometry = new THREE.BoxGeometry(
            CONFIG.MAP.WIDTH, 
            CONFIG.MAP.EDGE_HEIGHT, 
            1
        );
        const edgeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333 
        });
        
        // Front edge (start)
        const frontEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        frontEdge.position.set(0, CONFIG.MAP.EDGE_HEIGHT / 2, 0);
        this.scene.add(frontEdge);
        
        // Back edge (end)
        const backEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        backEdge.position.set(0, CONFIG.MAP.EDGE_HEIGHT / 2, -CONFIG.MAP.LENGTH);
        this.scene.add(backEdge);
        
        // Left edge
        const leftEdgeGeometry = new THREE.BoxGeometry(
            1, 
            CONFIG.MAP.EDGE_HEIGHT, 
            CONFIG.MAP.LENGTH
        );
        const leftEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
        leftEdge.position.set(
            -CONFIG.MAP.WIDTH / 2, 
            CONFIG.MAP.EDGE_HEIGHT / 2, 
            -CONFIG.MAP.LENGTH / 2
        );
        this.scene.add(leftEdge);
        
        // Right edge
        const rightEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
        rightEdge.position.set(
            CONFIG.MAP.WIDTH / 2, 
            CONFIG.MAP.EDGE_HEIGHT / 2, 
            -CONFIG.MAP.LENGTH / 2
        );
        this.scene.add(rightEdge);
    }
    
    /**
     * Add terrain features like hills, ramps, etc.
     */
    addTerrainFeatures() {
        // Add some ramps
        this.addRamp(-15, -30, 10, 15, 2);
        this.addRamp(15, -60, 10, 15, 3);
        this.addRamp(0, -100, 20, 20, 4);
        
        // Add some platforms at different heights
        this.addPlatform(-20, -80, 10, 2, 10);
        this.addPlatform(20, -120, 10, 3, 10);
        this.addPlatform(-15, -150, 10, 5, 10);
        
        // Add some obstacles
        this.addObstacle(0, -40, 5, 3, 1);
        this.addObstacle(-10, -70, 3, 2, 3);
        this.addObstacle(10, -90, 4, 2, 2);
    }
    
    /**
     * Add a ramp to the map
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} width - Ramp width
     * @param {number} depth - Ramp depth
     * @param {number} height - Ramp height
     */
    addRamp(x, z, width, depth, height) {
        // Create custom geometry for ramp
        const rampGeometry = new THREE.BufferGeometry();
        
        // Define vertices for a ramp shape
        const vertices = new Float32Array([
            // Front face (triangle)
            -width/2, 0, depth/2,
            width/2, 0, depth/2,
            0, height, 0,
            
            // Back face (triangle)
            width/2, 0, -depth/2,
            -width/2, 0, -depth/2,
            0, height, 0,
            
            // Left face (triangle)
            -width/2, 0, -depth/2,
            -width/2, 0, depth/2,
            0, height, 0,
            
            // Right face (triangle)
            width/2, 0, depth/2,
            width/2, 0, -depth/2,
            0, height, 0,
            
            // Bottom face (rectangle)
            -width/2, 0, -depth/2,
            width/2, 0, -depth/2,
            width/2, 0, depth/2,
            
            -width/2, 0, -depth/2,
            width/2, 0, depth/2,
            -width/2, 0, depth/2
        ]);
        
        // Add vertices to geometry
        rampGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        rampGeometry.computeVertexNormals();
        
        // Create mesh
        const rampMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x777777,
            flatShading: true
        });
        const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
        ramp.position.set(x, 0, z);
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        
        this.scene.add(ramp);
    }
    
    /**
     * Add a platform to the map
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} width - Platform width
     * @param {number} height - Platform height
     * @param {number} depth - Platform depth
     */
    addPlatform(x, z, width, height, depth) {
        const platformGeometry = new THREE.BoxGeometry(width, height, depth);
        const platformMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x777777 
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(x, height / 2, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        
        this.scene.add(platform);
    }
    
    /**
     * Add an obstacle to the map
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} width - Obstacle width
     * @param {number} height - Obstacle height
     * @param {number} depth - Obstacle depth
     */
    addObstacle(x, z, width, height, depth) {
        const obstacleGeometry = new THREE.BoxGeometry(width, height, depth);
        const obstacleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444 
        });
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        obstacle.position.set(x, height / 2, z);
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        
        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
    }
    
    /**
     * Add goal area at the end of the map
     */
    addGoalArea() {
        const goalGeometry = new THREE.BoxGeometry(10, 0.2, 10);
        const goalMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.GAME.GOAL_COLOR,
            emissive: CONFIG.GAME.GOAL_COLOR,
            emissiveIntensity: 0.5
        });
        this.goalMesh = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goalMesh.position.set(0, 0.1, -CONFIG.MAP.LENGTH + 10);
        this.scene.add(this.goalMesh);
        
        // Add goal post markers
        const postGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
        const postMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.GAME.GOAL_COLOR 
        });
        
        const post1 = new THREE.Mesh(postGeometry, postMaterial);
        post1.position.set(-5, 2.5, -CONFIG.MAP.LENGTH + 10);
        this.scene.add(post1);
        
        const post2 = new THREE.Mesh(postGeometry, postMaterial);
        post2.position.set(5, 2.5, -CONFIG.MAP.LENGTH + 10);
        this.scene.add(post2);
        
        // Add banner between posts
        const bannerGeometry = new THREE.BoxGeometry(12, 1, 0.5);
        const bannerMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.GAME.GOAL_COLOR,
            emissive: CONFIG.GAME.GOAL_COLOR,
            emissiveIntensity: 0.3
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(0, 5, -CONFIG.MAP.LENGTH + 10);
        this.scene.add(banner);
    }
    
    /**
     * Check if player has reached the goal
     * @param {THREE.Vector3} playerPosition - Player position
     * @returns {boolean} True if player reached goal
     */
    checkGoalReached(playerPosition) {
        const goalBox = new THREE.Box3().setFromObject(this.goalMesh);
        return goalBox.containsPoint(playerPosition);
    }
    
    /**
     * Check if player is on the map
     * @param {THREE.Vector3} playerPosition - Player position
     * @returns {boolean} True if player is on map
     */
    isOnMap(playerPosition) {
        // Always return true for the first 5 seconds to prevent immediate game over
        if (Date.now() - window.gameStartTime < 5000) {
            return true;
        }
        
        return (
            playerPosition.x > -CONFIG.MAP.WIDTH / 2 &&
            playerPosition.x < CONFIG.MAP.WIDTH / 2 &&
            playerPosition.z > -CONFIG.MAP.LENGTH &&
            playerPosition.z < 0 &&
            playerPosition.y > -30 // Much more forgiving fall distance
        );
    }
}
