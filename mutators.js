// --- Chaos Mutators (+35% Coin & XP Bonus per Active Modifier) ---
const activeMutators = {
  flashlight: false,
  mitosis: false,
  evasive: false,
  chaos: false
};

const MUTATOR_LIST = [
  { id: 'flashlight', icon: '🔦', name: 'Lights Out',   desc: 'Dark arena + cursor spotlight' },
  { id: 'mitosis',    icon: '🧬', name: 'Mitosis',      desc: 'Tanks split into 2 mini-monsters' },
  { id: 'evasive',    icon: '🧲', name: 'Evasive AI',   desc: 'Monsters dodge away from cursor' },
  { id: 'chaos',      icon: '🎈', name: 'Chaos Bounce', desc: 'Random speed & angle bursts' }
];

function getMutatorBonusMult() {
  const count = Object.values(activeMutators).filter(Boolean).length;
  return 1 + count * 0.35;
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Flashlight Overlay Layer
  const darkLayer = document.createElement('div');
  darkLayer.id = 'flashlight-overlay';
  darkLayer.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 34; display: none;
    background: radial-gradient(circle 125px at 50% 50%, transparent 0%, rgba(4, 5, 10, 0.96) 100%);
  `;
  document.body.appendChild(darkLayer);

  window.addEventListener('mousemove', (e) => {
    if (!activeMutators.flashlight || !isGameRunning) return;
    darkLayer.style.background = `radial-gradient(circle 125px at ${e.clientX}px ${e.clientY}px, transparent 0%, rgba(4, 5, 10, 0.96) 100%)`;
  });

  window.addEventListener('touchmove', (e) => {
    if (!activeMutators.flashlight || !isGameRunning || !e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    darkLayer.style.background = `radial-gradient(circle 145px at ${t.clientX}px ${t.clientY}px, transparent 0%, rgba(4, 5, 10, 0.96) 100%)`;
  });

  // 2. Inject Inline Chaos Mutators Selector right above "Standard Hunt"
  const startCard = document.querySelector('#start-screen .card');
  const startBtn = document.getElementById('start-btn');

  if (startCard && startBtn) {
    const mutSection = document.createElement('div');
    mutSection.id = 'inline-mutators-box';
    mutSection.style.cssText = `
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(224, 86, 253, 0.35);
      border-radius: 10px;
      padding: 8px 10px;
      margin-bottom: 12px;
      text-align: left;
    `;

    mutSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 0.75rem; font-weight: 900; color: #e056fd; letter-spacing: 0.5px;">🎲 CHAOS MUTATORS</span>
        <span id="mut-bonus-label" style="font-size: 0.72rem; font-weight: 800; color: #2ed573;">+0% Coins & XP</span>
      </div>
      <div id="inline-mut-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;"></div>
    `;

    startCard.insertBefore(mutSection, startBtn);
    renderInlineMutators();
  }
});

function renderInlineMutators() {
  const grid = document.getElementById('inline-mut-grid');
  const bonusLabel = document.getElementById('mut-bonus-label');
  if (!grid) return;

  const activeCount = Object.values(activeMutators).filter(Boolean).length;
  if (bonusLabel) {
    bonusLabel.textContent = activeCount > 0 ? `+${activeCount * 35}% Coins & XP` : 'Optional (+35% ea)';
    bonusLabel.style.color = activeCount > 0 ? '#2ed573' : '#a4b0be';
  }

  grid.innerHTML = MUTATOR_LIST.map(m => {
    const isOn = activeMutators[m.id];
    return `
      <button type="button" class="inline-mut-btn" data-id="${m.id}" title="${m.desc}" style="
        background: ${isOn ? 'rgba(224, 86, 253, 0.28)' : 'rgba(255, 255, 255, 0.05)'};
        border: 1.5px solid ${isOn ? '#e056fd' : 'rgba(255, 255, 255, 0.14)'};
        border-radius: 8px;
        padding: 6px 4px;
        color: #fff;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        transition: all 0.15s;
        box-shadow: ${isOn ? '0 0 10px rgba(224, 86, 253, 0.35)' : 'none'};
      ">
        <span style="font-size: 1rem;">${m.icon}</span>
        <span style="font-size: 0.66rem; font-weight: 800; color: ${isOn ? '#fff' : '#ced6e0'};">${m.name}</span>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.inline-mut-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      activeMutators[id] = !activeMutators[id];
      renderInlineMutators();
    });
  });
}

// --- Gameplay Hooks for Active Mutators ---

// 1. Mitosis: Split Tanks into 2 fast mini-grunts on defeat
const _mutOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  const wasTank = monster.type === 'tank';
  const mx = monster.x;
  const my = monster.y;

  _mutOrigDefeat(monster, clickX, clickY);

  if (activeMutators.mitosis && wasTank && isGameRunning) {
    const config = DIFFICULTIES[currentDiff];
    for (let i = 0; i < 2; i++) {
      spawnMonster(config, 'grunt');
      const baby = monsters[monsters.length - 1];
      if (baby) {
        baby.size = 46;
        baby.el.style.width = '46px';
        baby.el.style.height = '46px';
        baby.x = mx + (i === 0 ? -15 : 15);
        baby.y = my;
        baby.vx *= 1.35;
        baby.vy *= 1.35;
      }
    }
    activeCount += 2;
    counterDisplay.textContent = typeof extraModes !== 'undefined' && extraModes.isEndless
      ? `${monsters.length} / ${extraModes.maxOverrun}`
      : activeCount;
    spawnFloatingText(clickX, clickY - 14, '🧬 SPLIT!', '#e056fd');
  }
};

// 2. Evasive AI & Chaos Bounce Loops
let mutatorLoop = null;
function startMutatorEffects() {
  clearInterval(mutatorLoop);
  const darkLayer = document.getElementById('flashlight-overlay');
  if (darkLayer) {
    darkLayer.style.display = activeMutators.flashlight ? 'block' : 'none';
  }

  let tick = 0;
  mutatorLoop = setInterval(() => {
    if (!isGameRunning || isFrozen) return;
    tick++;

    // Evasive AI: Dodge away if cursor gets within 95px
    if (activeMutators.evasive && typeof mousePos !== 'undefined') {
      monsters.forEach(m => {
        const cx = m.x + m.size / 2;
        const cy = m.y + m.size / 2;
        const dx = cx - mousePos.x;
        const dy = cy - mousePos.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 95 && dist > 1) {
          m.x += (dx / dist) * 5.5;
          m.y += (dy / dist) * 5.5;
        }
      });
    }

    // Chaos Bounce: Every 2.5 seconds, randomize velocity angles
    if (activeMutators.chaos && tick % 50 === 0) {
      monsters.forEach(m => {
        const speed = Math.hypot(m.vx, m.vy);
        const newAngle = Math.random() * Math.PI * 2;
        m.vx = Math.cos(newAngle) * speed;
        m.vy = Math.sin(newAngle) * speed;
      });
    }
  }, 50);
}

// 3. Apply +35% Coin & XP Bonus per Active Mutator
if (typeof addCoinsAndXP === 'function') {
  const _mutOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const mult = getMutatorBonusMult();
    _mutOrigCoins(Math.round(coinAmt * mult), Math.round(xpAmt * mult));
  };
}

// 4. Activate / Cleanup Flashlight on Game Start & End
const _mutOrigStart = startGame;
startGame = function() {
  _mutOrigStart();
  startMutatorEffects();
};

const _mutOrigVictory = endGameVictory;
endGameVictory = function() {
  const darkLayer = document.getElementById('flashlight-overlay');
  if (darkLayer) darkLayer.style.display = 'none';
  clearInterval(mutatorLoop);
  _mutOrigVictory();
};
