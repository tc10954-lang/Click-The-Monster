// === START CHUNK 1 OF 3: abyssal_spire.js ===
// --- 🏰 The 50-Floor Abyssal Spire (Roguelike Tarot Card Dungeon) ---
const spireState = Object.assign({
  bestFloor: 1
}, JSON.parse(localStorage.getItem('monster_abyssal_spire_v1') || '{}'));

function saveSpireState() {
  localStorage.setItem('monster_abyssal_spire_v1', JSON.stringify(spireState));
}

const SPIRE_TAROT_CARDS = [
  { id: 'glass_cannon', icon: '🗡️', name: 'The Glass Blade',      color: '#ff4757', desc: '+12 Bonus Click DMG, but Floor Timer -3s!' },
  { id: 'vampire_fang', icon: '🧛', name: 'Crimson Siphon',       color: '#ff6b81', desc: 'Every monster kill adds +0.45s to your timer!' },
  { id: 'midas_touch',  icon: '👑', name: 'The Gilded Fool',      color: '#ffd32a', desc: '+100% Floor Coin Payouts for this climb!' },
  { id: 'chrono_orb',   icon: '⏳', name: 'Hourglass of Frost',   color: '#00d2d3', desc: 'All Spire monsters move 30% slower!' },
  { id: 'titan_lens',   icon: '🎯', name: 'Eye of the Colossus',  color: '#2ed573', desc: 'Monsters spawn 25% larger & easier to click!' },
  { id: 'lightning_arc',icon: '⚡', name: 'Tempest Arcana',       color: '#a55eea', desc: '25% chance on hit to strike for 30 Bonus DMG!' },
  { id: 'boss_breaker', icon: '🔱', name: 'The Regicide Card',    color: '#ff9f43', desc: '+45 Bonus DMG against Floor Bosses!' },
  { id: 'scrap_magnet', icon: '🔩', name: 'Forge Scavenger',      color: '#54a0ff', desc: 'Gain +15 Gear Scrap after clearing every floor!' }
];

let activeSpireRun = null;

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🏰 Abyssal Spire (50F)" button to Start Menu
  const spireBtn = document.createElement('button');
  spireBtn.className = 'action-btn';
  spireBtn.innerHTML = '🏰 Abyssal Spire';
  spireBtn.style.cssText = 'background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: #fff;';
  spireBtn.addEventListener('click', openSpireLobby);

  const extrasGrid = document.getElementById('menu-extras-grid');
  const startCard = document.querySelector('#start-screen .card');
  if (extrasGrid) extrasGrid.appendChild(spireBtn);
  else if (startCard) startCard.appendChild(spireBtn);

  // 2. Build Spire Lobby & Roguelike Climb Overlay
  const overlay = document.createElement('div');
  overlay.id = 'abyssal-spire-overlay';
  overlay.className = 'screen-overlay';
  overlay.style.cssText = 'display: none; z-index: 172; background: rgba(6, 7, 14, 0.97);';
  overlay.innerHTML = `
    <div id="spire-lobby-card" class="card" style="max-width: 560px; width: 93vw; text-align: center; padding: 18px;">
      <h2 style="color: #a29bfe; margin: 0 0 4px 0; font-size: 1.65rem;">🏰 The 50-Floor Abyssal Spire</h2>
      <p class="subtitle" style="margin-bottom: 12px;">
        Climb 50 escalating roguelike floors! Draft stacked <b>Tarot Cards</b> between floors to break the game.
      </p>
      <div style="background: rgba(162,155,254,0.12); border: 1.5px solid #a29bfe; border-radius: 10px; padding: 10px; margin-bottom: 14px; font-weight: 900; color: #fff;">
        🏆 Personal Record: Floor <span id="spire-best-floor" style="color: #ffd32a;">1</span> / 50
      </div>
      <button id="start-spire-run-btn" class="action-btn" style="width: 100%; padding: 12px; margin-bottom: 8px; background: linear-gradient(135deg, #6c5ce7, #00d2d3); color: #fff;">
        ⚔️ ENTER FLOOR 1
      </button>
      <button id="close-spire-lobby-btn" class="action-btn" style="width: 100%; padding: 9px; background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">
        Return to Menu
      </button>
    </div>

    <div id="spire-combat-view" style="display: none; width: 100%; height: 100%; flex-direction: column; align-items: center; justify-content: center; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 680px; max-width: 95vw; margin-bottom: 8px;">
        <div style="font-weight: 900; color: #a29bfe; font-size: 1.15rem;">🏰 FLOOR <span id="spire-cur-floor">1</span> / 50</div>
        <div id="spire-timer-display" style="font-weight: 900; color: #ffd32a; font-size: 1.15rem;">⏱️ 18.0s</div>
        <button id="spire-abandon-btn" style="padding: 5px 10px; border: 1px solid #ff4757; border-radius: 6px; background: rgba(255,71,87,0.2); color: #ff6b81; font-weight: 900; font-size: 0.75rem; cursor: pointer;">Abandon</button>
      </div>
      <div id="spire-active-cards-bar" style="width: 680px; max-width: 95vw; font-size: 0.72rem; color: #00d2d3; font-weight: 800; margin-bottom: 6px; text-align: left;">
        Active Tarot Cards: None
      </div>
      <div id="spire-arena-box" style="position: relative; width: 680px; max-width: 95vw; height: 380px; background: #090b14; border: 3px solid #a29bfe; border-radius: 12px; overflow: hidden;"></div>
    </div>

    <div id="spire-draft-view" class="card" style="display: none; max-width: 640px; width: 94vw; text-align: center; padding: 18px;">
      <h2 style="color: #ffd32a; margin: 0 0 4px 0; font-size: 1.5rem;">🃏 Floor Cleared! Draft a Tarot Card</h2>
      <p class="subtitle" style="margin-bottom: 12px;">Choose 1 permanent blessing to stack for the rest of your climb:</p>
      <div id="spire-tarot-choices" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('close-spire-lobby-btn').addEventListener('click', () => {
    overlay.style.display = 'none';
  });
  document.getElementById('start-spire-run-btn').addEventListener('click', startSpireClimb);
  document.getElementById('spire-abandon-btn').addEventListener('click', endSpireRun);
});
// === END CHUNK 1 OF 3 ===
// === START CHUNK 2 OF 3: abyssal_spire.js ===
let spireTickTimer = null;

function openSpireLobby() {
  const overlay = document.getElementById('abyssal-spire-overlay');
  document.getElementById('spire-best-floor').textContent = spireState.bestFloor;
  document.getElementById('spire-lobby-card').style.display = 'block';
  document.getElementById('spire-combat-view').style.display = 'none';
  document.getElementById('spire-draft-view').style.display = 'none';
  overlay.style.display = 'flex';
}

function startSpireClimb() {
  activeSpireRun = {
    floor: 1,
    cards: [],
    monsters: [],
    timeLeft: 18.0
  };
  launchSpireFloor(1);
}

function countSpireCard(id) {
  if (!activeSpireRun) return 0;
  return activeSpireRun.cards.filter(c => c.id === id).length;
}

function launchSpireFloor(floorNum) {
  clearInterval(spireTickTimer);
  activeSpireRun.floor = floorNum;

  const glassCount = countSpireCard('glass_cannon');
  activeSpireRun.timeLeft = Math.max(8, 18.0 - (glassCount * 3));

  document.getElementById('spire-lobby-card').style.display = 'none';
  document.getElementById('spire-draft-view').style.display = 'none';
  const combatView = document.getElementById('spire-combat-view');
  combatView.style.display = 'flex';

  document.getElementById('spire-cur-floor').textContent = floorNum;
  const cardSummary = activeSpireRun.cards.length
    ? activeSpireRun.cards.map(c => `${c.icon} ${c.name}`).join(' • ')
    : 'None yet';
  document.getElementById('spire-active-cards-bar').textContent = `Active Tarot Cards: ${cardSummary}`;

  const arena = document.getElementById('spire-arena-box');
  arena.innerHTML = '';
  const boxW = arena.clientWidth || 640;
  const boxH = arena.clientHeight || 380;

  const isBossFloor = floorNum % 5 === 0;
  const count = isBossFloor ? 1 : Math.min(12, 4 + Math.floor(floorNum / 3));
  const baseHp = isBossFloor
    ? Math.round(140 * Math.pow(1.13, floorNum))
    : Math.round(18 * Math.pow(1.11, floorNum));

  const slowMult = Math.pow(0.7, countSpireCard('chrono_orb'));
  const sizeMult = 1 + (0.25 * countSpireCard('titan_lens'));
  const speed = (2.6 + floorNum * 0.08) * slowMult;

  const icons = isBossFloor ? ['👹', '🐲', '👁️', '💀'] : ['👾', '🟢', '🟣', '🦇', '🔥', '❄️'];
  activeSpireRun.monsters = [];

  for (let i = 0; i < count; i++) {
    const size = Math.round((isBossFloor ? 92 : 54) * sizeMult);
    const icon = icons.at((floorNum + i) % icons.length);
    const m = {
      hp: baseHp,
      maxHp: baseHp,
      isBoss: isBossFloor,
      x: 40 + Math.random() * (boxW - size - 80),
      y: 40 + Math.random() * (boxH - size - 80),
      vx: (Math.random() < 0.5 ? -1 : 1) * speed,
      vy: (Math.random() < 0.5 ? -1 : 1) * speed,
      size,
      el: document.createElement('div')
    };

    m.el.style.cssText = `
      position: absolute; width: ${size}px; height: ${size}px;
      font-size: ${isBossFloor ? '3.8rem' : '2.2rem'}; display: flex; flex-direction: column;
      align-items: center; justify-content: center; cursor: pointer; user-select: none;
    `;
    m.el.innerHTML = `
      <div>${icon}</div>
      <div style="width:80%; height:5px; background:rgba(255,255,255,0.2); border-radius:4px; overflow:hidden;">
        <div class="sp-hp-bar" style="width:100%; height:100%; background:${isBossFloor ? '#ff4757' : '#2ed573'};"></div>
      </div>
    `;

    m.el.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const gearDmg = typeof getEquippedGearTotals === 'function' ? getEquippedGearTotals().bonusDmg : 0;
      let dmg = 8 + gearDmg + (12 * countSpireCard('glass_cannon'));
      if (m.isBoss) dmg += 45 * countSpireCard('boss_breaker');

      const lightningCards = countSpireCard('lightning_arc');
      if (lightningCards > 0 && Math.random() < (0.25 * lightningCards)) {
        dmg += 30 * lightningCards;
        if (typeof spawnFloatingText === 'function') {
          spawnFloatingText(e.clientX, e.clientY - 26, '⚡ ARCANA STRIKE!', '#a55eea');
        }
      }

      m.hp = Math.max(0, m.hp - dmg);
      if (typeof sfx !== 'undefined') sfx.hit();
      if (typeof spawnFloatingText === 'function') {
        spawnFloatingText(e.clientX, e.clientY - 10, `-${dmg}`, '#ffd32a');
      }

      const bar = m.el.querySelector('.sp-hp-bar');
      if (bar) bar.style.width = `${(m.hp / m.maxHp) * 100}%`;

      if (m.hp === 0) {
        m.el.remove();
        activeSpireRun.monsters = activeSpireRun.monsters.filter(item => item !== m);
        const vampCount = countSpireCard('vampire_fang');
        if (vampCount > 0) activeSpireRun.timeLeft += 0.45 * vampCount;
        if (activeSpireRun.monsters.length === 0) {
          handleSpireFloorClear();
        }
      }
    });

    arena.appendChild(m.el);
    activeSpireRun.monsters.push(m);
  }

  spireTickTimer = setInterval(() => {
    activeSpireRun.timeLeft -= 0.05;
    const tEl = document.getElementById('spire-timer-display');
    if (tEl) {
      tEl.textContent = `⏱️ ${Math.max(0, activeSpireRun.timeLeft).toFixed(1)}s`;
      tEl.style.color = activeSpireRun.timeLeft <= 4 ? '#ff4757' : '#ffd32a';
    }

    activeSpireRun.monsters.forEach(m => {
      m.x += m.vx;
      m.y += m.vy;
      if (m.x <= 6 || m.x >= boxW - m.size - 6) m.vx *= -1;
      if (m.y <= 6 || m.y >= boxH - m.size - 6) m.vy *= -1;
      m.el.style.left = `${m.x}px`;
      m.el.style.top = `${m.y}px`;
    });

    if (activeSpireRun.timeLeft <= 0) {
      clearInterval(spireTickTimer);
      alert(`💀 Time Expired on Floor ${activeSpireRun.floor}! Climb ended.`);
      endSpireRun();
    }
  }, 50);
}
// === END CHUNK 2 OF 3 ===
// === START CHUNK 3 OF 3: abyssal_spire.js ===
function handleSpireFloorClear() {
  clearInterval(spireTickTimer);
  if (typeof sfx !== 'undefined') sfx.powerup();

  const floor = activeSpireRun.floor;
  if (floor > spireState.bestFloor) {
    spireState.bestFloor = floor;
    saveSpireState();
  }

  // Payout Floor Coins & Scrap
  const coinMult = 1 + countSpireCard('midas_touch');
  const coinGain = Math.round((400 + floor * 250) * coinMult);
  const scrapGain = 15 * countSpireCard('scrap_magnet');

  if (typeof shopState !== 'undefined') {
    shopState.coins += coinGain;
    if (typeof saveShopData === 'function') saveShopData();
  }
  if (scrapGain > 0 && typeof gearState !== 'undefined') {
    gearState.scrap += scrapGain;
    if (typeof saveGearData === 'function') saveGearData();
  }

  // Floor 50 Grand Victory!
  if (floor >= 50) {
    if (typeof generateRandomGear === 'function' && typeof gearState !== 'undefined') {
      gearState.inventory.push(generateRandomGear('mythic'));
      if (typeof saveGearData === 'function') saveGearData();
    }
    alert(`🏆 CONGRATULATIONS! You conquered Floor 50 of the Abyssal Spire and earned Mythic Gear + ${coinGain.toLocaleString()} 🪙!`);
    endSpireRun();
    return;
  }

  // Show 3 Random Tarot Cards to Draft
  document.getElementById('spire-combat-view').style.display = 'none';
  const draftView = document.getElementById('spire-draft-view');
  draftView.style.display = 'block';

  const shuffled = [...SPIRE_TAROT_CARDS].sort(() => Math.random() - 0.5).slice(0, 3);
  const choicesEl = document.getElementById('spire-tarot-choices');
  choicesEl.innerHTML = shuffled.map((card, idx) => `
    <div class="spire-tarot-pick" data-idx="${idx}" style="
      background: rgba(255,255,255,0.05); border: 2px solid ${card.color};
      border-radius: 12px; padding: 14px 10px; cursor: pointer;
    ">
      <div style="font-size: 2.3rem; margin-bottom: 6px;">${card.icon}</div>
      <div style="font-weight: 900; font-size: 0.88rem; color: ${card.color}; margin-bottom: 6px;">${card.name}</div>
      <div style="font-size: 0.74rem; color: #ced6e0; line-height: 1.35;">${card.desc}</div>
    </div>
  `).join('');

  choicesEl.querySelectorAll('.spire-tarot-pick').forEach(el => {
    el.addEventListener('click', () => {
      const picked = shuffled.at(parseInt(el.dataset.idx, 10));
      activeSpireRun.cards.push(picked);
      if (typeof sfx !== 'undefined') sfx.powerup();
      launchSpireFloor(floor + 1);
    });
  });
}

function endSpireRun() {
  clearInterval(spireTickTimer);
  activeSpireRun = null;
  openSpireLobby();
}
// === END CHUNK 3 OF 3 ===
