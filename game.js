// --- Custom SVG Monster Sprites ---
function getMonsterSVG(type) {
  if (type === 'boss') {
    return `<svg viewBox="0 0 120 120">
      <defs>
        <radialGradient id="bossGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff6b81"/>
          <stop offset="100%" stop-color="#b33939"/>
        </radialGradient>
      </defs>
      <polygon points="20,25 8,5 38,18" fill="#ffa502"/>
      <polygon points="100,25 112,5 82,18" fill="#ffa502"/>
      <path d="M18,95 C5,50 22,12 60,12 C98,12 115,50 102,95 L86,82 L73,102 L60,84 L47,102 L34,82 Z" fill="url(#bossGrad)" stroke="#fff" stroke-width="4"/>
      <polygon points="30,48 52,56 32,62" fill="#ffdd59"/>
      <polygon points="90,48 68,56 88,62" fill="#ffdd59"/>
      <circle cx="42" cy="54" r="4" fill="#000"/>
      <circle cx="78" cy="54" r="4" fill="#000"/>
      <path d="M36 78 L48 70 L60 78 L72 70 L84 78" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  if (type === 'speedster') {
    return `<svg viewBox="0 0 100 100">
      <polygon points="50,8 92,45 76,90 24,90 8,45" fill="#a55eea" stroke="#fff" stroke-width="3"/>
      <polygon points="25,42 45,50 25,56" fill="#ffdd59"/>
      <polygon points="75,42 55,50 75,56" fill="#ffdd59"/>
      <path d="M35 72 Q50 62 65 72" stroke="#1e272e" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  if (type === 'tank') {
    return `<svg viewBox="0 0 100 100">
      <rect x="12" y="16" width="76" height="72" rx="18" fill="#2ed573" stroke="#fff" stroke-width="4"/>
      <path d="M22 16 L14 4 L34 16 M78 16 L86 4 L66 16" fill="#ffa502"/>
      <circle cx="35" cy="46" r="9" fill="#1e272e"/><circle cx="37" cy="44" r="3" fill="#ff4757"/>
      <circle cx="65" cy="46" r="9" fill="#1e272e"/><circle cx="67" cy="44" r="3" fill="#ff4757"/>
      <rect x="30" y="66" width="40" height="10" rx="4" fill="#1e272e"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 100 100">
    <path d="M20,85 C10,45 25,15 50,15 C75,15 90,45 80,85 L68,75 L58,88 L50,76 L42,88 L32,75 Z" fill="#ff4757" stroke="#fff" stroke-width="3"/>
    <circle cx="36" cy="44" r="10" fill="#fff"/><circle cx="38" cy="44" r="5" fill="#090a0f"/>
    <circle cx="64" cy="44" r="10" fill="#fff"/><circle cx="62" cy="44" r="5" fill="#090a0f"/>
    <path d="M36 66 Q50 76 64 66" stroke="#090a0f" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// --- Game Configuration & State ---
const DIFFICULTIES = {
  easy:   { count: 30, baseSpeed: 2.8, scaleRate: 1.022, bossHp: 10 },
  normal: { count: 45, baseSpeed: 3.8, scaleRate: 1.030, bossHp: 15 },
  insane: { count: 60, baseSpeed: 4.9, scaleRate: 1.035, bossHp: 22 }
};

let currentDiff = 'normal';
let monsters = [];
let activeCount = 0;
let totalClicks = 0;
let successfulHits = 0;
let combo = 1;
let maxCombo = 1;
let startTime = 0;
let lastFrameTime = 0;
let isGameRunning = false;
let isFrozen = false;
let freezeTimer = null;
let toastTimeout = null;
let bossSpawned = false;

const playField = document.getElementById('play-field');
const counterDisplay = document.getElementById('counter-display');
const timerDisplay = document.getElementById('timer-display');
const comboDisplay = document.getElementById('combo-display');
const milestoneToast = document.getElementById('milestone-toast');
const milestoneText = document.getElementById('milestone-text');
const startScreen = document.getElementById('start-screen');
const victoryScreen = document.getElementById('victory-screen');
const bossHud = document.getElementById('boss-hud');
const bossBarFill = document.getElementById('boss-bar-fill');
const bossHpText = document.getElementById('boss-hp-text');
const muteBtn = document.getElementById('mute-btn');

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDiff = btn.dataset.diff;
  });
});

muteBtn.addEventListener('click', () => {
  sfx.muted = !sfx.muted;
  muteBtn.textContent = sfx.muted ? '🔇' : '🔊';
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

playField.addEventListener('mousedown', (e) => {
  if (!isGameRunning) return;
  spawnClickRing(e.clientX, e.clientY);
  totalClicks++;
  if (combo > 1) {
    combo = 1;
    comboDisplay.textContent = `x${combo}`;
    spawnFloatingText(e.clientX, e.clientY, 'MISS!', '#ff4757');
  }
  sfx.miss();
});
function startGame() {
  sfx.init(); sfx.startMusic(false);
  const config = DIFFICULTIES[currentDiff];

  startScreen.classList.add('hidden');
  victoryScreen.classList.add('hidden');
  milestoneToast.classList.remove('show');
  bossHud.classList.remove('active');
  document.body.classList.remove('frozen');
  clearTimeout(freezeTimer);

  playField.innerHTML = '';
  monsters = [];
  activeCount = config.count;
  totalClicks = 0;
  successfulHits = 0;
  combo = 1;
  maxCombo = 1;
  isFrozen = false;
  bossSpawned = false;

  counterDisplay.textContent = activeCount;
  comboDisplay.textContent = 'x1';

  for (let i = 0; i < config.count; i++) {
    spawnMonster(config);
  }

  startTime = performance.now();
  lastFrameTime = startTime;
  isGameRunning = true;
  requestAnimationFrame(gameLoop);
}

function spawnMonster(config, forcedType = null) {
  let type = forcedType || 'grunt';
  let hp = 1;
  let size = 70;
  let speedMult = 1;
  let color = '#ff4757';

  if (!forcedType) {
    const roll = Math.random();
    if (roll > 0.82) {
      type = 'tank';
      hp = 2;
      size = 84;
      speedMult = 0.72;
      color = '#2ed573';
    } else if (roll > 0.62) {
      type = 'speedster';
      hp = 1;
      size = 58;
      speedMult = 1.45;
      color = '#a55eea';
    }
  } else if (forcedType === 'boss') {
    hp = config.bossHp;
    size = 135;
    speedMult = 1.15;
    color = '#ffa502';
  }

  const el = document.createElement('div');
  el.className = 'monster';
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.innerHTML = getMonsterSVG(type);

  if (hp > 1 && type !== 'boss') {
    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar';
    hpBar.innerHTML = '<div class="hp-fill"></div>';
    el.appendChild(hpBar);
  }

  const padding = 85;
  const x = Math.random() * (window.innerWidth - size);
  const y = padding + Math.random() * (window.innerHeight - size - padding);

  const angle = Math.random() * Math.PI * 2;
  const speed = config.baseSpeed * speedMult * (0.85 + Math.random() * 0.35);

  const monsterObj = {
    el,
    type,
    hp,
    maxHp: hp,
    size,
    color,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed
  };

  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    spawnClickRing(e.clientX, e.clientY);
    handleMonsterClick(monsterObj, e.clientX, e.clientY);
  });

  playField.appendChild(el);
  monsters.push(monsterObj);
}

function handleMonsterClick(monster, clickX, clickY) {
  if (!isGameRunning) return;

  totalClicks++;
  successfulHits++;
  monster.hp--;

  monster.el.classList.add('hit-flash');
  setTimeout(() => monster.el.classList.remove('hit-flash'), 70);

  monster.vx = -monster.vx * 1.08;
  monster.vy = -monster.vy * 1.08;

  if (monster.hp > 0) {
    sfx.armorHit();
    if (monster.type === 'boss') {
      const pct = (monster.hp / monster.maxHp) * 100;
      bossBarFill.style.width = `${pct}%`;
      bossHpText.textContent = `${monster.hp} / ${monster.maxHp}`;
      spawnParticles(clickX, clickY, '#ffa502', 8);
      spawnFloatingText(clickX, clickY, 'CRIT!', '#ffa502');
      if (monster.hp % 4 === 0) {
        monster.vx *= 1.35;
        monster.vy *= 1.35;
        triggerScreenShake();
      }
    } else {
      const fill = monster.el.querySelector('.hp-fill');
      if (fill) fill.style.width = `${(monster.hp / monster.maxHp) * 100}%`;
      spawnParticles(clickX, clickY, '#ffa502', 6);
      spawnFloatingText(clickX, clickY, 'ARMOR CRACK!', '#ffa502');
    }
    return;
  }

  defeatMonster(monster, clickX, clickY);
}
function defeatMonster(monster, clickX, clickY) {
  combo++;
  if (combo > maxCombo) maxCombo = combo;
  comboDisplay.textContent = `x${combo}`;

  sfx.hit(combo);
  spawnParticles(clickX, clickY, monster.color, monster.type === 'boss' ? 40 : 14);
  
  const label = monster.type === 'boss' ? 'BOSS SLAIN!' : (combo >= 5 ? `x${combo} STREAK!` : '+1');
  const textColor = combo >= 5 || monster.type === 'boss' ? '#ffa502' : '#ffffff';
  spawnFloatingText(clickX, clickY, label, textColor);

  if (combo % 10 === 0 || monster.type === 'boss') {
    triggerScreenShake();
  }

  if (!bossSpawned && Math.random() < 0.12 && activeCount > 3) {
    spawnPowerupOrb(clickX, clickY);
  }

  monster.el.remove();
  monsters = monsters.filter(m => m !== monster);
  activeCount--;
  counterDisplay.textContent = Math.max(0, activeCount);

  const config = DIFFICULTIES[currentDiff];

  monsters.forEach(m => {
    m.vx *= config.scaleRate;
    m.vy *= config.scaleRate;
  });

  const defeated = config.count - activeCount;
  if (!bossSpawned && defeated > 0 && defeated % 10 === 0 && activeCount > 0) {
    triggerMilestoneSurge(defeated);
  }

  if (activeCount <= 0 && !bossSpawned) {
    bossSpawned = true;
    activeCount = 1;
    counterDisplay.textContent = 'BOSS';
    sfx.bossSpawn();
    triggerScreenShake();
    spawnMonster(config, 'boss');
    bossHud.classList.add('active');
    bossBarFill.style.width = '100%';
    bossHpText.textContent = `${config.bossHp} / ${config.bossHp}`;
    return;
  }

  if (activeCount <= 0 && bossSpawned) {
    bossHud.classList.remove('active');
    endGameVictory();
  }
}

function spawnPowerupOrb(x, y) {
  const isFreeze = Math.random() < 0.55;
  const orb = document.createElement('div');
  orb.className = 'powerup';
  orb.textContent = isFreeze ? '❄️' : '💣';
  orb.style.color = isFreeze ? '#1e90ff' : '#ffa502';
  orb.style.background = isFreeze ? 'rgba(30,144,255,0.25)' : 'rgba(255,165,2,0.25)';
  orb.style.left = `${Math.min(Math.max(x - 24, 20), window.innerWidth - 70)}px`;
  orb.style.top = `${Math.min(Math.max(y - 24, 85), window.innerHeight - 70)}px`;

  orb.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    orb.remove();
    if (isFreeze) {
      activateFreeze(e.clientX, e.clientY);
    } else {
      activateBomb(e.clientX, e.clientY);
    }
  });

  playField.appendChild(orb);
  setTimeout(() => { if (orb.parentNode) orb.remove(); }, 5000);
}

function activateFreeze(x, y) {
  sfx.powerup();
  isFrozen = true;
  document.body.classList.add('frozen');
  spawnFloatingText(x, y, 'FREEZE! (3s)', '#1e90ff');
  clearTimeout(freezeTimer);
  freezeTimer = setTimeout(() => {
    isFrozen = false;
    document.body.classList.remove('frozen');
  }, 3000);
}

function activateBomb(x, y) {
  sfx.bomb();
  triggerScreenShake();
  spawnParticles(x, y, '#ffa502', 30);
  spawnFloatingText(x, y, 'SHOCKWAVE!', '#ffa502');

  const targets = [...monsters]
    .filter(m => m.type !== 'boss')
    .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
    .slice(0, 4);

  targets.forEach(t => defeatMonster(t, t.x + t.size / 2, t.y + t.size / 2));
}

function gameLoop(now) {
  if (!isGameRunning) return;

  const dt = Math.min((now - lastFrameTime) / 16.667, 2.5);
  lastFrameTime = now;

  const elapsed = (now - startTime) / 1000;
  timerDisplay.textContent = `${elapsed.toFixed(1)}s`;

  if (!isFrozen) {
    const maxX = window.innerWidth;
    const minY = 72;
    const maxY = window.innerHeight;

    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      if (m.x <= 0) {
        m.x = 0;
        m.vx = Math.abs(m.vx);
      } else if (m.x + m.size >= maxX) {
        m.x = maxX - m.size;
        m.vx = -Math.abs(m.vx);
      }

      if (m.y <= minY) {
        m.y = minY;
        m.vy = Math.abs(m.vy);
      } else if (m.y + m.size >= maxY) {
        m.y = maxY - m.size;
        m.vy = -Math.abs(m.vy);
      }

      m.el.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
    }
  }

  requestAnimationFrame(gameLoop);
}

function spawnClickRing(x, y) {
  const ring = document.createElement('div');
  ring.className = 'click-ring';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 350);
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 5 + Math.random() * 6;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = color;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 45 + Math.random() * 100;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity;

    p.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
    ], {
      duration: 380 + Math.random() * 160,
      easing: 'cubic-bezier(0, .9, .57, 1)'
    }).onfinish = () => p.remove();
  }
}

function spawnFloatingText(x, y, text, color) {
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${x - 24}px`;
  el.style.top = `${y - 16}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

function triggerScreenShake() {
  document.body.classList.remove('shake');
  void document.body.offsetWidth;
  document.body.classList.add('shake');
}

function triggerMilestoneSurge(defeated) {
  sfx.milestone();
  monsters.forEach(m => {
    m.vx *= 1.25;
    m.vy *= 1.25;
  });
  milestoneText.textContent = `${defeated} MONSTERS DEFEATED!`;
  milestoneToast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    milestoneToast.classList.remove('show');
  }, 1800);
}

function endGameVictory() {
  isGameRunning = false;
  sfx.victory();

  const finalSeconds = (performance.now() - startTime) / 1000;
  const accuracy = totalClicks > 0 ? Math.round((successfulHits / totalClicks) * 100) : 100;

  const storageKey = `monster_ultimate_best_${currentDiff}`;
  const savedBest = parseFloat(localStorage.getItem(storageKey));
  let isNewRecord = false;

  if (!savedBest || finalSeconds < savedBest) {
    localStorage.setItem(storageKey, finalSeconds.toFixed(2));
    isNewRecord = true;
  }

  const bestToDisplay = isNewRecord ? finalSeconds.toFixed(2) : savedBest.toFixed(2);

  document.getElementById('final-time').textContent = `${finalSeconds.toFixed(2)}s`;
  document.getElementById('best-time').textContent = `${bestToDisplay}s`;
  document.getElementById('final-accuracy').textContent = `${accuracy}%`;
  document.getElementById('final-combo').textContent = `x${maxCombo}`;
  document.getElementById('new-record-badge').style.display = isNewRecord ? 'block' : 'none';

  victoryScreen.classList.remove('hidden');
}
