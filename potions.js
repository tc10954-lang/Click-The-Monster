// === START CHUNK 1 OF 3: potions.js ===
// --- Unified Alchemist Lab: Hotkey Belt Potions (Q, E, R) + 6 Cauldron Super-Elixirs ---
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
  },
  activeElixir: JSON.parse(localStorage.getItem('monster_active_elixir_v1') || 'null')
};

const POTION_CATALOG = [
  { id: 'berserk', key: 'Q', icon: '🧪', name: 'Berserk Elixir', cost: 400, color: '#ff4757', durMs: 8000,  desc: '+3 Bonus Click DMG for 8 seconds' },
  { id: 'chrono',  key: 'E', icon: '⏳', name: 'Chrono Draught', cost: 450, color: '#00d2d3', durMs: 7000,  desc: 'Slows all monsters by 65% for 7 seconds' },
  { id: 'luck',    key: 'R', icon: '💰', name: 'Liquid Luck',    cost: 500, color: '#ffd32a', durMs: 10000, desc: '2.5x Coin Drops for 10 seconds' }
];

const CAULDRON_INGREDIENTS = [
  { id: 'dust',  icon: '✨', name: 'Glitch Dust',   costType: 'coins', cost: 1200 },
  { id: 'scale', icon: '🐉', name: 'Dragon Scale',  costType: 'scrap', cost: 25 },
  { id: 'void',  icon: '🌑', name: 'Void Essence',  costType: 'coins', cost: 3500 },
  { id: 'ember', icon: '🔥', name: 'Hellfire Core', costType: 'scrap', cost: 60 }
];

const CAULDRON_RECIPES = {
  'dust+scale': { id: 'midas_rain',      icon: '👑', name: 'Elixir of Midas',          desc: '2.5x Coin Payouts on your entire next hunt!' },
  'dust+void':  { id: 'chrono_slow',     icon: '⏳', name: 'Chrono-Stasis Draught',    desc: 'Monsters move 45% slower on your next hunt!' },
  'dust+ember': { id: 'mega_crit',       icon: '⚡', name: 'Overcharged Volt Serum',   desc: '+15 Bonus Click Damage on every hit next hunt!' },
  'scale+void': { id: 'titan_targets',   icon: '🎯', name: 'Titan Magnifier Tonic',    desc: 'Monsters spawn 35% larger next hunt!' },
  'scale+ember':{ id: 'boss_slayer',     icon: '🗡️', name: 'God-Slayer Venom',         desc: '+25 Bonus Damage to all Bosses next hunt!' },
  'void+ember': { id: 'architect_wrath', icon: '🌌', name: 'Architect\'s Forbidden Brew', desc: '2x Coins + 30% Shred + Slowed Monsters next hunt!' }
};

let selectedCauldronIngs = [];

function savePotions() {
  localStorage.setItem('monster_potions', JSON.stringify(potionState.stock));
  localStorage.setItem('monster_active_elixir_v1', JSON.stringify(potionState.activeElixir));
}

function isPotionActive(id) {
  return performance.now() < (potionState.activeUntil[id] || 0);
}

function getCauldronRecipe(pair) {
  if (pair.length < 2) return null;
  return CAULDRON_RECIPES[[...pair].sort().join('+')] || null;
}

window.addEventListener('DOMContentLoaded', () => {
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const alchBtn = document.createElement('button');
    alchBtn.className = 'action-btn';
    alchBtn.innerHTML = '⚗️ Alchemist Lab';
    alchBtn.style.cssText = 'background: linear-gradient(135deg, #2ed573, #10ac84); color: #07080c;';
    alchBtn.addEventListener('click', () => {
      selectedCauldronIngs = [];
      renderAlchemistModal();
      document.getElementById('alchemist-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) extrasGrid.appendChild(alchBtn);
    else startCard.appendChild(alchBtn);
  }

  const modal = document.createElement('div');
  modal.id = 'alchemist-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '150';
  modal.innerHTML = `
    <div class="card" style="max-width: 560px; width: 94vw; max-height: 86vh; overflow-y: auto; padding: 15px; text-align: left;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <h2 style="color: #2ed573; margin: 0; font-size: 1.55rem;">⚗️ Alchemist Lab & Cauldron</h2>
        <div style="font-size: 0.95rem; font-weight: 900; color: #ffd32a;">🪙 <span id="alch-coin-bal">0</span></div>
      </div>

      <div style="font-size:0.72rem; font-weight:900; color:#a4b0be; margin-bottom:5px;">1. BATTLE BELT POTIONS (HOTKEYS [Q], [E], [R])</div>
      <div id="alch-list" style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;"></div>

      <div style="font-size:0.72rem; font-weight:900; color:#1dd1a1; margin-bottom:5px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">
        2. MYSTIC CAULDRON (MIX 2 INGREDIENTS FOR 1-HUNT SUPER-ELIXIRS)
      </div>
      <div id="alch-elixir-banner" style="background:rgba(255,211,42,0.12); border:1px solid #ffd32a; border-radius:8px; padding:6px 10px; font-size:0.74rem; font-weight:900; color:#ffd32a; margin-bottom:8px;"></div>
      <div id="alch-ing-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; margin-bottom:8px;"></div>
      <div style="background:#0b0e17; border:1.5px dashed rgba(29,209,161,0.45); border-radius:9px; padding:8px; text-align:center; margin-bottom:10px;">
        <div id="alch-cauldron-slots" style="font-size:1.15rem; margin-bottom:2px;">[ ❓ ] + [ ❓ ]</div>
        <div id="alch-recipe-preview" style="font-size:0.72rem; color:#a4b0be; font-weight:800; margin-bottom:6px;">Pick 2 different ingredients above...</div>
        <button id="alch-brew-elixir-btn" disabled style="width:100%; padding:7px; border:none; border-radius:7px; font-weight:900; font-size:0.78rem; background:rgba(255,255,255,0.1); color:#747d8c; cursor:not-allowed;">
          🫧 Select 2 Ingredients
        </button>
      </div>

      <button class="action-btn" id="close-alch-btn" style="padding:9px; background:linear-gradient(135deg, #ff4757, #ff6b81); color:#fff;">Close Lab</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-alch-btn').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('alch-brew-elixir-btn').addEventListener('click', brewCauldronElixir);

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
// === END CHUNK 1 OF 3 ===
// === START CHUNK 2 OF 3: potions.js ===
function renderAlchemistModal() {
  const listEl = document.getElementById('alch-list');
  const balEl = document.getElementById('alch-coin-bal');
  const playerCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;

  if (balEl) balEl.textContent = playerCoins.toLocaleString();
  if (listEl) {
    listEl.innerHTML = POTION_CATALOG.map(p => {
      const count = potionState.stock[p.id] || 0;
      const canAfford = playerCoins >= p.cost;

      return `
        <div style="background:rgba(255,255,255,0.05); border:1px solid ${p.color}; border-radius:9px; padding:7px 10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:900; font-size:0.84rem; color:${p.color};">${p.icon} ${p.name} <span style="color:#fff;">[${p.key}]</span> — Owned: ${count}</div>
            <div style="font-size:0.7rem; color:#ced6e0;">${p.desc}</div>
          </div>
          <button class="brew-pot-btn" data-id="${p.id}" ${canAfford ? '' : 'disabled'} style="
            padding:6px 10px; border:none; border-radius:7px; font-weight:900; font-size:0.74rem;
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

  // Render Cauldron Active Elixir Banner & 4 Ingredients
  const elixBanner = document.getElementById('alch-elixir-banner');
  if (elixBanner) {
    if (potionState.activeElixir) {
      elixBanner.style.borderColor = '#ffd32a';
      elixBanner.style.color = '#ffd32a';
      elixBanner.textContent = `✨ READY NEXT HUNT: ${potionState.activeElixir.icon} ${potionState.activeElixir.name} (${potionState.activeElixir.desc})`;
    } else {
      elixBanner.style.borderColor = '#2ed573';
      elixBanner.style.color = '#2ed573';
      elixBanner.textContent = 'No Super-Elixir active — Mix 2 ingredients below!';
    }
  }

  const ingGrid = document.getElementById('alch-ing-grid');
  if (ingGrid) {
    ingGrid.innerHTML = CAULDRON_INGREDIENTS.map(ing => {
      const picked = selectedCauldronIngs.includes(ing.id);
      const unit = ing.costType === 'coins' ? '🪙' : '🔩';
      return `
        <div class="cauldron-ing-card" data-id="${ing.id}" style="
          background: ${picked ? 'rgba(29,209,161,0.22)' : 'rgba(255,255,255,0.04)'};
          border: 1.5px solid ${picked ? '#1dd1a1' : 'rgba(255,255,255,0.14)'};
          border-radius: 8px; padding: 6px 4px; text-align: center; cursor: pointer;
        ">
          <div style="font-size: 1.25rem;">${ing.icon}</div>
          <div style="font-weight: 900; font-size: 0.68rem; color: #fff;">${ing.name}</div>
          <div style="font-size: 0.64rem; color: ${ing.costType === 'coins' ? '#ffd32a' : '#00d2d3'}; font-weight: 800;">
            ${ing.cost.toLocaleString()} ${unit}
          </div>
        </div>
      `;
    }).join('');

    ingGrid.querySelectorAll('.cauldron-ing-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (selectedCauldronIngs.includes(id)) {
          selectedCauldronIngs = selectedCauldronIngs.filter(x => x !== id);
        } else if (selectedCauldronIngs.length < 2) {
          selectedCauldronIngs.push(id);
        }
        renderAlchemistModal();
      });
    });
  }

  const slotsEl = document.getElementById('alch-cauldron-slots');
  const prevEl = document.getElementById('alch-recipe-preview');
  const brewElixBtn = document.getElementById('alch-brew-elixir-btn');
  const ing1 = CAULDRON_INGREDIENTS.find(i => i.id === selectedCauldronIngs.at(0));
  const ing2 = CAULDRON_INGREDIENTS.find(i => i.id === selectedCauldronIngs.at(1));

  if (slotsEl) slotsEl.textContent = `[ ${ing1 ? ing1.icon : '❓'} ]  +  [ ${ing2 ? ing2.icon : '❓'} ]`;

  const recipe = getCauldronRecipe(selectedCauldronIngs);
  if (recipe && prevEl && brewElixBtn) {
    prevEl.style.color = '#ffd32a';
    prevEl.textContent = `${recipe.icon} ${recipe.name}: ${recipe.desc}`;
    brewElixBtn.disabled = false;
    brewElixBtn.style.background = 'linear-gradient(135deg, #1dd1a1, #10ac84)';
    brewElixBtn.style.color = '#07080c';
    brewElixBtn.style.cursor = 'pointer';
    brewElixBtn.textContent = `🫧 Brew ${recipe.name}`;
  } else if (prevEl && brewElixBtn) {
    prevEl.style.color = '#a4b0be';
    prevEl.textContent = 'Pick 2 different ingredients above...';
    brewElixBtn.disabled = true;
    brewElixBtn.style.background = 'rgba(255,255,255,0.1)';
    brewElixBtn.style.color = '#747d8c';
    brewElixBtn.style.cursor = 'not-allowed';
    brewElixBtn.textContent = '🫧 Select 2 Ingredients';
  }
}

function brewCauldronElixir() {
  const recipe = getCauldronRecipe(selectedCauldronIngs);
  if (!recipe) return;

  const ing1 = CAULDRON_INGREDIENTS.find(i => i.id === selectedCauldronIngs.at(0));
  const ing2 = CAULDRON_INGREDIENTS.find(i => i.id === selectedCauldronIngs.at(1));
  const coinCost = (ing1.costType === 'coins' ? ing1.cost : 0) + (ing2.costType === 'coins' ? ing2.cost : 0);
  const scrapCost = (ing1.costType === 'scrap' ? ing1.cost : 0) + (ing2.costType === 'scrap' ? ing2.cost : 0);

  const curCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;
  const curScrap = typeof gearState !== 'undefined' ? gearState.scrap : 0;

  if (curCoins < coinCost || curScrap < scrapCost) {
    alert(`❌ Need ${coinCost.toLocaleString()} 🪙 and ${scrapCost} 🔩 to brew this elixir!`);
    return;
  }

  if (coinCost > 0 && typeof shopState !== 'undefined') {
    shopState.coins -= coinCost;
    saveShopData();
  }
  if (scrapCost > 0 && typeof gearState !== 'undefined') {
    gearState.scrap -= scrapCost;
    if (typeof saveGearData === 'function') saveGearData();
  }

  potionState.activeElixir = recipe;
  selectedCauldronIngs = [];
  savePotions();
  if (typeof sfx !== 'undefined') sfx.powerup();
  renderAlchemistModal();
}
// === END CHUNK 2 OF 3 ===
// === START CHUNK 3 OF 3: potions.js ===
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

window.addEventListener('keydown', (e) => {
  if (!isGameRunning) return;
  const key = e.key.toUpperCase();
  const p = POTION_CATALOG.find(item => item.key === key);
  if (p) drinkPotion(p.id);
});

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

// --- Activate Brewed Cauldron Super-Elixir on Hunt Start ---
let currentHuntElixir = null;

if (typeof startGame === 'function') {
  const _potOrigStart = startGame;
  startGame = function() {
    currentHuntElixir = potionState.activeElixir;
    if (currentHuntElixir) {
      potionState.activeElixir = null;
      savePotions();
    }
    _potOrigStart();

    if (currentHuntElixir && typeof monsters !== 'undefined') {
      monsters.forEach(applyCauldronElixirToMonster);
    }
  };
}

function applyCauldronElixirToMonster(m) {
  if (!m || !currentHuntElixir || m.cauldronApplied) return;
  m.cauldronApplied = true;
  if (currentHuntElixir.id === 'chrono_slow' || currentHuntElixir.id === 'architect_wrath') {
    m.vx *= 0.55;
    m.vy *= 0.55;
  }
  if (currentHuntElixir.id === 'titan_targets') {
    m.size = Math.round(m.size * 1.35);
    if (m.el) {
      m.el.style.width = `${m.size}px`;
      m.el.style.height = `${m.size}px`;
    }
  }
}

const _potOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  if (isPotionActive('berserk') && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 3);
  }
  if (currentHuntElixir && monster) {
    applyCauldronElixirToMonster(monster);
    if (currentHuntElixir.id === 'mega_crit' && monster.hp > 1) {
      monster.hp = Math.max(1, monster.hp - 15);
    }
    if (currentHuntElixir.id === 'boss_slayer' && monster.type === 'boss' && monster.hp > 1) {
      monster.hp = Math.max(1, monster.hp - 25);
    }
    if (currentHuntElixir.id === 'architect_wrath' && monster.hp > 1) {
      monster.hp = Math.max(1, Math.floor(monster.hp * 0.7));
    }
  }
  _potOrigClick(monster, clickX, clickY);
};

if (typeof addCoinsAndXP === 'function') {
  const _potOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    let mult = isPotionActive('luck') ? 2.5 : 1.0;
    if (currentHuntElixir?.id === 'midas_rain') mult *= 2.5;
    if (currentHuntElixir?.id === 'architect_wrath') mult *= 2.0;
    _potOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}
// === END CHUNK 3 OF 3 ===
