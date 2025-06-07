/**
 * Physics class - Handles physics calculations and collisions
 */
class Physics {
    constructor(scene, map) {
        this.scene = scene;
        this.map = map;
    }
    
    /**
     * Check if an object is on the ground
     * @param {THREE.Object3D} object - Object to check
     * @param {number} radius - Object radius
     * @returns {boolean} True if object is on ground
     */
    isOnGround(object, radius) {
        // Create a ray pointing downward from the object
        const raycaster = new THREE.Raycaster();
        const rayOrigin = object.position.clone();
        const rayDirection = new THREE.Vector3(0, -1, 0);
        
        raycaster.set(rayOrigin, rayDirection);
        
        // Get all intersections with the scene
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        // Check if any intersection is close enough to be considered "on ground"
        for (const intersection of intersects) {
            if (intersection.distance <= radius + 0.5) { // Increased tolerance
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check collision between object and obstacles
     * @param {THREE.Object3D} object - Object to check
     * @returns {boolean} True if collision detected
     */
    checkObstacleCollision(object) {
        try {
            const objectRadius = CONFIG.TIRE.RADIUS;
            const objectPosition = object.position.clone();
            
            // Check if map.mazeWalls exists and is iterable
            if (this.map && this.map.mazeWalls && Array.isArray(this.map.mazeWalls)) {
                // Check collisions with maze walls
                for (const wall of this.map.mazeWalls) {
                    const wallBox = new THREE.Box3().setFromObject(wall);
                    
                    // Create a sphere for the object
                    const objectSphere = new THREE.Sphere(objectPosition, objectRadius);
                    
                    // Check for collision between sphere and box
                    if (wallBox.intersectsSphere(objectSphere)) {
                        return true;
                    }
                }
            }
            
            return false;
        } catch (error) {
            console.error("Error in checkObstacleCollision:", error);
            return false;
        }
    }
    
    /**
     * Check if a point is inside a box with radius consideration
     * @param {THREE.Vector3} point - Point to check
     * @param {THREE.Box3} box - Box to check against
     * @param {number} radius - Radius to consider
     * @returns {boolean} True if point is in box
     */
    pointInBox(point, box, radius) {
        // Expand box by radius
        const expandedBox = box.clone();
        expandedBox.expandByScalar(radius);
        
        return expandedBox.containsPoint(point);
    }
    
    /**
     * Check if a point is inside a cone with radius consideration
     * @param {THREE.Vector3} point - Point to check
     * @param {THREE.Vector3} conePosition - Cone position
     * @param {number} coneRadius - Cone base radius
     * @param {number} coneHeight - Cone height
     * @returns {boolean} True if point is in cone
     */
    pointInCone(point, conePosition, coneRadius, coneHeight) {
        // Calculate horizontal distance from point to cone center
        const horizontalDistance = Math.sqrt(
            Math.pow(point.x - conePosition.x, 2) + 
            Math.pow(point.z - conePosition.z, 2)
        );
        
        // Check if point is within cone radius at its height
        const heightAboveCone = point.y - conePosition.y;
        if (heightAboveCone < 0 || heightAboveCone > coneHeight) {
            return false;
        }
        
        // Calculate radius at current height
        const radiusAtHeight = coneRadius * (1 - heightAboveCone / coneHeight);
        
        return horizontalDistance <= radiusAtHeight;
    }
    
    /**
     * Check if a point is inside an oriented box with radius consideration
     * @param {THREE.Vector3} point - Point to check
     * @param {THREE.Vector3} boxPosition - Box position
     * @param {THREE.Euler} boxRotation - Box rotation
     * @param {THREE.Vector3} boxScale - Box scale
     * @param {number} width - Box width
     * @param {number} height - Box height
     * @param {number} depth - Box depth
     * @param {number} radius - Radius to consider
     * @returns {boolean} True if point is in oriented box
     */
    pointInOrientedBox(point, boxPosition, boxRotation, boxScale, width, height, depth, radius) {
        // Transform point to box local space
        const localPoint = point.clone().sub(boxPosition);
        
        // Create rotation matrix from box rotation
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(boxRotation);
        
        // Apply inverse rotation to get point in box local space
        localPoint.applyMatrix4(new THREE.Matrix4().copy(rotationMatrix).invert());
        
        // Scale point to match box scale
        localPoint.divide(boxScale);
        
        // Check if point is inside box with radius consideration
        return (
            localPoint.x >= -width / 2 - radius && localPoint.x <= width / 2 + radius &&
            localPoint.y >= -height / 2 - radius && localPoint.y <= height / 2 + radius &&
            localPoint.z >= -depth / 2 - radius && localPoint.z <= depth / 2 + radius
        );
    }
    
    /**
     * Handle collision response between object and obstacles
     * @param {THREE.Object3D} object - Colliding object
     * @param {THREE.Vector3} velocity - Current velocity
     * @returns {THREE.Vector3} New velocity after collision
     */
    handleObstacleCollision(object, velocity) {
        try {
            // Create a copy of the velocity to modify
            const newVelocity = velocity.clone();
            
            // Check if map.mazeWalls exists and is iterable
            if (this.map && this.map.mazeWalls && Array.isArray(this.map.mazeWalls)) {
                // Handle collisions with maze walls
                for (const wall of this.map.mazeWalls) {
                    const wallBox = new THREE.Box3().setFromObject(wall);
                    const objectBox = new THREE.Box3().setFromObject(object);
                    
                    // Expand object box by a small amount for better collision detection
                    objectBox.expandByScalar(0.1);
                    
                    if (objectBox.intersectsBox(wallBox)) {
                        // Calculate penetration depth in each direction
                        const overlapX = Math.min(
                            objectBox.max.x - wallBox.min.x,
                            wallBox.max.x - objectBox.min.x
                        );
                        
                        const overlapY = Math.min(
                            objectBox.max.y - wallBox.min.y,
                            wallBox.max.y - objectBox.min.y
                        );
                        
                        const overlapZ = Math.min(
                            objectBox.max.z - wallBox.min.z,
                            wallBox.max.z - objectBox.min.z
                        );
                        
                        // Find smallest overlap to determine collision normal
                        if (overlapX < overlapY && overlapX < overlapZ) {
                            // X-axis collision - reduce bounce force by 75%
                            newVelocity.x = -newVelocity.x * (CONFIG.PHYSICS.RESTITUTION * 0.25);
                            
                            // Move object out of collision with minimal push
                            if (object.position.x < wall.position.x) {
                                object.position.x -= overlapX + 0.05; // Reduced from 0.1
                            } else {
                                object.position.x += overlapX + 0.05; // Reduced from 0.1
                            }
                        } else if (overlapY < overlapX && overlapY < overlapZ) {
                            // Y-axis collision - reduce bounce force by 75%
                            newVelocity.y = -newVelocity.y * (CONFIG.PHYSICS.RESTITUTION * 0.25);
                            
                            // Move object out of collision with minimal push
                            if (object.position.y < wall.position.y) {
                                object.position.y -= overlapY + 0.05; // Reduced from 0.1
                            } else {
                                object.position.y += overlapY + 0.05; // Reduced from 0.1
                            }
                        } else {
                            // Z-axis collision - reduce bounce force by 75%
                            newVelocity.z = -newVelocity.z * (CONFIG.PHYSICS.RESTITUTION * 0.25);
                            
                            // Move object out of collision with minimal push
                            if (object.position.z < wall.position.z) {
                                object.position.z -= overlapZ + 0.05; // Reduced from 0.1
                            } else {
                                object.position.z += overlapZ + 0.05; // Reduced from 0.1
                            }
                        }
                        
                        // Further reduce velocity after collision to minimize bouncing
                        newVelocity.multiplyScalar(0.5);
                        
                        // Check if player is on top of a wall and roll down if needed
                        this.checkAndRollOffWall(object, newVelocity);
                        
                        return newVelocity;
                    }
                }
            }
            
            return newVelocity;
        } catch (error) {
            console.error("Error in handleObstacleCollision:", error);
            return velocity.clone(); // Return original velocity if there's an error
        }
    }
    
    /**
     * Check if player is on top of a wall and roll them down if needed
     * @param {THREE.Object3D} object - Player object
     * @param {THREE.Vector3} velocity - Current velocity
     */
    checkAndRollOffWall(object, velocity) {
        try {
            if (!this.map || !this.map.mazeWalls) {
                return;
            }
            
            // Create a ray pointing downward from the object
            const raycaster = new THREE.Raycaster();
            const rayOrigin = object.position.clone();
            const rayDirection = new THREE.Vector3(0, -1, 0);
            
            raycaster.set(rayOrigin, rayDirection);
            
            // Check for intersections with maze walls
            const intersects = raycaster.intersectObjects(this.map.mazeWalls);
            
            // If object is on top of a wall (close intersection)
            if (intersects.length > 0 && intersects[0].distance < 2) {
                console.log("Player on wall from collision, applying roll-off force");
                
                // Apply a small horizontal force in a random direction to roll off
                const angle = Math.random() * Math.PI * 2;
                velocity.x += Math.cos(angle) * 0.1;
                velocity.z += Math.sin(angle) * 0.1;
                
                // Apply a small downward force
                velocity.y -= 0.05;
            }
        } catch (error) {
            console.error("Error checking wall position in physics:", error);
        }
    }
}
