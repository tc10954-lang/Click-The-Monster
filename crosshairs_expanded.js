// --- 19-Crosshair Prestige & Endgame Armory (Coins, Rebirths, Feats & Secret 0456 Dev Sight!) ---
const crosshairArmoryState = {
  owned: JSON.parse(localStorage.getItem('monster_owned_crosshairs_v2') || '["default"]'),
  equipped: localStorage.getItem('monster_equipped_crosshair_v2') || 'default'
};

function saveCrosshairArmory() {
  localStorage.setItem('monster_owned_crosshairs_v2', JSON.stringify(crosshairArmoryState.owned));
  localStorage.setItem('monster_equipped_crosshair_v2', crosshairArmoryState.equipped);
}

const PRESTIGE_CROSSHAIRS = [
  { id: 'default', name: 'Tactical Dot', unlockType: 'coin', cost: 0, reqText: 'Starter', trailColor: null,
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="3" fill="#fff"/><circle cx="20" cy="20" r="10" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.6"/></svg>` },
  { id: 'cyber', name: 'Cyber Cross', unlockType: 'coin', cost: 500, reqText: '500 🪙', trailColor: '#00d2d3',
    svg: `<svg viewBox="0 0 40 40"><path d="M20 4V14M20 26V36M4 20H14M26 20H36" stroke="#00d2d3" stroke-width="2.5"/><circle cx="20" cy="20" r="2.5" fill="#fff"/></svg>` },
  { id: 'trilock', name: 'Crimson Tri-Lock', unlockType: 'coin', cost: 3500, reqText: '3,500 🪙', trailColor: '#ff4757',
    svg: `<svg viewBox="0 0 40 40"><polygon points="20,4 35,31 5,31" fill="none" stroke="#ff4757" stroke-width="2.2"/><circle cx="20" cy="22" r="3" fill="#ff4757"/></svg>` },
  { id: 'biohazard', name: 'Volt Bio-Sight', unlockType: 'coin', cost: 12000, reqText: '12,000 🪙', trailColor: '#2ed573',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" fill="none" stroke="#2ed573" stroke-width="2" stroke-dasharray="8 4"/><circle cx="20" cy="12" r="4" fill="none" stroke="#2ed573" stroke-width="2"/><circle cx="13" cy="24" r="4" fill="none" stroke="#2ed573" stroke-width="2"/><circle cx="27" cy="24" r="4" fill="none" stroke="#2ed573" stroke-width="2"/></svg>` },
  { id: 'cryo', name: 'Cryo Starburst', unlockType: 'coin', cost: 35000, reqText: '35,000 🪙', trailColor: '#70a1ff',
    svg: `<svg viewBox="0 0 40 40"><path d="M20 3V37M3 20H37M8 8L32 32M32 8L8 32" stroke="#70a1ff" stroke-width="2"/><polygon points="20,12 28,20 20,28 12,20" fill="none" stroke="#fff" stroke-width="2"/></svg>` },
  { id: 'hellfire', name: 'Hellfire Pentagram', unlockType: 'coin', cost: 85000, reqText: '85,000 🪙', trailColor: '#ff6348',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#ff4757" stroke-width="2"/><polygon points="20,4 29,34 5,15 35,15 11,34" fill="none" stroke="#ffa502" stroke-width="1.8"/></svg>` },
  { id: 'diamond', name: 'Diamond Guillotine', unlockType: 'coin', cost: 200000, reqText: '200,000 🪙', trailColor: '#1e90ff',
    svg: `<svg viewBox="0 0 40 40"><polygon points="20,2 38,20 20,38 2,20" fill="none" stroke="#00d2d3" stroke-width="2.5"/><polygon points="20,9 31,20 20,31 9,20" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="20" cy="20" r="2.5" fill="#00d2d3"/></svg>` },
  { id: 'monarch', name: 'Golden Monarch', unlockType: 'coin', cost: 500000, reqText: '500,000 🪙', trailColor: '#ffd32a',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="#ffd32a" stroke-width="2.2"/><path d="M10 25L12 14L17 20L20 11L23 20L28 14L30 25Z" fill="#ffd32a"/></svg>` },
  { id: 'blackhole', name: 'Event Horizon', unlockType: 'coin', cost: 1250000, reqText: '1,250,000 🪙', trailColor: '#a55eea',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="7" fill="#07080c" stroke="#ff9ff3" stroke-width="2.5"/><ellipse cx="20" cy="20" rx="18" ry="7" fill="none" stroke="#a55eea" stroke-width="2" transform="rotate(-25 20 20)"/></svg>` },
  { id: 'rgb', name: 'RGB Hyper-Prism', unlockType: 'coin', cost: 2500000, reqText: '2,500,000 🪙', trailColor: 'rainbow',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#ff4757" stroke-width="2.5" stroke-dasharray="12 6"/><circle cx="20" cy="20" r="10" fill="none" stroke="#00d2d3" stroke-width="2" stroke-dasharray="8 4"/><circle cx="20" cy="20" r="3.5" fill="#ffd32a"/></svg>` },
  { id: 'rb5', name: 'R5: Astral Vortex', unlockType: 'rebirth', reqVal: 5, reqText: '5 Rebirths 👑', trailColor: '#00d2d3',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#00d2d3" stroke-width="2" stroke-dasharray="18 6"/><path d="M20 6A14 14 0 0 1 34 20" fill="none" stroke="#ff9ff3" stroke-width="3"/><circle cx="20" cy="20" r="3" fill="#fff"/></svg>` },
  { id: 'rb10', name: 'R10: Dragon Eye', unlockType: 'rebirth', reqVal: 10, reqText: '10 Rebirths 👑', trailColor: '#ffa502',
    svg: `<svg viewBox="0 0 40 40"><path d="M3 20Q20 5 37 20Q20 35 3 20Z" fill="none" stroke="#ffa502" stroke-width="2.5"/><ellipse cx="20" cy="20" rx="3" ry="8" fill="#ff4757"/></svg>` },
  { id: 'rb15', name: 'R15: Supernova', unlockType: 'rebirth', reqVal: 15, reqText: '15 Rebirths 👑', trailColor: '#ff9ff3',
    svg: `<svg viewBox="0 0 40 40"><polygon points="20,1 24,15 39,20 24,25 20,39 16,25 1,20 16,15" fill="none" stroke="#ff9ff3" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="#ffd32a"/></svg>` },
  { id: 'rb20', name: 'R20: All-Seeing Void', unlockType: 'rebirth', reqVal: 20, reqText: '20 Rebirths 👑', trailColor: '#a55eea',
    svg: `<svg viewBox="0 0 40 40"><polygon points="20,3 36,33 4,33" fill="none" stroke="#a55eea" stroke-width="2.2"/><circle cx="20" cy="22" r="6" fill="none" stroke="#00d2d3" stroke-width="2"/><circle cx="20" cy="22" r="2.5" fill="#fff"/></svg>` },
  { id: 'rb25', name: 'R25: Excalibur Halo', unlockType: 'rebirth', reqVal: 25, reqText: '25 Rebirths 👑', trailColor: '#ffd32a',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="#ffd32a" stroke-width="2.5"/><path d="M20 2V38M11 13H29" stroke="#fff" stroke-width="2.5"/></svg>` },
  { id: 'rb30', name: 'R30: Omega God-Sight', unlockType: 'rebirth', reqVal: 30, reqText: '30 Rebirths 👑', trailColor: 'rainbow',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#ffd32a" stroke-width="2.5"/><polygon points="20,4 34,28 6,28" fill="none" stroke="#ff4757" stroke-width="2"/><polygon points="20,36 34,12 6,12" fill="none" stroke="#00d2d3" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="#fff"/></svg>` },
  { id: 'feat_hellfire', name: 'Hellfire Conqueror', unlockType: 'feat', featKey: 'hellfire', reqText: 'Beat Hellfire 🔥', trailColor: '#ff4757',
    svg: `<svg viewBox="0 0 40 40"><path d="M20 3C26 11 33 16 33 25A13 13 0 0 1 7 25C7 16 14 11 20 3Z" fill="none" stroke="#ff4757" stroke-width="2.3"/><circle cx="20" cy="24" r="3.5" fill="#ffd32a"/></svg>` },
  { id: 'feat_boss25', name: 'Overlord Executioner', unlockType: 'feat', featKey: 'boss25', reqText: 'Kill 25 Bosses 👹', trailColor: '#ff6b81',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="none" stroke="#ff6b81" stroke-width="2.5"/><path d="M10 10L30 30M30 10L10 30" stroke="#fff" stroke-width="2.5"/></svg>` },
  { id: 'dev_architect', name: '👑 Architect Dev Sight', unlockType: 'dev', reqText: '🔑 Enter Dev Code', trailColor: 'rainbow',
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#ffd32a" stroke-width="2.2" stroke-dasharray="6 3"/><circle cx="20" cy="20" r="11" fill="none" stroke="#00d2d3" stroke-width="2"/><path d="M13 23L15 15L20 19L25 15L27 23Z" fill="#ffd32a"/><circle cx="20" cy="20" r="2.2" fill="#fff"/></svg>` }
];
function isCrosshairUnlocked(ch) {
  if (crosshairArmoryState.owned.includes(ch.id)) return true;

  if (ch.unlockType === 'rebirth') {
    const rb = typeof careerData !== 'undefined' ? (careerData.rebirths || 0) : 0;
    if (rb >= ch.reqVal) {
      crosshairArmoryState.owned.push(ch.id);
      saveCrosshairArmory();
      return true;
    }
  }

  if (ch.unlockType === 'feat') {
    const career = typeof careerData !== 'undefined' ? careerData : {};
    const unlockedAchs = JSON.parse(localStorage.getItem('monster_achievements') || '[]');
    if (ch.featKey === 'hellfire' && (unlockedAchs.includes('hellfire_win') || (career.hellfireWins || 0) > 0)) {
      crosshairArmoryState.owned.push(ch.id);
      saveCrosshairArmory();
      return true;
    }
    if (ch.featKey === 'boss25' && (career.bossesDefeated || 0) >= 25) {
      crosshairArmoryState.owned.push(ch.id);
      saveCrosshairArmory();
      return true;
    }
  }
  return false;
}

window.addEventListener('DOMContentLoaded', () => {
  const mergeIntoExistingCrosshairArmory = () => {
    const existingGrid = document.getElementById('ch-armory-grid')
      || document.getElementById('crosshair-shop-grid')
      || document.getElementById('crosshair-grid')
      || [...document.querySelectorAll('div')].find(el =>
        el.children.length >= 4 &&
        el.children.length <= 6 &&
        /RGB|Crosshair|Default/i.test(el.textContent) &&
        el.querySelector('button')
      );

    if (existingGrid && !existingGrid.dataset.upgraded19) {
      existingGrid.id = 'ch-armory-grid';
      existingGrid.dataset.upgraded19 = '1';
      existingGrid.style.display = 'grid';
      existingGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(135px, 1fr))';
      existingGrid.style.gap = '8px';
      renderCrosshairArmoryModal();
    }
  };

  setInterval(() => {
    const shopModal = document.getElementById('shop-modal');
    if (shopModal && !shopModal.classList.contains('hidden')) {
      mergeIntoExistingCrosshairArmory();
    }
  }, 300);
});

function renderCrosshairArmoryModal() {
  const grid = document.getElementById('ch-armory-grid');
  const coins = typeof shopState !== 'undefined' ? shopState.coins : 0;
  if (!grid) return;

  grid.innerHTML = PRESTIGE_CROSSHAIRS.map(ch => {
    const unlocked = isCrosshairUnlocked(ch);
    const equipped = crosshairArmoryState.equipped === ch.id;
    const canBuy = !unlocked && ch.unlockType === 'coin' && coins >= ch.cost;
    const isDev = ch.unlockType === 'dev';

    let btnLabel = ch.reqText;
    let btnBg = 'rgba(255,255,255,0.08)';
    let btnColor = '#747d8c';

    if (equipped) {
      btnLabel = '✅ EQUIPPED';
      btnBg = '#00d2d3';
      btnColor = '#07080c';
    } else if (unlocked) {
      btnLabel = 'Equip';
      btnBg = '#2ed573';
      btnColor = '#07080c';
    } else if (canBuy) {
      btnLabel = `Buy (${ch.cost.toLocaleString()} 🪙)`;
      btnBg = '#ffd32a';
      btnColor = '#07080c';
    } else if (isDev) {
      btnLabel = '🔑 Enter Dev Code';
      btnBg = 'rgba(165,94,234,0.28)';
      btnColor = '#ff9ff3';
    }

    return `
      <div class="ch-card-item" data-id="${ch.id}" style="
        background: ${equipped ? 'rgba(0,210,211,0.16)' : (isDev ? 'rgba(165,94,234,0.12)' : 'rgba(255,255,255,0.04)')};
        border: 1.5px solid ${equipped ? '#00d2d3' : (isDev ? '#a55eea' : (unlocked ? 'rgba(46,213,115,0.45)' : 'rgba(255,255,255,0.12)'))};
        border-radius: 12px; padding: 10px 8px; text-align: center; cursor: pointer;
      ">
        <div style="width: 44px; height: 44px; margin: 0 auto 6px auto;">${ch.svg}</div>
        <div style="font-weight: 900; font-size: 0.78rem; color: ${isDev ? '#ff9ff3' : '#fff'}; margin-bottom: 6px;">${ch.name}</div>
        <div style="padding: 5px; border-radius: 6px; font-weight: 900; font-size: 0.7rem; background: ${btnBg}; color: ${btnColor};">
          ${btnLabel}
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.ch-card-item').forEach(card => {
    card.addEventListener('click', () => {
      const ch = PRESTIGE_CROSSHAIRS.find(item => item.id === card.dataset.id);
      if (!ch) return;

      if (isCrosshairUnlocked(ch)) {
        crosshairArmoryState.equipped = ch.id;
        saveCrosshairArmory();
        if (typeof sfx !== 'undefined') sfx.powerup();
        applyActiveCrosshairVisual();
        renderCrosshairArmoryModal();
        return;
      }

      if (ch.unlockType === 'coin' && typeof shopState !== 'undefined' && shopState.coins >= ch.cost) {
        shopState.coins -= ch.cost;
        saveShopData();
        crosshairArmoryState.owned.push(ch.id);
        crosshairArmoryState.equipped = ch.id;
        saveCrosshairArmory();
        if (typeof sfx !== 'undefined') sfx.powerup();
        applyActiveCrosshairVisual();
        renderCrosshairArmoryModal();
      } else if (ch.unlockType === 'dev') {
        const code = prompt('Enter Developer Passcode:');
        if (code && code.trim() === '0456') {
          crosshairArmoryState.owned.push(ch.id);
          crosshairArmoryState.equipped = ch.id;
          saveCrosshairArmory();
          if (typeof sfx !== 'undefined') sfx.powerup();
          applyActiveCrosshairVisual();
          renderCrosshairArmoryModal();
        } else if (code !== null) {
          alert('❌ Access Denied: Invalid Developer Code.');
        }
      }
    });
  });
}
// --- Live Animated SVG Reticle & Cursor Trail Engine ---
let customReticleEl = null;
let reticleHue = 0;
let lastTrailTime = 0;

function getEquippedCrosshair() {
  return PRESTIGE_CROSSHAIRS.find(c => c.id === crosshairArmoryState.equipped) || PRESTIGE_CROSSHAIRS.at(0);
}

function applyActiveCrosshairVisual() {
  const ch = getEquippedCrosshair();
  if (!customReticleEl) {
    customReticleEl = document.createElement('div');
    customReticleEl.id = 'prestige-custom-reticle';
    customReticleEl.style.cssText = `
      position: fixed; width: 42px; height: 42px; pointer-events: none;
      z-index: 9999; transform: translate(-50%, -50%); transition: transform 0.06s ease-out;
      display: none;
    `;
    document.body.appendChild(customReticleEl);
  }

  customReticleEl.innerHTML = ch.svg;
  customReticleEl.style.display = ch.id === 'default' ? 'none' : 'block';

  const field = document.getElementById('play-field');
  if (field) {
    field.style.cursor = ch.id === 'default' ? 'crosshair' : 'none';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  applyActiveCrosshairVisual();
});

window.addEventListener('mousemove', (e) => {
  const ch = getEquippedCrosshair();
  if (!customReticleEl || ch.id === 'default') return;

  customReticleEl.style.left = `${e.clientX}px`;
  customReticleEl.style.top = `${e.clientY}px`;

  if (ch.trailColor === 'rainbow') {
    reticleHue = (reticleHue + 6) % 360;
    customReticleEl.style.filter = `hue-rotate(${reticleHue}deg) drop-shadow(0 0 8px hsl(${reticleHue}, 100%, 60%))`;
  } else {
    customReticleEl.style.filter = ch.trailColor ? `drop-shadow(0 0 6px ${ch.trailColor})` : 'none';
  }

  const now = performance.now();
  if (typeof isGameRunning !== 'undefined' && isGameRunning && ch.trailColor && now - lastTrailTime > 38) {
    lastTrailTime = now;
    const spark = document.createElement('div');
    const color = ch.trailColor === 'rainbow' ? `hsl(${reticleHue}, 100%, 60%)` : ch.trailColor;
    spark.style.cssText = `
      position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
      width: 6px; height: 6px; border-radius: 50%; background: ${color};
      box-shadow: 0 0 8px ${color}; pointer-events: none; z-index: 9998;
      transform: translate(-50%, -50%); transition: all 0.35s ease-out;
    `;
    document.body.appendChild(spark);
    requestAnimationFrame(() => {
      spark.style.opacity = '0';
      spark.style.transform = `translate(${(Math.random() - 0.5) * 24}px, ${(Math.random() - 0.5) * 24}px) scale(0.2)`;
    });
    setTimeout(() => spark.remove(), 360);
  }
});

window.addEventListener('mousedown', (e) => {
  const ch = getEquippedCrosshair();
  if (!customReticleEl || ch.id === 'default') return;

  customReticleEl.style.transform = 'translate(-50%, -50%) scale(1.38) rotate(25deg)';
  setTimeout(() => {
    if (customReticleEl) customReticleEl.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
  }, 90);

  if (typeof isGameRunning !== 'undefined' && isGameRunning && ch.trailColor) {
    const color = ch.trailColor === 'rainbow' ? `hsl(${reticleHue}, 100%, 60%)` : ch.trailColor;
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
      width: 12px; height: 12px; border: 2px solid ${color}; border-radius: 50%;
      pointer-events: none; z-index: 9998; transform: translate(-50%, -50%);
      transition: all 0.28s ease-out;
    `;
    document.body.appendChild(ring);
    requestAnimationFrame(() => {
      ring.style.width = '46px';
      ring.style.height = '46px';
      ring.style.opacity = '0';
    });
    setTimeout(() => ring.remove(), 300);
  }
});
