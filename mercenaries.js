// --- Offline & Idle Mercenary Guild (Earn Coins While Away or on Menus!) ---
const mercState = {
  hired: JSON.parse(localStorage.getItem('monster_mercs')) || {
    scout: 0,    // +2 coins/sec
    hunter: 0,   // +10 coins/sec
    knight: 0,   // +45 coins/sec
    warlord: 0   // +200 coins/sec
  },
  lastTimestamp: parseInt(localStorage.getItem('monster_merc_last_ts')) || Date.now()
};

const MERC_CATALOG = [
  { id: 'scout',   icon: '🏹', name: 'Goblin Scout',    cps: 2,   baseCost: 300 },
  { id: 'hunter',  icon: '🗡️', name: 'Shadow Hunter',   cps: 10,  baseCost: 1500 },
  { id: 'knight',  icon: '🛡️', name: 'Arcane Knight',   cps: 45,  baseCost: 7500 },
  { id: 'warlord', icon: '👑', name: 'Abyssal Warlord', cps: 200, baseCost: 35000 }
];

function getTotalMercCPS() {
  return MERC_CATALOG.reduce((sum, m) => sum + (mercState.hired[m.id] || 0) * m.cps, 0);
}

function getMercCost(merc) {
  const lvl = mercState.hired[merc.id] || 0;
  return Math.round(merc.baseCost * Math.pow(1.38, lvl));
}

function saveMercData() {
  mercState.lastTimestamp = Date.now();
  localStorage.setItem('monster_mercs', JSON.stringify(mercState.hired));
  localStorage.setItem('monster_merc_last_ts', mercState.lastTimestamp.toString());
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🏰 Mercenaries" Button to Start Menu
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const mercBtn = document.createElement('button');
    mercBtn.id = 'open-merc-btn';
    mercBtn.className = 'action-btn';
    mercBtn.style.cssText = 'background: linear-gradient(135deg, #f39c12, #d35400); color: #fff;';
    mercBtn.innerHTML = `🏰 Mercenary Guild`;
    mercBtn.addEventListener('click', () => {
      renderMercModal();
      document.getElementById('merc-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(mercBtn);
    } else {
      startCard.appendChild(mercBtn);
    }
  }

  // 2. Build Mercenary Guild Modal
  const modal = document.createElement('div');
  modal.id = 'merc-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '144';
  modal.innerHTML = `
    <div class="card" style="max-width: 540px; max-height: 90vh; overflow-y: auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <h2 style="color: #f39c12; margin: 0; font-size: 1.75rem;">🏰 Mercenary Guild</h2>
        <div style="font-size: 1.1rem; font-weight: 900; color: #ffd32a;">🪙 <span id="merc-coin-bal">0</span></div>
      </div>
      <p class="subtitle" style="margin-bottom: 12px;">
        Hire autonomous hunters that earn Coins every second — even while offline between classes!
        <br><b style="color:#2ed573;">Passive Income: +<span id="merc-cps-display">0</span> 🪙/sec</b>
      </p>
      <div id="merc-list" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; text-align: left;"></div>
      <button class="action-btn" id="close-merc-btn" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">Close Guild</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-merc-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // 3. Calculate & Award Offline Earnings (Up to 8 hours max away time!)
  setTimeout(() => {
    const cps = getTotalMercCPS();
    const now = Date.now();
    const elapsedSec = Math.min(8 * 3600, Math.floor((now - mercState.lastTimestamp) / 1000));

    if (cps > 0 && elapsedSec >= 15 && typeof shopState !== 'undefined') {
      const earned = cps * elapsedSec;
      shopState.coins += earned;
      saveShopData();
      saveMercData();

      const mins = Math.floor(elapsedSec / 60);
      const timeLabel = mins > 0 ? `${mins}m ${elapsedSec % 60}s` : `${elapsedSec}s`;

      const banner = document.createElement('div');
      banner.style.cssText = `
        position: fixed; top: 82px; left: 50%; transform: translateX(-50%);
        background: rgba(14, 16, 26, 0.96); border: 2px solid #f39c12;
        box-shadow: 0 10px 30px rgba(243, 156, 18, 0.45);
        padding: 12px 20px; border-radius: 14px; z-index: 150; text-align: center;
      `;
      banner.innerHTML = `
        <div style="font-weight: 900; color: #f39c12; font-size: 0.95rem;">🏰 WELCOME BACK, COMMANDER!</div>
        <div style="font-size: 0.82rem; color: #fff; margin-top: 2px;">
          Your Mercenaries hunted for <b>${timeLabel}</b> and earned <b style="color:#ffd32a;">+${earned.toLocaleString()} 🪙</b>!
        </div>
      `;
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 5000);
    } else {
      saveMercData();
    }
  }, 500);

  // 4. Live Passive Coin Tick every 1 second
  setInterval(() => {
    const cps = getTotalMercCPS();
    if (cps > 0 && typeof shopState !== 'undefined') {
      shopState.coins += cps;
      saveShopData();
      saveMercData();

      const modalOpen = !document.getElementById('merc-modal')?.classList.contains('hidden');
      if (modalOpen) {
        const balEl = document.getElementById('merc-coin-bal');
        if (balEl) balEl.textContent = shopState.coins.toLocaleString();
      }
    }
  }, 1000);
});

function renderMercModal() {
  const listEl = document.getElementById('merc-list');
  const balEl = document.getElementById('merc-coin-bal');
  const cpsEl = document.getElementById('merc-cps-display');
  const playerCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;

  if (balEl) balEl.textContent = playerCoins.toLocaleString();
  if (cpsEl) cpsEl.textContent = getTotalMercCPS().toLocaleString();
  if (!listEl) return;

  listEl.innerHTML = MERC_CATALOG.map(m => {
    const count = mercState.hired[m.id] || 0;
    const cost = getMercCost(m);
    const canAfford = playerCoins >= cost;

    return `
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(243,156,18,0.3); border-radius: 10px; padding: 10px 12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight: 900; font-size: 0.95rem; color: #fff;">${m.icon} ${m.name} <span style="color:#f39c12;">x${count}</span></div>
          <div style="font-size: 0.76rem; color: #a4b0be;">Generates <b>+${m.cps} 🪙/sec</b> each (Total: +${(count * m.cps).toLocaleString()}/s)</div>
        </div>
        <button class="hire-merc-btn" data-id="${m.id}" ${canAfford ? '' : 'disabled'} style="
          padding: 8px 14px; border: none; border-radius: 8px; font-weight: 900; font-size: 0.82rem;
          cursor: ${canAfford ? 'pointer' : 'not-allowed'};
          background: ${canAfford ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 'rgba(255,255,255,0.08)'};
          color: ${canAfford ? '#07080c' : '#747d8c'};
        ">Hire (${cost.toLocaleString()} 🪙)</button>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.hire-merc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = MERC_CATALOG.find(item => item.id === btn.dataset.id);
      if (!m) return;
      const cost = getMercCost(m);
      if (typeof shopState !== 'undefined' && shopState.coins >= cost) {
        shopState.coins -= cost;
        saveShopData();
        mercState.hired[m.id] = (mercState.hired[m.id] || 0) + 1;
        saveMercData();
        if (typeof sfx !== 'undefined') sfx.powerup();
        renderMercModal();
      }
    });
  });
}
