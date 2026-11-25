// === START CHUNK 1 OF 2: void_fishing.js ===
// --- 🎣 Void Rift Fishing & Sunken Treasure Dredging Mini-Game ---
const fishingState = Object.assign({
  totalCatches: 0,
  bestCatch: 'None yet'
}, JSON.parse(localStorage.getItem('monster_void_fishing_v1') || '{}'));

function saveFishingState() {
  localStorage.setItem('monster_void_fishing_v1', JSON.stringify(fishingState));
}

const VOID_CATCH_TABLE = [
  { icon: '🥾', name: 'Corrupted Boot',       rarity: 'Trash',     color: '#a4b0be', rewardText: '+150 🪙',
    grant: () => { if (typeof shopState !== 'undefined') { shopState.coins += 150; saveShopData(); } } },
  { icon: '🔩', name: 'Sunken Scrap Crate',   rarity: 'Common',    color: '#00d2d3', rewardText: '+30 Gear Scrap 🔩',
    grant: () => { if (typeof gearState !== 'undefined') { gearState.scrap += 30; saveGearData(); } } },
  { icon: '💰', name: 'Rift Coin Stash',      rarity: 'Rare',      color: '#54a0ff', rewardText: '+4,500 🪙',
    grant: () => { if (typeof shopState !== 'undefined') { shopState.coins += 4500; saveShopData(); } } },
  { icon: '📦', name: 'Abyssal Gear Chest',   rarity: 'Epic',      color: '#a55eea', rewardText: 'Random Epic RPG Gear!',
    grant: () => {
      if (typeof generateRandomGear === 'function' && typeof gearState !== 'undefined') {
        gearState.inventory.push(generateRandomGear('epic'));
        saveGearData();
      }
    } },
  { icon: '👑', name: 'Sunken Monarch Crown', rarity: 'Legendary', color: '#ffd32a', rewardText: 'Legendary Gear + 12,000 🪙!',
    grant: () => {
      if (typeof shopState !== 'undefined') { shopState.coins += 12000; saveShopData(); }
      if (typeof generateRandomGear === 'function' && typeof gearState !== 'undefined') {
        gearState.inventory.push(generateRandomGear('legendary'));
        saveGearData();
      }
    } },
  { icon: '🐉', name: 'VOID LEVIATHAN',       rarity: 'MYTHIC',    color: '#ff4757', rewardText: 'MYTHIC GEAR + 35,000 🪙!',
    grant: () => {
      if (typeof shopState !== 'undefined') { shopState.coins += 35000; saveShopData(); }
      if (typeof generateRandomGear === 'function' && typeof gearState !== 'undefined') {
        gearState.inventory.push(generateRandomGear('mythic'));
        saveGearData();
      }
    } }
];

let fishPhase = 'idle'; // 'idle' | 'waiting' | 'bite'
let fishBiteTimeout = null;

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🎣 Void Fishing" button to Start Menu
  const fishBtn = document.createElement('button');
  fishBtn.className = 'action-btn';
  fishBtn.innerHTML = '🎣 Void Fishing';
  fishBtn.style.cssText = 'background: linear-gradient(135deg, #0abde3, #2e86de); color: #fff;';
  fishBtn.addEventListener('click', () => {
    resetFishingUI();
    document.getElementById('void-fishing-modal').style.display = 'flex';
  });

  const extrasGrid = document.getElementById('menu-extras-grid');
  const startCard = document.querySelector('#start-screen .card');
  if (extrasGrid) extrasGrid.appendChild(fishBtn);
  else if (startCard) startCard.appendChild(fishBtn);

  // 2. Build Compact Fishing Modal
  const modal = document.createElement('div');
  modal.id = 'void-fishing-modal';
  modal.className = 'screen-overlay';
  modal.style.cssText = 'display: none; z-index: 167;';
  modal.innerHTML = `
    <div class="card" style="max-width: 480px; width: 92vw; text-align: center; padding: 18px;">
      <h2 style="color: #0abde3; margin: 0 0 4px 0; font-size: 1.55rem;">🎣 Void Rift Fishing</h2>
      <p class="subtitle" style="margin-bottom: 10px;">Cast your laser line into the Glitch Rift and click fast when the bobber splashes!</p>

      <div id="fish-pond-box" style="
        height: 155px; border-radius: 14px; margin-bottom: 12px; position: relative;
        background: radial-gradient(circle at center, #131b36 0%, #060812 100%);
        border: 2px solid #0abde3; display: flex; flex-direction: column;
        align-items: center; justify-content: center; overflow: hidden;
      ">
        <div id="fish-bobber-icon" style="font-size: 3.2rem; transition: transform 0.15s;">🎣</div>
        <div id="fish-status-text" style="font-weight: 900; font-size: 0.9rem; color: #ced6e0; margin-top: 6px;">
          Ready to cast into the Void!
        </div>
      </div>

      <div id="fish-stats-bar" style="font-size: 0.74rem; color: #a4b0be; font-weight: 800; margin-bottom: 10px;">
        Total Catches: 0 • Best Catch: None yet
      </div>

      <button id="fish-action-btn" class="action-btn" style="width: 100%; padding: 11px; margin-bottom: 8px; background: linear-gradient(135deg, #0abde3, #1dd1a1); color: #07080c;">
        🎣 CAST LASER LINE
      </button>

      <button id="close-fish-btn" class="action-btn" style="width: 100%; padding: 9px; background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">
        Leave Rift
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-fish-btn').addEventListener('click', () => {
    clearTimeout(fishBiteTimeout);
    fishPhase = 'idle';
    modal.style.display = 'none';
  });
  document.getElementById('fish-action-btn').addEventListener('click', handleFishingClick);
});
// === END CHUNK 1 OF 2 ===
// === START CHUNK 2 OF 2: void_fishing.js ===
function resetFishingUI() {
  clearTimeout(fishBiteTimeout);
  fishPhase = 'idle';
  const bobber = document.getElementById('fish-bobber-icon');
  const status = document.getElementById('fish-status-text');
  const btn = document.getElementById('fish-action-btn');
  const stats = document.getElementById('fish-stats-bar');

  if (bobber) {
    bobber.textContent = '🎣';
    bobber.style.transform = 'scale(1)';
  }
  if (status) {
    status.style.color = '#ced6e0';
    status.textContent = 'Ready to cast into the Void!';
  }
  if (btn) {
    btn.style.background = 'linear-gradient(135deg, #0abde3, #1dd1a1)';
    btn.style.color = '#07080c';
    btn.textContent = '🎣 CAST LASER LINE';
  }
  if (stats) {
    stats.textContent = `Total Catches: ${fishingState.totalCatches} • Best Catch: ${fishingState.bestCatch}`;
  }
}

function handleFishingClick() {
  const bobber = document.getElementById('fish-bobber-icon');
  const status = document.getElementById('fish-status-text');
  const btn = document.getElementById('fish-action-btn');

  if (fishPhase === 'idle') {
    fishPhase = 'waiting';
    if (typeof sfx !== 'undefined') sfx.hit();
    bobber.textContent = '🔴';
    status.style.color = '#0abde3';
    status.textContent = 'Line cast... Wait for the Rift splash!';
    btn.style.background = 'rgba(255,255,255,0.12)';
    btn.style.color = '#a4b0be';
    btn.textContent = '⏳ Waiting for a bite...';

    const waitMs = 1400 + Math.random() * 2400;
    fishBiteTimeout = setTimeout(() => {
      fishPhase = 'bite';
      if (typeof sfx !== 'undefined') sfx.powerup();
      bobber.textContent = '💦';
      bobber.style.transform = 'scale(1.35)';
      status.style.color = '#ffd32a';
      status.textContent = '⚡ BITE! REEL IT IN NOW!!';
      btn.style.background = '#ffd32a';
      btn.style.color = '#07080c';
      btn.textContent = '⚡ REEL IN!!';

      // Auto-escape if player waits too long (1.35s window)
      fishBiteTimeout = setTimeout(() => {
        if (fishPhase === 'bite') {
          fishPhase = 'idle';
          bobber.textContent = '💨';
          bobber.style.transform = 'scale(1)';
          status.style.color = '#ff4757';
          status.textContent = 'Too slow! The catch slipped back into the Void!';
          btn.style.background = 'linear-gradient(135deg, #0abde3, #1dd1a1)';
          btn.style.color = '#07080c';
          btn.textContent = '🎣 CAST AGAIN';
        }
      }, 1350);
    }, waitMs);
    return;
  }

  if (fishPhase === 'waiting') {
    clearTimeout(fishBiteTimeout);
    fishPhase = 'idle';
    bobber.textContent = '❌';
    status.style.color = '#ff4757';
    status.textContent = 'Reeled too early! Nothing was on the hook.';
    btn.style.background = 'linear-gradient(135deg, #0abde3, #1dd1a1)';
    btn.style.color = '#07080c';
    btn.textContent = '🎣 CAST AGAIN';
    return;
  }

  if (fishPhase === 'bite') {
    clearTimeout(fishBiteTimeout);
    fishPhase = 'idle';

    // Weighted rarity roll
    const roll = Math.random() * 100;
    let caught = VOID_CATCH_TABLE.at(0);
    if (roll < 4)       caught = VOID_CATCH_TABLE.at(5); // 4% Mythic Void Leviathan
    else if (roll < 14) caught = VOID_CATCH_TABLE.at(4); // 10% Legendary Crown
    else if (roll < 32) caught = VOID_CATCH_TABLE.at(3); // 18% Epic Chest
    else if (roll < 58) caught = VOID_CATCH_TABLE.at(2); // 26% Rare Stash
    else if (roll < 84) caught = VOID_CATCH_TABLE.at(1); // 26% Scrap Crate

    caught.grant();
    fishingState.totalCatches++;
    if (caught.rarity === 'MYTHIC' || caught.rarity === 'Legendary' || fishingState.bestCatch === 'None yet') {
      fishingState.bestCatch = `${caught.icon} ${caught.name}`;
    }
    saveFishingState();

    if (typeof sfx !== 'undefined') sfx.powerup();
    bobber.textContent = caught.icon;
    bobber.style.transform = 'scale(1.25)';
    status.style.color = caught.color;
    status.textContent = `[${caught.rarity.toUpperCase()}] ${caught.name} — ${caught.rewardText}`;
    btn.style.background = 'linear-gradient(135deg, #0abde3, #1dd1a1)';
    btn.style.color = '#07080c';
    btn.textContent = '🎣 CAST AGAIN';

    const stats = document.getElementById('fish-stats-bar');
    if (stats) {
      stats.textContent = `Total Catches: ${fishingState.totalCatches} • Best Catch: ${fishingState.bestCatch}`;
    }
  }
}
// === END CHUNK 2 OF 2 ===

