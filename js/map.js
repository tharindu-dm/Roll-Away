/**
 * Map class - Handles the game map and maze generation
 */
class GameMap {
    constructor(scene) {
        this.scene = scene;
        this.mapMesh = null;
        this.goalMesh = null;
        this.mazeWalls = [];
        this.mazeSize = 15; // Size of maze (n x n)
        this.cellSize = 5; // Size of each cell in the maze
        this.wallHeight = 3; // Height of maze walls
        this.wallThickness = 0.5; // Thickness of maze walls
        this.maze = []; // 2D array representing the maze
        this.midpointMarker = null; // Marker for the midpoint bonus
        this.midpointReached = false; // Track if midpoint has been reached
        
        // Generate and create the maze
        this.generateMaze();
        this.createMap();
    }
    
    /**
     * Create the main game map with maze
     */
    createMap() {
        try {
            // Calculate the actual map size based on maze dimensions
            const mapSize = this.mazeSize * this.cellSize;
            CONFIG.MAP.WIDTH = mapSize;
            CONFIG.MAP.LENGTH = mapSize;
            
            // Create main map platform
            const mapGeometry = new THREE.BoxGeometry(
                mapSize, 
                1, 
                mapSize
            );
            const mapMaterial = new THREE.MeshPhongMaterial({ 
                color: CONFIG.MAP.BASE_COLOR,
                flatShading: true
            });
            this.mapMesh = new THREE.Mesh(mapGeometry, mapMaterial);
            this.mapMesh.position.set(0, -0.5, -mapSize / 2);
            this.mapMesh.receiveShadow = true;
            this.scene.add(this.mapMesh);
            
            console.log("Map base created successfully");
            
            // Add map edges to prevent falling off sides
            this.addMapEdges();
            
            // Create maze walls
            this.createMazeWalls();
            
            // Add goal area at the end of the maze
            this.addGoalArea();
            
            // Add midpoint marker for extra life
            this.addMidpointMarker();
            
            console.log("Map fully created");
        } catch (error) {
            console.error("Error creating map:", error);
        }
    }
    
    /**
     * Add edges to the map to prevent falling off
     */
    addMapEdges() {
        const mapSize = this.mazeSize * this.cellSize;
        
        const edgeGeometry = new THREE.BoxGeometry(
            mapSize, 
            CONFIG.MAP.EDGE_HEIGHT, 
            1
        );
        const edgeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        
        // Front edge (start) - slightly lower and transparent
        const frontEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        frontEdge.position.set(0, CONFIG.MAP.EDGE_HEIGHT / 4, 0);
        frontEdge.scale.set(1, 0.5, 1); // Half height
        this.scene.add(frontEdge);
        
        // Back edge (end)
        const backEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        backEdge.position.set(0, CONFIG.MAP.EDGE_HEIGHT / 2, -mapSize);
        this.scene.add(backEdge);
        
        // Left edge
        const leftEdgeGeometry = new THREE.BoxGeometry(
            1, 
            CONFIG.MAP.EDGE_HEIGHT, 
            mapSize
        );
        const leftEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
        leftEdge.position.set(
            -mapSize / 2, 
            CONFIG.MAP.EDGE_HEIGHT / 2, 
            -mapSize / 2
        );
        this.scene.add(leftEdge);
        
        // Right edge
        const rightEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
        rightEdge.position.set(
            mapSize / 2, 
            CONFIG.MAP.EDGE_HEIGHT / 2, 
            -mapSize / 2
        );
        this.scene.add(rightEdge);
    }
    
    /**
     * Generate a random maze using depth-first search algorithm
     */
    generateMaze() {
        // Initialize maze with all walls
        this.maze = [];
        for (let i = 0; i < this.mazeSize; i++) {
            this.maze[i] = [];
            for (let j = 0; j < this.mazeSize; j++) {
                this.maze[i][j] = {
                    visited: false,
                    walls: {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true
                    }
                };
            }
        }
        
        // Start at a random cell
        const startX = Math.floor(Math.random() * this.mazeSize);
        const startY = Math.floor(Math.random() * this.mazeSize);
        
        // Use depth-first search to carve paths
        this.dfsCarve(startX, startY);
        
        // Create entrance and exit
        // Entrance at top row
        const entranceX = Math.floor(Math.random() * this.mazeSize);
        this.maze[entranceX][0].walls.top = false;
        
        // Exit at bottom row
        const exitX = Math.floor(Math.random() * this.mazeSize);
        this.maze[exitX][this.mazeSize - 1].walls.bottom = false;
        
        // Add some random openings to make the maze less difficult (about 10% of walls)
        const totalWalls = this.mazeSize * this.mazeSize * 2; // Approximate number of internal walls
        const wallsToRemove = Math.floor(totalWalls * 0.1);
        
        for (let i = 0; i < wallsToRemove; i++) {
            const x = Math.floor(Math.random() * this.mazeSize);
            const y = Math.floor(Math.random() * this.mazeSize);
            const isHorizontal = Math.random() > 0.5;
            
            if (isHorizontal && y < this.mazeSize - 1) {
                // Remove horizontal wall (bottom of current cell)
                this.maze[x][y].walls.bottom = false;
                this.maze[x][y + 1].walls.top = false;
            } else if (!isHorizontal && x < this.mazeSize - 1) {
                // Remove vertical wall (right of current cell)
                this.maze[x][y].walls.right = false;
                this.maze[x + 1][y].walls.left = false;
            }
        }
    }
    
    /**
     * Depth-first search algorithm to carve maze paths
     * @param {number} x - Current cell x coordinate
     * @param {number} y - Current cell y coordinate
     */
    dfsCarve(x, y) {
        // Mark current cell as visited
        this.maze[x][y].visited = true;
        
        // Define possible directions (top, right, bottom, left)
        const directions = [
            { dx: 0, dy: -1, wall: 'top', oppositeWall: 'bottom' },
            { dx: 1, dy: 0, wall: 'right', oppositeWall: 'left' },
            { dx: 0, dy: 1, wall: 'bottom', oppositeWall: 'top' },
            { dx: -1, dy: 0, wall: 'left', oppositeWall: 'right' }
        ];
        
        // Shuffle directions for randomness
        this.shuffleArray(directions);
        
        // Try each direction
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            // Check if the new cell is valid and unvisited
            if (
                newX >= 0 && newX < this.mazeSize &&
                newY >= 0 && newY < this.mazeSize &&
                !this.maze[newX][newY].visited
            ) {
                // Remove walls between current cell and new cell
                this.maze[x][y].walls[dir.wall] = false;
                this.maze[newX][newY].walls[dir.oppositeWall] = false;
                
                // Recursively visit the new cell
                this.dfsCarve(newX, newY);
            }
        }
    }
    
    /**
     * Shuffle array in place (Fisher-Yates algorithm)
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * Create maze walls based on the generated maze
     */
    createMazeWalls() {
        const wallMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            flatShading: true
        });
        
        // Calculate offset to center the maze
        const mapSize = this.mazeSize * this.cellSize;
        const offsetX = -mapSize / 2 + this.cellSize / 2;
        const offsetZ = -this.cellSize / 2;
        
        // Create walls for each cell
        for (let i = 0; i < this.mazeSize; i++) {
            for (let j = 0; j < this.mazeSize; j++) {
                const cell = this.maze[i][j];
                const x = offsetX + i * this.cellSize;
                const z = offsetZ - j * this.cellSize;
                
                // Top wall (north)
                if (cell.walls.top) {
                    this.createWall(
                        x, 
                        z + this.cellSize / 2, 
                        this.cellSize, 
                        this.wallThickness,
                        wallMaterial
                    );
                }
                
                // Right wall (east)
                if (cell.walls.right) {
                    this.createWall(
                        x + this.cellSize / 2, 
                        z, 
                        this.wallThickness, 
                        this.cellSize,
                        wallMaterial
                    );
                }
                
                // Bottom wall (south) - only if at the edge of the maze
                if (cell.walls.bottom && j === this.mazeSize - 1) {
                    this.createWall(
                        x, 
                        z - this.cellSize / 2, 
                        this.cellSize, 
                        this.wallThickness,
                        wallMaterial
                    );
                }
                
                // Left wall (west) - only if at the edge of the maze
                if (cell.walls.left && i === 0) {
                    this.createWall(
                        x - this.cellSize / 2, 
                        z, 
                        this.wallThickness, 
                        this.cellSize,
                        wallMaterial
                    );
                }
            }
        }
    }
    
    /**
     * Create a single wall
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} width - Wall width
     * @param {number} depth - Wall depth
     * @param {THREE.Material} material - Wall material
     */
    createWall(x, z, width, depth, material) {
        const wallGeometry = new THREE.BoxGeometry(width, this.wallHeight, depth);
        const wall = new THREE.Mesh(wallGeometry, material);
        wall.position.set(x, this.wallHeight / 2, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        
        this.mazeWalls.push(wall);
        this.scene.add(wall);
    }
    
    /**
     * Add midpoint marker for extra life bonus
     */
    addMidpointMarker() {
        // Calculate the midpoint of the maze
        const mapSize = this.mazeSize * this.cellSize;
        const midX = 0; // Center of the maze
        const midZ = -mapSize / 2; // Middle of the maze
        
        // Create a distinctive marker
        const markerGeometry = new THREE.SphereGeometry(1, 16, 16);
        const markerMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.GAME.MIDPOINT_COLOR || 0xFFFFFF, // White (from config or default to white)
            emissive: CONFIG.GAME.MIDPOINT_COLOR || 0xFFFFFF,
            emissiveIntensity: 0.5
        });
        
        this.midpointMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.midpointMarker.position.set(midX, 1.5, midZ);
        
        // Add pulsing animation
        this.midpointMarker.userData = {
            originalScale: 1,
            pulseSpeed: 0.02,
            pulseDirection: 1
        };
        
        this.scene.add(this.midpointMarker);
    }
    
    /**
     * Add goal area at the end of the maze
     */
    addGoalArea() {
        // Calculate the position of the goal at the bottom of the maze
        const mapSize = this.mazeSize * this.cellSize;
        
        // Find the exit position (where the bottom wall is removed)
        let exitX = 0;
        for (let i = 0; i < this.mazeSize; i++) {
            if (!this.maze[i][this.mazeSize - 1].walls.bottom) {
                exitX = i;
                break;
            }
        }
        
        // Calculate the actual position
        const offsetX = -mapSize / 2 + this.cellSize / 2;
        const x = offsetX + exitX * this.cellSize;
        const z = -mapSize + this.cellSize / 2;
        
        // Create goal platform
        const goalGeometry = new THREE.BoxGeometry(this.cellSize, 0.2, this.cellSize);
        const goalMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.GAME.GOAL_COLOR,
            emissive: CONFIG.GAME.GOAL_COLOR,
            emissiveIntensity: 0.5
        });
        this.goalMesh = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goalMesh.position.set(x, 0.1, z);
        this.scene.add(this.goalMesh);
        
        // Add goal post markers
        const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
        const postMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.GAME.GOAL_COLOR 
        });
        
        const post1 = new THREE.Mesh(postGeometry, postMaterial);
        post1.position.set(x - this.cellSize / 3, 1.5, z);
        this.scene.add(post1);
        
        const post2 = new THREE.Mesh(postGeometry, postMaterial);
        post2.position.set(x + this.cellSize / 3, 1.5, z);
        this.scene.add(post2);
        
        // Add banner between posts
        const bannerGeometry = new THREE.BoxGeometry(this.cellSize, 0.5, 0.2);
        const bannerMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.GAME.GOAL_COLOR,
            emissive: CONFIG.GAME.GOAL_COLOR,
            emissiveIntensity: 0.3
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(x, 3, z);
        this.scene.add(banner);
    }
    
    /**
     * Update the midpoint marker animation
     */
    updateMidpointMarker() {
        if (this.midpointMarker && !this.midpointReached) {
            const userData = this.midpointMarker.userData;
            
            // Pulsing animation
            const scale = this.midpointMarker.scale.x;
            const newScale = scale + userData.pulseDirection * userData.pulseSpeed;
            
            // Reverse direction if reaching limits
            if (newScale > userData.originalScale * 1.3 || newScale < userData.originalScale * 0.7) {
                userData.pulseDirection *= -1;
            }
            
            // Apply new scale
            this.midpointMarker.scale.set(newScale, newScale, newScale);
        }
    }
    
    /**
     * Check if player has reached the midpoint
     * @param {THREE.Vector3} playerPosition - Player position
     * @returns {boolean} True if player reached midpoint for the first time
     */
    checkMidpointReached(playerPosition) {
        if (this.midpointReached || !this.midpointMarker) return false;
        
        // Create a bounding box for the midpoint marker
        const midpointBox = new THREE.Box3().setFromObject(this.midpointMarker);
        midpointBox.expandByScalar(1.5); // Make it easier to reach
        
        // Check if player is within the midpoint area
        if (midpointBox.containsPoint(playerPosition)) {
            this.midpointReached = true;
            
            // Hide the marker
            this.scene.remove(this.midpointMarker);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if player has reached the goal
     * @param {THREE.Vector3} playerPosition - Player position
     * @returns {boolean} True if player reached goal
     */
    checkGoalReached(playerPosition) {
        // Create a larger bounding box for the goal to make it easier to detect
        const goalBox = new THREE.Box3().setFromObject(this.goalMesh);
        goalBox.expandByScalar(1.5); // Expand the goal's bounding box for easier detection
        
        // Check if player is within the goal area
        const result = goalBox.containsPoint(playerPosition);
        
        // Log for debugging
        if (result) {
            console.log("Goal reached!");
        }
        
        return result;
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
        
        const mapSize = this.mazeSize * this.cellSize;
        
        // More generous boundaries
        const buffer = 5; // Buffer zone around map edges
        return (
            playerPosition.x > -mapSize / 2 - buffer &&
            playerPosition.x < mapSize / 2 + buffer &&
            playerPosition.z > -mapSize - buffer &&
            playerPosition.z < buffer &&
            playerPosition.y > -20 // More forgiving fall distance
        );
    }
    
    /**
     * Reset the maze for a new game
     */
    reset() {
        // Remove all existing maze walls
        for (const wall of this.mazeWalls) {
            this.scene.remove(wall);
        }
        this.mazeWalls = [];
        
        // Remove goal and midpoint marker
        if (this.goalMesh) {
            this.scene.remove(this.goalMesh);
        }
        
        if (this.midpointMarker) {
            this.scene.remove(this.midpointMarker);
        }
        
        // Reset midpoint reached flag
        this.midpointReached = false;
        
        // Generate a new maze
        this.generateMaze();
        
        // Create new maze walls
        this.createMazeWalls();
        
        // Add new goal area
        this.addGoalArea();
        
        // Add new midpoint marker
        this.addMidpointMarker();
    }
}
