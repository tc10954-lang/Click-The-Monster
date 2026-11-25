// === START CHUNK 1 OF 2: monster_tcg.js ===
// --- 🃏 Monster Trading Card (TCG) Booster Packs & 3-Card Active Battle Deck ---
const tcgState = Object.assign({
  owned: ['card_slime'],
  deck: ['card_slime'], // max 3 equipped cards
  packsOpened: 0
}, JSON.parse(localStorage.getItem('monster_tcg_v1') || '{}'));

function saveTcgState() {
  localStorage.setItem('monster_tcg_v1', JSON.stringify(tcgState));
}

const TCG_CATALOG = [
  { id: 'card_slime',   icon: '🟢', name: 'Forest Slime',        rarity: 'Common',      color: '#dfe4ea', power: '+2 Base Click DMG on every shot' },
  { id: 'card_goblin',  icon: '👺', name: 'Coin Goblin',         rarity: 'Common',      color: '#dfe4ea', power: '+15% Coin Drops from all monsters' },
  { id: 'card_bat',     icon: '🦇', name: 'Glitch Vampire Bat',  rarity: 'Rare',        color: '#54a0ff', power: '12% chance on hit to deal +12 Bonus DMG' },
  { id: 'card_wraith',  icon: '❄️', name: 'Frostbite Wraith',    rarity: 'Rare',        color: '#54a0ff', power: 'Slows newly clicked monsters by 25%' },
  { id: 'card_warlord', icon: '🔥', name: 'Ashlands Warlord',    rarity: 'Epic',        color: '#a55eea', power: '+20 Bonus DMG against Overlord Bosses' },
  { id: 'card_harv',    icon: '👁️', name: 'The Pale Harvester',  rarity: 'Legendary',   color: '#ffd32a', power: '+35% Coins & +10 Click DMG simultaneously' },
  { id: 'card_well',    icon: '🕳️', name: 'Bottomless Well',     rarity: 'Legendary',   color: '#ffd32a', power: '20% chance on hit to unleash a +35 Void Zap' },
  { id: 'card_arch',    icon: '👹', name: 'ENTITY 00: ARCHITECT',rarity: 'HOLO-MYTHIC', color: '#ff4757', power: '+25 Click DMG, +40 Boss DMG & +50% Coins!' }
];

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🃏 Monster Cards" button to Start Menu
  const tcgBtn = document.createElement('button');
  tcgBtn.className = 'action-btn';
  tcgBtn.innerHTML = '🃏 Monster Cards';
  tcgBtn.style.cssText = 'background: linear-gradient(135deg, #f368e0, #ff9ff3); color: #07080c;';
  tcgBtn.addEventListener('click', () => {
    renderTcgModal();
    document.getElementById('monster-tcg-modal').style.display = 'flex';
  });

  const extrasGrid = document.getElementById('menu-extras-grid');
  const startCard = document.querySelector('#start-screen .card');
  if (extrasGrid) extrasGrid.appendChild(tcgBtn);
  else if (startCard) startCard.appendChild(tcgBtn);

  // 2. Build Compact Viewport-Locked TCG Modal
  const modal = document.createElement('div');
  modal.id = 'monster-tcg-modal';
  modal.className = 'screen-overlay';
  modal.style.cssText = 'display: none; z-index: 168;';
  modal.innerHTML = `
    <div class="card" style="max-width: 620px; width: 94vw; max-height: 86vh; display: flex; flex-direction: column; padding: 15px; text-align: left; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-shrink: 0;">
        <h2 style="color: #ff9ff3; margin: 0; font-size: 1.5rem;">🃏 Monster Trading Cards</h2>
        <button id="tcg-buy-pack-btn" style="padding: 6px 12px; border: none; border-radius: 8px; background: linear-gradient(135deg, #ffd32a, #ff9f43); color: #07080c; font-weight: 900; font-size: 0.78rem; cursor: pointer;">
          🎴 Rip Booster Pack (4,000 🪙)
        </button>
      </div>

      <div id="tcg-pack-banner" style="background: rgba(255,159,243,0.12); border: 1px solid #ff9ff3; border-radius: 8px; padding: 6px 10px; font-size: 0.75rem; font-weight: 900; color: #ff9ff3; margin-bottom: 8px; flex-shrink: 0;">
        Equip up to 3 Monster Cards in your Active Battle Deck!
      </div>

      <div style="font-size: 0.72rem; font-weight: 900; color: #00d2d3; margin-bottom: 4px; flex-shrink: 0;">
        ACTIVE BATTLE DECK (<span id="tcg-deck-count">1</span>/3 EQUIPPED)
      </div>
      <div id="tcg-deck-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; flex-shrink: 0;"></div>

      <div style="font-size: 0.72rem; font-weight: 900; color: #a4b0be; margin-bottom: 5px; flex-shrink: 0;">
        CARD BINDER (<span id="tcg-owned-count">1</span>/${TCG_CATALOG.length} COLLECTED)
      </div>
      <div id="tcg-binder-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; flex: 1; min-height: 110px; overflow-y: auto; margin-bottom: 10px;"></div>

      <button id="close-tcg-btn" class="action-btn" style="padding: 9px; background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff; flex-shrink: 0;">
        Close Binder
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-tcg-btn').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  document.getElementById('tcg-buy-pack-btn').addEventListener('click', ripBoosterPack);
});
// === END CHUNK 1 OF 2 ===
// === START CHUNK 2 OF 2: monster_tcg.js ===
function ripBoosterPack() {
  if (typeof shopState === 'undefined' || shopState.coins < 4000) {
    alert('❌ Need 4,000 🪙 to rip a Monster Booster Pack!');
    return;
  }

  shopState.coins -= 4000;
  if (typeof saveShopData === 'function') saveShopData();
  tcgState.packsOpened++;

  // Weighted gacha pull
  const roll = Math.random() * 100;
  let pulled = TCG_CATALOG.at(0);
  if (roll < 3)       pulled = TCG_CATALOG.at(7); // 3% Holo-Mythic Entity 00
  else if (roll < 12) pulled = TCG_CATALOG.at(Math.random() < 0.5 ? 5 : 6); // 9% Legendary
  else if (roll < 28) pulled = TCG_CATALOG.at(4); // 16% Epic Warlord
  else if (roll < 58) pulled = TCG_CATALOG.at(Math.random() < 0.5 ? 2 : 3); // 30% Rare
  else                pulled = TCG_CATALOG.at(Math.random() < 0.5 ? 0 : 1); // 42% Common

  const isNew = !tcgState.owned.includes(pulled.id);
  if (isNew) {
    tcgState.owned.push(pulled.id);
  } else {
    // Duplicate card converts into +40 Gear Scrap!
    if (typeof gearState !== 'undefined') {
      gearState.scrap += 40;
      if (typeof saveGearData === 'function') saveGearData();
    }
  }
  saveTcgState();
  if (typeof sfx !== 'undefined') sfx.powerup();

  const banner = document.getElementById('tcg-pack-banner');
  if (banner) {
    banner.style.borderColor = pulled.color;
    banner.style.color = pulled.color;
    banner.textContent = isNew
      ? `🎉 NEW PULL! [${pulled.rarity}] ${pulled.icon} ${pulled.name} unlocked!`
      : `♻️ DUPLICATE [${pulled.rarity}] ${pulled.name} converted into +40 🔩 Scrap!`;
  }
  renderTcgModal();
}

function renderTcgModal() {
  document.getElementById('tcg-deck-count').textContent = tcgState.deck.length;
  document.getElementById('tcg-owned-count').textContent = tcgState.owned.length;

  const deckGrid = document.getElementById('tcg-deck-grid');
  if (deckGrid) {
    deckGrid.innerHTML = [0, 1, 2].map(slotIdx => {
      const cardId = tcgState.deck[slotIdx];
      const card = cardId ? TCG_CATALOG.find(c => c.id === cardId) : null;
      if (!card) {
        return `<div style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.2); border-radius:9px; padding:8px; text-align:center; color:#747d8c; font-size:0.7rem;">Empty Slot</div>`;
      }
      return `
        <div class="tcg-unequip-slot" data-id="${card.id}" style="background:rgba(255,255,255,0.07); border:1.5px solid ${card.color}; border-radius:9px; padding:7px; text-align:center; cursor:pointer;">
          <div style="font-size:1.4rem;">${card.icon}</div>
          <div style="font-weight:900; font-size:0.72rem; color:${card.color};">${card.name}</div>
          <div style="font-size:0.62rem; color:#ff6b81; margin-top:2px;">[Click to Remove]</div>
        </div>
      `;
    }).join('');

    deckGrid.querySelectorAll('.tcg-unequip-slot').forEach(el => {
      el.addEventListener('click', () => {
        tcgState.deck = tcgState.deck.filter(id => id !== el.dataset.id);
        saveTcgState();
        renderTcgModal();
      });
    });
  }

  const binderGrid = document.getElementById('tcg-binder-grid');
  if (binderGrid) {
    binderGrid.innerHTML = TCG_CATALOG.map(card => {
      const unlocked = tcgState.owned.includes(card.id);
      const equipped = tcgState.deck.includes(card.id);

      if (!unlocked) {
        return `
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:9px; padding:8px; opacity:0.5;">
            <div style="font-weight:900; font-size:0.78rem; color:#747d8c;">❓ Locked (${card.rarity})</div>
            <div style="font-size:0.66rem; color:#57606f;">Open Booster Packs to discover!</div>
          </div>
        `;
      }

      return `
        <div class="tcg-binder-item" data-id="${card.id}" style="
          background: ${equipped ? 'rgba(0,210,211,0.14)' : 'rgba(255,255,255,0.04)'};
          border: 1.5px solid ${equipped ? '#00d2d3' : card.color};
          border-radius: 9px; padding: 7px 9px; cursor: pointer;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:900; font-size:0.78rem; color:${card.color};">${card.icon} ${card.name}</span>
            <span style="font-size:0.58rem; font-weight:900; padding:1px 4px; border-radius:4px; background:${card.color}; color:#07080c;">${card.rarity}</span>
          </div>
          <div style="font-size:0.66rem; color:#ced6e0; margin:3px 0;">${card.power}</div>
          <div style="font-size:0.65rem; font-weight:900; color:${equipped ? '#00d2d3' : '#2ed573'};">
            ${equipped ? '✅ IN ACTIVE DECK' : '+ Click to Equip'}
          </div>
        </div>
      `;
    }).join('');

    binderGrid.querySelectorAll('.tcg-binder-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        if (tcgState.deck.includes(id)) {
          tcgState.deck = tcgState.deck.filter(x => x !== id);
        } else if (tcgState.deck.length < 3) {
          tcgState.deck.push(id);
        } else {
          alert('Deck is full (3/3)! Click a card in your Active Deck above to swap it out.');
          return;
        }
        saveTcgState();
        if (typeof sfx !== 'undefined') sfx.hit();
        renderTcgModal();
      });
    });
  }
}

// --- Live Passive Card Deck Abilities During Hunts ---
function hasTcgCard(id) {
  return tcgState.deck.includes(id);
}

const _tcgOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  if (monster && monster.hp > 1) {
    let extraDmg = 0;
    if (hasTcgCard('card_slime')) extraDmg += 2;
    if (hasTcgCard('card_harv'))  extraDmg += 10;
    if (hasTcgCard('card_arch'))  extraDmg += 25;
    if (monster.type === 'boss') {
      if (hasTcgCard('card_warlord')) extraDmg += 20;
      if (hasTcgCard('card_arch'))    extraDmg += 40;
    }
    if (hasTcgCard('card_bat') && Math.random() < 0.12) extraDmg += 12;
    if (hasTcgCard('card_well') && Math.random() < 0.20) {
      extraDmg += 35;
      if (typeof spawnFloatingText === 'function') {
        spawnFloatingText(clickX, clickY - 22, '🕳️ VOID ZAP!', '#ffd32a');
      }
    }
    if (hasTcgCard('card_wraith') && !monster.tcgChilled) {
      monster.tcgChilled = true;
      monster.vx *= 0.75;
      monster.vy *= 0.75;
    }
    if (extraDmg > 0) {
      monster.hp = Math.max(1, monster.hp - extraDmg);
    }
  }
  _tcgOrigClick(monster, clickX, clickY);
};

if (typeof addCoinsAndXP === 'function') {
  const _tcgOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    let mult = 1;
    if (hasTcgCard('card_goblin')) mult += 0.15;
    if (hasTcgCard('card_harv'))   mult += 0.35;
    if (hasTcgCard('card_arch'))   mult += 0.50;
    _tcgOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}
// === END CHUNK 2 OF 2 ===
