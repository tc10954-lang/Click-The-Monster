// --- 20 Additional Endgame & Mastery Achievements ---
const EXTRA_ACHIEVEMENTS = [
  { id: 'kills_100',    icon: '⚔️',  name: 'Centurion',          desc: 'Slay 100 monsters total',               reward: 250 },
  { id: 'kills_500',    icon: '🗡️',  name: 'Monster Butcher',    desc: 'Slay 500 monsters total',               reward: 750 },
  { id: 'kills_2500',   icon: '💀',  name: 'Extinction Event',   desc: 'Slay 2,500 monsters total',             reward: 2500 },
  { id: 'combo_50',     icon: '🔥',  name: 'Untouchable',        desc: 'Reach a x50 combo streak',              reward: 600 },
  { id: 'combo_100',    icon: '⚡',  name: 'Godlike Reflexes',   desc: 'Reach a x100 combo streak',             reward: 2000 },
  { id: 'boss_5',       icon: '👹',  name: 'Regicide',           desc: 'Defeat 5 Overlord Bosses',              reward: 500 },
  { id: 'boss_25',      icon: '👑',  name: 'King of Monsters',   desc: 'Defeat 25 Overlord Bosses',             reward: 2000 },
  { id: 'wave_5',       icon: '🌊',  name: 'Wave Surfer',        desc: 'Reach Wave 5 in Endless Mode',          reward: 400 },
  { id: 'wave_15',      icon: '🌀',  name: 'Tsunami Survivor',   desc: 'Reach Wave 15 in Endless Mode',         reward: 1500 },
  { id: 'wave_25',      icon: '🔱',  name: 'Abyssal Legend',     desc: 'Reach Wave 25 in Endless Mode',         reward: 4000 },
  { id: 'rush_win',     icon: '🛡️',  name: 'Gauntlet Runner',    desc: 'Beat the 5-Boss Raid Gauntlet',         reward: 1200 },
  { id: 'rebirth_1',    icon: '🔮',  name: 'Born Again',         desc: 'Perform your first Rebirth',            reward: 1000 },
  { id: 'rebirth_5',    icon: '🌌',  name: 'Ascended Soul',      desc: 'Reach Rebirth Tier 5',                  reward: 5000 },
  { id: 'pet_collector',icon: '🐾',  name: 'Zookeeper',          desc: 'Unlock at least 5 Battle Pets',         reward: 1500 },
  { id: 'pet_awaken',   icon: '🌟',  name: 'Cosmic Awakening',   desc: 'Evolve any pet in the Evolution Lab',   reward: 2500 },
  { id: 'relic_master', icon: '🏺',  name: 'Relic Hunter',       desc: 'Own 3 Artifact Relics',                 reward: 3000 },
  { id: 'skill_keystone',icon:'☄️',  name: 'Keystone Master',    desc: 'Unlock a Tier 3 Skill Tree Keystone',   reward: 2500 },
  { id: 'contract_1',   icon: '🩸',  name: 'Contract Killer',    desc: 'Complete any Mythic Bounty Contract',   reward: 4000 },
  { id: 'godslayer',    icon: '☠️',  name: 'True Godslayer',     desc: 'Defeat THE UNKILLABLE GOD contract',    reward: 15000 },
  { id: 'millionaire',  icon: '💰',  name: 'Vault Tycoon',       desc: 'Hold 50,000 Coins at once',             reward: 5000 }
];

window.addEventListener('DOMContentLoaded', () => {
  // Register all 20 new trophies into the main ACHIEVEMENT_LIST
  if (typeof ACHIEVEMENT_LIST !== 'undefined') {
    EXTRA_ACHIEVEMENTS.forEach(a => {
      if (!ACHIEVEMENT_LIST.some(existing => existing.id === a.id)) {
        ACHIEVEMENT_LIST.push(a);
      }
    });
  }

  // Update Career Trophy counter dynamically if available
  if (typeof renderCareerModal === 'function') {
    const _achCareerOrig = renderCareerModal;
    renderCareerModal = function() {
      _achCareerOrig();
      const totalTrophies = typeof ACHIEVEMENT_LIST !== 'undefined' ? ACHIEVEMENT_LIST.length : 28;
      const unlockedCount = typeof achState !== 'undefined' ? achState.unlocked.length : 0;
      const grid = document.getElementById('career-stats-grid');
      if (grid && grid.lastElementChild) {
        const valDiv = grid.lastElementChild.querySelector('div:last-child');
        if (valDiv) valDiv.textContent = `🏆 ${unlockedCount}/${totalTrophies}`;
      }
    };
  }
});
// --- Live & Retroactive Checker for All 20 New Achievements ---
function checkExtraAchievements() {
  if (typeof unlockAchievement !== 'function') return;

  // 1. Career Kills & Bosses
  if (typeof careerData !== 'undefined') {
    if (careerData.totalKills >= 100)  unlockAchievement('kills_100');
    if (careerData.totalKills >= 500)  unlockAchievement('kills_500');
    if (careerData.totalKills >= 2500) unlockAchievement('kills_2500');

    if (careerData.bossesSlain >= 5)   unlockAchievement('boss_5');
    if (careerData.bossesSlain >= 25)  unlockAchievement('boss_25');

    if (careerData.rebirths >= 1)      unlockAchievement('rebirth_1');
    if (careerData.rebirths >= 5)      unlockAchievement('rebirth_5');
  }

  // 2. Live & Max Combos
  if (typeof maxCombo !== 'undefined') {
    if (maxCombo >= 50)  unlockAchievement('combo_50');
    if (maxCombo >= 100) unlockAchievement('combo_100');
  }

  // 3. Endless Wave Records
  const bestWave = parseInt(localStorage.getItem('monster_best_wave')) || 1;
  const curWave = (typeof extraModes !== 'undefined' && extraModes.isEndless) ? extraModes.wave : 1;
  const topWave = Math.max(bestWave, curWave);
  if (topWave >= 5)  unlockAchievement('wave_5');
  if (topWave >= 15) unlockAchievement('wave_15');
  if (topWave >= 25) unlockAchievement('wave_25');

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

  // 6. Relics & Coins
  if (typeof relicState !== 'undefined' && relicState.owned.length >= 3) {
    unlockAchievement('relic_master');
  }
  if (typeof shopState !== 'undefined' && shopState.coins >= 50000) {
    unlockAchievement('millionaire');
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
}

// Run check every 2 seconds (catches mid-round milestones + retroactively awards any you already earned!)
setInterval(checkExtraAchievements, 2000);
