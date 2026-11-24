// --- 6-Branch Overpowered Ascension Skill Tree (Branches of Branches!) ---
const skillTreeState = {
  unlockedNodes: JSON.parse(localStorage.getItem('monster_ascension_nodes')) || []
};

const SKILL_BRANCHES = [
  {
    id: 'fury_a',
    parent: '⚔️ Fury: Annihilation',
    color: '#ff4757',
    nodes: [
      { id: 'fury_1',  tier: 1, icon: '🗡️', name: 'Keen Edge',          desc: '+25% chance for 5x Mega-Crits' },
      { id: 'fury_2',  tier: 2, icon: '💥', name: 'Cleaving Impact',    desc: 'Every click splashes 2 DMG in 90px' },
      { id: 'fury_3',  tier: 3, icon: '☄️', name: 'Meteor Apocalypse',  desc: 'KEYSTONE: Every 12 kills blasts 8 foes for 6 DMG' }
    ]
  },
  {
    id: 'fury_b',
    parent: '⚡ Fury: Overdrive',
    color: '#ff6b81',
    nodes: [
      { id: 'over_1',  tier: 1, icon: '🔋', name: 'Static Surge',       desc: 'Gain +15% Energy (⚡) on every kill' },
      { id: 'over_2',  tier: 2, icon: '🔥', name: 'Arc Overload',       desc: 'Clicks arc lightning to 3 foes for 2 DMG' },
      { id: 'over_3',  tier: 3, icon: '🌩️', name: 'Storm God',          desc: 'KEYSTONE: Auto-zaps 2 random monsters every 0.8s' }
    ]
  },
  {
    id: 'greed_a',
    parent: '💰 Greed: Tycoon',
    color: '#ffd32a',
    nodes: [
      { id: 'greed_1', tier: 1, icon: '🪙', name: 'Golden Touch',       desc: '+75% permanent Coin multiplier' },
      { id: 'greed_2', tier: 2, icon: '🤑', name: 'Midas Mint',         desc: '+15 flat bonus Coins on every single kill' },
      { id: 'greed_3', tier: 3, icon: '💎', name: 'Jackpot Empire',     desc: 'KEYSTONE: Bosses drop +2,000 🪙 & spawn a Goblin' }
    ]
  },
  {
    id: 'greed_b',
    parent: '🐾 Greed: Beastmaster',
    color: '#ffa502',
    nodes: [
      { id: 'beast_1', tier: 1, icon: '🧲', name: 'Goblin Magnet',      desc: 'Frequent bonus Loot Goblin spawns' },
      { id: 'beast_2', tier: 2, icon: '⚡', name: 'Alpha Frenzy',       desc: 'Your Battle Pets attack 2x faster' },
      { id: 'beast_3', tier: 3, icon: '🐉', name: 'Dragon Swarm',       desc: 'KEYSTONE: Every 15 kills unleashes Dragon Fire (4 DMG)' }
    ]
  },
  {
    id: 'time_a',
    parent: '⏳ Time: Chronomancer',
    color: '#00d2d3',
    nodes: [
      { id: 'time_1',  tier: 1, icon: '❄️', name: 'Temporal Drag',      desc: 'Slows all monsters by 25% permanently' },
      { id: 'time_2',  tier: 2, icon: '🚀', name: 'Hyper-Reactor',      desc: 'Start every hunt at 100% Energy (⚡)' },
      { id: 'time_3',  tier: 3, icon: '⚡', name: 'Reality Warp',       desc: 'KEYSTONE: Every 8 kills shaves -1.0s off timer' }
    ]
  },
  {
    id: 'time_b',
    parent: '☠️ Time: Reaper',
    color: '#a55eea',
    nodes: [
      { id: 'reap_1',  tier: 1, icon: '🪓', name: 'Executioner',        desc: 'Instantly kills enemies below 30% HP' },
      { id: 'reap_2',  tier: 2, icon: '🩸', name: 'Soul Siphon',        desc: 'Every 10 combo hits shaves -0.8s off timer' },
      { id: 'reap_3',  tier: 3, icon: '🌌', name: 'Black Hole Collapse',desc: 'KEYSTONE: Every 22 kills crushes ALL foes for 5 DMG' }
    ]
  }
];

function saveSkillTree() {
  localStorage.setItem('monster_ascension_nodes', JSON.stringify(skillTreeState.unlockedNodes));
}

function hasSkill(nodeId) {
  return skillTreeState.unlockedNodes.includes(nodeId);
}

function getTotalAscensionPoints() {
  return typeof careerData !== 'undefined' ? (careerData.rebirths || 0) : 0;
}

function getAvailableAscensionPoints() {
  return Math.max(0, getTotalAscensionPoints() - skillTreeState.unlockedNodes.length);
}
window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🔮 Ascension Tree" Button inside Career & Prestige Modal AND Endgame Vault
  const prestigeBox = document.getElementById('prestige-box');
  if (prestigeBox) {
    const openTreeBtn = document.createElement('button');
    openTreeBtn.id = 'open-skilltree-btn';
    openTreeBtn.style.cssText = `
      width: 100%; margin-top: 8px; padding: 11px; border: 2px solid #00d2d3;
      border-radius: 8px; font-weight: 900; font-size: 0.95rem; cursor: pointer;
      background: linear-gradient(135deg, rgba(0,210,211,0.22), rgba(165,94,234,0.22));
      color: #fff; box-shadow: 0 0 15px rgba(0,210,211,0.3);
    `;
    openTreeBtn.addEventListener('click', () => {
      renderSkillTreeModal();
      document.getElementById('skilltree-modal').classList.remove('hidden');
    });
    prestigeBox.appendChild(openTreeBtn);
  }

  const vaultCard = document.querySelector('#vault-modal .card');
  const closeVaultBtn = document.getElementById('close-vault-btn');
  if (vaultCard && closeVaultBtn) {
    const vaultTreeBtn = document.createElement('button');
    vaultTreeBtn.className = 'action-btn';
    vaultTreeBtn.id = 'vault-open-tree-btn';
    vaultTreeBtn.style.cssText = 'margin-bottom: 10px; background: linear-gradient(135deg, #00d2d3, #5f27cd); color: #fff;';
    vaultTreeBtn.textContent = '🔮 Open 6-Branch Skill Tree';
    vaultTreeBtn.addEventListener('click', () => {
      renderSkillTreeModal();
      document.getElementById('skilltree-modal').classList.remove('hidden');
    });
    vaultCard.insertBefore(vaultTreeBtn, closeVaultBtn);
  }

  // 2. Build the 6-Branch Sub-Tree Constellation Modal
  const modal = document.createElement('div');
  modal.id = 'skilltree-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '140';
  modal.innerHTML = `
    <div class="card" style="max-width: 960px; width: 95vw; max-height: 92vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 8px;">
        <h2 style="color: #ff9ff3; margin: 0; font-size: 1.7rem;">🔮 6-Branch Ascension Skill Tree</h2>
        <div style="background: rgba(165,94,234,0.25); border: 1.5px solid #a55eea; padding: 5px 14px; border-radius: 50px; font-weight: 900; color: #ff9ff3;">
          🔮 Points: <span id="tree-pts-display">0</span>
        </div>
      </div>
      <p class="subtitle" style="margin-bottom: 12px;">
        3 Core Paths split into <b>6 Overpowered Sub-Branches</b>! Earn <b>1 🔮</b> per Rebirth (Tiers 1 → 2 → 3 Keystone).
      </p>

      <div id="skilltree-columns" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 8px; margin-bottom: 16px;"></div>

      <div style="display: flex; gap: 10px;">
        <button id="respec-tree-btn" style="
          flex: 1; padding: 11px; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px;
          background: rgba(255,255,255,0.06); color: #ced6e0; font-weight: 800; cursor: pointer;
        ">🔄 Respec All Points (Free)</button>
        <button class="action-btn" id="close-tree-btn" style="flex: 2; background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">
          Close Tree
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-tree-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('respec-tree-btn').addEventListener('click', () => {
    skillTreeState.unlockedNodes = [];
    saveSkillTree();
    if (typeof sfx !== 'undefined') sfx.armorHit();
    renderSkillTreeModal();
    updateCareerTreeButton();
  });
});

function renderSkillTreeModal() {
  const colsEl = document.getElementById('skilltree-columns');
  const ptsEl = document.getElementById('tree-pts-display');
  const availPts = getAvailableAscensionPoints();

  if (ptsEl) ptsEl.textContent = `${availPts} / ${getTotalAscensionPoints()}`;
  if (!colsEl) return;

  colsEl.innerHTML = SKILL_BRANCHES.map(branch => {
    const nodesHtml = branch.nodes.map((node, idx) => {
      const unlocked = hasSkill(node.id);
      const prevNode = idx > 0 ? branch.nodes.at(idx - 1) : null;
      const prereqMet = !prevNode || hasSkill(prevNode.id);
      const canUnlock = !unlocked && prereqMet && availPts > 0;
      const isKeystone = node.tier === 3;

      const connector = idx > 0
        ? `<div style="width: 4px; height: 12px; margin: 0 auto; background: ${unlocked ? branch.color : 'rgba(255,255,255,0.15)'}; box-shadow: ${unlocked ? `0 0 8px ${branch.color}` : 'none'};"></div>`
        : '';

      return `
        ${connector}
        <div class="skill-node-card" data-id="${node.id}" style="
          background: ${unlocked ? `${branch.color}28` : 'rgba(255, 255, 255, 0.04)'};
          border: ${isKeystone ? '2px' : '1.5px'} solid ${unlocked ? branch.color : (canUnlock ? '#fff' : 'rgba(255, 255, 255, 0.12)')};
          box-shadow: ${unlocked ? `0 0 14px ${branch.color}55` : 'none'};
          border-radius: ${isKeystone ? '14px' : '10px'};
          padding: 8px 6px;
          text-align: center;
          opacity: ${unlocked || prereqMet ? '1' : '0.45'};
          cursor: ${canUnlock ? 'pointer' : 'default'};
        ">
          <div style="font-size: ${isKeystone ? '1.55rem' : '1.25rem'}; margin-bottom: 2px;">${node.icon}</div>
          <div style="font-weight: 900; font-size: 0.78rem; color: ${unlocked ? branch.color : '#fff'};">${node.name}</div>
          <div style="font-size: 0.65rem; color: #ced6e0; margin: 3px 0 6px 0; line-height: 1.25;">${node.desc}</div>
          <div style="
            font-size: 0.64rem; font-weight: 900; padding: 3px 5px; border-radius: 5px;
            background: ${unlocked ? branch.color : (canUnlock ? '#2ed573' : 'rgba(255,255,255,0.08)')};
            color: ${unlocked || canUnlock ? '#07080c' : '#747d8c'};
          ">
            ${unlocked ? '✅ ACTIVE' : (canUnlock ? '🔮 Unlock' : (prereqMet ? 'Need 1 🔮' : `Tier ${node.tier - 1}`))}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="background: rgba(0,0,0,0.38); border: 1px solid ${branch.color}55; border-radius: 12px; padding: 8px 6px;">
        <div style="font-weight: 900; font-size: 0.74rem; color: ${branch.color}; margin-bottom: 6px; text-transform: uppercase;">
          ${branch.parent}
        </div>
        ${nodesHtml}
      </div>
    `;
  }).join('');

  colsEl.querySelectorAll('.skill-node-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (hasSkill(id) || getAvailableAscensionPoints() <= 0) return;

      for (const b of SKILL_BRANCHES) {
        const idx = b.nodes.findIndex(n => n.id === id);
        if (idx !== -1) {
          const prev = idx > 0 ? b.nodes.at(idx - 1) : null;
          if (!prev || hasSkill(prev.id)) {
            skillTreeState.unlockedNodes.push(id);
            saveSkillTree();
            if (typeof sfx !== 'undefined') sfx.powerup();
            triggerScreenShake();
            renderSkillTreeModal();
            updateCareerTreeButton();
          }
          break;
        }
      }
    });
  });
}

function updateCareerTreeButton() {
  const avail = getAvailableAscensionPoints();
  const label = avail > 0
    ? `🔮 6-Branch Skill Tree (${avail} Pt${avail > 1 ? 's' : ''} Available!)`
    : `🔮 6-Branch Skill Tree (${skillTreeState.unlockedNodes.length}/18 Unlocked)`;

  const btn1 = document.getElementById('open-skilltree-btn');
  const btn2 = document.getElementById('vault-open-tree-btn');
  if (btn1) btn1.textContent = label;
  if (btn2) btn2.textContent = label;
}

if (typeof renderCareerModal === 'function') {
  const _treeOrigRenderCareer = renderCareerModal;
  renderCareerModal = function() {
    _treeOrigRenderCareer();
    updateCareerTreeButton();
  };
}
// --- 6-Branch Overpowered Skill Tree Gameplay Engine ---
let treeKillCounter = 0;

// 1. Click & On-Hit Skills (Fury 1 & 2, Overdrive 2, Reaper 1)
const _treeOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  // Fury Tier 1: +25% chance for 5x Mega-Crits
  if (hasSkill('fury_1') && Math.random() < 0.25 && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 4);
    spawnFloatingText(clickX, clickY - 16, '🗡️ 5X FURY CRIT!', '#ff4757');
  }

  // Reaper Tier 1 (Executioner): Instantly kill enemies below 30% HP
  if (hasSkill('reap_1') && monster.hp > 1 && (monster.hp / monster.maxHp) <= 0.30) {
    monster.hp = 1;
    spawnFloatingText(clickX, clickY - 18, '🪓 EXECUTED!', '#a55eea');
  }

  _treeOrigClick(monster, clickX, clickY);

  if (!isGameRunning) return;

  // Fury Tier 2 (Cleaving Impact): Splashes 2 DMG within 90px
  if (hasSkill('fury_2')) {
    monsters.forEach(m => {
      if (m === monster) return;
      const dist = Math.hypot((m.x + m.size / 2) - clickX, (m.y + m.size / 2) - clickY);
      if (dist <= 90) {
        _treeOrigClick(m, m.x + m.size / 2, m.y + m.size / 2);
        if (monsters.includes(m)) _treeOrigClick(m, m.x + m.size / 2, m.y + m.size / 2);
      }
    });
  }

  // Overdrive Tier 2 (Arc Overload): Chains lightning to 3 random enemies for 2 DMG
  if (hasSkill('over_2') && monsters.length > 1) {
    const arcs = [...monsters].filter(m => m !== monster).sort(() => Math.random() - 0.5).slice(0, 3);
    arcs.forEach(t => {
      const tx = t.x + t.size / 2;
      const ty = t.y + t.size / 2;
      spawnParticles(tx, ty, '#ff6b81', 6);
      _treeOrigClick(t, tx, ty);
      if (monsters.includes(t)) _treeOrigClick(t, tx, ty);
    });
  }
};

// 2. On-Defeat & Keystone Skills
const _treeOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  const isBoss = monster.type === 'boss';
  _treeOrigDefeat(monster, clickX, clickY);
  if (!isGameRunning) return;

  treeKillCounter++;

  // Overdrive Tier 1: +15% Energy on every kill
  if (hasSkill('over_1') && typeof addEnergy === 'function') {
    addEnergy(15);
  }

  // Greed Tier 2 (Midas Mint): +15 flat Coins on every kill
  if (hasSkill('greed_2') && typeof shopState !== 'undefined') {
    shopState.coins += 15;
    saveShopData();
  }

  // Reaper Tier 2 (Soul Siphon): Every 10 combo hits shaves -0.8s off timer
  if (hasSkill('reap_2') && combo > 0 && combo % 10 === 0) {
    startTime = Math.min(performance.now(), startTime + 800);
    spawnFloatingText(clickX, clickY - 22, '🩸 -0.8s SIPHON!', '#a55eea');
  }

  // Time Tier 3 Keystone (Reality Warp): Every 8 kills shaves -1.0s off timer
  if (hasSkill('time_3') && treeKillCounter % 8 === 0) {
    startTime = Math.min(performance.now(), startTime + 1000);
    spawnFloatingText(clickX, clickY - 22, '⚡ -1.0s REALITY WARP!', '#00d2d3');
  }

  // Fury Tier 3 Keystone (Meteor Apocalypse): Every 12 kills blasts 8 foes for 6 DMG
  if (hasSkill('fury_3') && treeKillCounter % 12 === 0 && monsters.length > 0) {
    triggerScreenShake();
    spawnFloatingText(window.innerWidth / 2, 135, '☄️ METEOR APOCALYPSE!', '#ff4757');
    const targets = [...monsters].sort(() => Math.random() - 0.5).slice(0, 8);
    targets.forEach(t => {
      const tx = t.x + t.size / 2;
      const ty = t.y + t.size / 2;
      spawnParticles(tx, ty, '#ff4757', 16);
      for (let d = 0; d < 6; d++) {
        if (monsters.includes(t)) _treeOrigClick(t, tx, ty);
      }
    });
  }

  // Beastmaster Tier 3 Keystone (Dragon Swarm): Every 15 kills unleashes Dragon Fire (4 DMG)
  if (hasSkill('beast_3') && treeKillCounter % 15 === 0 && monsters.length > 0) {
    triggerScreenShake();
    spawnFloatingText(window.innerWidth / 2, 165, '🐉 DRAGON SWARM BREATH!', '#ffa502');
    const targets = [...monsters].slice(0, 10);
    targets.forEach(t => {
      const tx = t.x + t.size / 2;
      const ty = t.y + t.size / 2;
      spawnParticles(tx, ty, '#ffa502', 14);
      for (let d = 0; d < 4; d++) {
        if (monsters.includes(t)) _treeOrigClick(t, tx, ty);
      }
    });
  }

  // Reaper Tier 3 Keystone (Black Hole Collapse): Every 22 kills crushes ALL monsters for 5 DMG
  if (hasSkill('reap_3') && treeKillCounter % 22 === 0 && monsters.length > 0) {
    triggerScreenShake();
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;
    spawnParticles(midX, midY, '#a55eea', 45);
    spawnFloatingText(midX, midY, '🌌 BLACK HOLE COLLAPSE!', '#a55eea');
    [...monsters].forEach(m => {
      m.x = midX + (Math.random() - 0.5) * 70;
      m.y = midY + (Math.random() - 0.5) * 70;
      for (let d = 0; d < 5; d++) {
        if (monsters.includes(m)) _treeOrigClick(m, m.x, m.y);
      }
    });
  }

  // Greed Tier 3 Keystone (Jackpot Empire): Bosses drop +2,000 Coins & spawn a Goblin
  if (hasSkill('greed_3') && isBoss) {
    if (typeof shopState !== 'undefined') {
      shopState.coins += 2000;
      saveShopData();
    }
    if (typeof spawnLootGoblin === 'function') spawnLootGoblin();
    spawnFloatingText(clickX, clickY - 26, '💎 JACKPOT EMPIRE (+2,000 🪙)!', '#ffd32a');
  }
};

// 3. Greed Tier 1 (+75% Coin Multiplier)
if (typeof addCoinsAndXP === 'function') {
  const _treeOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const mult = hasSkill('greed_1') ? 1.75 : 1;
    _treeOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}

// 4. Passive Timers: Storm God (Overdrive 3) & Goblin Magnet (Beastmaster 1)
setInterval(() => {
  if (!isGameRunning || isFrozen || monsters.length === 0) return;

  if (hasSkill('over_3')) {
    const zaps = [...monsters].sort(() => Math.random() - 0.5).slice(0, 2);
    zaps.forEach(t => {
      const tx = t.x + t.size / 2;
      const ty = t.y + t.size / 2;
      spawnParticles(tx, ty, '#ff6b81', 8);
      _treeOrigClick(t, tx, ty);
      if (monsters.includes(t)) _treeOrigClick(t, tx, ty);
    });
  }
}, 800);

setInterval(() => {
  if (isGameRunning && !isFrozen && hasSkill('beast_1') && Math.random() < 0.55) {
    if (typeof spawnLootGoblin === 'function') spawnLootGoblin();
  }
}, 7500);

// 5. Game Start Modifiers: Time 1 (25% Slow), Time 2 (100% Energy), Beastmaster 2 (2x Pet Speed)
const _treeOrigStart = startGame;
startGame = function() {
  _treeOrigStart();
  if (hasSkill('time_1')) {
    monsters.forEach(m => {
      m.vx *= 0.75;
      m.vy *= 0.75;
    });
  }
  if (hasSkill('time_2') && typeof addEnergy === 'function') {
    addEnergy(100);
  }
  if (hasSkill('beast_2') && typeof PET_CATALOG !== 'undefined' && typeof spawnActiveBattlePets === 'function') {
    PET_CATALOG.forEach(p => { p.fireMs = Math.max(180, Math.round(p.fireMs * 0.5)); });
    spawnActiveBattlePets();
  }
};
