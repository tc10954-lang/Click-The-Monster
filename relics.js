// --- Artifact Relics & 2-Slot Build Loadout System ---
const relicState = {
  owned: JSON.parse(localStorage.getItem('monster_relics_owned')) || [],
  equipped: JSON.parse(localStorage.getItem('monster_relics_equipped')) || []
};

const RELIC_CATALOG = [
  {
    id: 'hourglass',
    icon: '⏳',
    name: 'Chronos Hourglass',
    cost: 15000,
    color: '#00d2d3',
    desc: 'Freeze orbs last 5.5s & power-ups stay 10s'
  },
  {
    id: 'midas',
    icon: '👑',
    name: 'Midas Crown',
    cost: 25000,
    color: '#ffd32a',
    desc: 'Every 12th kill spawns a guaranteed Loot Goblin'
  },
  {
    id: 'reactor',
    icon: '☢️',
    name: 'Chain-Reactor Core',
    cost: 40000,
    color: '#ff9f43',
    desc: '22% chance on click for a free mini Splash Blast'
  },
  {
    id: 'tesla',
    icon: '⚡',
    name: 'Tesla Overcharger',
    cost: 55000,
    color: '#54a0ff',
    desc: 'Passively regenerates +5% Energy (⚡) every second'
  },
  {
    id: 'vampire',
    icon: '🩸',
    name: 'Vampire Fang',
    cost: 75000,
    color: '#ff4757',
    desc: 'Every 15-hit combo shaves -1.0s off your timer'
  },
  {
    id: 'singularity',
    icon: '🌌',
    name: 'Singularity Orb',
    cost: 120000,
    color: '#a55eea',
    desc: 'Every 25 kills pulls & blasts all monsters for 2 DMG'
  }
];

function saveRelics() {
  localStorage.setItem('monster_relics_owned', JSON.stringify(relicState.owned));
  localStorage.setItem('monster_relics_equipped', JSON.stringify(relicState.equipped));
}

function hasRelicEquipped(id) {
  return relicState.equipped.includes(id);
}

window.addEventListener('DOMContentLoaded', () => {
  // Inject Relic Armory section inside the Endgame Vault Modal
  const vaultCard = document.querySelector('#vault-modal .card');
  const closeVaultBtn = document.getElementById('close-vault-btn');

  if (vaultCard && closeVaultBtn) {
    const relicHeader = document.createElement('div');
    relicHeader.id = 'vault-relic-header';
    relicHeader.style.cssText = 'font-size:0.78rem; font-weight:900; color:#ffd32a; text-align:left; margin-bottom:6px;';
    relicHeader.textContent = '🏺 ARTIFACT RELICS (EQUIP UP TO 2 FOR WILD BUILDS)';

    const relicGrid = document.createElement('div');
    relicGrid.id = 'vault-relic-grid';
    relicGrid.style.cssText = 'display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-bottom:16px; text-align:left;';

    vaultCard.insertBefore(relicHeader, closeVaultBtn);
    vaultCard.insertBefore(relicGrid, closeVaultBtn);
  }
});

// Hook renderVaultModal so Relics render cleanly inside the Endgame Vault
if (typeof renderVaultModal === 'function') {
  const _relicOrigRenderVault = renderVaultModal;
  renderVaultModal = function() {
    _relicOrigRenderVault();

    const grid = document.getElementById('vault-relic-grid');
    const header = document.getElementById('vault-relic-header');
    if (!grid) return;

    if (header) {
      header.textContent = `🏺 ARTIFACT RELICS (${relicState.equipped.length}/2 EQUIPPED)`;
    }

    const playerCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;

    grid.innerHTML = RELIC_CATALOG.map(r => {
      const owned = relicState.owned.includes(r.id);
      const equipped = relicState.equipped.includes(r.id);
      const canAfford = !owned && playerCoins >= r.cost;

      return `
        <div style="
          background: ${equipped ? 'rgba(255, 211, 42, 0.16)' : 'rgba(255, 255, 255, 0.04)'};
          border: 1px solid ${equipped ? '#ffd32a' : (owned ? r.color : 'rgba(255, 255, 255, 0.12)')};
          border-radius: 10px; padding: 9px;
        ">
          <div style="font-weight: 900; font-size: 0.84rem; color: ${r.color};">${r.icon} ${r.name}</div>
          <div style="font-size: 0.7rem; color: #ced6e0; margin: 3px 0 7px 0;">${r.desc}</div>
          <button class="relic-btn" data-id="${r.id}" ${owned || canAfford ? '' : 'disabled'} style="
            width: 100%; padding: 6px; border: none; border-radius: 6px; font-weight: 900; font-size: 0.74rem;
            cursor: ${owned || canAfford ? 'pointer' : 'not-allowed'};
            background: ${equipped ? '#2ed573' : (owned ? '#5352ed' : (canAfford ? r.color : 'rgba(255,255,255,0.08)'))};
            color: ${equipped || (!owned && canAfford) ? '#07080c' : '#fff'};
          ">
            ${equipped ? '✅ EQUIPPED' : (owned ? 'Equip Relic' : `Forge (${r.cost.toLocaleString()} 🪙)`)}
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.relic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const r = RELIC_CATALOG.find(item => item.id === id);
        if (!r) return;

        if (relicState.owned.includes(id)) {
          const idx = relicState.equipped.indexOf(id);
          if (idx !== -1) {
            relicState.equipped.splice(idx, 1);
          } else {
            if (relicState.equipped.length >= 2) relicState.equipped.shift();
            relicState.equipped.push(id);
          }
          saveRelics();
          renderVaultModal();
        } else if (typeof shopState !== 'undefined' && shopState.coins >= r.cost) {
          shopState.coins -= r.cost;
          saveShopData();
          relicState.owned.push(id);
          if (relicState.equipped.length < 2) relicState.equipped.push(id);
          saveRelics();
          if (typeof sfx !== 'undefined') sfx.victory();
          renderVaultModal();
        }
      });
    });
  };
}

// --- Relic Gameplay Hooks ---
let relicKillCounter = 0;

// 1. Chronos Hourglass: Extend Freeze duration from 3s to 5.5s
if (typeof activateFreeze === 'function') {
  const _relicOrigFreeze = activateFreeze;
  activateFreeze = function(x, y) {
    _relicOrigFreeze(x, y);
    if (hasRelicEquipped('hourglass')) {
      clearTimeout(freezeTimer);
      spawnFloatingText(x, y - 20, '⏳ EXTENDED FREEZE (5.5s)!', '#00d2d3');
      freezeTimer = setTimeout(() => {
        isFrozen = false;
        document.body.classList.remove('frozen');
      }, 5500);
    }
  };
}

// 2. Chain-Reactor Core: 22% chance on click for a free mini Splash Blast
const _relicOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  _relicOrigClick(monster, clickX, clickY);

  if (hasRelicEquipped('reactor') && Math.random() < 0.22 && isGameRunning) {
    const ring = document.createElement('div');
    ring.className = 'splash-ring';
    ring.style.width = '120px';
    ring.style.height = '120px';
    ring.style.left = `${clickX}px`;
    ring.style.top = `${clickY}px`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 350);

    monsters.forEach(m => {
      if (m === monster) return;
      const dist = Math.hypot((m.x + m.size / 2) - clickX, (m.y + m.size / 2) - clickY);
      if (dist <= 65) {
        _relicOrigClick(m, m.x + m.size / 2, m.y + m.size / 2);
      }
    });
  }
};

// 3. Midas Crown, Vampire Fang & Singularity Orb on Defeat
const _relicOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  _relicOrigDefeat(monster, clickX, clickY);
  if (!isGameRunning) return;

  relicKillCounter++;

  // Midas Crown: Every 12th kill spawns a Loot Goblin
  if (hasRelicEquipped('midas') && relicKillCounter % 12 === 0 && typeof spawnLootGoblin === 'function') {
    spawnLootGoblin();
    spawnFloatingText(clickX, clickY - 22, '👑 MIDAS GOBLIN!', '#ffd32a');
  }

  // Vampire Fang: Every 15th combo hit shaves -1.0s off timer
  if (hasRelicEquipped('vampire') && combo > 0 && combo % 15 === 0) {
    startTime = Math.min(performance.now(), startTime + 1000);
    spawnFloatingText(clickX, clickY - 22, '🩸 -1.0s SIPHON!', '#ff4757');
  }

  // Singularity Orb: Every 25 kills pulls & blasts all monsters
  if (hasRelicEquipped('singularity') && relicKillCounter % 25 === 0 && monsters.length > 0) {
    triggerScreenShake();
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;
    spawnParticles(midX, midY, '#a55eea', 40);
    spawnFloatingText(midX, midY, '🌌 SINGULARITY PULSE!', '#a55eea');

    [...monsters].forEach(m => {
      m.x = midX + (Math.random() - 0.5) * 90;
      m.y = midY + (Math.random() - 0.5) * 90;
      _relicOrigClick(m, m.x, m.y);
    });
  }
};

// 4. Tesla Overcharger: Passive +5% Energy per second during active hunts
setInterval(() => {
  if (isGameRunning && hasRelicEquipped('tesla') && typeof addEnergy === 'function') {
    addEnergy(5);
  }
}, 1000);
