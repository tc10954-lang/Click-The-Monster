// --- Escalating Combo Fever Rush (+0.25x every 25 Combo) + Live HUD Dock + Flex Card ---
let currentFeverTier = 0;

function getFeverTierForCombo(c) {
  if (c >= 100) return 4; // 2.00x+ Godlike
  if (c >= 75)  return 3; // 1.75x Blazing
  if (c >= 50)  return 2; // 1.50x Super
  if (c >= 25)  return 1; // 1.25x Fever
  return 0;
}

function getFeverCoinMultiplier(c) {
  const steps = Math.floor(c / 25);
  return 1 + steps * 0.25; // x25 = 1.25x, x50 = 1.50x, x75 = 1.75x, x100 = 2.00x...
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Escalating Fever Border Overlays & Pill
  const style = document.createElement('style');
  style.textContent = `
    #fever-border-fx {
      position: fixed; inset: 0; pointer-events: none; z-index: 33;
      opacity: 0; transition: opacity 0.3s ease, box-shadow 0.3s ease;
    }
    #fever-border-fx.tier-1 {
      opacity: 1;
      box-shadow: inset 0 0 40px rgba(255, 159, 67, 0.5);
    }
    #fever-border-fx.tier-2 {
      opacity: 1;
      box-shadow: inset 0 0 65px rgba(0, 210, 211, 0.65), inset 0 0 20px rgba(255, 211, 42, 0.5);
    }
    #fever-border-fx.tier-3 {
      opacity: 1;
      box-shadow: inset 0 0 85px rgba(255, 71, 87, 0.8), inset 0 0 30px rgba(255, 159, 67, 0.75);
    }
    @keyframes godlikePulse {
      0%   { box-shadow: inset 0 0 100px rgba(255, 71, 87, 0.9), inset 0 0 40px rgba(255, 211, 42, 0.85); }
      50%  { box-shadow: inset 0 0 120px rgba(165, 94, 234, 0.95), inset 0 0 45px rgba(0, 210, 211, 0.9); }
      100% { box-shadow: inset 0 0 100px rgba(255, 71, 87, 0.9), inset 0 0 40px rgba(255, 211, 42, 0.85); }
    }
    #fever-border-fx.tier-4 {
      opacity: 1;
      animation: godlikePulse 0.85s infinite ease-in-out;
    }
    #fever-pill {
      position: fixed; top: 76px; left: 50%; transform: translateX(-50%);
      padding: 4px 14px; border-radius: 50px; font-weight: 900; font-size: 0.82rem;
      letter-spacing: 1px; pointer-events: none; z-index: 46; display: none;
      text-transform: uppercase;
    }
    #live-loadout-dock {
      position: fixed; bottom: 14px; left: 16px;
      display: none; align-items: center; gap: 8px;
      background: rgba(10, 12, 20, 0.82); backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      padding: 6px 12px; border-radius: 12px; z-index: 44;
      font-size: 0.78rem; color: #dfe4ea; pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  const borderFx = document.createElement('div');
  borderFx.id = 'fever-border-fx';
  document.body.appendChild(borderFx);

  const feverPill = document.createElement('div');
  feverPill.id = 'fever-pill';
  document.body.appendChild(feverPill);

  // 2. Inject Live Bottom-Left Loadout Mini-Dock
  const dock = document.createElement('div');
  dock.id = 'live-loadout-dock';
  document.body.appendChild(dock);

  // 3. Add "📋 Copy Flex Scorecard" Button on Victory Screen
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn && restartBtn.parentNode) {
    const copyBtn = document.createElement('button');
    copyBtn.id = 'copy-flex-btn';
    copyBtn.className = 'action-btn';
    copyBtn.innerHTML = '📋 Copy Flex Scorecard';
    copyBtn.style.cssText = 'margin-bottom: 8px; background: linear-gradient(135deg, #00d2d3, #54a0ff); color: #07080c;';

    copyBtn.addEventListener('click', () => {
      const timeVal = document.getElementById('final-time')?.textContent || '0.00s';
      const accVal = document.getElementById('final-accuracy')?.textContent || '100%';
      const comboVal = document.getElementById('final-combo')?.textContent || 'x1';
      const rb = typeof careerData !== 'undefined' ? careerData.rebirths : 0;
      const modeName = (typeof contractState !== 'undefined' && contractState.active)
        ? 'Mythic Contract'
        : ((typeof bossRushState !== 'undefined' && bossRushState.active)
          ? 'Boss Rush'
          : (typeof currentDiff !== 'undefined' ? currentDiff.toUpperCase() : 'NORMAL'));

      const shareText = `👾 CLICK THE MONSTER | Mode: ${modeName} | ⏱️ ${timeVal} | 🎯 ${accVal} | 🔥 Max Combo: ${comboVal} | 👑 Rebirth Tier ${rb}\nPlay here: https://github.io`;

      navigator.clipboard.writeText(shareText).then(() => {
        copyBtn.innerHTML = '✅ Copied! Paste in Chat/Email!';
        setTimeout(() => { copyBtn.innerHTML = '📋 Copy Flex Scorecard'; }, 2500);
      }).catch(() => {
        copyBtn.innerHTML = '📋 Ready to Share!';
      });
    });

    restartBtn.parentNode.insertBefore(copyBtn, restartBtn);
  }
});
function updateFeverVisuals() {
  const borderFx = document.getElementById('fever-border-fx');
  const pill = document.getElementById('fever-pill');
  if (!borderFx || !pill) return;

  if (!isGameRunning) {
    currentFeverTier = 0;
    borderFx.className = '';
    pill.style.display = 'none';
    return;
  }

  const tier = getFeverTierForCombo(combo);
  const mult = getFeverCoinMultiplier(combo);
  currentFeverTier = tier;

  borderFx.className = tier > 0 ? `tier-${tier}` : '';

  if (tier === 0) {
    pill.style.display = 'none';
    return;
  }

  const tierConfigs = {
    1: { text: `🔥 FEVER RUSH (${mult.toFixed(2)}x COINS)`, bg: 'rgba(255, 159, 67, 0.92)', color: '#07080c', border: '#fff' },
    2: { text: `⚡ SUPER FEVER (${mult.toFixed(2)}x COINS + SHOCKWAVE)`, bg: 'rgba(0, 210, 211, 0.92)', color: '#07080c', border: '#ffd32a' },
    3: { text: `☄️ BLAZING FEVER (${mult.toFixed(2)}x COINS + MEGA WAVE)`, bg: 'rgba(255, 71, 87, 0.94)', color: '#fff', border: '#ffd32a' },
    4: { text: `🌌 GODLIKE OVERDRIVE (${mult.toFixed(2)}x COINS!)`, bg: 'linear-gradient(135deg, #ff9ff3, #a55eea)', color: '#07080c', border: '#fff' }
  };

  const cfg = tierConfigs[tier];
  pill.style.display = 'block';
  pill.style.background = cfg.bg;
  pill.style.color = cfg.color;
  pill.style.border = `2px solid ${cfg.border}`;
  pill.textContent = cfg.text;
}

function updateLiveLoadoutDock() {
  const dock = document.getElementById('live-loadout-dock');
  if (!dock) return;

  if (!isGameRunning) {
    dock.style.display = 'none';
    return;
  }

  const parts = [];

  // 1. Equipped Battle Pets
  if (typeof endgameState !== 'undefined' && typeof PET_CATALOG !== 'undefined' && endgameState.equippedPets.length > 0) {
    const petIcons = endgameState.equippedPets
      .map(id => PET_CATALOG.find(p => p.id === id)?.icon || '')
      .filter(Boolean)
      .join(' ');
    if (petIcons) parts.push(`<span>🐾 ${petIcons}</span>`);
  }

  // 2. Equipped Artifact Relics
  if (typeof relicState !== 'undefined' && typeof RELIC_CATALOG !== 'undefined' && relicState.equipped.length > 0) {
    const relicIcons = relicState.equipped
      .map(id => RELIC_CATALOG.find(r => r.id === id)?.icon || '')
      .filter(Boolean)
      .join(' ');
    if (relicIcons) parts.push(`<span>🏺 ${relicIcons}</span>`);
  }

  // 3. Active Chaos Mutators
  if (typeof activeMutators !== 'undefined' && typeof MUTATOR_LIST !== 'undefined') {
    const mutIcons = MUTATOR_LIST
      .filter(m => activeMutators[m.id])
      .map(m => m.icon)
      .join(' ');
    if (mutIcons) parts.push(`<span style="color:#e056fd;">🎲 ${mutIcons}</span>`);
  }

  if (parts.length === 0) {
    dock.style.display = 'none';
  } else {
    dock.style.display = 'flex';
    dock.innerHTML = parts.join('<span style="opacity:0.35;">|</span>');
  }
}

// Sync Fever Visuals & Live Loadout Dock smoothly every 150ms
setInterval(() => {
  updateFeverVisuals();
  updateLiveLoadoutDock();
}, 150);

// Apply Escalating Fever Coin Multiplier (+0.25x every 25 combo!)
if (typeof addCoinsAndXP === 'function') {
  const _feverOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const mult = isGameRunning ? getFeverCoinMultiplier(combo) : 1;
    _feverOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}

// Heavier Fever Shockwaves at Higher Combo Tiers (Tier 2 = 55px splash, Tier 3 = 85px, Tier 4 = 115px!)
const _feverOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  _feverOrigClick(monster, clickX, clickY);

  if (!isGameRunning || currentFeverTier < 2) return;
  if (typeof contractState !== 'undefined' && contractState.active) return; // Keep Contracts fair!

  const splashRadius = currentFeverTier === 2 ? 55 : (currentFeverTier === 3 ? 85 : 115);

  const ring = document.createElement('div');
  ring.className = 'splash-ring';
  ring.style.width = `${splashRadius * 2}px`;
  ring.style.height = `${splashRadius * 2}px`;
  ring.style.left = `${clickX}px`;
  ring.style.top = `${clickY}px`;
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 300);

  monsters.forEach(m => {
    if (m === monster) return;
    const dist = Math.hypot((m.x + m.size / 2) - clickX, (m.y + m.size / 2) - clickY);
    if (dist <= splashRadius) {
      _feverOrigClick(m, m.x + m.size / 2, m.y + m.size / 2);
    }
  });
};

