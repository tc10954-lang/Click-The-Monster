// --- 5-Region, 25-Stage RPG World Map Campaign ---
const campaignState = {
  unlockedStage: parseInt(localStorage.getItem('monster_rpg_campaign_stage')) || 1, // 1 to 26 (26 = all 25 beaten)
  activeStageNum: null,
  selectedRegionIdx: 0
};

const CAMPAIGN_REGIONS = [
  {
    id: 'woods',
    name: '🌲 Whispering Woods',
    color: '#2ed573',
    hazardText: 'Region Aura: Forest Ambush (High Grunt & Speedster density)',
    bossName: '🌳 ELDER BARKLORD',
    relicName: '🌿 Ring of the Forest (+15% Coins)',
    stages: [
      { num: 1,  title: '1-1: Forest Edge',     grunts: 15, speedsters: 4,  tanks: 1,  speed: 1.0, bossHp: 0,  reward: 250 },
      { num: 2,  title: '1-2: Mossy Trail',     grunts: 20, speedsters: 6,  tanks: 3,  speed: 1.1, bossHp: 0,  reward: 350 },
      { num: 3,  title: '1-3: Tangled Thicket', grunts: 22, speedsters: 10, tanks: 4,  speed: 1.2, bossHp: 0,  reward: 450 },
      { num: 4,  title: '1-4: Ancient Grove',   grunts: 26, speedsters: 12, tanks: 6,  speed: 1.3, bossHp: 0,  reward: 600 },
      { num: 5,  title: '1-5: BOSS: Barklord',  grunts: 15, speedsters: 8,  tanks: 4,  speed: 1.3, bossHp: 35, reward: 1200 }
    ]
  },
  {
    id: 'crypt',
    name: '🪦 Cursed Crypt',
    color: '#a55eea',
    hazardText: 'Region Hazard: Graveyard Mist (Monsters dart erratically)',
    bossName: '💀 ARCH-LICH MALAKOR',
    relicName: '💀 Ring of Souls (+2 Base Click DMG)',
    stages: [
      { num: 6,  title: '2-1: Bone Gate',       grunts: 22, speedsters: 12, tanks: 6,  speed: 1.35, bossHp: 0,  reward: 800 },
      { num: 7,  title: '2-2: Catacombs',       grunts: 25, speedsters: 15, tanks: 8,  speed: 1.4,  bossHp: 0,  reward: 950 },
      { num: 8,  title: '2-3: Haunted Vault',   grunts: 28, speedsters: 18, tanks: 10, speed: 1.45, bossHp: 0,  reward: 1100 },
      { num: 9,  title: '2-4: Soul Altar',      grunts: 32, speedsters: 20, tanks: 12, speed: 1.5,  bossHp: 0,  reward: 1300 },
      { num: 10, title: '2-5: BOSS: Malakor',   grunts: 18, speedsters: 12, tanks: 6,  speed: 1.5,  bossHp: 65, reward: 2500 }
    ]
  },
  {
    id: 'magma',
    name: '🌋 Magma Core',
    color: '#ff6348',
    hazardText: 'Region Hazard: Volcanic Heat (+25% Enemy Movement Speed)',
    bossName: '🔥 IGNIS COLOSSUS',
    relicName: '🔥 Ring of Embers (+20% Crit Chance)',
    stages: [
      { num: 11, title: '3-1: Ashen Slope',     grunts: 26, speedsters: 18, tanks: 12, speed: 1.6,  bossHp: 0,   reward: 1600 },
      { num: 12, title: '3-2: Obsidian Bridge', grunts: 30, speedsters: 20, tanks: 14, speed: 1.65, bossHp: 0,   reward: 1900 },
      { num: 13, title: '3-3: Lava Foundry',    grunts: 34, speedsters: 22, tanks: 16, speed: 1.7,  bossHp: 0,   reward: 2200 },
      { num: 14, title: '3-4: Caldera Rim',     grunts: 38, speedsters: 25, tanks: 18, speed: 1.75, bossHp: 0,   reward: 2600 },
      { num: 15, title: '3-5: BOSS: Ignis',     grunts: 20, speedsters: 15, tanks: 10, speed: 1.75, bossHp: 110, reward: 5000 }
    ]
  },
  {
    id: 'astral',
    name: '🌌 Astral Spire',
    color: '#00d2d3',
    hazardText: 'Region Hazard: Zero-G Rift (High Speedster swarms)',
    bossName: '✨ AETHER SERAPH',
    relicName: '✨ Ring of Stars (+40% Energy Regen)',
    stages: [
      { num: 16, title: '4-1: Starlight Steps', grunts: 30, speedsters: 28, tanks: 15, speed: 1.85, bossHp: 0,   reward: 3200 },
      { num: 17, title: '4-2: Nebula Hall',     grunts: 32, speedsters: 32, tanks: 18, speed: 1.9,  bossHp: 0,   reward: 3800 },
      { num: 18, title: '4-3: Gravity Well',    grunts: 35, speedsters: 35, tanks: 20, speed: 1.95, bossHp: 0,   reward: 4400 },
      { num: 19, title: '4-4: Celestial Apex',  grunts: 38, speedsters: 38, tanks: 22, speed: 2.0,  bossHp: 0,   reward: 5200 },
      { num: 20, title: '4-5: BOSS: Seraph',    grunts: 22, speedsters: 22, tanks: 12, speed: 2.0,  bossHp: 165, reward: 10000 }
    ]
  },
  {
    id: 'void',
    name: '👑 The Void Throne',
    color: '#ff9ff3',
    hazardText: 'Region Hazard: Eclipse Veil (Extreme Swarm & Titan Boss)',
    bossName: '👁️ VOID EMPEROR',
    relicName: '👑 Crown of Eternity (+5 Click DMG & +50% Coins)',
    stages: [
      { num: 21, title: '5-1: Abyssal Breach',  grunts: 40, speedsters: 35, tanks: 22, speed: 2.1,  bossHp: 0,   reward: 6500 },
      { num: 22, title: '5-2: Shattered Reality',grunts:44, speedsters: 38, tanks: 25, speed: 2.15, bossHp: 0,   reward: 8000 },
      { num: 23, title: '5-3: Shadow Citadel',  grunts: 48, speedsters: 40, tanks: 28, speed: 2.2,  bossHp: 0,   reward: 9500 },
      { num: 24, title: '5-4: Throne Approach', grunts: 52, speedsters: 42, tanks: 30, speed: 2.25, bossHp: 0,   reward: 12000 },
      { num: 25, title: '5-5: FINAL GOD EMPEROR',grunts:30, speedsters: 25, tanks: 15, speed: 2.3,  bossHp: 250, reward: 25000 }
    ]
  }
];

function saveCampaignProgress() {
  localStorage.setItem('monster_rpg_campaign_stage', campaignState.unlockedStage.toString());
}

function getStageConfigByNum(num) {
  for (let rIdx = 0; rIdx < CAMPAIGN_REGIONS.length; rIdx++) {
    const reg = CAMPAIGN_REGIONS.at(rIdx);
    const st = reg.stages.find(s => s.num === num);
    if (st) return { region: reg, regionIdx: rIdx, stage: st };
  }
  return null;
}
window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🗺️ World Campaign" Button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const mapBtn = document.createElement('button');
    mapBtn.id = 'open-campaign-btn';
    mapBtn.className = 'action-btn';
    mapBtn.style.cssText = 'background: linear-gradient(135deg, #2ed573, #1e90ff); color: #07080c;';
    mapBtn.innerHTML = `🗺️ World Map (${Math.min(25, campaignState.unlockedStage - 1)}/25)`;
    mapBtn.addEventListener('click', () => {
      renderCampaignModal();
      document.getElementById('campaign-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(mapBtn);
    } else {
      startCard.appendChild(mapBtn);
    }
  }

  // 2. Build 5-Region RPG World Map Modal
  const modal = document.createElement('div');
  modal.id = 'campaign-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '152';
  modal.innerHTML = `
    <div class="card" style="max-width: 640px; max-height: 92vh; overflow-y: auto; text-align: left;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <h2 style="color: #2ed573; margin: 0; font-size: 1.75rem;">🗺️ RPG World Campaign</h2>
        <div style="font-size: 0.92rem; font-weight: 900; color: #ffd32a;">Progress: <span id="camp-prog-label">0/25</span></div>
      </div>
      <p class="subtitle" style="margin-bottom: 10px;">Conquer all 5 Regions & defeat each Region Boss to earn permanent Mastery Rings!</p>

      <div id="camp-region-tabs" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; margin-bottom:10px;"></div>

      <div id="camp-region-banner" style="background:rgba(0,0,0,0.42); border-radius:10px; padding:9px 12px; margin-bottom:10px;"></div>

      <div id="camp-stages-list" style="display:flex; flex-direction:column; gap:7px; margin-bottom:14px;"></div>

      <button class="action-btn" id="close-camp-btn" style="background:linear-gradient(135deg, #ff4757, #ff6b81); color:#fff;">Close Map</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-camp-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
});

function renderCampaignModal() {
  const clearedCount = Math.min(25, campaignState.unlockedStage - 1);
  document.getElementById('camp-prog-label').textContent = `${clearedCount}/25 Cleared`;

  const openBtn = document.getElementById('open-campaign-btn');
  if (openBtn) openBtn.innerHTML = `🗺️ World Map (${clearedCount}/25)`;

  // 1. Render 5 Region Tabs
  const tabsEl = document.getElementById('camp-region-tabs');
  tabsEl.innerHTML = CAMPAIGN_REGIONS.map((reg, idx) => {
    const firstStageNum = reg.stages.at(0).num;
    const unlocked = campaignState.unlockedStage >= firstStageNum;
    const selected = idx === campaignState.selectedRegionIdx;

    return `
      <button type="button" class="camp-tab-btn" data-idx="${idx}" style="
        padding: 7px 4px; border-radius: 8px; font-weight: 900; font-size: 0.7rem; cursor: pointer;
        background: ${selected ? `${reg.color}33` : 'rgba(255,255,255,0.05)'};
        border: 1.5px solid ${selected ? reg.color : 'rgba(255,255,255,0.12)'};
        color: ${unlocked ? '#fff' : '#747d8c'};
      ">${unlocked ? reg.name.split(' ').at(0) : '🔒'} Region ${idx + 1}</button>
    `;
  }).join('');

  tabsEl.querySelectorAll('.camp-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      campaignState.selectedRegionIdx = parseInt(btn.dataset.idx);
      renderCampaignModal();
    });
  });

  // 2. Render Selected Region Banner & Mastery Ring Status
  const region = CAMPAIGN_REGIONS.at(campaignState.selectedRegionIdx);
  const bossStageNum = region.stages.at(-1).num;
  const ringUnlocked = campaignState.unlockedStage > bossStageNum;

  const bannerEl = document.getElementById('camp-region-banner');
  bannerEl.style.border = `1px solid ${region.color}`;
  bannerEl.innerHTML = `
    <div style="font-weight:900; font-size:1rem; color:${region.color};">${region.name}</div>
    <div style="font-size:0.74rem; color:#ced6e0; margin:2px 0 4px 0;">${region.hazardText}</div>
    <div style="font-size:0.75rem; font-weight:800; color:${ringUnlocked ? '#2ed573' : '#ffd32a'};">
      ${ringUnlocked ? `✅ MASTERY RING ACTIVE: ${region.relicName}` : `🏆 Clear Stage ${bossStageNum} to unlock: ${region.relicName}`}
    </div>
  `;

  // 3. Render 5 Stages inside Region
  const listEl = document.getElementById('camp-stages-list');
  listEl.innerHTML = region.stages.map(st => {
    const isUnlocked = campaignState.unlockedStage >= st.num;
    const isBeaten = campaignState.unlockedStage > st.num;
    const isBoss = st.bossHp > 0;

    return `
      <div style="
        background: ${isBeaten ? 'rgba(46,213,115,0.1)' : 'rgba(255,255,255,0.04)'};
        border: 1px solid ${isBoss ? '#ff4757' : (isUnlocked ? region.color : 'rgba(255,255,255,0.1)')};
        border-radius: 10px; padding: 9px 12px; display:flex; justify-content:space-between; align-items:center;
        opacity: ${isUnlocked ? '1' : '0.45'};
      ">
        <div>
          <div style="font-weight:900; font-size:0.88rem; color:${isBoss ? '#ff6b81' : '#fff'};">
            ${isBeaten ? '✅' : (isUnlocked ? '⚔️' : '🔒')} ${st.title}
          </div>
          <div style="font-size:0.72rem; color:#a4b0be;">
            👾 ${st.grunts + st.speedsters + st.tanks} Swarm ${isBoss ? `• 👹 Boss (${st.bossHp} HP)` : ''} • Reward: <b style="color:#ffd32a;">+${st.reward.toLocaleString()} 🪙</b>
          </div>
        </div>
        <button class="play-camp-stage-btn" data-num="${st.num}" ${isUnlocked ? '' : 'disabled'} style="
          padding: 7px 14px; border: none; border-radius: 8px; font-weight: 900; font-size: 0.78rem;
          cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
          background: ${isUnlocked ? (isBoss ? 'linear-gradient(135deg,#ff4757,#b33939)' : region.color) : 'rgba(255,255,255,0.08)'};
          color: ${isUnlocked && !isBoss ? '#07080c' : '#fff'};
        ">${isUnlocked ? 'Battle!' : 'Locked'}</button>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.play-camp-stage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = parseInt(btn.dataset.num);
      document.getElementById('campaign-modal').classList.add('hidden');
      startCampaignStage(num);
    });
  });
}
function startCampaignStage(stageNum) {
  const info = getStageConfigByNum(stageNum);
  if (!info) return;

  const { region, stage } = info;
  campaignState.activeStageNum = stageNum;

  if (typeof sfx !== 'undefined') {
    sfx.init();
    sfx.startMusic(stage.bossHp > 0);
  }

  if (typeof extraModes !== 'undefined') {
    extraModes.isEndless = false;
    extraModes.isPaused = false;
    clearInterval(extraModes.waveTimer);
  }
  if (typeof bossRushState !== 'undefined') bossRushState.active = false;
  if (typeof contractState !== 'undefined') contractState.active = false;
  if (typeof sandboxState !== 'undefined') sandboxState.active = false;

  startScreen.classList.add('hidden');
  victoryScreen.classList.add('hidden');
  milestoneToast.classList.remove('show');
  document.body.classList.remove('frozen');
  clearTimeout(freezeTimer);

  playField.innerHTML = '';
  monsters = [];
  totalClicks = 0;
  successfulHits = 0;
  combo = 1;
  maxCombo = 1;
  isFrozen = false;
  bossSpawned = stage.bossHp > 0;

  comboDisplay.textContent = 'x1';
  startTime = performance.now();
  lastFrameTime = startTime;
  isGameRunning = true;

  // Spawn Regional Swarm
  const diffCfg = {
    count: stage.grunts + stage.speedsters + stage.tanks,
    minSpeed: 1.7 * stage.speed,
    maxSpeed: 3.1 * stage.speed
  };

  for (let i = 0; i < stage.grunts; i++) spawnMonster(diffCfg, 'grunt');
  for (let i = 0; i < stage.speedsters; i++) spawnMonster(diffCfg, 'speedster');
  for (let i = 0; i < stage.tanks; i++) spawnMonster(diffCfg, 'tank');

  // Spawn Region Boss if this is Stage 5, 10, 15, 20, or 25
  if (stage.bossHp > 0) {
    const el = document.createElement('div');
    el.className = 'monster';
    el.style.width = '150px';
    el.style.height = '150px';
    el.style.filter = `drop-shadow(0 0 20px ${region.color})`;
    el.innerHTML = getMonsterSVG('boss')
      .replace('#ff6b81', region.color)
      .replace('#b33939', '#0f131f');

    const x = Math.random() * (window.innerWidth - 150);
    const y = 95 + Math.random() * (window.innerHeight - 245);
    const angle = Math.random() * Math.PI * 2;
    const spd = 3.6 * stage.speed;

    const bossObj = {
      el,
      type: 'boss',
      isCampaignBoss: true,
      hp: stage.bossHp,
      maxHp: stage.bossHp,
      size: 150,
      color: region.color,
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd
    };

    el.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      spawnClickRing(e.clientX, e.clientY);
      handleMonsterClick(bossObj, e.clientX, e.clientY);
    });

    playField.appendChild(el);
    monsters.push(bossObj);

    bossHud.classList.add('active');
    const labelSpan = bossHud.querySelector('.boss-label span');
    if (labelSpan) labelSpan.textContent = region.bossName;
    bossBarFill.style.width = '100%';
    bossHpText.textContent = `${stage.bossHp} / ${stage.bossHp}`;
  } else {
    bossHud.classList.remove('active');
  }

  activeCount = monsters.length;
  counterDisplay.textContent = activeCount;
  spawnFloatingText(window.innerWidth / 2, 135, `🗺️ ${stage.title.toUpperCase()}`, region.color);

  requestAnimationFrame(gameLoop);
}

// Update Campaign Boss HP Bar & Handle Stage Victory
const _campOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  _campOrigClick(monster, clickX, clickY);
  if (campaignState.activeStageNum && monster.isCampaignBoss && monster.hp > 0) {
    bossBarFill.style.width = `${(monster.hp / monster.maxHp) * 100}%`;
    bossHpText.textContent = `${monster.hp} / ${monster.maxHp}`;
  }
};

const _campOrigVictory = endGameVictory;
endGameVictory = function() {
  const stNum = campaignState.activeStageNum;
  _campOrigVictory();

  if (!stNum) return;
  campaignState.activeStageNum = null;

  const info = getStageConfigByNum(stNum);
  if (!info) return;

  const { region, stage } = info;
  if (typeof addCoinsAndXP === 'function') {
    addCoinsAndXP(stage.reward, Math.round(stage.reward * 0.4));
  }

  const isFirstClear = campaignState.unlockedStage === stNum;
  if (isFirstClear && stNum <= 25) {
    campaignState.unlockedStage = stNum + 1;
    saveCampaignProgress();
  }

  const titleEl = victoryScreen.querySelector('h2');
  if (titleEl) {
    titleEl.textContent = `${stage.title} Cleared!`;
    titleEl.style.color = region.color;
  }

  const badge = document.getElementById('new-record-badge');
  if (badge) {
    badge.style.display = 'block';
    badge.textContent = stage.bossHp > 0 && isFirstClear
      ? `👑 REGION CONQUERED! UNLOCKED: ${region.relicName} (+${stage.reward.toLocaleString()} 🪙)`
      : `🗺️ STAGE REWARD: +${stage.reward.toLocaleString()} COINS!`;
  }

  // Add/Update "Next Stage ➡️" quick button on Victory Screen
  let nextStageBtn = document.getElementById('camp-next-stage-btn');
  if (!nextStageBtn && victoryScreen.querySelector('.card')) {
    nextStageBtn = document.createElement('button');
    nextStageBtn.id = 'camp-next-stage-btn';
    nextStageBtn.className = 'action-btn';
    nextStageBtn.style.cssText = 'margin-bottom: 8px; background: linear-gradient(135deg, #2ed573, #1e90ff); color: #07080c;';
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) restartBtn.parentNode.insertBefore(nextStageBtn, restartBtn);
  }

  if (nextStageBtn) {
    if (stNum < 25) {
      nextStageBtn.style.display = 'block';
      nextStageBtn.textContent = `➡️ Next Campaign Stage (${stNum + 1}/25)`;
      nextStageBtn.onclick = () => startCampaignStage(stNum + 1);
    } else {
      nextStageBtn.style.display = 'none';
    }
  }
};

// Hide Next Campaign Stage button when playing non-campaign modes
const _campOrigStart = startGame;
startGame = function() {
  campaignState.activeStageNum = null;
  const nextBtn = document.getElementById('camp-next-stage-btn');
  if (nextBtn) nextBtn.style.display = 'none';
  _campOrigStart();
};

// --- Permanent Stat Bonuses from Conquered Region Mastery Rings ---
const _campRingOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  // Region 2 Ring (Stage 10 beaten): +2 Base Click DMG
  if (campaignState.unlockedStage > 10 && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 2);
  }
  // Region 5 Crown (Stage 25 beaten): +5 Base Click DMG
  if (campaignState.unlockedStage > 25 && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 5);
  }
  // Region 3 Ring (Stage 15 beaten): +20% Crit Chance
  if (campaignState.unlockedStage > 15 && Math.random() < 0.20 && monster.hp > 1) {
    monster.hp = Math.max(1, monster.hp - 3);
  }
  _campRingOrigClick(monster, clickX, clickY);
};

if (typeof addCoinsAndXP === 'function') {
  const _campRingOrigCoins = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    let mult = 1.0;
    if (campaignState.unlockedStage > 5) mult += 0.15;  // Region 1 Ring
    if (campaignState.unlockedStage > 25) mult += 0.50; // Region 5 Crown
    _campRingOrigCoins(Math.round(coinAmt * mult), xpAmt);
  };
}
