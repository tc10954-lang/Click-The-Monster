// --- Extreme Difficulty Tiers: Nightmare & Hellfire ---
window.addEventListener('DOMContentLoaded', () => {
  // 1. Register new difficulty configurations into DIFFICULTIES
  if (typeof DIFFICULTIES !== 'undefined') {
    DIFFICULTIES.nightmare = {
      count: 80,
      baseSpeed: 6.2,
      scaleRate: 1.038,
      bossHp: 30
    };
    DIFFICULTIES.hellfire = {
      count: 110,
      baseSpeed: 7.8,
      scaleRate: 1.042,
      bossHp: 45
    };
  }

  // 2. Inject Nightmare & Hellfire buttons into the Start Screen
  const diffGroup = document.querySelector('#start-screen .difficulty-group');
  if (diffGroup) {
    diffGroup.style.flexWrap = 'wrap';

    const nightmareBtn = document.createElement('button');
    nightmareBtn.className = 'diff-btn';
    nightmareBtn.dataset.diff = 'nightmare';
    nightmareBtn.innerHTML = `💀 Nightmare<br><small>80 + Boss</small>`;

    const hellfireBtn = document.createElement('button');
    hellfireBtn.className = 'diff-btn';
    hellfireBtn.dataset.diff = 'hellfire';
    hellfireBtn.style.borderColor = 'rgba(255, 71, 87, 0.45)';
    hellfireBtn.innerHTML = `🔥 Hellfire<br><small>110 + Enraged</small>`;

    diffGroup.appendChild(nightmareBtn);
    diffGroup.appendChild(hellfireBtn);

    // Re-bind click listeners so all 5 difficulty buttons work seamlessly
    diffGroup.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        diffGroup.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDiff = btn.dataset.diff;
      });
    });
  }
});

// 3. Hellfire Modifiers (3-HP Tanks, Smaller Targets & Enraged Boss)
const _origSpawnMonster = spawnMonster;
spawnMonster = function(config, forcedType = null) {
  _origSpawnMonster(config, forcedType);

  if (currentDiff === 'hellfire' && monsters.length > 0) {
    const newest = monsters[monsters.length - 1];

    // Make targets 18% smaller on Hellfire for precision aim
    if (newest.type !== 'boss') {
      newest.size = Math.round(newest.size * 0.82);
      newest.el.style.width = `${newest.size}px`;
      newest.el.style.height = `${newest.size}px`;
    }

    // Upgrade Tanks to 3 HP on Hellfire
    if (newest.type === 'tank') {
      newest.hp = 3;
      newest.maxHp = 3;
    }

    // Enrage the Overlord Boss on Hellfire
    if (newest.type === 'boss') {
      newest.vx *= 1.35;
      newest.vy *= 1.35;
      newest.el.style.filter = 'drop-shadow(0 0 22px #ff4757)';
    }
  }
};
