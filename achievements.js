// --- Persistent Achievement System & Non-Blocking Toast Banner ---
const ACHIEVEMENTS_LIST = [
  { id: 'first_blood',   icon: '🩸', title: 'First Blood',       desc: 'Eliminate your first monster',          reward: 25 },
  { id: 'combo_25',      icon: '🔥', title: 'Combo Master',      desc: 'Reach a x25 hit combo streak',          reward: 75 },
  { id: 'combo_50',      icon: '⚡', title: 'Untouchable',       desc: 'Reach a x50 hit combo streak',          reward: 150 },
  { id: 'boss_slayer',   icon: '👑', title: 'Overlord Slayer',   desc: 'Defeat the Overlord Boss',              reward: 100 },
  { id: 'sharpshooter',  icon: '🎯', title: 'Sharpshooter',      desc: 'Win a hunt with 95%+ accuracy',         reward: 120 },
  { id: 'speed_demon',   icon: '⏱️', title: 'Speed Demon',       desc: 'Clear a hunt in under 18.0 seconds',    reward: 150 },
  { id: 'goblin_hunter', icon: '💰', title: 'Goblin Hunter',     desc: 'Catch 5 Loot Goblins total',            reward: 100 },
  { id: 'hellfire_win',  icon: '💀', title: 'Hellfire Survivor', desc: 'Beat the game on Hellfire difficulty',  reward: 500 }
];

const achState = {
  unlocked: JSON.parse(localStorage.getItem('monster_achievements')) || [],
  goblinsCaught: parseInt(localStorage.getItem('monster_goblins_caught')) || 0,
  queue: [],
  showingBanner: false
};

function saveAchievements() {
  localStorage.setItem('monster_achievements', JSON.stringify(achState.unlocked));
  localStorage.setItem('monster_goblins_caught', achState.goblinsCaught);
  updateAchievementButtons();
}

function unlockAchievement(id) {
  if (achState.unlocked.includes(id)) return;
  const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
  if (!ach) return;

  achState.unlocked.push(id);
  saveAchievements();

  // Grant coin reward if shop.js is loaded
  if (typeof shopState !== 'undefined' && typeof saveShopData === 'function') {
    shopState.coins += ach.reward;
    saveShopData();
  }

  achState.queue.push(ach);
  processAchievementQueue();
}

function processAchievementQueue() {
  if (achState.showingBanner || achState.queue.length === 0) return;
  achState.showingBanner = true;

  const ach = achState.queue.shift();
  const banner = document.getElementById('ach-toast-banner');
  if (!banner) return;

  document.getElementById('ach-banner-icon').textContent = ach.icon;
  document.getElementById('ach-banner-title').textContent = ach.title;
  document.getElementById('ach-banner-desc').textContent = `${ach.desc} (+${ach.reward} 🪙)`;

  if (typeof sfx !== 'undefined') sfx.powerup();
  banner.classList.add('show');

  setTimeout(() => {
    banner.classList.remove('show');
    setTimeout(() => {
      achState.showingBanner = false;
      processAchievementQueue();
    }, 350);
  }, 2600);
}

function updateAchievementButtons() {
  const countText = `🏆 Achievements (${achState.unlocked.length}/${ACHIEVEMENTS_LIST.length})`;
  document.querySelectorAll('.open-ach-btn').forEach(btn => {
    btn.textContent = countText;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Non-Blocking Achievement Toast Banner
  const banner = document.createElement('div');
  banner.id = 'ach-toast-banner';
  banner.innerHTML = `
    <div id="ach-banner-icon" style="font-size:1.8rem;">🏆</div>
    <div style="text-align:left;">
      <div style="font-size:0.72rem; font-weight:900; letter-spacing:1.5px; color:#ffd32a; text-transform:uppercase;">Achievement Unlocked!</div>
      <div id="ach-banner-title" style="font-size:1.05rem; font-weight:900; color:#fff;">Title</div>
      <div id="ach-banner-desc" style="font-size:0.8rem; color:#ced6e0;">Description</div>
    </div>
  `;
  document.body.appendChild(banner);

  const style = document.createElement('style');
  style.textContent = `
    #ach-toast-banner {
      position: fixed; top: 82px; right: 24px;
      display: flex; align-items: center; gap: 12px;
      background: rgba(14, 16, 26, 0.96);
      border: 2px solid #ffd32a;
      box-shadow: 0 8px 30px rgba(255, 211, 42, 0.35);
      padding: 12px 18px; border-radius: 14px;
      z-index: 95; pointer-events: none;
      opacity: 0; transform: translateX(120%);
      transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease;
    }
    #ach-toast-banner.show {
      opacity: 1; transform: translateX(0);
    }
  `;
  document.head.appendChild(style);

  // 2. Build Achievements Modal Overlay
  const modal = document.createElement('div');
  modal.id = 'ach-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '125';
  modal.innerHTML = `
    <div class="card" style="max-width: 580px; max-height: 88vh; display:flex; flex-direction:column;">
      <h2 style="color:#ffd32a; margin:0 0 6px 0; font-size:1.8rem;">🏆 Trophy Room</h2>
      <p class="subtitle" id="ach-progress-sub" style="margin-bottom:14px;">Unlocked: 0 / ${ACHIEVEMENTS_LIST.length}</p>
      <div id="ach-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; overflow-y:auto; padding-right:4px; margin-bottom:18px; text-align:left;"></div>
      <button class="action-btn" id="close-ach-btn" style="background:linear-gradient(135deg,#ff4757,#ff6b81); color:#fff;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  // 3. Add Trophy Room Button to Start & Victory Menus
  ['start-screen', 'victory-screen'].forEach(screenId => {
    const card = document.querySelector(`#${screenId} .card`);
    if (card) {
      const btn = document.createElement('button');
      btn.className = 'action-btn open-ach-btn';
      btn.style.cssText = 'margin-top:10px; background:linear-gradient(135deg,#5352ed,#70a1ff); color:#fff; font-size:1.05rem; padding:13px;';
      btn.addEventListener('click', () => {
        renderAchievementsModal();
        modal.classList.remove('hidden');
      });
      card.appendChild(btn);
    }
  });

  document.getElementById('close-ach-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  updateAchievementButtons();
});

function renderAchievementsModal() {
  const grid = document.getElementById('ach-grid');
  const sub = document.getElementById('ach-progress-sub');
  if (!grid) return;

  sub.textContent = `Unlocked: ${achState.unlocked.length} / ${ACHIEVEMENTS_LIST.length} Trophies`;
  grid.innerHTML = '';

  ACHIEVEMENTS_LIST.forEach(ach => {
    const isUnlocked = achState.unlocked.includes(ach.id);
    const card = document.createElement('div');
    card.style.cssText = `
      background: ${isUnlocked ? 'rgba(255, 211, 42, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
      border: 1px solid ${isUnlocked ? '#ffd32a' : 'rgba(255, 255, 255, 0.1)'};
      border-radius: 12px; padding: 12px; display: flex; gap: 10px; align-items: center;
      opacity: ${isUnlocked ? '1' : '0.55'};
    `;
    card.innerHTML = `
      <div style="font-size:1.8rem; filter:${isUnlocked ? 'none' : 'grayscale(100%)'};">${ach.icon}</div>
      <div>
        <div style="font-weight:800; font-size:0.92rem; color:${isUnlocked ? '#ffd32a' : '#fff'};">${ach.title}</div>
        <div style="font-size:0.76rem; color:#a4b0be; margin:2px 0;">${ach.desc}</div>
        <div style="font-size:0.74rem; font-weight:800; color:${isUnlocked ? '#2ed573' : '#747d8c'};">
          ${isUnlocked ? '✅ UNLOCKED' : `Reward: +${ach.reward} 🪙`}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- Gameplay Hooks to Detect Achievement Unlocks ---
const _achOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  _achOrigDefeat(monster, clickX, clickY);

  unlockAchievement('first_blood');
  if (combo >= 25) unlockAchievement('combo_25');
  if (combo >= 50) unlockAchievement('combo_50');
  if (monster.type === 'boss') unlockAchievement('boss_slayer');
};

const _achOrigVictory = endGameVictory;
endGameVictory = function() {
  _achOrigVictory();

  const finalSeconds = (performance.now() - startTime) / 1000;
  const accuracy = totalClicks > 0 ? Math.round((successfulHits / totalClicks) * 100) : 100;

  if (accuracy >= 95) unlockAchievement('sharpshooter');
  if (finalSeconds < 18.0) unlockAchievement('speed_demon');
  if (currentDiff === 'hellfire') unlockAchievement('hellfire_win');
};

// Track Loot Goblins caught (hooks into floating text reward)
const _achOrigFloatText = spawnFloatingText;
spawnFloatingText = function(x, y, text, color) {
  _achOrigFloatText(x, y, text, color);
  if (typeof text === 'string' && (text.includes('-2.0s') || text.includes('-4.0s'))) {
    achState.goblinsCaught++;
    saveAchievements();
    if (achState.goblinsCaught >= 5) {
      unlockAchievement('goblin_hunter');
    }
  }
};
