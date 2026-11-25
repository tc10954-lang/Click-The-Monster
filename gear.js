// --- Revamped RPG Gear Drops, Smart Rarity Sorting, Auto-Equip Best & Upgrade Forge ---
const gearState = {
  inventory: JSON.parse(localStorage.getItem('monster_rpg_gear_inv')) || [],
  equipped: JSON.parse(localStorage.getItem('monster_rpg_gear_eq')) || {
    helm: null,
    gloves: null,
    ring: null,
    amulet: null
  },
  scrap: parseInt(localStorage.getItem('monster_rpg_scrap')) || 0,
  sortBy: 'rarity'
};

const MAX_GEAR_BAG = 36;

const GEAR_SLOTS = [
  { id: 'helm',   icon: '🪖', label: 'Helm' },
  { id: 'gloves', icon: '🧤', label: 'Gauntlets' },
  { id: 'ring',   icon: '💍', label: 'Ring' },
  { id: 'amulet', icon: '📿', label: 'Amulet' }
];

const GEAR_RARITIES = [
  { id: 'common',    rank: 1, name: 'Common',    color: '#dfe4ea', scrapVal: 10,  mult: 1.0, weight: 48 },
  { id: 'rare',      rank: 2, name: 'Rare',      color: '#54a0ff', scrapVal: 18,  mult: 1.6, weight: 28 },
  { id: 'epic',      rank: 3, name: 'Epic',      color: '#a55eea', scrapVal: 32,  mult: 2.4, weight: 14 },
  { id: 'legendary', rank: 4, name: 'Legendary', color: '#ffd32a', scrapVal: 60,  mult: 3.5, weight: 7 },
  { id: 'mythic',    rank: 5, name: 'Mythic',    color: '#ff4757', scrapVal: 110, mult: 5.0, weight: 3 }
];

const GEAR_PREFIXES = ['Vanguard', 'Abyssal', 'Solar', 'Phantom', 'Dragonscale', 'Stormforged', 'Voidwalker'];

function saveGearData() {
  localStorage.setItem('monster_rpg_gear_inv', JSON.stringify(gearState.inventory));
  localStorage.setItem('monster_rpg_gear_eq', JSON.stringify(gearState.equipped));
  localStorage.setItem('monster_rpg_scrap', gearState.scrap.toString());
}

function getRarityRank(rarityId) {
  const r = GEAR_RARITIES.find(item => item.id === rarityId);
  return r ? r.rank : 1;
}

function getScrapYield(rarityId) {
  const r = GEAR_RARITIES.find(item => item.id === rarityId);
  return r ? r.scrapVal : 10;
}

function getGearPowerScore(item) {
  if (!item) return -1;
  const rank = getRarityRank(item.rarity);
  const scaledStat = Math.round(item.statVal * (1 + (item.level - 1) * 0.35));
  return (rank * 10000) + (item.level * 250) + scaledStat;
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

function equipBestGearSet() {
  GEAR_SLOTS.forEach(slot => {
    const candidates = gearState.inventory
      .filter(i => i.slot === slot.id)
      .sort((a, b) => getGearPowerScore(b) - getGearPowerScore(a));

    if (candidates.length > 0) {
      gearState.equipped[slot.id] = candidates.at(0).uid;
    }
  });
  saveGearData();
  if (typeof sfx !== 'undefined') sfx.powerup();
  renderGearModal();
}
window.addEventListener('DOMContentLoaded', () => {
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

  const modal = document.createElement('div');
  modal.id = 'gear-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '148';
  modal.innerHTML = `
    <div class="card" style="max-width: 620px; width: 94vw; max-height: 85vh; display: flex; flex-direction: column; padding: 14px 16px; text-align: left; overflow: hidden;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-shrink:0;">
        <h2 style="color: #70a1ff; margin: 0; font-size: 1.45rem;">🎒 RPG Gear & Forge</h2>
        <div style="background:rgba(0,210,211,0.15); border:1px solid #00d2d3; padding:3px 10px; border-radius:50px; font-size: 0.85rem; font-weight: 900; color: #00d2d3;">
          🔩 Scrap: <span id="gear-scrap-bal">0</span>
        </div>
      </div>

      <div id="gear-totals-bar" style="background:rgba(46,213,115,0.1); border:1px solid rgba(46,213,115,0.35); border-radius:8px; padding:5px 10px; font-size:0.72rem; font-weight:900; color:#2ed573; margin-bottom:8px; flex-shrink:0;"></div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-shrink:0;">
        <span style="font-size:0.72rem; font-weight:900; color:#a4b0be;">EQUIPPED LOADOUT (4 SLOTS)</span>
        <button id="gear-equip-best-btn" style="padding:4px 10px; border:none; border-radius:6px; background:linear-gradient(135deg, #2ed573, #1dd1a1); color:#07080c; font-weight:900; font-size:0.72rem; cursor:pointer;">
          ⚡ Equip Best Gear
        </button>
      </div>
      <div id="gear-equipped-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; margin-bottom:8px; flex-shrink:0;"></div>

      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:5px; margin-bottom:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.1); flex-shrink:0;">
        <span style="font-size:0.72rem; font-weight:900; color:#a4b0be;">
          BAG (<span id="gear-bag-count">0</span>/${MAX_GEAR_BAG})
        </span>
        <div style="display:flex; flex-wrap:wrap; gap:5px; align-items:center;">
          <select id="gear-sort-select" style="background:#141824; color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:3px 6px; font-weight:800; font-size:0.68rem; cursor:pointer;">
            <option value="rarity">Sort: Rarest ↓</option>
            <option value="level">Sort: Level ↓</option>
            <option value="slot">Sort: Slot</option>
          </select>
          <button id="gear-salvage-all-btn" style="padding:3px 8px; border:1px solid #ff4757; border-radius:6px; background:rgba(255,71,87,0.18); color:#ff6b81; font-weight:900; font-size:0.68rem; cursor:pointer;">
            🔩 Salvage Extra
          </button>
          <button id="gear-forge-chest-btn" style="padding:4px 8px; border:none; border-radius:6px; background:#ffd32a; color:#07080c; font-weight:900; font-size:0.68rem; cursor:pointer;">
            ⚒️ Craft (1,500 🪙)
          </button>
        </div>
      </div>

      <div id="gear-bag-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; flex:1; min-height:110px; overflow-y:auto; padding-right:2px; margin-bottom:10px;"></div>

      <button class="action-btn" id="close-gear-btn" style="background:linear-gradient(135deg, #ff4757, #ff6b81); color:#fff; padding:9px; flex-shrink:0;">Close Inventory</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-gear-btn').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('gear-equip-best-btn').addEventListener('click', equipBestGearSet);

  document.getElementById('gear-sort-select').addEventListener('change', (e) => {
    gearState.sortBy = e.target.value;
    renderGearModal();
  });

  document.getElementById('gear-salvage-all-btn').addEventListener('click', () => {
    const equippedUids = Object.values(gearState.equipped).filter(Boolean);
    const toSalvage = gearState.inventory.filter(i => !equippedUids.includes(i.uid));
    if (toSalvage.length === 0) return;

    const totalScrap = toSalvage.reduce((sum, item) => sum + getScrapYield(item.rarity), 0);
    gearState.inventory = gearState.inventory.filter(i => equippedUids.includes(i.uid));
    gearState.scrap += totalScrap;
    saveGearData();
    if (typeof sfx !== 'undefined') sfx.armorHit();
    renderGearModal();
  });

  document.getElementById('gear-forge-chest-btn').addEventListener('click', () => {
    if (typeof shopState !== 'undefined' && shopState.coins >= 1500 && gearState.inventory.length < MAX_GEAR_BAG) {
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
        <div style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.18); border-radius:9px; padding:7px 9px; color:#747d8c; font-size:0.73rem;">
          ${slot.icon} Empty ${slot.label} Slot
        </div>
      `;
    }

    const upgCost = item.level * 15;
    const canUpg = gearState.scrap >= upgCost;

    return `
      <div style="background:linear-gradient(135deg, rgba(255,255,255,0.07), rgba(0,0,0,0.25)); border:1.5px solid ${item.color}; border-radius:9px; padding:7px 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:4px;">
          <span style="font-weight:900; font-size:0.76rem; color:${item.color};">${item.icon} ${item.name} +${item.level}</span>
          <span style="font-size:0.6rem; font-weight:900; padding:1px 5px; border-radius:4px; background:${item.color}; color:#07080c; text-transform:uppercase;">${item.rarityName}</span>
        </div>
        <div style="font-size:0.68rem; color:#2ed573; margin:2px 0 5px 0;">${formatGearStat(item)}</div>
        <div style="display:flex; gap:4px;">
          <button class="upg-gear-btn" data-uid="${item.uid}" ${canUpg ? '' : 'disabled'} style="
            flex:2; padding:3px; border:none; border-radius:5px; font-weight:800; font-size:0.66rem;
            background:${canUpg ? '#00d2d3' : 'rgba(255,255,255,0.1)'}; color:${canUpg ? '#07080c' : '#747d8c'}; cursor:${canUpg ? 'pointer' : 'not-allowed'};
          ">Upgrade (${upgCost} 🔩)</button>
          <button class="uneq-gear-btn" data-slot="${slot.id}" style="
            flex:1; padding:3px; border:none; border-radius:5px; font-weight:800; font-size:0.66rem; background:rgba(255,255,255,0.12); color:#fff; cursor:pointer;
          ">Unequip</button>
        </div>
      </div>
    `;
  }).join('');

  // 2. Sort & Render Unequipped Bag Items (Rarest -> Common by default!)
  const bagGrid = document.getElementById('gear-bag-grid');
  const equippedUids = Object.values(gearState.equipped).filter(Boolean);
  const unequipped = gearState.inventory
    .filter(i => !equippedUids.includes(i.uid))
    .sort((a, b) => {
      if (gearState.sortBy === 'level') {
        return (b.level - a.level) || (getGearPowerScore(b) - getGearPowerScore(a));
      }
      if (gearState.sortBy === 'slot') {
        return a.slot.localeCompare(b.slot) || (getGearPowerScore(b) - getGearPowerScore(a));
      }
      return getGearPowerScore(b) - getGearPowerScore(a);
    });

  if (unequipped.length === 0) {
    bagGrid.innerHTML = `<div style="grid-column:1/-1; color:#747d8c; font-size:0.74rem; padding:12px; text-align:center;">Bag is empty — defeat monsters or craft gear!</div>`;
  } else {
    bagGrid.innerHTML = unequipped.map(item => {
      const scrapAmt = getScrapYield(item.rarity);
      return `
        <div style="background:rgba(255,255,255,0.04); border:1px solid ${item.color}; border-radius:8px; padding:7px 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:4px;">
            <span style="font-weight:900; font-size:0.75rem; color:${item.color};">${item.icon} ${item.name} +${item.level}</span>
            <span style="font-size:0.58rem; font-weight:900; padding:1px 4px; border-radius:4px; background:${item.color}; color:#07080c; text-transform:uppercase;">${item.rarityName}</span>
          </div>
          <div style="font-size:0.66rem; color:#ced6e0; margin:2px 0 5px 0;">${formatGearStat(item)}</div>
          <div style="display:flex; gap:4px;">
            <button class="eq-gear-btn" data-uid="${item.uid}" style="flex:1; padding:3px; border:none; border-radius:5px; background:#2ed573; color:#07080c; font-weight:900; font-size:0.66rem; cursor:pointer;">Equip</button>
            <button class="salv-gear-btn" data-uid="${item.uid}" style="flex:1; padding:3px; border:none; border-radius:5px; background:#ff4757; color:#fff; font-weight:800; font-size:0.66rem; cursor:pointer;">Salvage (+${scrapAmt} 🔩)</button>
          </div>
        </div>
      `;
    }).join('');
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
      const target = gearState.inventory.find(i => i.uid === btn.dataset.uid);
      const scrapAmt = target ? getScrapYield(target.rarity) : 10;
      gearState.inventory = gearState.inventory.filter(i => i.uid !== btn.dataset.uid);
      gearState.scrap += scrapAmt;
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
  const dropChance = isBoss ? 0.55 : 0.035;

  if (Math.random() < dropChance) {
    if (gearState.inventory.length >= MAX_GEAR_BAG) {
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
