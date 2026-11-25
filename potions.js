// --- Alchemist Lab & Consumable Potions Belt (Keys Q, E, R) ---
const potionState = {
  stock: JSON.parse(localStorage.getItem('monster_potions')) || {
    berserk: 2,
    chrono: 2,
    luck: 2
  },
  activeUntil: {
    berserk: 0,
    chrono: 0,
    luck: 0
  }
};

const POTION_CATALOG = [
  { id: 'berserk', key: 'Q', icon: '🧪', name: 'Berserk Elixir', cost: 400, color: '#ff4757', durMs: 8000,  desc: '+3 Bonus Click DMG for 8 seconds' },
  { id: 'chrono',  key: 'E', icon: '⏳', name: 'Chrono Draught', cost: 450, color: '#00d2d3', durMs: 7000,  desc: 'Slows all monsters by 65% for 7 seconds' },
  { id: 'luck',    key: 'R', icon: '💰', name: 'Liquid Luck',    cost: 500, color: '#ffd32a', durMs: 10000, desc: '2.5x Coin Drops for 10 seconds' }
];

function savePotions() {
  localStorage.setItem('monster_potions', JSON.stringify(potionState.stock));
}

function isPotionActive(id) {
  return performance.now() < (potionState.activeUntil[id] || 0);
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "⚗️ Alchemist" Button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const alchBtn = document.createElement('button');
    alchBtn.className = 'action-btn';
    alchBtn.innerHTML = '⚗️ Alchemist Lab';
    alchBtn.style.cssText = 'background: linear-gradient(135deg, #2ed573, #10ac84); color: #07080c;';
    alchBtn.addEventListener('click', () => {
      renderAlchemistModal();
      document.getElementById('alchemist-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(alchBtn);
    } else {
      startCard.appendChild(alchBtn);
    }
  }

  // 2. Build Alchemist Modal
  const modal = document.createElement('div');
  modal.id = 'alchemist-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '150';
  modal.innerHTML = `
    <div class="card" style="max-width: 540px; max-height: 90vh; overflow-y: auto; text-align: left;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <h2 style="color: #2ed573; margin: 0; font-size: 1.75rem;">⚗️ Alchemist Lab</h2>
        <div style="font-size: 1.1rem; font-weight: 900; color: #ffd32a;">🪙 <span id="alch-coin-bal">0</span></div>
      </div>
      <p class="subtitle" style="margin-bottom: 12px;">Brew potions to drink mid-battle using hotkeys <b>[Q]</b>, <b>[E]</b>, and <b>[R]</b>!</p>
      <div id="alch-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;"></div>
      <button class="action-btn" id="close-alch-btn" style="background:linear-gradient(135deg, #ff4757, #ff6b81); color:#fff;">Close Lab</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-alch-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // 3. Inject Live In-Game Potion Belt HUD
  const belt = document.createElement('div');
  belt.id = 'live-potion-belt';
  belt.style.cssText = `
    position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%);
    display: none; gap: 6px; z-index: 45;
  `;
  belt.innerHTML = POTION_CATALOG.map(p => `
    <button id="use-pot-${p.id}" type="button" style="
      background: rgba(10, 12, 20, 0.88); border: 1.5px solid ${p.color};
      color: #fff; border-radius: 10px; padding: 5px 10px; font-weight: 900;
      font-size: 0.76rem; cursor: pointer; display: flex; align-items: center; gap: 4px;
    ">
      <span style="opacity:0.65;">[${p.key}]</span> ${p.icon} <span id="pot-cnt-${p.id}">0</span>
    </button>
  `).join('');
  document.body.appendChild(belt);

  POTION_CATALOG.forEach(p => {
    document.getElementById(`use-pot-${p.id}`)?.addEventListener('click', (e) => {
      e.stopPropagation();
      drinkPotion(p.id);
    });
  });
});

function renderAlchemistModal() {
  const listEl = document.getElementById('alch-list');
  const balEl = document.getElementById('alch-coin-bal');
  const playerCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;

  if (balEl) balEl.textContent = playerCoins.toLocaleString();
  if (!listEl) return;

  listEl.innerHTML = POTION_CATALOG.map(p => {
    const count = potionState.stock[p.id] || 0;
    const canAfford = playerCoins >= p.cost;

    return `
      <div style="background:rgba(255,255,255,0.05); border:1px solid ${p.color}; border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:900; font-size:0.95rem; color:${p.color};">${p.icon} ${p.name} <span style="color:#fff;">[${p.key}]</span> — Owned: ${count}</div>
          <div style="font-size:0.75rem; color:#ced6e0;">${p.desc}</div>
        </div>
        <button class="brew-pot-btn" data-id="${p.id}" ${canAfford ? '' : 'disabled'} style="
          padding:8px 12px; border:none; border-radius:8px; font-weight:900; font-size:0.78rem;
          cursor:${canAfford ? 'pointer' : 'not-allowed'};
          background:${canAfford ? p.color : 'rgba(255,255,255,0.08)'};
          color:${canAfford ? '#07080c' : '#747d8c'};
        ">Brew (${p.cost} 🪙)</button>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.brew-pot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = POTION_CATALOG.find(item => item.id === btn.dataset.id);
      if (!p || typeof shopState === 'undefined' || shopState.coins < p.cost) return;
      shopState.coins -= p.cost;
      saveShopData();
      potionState.stock[p.id] = (potionState.stock[p.id] || 0) + 1;
      savePotions();
      if (typeof sfx !== 'undefined') sfx.powerup();
      renderAlchemistModal();
    });
  });
}

function drinkPotion(id) {
  if (!isGameRunning) return;
  const p = POTION_CATALOG.find(item => item.id === id);
  if (!p || (potionState.stock[id] || 0) <= 0 || isPotionActive(id)) return;

  potionState.stock[id]--;
  savePotions();
  potionState.activeUntil[id] = performance.now() + p.durMs;

  if (typeof sfx !== 'undefined') sfx.powerup();
  spawnFloatingText(window.innerWidth / 2, 145, `${p.icon} ${p.name.toUpperCase()} ACTIVATED!`, p.color);

  if (id === 'chrono') {
    monsters.forEach(m => { m.vx *= 0.35; m.vy *= 0.35; });
    setTimeout(() => {
      monsters.forEach(m => { m.vx /= 0.35; m.vy /= 0.35; });
    }, p.durMs);
  }
}

// Hotkeys Q, E, R during gameplay
window.addEventListener('keydown', (e) => {
  if (!isGameRunning) return;
  const key = e.key.toUpperCase();
  const p = POTION_CATALOG.find(item => item.key === key);
  if (p) drinkPotion(p.id);
});

// Sync Potion Belt HUD every 200ms
setInterval(() => {
  const belt = document.getElementById('live-potion-belt');
  if (!belt) return;
  if (!isGameRunning) { belt.style.display = 'none'; return; }

  belt.style.display = 'flex';
  POTION_CATALOG.forEach(p => {
    const cntEl = document.getElementById(`pot-cnt-${p.id}`);
    const btnEl = document.getElementById(`use-pot-${p.id}`);
    const cnt = potionState.stock[p.id] || 0;
    const active = isPotionActive(p.id);

    if (cntEl) cntEl.textContent = active ? 'ACTIVE!' : cnt;
    if (btnEl) {
      btnEl.style.opacity = (cnt > 0 || active) ? '1' : '0.4';
      btnEl.style.boxShadow = active ? `0 0 12px ${p.color}` : 'none';
    }
  });
}, 200);

// Potion Gameplay Effects: Berserk Elixir (+3 DMG) & Liquid Luck (2.5x Coins)
const _potOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  if (isPotionActive('berserk') && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 3);
  }
  _potOrigClick(monster, clickX, clickY);
};

if (typeof addCoinsAndXP === 'function') {
  const _potOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const mult = isPotionActive('luck') ? 2.5 : 1.0;
    _potOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}
