/**
 * Camera class - Handles camera movement and following the player
 */
class GameCamera {
    constructor(scene) {
        this.scene = scene;
        this.camera = null;
        this.target = null;
        this.offset = new THREE.Vector3(0, CONFIG.CAMERA.HEIGHT, CONFIG.CAMERA.FOLLOW_DISTANCE);
        this.createCamera();
    }
    
    /**
     * Create the game camera
     */
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            window.innerWidth / window.innerHeight,
            CONFIG.CAMERA.NEAR,
            CONFIG.CAMERA.FAR
        );
        
        // Set initial position
        this.camera.position.set(0, CONFIG.CAMERA.HEIGHT, CONFIG.CAMERA.FOLLOW_DISTANCE);
        this.camera.lookAt(0, 0, 0);
        
        // Add to scene
        this.scene.add(this.camera);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    /**
     * Set the target for the camera to follow
     * @param {THREE.Object3D} target - Target object
     */
    setTarget(target) {
        this.target = target;
    }
    
    /**
     * Update camera position to follow target
     */
    update() {
        if (!this.target) return;
        
        // Calculate desired camera position
        const targetPosition = this.target.position.clone();
        
        // Look ahead of the player in the direction they're moving
        const lookAheadOffset = new THREE.Vector3(
            0,
            0,
            CONFIG.CAMERA.LOOK_AHEAD
        );
        
        // Calculate desired camera position - fixed height
        const desiredPosition = new THREE.Vector3(
            targetPosition.x,
            targetPosition.y + CONFIG.CAMERA.HEIGHT,
            targetPosition.z + CONFIG.CAMERA.FOLLOW_DISTANCE
        );
        
        // Smoothly interpolate current camera position to desired position
        this.camera.position.lerp(desiredPosition, CONFIG.CAMERA.SMOOTHING);
        
        // Look at target plus look ahead offset
        const lookAtPosition = targetPosition.clone().add(lookAheadOffset);
        this.camera.lookAt(lookAtPosition);
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
    
    /**
     * Get the camera object
     * @returns {THREE.Camera} Camera object
     */
    getCamera() {
        return this.camera;
    }
    
    /**
     * Shake the camera for effect
     * @param {number} intensity - Shake intensity
     * @param {number} duration - Shake duration in ms
     */
    shake(intensity, duration) {
        const startTime = Date.now();
        const originalPosition = this.camera.position.clone();
        
        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < duration) {
                // Apply random offset to camera position
                this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
                this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity;
                this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
            } else {
                // Restore original position and clear interval
                this.camera.position.copy(originalPosition);
                clearInterval(shakeInterval);
            }
        }, 16); // ~60fps
    }
}
