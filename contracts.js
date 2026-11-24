// --- Near-Impossible Mythic Bounty Contracts (Boss Fights Back + No Splash!) ---
const contractState = {
  active: false,
  currentContract: null,
  completed: JSON.parse(localStorage.getItem('monster_contracts_done')) || [],
  equippedTitle: localStorage.getItem('monster_equipped_title') || '',
  shielded: false,
  stunnedUntil: 0,
  enrageDeadline: 0,
  aiInterval: null,
  projectiles: []
};

const MYTHIC_CONTRACTS = [
  {
    id: 'baron',
    icon: '🩸',
    name: 'The Blood Baron',
    titleReward: '🩸 Blood Slayer',
    cost: 10000,
    hp: 85,
    speed: 6.8,
    color: '#ff4757',
    enrageSec: 60,
    desc: '85 HP • Heals +5 HP on missed clicks • Blinks away • 60s Limit'
  },
  {
    id: 'aegis',
    icon: '🛡️',
    name: 'Aegis Juggernaut',
    titleReward: '🛡️ Shieldbreaker',
    cost: 25000,
    hp: 130,
    speed: 6.2,
    color: '#ffa502',
    enrageSec: 55,
    desc: '130 HP • Reflective Shield (do not shoot!) • Fires Cursor Orbs • 55s Limit'
  },
  {
    id: 'god',
    icon: '☠️',
    name: 'THE UNKILLABLE GOD',
    titleReward: '☠️ GODSLAYER',
    cost: 50000,
    hp: 200,
    speed: 8.4,
    color: '#ff9ff3',
    enrageSec: 45,
    desc: '200 HP • ALL Boss Powers + Hyper Speed + Strict 45.0s Death Timer!'
  }
];

function saveContracts() {
  localStorage.setItem('monster_contracts_done', JSON.stringify(contractState.completed));
  localStorage.setItem('monster_equipped_title', contractState.equippedTitle);
  updateEquippedTitleBadge();
}

function updateEquippedTitleBadge() {
  const titleEl = document.getElementById('game-title');
  if (!titleEl) return;
  if (contractState.equippedTitle) {
    titleEl.innerHTML = `👾 Monster Swarm <span style="font-size:0.75rem; background:linear-gradient(135deg,#ff4757,#ffd32a); color:#07080c; padding:2px 8px; border-radius:6px; margin-left:6px; vertical-align:middle;">${contractState.equippedTitle}</span>`;
  } else {
    titleEl.textContent = '👾 Monster Swarm';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateEquippedTitleBadge();

  // 1. Add "💀 Mythic Contracts" Button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const contractBtn = document.createElement('button');
    contractBtn.className = 'action-btn';
    contractBtn.innerHTML = '💀 Mythic Contracts';
    contractBtn.style.cssText = 'background: linear-gradient(135deg, #1e272e, #b33939); border: 1px solid #ff4757; color: #fff;';
    contractBtn.addEventListener('click', () => {
      renderContractsModal();
      document.getElementById('contracts-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(contractBtn);
    } else {
      startCard.appendChild(contractBtn);
    }
  }

  // 2. Build Mythic Contracts Modal
  const modal = document.createElement('div');
  modal.id = 'contracts-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '142';
  modal.innerHTML = `
    <div class="card" style="max-width: 580px; max-height: 90vh; overflow-y: auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <h2 style="color: #ff4757; margin: 0; font-size: 1.75rem;">💀 Mythic Bounty Contracts</h2>
        <div style="font-size: 1.1rem; font-weight: 900; color: #ffd32a;">🪙 <span id="contract-coin-bal">0</span></div>
      </div>
      <p class="subtitle" style="margin-bottom: 12px;">
        <b style="color:#ff4757;">WARNING:</b> Splash Blast is BANNED! These bosses fight back, heal, shield, and shoot at your cursor!
      </p>
      <div id="contracts-list" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; text-align: left;"></div>
      <button class="action-btn" id="close-contracts-btn" style="background: rgba(255,255,255,0.12); color: #fff;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-contracts-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
});
function renderContractsModal() {
  const listEl = document.getElementById('contracts-list');
  const balEl = document.getElementById('contract-coin-bal');
  const playerCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;

  if (balEl) balEl.textContent = playerCoins.toLocaleString();
  if (!listEl) return;

  listEl.innerHTML = MYTHIC_CONTRACTS.map(c => {
    const isBeaten = contractState.completed.includes(c.id);
    const isTitleEquipped = contractState.equippedTitle === c.titleReward;
    const canAfford = playerCoins >= c.cost;

    return `
      <div style="
        background: ${isBeaten ? 'rgba(46, 213, 115, 0.12)' : 'rgba(255, 71, 87, 0.08)'};
        border: 1.5px solid ${isBeaten ? '#2ed573' : c.color};
        border-radius: 12px; padding: 12px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 900; font-size: 1.02rem; color: ${c.color};">${c.icon} ${c.name}</span>
          <span style="font-size: 0.76rem; font-weight: 800; background: rgba(0,0,0,0.45); padding: 3px 8px; border-radius: 6px; color: #ffd32a;">
            Reward: [${c.titleReward}]
          </span>
        </div>
        <div style="font-size: 0.78rem; color: #dfe4ea; margin-bottom: 10px;">${c.desc}</div>
        <div style="display: flex; gap: 8px;">
          <button class="accept-contract-btn" data-id="${c.id}" ${canAfford ? '' : 'disabled'} style="
            flex: 2; padding: 8px; border: none; border-radius: 8px; font-weight: 900; font-size: 0.84rem;
            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
            background: ${canAfford ? 'linear-gradient(135deg, #ff4757, #b33939)' : 'rgba(255,255,255,0.08)'};
            color: ${canAfford ? '#fff' : '#747d8c'};
          ">⚔️ Accept Contract (${c.cost.toLocaleString()} 🪙)</button>
          ${isBeaten ? `
            <button class="equip-title-btn" data-title="${c.titleReward}" style="
              flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 900; font-size: 0.8rem; cursor: pointer;
              background: ${isTitleEquipped ? '#2ed573' : '#5352ed'}; color: ${isTitleEquipped ? '#07080c' : '#fff'};
            ">${isTitleEquipped ? '✅ Title Active' : 'Equip Title'}</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.accept-contract-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = MYTHIC_CONTRACTS.find(item => item.id === btn.dataset.id);
      if (!c || typeof shopState === 'undefined' || shopState.coins < c.cost) return;

      shopState.coins -= c.cost;
      saveShopData();
      document.getElementById('contracts-modal').classList.add('hidden');
      startMythicContract(c);
    });
  });

  listEl.querySelectorAll('.equip-title-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      contractState.equippedTitle = btn.dataset.title;
      saveContracts();
      renderContractsModal();
    });
  });
}

function startMythicContract(contract) {
  if (typeof sfx !== 'undefined') {
    sfx.init();
    sfx.startMusic(true);
  }

  contractState.active = true;
  contractState.currentContract = contract;
  contractState.shielded = false;
  contractState.stunnedUntil = 0;
  contractState.enrageDeadline = performance.now() + contract.enrageSec * 1000;
  clearContractProjectiles();

  if (typeof selectWeapon === 'function') selectWeapon('blaster');

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
  activeCount = 1;

  counterDisplay.textContent = 'CONTRACT';
  comboDisplay.textContent = 'x1';

  const el = document.createElement('div');
  el.className = 'monster';
  el.style.width = '155px';
  el.style.height = '155px';
  el.style.filter = `drop-shadow(0 0 22px ${contract.color})`;
  el.innerHTML = getMonsterSVG('boss')
    .replace('#ff6b81', contract.color)
    .replace('#b33939', '#090a0f');

  const x = window.innerWidth / 2 - 77;
  const y = window.innerHeight / 2 - 77;
  const angle = Math.random() * Math.PI * 2;

  const bossObj = {
    el,
    type: 'boss',
    isContractBoss: true,
    hp: contract.hp,
    maxHp: contract.hp,
    size: 155,
    color: contract.color,
    x,
    y,
    vx: Math.cos(angle) * contract.speed,
    vy: Math.sin(angle) * contract.speed
  };

  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    spawnClickRing(e.clientX, e.clientY);
    handleMonsterClick(bossObj, e.clientX, e.clientY);
  });

  playField.appendChild(el);
  monsters.push(bossObj);

  bossHud.classList.add('active');
  const labelSpan = bossHud.querySelector('.boss-label span');
  if (labelSpan) labelSpan.textContent = `${contract.icon} ${contract.name.toUpperCase()}`;
  bossBarFill.style.width = '100%';
  bossHpText.textContent = `${contract.hp} / ${contract.hp}`;

  startTime = performance.now();
  lastFrameTime = startTime;
  isGameRunning = true;

  startContractBossAI(bossObj, contract);
  requestAnimationFrame(gameLoop);
}
function startContractBossAI(boss, contract) {
  clearInterval(contractState.aiInterval);
  let tick = 0;

  contractState.aiInterval = setInterval(() => {
    if (!isGameRunning || !contractState.active) {
      clearInterval(contractState.aiInterval);
      clearContractProjectiles();
      return;
    }

    tick++;
    const now = performance.now();

    // 1. Check Strict Death Timer
    const timeLeft = (contractState.enrageDeadline - now) / 1000;
    counterDisplay.textContent = `${Math.max(0, timeLeft).toFixed(1)}s`;
    if (timeLeft <= 0) {
      failMythicContract('⏱️ TIME EXPIRED — THE BOSS EXECUTED YOU!');
      return;
    }

    // 2. Reflective Gold Aegis Shield (Aegis & God contracts)
    if ((contract.id === 'aegis' || contract.id === 'god') && tick % 18 === 0) {
      contractState.shielded = !contractState.shielded;
      if (contractState.shielded) {
        boss.el.style.outline = '5px solid #ffd32a';
        boss.el.style.borderRadius = '50%';
        spawnFloatingText(boss.x + 75, boss.y, '🛡️ REFLECT SHIELD ON!', '#ffd32a');
      } else {
        boss.el.style.outline = 'none';
        spawnFloatingText(boss.x + 75, boss.y, '⚔️ SHIELD DOWN!', '#2ed573');
      }
    }

    // 3. Fire Homing Plasma Orbs at Player's Cursor!
    if ((contract.id === 'aegis' || contract.id === 'god') && tick % 8 === 0 && typeof mousePos !== 'undefined') {
      fireBossOrbAtCursor(boss.x + 75, boss.y + 75, mousePos.x, mousePos.y);
    }

    // 4. Sudden Blink Teleport (Baron & God contracts)
    if ((contract.id === 'baron' || contract.id === 'god') && tick % 11 === 0) {
      boss.x = Math.random() * (window.innerWidth - boss.size);
      boss.y = 95 + Math.random() * (window.innerHeight - boss.size - 95);
      spawnParticles(boss.x + 75, boss.y + 75, contract.color, 16);
    }
  }, 250);
}

function fireBossOrbAtCursor(sx, sy, tx, ty) {
  const orb = document.createElement('div');
  orb.style.cssText = `
    position: fixed; width: 22px; height: 22px; border-radius: 50%;
    background: radial-gradient(circle, #fff 0%, #ff4757 60%, #b33939 100%);
    box-shadow: 0 0 14px #ff4757; pointer-events: none; z-index: 45;
  `;
  document.body.appendChild(orb);

  const angle = Math.atan2(ty - sy, tx - sx);
  const speed = 7.5;
  const proj = { el: orb, x: sx, y: sy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  contractState.projectiles.push(proj);

  const moveProj = setInterval(() => {
    if (!contractState.active || !isGameRunning || !orb.parentNode) {
      clearInterval(moveProj);
      if (orb.parentNode) orb.remove();
      return;
    }

    proj.x += proj.vx;
    proj.y += proj.vy;
    orb.style.left = `${proj.x - 11}px`;
    orb.style.top = `${proj.y - 11}px`;

    // Check if Boss Orb hits Player Cursor!
    if (typeof mousePos !== 'undefined' && Math.hypot(proj.x - mousePos.x, proj.y - mousePos.y) < 22) {
      clearInterval(moveProj);
      orb.remove();
      contractState.stunnedUntil = performance.now() + 1200;
      triggerScreenShake();
      if (typeof sfx !== 'undefined') sfx.bomb();
      spawnFloatingText(mousePos.x, mousePos.y, '⚡ STUNNED (1.2s)!', '#ff4757');

      const boss = monsters.find(m => m.isContractBoss);
      if (boss) {
        boss.hp = Math.min(boss.maxHp, boss.hp + 6);
        bossBarFill.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
        bossHpText.textContent = `${boss.hp} / ${boss.maxHp}`;
      }
      return;
    }

    if (proj.x < -50 || proj.x > window.innerWidth + 50 || proj.y < -50 || proj.y > window.innerHeight + 50) {
      clearInterval(moveProj);
      orb.remove();
    }
  }, 16);
}

function clearContractProjectiles() {
  contractState.projectiles.forEach(p => { if (p.el) p.el.remove(); });
  contractState.projectiles = [];
}

function failMythicContract(reasonText) {
  contractState.active = false;
  isGameRunning = false;
  clearInterval(contractState.aiInterval);
  clearContractProjectiles();
  bossHud.classList.remove('active');
  playField.innerHTML = '';
  monsters = [];

  if (typeof sfx !== 'undefined') sfx.bomb();
  triggerScreenShake();

  const titleEl = victoryScreen.querySelector('h2');
  if (titleEl) {
    titleEl.textContent = 'CONTRACT FAILED!';
    titleEl.style.color = '#ff4757';
  }
  document.getElementById('final-time').textContent = 'FAILED';
  document.getElementById('best-time').textContent = reasonText;
  document.getElementById('new-record-badge').style.display = 'none';
  victoryScreen.classList.remove('hidden');
}

// --- Hooks: Ban Splash Blast, Enforce Stuns, Reflective Shield & Vampiric Misses ---
if (typeof selectWeapon === 'function') {
  const _contractOrigWeapon = selectWeapon;
  selectWeapon = function(w) {
    if (contractState.active && w === 'splash') {
      spawnFloatingText(window.innerWidth / 2, window.innerHeight - 80, '🚫 SPLASH BANNED IN CONTRACTS!', '#ff4757');
      return;
    }
    _contractOrigWeapon(w);
  };
}

const _contractOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  if (contractState.active) {
    if (performance.now() < contractState.stunnedUntil) {
      spawnFloatingText(clickX, clickY, '⚡ STUNNED!', '#ff4757');
      return;
    }

    if (monster.isContractBoss && contractState.shielded) {
      if (typeof sfx !== 'undefined') sfx.armorHit();
      triggerScreenShake();
      contractState.enrageDeadline -= 1500;
      monster.hp = Math.min(monster.maxHp, monster.hp + 4);
      bossBarFill.style.width = `${(monster.hp / boss.maxHp) * 100}%`;
      bossHpText.textContent = `${monster.hp} / ${monster.maxHp}`;
      spawnFloatingText(clickX, clickY, '🛡️ REFLECTED! -1.5s & +4 BOSS HP!', '#ffd32a');
      return;
    }
  }

  _contractOrigClick(monster, clickX, clickY);

  if (contractState.active && monster.isContractBoss && monster.hp > 0) {
    bossBarFill.style.width = `${(monster.hp / monster.maxHp) * 100}%`;
    bossHpText.textContent = `${monster.hp} / ${monster.maxHp}`;
  }
};

// Vampiric Leech: Missing a click heals the Contract Boss!
playField.addEventListener('mousedown', (e) => {
  if (!isGameRunning || !contractState.active) return;
  const boss = monsters.find(m => m.isContractBoss);
  if (boss) {
    boss.hp = Math.min(boss.maxHp, boss.hp + 5);
    bossBarFill.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
    bossHpText.textContent = `${boss.hp} / ${boss.maxHp}`;
    spawnFloatingText(e.clientX, e.clientY - 18, '🩸 BOSS LEECHED +5 HP!', '#ff4757');
  }
});

// Victory Handler for Beating a Mythic Contract
const _contractOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  if (!contractState.active || !monster.isContractBoss) {
    _contractOrigDefeat(monster, clickX, clickY);
    return;
  }

  const c = contractState.currentContract;
  contractState.active = false;
  isGameRunning = false;
  clearInterval(contractState.aiInterval);
  clearContractProjectiles();
  bossHud.classList.remove('active');

  monster.el.remove();
  monsters = [];

  if (typeof sfx !== 'undefined') sfx.victory();
  triggerScreenShake();
  spawnParticles(clickX, clickY, c.color, 55);

  if (!contractState.completed.includes(c.id)) {
    contractState.completed.push(c.id);
  }
  contractState.equippedTitle = c.titleReward;
  saveContracts();

  const finalSeconds = (performance.now() - startTime) / 1000;
  const titleEl = victoryScreen.querySelector('h2');
  if (titleEl) {
    titleEl.textContent = `${c.name} SLAIN!`;
    titleEl.style.color = '#ffd32a';
  }
  document.getElementById('final-time').textContent = `${finalSeconds.toFixed(2)}s`;
  document.getElementById('best-time').textContent = `[${c.titleReward}]`;
  document.getElementById('new-record-badge').style.display = 'block';
  document.getElementById('new-record-badge').textContent = `👑 UNLOCKED & EQUIPPED TITLE: [${c.titleReward}] 👑`;

  victoryScreen.classList.remove('hidden');
};
