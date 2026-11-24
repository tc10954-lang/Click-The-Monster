// --- Career Stats Dashboard & Optional Prestige/Rebirth System ---
const careerData = {
  totalKills: parseInt(localStorage.getItem('monster_career_kills')) || 0,
  bossesSlain: parseInt(localStorage.getItem('monster_career_bosses')) || 0,
  totalCoinsEarned: parseInt(localStorage.getItem('monster_career_coins')) || 0,
  totalShots: parseInt(localStorage.getItem('monster_career_shots')) || 0,
  totalHits: parseInt(localStorage.getItem('monster_career_hits')) || 0,
  rebirths: parseInt(localStorage.getItem('monster_rebirths')) || 0
};

function saveCareerData() {
  localStorage.setItem('monster_career_kills', careerData.totalKills);
  localStorage.setItem('monster_career_bosses', careerData.bossesSlain);
  localStorage.setItem('monster_career_coins', careerData.totalCoinsEarned);
  localStorage.setItem('monster_career_shots', careerData.totalShots);
  localStorage.setItem('monster_career_hits', careerData.totalHits);
  localStorage.setItem('monster_rebirths', careerData.rebirths);
  updateRebirthHUD();
}

function updateRebirthHUD() {
  const badge = document.getElementById('rebirth-hud-badge');
  if (badge) {
    badge.style.display = careerData.rebirths > 0 ? 'flex' : 'none';
    badge.innerHTML = `👑 <span style="color:#ff9ff3;">R${careerData.rebirths}</span>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add Rebirth Crown Badge to Top HUD (visible once Rebirthed at least once)
  const hudGroup = document.querySelector('.hud-group');
  if (hudGroup) {
    const rBadge = document.createElement('div');
    rBadge.id = 'rebirth-hud-badge';
    rBadge.className = 'hud-stat';
    rBadge.title = `Rebirth Tier ${careerData.rebirths} (+${careerData.rebirths * 50}% Coins & XP)`;
    rBadge.style.display = 'none';
    hudGroup.insertBefore(rBadge, hudGroup.firstChild);
    updateRebirthHUD();
  }

  // 2. Add "Career & Prestige" Button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const careerBtn = document.createElement('button');
    careerBtn.className = 'action-btn';
    careerBtn.innerHTML = '📊 Career Stats & Prestige';
    careerBtn.style.cssText = 'margin-top: 10px; background: linear-gradient(135deg, #2f3542, #57606f); color: #fff; font-size: 1.02rem; padding: 13px; border: 1px solid rgba(255,255,255,0.18);';
    careerBtn.addEventListener('click', () => {
      renderCareerModal();
      document.getElementById('career-modal').classList.remove('hidden');
    });
    startCard.appendChild(careerBtn);
  }

  // 3. Build Career & Optional Rebirth Modal
  const modal = document.createElement('div');
  modal.id = 'career-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '128';
  modal.innerHTML = `
    <div class="card" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
      <h2 style="color: #70a1ff; margin: 0 0 6px 0; font-size: 1.8rem;">📊 Career & Prestige</h2>
      <p class="subtitle" style="margin-bottom: 14px;">Your lifetime hunting records and optional Rebirth status.</p>

      <div id="career-stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;"></div>

      <div style="background: rgba(0,0,0,0.35); border-radius: 12px; padding: 12px; margin-bottom: 16px; text-align: left;">
        <div style="font-size: 0.8rem; font-weight: 900; color: #a4b0be; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">⏱️ Personal Best Clear Times</div>
        <div id="career-records-row" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; text-align: center;"></div>
      </div>

      <div id="prestige-box" style="background: linear-gradient(135deg, rgba(165,94,234,0.18), rgba(255,107,129,0.18)); border: 2px solid #a55eea; border-radius: 14px; padding: 14px; margin-bottom: 18px;">
        <div style="font-weight: 900; font-size: 1.1rem; color: #ff9ff3; margin-bottom: 4px;">👑 Optional Rebirth (Current: Tier <span id="prestige-tier-num">0</span>)</div>
        <div style="font-size: 0.82rem; color: #dfe4ea; margin-bottom: 10px;">
          Current Bonus: <b style="color: #2ed573;">+<span id="prestige-bonus-pct">0</span>% Coins & XP</b> • Unlocks <b>🌈 RGB Crosshair</b> on first Rebirth!
        </div>
        <button id="do-rebirth-btn" style="width: 100%; padding: 11px; border: none; border-radius: 8px; font-weight: 900; font-size: 0.95rem; cursor: pointer;">
          Requires Hunter Level 10
        </button>
      </div>

      <button class="action-btn" id="close-career-btn" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-career-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // 4. Register Exclusive Rainbow RGB Crosshair if Rebirthed
  if (typeof CROSSHAIR_CATALOG !== 'undefined' && careerData.rebirths > 0) {
    unlockRainbowCrosshair();
  }
});
function unlockRainbowCrosshair() {
  if (typeof CROSSHAIR_CATALOG === 'undefined') return;
  if (!CROSSHAIR_CATALOG.some(c => c.id === 'rainbow')) {
    CROSSHAIR_CATALOG.push({
      id: 'rainbow',
      name: '🌈 RGB Prestige',
      cost: 0,
      color: '#ff9ff3',
      size: 40,
      style: 'rainbow'
    });
  }
  if (typeof extraModes !== 'undefined' && !extraModes.unlockedCrosshairs.includes('rainbow')) {
    extraModes.unlockedCrosshairs.push('rainbow');
    localStorage.setItem('monster_unlocked_ch', JSON.stringify(extraModes.unlockedCrosshairs));
  }
}

// Inject smooth RGB color-cycle animation for the Prestige Crosshair
const rgbStyle = document.createElement('style');
rgbStyle.textContent = `
  @keyframes rgbSpin {
    0%   { filter: hue-rotate(0deg) drop-shadow(0 0 8px #ff4757); transform: translate(-50%, -50%) rotate(0deg); }
    100% { filter: hue-rotate(360deg) drop-shadow(0 0 8px #00d2d3); transform: translate(-50%, -50%) rotate(360deg); }
  }
  .rgb-reticle {
    animation: rgbSpin 2.5s linear infinite !important;
  }
`;
document.head.appendChild(rgbStyle);

if (typeof applyCrosshair === 'function') {
  const _careerOrigCrosshair = applyCrosshair;
  applyCrosshair = function(id) {
    _careerOrigCrosshair(id);
    const reticle = document.getElementById('custom-reticle');
    if (reticle) {
      reticle.classList.toggle('rgb-reticle', id === 'rainbow');
    }
  };
}

function renderCareerModal() {
  const statsGrid = document.getElementById('career-stats-grid');
  const recordsRow = document.getElementById('career-records-row');
  if (!statsGrid || !recordsRow) return;

  const accuracy = careerData.totalShots > 0
    ? Math.round((careerData.totalHits / careerData.totalShots) * 100)
    : 100;
  const bestWave = localStorage.getItem('monster_best_wave') || '1';
  const trophyCount = typeof achState !== 'undefined' ? `${achState.unlocked.length}/8` : '0/8';

  const statItems = [
    { label: 'Monsters Slain', val: careerData.totalKills.toLocaleString(), color: '#ff4757' },
    { label: 'Bosses Defeated', val: careerData.bossesSlain.toLocaleString(), color: '#ffa502' },
    { label: 'Coins Earned', val: `${careerData.totalCoinsEarned.toLocaleString()} 🪙`, color: '#ffd32a' },
    { label: 'Career Accuracy', val: `${accuracy}%`, color: '#2ed573' },
    { label: 'Highest Wave', val: `Wave ${bestWave}`, color: '#00d2d3' },
    { label: 'Trophies', val: `🏆 ${trophyCount}`, color: '#a55eea' }
  ];

  statsGrid.innerHTML = statItems.map(s => `
    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px;">
      <div style="font-size: 0.7rem; color: #a4b0be; text-transform: uppercase;">${s.label}</div>
      <div style="font-size: 1.15rem; font-weight: 900; color: ${s.color}; margin-top: 3px;">${s.val}</div>
    </div>
  `).join('');

  const diffs = [
    { key: 'easy', label: 'Easy' },
    { key: 'normal', label: 'Normal' },
    { key: 'insane', label: 'Insane' },
    { key: 'nightmare', label: 'Nightmare' },
    { key: 'hellfire', label: 'Hellfire' }
  ];

  recordsRow.innerHTML = diffs.map(d => {
    const best = localStorage.getItem(`monster_ultimate_best_${d.key}`);
    return `
      <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 8px 4px;">
        <div style="font-size: 0.68rem; color: #a4b0be; margin-bottom: 3px;">${d.label}</div>
        <div style="font-size: 0.88rem; font-weight: 800; color: ${best ? '#2ed573' : '#57606f'};">
          ${best ? `${best}s` : '--'}
        </div>
      </div>
    `;
  }).join('');

  // Update Optional Rebirth Section
  document.getElementById('prestige-tier-num').textContent = careerData.rebirths;
  document.getElementById('prestige-bonus-pct').textContent = careerData.rebirths * 50;

  const rebirthBtn = document.getElementById('do-rebirth-btn');
  const currentLvl = typeof shopState !== 'undefined' ? shopState.level : 1;
  const canRebirth = currentLvl >= 10;

  if (canRebirth) {
    rebirthBtn.style.background = 'linear-gradient(135deg, #ff9ff3, #a55eea)';
    rebirthBtn.style.color = '#07080c';
    rebirthBtn.style.cursor = 'pointer';
    rebirthBtn.textContent = `👑 Rebirth Now (Gain +50% Permanent Multiplier)`;
    rebirthBtn.onclick = performOptionalRebirth;
  } else {
    rebirthBtn.style.background = 'rgba(255,255,255,0.08)';
    rebirthBtn.style.color = '#747d8c';
    rebirthBtn.style.cursor = 'not-allowed';
    rebirthBtn.textContent = `🔒 Reach Hunter Level 10 to Rebirth (Current: Lv.${currentLvl})`;
    rebirthBtn.onclick = null;
  }
}

function performOptionalRebirth() {
  if (typeof shopState === 'undefined' || shopState.level < 10) return;

  careerData.rebirths++;
  saveCareerData();

  // Reset Level, XP, Coins & Armory Upgrades (Keep Crosshairs, Themes, Trophies & Best Times!)
  shopState.level = 1;
  shopState.xp = 0;
  shopState.coins = 100 * careerData.rebirths; // Starter bonus coins per Rebirth
  shopState.upgrades = { damage: 1, battery: 0, radius: 0, turret: 0 };
  saveShopData();

  unlockRainbowCrosshair();
  if (typeof applyCrosshair === 'function') applyCrosshair('rainbow');

  if (typeof sfx !== 'undefined') sfx.victory();
  triggerScreenShake();
  renderCareerModal();
}

// --- Gameplay Hooks for Lifetime Tracking & Prestige Multipliers ---

// 1. Apply Permanent Rebirth Coin & XP Multiplier
if (typeof addCoinsAndXP === 'function') {
  const _careerOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const mult = 1 + careerData.rebirths * 0.5;
    const boostedCoins = Math.round(coinAmt * mult);
    const boostedXP = Math.round(xpAmt * mult);

    careerData.totalCoinsEarned += boostedCoins;
    saveCareerData();

    _careerOrigCoins(boostedCoins, boostedXP);
  };
}

// 2. Track Lifetime Kills & Bosses
const _careerOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  careerData.totalKills++;
  if (monster.type === 'boss') careerData.bossesSlain++;
  saveCareerData();
  _careerOrigDefeat(monster, clickX, clickY);
};

// 3. Track Career Shots & Hits at End of Run
const _careerOrigVictory = endGameVictory;
endGameVictory = function() {
  careerData.totalShots += totalClicks;
  careerData.totalHits += successfulHits;
  saveCareerData();
  _careerOrigVictory();
};
