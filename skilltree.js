// --- Branching 3-Path Ascension Skill Tree (Spend Rebirth Points 🔮) ---
const skillTreeState = {
  unlockedNodes: JSON.parse(localStorage.getItem('monster_ascension_nodes')) || []
};

const SKILL_BRANCHES = [
  {
    id: 'fury',
    name: '⚔️ Path of Fury',
    color: '#ff4757',
    nodes: [
      { id: 'fury_1', tier: 1, icon: '🗡️', name: 'Keen Edge',          desc: '+15% Mega-Crit chance on every click' },
      { id: 'fury_2', tier: 2, icon: '💥', name: 'Cleaving Impact',    desc: 'Every click splashes 1 DMG to nearby enemies' },
      { id: 'fury_3', tier: 3, icon: '☄️', name: 'Meteor Apocalypse',  desc: 'KEYSTONE: Every 20th kill rains meteors on 5 foes' }
    ]
  },
  {
    id: 'greed',
    name: '💰 Path of Greed',
    color: '#ffd32a',
    nodes: [
      { id: 'greed_1', tier: 1, icon: '🪙', name: 'Golden Touch',      desc: '+35% permanent Coin multiplier' },
      { id: 'greed_2', tier: 2, icon: '🧲', name: 'Goblin Lure',       desc: 'Spawns bonus Loot Goblins mid-hunt' },
      { id: 'greed_3', tier: 3, icon: '💎', name: 'Treasure Rain',     desc: 'KEYSTONE: Bosses drop +500 🪙 & spawn a Goblin' }
    ]
  },
  {
    id: 'time',
    name: '⏳ Path of Time',
    color: '#00d2d3',
    nodes: [
      { id: 'time_1', tier: 1, icon: '❄️', name: 'Temporal Drag',      desc: 'Slows all monsters by 15% permanently' },
      { id: 'time_2', tier: 2, icon: '🔋', name: 'Hyper-Reactor',      desc: 'Start every hunt with 100% Energy (⚡)' },
      { id: 'time_3', tier: 3, icon: '⚡', name: 'Chrono Warp',        desc: 'KEYSTONE: Every 10 kills shaves -0.5s off timer' }
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

  // Also add quick button in Endgame Vault header area
  const vaultCard = document.querySelector('#vault-modal .card');
  const closeVaultBtn = document.getElementById('close-vault-btn');
  if (vaultCard && closeVaultBtn) {
    const vaultTreeBtn = document.createElement('button');
    vaultTreeBtn.className = 'action-btn';
    vaultTreeBtn.id = 'vault-open-tree-btn';
    vaultTreeBtn.style.cssText = 'margin-bottom: 10px; background: linear-gradient(135deg, #00d2d3, #5f27cd); color: #fff;';
    vaultTreeBtn.textContent = '🔮 Open Ascension Skill Tree';
    vaultTreeBtn.addEventListener('click', () => {
      renderSkillTreeModal();
      document.getElementById('skilltree-modal').classList.remove('hidden');
    });
    vaultCard.insertBefore(vaultTreeBtn, closeVaultBtn);
  }

  // 2. Build the 3-Path Constellation Skill Tree Modal
  const modal = document.createElement('div');
  modal.id = 'skilltree-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '140';
  modal.innerHTML = `
    <div class="card" style="max-width: 660px; max-height: 92vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <h2 style="color: #ff9ff3; margin: 0; font-size: 1.75rem;">🔮 Ascension Skill Tree</h2>
        <div style="background: rgba(165,94,234,0.22); border: 1px solid #a55eea; padding: 5px 12px; border-radius: 50px; font-weight: 900; color: #ff9ff3;">
          🔮 Points: <span id="tree-pts-display">0</span>
        </div>
      </div>
      <p class="subtitle" style="margin-bottom: 14px;">
        Earn <b>1 Ascension Point (🔮)</b> every time you Rebirth! Unlock Tiers 1 → 2 → 3 Keystone in any path.
      </p>

      <div id="skilltree-columns" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;"></div>

      <div style="display: flex; gap: 10px;">
        <button id="respec-tree-btn" style="
          flex: 1; padding: 11px; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px;
          background: rgba(255,255,255,0.06); color: #ced6e0; font-weight: 800; cursor: pointer;
        ">🔄 Respec Points (Free)</button>
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
        ? `<div style="width: 4px; height: 14px; margin: 0 auto; background: ${unlocked ? branch.color : 'rgba(255,255,255,0.15)'}; box-shadow: ${unlocked ? `0 0 8px ${branch.color}` : 'none'};"></div>`
        : '';

      return `
        ${connector}
        <div class="skill-node-card" data-id="${node.id}" style="
          background: ${unlocked ? `${branch.color}28` : 'rgba(255, 255, 255, 0.04)'};
          border: ${isKeystone ? '2px' : '1.5px'} solid ${unlocked ? branch.color : (canUnlock ? '#fff' : 'rgba(255, 255, 255, 0.12)')};
          box-shadow: ${unlocked ? `0 0 16px ${branch.color}55` : 'none'};
          border-radius: ${isKeystone ? '14px' : '10px'};
          padding: 10px 8px;
          text-align: center;
          opacity: ${unlocked || prereqMet ? '1' : '0.45'};
          cursor: ${canUnlock ? 'pointer' : 'default'};
          transition: transform 0.15s, box-shadow 0.15s;
        ">
          <div style="font-size: ${isKeystone ? '1.65rem' : '1.35rem'}; margin-bottom: 3px;">${node.icon}</div>
          <div style="font-weight: 900; font-size: 0.82rem; color: ${unlocked ? branch.color : '#fff'};">${node.name}</div>
          <div style="font-size: 0.68rem; color: #ced6e0; margin: 4px 0 7px 0; line-height: 1.3;">${node.desc}</div>
          <div style="
            font-size: 0.68rem; font-weight: 900; padding: 3px 6px; border-radius: 5px;
            background: ${unlocked ? branch.color : (canUnlock ? '#2ed573' : 'rgba(255,255,255,0.08)')};
            color: ${unlocked || canUnlock ? '#07080c' : '#747d8c'};
          ">
            ${unlocked ? '✅ UNLOCKED' : (canUnlock ? '🔮 Unlock (1 Pt)' : (prereqMet ? 'Need 1 🔮' : `Requires Tier ${node.tier - 1}`))}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="background: rgba(0,0,0,0.35); border: 1px solid ${branch.color}44; border-radius: 12px; padding: 10px 8px;">
        <div style="font-weight: 900; font-size: 0.88rem; color: ${branch.color}; margin-bottom: 8px; text-transform: uppercase;">
          ${branch.name}
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
    ? `🔮 Ascension Skill Tree (${avail} Point${avail > 1 ? 's' : ''} Available!)`
    : `🔮 Ascension Skill Tree (${skillTreeState.unlockedNodes.length}/9 Unlocked)`;

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

// --- Ascension Skill Tree Gameplay Powers ---
let treeKillCounter = 0;

// 1. Path of Fury: Keen Edge (+15% Crit) & Cleaving Impact (Splash on click)
const _treeOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  if (hasSkill('fury_1') && Math.random() < 0.15 && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 3);
    spawnFloatingText(clickX, clickY - 16, '🗡️ FURY CRIT!', '#ff4757');
  }

  _treeOrigClick(monster, clickX, clickY);

  if (hasSkill('fury_2') && isGameRunning) {
    monsters.forEach(m => {
      if (m === monster) return;
      const dist = Math.hypot((m.x + m.size / 2) - clickX, (m.y + m.size / 2) - clickY);
      if (dist <= 48) {
        _treeOrigClick(m, m.x + m.size / 2, m.y + m.size / 2);
      }
    });
  }
};

// 2. Keystones: Meteor Apocalypse (Fury 3), Treasure Rain (Greed 3) & Chrono Warp (Time 3)
const _treeOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  const isBoss = monster.type === 'boss';
  _treeOrigDefeat(monster, clickX, clickY);
  if (!isGameRunning) return;

  treeKillCounter++;

  // Fury Tier 3 Keystone: Meteor Apocalypse every 20 kills
  if (hasSkill('fury_3') && treeKillCounter % 20 === 0 && monsters.length > 0) {
    triggerScreenShake();
    spawnFloatingText(window.innerWidth / 2, 135, '☄️ METEOR APOCALYPSE!', '#ff4757');
    const targets = [...monsters].sort(() => Math.random() - 0.5).slice(0, 5);
    targets.forEach(t => {
      const tx = t.x + t.size / 2;
      const ty = t.y + t.size / 2;
      spawnParticles(tx, ty, '#ff4757', 18);
      for (let d = 0; d < 3; d++) {
        if (monsters.includes(t)) _treeOrigClick(t, tx, ty);
      }
    });
  }

  // Greed Tier 3 Keystone: Treasure Rain on Boss defeat
  if (hasSkill('greed_3') && isBoss) {
    if (typeof shopState !== 'undefined') {
      shopState.coins += 500;
      saveShopData();
    }
    if (typeof spawnLootGoblin === 'function') spawnLootGoblin();
    spawnFloatingText(clickX, clickY - 24, '💎 TREASURE RAIN (+500 🪙)!', '#ffd32a');
  }

  // Time Tier 3 Keystone: Chrono Warp (-0.5s every 10 kills)
  if (hasSkill('time_3') && treeKillCounter % 10 === 0) {
    startTime = Math.min(performance.now(), startTime + 500);
    spawnFloatingText(clickX, clickY - 20, '⚡ -0.5s WARP!', '#00d2d3');
  }
};

// 3. Path of Greed Tier 1 (+35% Coins) & Tier 2 (Bonus Goblin Lure)
if (typeof addCoinsAndXP === 'function') {
  const _treeOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const mult = hasSkill('greed_1') ? 1.35 : 1;
    _treeOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}

setInterval(() => {
  if (isGameRunning && !isFrozen && hasSkill('greed_2') && Math.random() < 0.45) {
    if (typeof spawnLootGoblin === 'function') spawnLootGoblin();
  }
}, 9000);

// 4. Path of Time Tier 1 (15% Slow) & Tier 2 (Start at 100% Energy)
const _treeOrigStart = startGame;
startGame = function() {
  _treeOrigStart();
  if (hasSkill('time_1')) {
    monsters.forEach(m => {
      m.vx *= 0.85;
      m.vy *= 0.85;
    });
  }
  if (hasSkill('time_2') && typeof addEnergy === 'function') {
    addEnergy(100);
  }
};
