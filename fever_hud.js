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
  <script src="soundtrack.js"></script>
  <script src="more_achievements.js"></script>
  <script src="fever_hud.js"></script>
</body>

