// ===== SHOOTER GAME =====
const shooterCanvas = document.getElementById('shooterCanvas');
const shooterCtx = shooterCanvas.getContext('2d');

let shooterState = {
    player: { x: 400, y: 500, width: 30, height: 40, health: 100 },
    enemies: [],
    bullets: [],
    score: 0,
    ammo: 30,
    maxAmmo: 30,
    keys: {},
    mouseX: shooterCanvas.width / 2,
    mouseY: shooterCanvas.height / 2,
    gameRunning: false
};

// ===== PARKOUR GAME =====
const parkourCanvas = document.getElementById('parkourCanvas');
const parkourCtx = parkourCanvas.getContext('2d');

let parkourState = {
    player: { x: 100, y: 400, width: 25, height: 40, health: 100, velocityY: 0, velocityX: 0, jumping: false },
    platforms: [],
    coins: [],
    missiles: [],
    score: 0,
    keys: {},
    gameRunning: false,
    gravity: 0.6,
    scrollX: 0
};

// ===== MENU FUNCTIONS =====
function startShooter() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('shooterContainer').classList.remove('hidden');
    initShooterGame();
}

function startParkour() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('parkourContainer').classList.remove('hidden');
    initParkourGame();
}

function backToMenu() {
    shooterState.gameRunning = false;
    parkourState.gameRunning = false;
    document.getElementById('shooterContainer').classList.add('hidden');
    document.getElementById('parkourContainer').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
}

// ===== SHOOTER GAME FUNCTIONS =====
function initShooterGame() {
    shooterState.player = { x: 400, y: 500, width: 30, height: 40, health: 100 };
    shooterState.enemies = [];
    shooterState.bullets = [];
    shooterState.score = 0;
    shooterState.ammo = 30;
    shooterState.keys = {};
    shooterState.gameRunning = true;

    document.addEventListener('keydown', handleShooterKeyDown);
    document.addEventListener('keyup', handleShooterKeyUp);
    shooterCanvas.addEventListener('mousemove', handleMouseMove);
    shooterCanvas.addEventListener('click', shootBullet);

    spawnEnemiesShooter();
    gameLoopShooter();
}

function handleShooterKeyDown(e) {
    shooterState.keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'r') reloadAmmo();
    if (e.key === 'Escape') backToMenu();
}

function handleShooterKeyUp(e) {
    shooterState.keys[e.key.toLowerCase()] = false;
}

function handleMouseMove(e) {
    const rect = shooterCanvas.getBoundingClientRect();
    shooterState.mouseX = e.clientX - rect.left;
    shooterState.mouseY = e.clientY - rect.top;
}

function shootBullet() {
    if (shooterState.ammo > 0 && shooterState.gameRunning) {
        const dx = shooterState.mouseX - shooterState.player.x;
        const dy = shooterState.mouseY - shooterState.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        shooterState.bullets.push({
            x: shooterState.player.x,
            y: shooterState.player.y,
            vx: (dx / dist) * 7,
            vy: (dy / dist) * 7,
            radius: 5
        });
        shooterState.ammo--;
    }
}

function reloadAmmo() {
    shooterState.ammo = shooterState.maxAmmo;
}

function spawnEnemiesShooter() {
    for (let i = 0; i < 5; i++) {
        shooterState.enemies.push({
            x: Math.random() * (shooterCanvas.width - 40) + 20,
            y: Math.random() * 200 + 50,
            width: 40,
            height: 40,
            health: 1,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }
}

function updateShooterGame() {
    // Move player
    const moveSpeed = 4;
    if (shooterState.keys['a']) shooterState.player.x -= moveSpeed;
    if (shooterState.keys['d']) shooterState.player.x += moveSpeed;
    if (shooterState.keys['w']) shooterState.player.y -= moveSpeed;
    if (shooterState.keys['s']) shooterState.player.y += moveSpeed;

    // Boundaries
    shooterState.player.x = Math.max(0, Math.min(shooterCanvas.width - shooterState.player.width, shooterState.player.x));
    shooterState.player.y = Math.max(0, Math.min(shooterCanvas.height - shooterState.player.height, shooterState.player.y));

    // Update bullets
    for (let i = shooterState.bullets.length - 1; i >= 0; i--) {
        shooterState.bullets[i].x += shooterState.bullets[i].vx;
        shooterState.bullets[i].y += shooterState.bullets[i].vy;

        if (shooterState.bullets[i].x < 0 || shooterState.bullets[i].x > shooterCanvas.width ||
            shooterState.bullets[i].y < 0 || shooterState.bullets[i].y > shooterCanvas.height) {
            shooterState.bullets.splice(i, 1);
            continue;
        }

        // Check bullet-enemy collision
        for (let j = shooterState.enemies.length - 1; j >= 0; j--) {
            const enemy = shooterState.enemies[j];
            const dx = shooterState.bullets[i].x - (enemy.x + enemy.width / 2);
            const dy = shooterState.bullets[i].y - (enemy.y + enemy.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < shooterState.bullets[i].radius + 20) {
                shooterState.enemies.splice(j, 1);
                shooterState.bullets.splice(i, 1);
                shooterState.score += 10;
                break;
            }
        }
    }

    // Update enemies
    for (let i = 0; i < shooterState.enemies.length; i++) {
        shooterState.enemies[i].x += shooterState.enemies[i].vx;
        shooterState.enemies[i].y += shooterState.enemies[i].vy;

        // Bounce off walls
        if (shooterState.enemies[i].x < 0 || shooterState.enemies[i].x > shooterCanvas.width - 40) {
            shooterState.enemies[i].vx *= -1;
        }
        if (shooterState.enemies[i].y < 0 || shooterState.enemies[i].y > shooterCanvas.height - 40) {
            shooterState.enemies[i].vy *= -1;
        }

        // Check enemy-player collision
        if (checkRectCollision(shooterState.player, shooterState.enemies[i])) {
            shooterState.player.health -= 0.5;
            if (shooterState.player.health <= 0) {
                shooterState.gameRunning = false;
                alert(`Game Over! Final Score: ${shooterState.score}`);
                backToMenu();
            }
        }
    }

    // Spawn new enemies
    if (shooterState.enemies.length < 3 + Math.floor(shooterState.score / 50)) {
        shooterState.enemies.push({
            x: Math.random() * (shooterCanvas.width - 40) + 20,
            y: Math.random() * 150 + 20,
            width: 40,
            height: 40,
            health: 1,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3
        });
    }
}

function drawShooterGame() {
    shooterCtx.fillStyle = '#1a1a2e';
    shooterCtx.fillRect(0, 0, shooterCanvas.width, shooterCanvas.height);

    // Draw player
    shooterCtx.fillStyle = '#00ff00';
    shooterCtx.fillRect(shooterState.player.x, shooterState.player.y, shooterState.player.width, shooterState.player.height);

    // Draw aiming line
    shooterCtx.strokeStyle = '#00ff00';
    shooterCtx.beginPath();
    shooterCtx.moveTo(shooterState.player.x + 15, shooterState.player.y + 20);
    shooterCtx.lineTo(shooterState.mouseX, shooterState.mouseY);
    shooterCtx.stroke();

    // Draw bullets
    shooterCtx.fillStyle = '#ffff00';
    for (let bullet of shooterState.bullets) {
        shooterCtx.beginPath();
        shooterCtx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        shooterCtx.fill();
    }

    // Draw enemies
    shooterCtx.fillStyle = '#ff0000';
    for (let enemy of shooterState.enemies) {
        shooterCtx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // Update UI
    document.getElementById('shooterScore').textContent = shooterState.score;
    document.getElementById('playerHealth').textContent = Math.ceil(shooterState.player.health);
    document.getElementById('ammo').textContent = shooterState.ammo;
}

function gameLoopShooter() {
    if (shooterState.gameRunning) {
        updateShooterGame();
        drawShooterGame();
        requestAnimationFrame(gameLoopShooter);
    }
}

// ===== PARKOUR GAME FUNCTIONS =====
function initParkourGame() {
    parkourState.platforms = [];
    parkourState.coins = [];
    parkourState.missiles = [];
    parkourState.score = 0;
    parkourState.keys = {};
    parkourState.gameRunning = true;
    parkourState.scrollX = 0;

    generateParkourLevel();
    
    // Place player on first platform after level is generated
    const firstPlatform = parkourState.platforms[0];
    parkourState.player = { 
        x: firstPlatform.x + 20, 
        y: firstPlatform.y - 40, 
        width: 25, 
        height: 40, 
        health: 100, 
        velocityY: 0, 
        velocityX: 0, 
        jumping: false 
    };

    document.addEventListener('keydown', handleParkourKeyDown);
    document.addEventListener('keyup', handleParkourKeyUp);

    gameLoopParkour();
}

function handleParkourKeyDown(e) {
    parkourState.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (!parkourState.player.jumping) {
            parkourState.player.velocityY = -12;
            parkourState.player.jumping = true;
        }
    }
    if (e.key === 'Escape') backToMenu();
}

function handleParkourKeyUp(e) {
    parkourState.keys[e.key.toLowerCase()] = false;
}

function generateParkourLevel() {
    parkourState.platforms = [];
    parkourState.coins = [];
    parkourState.missiles = [];

    // Add ground/starting platform
    parkourState.platforms.push({ x: 0, y: 550, width: 150, height: 50 });

    // Second platform - positioned to be reachable with a good jump
    parkourState.platforms.push({ x: 180, y: 450, width: 130, height: 20 });

    // Generate more platforms ahead with reachability checks
    let lastPlatform = parkourState.platforms[parkourState.platforms.length - 1];
    
    for (let i = 0; i < 18; i++) {
        let platformFound = false;
        let attempts = 0;
        let newPlatform;
        
        // Keep trying until we find a reachable platform position
        while (!platformFound && attempts < 10) {
            const x = lastPlatform.x + 120 + Math.random() * 150; // Horizontal distance within jumping range
            const y = lastPlatform.y - 50 + Math.random() * 100; // Vertical distance reachable with jump
            const width = 100 + Math.random() * 80;
            
            newPlatform = { x, y, width, height: 20 };
            
            // Check if platform is reachable (horizontal distance and vertical drop/rise within limits)
            const horizontalDist = x - (lastPlatform.x + lastPlatform.width / 2);
            const verticalDist = lastPlatform.y - y;
            
            // Allow jumps up to 250 pixels horizontally and vertical drop/rise of 150 pixels
            if (horizontalDist > 30 && horizontalDist < 250 && verticalDist > -100 && verticalDist < 150) {
                platformFound = true;
            }
            
            attempts++;
        }
        
        if (platformFound) {
            parkourState.platforms.push(newPlatform);
            lastPlatform = newPlatform;
            
            // Add coins
            if (Math.random() > 0.5) {
                parkourState.coins.push({ 
                    x: newPlatform.x + newPlatform.width / 2, 
                    y: newPlatform.y - 40, 
                    radius: 8, 
                    collected: false 
                });
            }
            
            // Add missiles on some platforms
            if (Math.random() > 0.7) {
                parkourState.missiles.push({ 
                    x: newPlatform.x + newPlatform.width / 2, 
                    y: newPlatform.y - 30, 
                    vx: (Math.random() - 0.5) * 4, 
                    vy: (Math.random() - 0.5) * 2,
                    width: 15,
                    height: 8,
                    angle: 0
                });
            }
        }
    }
}

function updateParkourGame() {
    // Movement
    parkourState.player.velocityX = 0;
    if (parkourState.keys['a'] || parkourState.keys['arrowleft']) parkourState.player.velocityX = -5;
    if (parkourState.keys['d'] || parkourState.keys['arrowright']) parkourState.player.velocityX = 5;

    parkourState.player.x += parkourState.player.velocityX;
    parkourState.player.velocityY += parkourState.gravity;
    parkourState.player.y += parkourState.player.velocityY;

    // Check collision with platforms
    let isOnGround = false;
    for (let platform of parkourState.platforms) {
        if (checkRectCollision(parkourState.player, platform)) {
            // Landing on top of platform
            if (parkourState.player.velocityY >= 0 && parkourState.player.y + parkourState.player.height - parkourState.player.velocityY <= platform.y + 10) {
                parkourState.player.y = platform.y - parkourState.player.height;
                parkourState.player.velocityY = 0;
                parkourState.player.jumping = false;
                isOnGround = true;
            }
        }
    }

    // Update missiles
    for (let i = parkourState.missiles.length - 1; i >= 0; i--) {
        const missile = parkourState.missiles[i];
        
        missile.x += missile.vx;
        missile.y += missile.vy;
        missile.vy += 0.3; // Gravity on missiles
        missile.angle += 0.1;
        
        // Remove if off screen
        if (missile.x < -50 || missile.x > parkourCanvas.width + 50 || missile.y > parkourCanvas.height + 50) {
            parkourState.missiles.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (checkRectCollision(parkourState.player, missile)) {
            parkourState.player.health -= 15;
            parkourState.missiles.splice(i, 1);
        }
    }

    // Check coin collection
    for (let coin of parkourState.coins) {
        if (!coin.collected) {
            const dx = (parkourState.player.x + 12.5) - coin.x;
            const dy = (parkourState.player.y + 20) - coin.y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                coin.collected = true;
                parkourState.score += 10;
            }
        }
    }

    // Fall off screen
    if (parkourState.player.y > parkourCanvas.height) {
        parkourState.player.health = 0;
    }

    if (parkourState.player.health <= 0) {
        parkourState.gameRunning = false;
        alert(`Game Over! Distance: ${parkourState.score}m`);
        backToMenu();
    }

    // Scroll camera
    parkourState.scrollX = parkourState.player.x - 100;
}

function drawParkourGame() {
    parkourCtx.fillStyle = '#1a1a2e';
    parkourCtx.fillRect(0, 0, parkourCanvas.width, parkourCanvas.height);

    // Draw sky gradient
    const gradient = parkourCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#2a2a4e');
    gradient.addColorStop(1, '#1a1a2e');
    parkourCtx.fillStyle = gradient;
    parkourCtx.fillRect(0, 0, parkourCanvas.width, 300);

    // Draw platforms with shadow effect
    for (let platform of parkourState.platforms) {
        const screenX = platform.x - parkourState.scrollX;
        if (screenX > -platform.width && screenX < parkourCanvas.width) {
            // Platform shadow
            parkourCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            parkourCtx.fillRect(screenX, platform.y + platform.height + 3, platform.width, 5);
            
            // Platform with gradient
            const platGradient = parkourCtx.createLinearGradient(screenX, platform.y, screenX, platform.y + platform.height);
            platGradient.addColorStop(0, '#667eea');
            platGradient.addColorStop(1, '#4c4c99');
            parkourCtx.fillStyle = platGradient;
            parkourCtx.fillRect(screenX, platform.y, platform.width, platform.height);
            
            // Platform border
            parkourCtx.strokeStyle = '#88aaff';
            parkourCtx.lineWidth = 2;
            parkourCtx.strokeRect(screenX, platform.y, platform.width, platform.height);
        }
    }

    // Draw missiles
    for (let missile of parkourState.missiles) {
        const screenX = missile.x - parkourState.scrollX;
        const screenY = missile.y;
        
        parkourCtx.save();
        parkourCtx.translate(screenX, screenY);
        parkourCtx.rotate(missile.angle);
        
        // Missile body
        parkourCtx.fillStyle = '#ff4444';
        parkourCtx.fillRect(-missile.width / 2, -missile.height / 2, missile.width, missile.height);
        
        // Missile fire trail
        parkourCtx.fillStyle = '#ffaa00';
        parkourCtx.fillRect(-missile.width / 2 - 8, -missile.height / 2 + 2, 8, missile.height - 4);
        
        parkourCtx.restore();
    }

    // Draw coins
    parkourCtx.fillStyle = '#ffff00';
    for (let coin of parkourState.coins) {
        if (!coin.collected) {
            const screenX = coin.x - parkourState.scrollX;
            parkourCtx.beginPath();
            parkourCtx.arc(screenX, coin.y, coin.radius, 0, Math.PI * 2);
            parkourCtx.fill();
            
            // Coin shine
            parkourCtx.strokeStyle = '#ffff99';
            parkourCtx.lineWidth = 2;
            parkourCtx.beginPath();
            parkourCtx.arc(screenX, coin.y, coin.radius + 3, 0, Math.PI * 2);
            parkourCtx.stroke();
        }
    }

    // Draw player
    parkourCtx.fillStyle = '#00ff00';
    const playerScreenX = parkourState.player.x - parkourState.scrollX;
    parkourCtx.fillRect(playerScreenX, parkourState.player.y, parkourState.player.width, parkourState.player.height);
    
    // Player eyes
    parkourCtx.fillStyle = '#000000';
    parkourCtx.fillRect(playerScreenX + 5, parkourState.player.y + 10, 4, 4);
    parkourCtx.fillRect(playerScreenX + 16, parkourState.player.y + 10, 4, 4);

    // Update UI
    document.getElementById('parkourScore').textContent = Math.floor(parkourState.score / 10);
    document.getElementById('playerHealthParkour').textContent = parkourState.player.health;
}

function gameLoopParkour() {
    if (parkourState.gameRunning) {
        updateParkourGame();
        drawParkourGame();
        requestAnimationFrame(gameLoopParkour);
    }
}

// ===== COLLISION DETECTION =====
function checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}
