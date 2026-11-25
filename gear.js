// --- Randomized RPG Gear Drops, Inventory & Upgrade Forge ---
const gearState = {
  inventory: JSON.parse(localStorage.getItem('monster_rpg_gear_inv')) || [],
  equipped: JSON.parse(localStorage.getItem('monster_rpg_gear_eq')) || {
    helm: null,
    gloves: null,
    ring: null,
    amulet: null
  },
  scrap: parseInt(localStorage.getItem('monster_rpg_scrap')) || 0
};

const GEAR_SLOTS = [
  { id: 'helm',   icon: '🪖', label: 'Helm' },
  { id: 'gloves', icon: '🧤', label: 'Gauntlets' },
  { id: 'ring',   icon: '💍', label: 'Ring' },
  { id: 'amulet', icon: '📿', label: 'Amulet' }
];

const GEAR_RARITIES = [
  { id: 'common',    name: 'Common',    color: '#dfe4ea', mult: 1.0, weight: 48 },
  { id: 'rare',      name: 'Rare',      color: '#54a0ff', mult: 1.6, weight: 28 },
  { id: 'epic',      name: 'Epic',      color: '#a55eea', mult: 2.4, weight: 14 },
  { id: 'legendary', name: 'Legendary', color: '#ffd32a', mult: 3.5, weight: 7 },
  { id: 'mythic',    name: 'Mythic',    color: '#ff4757', mult: 5.0, weight: 3 }
];

const GEAR_PREFIXES = ['Vanguard', 'Abyssal', 'Solar', 'Phantom', 'Dragonscale', 'Stormforged', 'Voidwalker'];

function saveGearData() {
  localStorage.setItem('monster_rpg_gear_inv', JSON.stringify(gearState.inventory));
  localStorage.setItem('monster_rpg_gear_eq', JSON.stringify(gearState.equipped));
  localStorage.setItem('monster_rpg_scrap', gearState.scrap.toString());
}

function generateRandomGear(forcedRarityId = null) {
  const slotObj = GEAR_SLOTS.at(Math.floor(Math.random() * GEAR_SLOTS.length));
  let rarity = GEAR_RARITIES.at(0);

  if (forcedRarityId) {
    rarity = GEAR_RARITIES.find(r => r.id === forcedRarityId) || rarity;
  } else {
    const roll = Math.random() * 100;
    let sum = 0;
    for (const r of GEAR_RARITIES) {
      sum += r.weight;
      if (roll <= sum) { rarity = r; break; }
    }
  }

  const prefix = GEAR_PREFIXES.at(Math.floor(Math.random() * GEAR_PREFIXES.length));
  const statRoll = Math.random();
  let statType = 'coinPct';
  let statVal = Math.round((8 + Math.random() * 10) * rarity.mult);

  if (statRoll < 0.30) {
    statType = 'bonusDmg';
    statVal = Math.max(1, Math.round(1 * rarity.mult));
  } else if (statRoll < 0.60) {
    statType = 'critPct';
    statVal = Math.round((4 + Math.random() * 5) * rarity.mult);
  } else if (statRoll < 0.80) {
    statType = 'bossDmg';
    statVal = Math.max(1, Math.round(2 * rarity.mult));
  }

  return {
    uid: `g_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
    slot: slotObj.id,
    icon: slotObj.icon,
    name: `${prefix} ${slotObj.label}`,
    rarity: rarity.id,
    rarityName: rarity.name,
    color: rarity.color,
    level: 1,
    statType,
    statVal
  };
}

function formatGearStat(item) {
  const scaled = Math.round(item.statVal * (1 + (item.level - 1) * 0.35));
  if (item.statType === 'bonusDmg') return `+${scaled} Base Click DMG`;
  if (item.statType === 'critPct')  return `+${scaled}% Crit Chance`;
  if (item.statType === 'bossDmg')  return `+${scaled} Bonus Boss DMG`;
  return `+${scaled}% Coin Find`;
}

function getEquippedGearTotals() {
  const totals = { bonusDmg: 0, critPct: 0, bossDmg: 0, coinPct: 0 };
  Object.values(gearState.equipped).forEach(uid => {
    if (!uid) return;
    const item = gearState.inventory.find(i => i.uid === uid);
    if (!item) return;
    const scaled = Math.round(item.statVal * (1 + (item.level - 1) * 0.35));
    totals[item.statType] = (totals[item.statType] || 0) + scaled;
  });
  return totals;
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🎒 Gear & Forge" Button to Start Menu
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const gearBtn = document.createElement('button');
    gearBtn.className = 'action-btn';
    gearBtn.innerHTML = '🎒 Gear & Forge';
    gearBtn.style.cssText = 'background: linear-gradient(135deg, #5352ed, #3742fa); color: #fff;';
    gearBtn.addEventListener('click', () => {
      renderGearModal();
      document.getElementById('gear-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(gearBtn);
    } else {
      startCard.appendChild(gearBtn);
    }
  }

  // 2. Build Gear Inventory & Forge Modal
  const modal = document.createElement('div');
  modal.id = 'gear-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '148';
  modal.innerHTML = `
    <div class="card" style="max-width: 620px; max-height: 92vh; overflow-y: auto; text-align: left;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <h2 style="color: #70a1ff; margin: 0; font-size: 1.75rem;">🎒 RPG Gear & Forge</h2>
        <div style="font-size: 1rem; font-weight: 900; color: #00d2d3;">🔩 Scrap: <span id="gear-scrap-bal">0</span></div>
      </div>
      <p class="subtitle" style="margin-bottom: 10px;">Monsters & Bosses drop randomized RPG gear! Salvage extras into Scrap to upgrade.</p>

      <div id="gear-totals-bar" style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:7px 10px; font-size:0.75rem; font-weight:800; color:#2ed573; margin-bottom:10px;"></div>

      <div style="font-size:0.74rem; font-weight:900; color:#a4b0be; margin-bottom:5px;">EQUIPPED LOADOUT (4 SLOTS)</div>
      <div id="gear-equipped-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-bottom:12px;"></div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <span style="font-size:0.74rem; font-weight:900; color:#a4b0be;">INVENTORY BAG (<span id="gear-bag-count">0</span>/24)</span>
        <button id="gear-forge-chest-btn" style="padding:4px 10px; border:none; border-radius:6px; background:#ffd32a; color:#07080c; font-weight:900; font-size:0.72rem; cursor:pointer;">
          ⚒️ Craft Random Gear (1,500 🪙)
        </button>
      </div>
      <div id="gear-bag-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; max-height:220px; overflow-y:auto; margin-bottom:14px;"></div>

      <button class="action-btn" id="close-gear-btn" style="background:linear-gradient(135deg, #ff4757, #ff6b81); color:#fff;">Close Inventory</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-gear-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('gear-forge-chest-btn').addEventListener('click', () => {
    if (typeof shopState !== 'undefined' && shopState.coins >= 1500 && gearState.inventory.length < 24) {
      shopState.coins -= 1500;
      saveShopData();
      const item = generateRandomGear();
      gearState.inventory.push(item);
      saveGearData();
      if (typeof sfx !== 'undefined') sfx.powerup();
      renderGearModal();
    }
  });
});
function renderGearModal() {
  document.getElementById('gear-scrap-bal').textContent = gearState.scrap.toLocaleString();
  document.getElementById('gear-bag-count').textContent = gearState.inventory.length;

  const totals = getEquippedGearTotals();
  document.getElementById('gear-totals-bar').textContent =
    `Active Gear Stats: +${totals.bonusDmg} Click DMG • +${totals.critPct}% Crit • +${totals.bossDmg} Boss DMG • +${totals.coinPct}% Coins`;

  // 1. Render 4 Equipped Slots
  const eqGrid = document.getElementById('gear-equipped-grid');
  eqGrid.innerHTML = GEAR_SLOTS.map(slot => {
    const uid = gearState.equipped[slot.id];
    const item = uid ? gearState.inventory.find(i => i.uid === uid) : null;

    if (!item) {
      return `
        <div style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.18); border-radius:10px; padding:9px; color:#747d8c; font-size:0.76rem;">
          ${slot.icon} Empty ${slot.label} Slot
        </div>
      `;
    }

    const upgCost = item.level * 15;
    const canUpg = gearState.scrap >= upgCost;

    return `
      <div style="background:rgba(255,255,255,0.06); border:1.5px solid ${item.color}; border-radius:10px; padding:8px;">
        <div style="font-weight:900; font-size:0.8rem; color:${item.color};">${item.icon} ${item.name} <span style="color:#fff;">+${item.level}</span></div>
        <div style="font-size:0.7rem; color:#2ed573; margin:2px 0 6px 0;">${formatGearStat(item)}</div>
        <div style="display:flex; gap:5px;">
          <button class="upg-gear-btn" data-uid="${item.uid}" ${canUpg ? '' : 'disabled'} style="
            flex:2; padding:4px; border:none; border-radius:5px; font-weight:800; font-size:0.68rem;
            background:${canUpg ? '#00d2d3' : 'rgba(255,255,255,0.1)'}; color:${canUpg ? '#07080c' : '#747d8c'}; cursor:${canUpg ? 'pointer' : 'not-allowed'};
          ">Upgrade (${upgCost} 🔩)</button>
          <button class="uneq-gear-btn" data-slot="${slot.id}" style="
            flex:1; padding:4px; border:none; border-radius:5px; font-weight:800; font-size:0.68rem; background:rgba(255,255,255,0.12); color:#fff; cursor:pointer;
          ">Unequip</button>
        </div>
      </div>
    `;
  }).join('');

  // 2. Render Unequipped Bag Items
  const bagGrid = document.getElementById('gear-bag-grid');
  const equippedUids = Object.values(gearState.equipped).filter(Boolean);
  const unequipped = gearState.inventory.filter(i => !equippedUids.includes(i.uid));

  if (unequipped.length === 0) {
    bagGrid.innerHTML = `<div style="grid-column:1/-1; color:#747d8c; font-size:0.76rem; padding:12px; text-align:center;">Bag is empty — defeat monsters or craft gear!</div>`;
  } else {
    bagGrid.innerHTML = unequipped.map(item => `
      <div style="background:rgba(255,255,255,0.04); border:1px solid ${item.color}; border-radius:9px; padding:8px;">
        <div style="font-weight:900; font-size:0.78rem; color:${item.color};">${item.icon} ${item.name} +${item.level}</div>
        <div style="font-size:0.68rem; color:#ced6e0; margin:2px 0 6px 0;">${item.rarityName} • ${formatGearStat(item)}</div>
        <div style="display:flex; gap:5px;">
          <button class="eq-gear-btn" data-uid="${item.uid}" style="flex:1; padding:4px; border:none; border-radius:5px; background:#2ed573; color:#07080c; font-weight:900; font-size:0.68rem; cursor:pointer;">Equip</button>
          <button class="salv-gear-btn" data-uid="${item.uid}" style="flex:1; padding:4px; border:none; border-radius:5px; background:#ff4757; color:#fff; font-weight:800; font-size:0.68rem; cursor:pointer;">Salvage (+10 🔩)</button>
        </div>
      </div>
    `).join('');
  }

  // Bind buttons
  eqGrid.querySelectorAll('.upg-gear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = gearState.inventory.find(i => i.uid === btn.dataset.uid);
      if (!item) return;
      const cost = item.level * 15;
      if (gearState.scrap >= cost) {
        gearState.scrap -= cost;
        item.level++;
        saveGearData();
        if (typeof sfx !== 'undefined') sfx.powerup();
        renderGearModal();
      }
    });
  });

  eqGrid.querySelectorAll('.uneq-gear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gearState.equipped[btn.dataset.slot] = null;
      saveGearData();
      renderGearModal();
    });
  });

  bagGrid.querySelectorAll('.eq-gear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = gearState.inventory.find(i => i.uid === btn.dataset.uid);
      if (!item) return;
      gearState.equipped[item.slot] = item.uid;
      saveGearData();
      renderGearModal();
    });
  });

  bagGrid.querySelectorAll('.salv-gear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gearState.inventory = gearState.inventory.filter(i => i.uid !== btn.dataset.uid);
      gearState.scrap += 10;
      saveGearData();
      if (typeof sfx !== 'undefined') sfx.armorHit();
      renderGearModal();
    });
  });
}

// --- Drop RPG Gear on Monster / Boss Defeat ---
const _gearOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  const isBoss = monster.type === 'boss';
  _gearOrigDefeat(monster, clickX, clickY);

  if (!isGameRunning) return;
  const dropChance = isBoss ? 0.55 : 0.035; // 55% from Bosses, 3.5% from normal monsters

  if (Math.random() < dropChance) {
    if (gearState.inventory.length >= 24) {
      // Auto-salvage if bag is full!
      gearState.scrap += 12;
      saveGearData();
      spawnFloatingText(clickX, clickY - 22, '🔩 +12 Scrap (Bag Full)', '#00d2d3');
    } else {
      const drop = generateRandomGear(isBoss && Math.random() < 0.35 ? 'epic' : null);
      gearState.inventory.push(drop);
      saveGearData();
      spawnFloatingText(clickX, clickY - 24, `${drop.icon} DROP: ${drop.rarityName} ${drop.name}!`, drop.color);
    }
  }
};

// --- Apply Equipped Gear Stat Bonuses ---
const _gearOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  const totals = getEquippedGearTotals();

  if (totals.bonusDmg > 0 && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - totals.bonusDmg);
  }
  if (monster.type === 'boss' && totals.bossDmg > 0 && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - totals.bossDmg);
  }
  if (totals.critPct > 0 && Math.random() * 100 < totals.critPct && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 3);
    spawnFloatingText(clickX, clickY - 16, '💍 GEAR CRIT!', '#ffd32a');
  }

  _gearOrigClick(monster, clickX, clickY);
};

if (typeof addCoinsAndXP === 'function') {
  const _gearOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    const totals = getEquippedGearTotals();
    const mult = 1 + (totals.coinPct / 100);
    _gearOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}
