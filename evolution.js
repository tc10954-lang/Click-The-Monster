// --- 10-Pet Roster & Pet Evolution Lab (Awakened Cosmic Forms) ---
const evolvedPets = JSON.parse(localStorage.getItem('monster_evolved_pets')) || [];

const EXTRA_PETS = [
  { id: 'wolf',    icon: '🐺', name: 'Shadow Wolf',    rarity: 'Common',    color: '#a4b0be', fireMs: 1650, dmg: 1 },
  { id: 'bot',     icon: '🤖', name: 'Cyber Drone',    rarity: 'Common',    color: '#70a1ff', fireMs: 1550, dmg: 1 },
  { id: 'bat',     icon: '🦇', name: 'Vampire Bat',    rarity: 'Rare',      color: '#ff6b81', fireMs: 1250, dmg: 2 },
  { id: 'dino',    icon: '🦖', name: 'Mini Rex',       rarity: 'Epic',      color: '#2ed573', fireMs: 1000, dmg: 3 },
  { id: 'unicorn', icon: '🦄', name: 'Astral Unicorn', rarity: 'Legendary', color: '#ff9ff3', fireMs: 750,  dmg: 4 },
  { id: 'kraken',  icon: '🐙', name: 'Void Kraken',    rarity: 'Mythic',    color: '#5f27cd', fireMs: 550,  dmg: 5 }
];

const EVOLUTION_DATA = {
  imp:     { evoIcon: '👹', evoName: 'Hellfire Demon',    cost: 12000,  newFireMs: 900, dmg: 2, glow: '#ff4757' },
  wolf:    { evoIcon: '🐺', evoName: 'Fenrir Prime',      cost: 14000,  newFireMs: 850, dmg: 2, glow: '#dfe4ea' },
  bot:     { evoIcon: '🦾', name: 'Omega Mecha',       cost: 16000,  newFireMs: 800, dmg: 3, glow: '#1e90ff' },
  storm:   { evoIcon: '🌩️', evoName: 'Tempest Leviathan', cost: 22000,  newFireMs: 650, dmg: 3, glow: '#00d2d3' },
  bat:     { evoIcon: '🧛', evoName: 'Crimson Nosferatu', cost: 26000,  newFireMs: 620, dmg: 4, glow: '#ff4757' },
  dragon:  { evoIcon: '🌌', evoName: 'Galactic Wyrm',     cost: 40000,  newFireMs: 480, dmg: 5, glow: '#a55eea' },
  dino:    { evoIcon: '🐉', evoName: 'Apex Tyrant',       cost: 48000,  newFireMs: 460, dmg: 6, glow: '#2ed573' },
  phoenix: { evoIcon: '☀️', evoName: 'Celestial Sunbird', cost: 75000,  newFireMs: 340, dmg: 7, glow: '#ffd32a' },
  unicorn: { evoIcon: '🌠', evoName: 'Nebula Pegasus',    cost: 90000,  newFireMs: 320, dmg: 8, glow: '#ff9ff3' },
  kraken:  { evoIcon: '👾', evoName: 'Eldritch Abyss',    cost: 150000, newFireMs: 250, dmg: 10, glow: '#be2edd' }
};

function saveEvolutions() {
  localStorage.setItem('monster_evolved_pets', JSON.stringify(evolvedPets));
}

function isPetEvolved(petId) {
  return evolvedPets.includes(petId);
}

function registerExpandedPets() {
  if (typeof PET_CATALOG === 'undefined') return;

  // Add the 6 new pets into PET_CATALOG if not already present
  EXTRA_PETS.forEach(ep => {
    if (!PET_CATALOG.some(p => p.id === ep.id)) {
      PET_CATALOG.push({ ...ep });
    }
  });

  // Update Crate Drop Weights across all 10 pets
  if (typeof CRATE_TIERS !== 'undefined') {
    const bronze = CRATE_TIERS.find(c => c.id === 'bronze');
    const gold   = CRATE_TIERS.find(c => c.id === 'gold');
    const mythic = CRATE_TIERS.find(c => c.id === 'mythic');

    // Order matches PET_CATALOG: imp, storm, dragon, phoenix, wolf, bot, bat, dino, unicorn, kraken
    if (bronze) bronze.weights = new Array(24, 8, 2, 1, 28, 26, 8, 2, 1, 0);
    if (gold)   gold.weights   = new Array(10, 16, 10, 4, 12, 12, 18, 12, 4, 2);
    if (mythic) mythic.weights = new Array(2, 8, 16, 15, 2, 3, 10, 16, 16, 12);
  }

  // Apply saved Awakened stats & icons
  PET_CATALOG.forEach(pet => {
    const evo = EVOLUTION_DATA[pet.id];
    if (evo && isPetEvolved(pet.id)) {
      pet.icon = evo.evoIcon;
      pet.name = evo.evoName;
      pet.fireMs = evo.newFireMs;
      pet.dmg = evo.dmg;
      pet.color = evo.glow;
      pet.rarity = '🌟 AWAKENED';
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  registerExpandedPets();

  // Make the Battle Pets grid 5 columns so all 10 pets fit cleanly in 2 rows
  const petsRow = document.getElementById('vault-pets-row');
  if (petsRow) {
    petsRow.style.gridTemplateColumns = 'repeat(5, 1fr)';
  }

  // Inject Evolution Lab section inside the Endgame Vault Modal
  const vaultCard = document.querySelector('#vault-modal .card');
  const closeVaultBtn = document.getElementById('close-vault-btn');

  if (vaultCard && closeVaultBtn) {
    const evoHeader = document.createElement('div');
    evoHeader.style.cssText = 'font-size:0.78rem; font-weight:900; color:#ff9ff3; text-align:left; margin-bottom:6px;';
    evoHeader.textContent = '🧬 PET EVOLUTION LAB (AWAKEN ALL 10 PETS)';

    const evoRow = document.createElement('div');
    evoRow.id = 'vault-evo-row';
    evoRow.style.cssText = 'display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-bottom:16px; text-align:left;';

    vaultCard.insertBefore(evoHeader, closeVaultBtn);
    vaultCard.insertBefore(evoRow, closeVaultBtn);
  }
});

// Hook renderVaultModal so all 10 pets & evolutions update live
if (typeof renderVaultModal === 'function') {
  const _evoOrigRenderVault = renderVaultModal;
  renderVaultModal = function() {
    registerExpandedPets();
    _evoOrigRenderVault();

    const petsRow = document.getElementById('vault-pets-row');
    if (petsRow) petsRow.style.gridTemplateColumns = 'repeat(5, 1fr)';

    const evoRow = document.getElementById('vault-evo-row');
    if (!evoRow || typeof PET_CATALOG === 'undefined') return;

    const playerCoins = typeof shopState !== 'undefined' ? shopState.coins : 0;

    evoRow.innerHTML = PET_CATALOG.map(pet => {
      const evo = EVOLUTION_DATA[pet.id];
      if (!evo) return '';
      const owned = typeof endgameState !== 'undefined' && endgameState.petsOwned.includes(pet.id);
      const awakened = isPetEvolved(pet.id);
      const canAfford = owned && !awakened && playerCoins >= evo.cost;

      return `
        <div style="
          background: ${awakened ? 'rgba(255, 159, 243, 0.16)' : 'rgba(255, 255, 255, 0.04)'};
          border: 1px solid ${awakened ? '#ff9ff3' : 'rgba(255, 255, 255, 0.12)'};
          border-radius: 10px; padding: 9px; opacity: ${owned ? '1' : '0.45'};
        ">
          <div style="font-weight: 900; font-size: 0.82rem; color: #fff;">
            ${awakened ? `${evo.evoIcon} ${evo.evoName}` : `${pet.icon} ➡️ ${evo.evoIcon} ${evo.evoName}`}
          </div>
          <div style="font-size: 0.68rem; color: #a4b0be; margin: 3px 0 7px 0;">
            ${awakened ? `🌟 Awakened (${evo.dmg}x DMG • ${(1000 / evo.newFireMs).toFixed(1)}/s)` : `Boosts to ${evo.dmg}x DMG & 2x Fire Speed`}
          </div>
          <button class="evolve-pet-btn" data-id="${pet.id}" ${canAfford ? '' : 'disabled'} style="
            width: 100%; padding: 6px; border: none; border-radius: 6px; font-weight: 900; font-size: 0.72rem;
            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
            background: ${awakened ? '#2ed573' : (canAfford ? 'linear-gradient(135deg, #ff9ff3, #a55eea)' : 'rgba(255,255,255,0.08)')};
            color: ${awakened || canAfford ? '#07080c' : '#747d8c'};
          ">
            ${awakened ? '🌟 AWAKENED' : (!owned ? 'Unlock Pet First' : `Awaken (${evo.cost.toLocaleString()} 🪙)`)}
          </button>
        </div>
      `;
    }).join('');

    evoRow.querySelectorAll('.evolve-pet-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const evo = EVOLUTION_DATA[id];
        if (!evo || isPetEvolved(id)) return;
        if (typeof shopState !== 'undefined' && shopState.coins >= evo.cost) {
          shopState.coins -= evo.cost;
          saveShopData();
          evolvedPets.push(id);
          saveEvolutions();
          registerExpandedPets();
          if (typeof sfx !== 'undefined') sfx.victory();
          triggerScreenShake();
          renderVaultModal();
        }
      });
    });
  };
}
