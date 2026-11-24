// --- Multi-Tier Loot Goblin Event System ---
let goblinSpawner = null;

function spawnLootGoblin() {
  if (!isGameRunning || isFrozen) return;

  const isDiamond = Math.random() < 0.28; // 28% chance for rare Diamond Goblin
  let hp = isDiamond ? 2 : 1;
  const speed = isDiamond ? 10.5 : 7.5;
  const primaryColor = isDiamond ? '#00d2d3' : '#ffd32a';
  const accentColor = isDiamond ? '#54a0ff' : '#ffa502';

  const goblin = document.createElement('div');
  goblin.className = 'monster';
  goblin.style.width = isDiamond ? '50px' : '56px';
  goblin.style.height = isDiamond ? '50px' : '56px';
  goblin.style.zIndex = '28';
  goblin.style.filter = `drop-shadow(0 0 16px ${primaryColor})`;

  goblin.innerHTML = `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="52" r="38" fill="${primaryColor}" stroke="#fff" stroke-width="4"/>
    <polygon points="22,26 10,8 36,20" fill="${accentColor}"/>
    <polygon points="78,26 90,8 64,20" fill="${accentColor}"/>
    <circle cx="38" cy="46" r="6" fill="#000"/><circle cx="62" cy="46" r="6" fill="#000"/>
    <path d="M36 66 Q50 78 64 66" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>
    <text x="50" y="34" text-anchor="middle" font-size="20" font-weight="900" fill="#000">${isDiamond ? '💎' : '💰'}</text>
  </svg>`;

  const fromLeft = Math.random() < 0.5;
  let gx = fromLeft ? -60 : window.innerWidth + 10;
  const gy = 95 + Math.random() * (window.innerHeight - 210);
  const gvx = fromLeft ? speed : -speed;

  // Alert sound when a goblin enters the screen
  sfx.playTone(isDiamond ? 880 : 660, 'sine', 0.12, 0.1, isDiamond ? 1320 : 990);

  goblin.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if (!goblin.parentNode) return;

    hp--;
    if (hp > 0) {
      sfx.armorHit();
      goblin.style.filter = 'brightness(2.5) drop-shadow(0 0 20px #fff)';
      setTimeout(() => {
        if (goblin.parentNode) goblin.style.filter = `drop-shadow(0 0 16px ${primaryColor})`;
      }, 80);
      spawnParticles(e.clientX, e.clientY, primaryColor, 10);
      spawnFloatingText(e.clientX, e.clientY, 'CRACK! 1 MORE!', primaryColor);
      return;
    }

    // Goblin Captured!
    goblin.remove();
    sfx.powerup();
    triggerScreenShake();

    const timeBonus = isDiamond ? 4000 : 2000;
    const energyBonus = isDiamond ? 60 : 30;
    startTime = Math.min(performance.now(), startTime + timeBonus);
    if (typeof addEnergy === 'function') addEnergy(energyBonus);

    spawnParticles(e.clientX, e.clientY, primaryColor, isDiamond ? 35 : 22);
    spawnFloatingText(
      e.clientX,
      e.clientY,
      isDiamond ? '💎 -4.0s & +60⚡!' : '💰 -2.0s & +30⚡!',
      primaryColor
    );
  });

  playField.appendChild(goblin);

  let frameTick = 0;
  const moveGoblin = setInterval(() => {
    if (!goblin.parentNode || !isGameRunning) {
      clearInterval(moveGoblin);
      if (goblin.parentNode) goblin.remove();
      return;
    }

    if (!isFrozen) {
      gx += gvx;
      const currentY = gy + Math.sin(gx * 0.045) * 22;
      goblin.style.transform = `translate3d(${gx}px, ${currentY}px, 0)`;

      // Leave a sparkling coin/gem trail every 6 frames
      frameTick++;
      if (frameTick % 6 === 0) {
        spawnParticles(gx + 25, currentY + 25, primaryColor, 1);
      }
    }

    if (gx < -100 || gx > window.innerWidth + 100) {
      clearInterval(moveGoblin);
      goblin.remove();
    }
  }, 16);
}

// Start spawning Loot Goblins every 7.5 seconds during active hunts
setInterval(() => {
  if (isGameRunning && !isFrozen) {
    spawnLootGoblin();
  }
}, 7500);
