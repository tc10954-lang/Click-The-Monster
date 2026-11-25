// --- RPG Hunter Classes & SPACEBAR Class Ultimates ---
const classState = {
  selected: localStorage.getItem('monster_rpg_class') || 'berserker',
  ultCooldownUntil: 0,
  ultActiveUntil: 0,
  ultInterval: null
};

const HUNTER_CLASSES = [
  {
    id: 'berserker',
    icon: '⚔️',
    name: 'Berserker',
    color: '#ff4757',
    passiveDesc: '+20% Crit Chance & +1 Bonus Damage on every click',
    ultName: 'Bloodlust Whirlwind',
    ultDesc: 'SPACEBAR: Auto-slashes all monsters near your cursor for 5s (25s CD)',
    cooldownMs: 25000
  },
  {
    id: 'arcanist',
    icon: '🧙‍♂️',
    name: 'Arcanist',
    color: '#00d2d3',
    passiveDesc: '+50% Energy (⚡) Gain & +35% Splash Blast Radius',
    ultName: 'Arcane Cataclysm',
    ultDesc: 'SPACEBAR: Freezes all enemies for 3s & blasts the arena for 4 DMG (28s CD)',
    cooldownMs: 28000
  },
  {
    id: 'rogue',
    icon: '🥷',
    name: 'Shadow Rogue',
    color: '#a55eea',
    passiveDesc: '+40% Coin Drops & +0.5s Extra Time Shave on Goblins',
    ultName: 'Phantom Clones',
    ultDesc: 'SPACEBAR: Summons 2 Shadow Cursors that hunt automatically for 7s (26s CD)',
    cooldownMs: 26000
  }
];

function getActiveClass() {
  return HUNTER_CLASSES.find(c => c.id === classState.selected) || HUNTER_CLASSES.at(0);
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Inline Class Selector Strip on Start Screen
  const startCard = document.querySelector('#start-screen .card');
  const startBtn = document.getElementById('start-btn');

  if (startCard && startBtn) {
    const box = document.createElement('div');
    box.id = 'rpg-class-selector';
    box.style.cssText = `
      background: rgba(0, 0, 0, 0.38); border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px; padding: 8px 10px; margin-bottom: 10px; text-align: left;
    `;
    box.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <span style="font-size:0.74rem; font-weight:900; color:#ffd32a;">🎭 RPG HUNTER CLASS</span>
        <span id="class-ult-hint" style="font-size:0.68rem; color:#a4b0be;">[SPACEBAR] Ultimate</span>
      </div>
      <div id="class-btn-row" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-bottom:5px;"></div>
      <div id="class-desc-label" style="font-size:0.7rem; color:#dfe4ea; line-height:1.25;"></div>
    `;
    startCard.insertBefore(box, startBtn);
    renderClassSelector();
  }

  // 2. Inject Live Bottom-Right SPACEBAR Ultimate HUD Indicator
  const ultHud = document.createElement('div');
  ultHud.id = 'class-ult-hud';
  ultHud.style.cssText = `
    position: fixed; bottom: 14px; right: 16px; display: none;
    background: rgba(10, 12, 20, 0.88); border: 2px solid #ffd32a;
    padding: 7px 14px; border-radius: 12px; z-index: 45;
    font-size: 0.8rem; font-weight: 900; color: #fff; cursor: pointer;
    box-shadow: 0 0 15px rgba(255, 211, 42, 0.35);
  `;
  ultHud.addEventListener('click', triggerClassUltimate);
  document.body.appendChild(ultHud);
});

function renderClassSelector() {
  const row = document.getElementById('class-btn-row');
  const descEl = document.getElementById('class-desc-label');
  if (!row) return;

  const cur = getActiveClass();
  if (descEl) {
    descEl.innerHTML = `<b style="color:${cur.color};">${cur.passiveDesc}</b><br><span style="color:#a4b0be;">${cur.ultDesc}</span>`;
  }

  row.innerHTML = HUNTER_CLASSES.map(c => {
    const active = c.id === classState.selected;
    return `
      <button type="button" class="pick-class-btn" data-id="${c.id}" style="
        background: ${active ? `${c.color}33` : 'rgba(255,255,255,0.05)'};
        border: 1.5px solid ${active ? c.color : 'rgba(255,255,255,0.14)'};
        border-radius: 8px; padding: 6px 4px; color: #fff; font-weight: 900;
        font-size: 0.76rem; cursor: pointer;
      ">${c.icon} ${c.name}</button>
    `;
  }).join('');

  row.querySelectorAll('.pick-class-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      classState.selected = btn.dataset.id;
      localStorage.setItem('monster_rpg_class', classState.selected);
      renderClassSelector();
    });
  });
}

// SPACEBAR Trigger for Class Ultimate
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && isGameRunning) {
    e.preventDefault();
    triggerClassUltimate();
  }
});

function triggerClassUltimate() {
  if (!isGameRunning) return;
  const now = performance.now();
  if (now < classState.ultCooldownUntil) return;

  const cls = getActiveClass();
  classState.ultCooldownUntil = now + cls.cooldownMs;
  if (typeof sfx !== 'undefined') sfx.victory();
  triggerScreenShake();
  spawnFloatingText(window.innerWidth / 2, 130, `${cls.icon} ${cls.ultName.toUpperCase()}!`, cls.color);

  clearInterval(classState.ultInterval);

  if (cls.id === 'berserker') {
    // 5 seconds of rapid whirlwind slashes around cursor
    let ticks = 0;
    classState.ultInterval = setInterval(() => {
      ticks++;
      if (!isGameRunning || ticks > 35) { clearInterval(classState.ultInterval); return; }
      const cx = typeof mousePos !== 'undefined' ? mousePos.x : window.innerWidth / 2;
      const cy = typeof mousePos !== 'undefined' ? mousePos.y : window.innerHeight / 2;
      spawnParticles(cx, cy, '#ff4757', 6);
      [...monsters].forEach(m => {
        const mx = m.x + m.size / 2;
        const my = m.y + m.size / 2;
        if (Math.hypot(mx - cx, my - cy) <= 135) {
          handleMonsterClick(m, mx, my);
        }
      });
    }, 140);
  } else if (cls.id === 'arcanist') {
    // Freeze + 4 DMG to entire screen
    isFrozen = true;
    document.body.classList.add('frozen');
    setTimeout(() => { isFrozen = false; document.body.classList.remove('frozen'); }, 3000);
    [...monsters].forEach(m => {
      const mx = m.x + m.size / 2;
      const my = m.y + m.size / 2;
      spawnParticles(mx, my, '#00d2d3', 14);
      for (let d = 0; d < 4; d++) {
        if (monsters.includes(m)) handleMonsterClick(m, mx, my);
      }
    });
  } else if (cls.id === 'rogue') {
    // 2 Shadow Clones hunt random monsters for 7 seconds
    let ticks = 0;
    classState.ultInterval = setInterval(() => {
      ticks++;
      if (!isGameRunning || ticks > 28) { clearInterval(classState.ultInterval); return; }
      for (let c = 0; c < 2; c++) {
        if (monsters.length === 0) break;
        const t = monsters.at(Math.floor(Math.random() * monsters.length));
        if (t) {
          const mx = t.x + t.size / 2;
          const my = t.y + t.size / 2;
          spawnParticles(mx, my, '#a55eea', 8);
          handleMonsterClick(t, mx, my);
        }
      }
    }, 250);
  }
}

// Update Ultimate HUD Cooldown Pill every 200ms
setInterval(() => {
  const hud = document.getElementById('class-ult-hud');
  if (!hud) return;
  if (!isGameRunning) { hud.style.display = 'none'; return; }

  const cls = getActiveClass();
  const rem = Math.max(0, (classState.ultCooldownUntil - performance.now()) / 1000);
  hud.style.display = 'block';
  if (rem <= 0) {
    hud.style.borderColor = cls.color;
    hud.style.color = '#fff';
    hud.innerHTML = `${cls.icon} [SPACE] ${cls.ultName} <span style="color:#2ed573;">READY!</span>`;
  } else {
    hud.style.borderColor = 'rgba(255,255,255,0.2)';
    hud.style.color = '#a4b0be';
    hud.innerHTML = `${cls.icon} ${cls.ultName}: ${rem.toFixed(1)}s`;
  }
}, 200);

// Passive Class Bonuses
const _clsOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  if (classState.selected === 'berserker' && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 1);
    if (Math.random() < 0.20 && monster.hp > 1) {
      monster.hp = Math.max(1, monster.hp - 2);
    }
  }
  _clsOrigClick(monster, clickX, clickY);
};

if (typeof addCoinsAndXP === 'function') {
  const _clsOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const mult = classState.selected === 'rogue' ? 1.40 : 1.0;
    _clsOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}

if (typeof addEnergy === 'function') {
  const _clsOrigEnergy = addEnergy;
  addEnergy = function(amt) {
    const mult = classState.selected === 'arcanist' ? 1.50 : 1.0;
    _clsOrigEnergy(Math.round(amt * mult));
  };
}
