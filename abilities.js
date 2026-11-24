// --- Weapon Arsenal, Golden Goblins & Boss Mechanics ---
const arsenal = {
  energy: 0,
  maxEnergy: 100,
  weapon: 'blaster', // 'blaster' | 'laser' | 'splash'
  isMouseDown: false,
  laserInterval: null,
  goblinTimer: null,
  bossAbilityTimer: null
};

// Inject Weapon Bar & Energy HUD cleanly
window.addEventListener('DOMContentLoaded', () => {
  const hudGroup = document.querySelector('.hud-group');
  if (hudGroup) {
    const energyStat = document.createElement('div');
    energyStat.className = 'hud-stat';
    energyStat.innerHTML = `⚡ <span id="energy-display" style="color:#00d2d3;">0%</span>`;
    hudGroup.insertBefore(energyStat, hudGroup.firstChild);
  }

  const weaponBar = document.createElement('div');
  weaponBar.id = 'weapon-bar';
  weaponBar.style.cssText = `
    position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 10px; z-index: 50; background: rgba(12,14,22,0.92);
    padding: 8px 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(6px);
  `;
  weaponBar.innerHTML = `
    <button class="w-btn active" data-w="blaster">[1] 🔫 Blaster</button>
    <button class="w-btn" data-w="laser">[2] 🔥 Rapid Laser <small>(Hold / 25⚡)</small></button>
    <button class="w-btn" data-w="splash">[3] 💥 Splash Blast <small>(35⚡)</small></button>
  `;
  document.body.appendChild(weaponBar);

  const style = document.createElement('style');
  style.textContent = `
    .w-btn {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
      color: #fff; padding: 8px 14px; border-radius: 8px; font-weight: 700;
      cursor: pointer; font-size: 0.85rem; transition: all 0.15s;
    }
    .w-btn.active {
      border-color: #00d2d3; background: rgba(0,210,211,0.22);
      box-shadow: 0 0 12px rgba(0,210,211,0.4);
    }
    .splash-ring {
      position: fixed; width: 150px; height: 150px; border-radius: 50%;
      border: 4px solid #ff9f43; background: rgba(255,159,67,0.2);
      transform: translate(-50%, -50%) scale(0.2); pointer-events: none; z-index: 39;
      animation: splashPop 0.35s ease-out forwards;
    }
    @keyframes splashPop {
      to { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.w-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectWeapon(btn.dataset.w);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === '1') selectWeapon('blaster');
    if (e.key === '2') selectWeapon('laser');
    if (e.key === '3') selectWeapon('splash');
  });

  // Hold-to-fire Rapid Laser support
  let cursorX = 0, cursorY = 0;
  window.addEventListener('mousemove', (e) => { cursorX = e.clientX; cursorY = e.clientY; });
  window.addEventListener('mousedown', (e) => {
    if (!isGameRunning) return;
    arsenal.isMouseDown = true;
    if (arsenal.weapon === 'splash') triggerSplashBlast(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', () => { arsenal.isMouseDown = false; });

  setInterval(() => {
    if (!isGameRunning || !arsenal.isMouseDown || arsenal.weapon !== 'laser') return;
    if (arsenal.energy < 4) {
      selectWeapon('blaster');
      return;
    }
    spendEnergy(4);
    spawnClickRing(cursorX, cursorY);
    sfx.playTone(750, 'sawtooth', 0.05, 0.08, 300);
    // Hit any monster under cursor
    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      if (cursorX >= m.x && cursorX <= m.x + m.size && cursorY >= m.y && cursorY <= m.y + m.size) {
        handleMonsterClick(m, cursorX, cursorY);
        break;
      }
    }
  }, 85);
});
function selectWeapon(w) {
  arsenal.weapon = w;
  document.querySelectorAll('.w-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.w === w);
  });
}

function addEnergy(amount) {
  arsenal.energy = Math.min(arsenal.maxEnergy, arsenal.energy + amount);
  const el = document.getElementById('energy-display');
  if (el) el.textContent = `${Math.round(arsenal.energy)}%`;
}

function spendEnergy(amount) {
  if (arsenal.energy < amount) return false;
  arsenal.energy -= amount;
  const el = document.getElementById('energy-display');
  if (el) el.textContent = `${Math.round(arsenal.energy)}%`;
  return true;
}

function triggerSplashBlast(x, y) {
  if (!spendEnergy(35)) {
    spawnFloatingText(x, y, 'NEED 35⚡!', '#ff4757');
    selectWeapon('blaster');
    return;
  }

  sfx.bomb();
  triggerScreenShake();

  const ring = document.createElement('div');
  ring.className = 'splash-ring';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 350);

  // Hit all monsters within 85px radius
  const hits = monsters.filter(m => {
    const cx = m.x + m.size / 2;
    const cy = m.y + m.size / 2;
    return Math.hypot(cx - x, cy - y) <= 85;
  });

  hits.forEach(m => handleMonsterClick(m, m.x + m.size / 2, m.y + m.size / 2));
}

// Hook into monster defeats to charge Energy
const _origDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  addEnergy(8 + Math.min(combo, 10));
  _origDefeat(monster, clickX, clickY);
};

// --- Golden Loot Goblins (-2.0s Time Bonus) ---
function spawnGoldenGoblin() {
  if (!isGameRunning) return;
  const goblin = document.createElement('div');
  goblin.className = 'monster';
  goblin.style.width = '54px';
  goblin.style.height = '54px';
  goblin.style.filter = 'drop-shadow(0 0 14px #ffd32a)';
  goblin.innerHTML = `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="52" r="38" fill="#ffd32a" stroke="#fff" stroke-width="4"/>
    <polygon points="22,26 10,8 36,20" fill="#ffa502"/>
    <polygon points="78,26 90,8 64,20" fill="#ffa502"/>
    <circle cx="38" cy="46" r="6" fill="#000"/><circle cx="62" cy="46" r="6" fill="#000"/>
    <path d="M36 66 Q50 78 64 66" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`;

  const fromLeft = Math.random() < 0.5;
  let gx = fromLeft ? -60 : window.innerWidth + 10;
  const gy = 100 + Math.random() * (window.innerHeight - 220);
  const gvx = fromLeft ? 7.5 : -7.5;

  goblin.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if (!goblin.parentNode) return;
    goblin.remove();
    sfx.powerup();
    addEnergy(30);
    // Shave 2.0 seconds off the timer!
    startTime = Math.min(performance.now(), startTime + 2000);
    spawnParticles(e.clientX, e.clientY, '#ffd32a', 25);
    spawnFloatingText(e.clientX, e.clientY, '-2.0s & +30⚡!', '#ffd32a');
  });

  playField.appendChild(goblin);

  const moveGoblin = setInterval(() => {
    if (!goblin.parentNode || !isGameRunning) {
      clearInterval(moveGoblin);
      if (goblin.parentNode) goblin.remove();
      return;
    }
    gx += gvx;
    goblin.style.transform = `translate3d(${gx}px, ${gy + Math.sin(gx * 0.05) * 18}px, 0)`;
    if (gx < -100 || gx > window.innerWidth + 100) {
      clearInterval(moveGoblin);
      goblin.remove();
    }
  }, 16);
}

// --- Overlord Boss Special Abilities (Minion Summon + Stealth Phase) ---
function startBackgroundLoops() {
  clearInterval(arsenal.goblinTimer);
  clearInterval(arsenal.bossAbilityTimer);

  arsenal.goblinTimer = setInterval(() => {
    if (isGameRunning && !isFrozen) spawnGoldenGoblin();
  }, 9500);

  arsenal.bossAbilityTimer = setInterval(() => {
    if (!isGameRunning || !bossSpawned || isFrozen) return;
    const boss = monsters.find(m => m.type === 'boss');
    if (!boss) return;

    if (Math.random() < 0.5) {
      // Ability 1: Stealth Cloak for 1.2s
      boss.el.style.opacity = '0.22';
      spawnFloatingText(boss.x + 40, boss.y, '👻 CLOAKED!', '#a55eea');
      setTimeout(() => { if (boss.el) boss.el.style.opacity = '1'; }, 1200);
    } else if (monsters.length < 5) {
      // Ability 2: Summon 2 Mini-Grunts
      spawnFloatingText(boss.x + 40, boss.y, '👾 MINIONS!', '#ff4757');
      const config = DIFFICULTIES[currentDiff];
      spawnMonster(config);
      spawnMonster(config);
      activeCount += 2;
    }
  }, 4200);
}

// Reset arsenal on every new game
const _origStart = startGame;
startGame = function() {
  arsenal.energy = 0;
  selectWeapon('blaster');
  const el = document.getElementById('energy-display');
  if (el) el.textContent = '0%';
  _origStart();
  startBackgroundLoops();
};

