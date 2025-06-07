// Game variables
let scene, camera, renderer;
let ball, platforms = [], obstacles = [];
let score = 0;
let gameOver = false;
let platformSpeed = 0.2;
let platformSpawnInterval = 1500; // milliseconds
let lastPlatformTime = 0;
let clock = new THREE.Clock();

// Physics variables
let velocity = new THREE.Vector3(0, 0, 0);
const gravity = 0.01;
const jumpForce = 0.3;
const moveSpeed = 0.1;
const friction = 0.95;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    
    // Create the ball (player)
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 3, 0);
    ball.castShadow = true;
    scene.add(ball);
    
    // Create initial platform
    createPlatform(0, 0, 0, 10, 1, 10);
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // Start game loop
    animate();
}

// Create a platform
function createPlatform(x, y, z, width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown color
    const platform = new THREE.Mesh(geometry, material);
    platform.position.set(x, y, z);
    platform.receiveShadow = true;
    scene.add(platform);
    platforms.push(platform);
    return platform;
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Key states
const keyStates = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
    ' ': false
};

// Handle key down
function onKeyDown(event) {
    if (keyStates.hasOwnProperty(event.key)) {
        keyStates[event.key] = true;
    }
    
    // Restart game on space when game over
    if (gameOver && event.key === ' ') {
        restartGame();
    }
}

// Handle key up
function onKeyUp(event) {
    if (keyStates.hasOwnProperty(event.key)) {
        keyStates[event.key] = false;
    }
}

// Check if player is on ground
function isOnGround() {
    const ballPosition = ball.position.clone();
    ballPosition.y -= 0.5; // Check slightly below the ball
    
    for (const platform of platforms) {
        const platformBox = new THREE.Box3().setFromObject(platform);
        if (platformBox.containsPoint(ballPosition)) {
            return true;
        }
    }
    
    return false;
}

// Update game state
function update() {
    if (gameOver) return;
    
    const deltaTime = clock.getDelta();
    
    // Apply gravity
    velocity.y -= gravity;
    
    // Handle movement
    if ((keyStates.ArrowUp || keyStates.w) && isOnGround()) {
        velocity.y = jumpForce;
    }
    
    if (keyStates.ArrowLeft || keyStates.a) {
        velocity.x = -moveSpeed;
    }
    
    if (keyStates.ArrowRight || keyStates.d) {
        velocity.x = moveSpeed;
    }
    
    // Apply friction
    velocity.x *= friction;
    velocity.z *= friction;
    
    // Update ball position
    ball.position.add(velocity);
    
    // Check if ball fell off
    if (ball.position.y < -10) {
        endGame();
    }
    
    // Move platforms
    const now = Date.now();
    if (now - lastPlatformTime > platformSpawnInterval) {
        // Create new platform
        const z = -30;
        const x = Math.random() * 10 - 5;
        const width = 3 + Math.random() * 3;
        createPlatform(x, 0, z, width, 1, 3);
        lastPlatformTime = now;
        
        // Increase score
        updateScore(10);
    }
    
    // Move existing platforms
    for (let i = platforms.length - 1; i >= 0; i--) {
        platforms[i].position.z += platformSpeed;
        
        // Remove platforms that are too far
        if (platforms[i].position.z > 20) {
            scene.remove(platforms[i]);
            platforms.splice(i, 1);
        }
    }
    
    // Update camera to follow ball
    camera.position.x = ball.position.x;
    camera.lookAt(ball.position.x, ball.position.y, ball.position.z - 5);
}

// Update score
function updateScore(points) {
    score += points;
    document.getElementById('score-value').textContent = score;
}

// End game
function endGame() {
    gameOver = true;
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = `Final Score: ${score}`;
}

// Restart game
function restartGame() {
    // Reset game state
    score = 0;
    updateScore(0);
    gameOver = false;
    document.getElementById('game-over').style.display = 'none';
    
    // Reset ball position
    ball.position.set(0, 3, 0);
    velocity.set(0, 0, 0);
    
    // Remove all platforms except the first one
    for (let i = platforms.length - 1; i > 0; i--) {
        scene.remove(platforms[i]);
    }
    platforms.splice(1);
    
    // Reset platform position
    platforms[0].position.set(0, 0, 0);
    
    // Reset time
    lastPlatformTime = Date.now();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Start the game
init();
