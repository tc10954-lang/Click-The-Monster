// --- Persistent Coins, Hunter Level & Permanent Armory Shop ---
const shopState = {
  coins: parseInt(localStorage.getItem('monster_coins')) || 0,
  xp: parseInt(localStorage.getItem('monster_xp')) || 0,
  level: parseInt(localStorage.getItem('monster_level')) || 1,
  upgrades: JSON.parse(localStorage.getItem('monster_upgrades')) || {
    damage: 1,    // Click damage (Max 5)
    battery: 0,   // Starting energy & charge boost (Max 5)
    radius: 0,    // Splash blast radius boost (Max 5)
    turret: 0     // Auto-zapping drones (Max 3)
  }
};

const UPGRADE_CATALOG = [
  { id: 'damage',  name: '💥 Click Power',   desc: '+1 Damage per click',       max: 5, baseCost: 120 },
  { id: 'battery', name: '⚡ Battery Core',  desc: '+15% Start ⚡ & Charge',    max: 5, baseCost: 100 },
  { id: 'radius',  name: '🌀 Mega Splash',   desc: '+25% Splash Blast size',    max: 5, baseCost: 110 },
  { id: 'turret',  name: '🤖 Laser Drone',   desc: 'Auto-zaps monsters',        max: 3, baseCost: 200 }
];

function saveShopData() {
  localStorage.setItem('monster_coins', shopState.coins);
  localStorage.setItem('monster_xp', shopState.xp);
  localStorage.setItem('monster_level', shopState.level);
  localStorage.setItem('monster_upgrades', JSON.stringify(shopState.upgrades));
  updateShopUI();
}

function getUpgradeCost(item) {
  const currentLvl = shopState.upgrades[item.id] || 0;
  return Math.round(item.baseCost * Math.pow(1.65, currentLvl));
}

function addCoinsAndXP(coinAmt, xpAmt) {
  const diffMult = { easy: 0.8, normal: 1, insane: 1.4, nightmare: 1.8, hellfire: 2.5 }[currentDiff] || 1;
  shopState.coins += Math.round(coinAmt * diffMult);
  shopState.xp += Math.round(xpAmt * diffMult);

  const xpNeeded = shopState.level * 150;
  if (shopState.xp >= xpNeeded) {
    shopState.xp -= xpNeeded;
    shopState.level++;
    const bonusCoins = shopState.level * 50;
    shopState.coins += bonusCoins;
    sfx.powerup();
    spawnFloatingText(window.innerWidth / 2, 120, `🎉 LEVEL ${shopState.level}! +${bonusCoins}🪙`, '#ffd32a');
  }
  saveShopData();
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add Coins & Hunter Level to Top HUD
  const hudGroup = document.querySelector('.hud-group');
  if (hudGroup) {
    const coinStat = document.createElement('div');
    coinStat.className = 'hud-stat';
    coinStat.innerHTML = `🪙 <span id="coin-display" style="color:#ffd32a;">${shopState.coins}</span>`;

    const lvlStat = document.createElement('div');
    lvlStat.className = 'hud-stat';
    lvlStat.innerHTML = `⭐ Lv.<span id="level-display" style="color:#70a1ff;">${shopState.level}</span>`;

    hudGroup.insertBefore(coinStat, hudGroup.firstChild);
    hudGroup.insertBefore(lvlStat, hudGroup.firstChild);
  }

  // 2. Build Shop Modal Overlay
  const shopModal = document.createElement('div');
  shopModal.id = 'shop-modal';
  shopModal.className = 'screen-overlay hidden';
  shopModal.style.zIndex = '120';
  shopModal.innerHTML = `
    <div class="card" style="max-width: 560px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h2 style="color:#ffd32a; margin:0; font-size:1.8rem;">🛒 Armory Shop</h2>
        <div style="font-size:1.2rem; font-weight:900; color:#ffd32a;">🪙 <span id="shop-coin-bal">${shopState.coins}</span></div>
      </div>
      <p class="subtitle" style="margin-bottom:14px;">Hunter Level <b id="shop-lvl-text" style="color:#70a1ff;">${shopState.level}</b> — Upgrades are permanent!</p>
      <div id="shop-items-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; text-align:left;"></div>
      <button class="action-btn" id="close-shop-btn" style="background:linear-gradient(135deg,#ff4757,#ff6b81); color:#fff;">Back to Menu</button>
    </div>
  `;
  document.body.appendChild(shopModal);

  // 3. Add "Open Armory Shop" buttons to Start & Victory screens
  ['start-screen', 'victory-screen'].forEach(screenId => {
    const card = document.querySelector(`#${screenId} .card`);
    if (card) {
      const openBtn = document.createElement('button');
      openBtn.className = 'action-btn';
      openBtn.style.cssText = 'margin-top:10px; background:linear-gradient(135deg,#ffa502,#ffd32a); color:#07080c;';
      openBtn.innerHTML = '🛒 Armory Shop & Upgrades';
      openBtn.addEventListener('click', () => {
        updateShopUI();
        shopModal.classList.remove('hidden');
      });
      card.appendChild(openBtn);
    }
  });

  document.getElementById('close-shop-btn').addEventListener('click', () => {
    shopModal.classList.add('hidden');
  });

  updateShopUI();
});
function updateShopUI() {
  const coinDisplay = document.getElementById('coin-display');
  const lvlDisplay = document.getElementById('level-display');
  const shopBal = document.getElementById('shop-coin-bal');
  const shopLvl = document.getElementById('shop-lvl-text');
  const grid = document.getElementById('shop-items-grid');

  if (coinDisplay) coinDisplay.textContent = shopState.coins;
  if (lvlDisplay) lvlDisplay.textContent = shopState.level;
  if (shopBal) shopBal.textContent = shopState.coins;
  if (shopLvl) shopLvl.textContent = `${shopState.level} (${shopState.xp}/${shopState.level * 150} XP)`;

  if (!grid) return;
  grid.innerHTML = '';

  UPGRADE_CATALOG.forEach(item => {
    const lvl = shopState.upgrades[item.id] || 0;
    const isMax = lvl >= item.max;
    const cost = getUpgradeCost(item);
    const canAfford = shopState.coins >= cost && !isMax;

    const box = document.createElement('div');
    box.style.cssText = `
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;
    `;

    box.innerHTML = `
      <div>
        <div style="font-weight:800; font-size:0.98rem; color:#fff;">${item.name}</div>
        <div style="font-size:0.78rem; color:#a4b0be; margin:3px 0 8px 0;">${item.desc}</div>
        <div style="font-size:0.78rem; font-weight:700; color:#70a1ff; margin-bottom:8px;">
          Level: ${lvl} / ${item.max}
        </div>
      </div>
      <button class="buy-upg-btn" data-id="${item.id}" style="
        width:100%; padding:8px; border:none; border-radius:8px; font-weight:800; cursor:${canAfford ? 'pointer' : 'not-allowed'};
        background:${isMax ? '#2ed573' : (canAfford ? '#ffd32a' : 'rgba(255,255,255,0.1)')};
        color:${isMax || canAfford ? '#07080c' : '#747d8c'};
      ">
        ${isMax ? 'MAXED OUT' : `Buy (${cost} 🪙)`}
      </button>
    `;

    grid.appendChild(box);
  });

  grid.querySelectorAll('.buy-upg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = UPGRADE_CATALOG.find(u => u.id === id);
      const lvl = shopState.upgrades[id] || 0;
      const cost = getUpgradeCost(item);

      if (lvl < item.max && shopState.coins >= cost) {
        shopState.coins -= cost;
        shopState.upgrades[id] = lvl + 1;
        sfx.powerup();
        saveShopData();
      }
    });
  });
}

// --- Apply Upgrades to Gameplay ---

// 1. Click Power Bonus Damage (Hits multi-HP Tanks & Bosses for extra damage)
const _shopOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  const bonusDmg = (shopState.upgrades.damage || 1) - 1;
  if (bonusDmg > 0 && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - bonusDmg);
  }
  _shopOrigClick(monster, clickX, clickY);
};

// 2. Earn Coins & XP on Monster / Boss Defeat
const _shopOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  const isBoss = monster.type === 'boss';
  const coinReward = isBoss ? 120 : (monster.type === 'tank' ? 8 : 4);
  const xpReward = isBoss ? 100 : (monster.type === 'tank' ? 12 : 6);
  addCoinsAndXP(coinReward, xpReward);

  // Extra battery energy recharge from Battery Core upgrade
  if (typeof addEnergy === 'function' && shopState.upgrades.battery > 0) {
    addEnergy(shopState.upgrades.battery * 2);
  }

  _shopOrigDefeat(monster, clickX, clickY);
};

// 3. Mega Splash Radius Upgrade
if (typeof triggerSplashBlast === 'function') {
  const _shopOrigSplash = triggerSplashBlast;
  triggerSplashBlast = function(x, y) {
    const bonusMult = 1 + (shopState.upgrades.radius || 0) * 0.25;
    if (bonusMult === 1) {
      _shopOrigSplash(x, y);
      return;
    }

    if (!spendEnergy(35)) {
      spawnFloatingText(x, y, 'NEED 35⚡!', '#ff4757');
      selectWeapon('blaster');
      return;
    }

    sfx.bomb();
    triggerScreenShake();

    const radius = 85 * bonusMult;
    const ring = document.createElement('div');
    ring.className = 'splash-ring';
    ring.style.width = `${radius * 2}px`;
    ring.style.height = `${radius * 2}px`;
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 350);

    const hits = monsters.filter(m => {
      const cx = m.x + m.size / 2;
      const cy = m.y + m.size / 2;
      return Math.hypot(cx - x, cy - y) <= radius;
    });

    hits.forEach(m => handleMonsterClick(m, m.x + m.size / 2, m.y + m.size / 2));
  };
}

// 4. Auto-Zapping Laser Drones (Visual Beam + Auto-Hit)
let turretInterval = null;
function startAutoTurrets() {
  clearInterval(turretInterval);
  const turretCount = shopState.upgrades.turret || 0;
  if (turretCount <= 0) return;

  // Faster fire rate with more drone upgrades
  const fireRateMs = Math.max(900, 2600 - turretCount * 550);

  turretInterval = setInterval(() => {
    if (!isGameRunning || isFrozen || monsters.length === 0) return;

    const target = monsters[Math.floor(Math.random() * monsters.length)];
    if (!target) return;

    const tx = target.x + target.size / 2;
    const ty = target.y + target.size / 2;
    const startX = window.innerWidth / 2;
    const startY = 70;

    // Draw visible cyan drone laser beam from HUD to target
    const beam = document.createElement('div');
    const dist = Math.hypot(tx - startX, ty - startY);
    const angle = Math.atan2(ty - startY, tx - startX) * (180 / Math.PI);

    beam.style.cssText = `
      position: fixed; left: ${startX}px; top: ${startY}px;
      width: ${dist}px; height: 3px; background: #00d2d3;
      box-shadow: 0 0 10px #00d2d3; transform-origin: 0 50%;
      transform: rotate(${angle}deg); pointer-events: none; z-index: 36;
    `;
    document.body.appendChild(beam);
    setTimeout(() => beam.remove(), 140);

    sfx.playTone(980, 'sine', 0.06, 0.06, 520);
    handleMonsterClick(target, tx, ty);
  }, fireRateMs);
}

// 5. Apply Starting Battery Bonus & Activate Drones on Game Start
const _shopOrigStart = startGame;
startGame = function() {
  _shopOrigStart();
  if (typeof addEnergy === 'function' && shopState.upgrades.battery > 0) {
    addEnergy(shopState.upgrades.battery * 15);
  }
  startAutoTurrets();
};


