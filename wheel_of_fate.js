// === START CHUNK 1 OF 2: wheel_of_fate.js ===
// --- Daily Wheel of Fate & High-Stakes Gamble Shrine ---
const wheelState = Object.assign({
  lastFreeSpinDate: '',
  totalSpins: 0
}, JSON.parse(localStorage.getItem('monster_wheel_fate_v1') || '{}'));

function saveWheelState() {
  localStorage.setItem('monster_wheel_fate_v1', JSON.stringify(wheelState));
}

const WHEEL_PRIZES = [
  { label: '50,000 🪙',      color: '#ffd32a', desc: 'JACKPOT! +50,000 Coins!',
    grant: () => { if (typeof shopState !== 'undefined') { shopState.coins += 50000; saveShopData(); } } },
  { label: '150 🔩 Scrap',   color: '#00d2d3', desc: 'Forge Bundle! +150 Gear Scrap!',
    grant: () => { if (typeof gearState !== 'undefined') { gearState.scrap += 150; saveGearData(); } } },
  { label: 'MYTHIC GEAR',    color: '#ff4757', desc: 'INSANE LUCK! Random Mythic RPG Gear dropped into your bag!',
    grant: () => {
      if (typeof generateRandomGear === 'function' && typeof gearState !== 'undefined') {
        gearState.inventory.push(generateRandomGear('mythic'));
        saveGearData();
      }
    } },
  { label: '2,500 🪙',       color: '#2ed573', desc: 'Nice! +2,500 Coins!',
    grant: () => { if (typeof shopState !== 'undefined') { shopState.coins += 2500; saveShopData(); } } },
  { label: '+2 SKILL PTS',   color: '#a55eea', desc: 'ASTRAL BLESSING! +2 Skill Tree Points!',
    grant: () => {
      if (typeof skillTreeState !== 'undefined') {
        skillTreeState.points = (skillTreeState.points || 0) + 2;
        if (typeof saveSkillTree === 'function') saveSkillTree();
      }
    } },
  { label: '💀 CURSED!',     color: '#57606f', desc: 'CURSED SPIN! Lost 1,000 Coins to the Shrine Spirits...',
    grant: () => { if (typeof shopState !== 'undefined') { shopState.coins = Math.max(0, shopState.coins - 1000); saveShopData(); } } },
  { label: 'LEGENDARY GEAR', color: '#ffa502', desc: 'GOLDEN DROP! Random Legendary RPG Gear added!',
    grant: () => {
      if (typeof generateRandomGear === 'function' && typeof gearState !== 'undefined') {
        gearState.inventory.push(generateRandomGear('legendary'));
        saveGearData();
      }
    } },
  { label: '15,000 🪙',      color: '#1e90ff', desc: 'BIG WIN! +15,000 Coins!',
    grant: () => { if (typeof shopState !== 'undefined') { shopState.coins += 15000; saveShopData(); } } }
];

function isFreeSpinAvailable() {
  const today = new Date().toISOString().slice(0, 10);
  return wheelState.lastFreeSpinDate !== today;
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🎰 Wheel of Fate" button to Start Menu
  const wheelBtn = document.createElement('button');
  wheelBtn.className = 'action-btn';
  wheelBtn.innerHTML = '🎰 Wheel of Fate';
  wheelBtn.style.cssText = 'background: linear-gradient(135deg, #ff9f43, #ee5253); color: #fff;';
  wheelBtn.addEventListener('click', () => {
    renderWheelModal();
    document.getElementById('wheel-fate-modal').style.display = 'flex';
  });

  const extrasGrid = document.getElementById('menu-extras-grid');
  const startCard = document.querySelector('#start-screen .card');
  if (extrasGrid) extrasGrid.appendChild(wheelBtn);
  else if (startCard) startCard.appendChild(wheelBtn);

  // 2. Build Wheel Modal
  const modal = document.createElement('div');
  modal.id = 'wheel-fate-modal';
  modal.className = 'screen-overlay';
  modal.style.cssText = 'display: none; z-index: 165;';
  modal.innerHTML = `
    <div class="card" style="max-width: 480px; width: 92vw; text-align: center; padding: 18px;">
      <h2 style="color: #ffd32a; margin: 0 0 4px 0; font-size: 1.65rem;">🎰 Wheel of Fate</h2>
      <p class="subtitle" style="margin-bottom: 12px;">Claim 1 FREE spin daily or gamble coins for Mythic Gear & Jackpots!</p>

      <div style="position: relative; width: 250px; height: 250px; margin: 0 auto 14px auto;">
        <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); font-size: 1.8rem; z-index: 5; filter: drop-shadow(0 2px 6px #000);">🔻</div>
        <canvas id="wheel-fate-canvas" width="250" height="250" style="border-radius: 50%; border: 4px solid #ffd32a; box-shadow: 0 0 25px rgba(255,211,42,0.35);"></canvas>
      </div>

      <div id="wheel-result-banner" style="min-height: 24px; font-weight: 900; font-size: 0.88rem; color: #2ed573; margin-bottom: 12px;">
        Ready to test your luck?
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <button id="wheel-free-btn" class="action-btn" style="flex: 1; padding: 10px; font-size: 0.85rem; background: #2ed573; color: #07080c;">
          🎁 FREE Daily Spin
        </button>
        <button id="wheel-paid-btn" class="action-btn" style="flex: 1; padding: 10px; font-size: 0.85rem; background: #ffd32a; color: #07080c;">
          🪙 Spin (3,500)
        </button>
      </div>

      <button id="close-wheel-btn" class="action-btn" style="padding: 9px; background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">
        Close Shrine
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-wheel-btn').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  document.getElementById('wheel-free-btn').addEventListener('click', () => spinWheelOfFate(true));
  document.getElementById('wheel-paid-btn').addEventListener('click', () => spinWheelOfFate(false));
});
// === END CHUNK 1 OF 2 ===
// === START CHUNK 2 OF 2: wheel_of_fate.js ===
let wheelCurrentAngle = 0;
let isWheelSpinning = false;

function drawWheelCanvas(rotationRad) {
  const canvas = document.getElementById('wheel-fate-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 125, cy = 125, radius = 120;
  const sliceAngle = (Math.PI * 2) / WHEEL_PRIZES.length;

  ctx.clearRect(0, 0, 250, 250);

  WHEEL_PRIZES.forEach((prize, i) => {
    const start = rotationRad + i * sliceAngle;
    const end = start + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = prize.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#07080c';
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#07080c';
    ctx.font = '900 11px sans-serif';
    ctx.fillText(prize.label, radius - 12, 4);
    ctx.restore();
  });

  // Center Hub
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#07080c';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd32a';
  ctx.stroke();
}

function renderWheelModal() {
  drawWheelCanvas(wheelCurrentAngle);
  const freeBtn = document.getElementById('wheel-free-btn');
  const paidBtn = document.getElementById('wheel-paid-btn');
  const coins = typeof shopState !== 'undefined' ? shopState.coins : 0;

  if (freeBtn) {
    const avail = isFreeSpinAvailable();
    freeBtn.disabled = !avail || isWheelSpinning;
    freeBtn.style.opacity = avail ? '1' : '0.45';
    freeBtn.textContent = avail ? '🎁 FREE Daily Spin' : '⏳ Claimed Today';
  }
  if (paidBtn) {
    const canAfford = coins >= 3500;
    paidBtn.disabled = !canAfford || isWheelSpinning;
    paidBtn.style.opacity = canAfford ? '1' : '0.45';
  }
}

function spinWheelOfFate(useFree) {
  if (isWheelSpinning) return;

  if (useFree) {
    if (!isFreeSpinAvailable()) return;
    wheelState.lastFreeSpinDate = new Date().toISOString().slice(0, 10);
  } else {
    if (typeof shopState === 'undefined' || shopState.coins < 3500) return;
    shopState.coins -= 3500;
    if (typeof saveShopData === 'function') saveShopData();
  }

  wheelState.totalSpins++;
  saveWheelState();
  isWheelSpinning = true;
  renderWheelModal();

  const banner = document.getElementById('wheel-result-banner');
  if (banner) {
    banner.style.color = '#ffd32a';
    banner.textContent = '🎲 Spinning the Wheel of Fate...';
  }

  const winIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
  const sliceAngle = (Math.PI * 2) / WHEEL_PRIZES.length;
  // Pointer is at top (-Math.PI / 2)
  const targetAngle = (-Math.PI / 2) - (winIndex * sliceAngle + sliceAngle / 2);
  const totalRotation = (Math.PI * 10) + ((targetAngle - (wheelCurrentAngle % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2));

  const startAngle = wheelCurrentAngle;
  const duration = 3200;
  const startTime = performance.now();

  function animateSpin(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const easeOut = 1 - Math.pow(1 - t, 4);

    wheelCurrentAngle = startAngle + totalRotation * easeOut;
    drawWheelCanvas(wheelCurrentAngle);

    if (t < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      isWheelSpinning = false;
      const prize = WHEEL_PRIZES.at(winIndex);
      prize.grant();
      if (typeof sfx !== 'undefined') sfx.powerup();
      if (banner) {
        banner.style.color = prize.color === '#57606f' ? '#ff4757' : '#2ed573';
        banner.textContent = prize.desc;
      }
      renderWheelModal();
    }
  }

  requestAnimationFrame(animateSpin);
}
// === END CHUNK 2 OF 2 ===
