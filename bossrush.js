// --- 5-Boss Raid Gauntlet Mode ---
const bossRushState = {
  active: false,
  stage: 0, // 0 to 4
  bossesAliveInStage: 0
};

const RAID_BOSSES = [
  {
    name: '🟢 THE SLIME KING (1/5)',
    hp: 22,
    size: 150,
    speed: 3.4,
    color: '#2ed573',
    count: 1,
    ability: 'slime'
  },
  {
    name: '🟣 TWIN PHANTOM DEMONS (2/5)',
    hp: 18,
    size: 105,
    speed: 6.2,
    color: '#a55eea',
    count: 2,
    ability: 'twins'
  },
  {
    name: '🛡️ ARMORED MECHA-TANK (3/5)',
    hp: 42,
    size: 155,
    speed: 3.0,
    color: '#ffa502',
    count: 1,
    ability: 'tank'
  },
  {
    name: '👻 SHADOW WRAITH (4/5)',
    hp: 36,
    size: 125,
    speed: 5.5,
    color: '#70a1ff',
    count: 1,
    ability: 'teleport'
  },
  {
    name: '🔥 OMEGA OVERLORD (FINAL 5/5)',
    hp: 65,
    size: 165,
    speed: 5.2,
    color: '#ff4757',
    count: 1,
    ability: 'omega'
  }
];

window.addEventListener('DOMContentLoaded', () => {
  // Add "👹 Boss Rush" button right next to Endless Wave Rush on Start Screen
  const endlessBtn = document.getElementById('endless-start-btn');
  if (endlessBtn && endlessBtn.parentNode) {
    const rushBtn = document.createElement('button');
    rushBtn.id = 'boss-rush-start-btn';
    rushBtn.className = 'action-btn';
    const bestRush = localStorage.getItem('monster_best_bossrush');
    rushBtn.innerHTML = bestRush
      ? `👹 Boss Rush Gauntlet <small style="font-size:0.8rem;">(Best: ${bestRush}s)</small>`
      : `👹 Boss Rush Gauntlet <small style="font-size:0.8rem;">(5 Bosses)</small>`;
    rushBtn.style.cssText = 'margin-top: 8px; background: linear-gradient(135deg, #ff4757, #b33939); color: #fff;';
    rushBtn.addEventListener('click', startBossRushMode);

    endlessBtn.insertAdjacentElement('afterend', rushBtn);
  }
});

function startBossRushMode() {
  if (typeof sfx !== 'undefined') {
    sfx.init();
    sfx.startMusic(true);
  }

  bossRushState.active = true;
  bossRushState.stage = 0;

  if (typeof extraModes !== 'undefined') {
    extraModes.isEndless = false;
    extraModes.isPaused = false;
    clearInterval(extraModes.waveTimer);
  }

  startScreen.classList.add('hidden');
  victoryScreen.classList.add('hidden');
  milestoneToast.classList.remove('show');
  document.body.classList.remove('frozen');
  clearTimeout(freezeTimer);

  playField.innerHTML = '';
  monsters = [];
  totalClicks = 0;
  successfulHits = 0;
  combo = 1;
  maxCombo = 1;
  isFrozen = false;
  bossSpawned = true;

  comboDisplay.textContent = 'x1';
  startTime = performance.now();
  lastFrameTime = startTime;
  isGameRunning = true;

  spawnRaidStage(0);
  requestAnimationFrame(gameLoop);
}
function spawnRaidStage(stageIdx) {
  const bossDef = RAID_BOSSES.at(stageIdx);
  if (!bossDef) return;

  bossRushState.stage = stageIdx;
  bossRushState.bossesAliveInStage = bossDef.count;
  activeCount = bossDef.count;
  counterDisplay.textContent = `BOSS ${stageIdx + 1}/5`;

  if (typeof sfx !== 'undefined') sfx.bossSpawn();
  triggerScreenShake();
  spawnFloatingText(window.innerWidth / 2, 145, bossDef.name, bossDef.color);

  bossHud.classList.add('active');
  const labelSpan = bossHud.querySelector('.boss-label span');
  if (labelSpan) labelSpan.textContent = bossDef.name;

  const totalStageHp = bossDef.hp * bossDef.count;
  bossBarFill.style.width = '100%';
  bossHpText.textContent = `${totalStageHp} / ${totalStageHp}`;

  for (let i = 0; i < bossDef.count; i++) {
    const el = document.createElement('div');
    el.className = 'monster';
    el.style.width = `${bossDef.size}px`;
    el.style.height = `${bossDef.size}px`;
    el.style.filter = `drop-shadow(0 0 18px ${bossDef.color})`;
    el.innerHTML = getMonsterSVG('boss')
      .replace('#ff6b81', bossDef.color)
      .replace('#b33939', '#1e272e');

    const padding = 95;
    const x = Math.random() * (window.innerWidth - bossDef.size);
    const y = padding + Math.random() * (window.innerHeight - bossDef.size - padding);
    const angle = Math.random() * Math.PI * 2;

    const bossObj = {
      el,
      type: 'boss',
      raidAbility: bossDef.ability,
      hp: bossDef.hp,
      maxHp: bossDef.hp,
      size: bossDef.size,
      color: bossDef.color,
      x,
      y,
      vx: Math.cos(angle) * bossDef.speed,
      vy: Math.sin(angle) * bossDef.speed
    };

    el.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      spawnClickRing(e.clientX, e.clientY);
      handleMonsterClick(bossObj, e.clientX, e.clientY);
    });

    playField.appendChild(el);
    monsters.push(bossObj);
  }
}

// Update Boss HUD & Trigger Unique Raid Boss Abilities on Hit
const _rushOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  _rushOrigClick(monster, clickX, clickY);

  if (!bossRushState.active || monster.type !== 'boss') return;

  // Recalculate combined HP bar for multi-boss stages (like Twin Phantoms)
  const activeBosses = monsters.filter(m => m.type === 'boss');
  const curHp = activeBosses.reduce((sum, b) => sum + Math.max(0, b.hp), 0);
  const maxHp = activeBosses.reduce((sum, b) => sum + b.maxHp, 0);

  if (maxHp > 0) {
    bossBarFill.style.width = `${(curHp / maxHp) * 100}%`;
    bossHpText.textContent = `${curHp} / ${maxHp}`;
  }

  // Unique Boss Mechanics
  if (monster.hp > 0) {
    if (monster.raidAbility === 'teleport' && monster.hp % 5 === 0) {
      monster.x = Math.random() * (window.innerWidth - monster.size);
      monster.y = 95 + Math.random() * (window.innerHeight - monster.size - 95);
      spawnParticles(clickX, clickY, '#70a1ff', 15);
      spawnFloatingText(monster.x + 40, monster.y, '👻 BLINK!', '#70a1ff');
    } else if (monster.raidAbility === 'slime' && monster.hp === Math.floor(monster.maxHp / 2)) {
      spawnFloatingText(clickX, clickY, '🟢 SLIME SPLIT!', '#2ed573');
      spawnMonster(DIFFICULTIES.normal, 'grunt');
      spawnMonster(DIFFICULTIES.normal, 'grunt');
    } else if (monster.raidAbility === 'omega' && monster.hp % 8 === 0) {
      monster.vx *= 1.15;
      monster.vy *= 1.15;
      triggerScreenShake();
    }
  }
};

// Advance to Next Raid Boss or Complete Gauntlet
const _rushOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  if (!bossRushState.active) {
    _rushOrigDefeat(monster, clickX, clickY);
    return;
  }

  combo++;
  if (combo > maxCombo) maxCombo = combo;
  comboDisplay.textContent = `x${combo}`;

  if (typeof sfx !== 'undefined') sfx.hit(combo);
  spawnParticles(clickX, clickY, monster.color, 35);
  spawnFloatingText(clickX, clickY, monster.type === 'boss' ? 'BOSS DOWN!' : '+1', '#ffd32a');
  triggerScreenShake();

  if (typeof addCoinsAndXP === 'function') {
    addCoinsAndXP(monster.type === 'boss' ? 85 : 5, monster.type === 'boss' ? 60 : 5);
  }
  if (typeof addEnergy === 'function') addEnergy(15);

  monster.el.remove();
  monsters = monsters.filter(m => m !== monster);

  const remainingBosses = monsters.filter(m => m.type === 'boss').length;
  if (remainingBosses <= 0) {
    // Clear any leftover mini-slimes between stages
    monsters.forEach(m => m.el.remove());
    monsters = [];

    const nextStage = bossRushState.stage + 1;
    if (nextStage < RAID_BOSSES.length) {
      spawnRaidStage(nextStage);
    } else {
      finishBossRushVictory();
    }
  }
};

function finishBossRushVictory() {
  bossRushState.active = false;
  isGameRunning = false;
  bossHud.classList.remove('active');
  if (typeof sfx !== 'undefined') sfx.victory();

  // Big Boss Rush Completion Bonus!
  if (typeof addCoinsAndXP === 'function') addCoinsAndXP(400, 300);

  const finalSeconds = (performance.now() - startTime) / 1000;
  const accuracy = totalClicks > 0 ? Math.round((successfulHits / totalClicks) * 100) : 100;

  const savedBest = parseFloat(localStorage.getItem('monster_best_bossrush'));
  const isNewRecord = !savedBest || finalSeconds < savedBest;
  if (isNewRecord) {
    localStorage.setItem('monster_best_bossrush', finalSeconds.toFixed(2));
  }

  const rushBtn = document.getElementById('boss-rush-start-btn');
  if (rushBtn) {
    const bestVal = isNewRecord ? finalSeconds.toFixed(2) : savedBest.toFixed(2);
    rushBtn.innerHTML = `👹 Boss Rush Gauntlet <small style="font-size:0.8rem;">(Best: ${bestVal}s)</small>`;
  }

  const titleEl = victoryScreen.querySelector('h2');
  if (titleEl) {
    titleEl.textContent = 'Boss Rush Cleared!';
    titleEl.style.color = '#ffd32a';
  }

  document.getElementById('final-time').textContent = `${finalSeconds.toFixed(2)}s`;
  document.getElementById('best-time').textContent = `${(isNewRecord ? finalSeconds : savedBest).toFixed(2)}s`;
  document.getElementById('final-accuracy').textContent = `${accuracy}%`;
  document.getElementById('final-combo').textContent = `x${maxCombo}`;
  document.getElementById('new-record-badge').style.display = isNewRecord ? 'block' : 'none';
  document.getElementById('new-record-badge').textContent = '🏆 NEW BOSS RUSH RECORD! (+400 🪙) 🏆';

  victoryScreen.classList.remove('hidden');
}

// Reset Boss Rush flag if starting Standard Hunt
const _rushOrigStart = startGame;
startGame = function() {
  bossRushState.active = false;
  const labelSpan = bossHud.querySelector('.boss-label span');
  if (labelSpan) labelSpan.textContent = '👹 OVERLORD BOSS';
  _rushOrigStart();
};
