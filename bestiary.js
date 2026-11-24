// --- Monster Bestiary / Dex & Species Mastery Perks ---
const bestiaryData = JSON.parse(localStorage.getItem('monster_bestiary')) || {
  grunt: 0,
  speedster: 0,
  tank: 0,
  goblin: 0,
  boss: 0
};

const SPECIES_CATALOG = [
  {
    id: 'grunt',
    icon: '🔴',
    name: 'Swarm Grunt',
    desc: 'Standard frontline fiend. Travels in large numbers.',
    goal: 150,
    perkText: '+15% Bonus Coins from Grunts'
  },
  {
    id: 'speedster',
    icon: '🟣',
    name: 'Void Speedster',
    desc: 'Hyper-agile darting monster. Hard to track at high surges.',
    goal: 75,
    perkText: 'Slows Speedsters by 15%'
  },
  {
    id: 'tank',
    icon: '🟢',
    name: 'Armored Tank',
    desc: 'Heavy plated brute requiring multiple hits to crack.',
    goal: 50,
    perkText: '+1 Bonus Damage to Tanks'
  },
  {
    id: 'goblin',
    icon: '💰',
    name: 'Loot Goblin',
    desc: 'Greedy sprinter carrying time-shaving gems and coins.',
    goal: 15,
    perkText: '+1.0s Extra Time Shave on Catch'
  },
  {
    id: 'boss',
    icon: '👹',
    name: 'Overlord Boss',
    desc: 'Colossal swarm commander capable of cloaking and summoning.',
    goal: 10,
    perkText: '+2 Bonus Damage to Bosses'
  }
];

function saveBestiary() {
  localStorage.setItem('monster_bestiary', JSON.stringify(bestiaryData));
}

function hasMastery(speciesId) {
  const entry = SPECIES_CATALOG.find(s => s.id === speciesId);
  return entry && (bestiaryData[speciesId] || 0) >= entry.goal;
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "📖 Monster Dex" Button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const dexBtn = document.createElement('button');
    dexBtn.className = 'action-btn';
    dexBtn.innerHTML = '📖 Monster Dex';
    dexBtn.style.cssText = 'background: linear-gradient(135deg, #ff7f50, #ff6348); color: #fff;';
    dexBtn.addEventListener('click', () => {
      renderBestiaryModal();
      document.getElementById('bestiary-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(dexBtn);
    } else {
      startCard.appendChild(dexBtn);
    }
  }

  // 2. Build Bestiary Modal
  const modal = document.createElement('div');
  modal.id = 'bestiary-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '136';
  modal.innerHTML = `
    <div class="card" style="max-width: 560px; max-height: 90vh; display: flex; flex-direction: column;">
      <h2 style="color: #ff7f50; margin: 0 0 6px 0; font-size: 1.8rem;">📖 Monster Bestiary</h2>
      <p class="subtitle" style="margin-bottom: 12px;">Hunt each species to unlock permanent Mastery Perks!</p>
      <div id="dex-list" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; text-align: left;"></div>
      <button class="action-btn" id="close-dex-btn" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">Close Dex</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-dex-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
});

function renderBestiaryModal() {
  const listEl = document.getElementById('dex-list');
  if (!listEl) return;

  listEl.innerHTML = SPECIES_CATALOG.map(sp => {
    const kills = bestiaryData[sp.id] || 0;
    const unlocked = kills >= sp.goal;
    const pct = Math.min(100, Math.round((kills / sp.goal) * 100));

    return `
      <div style="
        background: ${unlocked ? 'rgba(46, 213, 115, 0.14)' : 'rgba(255, 255, 255, 0.05)'};
        border: 1px solid ${unlocked ? '#2ed573' : 'rgba(255, 255, 255, 0.12)'};
        border-radius: 12px; padding: 11px 14px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="font-weight: 900; font-size: 0.98rem; color: #fff;">${sp.icon} ${sp.name}</div>
          <div style="font-size: 0.82rem; font-weight: 800; color: ${unlocked ? '#2ed573' : '#ffa502'};">
            ${kills} / ${sp.goal} Slain
          </div>
        </div>
        <div style="font-size: 0.76rem; color: #a4b0be; margin-bottom: 6px;">${sp.desc}</div>
        <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
          <div style="width: ${pct}%; height: 100%; background: ${unlocked ? '#2ed573' : '#ff7f50'};"></div>
        </div>
        <div style="font-size: 0.76rem; font-weight: 800; color: ${unlocked ? '#2ed573' : '#ced6e0'};">
          ${unlocked ? `✅ MASTERED: ${sp.perkText}` : `🔒 Mastery Perk: ${sp.perkText}`}
        </div>
      </div>
    `;
  }).join('');
}

// --- Gameplay Hooks for Tracking Kills & Applying Mastery Perks ---

// 1. Track species kills & grant Grunt coin mastery bonus
const _dexOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  const t = monster.type || 'grunt';
  if (bestiaryData[t] !== undefined) {
    bestiaryData[t]++;
    saveBestiary();
  }

  if (t === 'grunt' && hasMastery('grunt') && typeof shopState !== 'undefined') {
    shopState.coins += 1;
    saveShopData();
  }

  _dexOrigDefeat(monster, clickX, clickY);
};

// 2. Apply Tank & Boss Mastery Bonus Damage
const _dexOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  if (monster.type === 'tank' && hasMastery('tank') && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 1);
  }
  if (monster.type === 'boss' && hasMastery('boss') && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 2);
  }
  _dexOrigClick(monster, clickX, clickY);
};

// 3. Apply Speedster Slow Mastery Perk on Spawn
const _dexOrigSpawn = spawnMonster;
spawnMonster = function(config, forcedType = null) {
  _dexOrigSpawn(config, forcedType);
  const newest = monsters[monsters.length - 1];
  if (newest && newest.type === 'speedster' && hasMastery('speedster')) {
    newest.vx *= 0.85;
    newest.vy *= 0.85;
  }
};

// 4. Track Loot Goblin catches & apply +1.0s Goblin Mastery bonus
const _dexOrigFloat = spawnFloatingText;
spawnFloatingText = function(x, y, text, color) {
  _dexOrigFloat(x, y, text, color);
  if (typeof text === 'string' && (text.includes('-2.0s') || text.includes('-4.0s'))) {
    bestiaryData.goblin++;
    saveBestiary();
    if (hasMastery('goblin') && typeof startTime !== 'undefined') {
      startTime = Math.min(performance.now(), startTime + 1000);
    }
  }
};
