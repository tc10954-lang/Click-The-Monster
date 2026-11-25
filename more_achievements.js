// --- 34 Additional Endgame, Mastery & Secret Achievements ---
const EXTRA_ACHIEVEMENTS = [
  { id: 'kills_100',      icon: '⚔️',  name: 'Centurion',            desc: 'Slay 100 monsters total',                 reward: 250 },
  { id: 'kills_500',      icon: '🗡️',  name: 'Monster Butcher',      desc: 'Slay 500 monsters total',                 reward: 750 },
  { id: 'kills_2500',     icon: '💀',  name: 'Extinction Event',     desc: 'Slay 2,500 monsters total',               reward: 2500 },
  { id: 'kills_10000',    icon: '☠️',  name: 'Harbinger of Doom',    desc: 'Slay 10,000 monsters total',              reward: 10000 },
  { id: 'kills_50000',    icon: '🌋',  name: 'Apocalypse Incarnate', desc: 'Slay 50,000 monsters total',              reward: 35000 },
  { id: 'combo_50',       icon: '🔥',  name: 'Untouchable',          desc: 'Reach a x50 combo streak',                reward: 600 },
  { id: 'combo_100',      icon: '⚡',  name: 'Godlike Reflexes',     desc: 'Reach a x100 combo streak',               reward: 2000 },
  { id: 'combo_175',      icon: '☄️',  name: 'Hyper-Focus',          desc: 'Reach a x175 combo streak',               reward: 6000 },
  { id: 'combo_250',      icon: '🌌',  name: 'Ultra Instinct',       desc: 'Reach a x250 combo streak',               reward: 15000 },
  { id: 'boss_5',         icon: '👹',  name: 'Regicide',             desc: 'Defeat 5 Overlord Bosses',                reward: 500 },
  { id: 'boss_25',        icon: '👑',  name: 'King of Monsters',     desc: 'Defeat 25 Overlord Bosses',               reward: 2000 },
  { id: 'boss_50',        icon: '🔱',  name: 'Titan Bane',           desc: 'Defeat 50 Overlord Bosses',               reward: 8000 },
  { id: 'boss_100',       icon: '🐲',  name: 'Overlord Executioner', desc: 'Defeat 100 Overlord Bosses',              reward: 25000 },
  { id: 'wave_5',         icon: '🌊',  name: 'Wave Surfer',          desc: 'Reach Wave 5 in Endless Mode',            reward: 400 },
  { id: 'wave_15',        icon: '🌀',  name: 'Tsunami Survivor',     desc: 'Reach Wave 15 in Endless Mode',           reward: 1500 },
  { id: 'wave_25',        icon: '🔱',  name: 'Abyssal Legend',       desc: 'Reach Wave 25 in Endless Mode',           reward: 4000 },
  { id: 'wave_40',        icon: '🌑',  name: 'Void Walker',          desc: 'Reach Wave 40 in Endless Mode',           reward: 12000 },
  { id: 'rush_win',       icon: '🛡️',  name: 'Gauntlet Runner',      desc: 'Beat the 5-Boss Raid Gauntlet',           reward: 1200 },
  { id: 'lvl_20',         icon: '🎖️',  name: 'Veteran Hunter',       desc: 'Reach Hunter Level 20',                   reward: 2500 },
  { id: 'lvl_50',         icon: '🌟',  name: 'Grandmaster Hunter',   desc: 'Reach Hunter Level 50',                   reward: 15000 },
  { id: 'rebirth_1',      icon: '🔮',  name: 'Born Again',           desc: 'Perform your first Rebirth',              reward: 1000 },
  { id: 'rebirth_5',      icon: '🌌',  name: 'Ascended Soul',        desc: 'Reach Rebirth Tier 5',                    reward: 5000 },
  { id: 'rebirth_15',     icon: '🌠',  name: 'Celestial Immortal',   desc: 'Reach Rebirth Tier 15',                   reward: 20000 },
  { id: 'rebirth_30',     icon: '♾️',  name: 'Eternal Deity',        desc: 'Reach Rebirth Tier 30',                   reward: 50000 },
  { id: 'pet_collector',  icon: '🐾',  name: 'Zookeeper',            desc: 'Unlock at least 5 Battle Pets',           reward: 1500 },
  { id: 'pet_awaken',     icon: '🌟',  name: 'Cosmic Awakening',     desc: 'Evolve any pet in the Evolution Lab',     reward: 2500 },
  { id: 'relic_master',   icon: '🏺',  name: 'Relic Hunter',         desc: 'Own 3 Artifact Relics',                   reward: 3000 },
  { id: 'skill_keystone', icon: '☄️',  name: 'Keystone Master',      desc: 'Unlock a Tier 3 Skill Tree Keystone',     reward: 2500 },
  { id: 'contract_1',     icon: '🩸',  name: 'Contract Killer',      desc: 'Complete any Mythic Bounty Contract',     reward: 4000 },
  { id: 'godslayer',      icon: '☠️',  name: 'True Godslayer',       desc: 'Defeat THE UNKILLABLE GOD contract',      reward: 15000 },
  { id: 'millionaire',    icon: '💰',  name: 'Vault Tycoon',         desc: 'Hold 50,000 Coins at once',               reward: 5000 },
  { id: 'wealth_1m',      icon: '💎',  name: 'Seven-Figure Mogul',   desc: 'Hold 1,000,000 Coins at once',            reward: 25000 },
  { id: 'secret_nightowl',icon: '🦉',  name: 'Secret: Night Owl',    desc: 'Hunt monsters between 12 AM and 4 AM',    reward: 5000 },
  { id: 'secret_dev',     icon: '👑',  name: 'Secret: Architect',    desc: 'Unlock the secret Developer Reticle',     reward: 10000 }
];

// Inject immediately on script execution (before DOMContentLoaded!)
if (typeof ACHIEVEMENT_LIST !== 'undefined') {
  EXTRA_ACHIEVEMENTS.forEach(a => {
    if (!ACHIEVEMENT_LIST.some(existing => existing.id === a.id)) {
      ACHIEVEMENT_LIST.push(a);
    }
  });
}
const extraAchUnlocked = JSON.parse(localStorage.getItem('monster_extra_ach_v1') || '[]');

function saveExtraAch() {
  localStorage.setItem('monster_extra_ach_v1', JSON.stringify(extraAchUnlocked));
}

function triggerExtraAchievementUnlock(id) {
  const item = EXTRA_ACHIEVEMENTS.find(a => a.id === id);
  if (!item) return;

  // 1. Use native unlockAchievement if ACHIEVEMENT_LIST was global
  if (typeof ACHIEVEMENT_LIST !== 'undefined' && typeof unlockAchievement === 'function') {
    unlockAchievement(id);
    return;
  }

  // 2. Fallback if ACHIEVEMENT_LIST was scoped with const inside achievements.js
  if (extraAchUnlocked.includes(id)) return;
  extraAchUnlocked.push(id);
  saveExtraAch();

  if (typeof shopState !== 'undefined') {
    shopState.coins = (shopState.coins || 0) + item.reward;
    if (typeof saveShopData === 'function') saveShopData();
  }
  if (typeof sfx !== 'undefined') sfx.powerup();

  // Show native-style Trophy Toast Banner
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 72px; right: 18px; z-index: 9999;
    background: linear-gradient(135deg, #1e272e, #0f141e);
    border: 2px solid #ffd32a; border-radius: 14px; padding: 10px 16px;
    color: #fff; box-shadow: 0 8px 25px rgba(0,0,0,0.6);
    display: flex; align-items: center; gap: 10px; font-weight: 800;
  `;
  toast.innerHTML = `
    <div style="font-size: 1.7rem;">${item.icon}</div>
    <div>
      <div style="font-size: 0.7rem; color: #ffd32a; text-transform: uppercase;">🏆 Trophy Unlocked!</div>
      <div style="font-size: 0.92rem;">${item.name}</div>
      <div style="font-size: 0.72rem; color: #2ed573;">+${item.reward.toLocaleString()} 🪙</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3800);
}

// Inject all 34 trophies directly into the original Achievements Modal list whenever it opens
setInterval(() => {
  const achListEl = document.getElementById('achievements-list')
    || document.getElementById('achievement-list')
    || document.getElementById('trophy-list')
    || [...document.querySelectorAll('div')].find(el =>
      el.offsetParent !== null &&
      el.children.length >= 6 &&
      el.children.length <= 12 &&
      /First Blood|Monster Slayer|Boss Slayer/i.test(el.textContent) &&
      !el.querySelector('.action-btn')
    );

  if (!achListEl || achListEl.dataset.extraInjected) return;
  if (typeof ACHIEVEMENT_LIST !== 'undefined' && ACHIEVEMENT_LIST.some(a => a.id === 'kills_50000')) {
    achListEl.dataset.extraInjected = '1';
    return;
  }

  achListEl.dataset.extraInjected = '1';
  EXTRA_ACHIEVEMENTS.forEach(a => {
    const unlocked = extraAchUnlocked.includes(a.id);
    const card = document.createElement('div');
    card.style.cssText = `
      background: ${unlocked ? 'rgba(255, 211, 42, 0.14)' : 'rgba(255, 255, 255, 0.04)'};
      border: 1.5px solid ${unlocked ? '#ffd32a' : 'rgba(255, 255, 255, 0.1)'};
      border-radius: 12px; padding: 10px; display: flex; align-items: center; gap: 10px;
      opacity: ${unlocked ? '1' : '0.62'};
    `;
    card.innerHTML = `
      <div style="font-size: 1.6rem;">${a.icon}</div>
      <div style="flex: 1; text-align: left;">
        <div style="font-weight: 900; font-size: 0.85rem; color: ${unlocked ? '#ffd32a' : '#fff'};">${a.name}</div>
        <div style="font-size: 0.72rem; color: #a4b0be;">${a.desc}</div>
      </div>
      <div style="font-weight: 900; font-size: 0.75rem; color: ${unlocked ? '#2ed573' : '#ffd32a'};">
        ${unlocked ? '✅ DONE' : `+${a.reward.toLocaleString()} 🪙`}
      </div>
    `;
    achListEl.appendChild(card);
  });
}, 250);

// --- Live & Retroactive Checker for All 34 New Achievements ---
function checkExtraAchievements() {
  if (typeof careerData !== 'undefined') {
    const kills = careerData.totalKills || 0;
    if (kills >= 100)   triggerExtraAchievementUnlock('kills_100');
    if (kills >= 500)   triggerExtraAchievementUnlock('kills_500');
    if (kills >= 2500)  triggerExtraAchievementUnlock('kills_2500');
    if (kills >= 10000) triggerExtraAchievementUnlock('kills_10000');
    if (kills >= 50000) triggerExtraAchievementUnlock('kills_50000');

    const bosses = careerData.bossesSlain || careerData.bossesDefeated || 0;
    if (bosses >= 5)    triggerExtraAchievementUnlock('boss_5');
    if (bosses >= 25)   triggerExtraAchievementUnlock('boss_25');
    if (bosses >= 50)   triggerExtraAchievementUnlock('boss_50');
    if (bosses >= 100)  triggerExtraAchievementUnlock('boss_100');

    const rb = careerData.rebirths || 0;
    if (rb >= 1)        triggerExtraAchievementUnlock('rebirth_1');
    if (rb >= 5)        triggerExtraAchievementUnlock('rebirth_5');
    if (rb >= 15)       triggerExtraAchievementUnlock('rebirth_15');
    if (rb >= 30)       triggerExtraAchievementUnlock('rebirth_30');
  }

  const bestCombo = Math.max(
    typeof maxCombo !== 'undefined' ? maxCombo : 0,
    typeof careerData !== 'undefined' ? (careerData.bestCombo || 0) : 0
  );
  if (bestCombo >= 50)  triggerExtraAchievementUnlock('combo_50');
  if (bestCombo >= 100) triggerExtraAchievementUnlock('combo_100');
  if (bestCombo >= 175) triggerExtraAchievementUnlock('combo_175');
  if (bestCombo >= 250) triggerExtraAchievementUnlock('combo_250');

  const bestWave = parseInt(localStorage.getItem('monster_best_wave')) || 1;
  const curWave = (typeof extraModes !== 'undefined' && extraModes.isEndless) ? extraModes.wave : 1;
  const topWave = Math.max(bestWave, curWave);
  if (topWave >= 5)  triggerExtraAchievementUnlock('wave_5');
  if (topWave >= 15) triggerExtraAchievementUnlock('wave_15');
  if (topWave >= 25) triggerExtraAchievementUnlock('wave_25');
  if (topWave >= 40) triggerExtraAchievementUnlock('wave_40');

  if (localStorage.getItem('monster_best_bossrush')) triggerExtraAchievementUnlock('rush_win');
  if (typeof endgameState !== 'undefined' && endgameState.petsOwned.length >= 5) triggerExtraAchievementUnlock('pet_collector');
  if (typeof evolvedPets !== 'undefined' && evolvedPets.length >= 1) triggerExtraAchievementUnlock('pet_awaken');
  if (typeof relicState !== 'undefined' && relicState.owned.length >= 3) triggerExtraAchievementUnlock('relic_master');

  if (typeof shopState !== 'undefined') {
    if ((shopState.level || 1) >= 20)     triggerExtraAchievementUnlock('lvl_20');
    if ((shopState.level || 1) >= 50)     triggerExtraAchievementUnlock('lvl_50');
    if ((shopState.coins || 0) >= 50000)   triggerExtraAchievementUnlock('millionaire');
    if ((shopState.coins || 0) >= 1000000) triggerExtraAchievementUnlock('wealth_1m');
  }

  if (typeof skillTreeState !== 'undefined' && skillTreeState.unlockedNodes.some(id => id.endsWith('_3'))) {
    triggerExtraAchievementUnlock('skill_keystone');
  }

  if (typeof contractState !== 'undefined') {
    if (contractState.completed.length >= 1) triggerExtraAchievementUnlock('contract_1');
    if (contractState.completed.includes('god')) triggerExtraAchievementUnlock('godslayer');
  }

  const hr = new Date().getHours();
  if (typeof isGameRunning !== 'undefined' && isGameRunning && hr >= 0 && hr < 4) {
    triggerExtraAchievementUnlock('secret_nightowl');
  }
  if (typeof crosshairArmoryState !== 'undefined' && crosshairArmoryState.owned.includes('dev_architect')) {
    triggerExtraAchievementUnlock('secret_dev');
  }
}

setInterval(checkExtraAchievements, 2000);
