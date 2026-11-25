// --- 34 Additional Endgame, Mastery & Secret Achievements ---
const EXTRA_ACHIEVEMENTS = [
  // Slayer Tiers
  { id: 'kills_100',      icon: '⚔️',  name: 'Centurion',            desc: 'Slay 100 monsters total',                 reward: 250 },
  { id: 'kills_500',      icon: '🗡️',  name: 'Monster Butcher',      desc: 'Slay 500 monsters total',                 reward: 750 },
  { id: 'kills_2500',     icon: '💀',  name: 'Extinction Event',     desc: 'Slay 2,500 monsters total',               reward: 2500 },
  { id: 'kills_10000',    icon: '☠️',  name: 'Harbinger of Doom',    desc: 'Slay 10,000 monsters total',              reward: 10000 },
  { id: 'kills_50000',    icon: '🌋',  name: 'Apocalypse Incarnate', desc: 'Slay 50,000 monsters total',              reward: 35000 },

  // Combo & Reflex Mastery
  { id: 'combo_50',       icon: '🔥',  name: 'Untouchable',          desc: 'Reach a x50 combo streak',                reward: 600 },
  { id: 'combo_100',      icon: '⚡',  name: 'Godlike Reflexes',     desc: 'Reach a x100 combo streak',               reward: 2000 },
  { id: 'combo_175',      icon: '☄️',  name: 'Hyper-Focus',          desc: 'Reach a x175 combo streak',               reward: 6000 },
  { id: 'combo_250',      icon: '🌌',  name: 'Ultra Instinct',       desc: 'Reach a x250 combo streak',               reward: 15000 },

  // Overlord Boss Executioner Tiers
  { id: 'boss_5',         icon: '👹',  name: 'Regicide',             desc: 'Defeat 5 Overlord Bosses',                reward: 500 },
  { id: 'boss_25',        icon: '👑',  name: 'King of Monsters',     desc: 'Defeat 25 Overlord Bosses',               reward: 2000 },
  { id: 'boss_50',        icon: '🔱',  name: 'Titan Bane',           desc: 'Defeat 50 Overlord Bosses',               reward: 8000 },
  { id: 'boss_100',       icon: '🐲',  name: 'Overlord Executioner', desc: 'Defeat 100 Overlord Bosses',              reward: 25000 },

  // Endless Waves & Boss Rush
  { id: 'wave_5',         icon: '🌊',  name: 'Wave Surfer',          desc: 'Reach Wave 5 in Endless Mode',            reward: 400 },
  { id: 'wave_15',        icon: '🌀',  name: 'Tsunami Survivor',     desc: 'Reach Wave 15 in Endless Mode',           reward: 1500 },
  { id: 'wave_25',        icon: '🔱',  name: 'Abyssal Legend',       desc: 'Reach Wave 25 in Endless Mode',           reward: 4000 },
  { id: 'wave_40',        icon: '🌑',  name: 'Void Walker',          desc: 'Reach Wave 40 in Endless Mode',           reward: 12000 },
  { id: 'rush_win',       icon: '🛡️',  name: 'Gauntlet Runner',      desc: 'Beat the 5-Boss Raid Gauntlet',           reward: 1200 },

  // Rebirth & Hunter Level Milestones
  { id: 'lvl_20',         icon: '🎖️',  name: 'Veteran Hunter',       desc: 'Reach Hunter Level 20',                   reward: 2500 },
  { id: 'lvl_50',         icon: '🌟',  name: 'Grandmaster Hunter',   desc: 'Reach Hunter Level 50',                   reward: 15000 },
  { id: 'rebirth_1',      icon: '🔮',  name: 'Born Again',           desc: 'Perform your first Rebirth',              reward: 1000 },
  { id: 'rebirth_5',      icon: '🌌',  name: 'Ascended Soul',        desc: 'Reach Rebirth Tier 5',                    reward: 5000 },
  { id: 'rebirth_15',     icon: '🌠',  name: 'Celestial Immortal',   desc: 'Reach Rebirth Tier 15',                   reward: 20000 },
  { id: 'rebirth_30',     icon: '♾️',  name: 'Eternal Deity',        desc: 'Reach Rebirth Tier 30',                   reward: 50000 },

  // Pets, Relics, Skill Tree & Contracts
  { id: 'pet_collector',  icon: '🐾',  name: 'Zookeeper',            desc: 'Unlock at least 5 Battle Pets',           reward: 1500 },
  { id: 'pet_awaken',     icon: '🌟',  name: 'Cosmic Awakening',     desc: 'Evolve any pet in the Evolution Lab',     reward: 2500 },
  { id: 'relic_master',   icon: '🏺',  name: 'Relic Hunter',         desc: 'Own 3 Artifact Relics',                   reward: 3000 },
  { id: 'skill_keystone', icon: '☄️',  name: 'Keystone Master',      desc: 'Unlock a Tier 3 Skill Tree Keystone',     reward: 2500 },
  { id: 'contract_1',     icon: '🩸',  name: 'Contract Killer',      desc: 'Complete any Mythic Bounty Contract',     reward: 4000 },
  { id: 'godslayer',      icon: '☠️',  name: 'True Godslayer',       desc: 'Defeat THE UNKILLABLE GOD contract',      reward: 15000 },

  // Wealth & Secret Achievements
  { id: 'millionaire',    icon: '💰',  name: 'Vault Tycoon',         desc: 'Hold 50,000 Coins at once',               reward: 5000 },
  { id: 'wealth_1m',      icon: '💎',  name: 'Seven-Figure Mogul',   desc: 'Hold 1,000,000 Coins at once',            reward: 25000 },
  { id: 'secret_nightowl',icon: '🦉',  name: 'Secret: Night Owl',    desc: 'Hunt monsters between 12 AM and 4 AM',    reward: 5000 },
  { id: 'secret_dev',     icon: '👑',  name: 'Secret: Architect',    desc: 'Unlock the secret Developer Reticle',     reward: 10000 }
];
window.addEventListener('DOMContentLoaded', () => {
  // Register all 34 new trophies into the main ACHIEVEMENT_LIST
  if (typeof ACHIEVEMENT_LIST !== 'undefined') {
    EXTRA_ACHIEVEMENTS.forEach(a => {
      if (!ACHIEVEMENT_LIST.some(existing => existing.id === a.id)) {
        ACHIEVEMENT_LIST.push(a);
      }
    });
  }

  // Update Career Trophy counter dynamically
  if (typeof renderCareerModal === 'function') {
    const _achCareerOrig = renderCareerModal;
    renderCareerModal = function() {
      _achCareerOrig();
      const totalTrophies = typeof ACHIEVEMENT_LIST !== 'undefined' ? ACHIEVEMENT_LIST.length : 42;
      const unlockedCount = typeof achState !== 'undefined' ? achState.unlocked.length : 0;
      const grid = document.getElementById('career-stats-grid');
      if (grid && grid.lastElementChild) {
        const valDiv = grid.lastElementChild.querySelector('div:last-child');
        if (valDiv) valDiv.textContent = `🏆 ${unlockedCount}/${totalTrophies}`;
      }
    };
  }
});

// --- Live & Retroactive Checker for All 34 New Achievements ---
function checkExtraAchievements() {
  if (typeof unlockAchievement !== 'function') return;

  // 1. Career Kills, Bosses & Rebirths
  if (typeof careerData !== 'undefined') {
    const kills = careerData.totalKills || 0;
    if (kills >= 100)   unlockAchievement('kills_100');
    if (kills >= 500)   unlockAchievement('kills_500');
    if (kills >= 2500)  unlockAchievement('kills_2500');
    if (kills >= 10000) unlockAchievement('kills_10000');
    if (kills >= 50000) unlockAchievement('kills_50000');

    const bosses = careerData.bossesSlain || careerData.bossesDefeated || 0;
    if (bosses >= 5)    unlockAchievement('boss_5');
    if (bosses >= 25)   unlockAchievement('boss_25');
    if (bosses >= 50)   unlockAchievement('boss_50');
    if (bosses >= 100)  unlockAchievement('boss_100');

    const rb = careerData.rebirths || 0;
    if (rb >= 1)        unlockAchievement('rebirth_1');
    if (rb >= 5)        unlockAchievement('rebirth_5');
    if (rb >= 15)       unlockAchievement('rebirth_15');
    if (rb >= 30)       unlockAchievement('rebirth_30');
  }

  // 2. Live & Max Combos
  const bestCombo = Math.max(
    typeof maxCombo !== 'undefined' ? maxCombo : 0,
    typeof careerData !== 'undefined' ? (careerData.bestCombo || 0) : 0
  );
  if (bestCombo >= 50)  unlockAchievement('combo_50');
  if (bestCombo >= 100) unlockAchievement('combo_100');
  if (bestCombo >= 175) unlockAchievement('combo_175');
  if (bestCombo >= 250) unlockAchievement('combo_250');

  // 3. Endless Wave Records
  const bestWave = parseInt(localStorage.getItem('monster_best_wave')) || 1;
  const curWave = (typeof extraModes !== 'undefined' && extraModes.isEndless) ? extraModes.wave : 1;
  const topWave = Math.max(bestWave, curWave);
  if (topWave >= 5)  unlockAchievement('wave_5');
  if (topWave >= 15) unlockAchievement('wave_15');
  if (topWave >= 25) unlockAchievement('wave_25');
  if (topWave >= 40) unlockAchievement('wave_40');

  // 4. Boss Rush Gauntlet
  if (localStorage.getItem('monster_best_bossrush')) {
    unlockAchievement('rush_win');
  }

  // 5. Pets & Evolutions
  if (typeof endgameState !== 'undefined' && endgameState.petsOwned.length >= 5) {
    unlockAchievement('pet_collector');
  }
  if (typeof evolvedPets !== 'undefined' && evolvedPets.length >= 1) {
    unlockAchievement('pet_awaken');
  }

  // 6. Relics, Hunter Level & Wealth
  if (typeof relicState !== 'undefined' && relicState.owned.length >= 3) {
    unlockAchievement('relic_master');
  }
  if (typeof shopState !== 'undefined') {
    if ((shopState.level || 1) >= 20)     unlockAchievement('lvl_20');
    if ((shopState.level || 1) >= 50)     unlockAchievement('lvl_50');
    if ((shopState.coins || 0) >= 50000)   unlockAchievement('millionaire');
    if ((shopState.coins || 0) >= 1000000) unlockAchievement('wealth_1m');
  }

  // 7. Skill Tree Keystones (Tier 3 nodes end with _3)
  if (typeof skillTreeState !== 'undefined' && skillTreeState.unlockedNodes.some(id => id.endsWith('_3'))) {
    unlockAchievement('skill_keystone');
  }

  // 8. Mythic Bounty Contracts
  if (typeof contractState !== 'undefined') {
    if (contractState.completed.length >= 1) unlockAchievement('contract_1');
    if (contractState.completed.includes('god')) unlockAchievement('godslayer');
  }

  // 9. Secret Trophies (Night Owl & 0456 Architect Dev Crosshair)
  const hr = new Date().getHours();
  if (typeof isGameRunning !== 'undefined' && isGameRunning && hr >= 0 && hr < 4) {
    unlockAchievement('secret_nightowl');
  }
  if (typeof crosshairArmoryState !== 'undefined' && crosshairArmoryState.owned.includes('dev_architect')) {
    unlockAchievement('secret_dev');
  }
}

setInterval(checkExtraAchievements, 2000);
