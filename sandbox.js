// --- Custom Level & Raid Sandbox Studio (Create, Play & Share Custom Levels!) ---
const sandboxState = {
  active: false,
  config: {
    name: 'My Custom Raid',
    grunts: 20,
    speedsters: 12,
    tanks: 8,
    speedMult: 1.2,
    bossCount: 2,
    bossHp: 45,
    bossSize: 145,
    bossColor: '#ff4757',
    bossCloak: true,
    bossTeleport: false,
    bossSummon: true,
    bossShield: false
  },
  aiInterval: null,
  shielded: false
};

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🛠️ Level Sandbox" Button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const sbBtn = document.createElement('button');
    sbBtn.className = 'action-btn';
    sbBtn.innerHTML = '🛠️ Level & Raid Sandbox';
    sbBtn.style.cssText = 'background: linear-gradient(135deg, #1dd1a1, #10ac84); color: #07080c;';
    sbBtn.addEventListener('click', () => {
      syncSandboxInputsFromState();
      document.getElementById('sandbox-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(sbBtn);
    } else {
      startCard.appendChild(sbBtn);
    }
  }

  // 2. Build Custom Level & Raid Designer Modal
  const modal = document.createElement('div');
  modal.id = 'sandbox-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '146';
  modal.innerHTML = `
    <div class="card" style="max-width: 600px; max-height: 92vh; overflow-y: auto; text-align: left;">
      <h2 style="color: #1dd1a1; margin: 0 0 4px 0; font-size: 1.75rem; text-align: center;">🛠️ Level & Raid Sandbox</h2>
      <p class="subtitle" style="margin-bottom: 12px; text-align: center;">Design your own swarm & boss raid, then share the code with friends!</p>

      <div style="margin-bottom: 10px;">
        <label style="font-size:0.75rem; font-weight:900; color:#a4b0be;">LEVEL / RAID NAME</label>
        <input id="sb-name" type="text" maxlength="26" value="My Custom Raid" style="width:100%; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:#07080c; color:#fff; font-weight:800; margin-top:3px;"/>
      </div>

      <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px; margin-bottom:10px;">
        <div style="font-size:0.78rem; font-weight:900; color:#1dd1a1; margin-bottom:8px;">👾 SWARM COMPOSITION</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.78rem;">
          <div>🔴 Grunts: <b id="sb-val-grunts">20</b><input id="sb-grunts" type="range" min="0" max="80" value="20" style="width:100%;"/></div>
          <div>🟣 Speedsters: <b id="sb-val-speedsters">12</b><input id="sb-speedsters" type="range" min="0" max="60" value="12" style="width:100%;"/></div>
          <div>🟢 Armored Tanks: <b id="sb-val-tanks">8</b><input id="sb-tanks" type="range" min="0" max="40" value="8" style="width:100%;"/></div>
          <div>⚡ Swarm Speed: <b id="sb-val-speed">1.2x</b><input id="sb-speed" type="range" min="0.5" max="3.0" step="0.1" value="1.2" style="width:100%;"/></div>
        </div>
      </div>

      <div style="background:rgba(255,71,87,0.08); border:1px solid rgba(255,71,87,0.3); border-radius:10px; padding:10px; margin-bottom:12px;">
        <div style="font-size:0.78rem; font-weight:900; color:#ff6b81; margin-bottom:8px;">👹 RAID BOSS DESIGNER</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.78rem; margin-bottom:8px;">
          <div>👹 Boss Count: <b id="sb-val-bcount">2</b><input id="sb-bcount" type="range" min="0" max="5" value="2" style="width:100%;"/></div>
          <div>❤️ HP per Boss: <b id="sb-val-bhp">45</b><input id="sb-bhp" type="range" min="15" max="300" step="5" value="45" style="width:100%;"/></div>
          <div>📏 Boss Size: <b id="sb-val-bsize">145px</b><input id="sb-bsize" type="range" min="90" max="200" step="5" value="145" style="width:100%;"/></div>
          <div>🎨 Boss Aura Color: <input id="sb-bcolor" type="color" value="#ff4757" style="width:100%; height:26px; border:none; background:none; cursor:pointer;"/></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.76rem; color:#dfe4ea;">
          <label><input id="sb-cloak" type="checkbox" checked/> 👻 Cloak Invisibility</label>
          <label><input id="sb-teleport" type="checkbox"/> ⚡ Blink Teleport</label>
          <label><input id="sb-summon" type="checkbox" checked/> 👾 Summon Minions</label>
          <label><input id="sb-shield" type="checkbox"/> 🛡️ Reflective Shield</label>
        </div>
      </div>

      <div style="display:flex; gap:6px; margin-bottom:12px;">
        <input id="sb-code-box" type="text" placeholder="Paste friend's Level Code here..." style="flex:1; padding:7px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:#07080c; color:#ffd32a; font-size:0.75rem;"/>
        <button id="sb-load-code-btn" style="padding:7px 10px; border:none; border-radius:8px; background:#5352ed; color:#fff; font-weight:800; font-size:0.75rem; cursor:pointer;">Load Code</button>
        <button id="sb-copy-code-btn" style="padding:7px 10px; border:none; border-radius:8px; background:#ffa502; color:#07080c; font-weight:800; font-size:0.75rem; cursor:pointer;">📋 Share Code</button>
      </div>

      <div style="display:flex; gap:8px;">
        <button class="action-btn" id="sb-play-btn" style="flex:2; background:linear-gradient(135deg, #1dd1a1, #10ac84); color:#07080c;">▶ Play Custom Level!</button>
        <button class="action-btn" id="sb-close-btn" style="flex:1; background:rgba(255,255,255,0.12); color:#fff;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Live slider label updates
  const bindSlider = (id, labelId, suffix = '') => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      document.getElementById(labelId).textContent = `${el.value}${suffix}`;
    });
  };
  bindSlider('sb-grunts', 'sb-val-grunts');
  bindSlider('sb-speedsters', 'sb-val-speedsters');
  bindSlider('sb-tanks', 'sb-val-tanks');
  bindSlider('sb-speed', 'sb-val-speed', 'x');
  bindSlider('sb-bcount', 'sb-val-bcount');
  bindSlider('sb-bhp', 'sb-val-bhp');
  bindSlider('sb-bsize', 'sb-val-bsize', 'px');

  document.getElementById('sb-close-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('sb-copy-code-btn').addEventListener('click', () => {
    readSandboxInputsToState();
    const code = btoa(JSON.stringify(sandboxState.config));
    const box = document.getElementById('sb-code-box');
    box.value = code;
    navigator.clipboard?.writeText(code);
    const btn = document.getElementById('sb-copy-code-btn');
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Share Code'; }, 2000);
  });

  document.getElementById('sb-load-code-btn').addEventListener('click', () => {
    try {
      const raw = document.getElementById('sb-code-box').value.trim();
      const parsed = JSON.parse(atob(raw));
      Object.assign(sandboxState.config, parsed);
      syncSandboxInputsFromState();
      if (typeof sfx !== 'undefined') sfx.powerup();
    } catch (e) {
      alert('Invalid Level Code! Make sure you copied the whole code.');
    }
  });

  document.getElementById('sb-play-btn').addEventListener('click', () => {
    readSandboxInputsToState();
    modal.classList.add('hidden');
    startSandboxLevel();
  });
});
function readSandboxInputsToState() {
  const cfg = sandboxState.config;
  cfg.name = document.getElementById('sb-name').value.trim() || 'Custom Raid';
  cfg.grunts = parseInt(document.getElementById('sb-grunts').value) || 0;
  cfg.speedsters = parseInt(document.getElementById('sb-speedsters').value) || 0;
  cfg.tanks = parseInt(document.getElementById('sb-tanks').value) || 0;
  cfg.speedMult = parseFloat(document.getElementById('sb-speed').value) || 1.0;
  cfg.bossCount = parseInt(document.getElementById('sb-bcount').value) || 0;
  cfg.bossHp = parseInt(document.getElementById('sb-bhp').value) || 40;
  cfg.bossSize = parseInt(document.getElementById('sb-bsize').value) || 140;
  cfg.bossColor = document.getElementById('sb-bcolor').value || '#ff4757';
  cfg.bossCloak = document.getElementById('sb-cloak').checked;
  cfg.bossTeleport = document.getElementById('sb-teleport').checked;
  cfg.bossSummon = document.getElementById('sb-summon').checked;
  cfg.bossShield = document.getElementById('sb-shield').checked;
}

function syncSandboxInputsFromState() {
  const cfg = sandboxState.config;
  document.getElementById('sb-name').value = cfg.name;
  document.getElementById('sb-grunts').value = cfg.grunts;
  document.getElementById('sb-val-grunts').textContent = cfg.grunts;
  document.getElementById('sb-speedsters').value = cfg.speedsters;
  document.getElementById('sb-val-speedsters').textContent = cfg.speedsters;
  document.getElementById('sb-tanks').value = cfg.tanks;
  document.getElementById('sb-val-tanks').textContent = cfg.tanks;
  document.getElementById('sb-speed').value = cfg.speedMult;
  document.getElementById('sb-val-speed').textContent = `${cfg.speedMult}x`;
  document.getElementById('sb-bcount').value = cfg.bossCount;
  document.getElementById('sb-val-bcount').textContent = cfg.bossCount;
  document.getElementById('sb-bhp').value = cfg.bossHp;
  document.getElementById('sb-val-bhp').textContent = cfg.bossHp;
  document.getElementById('sb-bsize').value = cfg.bossSize;
  document.getElementById('sb-val-bsize').textContent = `${cfg.bossSize}px`;
  document.getElementById('sb-bcolor').value = cfg.bossColor;
  document.getElementById('sb-cloak').checked = cfg.bossCloak;
  document.getElementById('sb-teleport').checked = cfg.bossTeleport;
  document.getElementById('sb-summon').checked = cfg.bossSummon;
  document.getElementById('sb-shield').checked = cfg.bossShield;
}

function startSandboxLevel() {
  const cfg = sandboxState.config;
  if (cfg.grunts + cfg.speedsters + cfg.tanks + cfg.bossCount <= 0) {
    cfg.grunts = 10;
  }

  if (typeof sfx !== 'undefined') {
    sfx.init();
    sfx.startMusic(cfg.bossCount > 0);
  }

  sandboxState.active = true;
  sandboxState.shielded = false;

  if (typeof extraModes !== 'undefined') {
    extraModes.isEndless = false;
    extraModes.isPaused = false;
    clearInterval(extraModes.waveTimer);
  }
  if (typeof bossRushState !== 'undefined') bossRushState.active = false;
  if (typeof contractState !== 'undefined') contractState.active = false;

  startScreen.classList.add('hidden');
  victoryScreen.classList.add('hidden');
  milestoneToast.classList.remove('show');
  document.body.classList.remove('frozen');
  clearTimeout(freezeTimer);

  playField.innerHTML = '';
  monsters = [];
  totalClicks = 0;
  successfulHits = 0;
  combo = 1;
  maxCombo = 1;
  isFrozen = false;
  bossSpawned = cfg.bossCount > 0;

  comboDisplay.textContent = 'x1';
  startTime = performance.now();
  lastFrameTime = startTime;
  isGameRunning = true;

  // Spawn Custom Swarm
  const customDiff = {
    count: cfg.grunts + cfg.speedsters + cfg.tanks,
    minSpeed: 1.8 * cfg.speedMult,
    maxSpeed: 3.4 * cfg.speedMult
  };

  for (let i = 0; i < cfg.grunts; i++) spawnMonster(customDiff, 'grunt');
  for (let i = 0; i < cfg.speedsters; i++) spawnMonster(customDiff, 'speedster');
  for (let i = 0; i < cfg.tanks; i++) spawnMonster(customDiff, 'tank');

  // Spawn Custom Raid Bosses
  for (let b = 0; b < cfg.bossCount; b++) {
    const el = document.createElement('div');
    el.className = 'monster';
    el.style.width = `${cfg.bossSize}px`;
    el.style.height = `${cfg.bossSize}px`;
    el.style.filter = `drop-shadow(0 0 20px ${cfg.bossColor})`;
    el.innerHTML = getMonsterSVG('boss')
      .replace('#ff6b81', cfg.bossColor)
      .replace('#b33939', '#1e272e');

    const x = Math.random() * Math.max(40, window.innerWidth - cfg.bossSize);
    const y = 95 + Math.random() * Math.max(40, window.innerHeight - cfg.bossSize - 95);
    const angle = Math.random() * Math.PI * 2;
    const spd = 3.5 * cfg.speedMult;

    const bossObj = {
      el,
      type: 'boss',
      isSandboxBoss: true,
      hp: cfg.bossHp,
      maxHp: cfg.bossHp,
      size: cfg.bossSize,
      color: cfg.bossColor,
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd
    };

    el.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      spawnClickRing(e.clientX, e.clientY);
      handleMonsterClick(bossObj, e.clientX, e.clientY);
    });

    playField.appendChild(el);
    monsters.push(bossObj);
  }

  activeCount = monsters.length;
  counterDisplay.textContent = activeCount;
  spawnFloatingText(window.innerWidth / 2, 135, `🛠️ ${cfg.name.toUpperCase()}`, '#1dd1a1');

  if (cfg.bossCount > 0) {
    bossHud.classList.add('active');
    const labelSpan = bossHud.querySelector('.boss-label span');
    if (labelSpan) labelSpan.textContent = `🛠️ ${cfg.name.toUpperCase()}`;
    const totalHp = cfg.bossHp * cfg.bossCount;
    bossBarFill.style.width = '100%';
    bossHpText.textContent = `${totalHp} / ${totalHp}`;
    startSandboxBossAI(cfg);
  } else {
    bossHud.classList.remove('active');
  }

  requestAnimationFrame(gameLoop);
}

function startSandboxBossAI(cfg) {
  clearInterval(sandboxState.aiInterval);
  let tick = 0;

  sandboxState.aiInterval = setInterval(() => {
    if (!isGameRunning || !sandboxState.active) {
      clearInterval(sandboxState.aiInterval);
      return;
    }

    const bosses = monsters.filter(m => m.isSandboxBoss);
    if (bosses.length === 0) {
      clearInterval(sandboxState.aiInterval);
      return;
    }

    tick++;

    // Reflective Shield
    if (cfg.bossShield && tick % 6 === 0) {
      sandboxState.shielded = !sandboxState.shielded;
      bosses.forEach(b => {
        b.el.style.outline = sandboxState.shielded ? '5px solid #ffd32a' : 'none';
        b.el.style.borderRadius = '50%';
      });
    }

    // Cloak Invisibility
    if (cfg.bossCloak && tick % 7 === 0) {
      bosses.forEach(b => {
        b.el.style.opacity = '0.15';
        setTimeout(() => { if (b.el) b.el.style.opacity = '1'; }, 1300);
      });
    }

    // Blink Teleport
    if (cfg.bossTeleport && tick % 5 === 0) {
      bosses.forEach(b => {
        b.x = Math.random() * Math.max(40, window.innerWidth - b.size);
        b.y = 95 + Math.random() * Math.max(40, window.innerHeight - b.size - 95);
        spawnParticles(b.x + b.size / 2, b.y + b.size / 2, cfg.bossColor, 12);
      });
    }

    // Summon Minions
    if (cfg.bossSummon && tick % 8 === 0 && monsters.length < 40) {
      spawnMonster({ count: 1, minSpeed: 2.2, maxSpeed: 3.8 }, 'grunt');
      activeCount++;
      counterDisplay.textContent = activeCount;
    }
  }, 1000);
}

// Update Sandbox Boss HP Bar & Reflective Shield on Hit
const _sbOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  if (sandboxState.active && monster.isSandboxBoss && sandboxState.shielded) {
    if (typeof sfx !== 'undefined') sfx.armorHit();
    spawnFloatingText(clickX, clickY, '🛡️ SHIELDED!', '#ffd32a');
    return;
  }

  _sbOrigClick(monster, clickX, clickY);

  if (sandboxState.active && monster.isSandboxBoss) {
    const bosses = monsters.filter(m => m.isSandboxBoss);
    const curHp = bosses.reduce((s, b) => s + Math.max(0, b.hp), 0);
    const maxHp = bosses.reduce((s, b) => s + b.maxHp, 0);
    if (maxHp > 0) {
      bossBarFill.style.width = `${(curHp / maxHp) * 100}%`;
      bossHpText.textContent = `${curHp} / ${maxHp}`;
    }
  }
};

// Clear Sandbox Flag when Starting Standard Hunt
const _sbOrigStart = startGame;
startGame = function() {
  sandboxState.active = false;
  clearInterval(sandboxState.aiInterval);
  _sbOrigStart();
};
