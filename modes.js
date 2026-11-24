// --- Pause Menu, Endless Wave Rush Mode & Custom Crosshair Shop ---
const extraModes = {
  isPaused: false,
  pauseStartTime: 0,
  isEndless: false,
  wave: 1,
  waveTimer: null,
  maxOverrun: 45,
  selectedCrosshair: localStorage.getItem('monster_crosshair') || 'default',
  unlockedCrosshairs: JSON.parse(localStorage.getItem('monster_unlocked_ch')) || ['default']
};

const CROSSHAIR_CATALOG = [
  { id: 'default', name: '➕ Standard',      cost: 0,   color: '#ffffff', size: 22, style: 'classic' },
  { id: 'dot',     name: '🎯 Sniper Dot',    cost: 150, color: '#2ed573', size: 16, style: 'dot' },
  { id: 'plasma',  name: '☢️ Plasma Ring',   cost: 300, color: '#00d2d3', size: 32, style: 'ring' },
  { id: 'inferno', name: '🔥 Inferno Sight', cost: 500, color: '#ff4757', size: 36, style: 'inferno' },
  { id: 'royal',   name: '👑 Royal Gold',    cost: 850, color: '#ffd32a', size: 38, style: 'royal' }
];

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Pause Button into Top-Right HUD
  const hudGroup = document.querySelector('.hud-group');
  if (hudGroup) {
    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'pause-hud-btn';
    pauseBtn.title = 'Pause Game (ESC)';
    pauseBtn.textContent = '⏸️';
    pauseBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);
      color: white; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-size: 1.05rem;
    `;
    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePauseGame();
    });
    hudGroup.appendChild(pauseBtn);
  }

  // 2. Build Pause Overlay Modal
  const pauseModal = document.createElement('div');
  pauseModal.id = 'pause-modal';
  pauseModal.className = 'screen-overlay hidden';
  pauseModal.style.zIndex = '130';
  pauseModal.innerHTML = `
    <div class="card" style="max-width: 400px;">
      <h2 style="color: #ffa502; margin-bottom: 10px;">⏸️ Game Paused</h2>
      <p class="subtitle">Take a breather! Your timer is safely frozen.</p>
      <button class="action-btn" id="resume-btn" style="margin-bottom: 12px;">▶️ Resume Hunt</button>
      <button class="action-btn" id="quit-run-btn" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">🚪 Quit to Menu</button>
    </div>
  `;
  document.body.appendChild(pauseModal);

  document.getElementById('resume-btn').addEventListener('click', togglePauseGame);
  document.getElementById('quit-run-btn').addEventListener('click', () => {
    extraModes.isPaused = false;
    pauseModal.classList.add('hidden');
    abortToMenu();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isGameRunning) {
      togglePauseGame();
    }
  });

  // 3. Add Endless Wave Rush Mode Button & Crosshair Shop Button to Start Menu
  const startCard = document.querySelector('#start-screen .card');
  const startBtn = document.getElementById('start-btn');

  if (startCard && startBtn) {
    startBtn.textContent = '⚔️ Standard Hunt';

    const endlessBtn = document.createElement('button');
    endlessBtn.id = 'endless-start-btn';
    endlessBtn.className = 'action-btn';
    const bestWave = localStorage.getItem('monster_best_wave') || 1;
    endlessBtn.innerHTML = `🌊 Endless Wave Rush <small style="font-size:0.8rem;">(Best: Wave ${bestWave})</small>`;
    endlessBtn.style.cssText = 'margin-top: 10px; background: linear-gradient(135deg, #00d2d3, #01a3a4); color: #07080c;';
    endlessBtn.addEventListener('click', () => {
      extraModes.isEndless = true;
      startEndlessMode();
    });
    startBtn.insertAdjacentElement('afterend', endlessBtn);

    const chBtn = document.createElement('button');
    chBtn.className = 'action-btn';
    chBtn.innerHTML = '🎯 Crosshair Armory';
    chBtn.style.cssText = 'margin-top: 10px; background: linear-gradient(135deg, #a55eea, #8854d0); color: #fff; font-size: 1.05rem; padding: 13px;';
    chBtn.addEventListener('click', () => {
      renderCrosshairShop();
      document.getElementById('crosshair-modal').classList.remove('hidden');
    });
    startCard.appendChild(chBtn);
  }

  // 4. Build Custom Crosshair Shop Modal & Reticle Follower
  const chModal = document.createElement('div');
  chModal.id = 'crosshair-modal';
  chModal.className = 'screen-overlay hidden';
  chModal.style.zIndex = '126';
  chModal.innerHTML = `
    <div class="card" style="max-width: 520px;">
      <h2 style="color: #a55eea; margin: 0 0 6px 0; font-size: 1.8rem;">🎯 Crosshair Armory</h2>
      <p class="subtitle" style="margin-bottom: 14px;">Equip custom glowing reticles with your Coins!</p>
      <div id="ch-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; text-align: left;"></div>
      <button class="action-btn" id="close-ch-btn" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">Close</button>
    </div>
  `;
  document.body.appendChild(chModal);
  document.getElementById('close-ch-btn').addEventListener('click', () => chModal.classList.add('hidden'));

  const reticle = document.createElement('div');
  reticle.id = 'custom-reticle';
  reticle.style.cssText = 'position: fixed; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); display: none;';
  document.body.appendChild(reticle);

  window.addEventListener('mousemove', (e) => {
    if (extraModes.selectedCrosshair === 'default') return;
    reticle.style.left = `${e.clientX}px`;
    reticle.style.top = `${e.clientY}px`;
  });

  applyCrosshair(extraModes.selectedCrosshair);
});
// --- Pause & Quit Logic ---
function togglePauseGame() {
  if (!isGameRunning && !extraModes.isPaused) return;
  const pauseModal = document.getElementById('pause-modal');

  if (!extraModes.isPaused) {
    extraModes.isPaused = true;
    extraModes.pauseStartTime = performance.now();
    isGameRunning = false;
    if (typeof sfx !== 'undefined') sfx.stopMusic();
    pauseModal.classList.remove('hidden');
  } else {
    extraModes.isPaused = false;
    const pausedDuration = performance.now() - extraModes.pauseStartTime;
    startTime += pausedDuration;
    lastFrameTime = performance.now();
    isGameRunning = true;
    if (typeof sfx !== 'undefined') sfx.startMusic(bossSpawned);
    pauseModal.classList.add('hidden');
    requestAnimationFrame(gameLoop);
  }
}

function abortToMenu() {
  isGameRunning = false;
  extraModes.isEndless = false;
  clearInterval(extraModes.waveTimer);
  if (typeof sfx !== 'undefined') sfx.stopMusic();
  bossHud.classList.remove('active');
  playField.innerHTML = '';
  monsters = [];
  startScreen.classList.remove('hidden');
}

// --- Endless Wave Rush Mode ---
function startEndlessMode() {
  extraModes.isEndless = true;
  extraModes.wave = 1;
  clearInterval(extraModes.waveTimer);

  // Start a normal base game, then override into Endless Wave loop
  _modesOrigStart();
  counterDisplay.textContent = `${monsters.length} / ${extraModes.maxOverrun}`;
  spawnFloatingText(window.innerWidth / 2, 130, '🌊 WAVE 1 — SURVIVE!', '#00d2d3');

  extraModes.waveTimer = setInterval(() => {
    if (!isGameRunning || extraModes.isPaused || isFrozen) return;

    extraModes.wave++;
    const config = DIFFICULTIES[currentDiff];
    const spawnCount = Math.min(8 + extraModes.wave * 2, 22);

    if (typeof sfx !== 'undefined') sfx.milestone();
    spawnFloatingText(window.innerWidth / 2, 130, `🌊 WAVE ${extraModes.wave}!`, '#00d2d3');

    for (let i = 0; i < spawnCount; i++) {
      spawnMonster(config);
      // Scale speed slightly with wave number
      const newest = monsters[monsters.length - 1];
      if (newest) {
        const waveMult = 1 + extraModes.wave * 0.04;
        newest.vx *= waveMult;
        newest.vy *= waveMult;
      }
    }

    // Mini-Boss every 3rd wave
    if (extraModes.wave % 3 === 0) {
      spawnMonster({ ...config, bossHp: 8 + extraModes.wave * 2 }, 'boss');
      spawnFloatingText(window.innerWidth / 2, 165, '👹 MINI-BOSS INCOMING!', '#ff4757');
    }

    activeCount = monsters.length;
    counterDisplay.textContent = `${activeCount} / ${extraModes.maxOverrun}`;

    // Check Overrun Lose Condition
    if (activeCount >= extraModes.maxOverrun) {
      endEndlessOverrun();
    }
  }, 13000);
}

function endEndlessOverrun() {
  isGameRunning = false;
  extraModes.isEndless = false;
  clearInterval(extraModes.waveTimer);
  if (typeof sfx !== 'undefined') sfx.stopMusic();

  const finalSeconds = (performance.now() - startTime) / 1000;
  const accuracy = totalClicks > 0 ? Math.round((successfulHits / totalClicks) * 100) : 100;

  const savedWave = parseInt(localStorage.getItem('monster_best_wave')) || 1;
  const isNewRecord = extraModes.wave > savedWave;
  if (isNewRecord) {
    localStorage.setItem('monster_best_wave', extraModes.wave);
  }

  const endlessBtn = document.getElementById('endless-start-btn');
  if (endlessBtn) {
    endlessBtn.innerHTML = `🌊 Endless Wave Rush <small style="font-size:0.8rem;">(Best: Wave ${Math.max(extraModes.wave, savedWave)})</small>`;
  }

  // Reuse Victory Screen as Run Summary
  const titleEl = victoryScreen.querySelector('h2');
  if (titleEl) {
    titleEl.textContent = `Overrun on Wave ${extraModes.wave}!`;
    titleEl.style.color = '#00d2d3';
  }

  document.getElementById('final-time').textContent = `${finalSeconds.toFixed(1)}s`;
  document.getElementById('best-time').textContent = `Wave ${Math.max(extraModes.wave, savedWave)}`;
  document.getElementById('final-accuracy').textContent = `${accuracy}%`;
  document.getElementById('final-combo').textContent = `x${maxCombo}`;
  document.getElementById('new-record-badge').style.display = isNewRecord ? 'block' : 'none';
  document.getElementById('new-record-badge').textContent = '🏆 NEW HIGHEST WAVE! 🏆';

  victoryScreen.classList.remove('hidden');
}

// Keep HUD counter updated in Endless Mode & prevent standard win trigger
const _modesOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  if (!extraModes.isEndless) {
    _modesOrigDefeat(monster, clickX, clickY);
    return;
  }

  // Endless mode defeat handling
  combo++;
  if (combo > maxCombo) maxCombo = combo;
  comboDisplay.textContent = `x${combo}`;

  if (typeof sfx !== 'undefined') sfx.hit(combo);
  spawnParticles(clickX, clickY, monster.color, monster.type === 'boss' ? 35 : 14);
  spawnFloatingText(clickX, clickY, combo >= 5 ? `x${combo}!` : '+1', combo >= 5 ? '#ffa502' : '#fff');

  if (typeof addCoinsAndXP === 'function') addCoinsAndXP(monster.type === 'boss' ? 60 : 4, 8);
  if (typeof addEnergy === 'function') addEnergy(8);

  if (Math.random() < 0.12) spawnPowerupOrb(clickX, clickY);

  monster.el.remove();
  monsters = monsters.filter(m => m !== monster);
  activeCount = monsters.length;
  counterDisplay.textContent = `${activeCount} / ${extraModes.maxOverrun}`;
};

// Reset standard mode cleanly when clicking Standard Hunt
const _modesOrigStart = startGame;
startGame = function() {
  extraModes.isEndless = false;
  extraModes.isPaused = false;
  clearInterval(extraModes.waveTimer);
  const titleEl = victoryScreen.querySelector('h2');
  if (titleEl) {
    titleEl.textContent = 'Victory Achieved!';
    titleEl.style.color = 'var(--accent-green)';
  }
  const badge = document.getElementById('new-record-badge');
  if (badge) badge.textContent = '🏆 NEW BEST TIME! 🏆';
  _modesOrigStart();
};

// --- Custom Crosshair Shop Logic ---
function renderCrosshairShop() {
  const grid = document.getElementById('ch-grid');
  if (!grid) return;
  grid.innerHTML = '';

  CROSSHAIR_CATALOG.forEach(item => {
    const owned = extraModes.unlockedCrosshairs.includes(item.id);
    const equipped = extraModes.selectedCrosshair === item.id;
    const playerCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;
    const canAfford = playerCoins >= item.cost;

    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.05); border: 1px solid ${equipped ? '#a55eea' : 'rgba(255,255,255,0.12)'};
      border-radius: 12px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;
    `;
    card.innerHTML = `
      <div style="font-weight:800; font-size:0.95rem; color:${item.color}; margin-bottom:8px;">${item.name}</div>
      <button class="ch-action-btn" data-id="${item.id}" style="
        width:100%; padding:8px; border:none; border-radius:8px; font-weight:800; cursor:pointer;
        background:${equipped ? '#2ed573' : (owned ? '#a55eea' : (canAfford ? '#ffd32a' : 'rgba(255,255,255,0.1)'))};
        color:${equipped || (!owned && canAfford) ? '#07080c' : '#fff'};
      ">
        ${equipped ? '✅ EQUIPPED' : (owned ? 'Equip' : `Buy (${item.cost} 🪙)`)}
      </button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.ch-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = CROSSHAIR_CATALOG.find(c => c.id === id);
      const owned = extraModes.unlockedCrosshairs.includes(id);

      if (owned) {
        applyCrosshair(id);
        renderCrosshairShop();
      } else if (typeof shopState !== 'undefined' && shopState.coins >= item.cost) {
        shopState.coins -= item.cost;
        saveShopData();
        extraModes.unlockedCrosshairs.push(id);
        localStorage.setItem('monster_unlocked_ch', JSON.stringify(extraModes.unlockedCrosshairs));
        if (typeof sfx !== 'undefined') sfx.powerup();
        applyCrosshair(id);
        renderCrosshairShop();
      }
    });
  });
}

function applyCrosshair(id) {
  const item = CROSSHAIR_CATALOG.find(c => c.id === id) || CROSSHAIR_CATALOG[0];
  extraModes.selectedCrosshair = item.id;
  localStorage.setItem('monster_crosshair', item.id);

  const reticle = document.getElementById('custom-reticle');
  if (!reticle) return;

  if (item.id === 'default') {
    reticle.style.display = 'none';
    document.body.style.cursor = 'crosshair';
    return;
  }

  document.body.style.cursor = 'none';
  reticle.style.display = 'block';
  reticle.style.width = `${item.size}px`;
  reticle.style.height = `${item.size}px`;
  reticle.innerHTML = `<svg viewBox="0 0 40 40" width="100%" height="100%">
    <circle cx="20" cy="20" r="15" fill="none" stroke="${item.color}" stroke-width="2.5" stroke-dasharray="${item.id === 'royal' ? '6 4' : 'none'}"/>
    <circle cx="20" cy="20" r="3" fill="${item.color}"/>
    <line x1="20" y1="0" x2="20" y2="8" stroke="${item.color}" stroke-width="2"/>
    <line x1="20" y1="32" x2="20" y2="40" stroke="${item.color}" stroke-width="2"/>
    <line x1="0" y1="20" x2="8" y2="20" stroke="${item.color}" stroke-width="2"/>
    <line x1="32" y1="20" x2="40" y2="20" stroke="${item.color}" stroke-width="2"/>
  </svg>`;
}

