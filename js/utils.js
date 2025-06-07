/**
 * Utility functions for the game
 */
const Utils = {
    /**
     * Generate a random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number between min and max
     */
    random: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer between min and max
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Check if two objects are colliding using bounding boxes
     * @param {THREE.Object3D} obj1 - First object
     * @param {THREE.Object3D} obj2 - Second object
     * @returns {boolean} True if objects are colliding
     */
    checkCollision: function(obj1, obj2) {
        // Create bounding boxes with a small buffer for more reliable collision detection
        const box1 = new THREE.Box3().setFromObject(obj1);
        const box2 = new THREE.Box3().setFromObject(obj2);
        
        // Expand the bounding boxes slightly for more reliable collision detection
        box1.expandByScalar(0.1);
        box2.expandByScalar(0.1);
        
        return box1.intersectsBox(box2);
    },
    
    /**
     * Calculate distance between two points in 3D space
     * @param {THREE.Vector3} point1 - First point
     * @param {THREE.Vector3} point2 - Second point
     * @returns {number} Distance between points
     */
    distance: function(point1, point2) {
        return point1.distanceTo(point2);
    },
    
    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * Create a helper arrow for debugging
     * @param {THREE.Vector3} origin - Origin point
     * @param {THREE.Vector3} direction - Direction vector
     * @param {number} length - Arrow length
     * @param {number} color - Arrow color
     * @returns {THREE.ArrowHelper} Arrow helper
     */
    createArrow: function(origin, direction, length, color) {
        return new THREE.ArrowHelper(
            direction.normalize(),
            origin,
            length,
            color,
            0.5,
            0.3
        );
    }
};
