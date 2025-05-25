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
        const objectBox = new THREE.Box3().setFromObject(object);
        
        for (const obstacle of this.map.obstacles) {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            
            if (objectBox.intersectsBox(obstacleBox)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Handle collision response between object and obstacles
     * @param {THREE.Object3D} object - Object to handle
     * @param {THREE.Vector3} velocity - Object velocity
     * @returns {THREE.Vector3} Updated velocity after collision
     */
    handleObstacleCollision(object, velocity) {
        const objectBox = new THREE.Box3().setFromObject(object);
        
        for (const obstacle of this.map.obstacles) {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            
            if (objectBox.intersectsBox(obstacleBox)) {
                // Calculate penetration depth in each direction
                const overlapX = Math.min(
                    objectBox.max.x - obstacleBox.min.x,
                    obstacleBox.max.x - objectBox.min.x
                );
                
                const overlapY = Math.min(
                    objectBox.max.y - obstacleBox.min.y,
                    obstacleBox.max.y - objectBox.min.y
                );
                
                const overlapZ = Math.min(
                    objectBox.max.z - obstacleBox.min.z,
                    obstacleBox.max.z - objectBox.min.z
                );
                
                // Find smallest overlap to determine collision normal
                if (overlapX < overlapY && overlapX < overlapZ) {
                    // X-axis collision
                    velocity.x = -velocity.x * CONFIG.PHYSICS.RESTITUTION;
                    
                    // Move object out of collision
                    if (object.position.x < obstacle.position.x) {
                        object.position.x -= overlapX;
                    } else {
                        object.position.x += overlapX;
                    }
                } else if (overlapY < overlapX && overlapY < overlapZ) {
                    // Y-axis collision
                    velocity.y = -velocity.y * CONFIG.PHYSICS.RESTITUTION;
                    
                    // Move object out of collision
                    if (object.position.y < obstacle.position.y) {
                        object.position.y -= overlapY;
                    } else {
                        object.position.y += overlapY;
                    }
                } else {
                    // Z-axis collision
                    velocity.z = -velocity.z * CONFIG.PHYSICS.RESTITUTION;
                    
                    // Move object out of collision
                    if (object.position.z < obstacle.position.z) {
                        object.position.z -= overlapZ;
                    } else {
                        object.position.z += overlapZ;
                    }
                }
            }
        }
        
        return velocity;
    }
    
    /**
     * Apply gravity to an object
     * @param {THREE.Vector3} velocity - Object velocity
     * @param {boolean} onGround - Whether object is on ground
     * @returns {THREE.Vector3} Updated velocity with gravity
     */
    applyGravity(velocity, onGround) {
        if (!onGround) {
            velocity.y -= CONFIG.PHYSICS.GRAVITY;
        }
        return velocity;
    }
    
    /**
     * Apply friction to an object
     * @param {THREE.Vector3} velocity - Object velocity
     * @returns {THREE.Vector3} Updated velocity with friction
     */
    applyFriction(velocity) {
        velocity.x *= CONFIG.PHYSICS.FRICTION;
        velocity.z *= CONFIG.PHYSICS.FRICTION;
        return velocity;
    }
}
