// --- Endgame Vault: Infinite Upgrades, Mystery Loot Crates & Orbiting Battle Pets ---
const endgameState = {
  infinite: JSON.parse(localStorage.getItem('monster_endgame_inf')) || {
    crit: 0,     // +5% Mega-Crit chance per level (no cap)
    greed: 0,    // +10% permanent coin multiplier per level (no cap)
    chrono: 0    // -2% monster speed per level (caps at 50% slow)
  },
  petsOwned: JSON.parse(localStorage.getItem('monster_pets_owned')) || [],
  equippedPets: JSON.parse(localStorage.getItem('monster_pets_equipped')) || []
};

const PET_CATALOG = [
  { id: 'imp',     icon: '🔥', name: 'Fire Imp',       rarity: 'Common',    color: '#ff7f50', fireMs: 1800, dmg: 1 },
  { id: 'storm',   icon: '⚡', name: 'Storm Wisp',     rarity: 'Rare',      color: '#00d2d3', fireMs: 1300, dmg: 1 },
  { id: 'dragon',  icon: '🐉', name: 'Void Dragon',    rarity: 'Epic',      color: '#a55eea', fireMs: 950,  dmg: 2 },
  { id: 'phoenix', icon: '👑', name: 'Golden Phoenix', rarity: 'Legendary', color: '#ffd32a', fireMs: 650,  dmg: 3 }
];

const CRATE_TIERS = [
  { id: 'bronze', name: '🥉 Bronze Crate', cost: 500,   color: '#cd7f32', weights: [70, 22, 7, 1] },
  { id: 'gold',   name: '🥇 Gold Crate',   cost: 2500,  color: '#ffd32a', weights: [35, 42, 18, 5] },
  { id: 'mythic', name: '💎 Mythic Crate', cost: 10000, color: '#00d2d3', weights: [10, 30, 40, 20] }
];


function saveEndgame() {
  localStorage.setItem('monster_endgame_inf', JSON.stringify(endgameState.infinite));
  localStorage.setItem('monster_pets_owned', JSON.stringify(endgameState.petsOwned));
  localStorage.setItem('monster_pets_equipped', JSON.stringify(endgameState.equippedPets));
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "💎 Endgame Vault" button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const vaultBtn = document.createElement('button');
    vaultBtn.className = 'action-btn';
    vaultBtn.innerHTML = '💎 Endgame Vault';
    vaultBtn.style.cssText = 'background: linear-gradient(135deg, #00d2d3, #5f27cd); color: #fff;';
    vaultBtn.addEventListener('click', () => {
      renderVaultModal();
      document.getElementById('vault-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(vaultBtn);
    } else {
      startCard.appendChild(vaultBtn);
    }
  }

  // 2. Add a "Reset Board" button inside Top 10 Leaderboard (to clear glitched scores)
  const closeLbBtn = document.getElementById('close-lb-btn');
  if (closeLbBtn && closeLbBtn.parentNode) {
    const resetLbBtn = document.createElement('button');
    resetLbBtn.textContent = '🧹 Reset Glitched Board';
    resetLbBtn.style.cssText = `
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18);
      color: #a4b0be; border-radius: 8px; padding: 7px; font-size: 0.78rem;
      font-weight: 700; cursor: pointer; margin-bottom: 8px;
    `;
    resetLbBtn.addEventListener('click', () => {
      localStorage.removeItem(`monster_top10_${viewBoardDiff}`);
      if (typeof renderLeaderboardModal === 'function') renderLeaderboardModal();
    });
    closeLbBtn.parentNode.insertBefore(resetLbBtn, closeLbBtn);
  }

  // 3. Build Endgame Vault Modal (Crates + Infinite Upgrades + Battle Pets)
  const vaultModal = document.createElement('div');
  vaultModal.id = 'vault-modal';
  vaultModal.className = 'screen-overlay hidden';
  vaultModal.style.zIndex = '132';
  vaultModal.innerHTML = `
    <div class="card" style="max-width: 620px; max-height: 90vh; overflow-y: auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <h2 style="color: #00d2d3; margin: 0; font-size: 1.75rem;">💎 Endgame Vault</h2>
        <div style="font-size: 1.15rem; font-weight: 900; color: #ffd32a;">🪙 <span id="vault-coin-bal">0</span></div>
      </div>
      <p class="subtitle" style="margin-bottom: 12px;">Open Mystery Crates for orbiting Battle Pets & buy Infinite Upgrades!</p>

      <div id="crate-result-banner" style="min-height: 32px; font-weight: 900; font-size: 0.95rem; color: #ffd32a; margin-bottom: 10px;"></div>

      <div style="font-size:0.78rem; font-weight:900; color:#a4b0be; text-align:left; margin-bottom:6px;">🎰 MYSTERY PET CRATES</div>
      <div id="vault-crates-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;"></div>

      <div style="font-size:0.78rem; font-weight:900; color:#a4b0be; text-align:left; margin-bottom:6px;">🐾 BATTLE PETS (EQUIP UP TO 3)</div>
      <div id="vault-pets-row" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;"></div>

      <div style="font-size:0.78rem; font-weight:900; color:#a4b0be; text-align:left; margin-bottom:6px;">♾️ INFINITE OVERCLOCKS (NO LEVEL CAP)</div>
      <div id="vault-inf-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 18px; text-align: left;"></div>

      <button class="action-btn" id="close-vault-btn" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">Close Vault</button>
    </div>
  `;
  document.body.appendChild(vaultModal);

  document.getElementById('close-vault-btn').addEventListener('click', () => {
    vaultModal.classList.add('hidden');
  });
});

function renderVaultModal() {
  const playerCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;
  const balEl = document.getElementById('vault-coin-bal');
  if (balEl) balEl.textContent = playerCoins.toLocaleString();

  // 1. Render Mystery Crates
  const cratesRow = document.getElementById('vault-crates-row');
  if (cratesRow) {
    cratesRow.innerHTML = CRATE_TIERS.map(c => {
      const canAfford = playerCoins >= c.cost;
      return `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid ${c.color}; border-radius: 12px; padding: 10px;">
          <div style="font-weight: 900; font-size: 0.9rem; color: ${c.color}; margin-bottom: 6px;">${c.name}</div>
          <button class="open-crate-btn" data-id="${c.id}" style="
            width: 100%; padding: 8px; border: none; border-radius: 8px; font-weight: 900;
            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
            background: ${canAfford ? c.color : 'rgba(255,255,255,0.1)'};
            color: ${canAfford ? '#07080c' : '#747d8c'}; font-size: 0.82rem;
          ">Open (${c.cost.toLocaleString()} 🪙)</button>
        </div>
      `;
    }).join('');

    cratesRow.querySelectorAll('.open-crate-btn').forEach(btn => {
      btn.addEventListener('click', () => openMysteryCrate(btn.dataset.id));
    });
  }

  // 2. Render Battle Pets
  const petsRow = document.getElementById('vault-pets-row');
  if (petsRow) {
    petsRow.innerHTML = PET_CATALOG.map(p => {
      const owned = endgameState.petsOwned.includes(p.id);
      const equipped = endgameState.equippedPets.includes(p.id);
      return `
        <div style="
          background: ${equipped ? 'rgba(46,213,115,0.16)' : 'rgba(255,255,255,0.04)'};
          border: 1px solid ${equipped ? '#2ed573' : (owned ? p.color : 'rgba(255,255,255,0.1)')};
          border-radius: 10px; padding: 8px; opacity: ${owned ? '1' : '0.45'};
        ">
          <div style="font-size: 1.6rem;">${p.icon}</div>
          <div style="font-weight: 800; font-size: 0.78rem; color: ${p.color};">${p.name}</div>
          <div style="font-size: 0.65rem; color: #a4b0be; margin-bottom: 6px;">${p.rarity}</div>
          <button class="toggle-pet-btn" data-id="${p.id}" ${owned ? '' : 'disabled'} style="
            width: 100%; padding: 5px; border: none; border-radius: 6px; font-weight: 800; font-size: 0.72rem;
            cursor: ${owned ? 'pointer' : 'not-allowed'};
            background: ${equipped ? '#2ed573' : (owned ? '#5352ed' : 'rgba(255,255,255,0.08)')};
            color: ${equipped ? '#07080c' : '#fff'};
          ">${equipped ? 'EQUIPPED' : (owned ? 'Equip' : 'Locked')}</button>
        </div>
      `;
    }).join('');

    petsRow.querySelectorAll('.toggle-pet-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleEquipPet(btn.dataset.id));
    });
  }

  // 3. Render Infinite Overclocks
  const infItems = [
    { id: 'crit',   name: '⚡ Mega-Crit',   desc: '+5% chance for 5x DMG', base: 400 },
    { id: 'greed',  name: '🧲 Coin Magnet', desc: '+10% Coins forever',    base: 500 },
    { id: 'chrono', name: '⏳ Chrono Slow', desc: '-2% Enemy Speed',       base: 600 }
  ];

  const infRow = document.getElementById('vault-inf-row');
  if (infRow) {
    infRow.innerHTML = infItems.map(item => {
      const lvl = endgameState.infinite[item.id] || 0;
      const cost = Math.round(item.base * Math.pow(1.45, lvl));
      const canAfford = playerCoins >= cost;
      return `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px;">
          <div style="font-weight: 800; font-size: 0.85rem; color: #fff;">${item.name} <span style="color:#00d2d3;">Lv.${lvl}</span></div>
          <div style="font-size: 0.72rem; color: #a4b0be; margin: 3px 0 8px 0;">${item.desc}</div>
          <button class="buy-inf-btn" data-id="${item.id}" data-cost="${cost}" style="
            width: 100%; padding: 6px; border: none; border-radius: 6px; font-weight: 800; font-size: 0.78rem;
            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
            background: ${canAfford ? '#00d2d3' : 'rgba(255,255,255,0.1)'};
            color: ${canAfford ? '#07080c' : '#747d8c'};
          ">Upgrade (${cost.toLocaleString()} 🪙)</button>
        </div>
      `;
    }).join('');

    infRow.querySelectorAll('.buy-inf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const cost = parseInt(btn.dataset.cost);
        if (typeof shopState !== 'undefined' && shopState.coins >= cost) {
          shopState.coins -= cost;
          saveShopData();
          endgameState.infinite[id] = (endgameState.infinite[id] || 0) + 1;
          saveEndgame();
          if (typeof sfx !== 'undefined') sfx.powerup();
          renderVaultModal();
        }
      });
    });
  }
}

function openMysteryCrate(crateId) {
  const crate = CRATE_TIERS.find(c => c.id === crateId);
  if (!crate || typeof shopState === 'undefined' || shopState.coins < crate.cost) return;

  shopState.coins -= crate.cost;
  saveShopData();

  const roll = Math.random() * 100;
  let cumulative = 0;
  let petIdx = 0;
  for (let i = 0; i < crate.weights.length; i++) {
    cumulative += crate.weights[i];
    if (roll <= cumulative) {
      petIdx = i;
      break;
    }
  }

  const wonPet = PET_CATALOG[petIdx];
  const banner = document.getElementById('crate-result-banner');

  if (!endgameState.petsOwned.includes(wonPet.id)) {
    endgameState.petsOwned.push(wonPet.id);
    if (endgameState.equippedPets.length < 3) {
      endgameState.equippedPets.push(wonPet.id);
    }
    saveEndgame();
    if (typeof sfx !== 'undefined') sfx.victory();
    banner.style.color = wonPet.color;
    banner.textContent = `🎉 NEW PET UNLOCKED: ${wonPet.icon} ${wonPet.name} (${wonPet.rarity})!`;
  } else {
    // Duplicate pet refunds 65% of crate cost + 1 free Mega-Crit level!
    const refund = Math.round(crate.cost * 0.65);
    shopState.coins += refund;
    saveShopData();
    endgameState.infinite.crit++;
    saveEndgame();
    if (typeof sfx !== 'undefined') sfx.powerup();
    banner.style.color = '#ffd32a';
    banner.textContent = `Duplicate ${wonPet.icon} ${wonPet.name} → +${refund.toLocaleString()} 🪙 & +1 Free Mega-Crit Lv!`;
  }

  renderVaultModal();
}

function toggleEquipPet(petId) {
  const idx = endgameState.equippedPets.indexOf(petId);
  if (idx !== -1) {
    endgameState.equippedPets.splice(idx, 1);
  } else {
    if (endgameState.equippedPets.length >= 3) {
      endgameState.equippedPets.shift();
    }
    endgameState.equippedPets.push(petId);
  }
  saveEndgame();
  renderVaultModal();
}

// --- Orbiting Battle Pets & Infinite Overclock Gameplay Hooks ---
let petSprites = [];
let petAttackTimers = [];
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

function spawnActiveBattlePets() {
  petSprites.forEach(p => p.el.remove());
  petAttackTimers.forEach(t => clearInterval(t));
  petSprites = [];
  petAttackTimers = [];

  endgameState.equippedPets.forEach((petId, index) => {
    const pet = PET_CATALOG.find(p => p.id === petId);
    if (!pet) return;

    const el = document.createElement('div');
    el.textContent = pet.icon;
    el.style.cssText = `
      position: fixed; font-size: 1.5rem; pointer-events: none; z-index: 42;
      filter: drop-shadow(0 0 8px ${pet.color}); transform: translate(-50%, -50%);
    `;
    document.body.appendChild(el);
    petSprites.push({ el, angle: (index * Math.PI * 2) / 3, pet });

    // Pet auto-attack interval
    const timer = setInterval(() => {
      if (!isGameRunning || isFrozen || monsters.length === 0) return;
      const target = monsters[Math.floor(Math.random() * monsters.length)];
      if (!target) return;

      const tx = target.x + target.size / 2;
      const ty = target.y + target.size / 2;
      spawnParticles(tx, ty, pet.color, 6);
      for (let d = 0; d < pet.dmg; d++) {
        if (monsters.includes(target)) handleMonsterClick(target, tx, ty);
      }
    }, pet.fireMs);

    petAttackTimers.push(timer);
  });
}

// Smooth orbit animation around cursor
setInterval(() => {
  if (petSprites.length === 0) return;
  petSprites.forEach(p => {
    p.angle += 0.06;
    const ox = mousePos.x + Math.cos(p.angle) * 48;
    const oy = mousePos.y + Math.sin(p.angle) * 48;
    p.el.style.left = `${ox}px`;
    p.el.style.top = `${oy}px`;
  });
}, 16);

// 1. Apply Mega-Crit (5x Damage!)
const _egOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  const critChance = Math.min(0.85, (endgameState.infinite.crit || 0) * 0.05);
  if (critChance > 0 && Math.random() < critChance && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 4);
    spawnFloatingText(clickX, clickY - 18, '⚡ 5X MEGA-CRIT!', '#ff9ff3');
  }
  _egOrigClick(monster, clickX, clickY);
};

// 2. Apply Coin Magnet Multiplier
if (typeof addCoinsAndXP === 'function') {
  const _egOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const greedMult = 1 + (endgameState.infinite.greed || 0) * 0.10;
    _egOrigCoins(Math.round(coinAmt * greedMult), xpAmt);
  };
}

// 3. Apply Chrono-Distortion Slow & Spawn Pets on Game Start
const _egOrigStart = startGame;
startGame = function() {
  _egOrigStart();
  const slowPct = Math.min(0.50, (endgameState.infinite.chrono || 0) * 0.02);
  if (slowPct > 0) {
    monsters.forEach(m => {
      m.vx *= (1 - slowPct);
      m.vy *= (1 - slowPct);
    });
  }
  spawnActiveBattlePets();
};
