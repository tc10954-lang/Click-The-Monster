// --- Daily Bounties (Date-Seeded) & Free Daily Lucky Spin Wheel ---
const BOUNTY_POOL = [
  { id: 'kill_50',     type: 'kills',     goal: 50,  title: 'Swarm Exterminator', desc: 'Eliminate 50 monsters today',          coins: 350, xp: 120 },
  { id: 'kill_120',    type: 'kills',     goal: 120, title: 'Relentless Hunter',  desc: 'Eliminate 120 monsters today',         coins: 750, xp: 250 },
  { id: 'combo_20',    type: 'max_combo', goal: 20,  title: 'Precision Streak',   desc: 'Hit a x20 combo in any run',           coins: 400, xp: 140 },
  { id: 'combo_35',    type: 'max_combo', goal: 35,  title: 'Unstoppable Flow',   desc: 'Hit a x35 combo in any run',           coins: 800, xp: 260 },
  { id: 'boss_2',      type: 'bosses',    goal: 2,   title: 'Regicide',           desc: 'Defeat 2 Bosses today',                coins: 600, xp: 200 },
  { id: 'goblin_2',    type: 'goblins',   goal: 2,   title: 'Treasure Tracker',   desc: 'Catch 2 Loot Goblins today',           coins: 550, xp: 180 },
  { id: 'win_2',       type: 'wins',      goal: 2,   title: 'Double Victory',     desc: 'Complete 2 hunts today',               coins: 500, xp: 160 },
  { id: 'mutator_win', type: 'mut_wins',  goal: 1,   title: 'Chaos Conqueror',    desc: 'Win a hunt with a Chaos Mutator ON',   coins: 700, xp: 220 }
];

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDailyBountiesForToday() {
  const dateStr = getTodayKey();
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) % 100000;
  }

  const picked = [];
  const poolCopy = [...BOUNTY_POOL];
  for (let i = 0; i < 3; i++) {
    const idx = (seed + i * 7) % poolCopy.length;
    picked.push(poolCopy.splice(idx, 1).at(0));
  }
  return picked;
}

function loadBountyState() {
  const today = getTodayKey();
  const saved = JSON.parse(localStorage.getItem('monster_daily_bounties') || 'null');
  if (saved && saved.date === today) return saved;

  const fresh = {
    date: today,
    progress: { kills: 0, max_combo: 0, bosses: 0, goblins: 0, wins: 0, mut_wins: 0 },
    claimed: [],
    spunToday: false
  };
  localStorage.setItem('monster_daily_bounties', JSON.stringify(fresh));
  return fresh;
}

let dailyState = loadBountyState();

function saveDailyState() {
  localStorage.setItem('monster_daily_bounties', JSON.stringify(dailyState));
  updateDailyBadge();
}

function recordDailyProgress(metric, amount = 1, isHighWaterMark = false) {
  dailyState = loadBountyState();
  if (isHighWaterMark) {
    dailyState.progress[metric] = Math.max(dailyState.progress[metric] || 0, amount);
  } else {
    dailyState.progress[metric] = (dailyState.progress[metric] || 0) + amount;
  }
  saveDailyState();
}

function updateDailyBadge() {
  const btn = document.getElementById('open-daily-btn');
  if (!btn) return;
  const todays = getDailyBountiesForToday();
  const readyCount = todays.filter(b =>
    (dailyState.progress[b.type] || 0) >= b.goal && !dailyState.claimed.includes(b.id)
  ).length + (dailyState.spunToday ? 0 : 1);

  btn.innerHTML = readyCount > 0
    ? `📅 Daily Quests <span style="background:#ff4757; color:#fff; padding:1px 6px; border-radius:50px; font-size:0.75rem;">${readyCount}!</span>`
    : `📅 Daily Quests`;
}
window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "📅 Daily Quests" Button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const dailyBtn = document.createElement('button');
    dailyBtn.id = 'open-daily-btn';
    dailyBtn.className = 'action-btn';
    dailyBtn.style.cssText = 'background: linear-gradient(135deg, #2ed573, #009432); color: #07080c;';
    dailyBtn.addEventListener('click', () => {
      dailyState = loadBountyState();
      renderDailyModal();
      document.getElementById('daily-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(dailyBtn);
    } else {
      startCard.appendChild(dailyBtn);
    }
    updateDailyBadge();
  }

  // 2. Build Daily Bounties & Lucky Spin Modal
  const modal = document.createElement('div');
  modal.id = 'daily-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '138';
  modal.innerHTML = `
    <div class="card" style="max-width: 560px; max-height: 90vh; overflow-y: auto;">
      <h2 style="color: #2ed573; margin: 0 0 4px 0; font-size: 1.8rem;">📅 Daily Bounties & Spin</h2>
      <p class="subtitle" style="margin-bottom: 12px;">Refreshes every day at midnight (<span id="daily-date-label"></span>)</p>

      <div style="background: linear-gradient(135deg, rgba(255,211,42,0.16), rgba(255,159,67,0.16)); border: 2px solid #ffd32a; border-radius: 12px; padding: 12px; margin-bottom: 14px;">
        <div style="font-weight: 900; font-size: 1rem; color: #ffd32a; margin-bottom: 4px;">🎰 Free Daily Lucky Spin</div>
        <div id="spin-result-text" style="font-size: 0.82rem; color: #fff; margin-bottom: 8px;">Spin once per day for bonus Coins & XP!</div>
        <button id="daily-spin-btn" style="width: 100%; padding: 10px; border: none; border-radius: 8px; font-weight: 900; font-size: 0.95rem; cursor: pointer;">
          🎡 Spin Wheel Now!
        </button>
      </div>

      <div id="daily-bounties-list" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; text-align: left;"></div>

      <button class="action-btn" id="close-daily-btn" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-daily-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('daily-spin-btn').addEventListener('click', spinDailyWheel);
});

function renderDailyModal() {
  document.getElementById('daily-date-label').textContent = getTodayKey();

  const spinBtn = document.getElementById('daily-spin-btn');
  if (dailyState.spunToday) {
    spinBtn.disabled = true;
    spinBtn.style.background = 'rgba(255,255,255,0.1)';
    spinBtn.style.color = '#747d8c';
    spinBtn.style.cursor = 'not-allowed';
    spinBtn.textContent = '✅ Come Back Tomorrow for Next Spin!';
  } else {
    spinBtn.disabled = false;
    spinBtn.style.background = 'linear-gradient(135deg, #ffd32a, #ffa502)';
    spinBtn.style.color = '#07080c';
    spinBtn.style.cursor = 'pointer';
    spinBtn.textContent = '🎡 Spin Wheel Now!';
  }

  const listEl = document.getElementById('daily-bounties-list');
  const todays = getDailyBountiesForToday();

  listEl.innerHTML = todays.map(b => {
    const cur = Math.min(b.goal, dailyState.progress[b.type] || 0);
    const done = cur >= b.goal;
    const claimed = dailyState.claimed.includes(b.id);
    const pct = Math.round((cur / b.goal) * 100);

    return `
      <div style="background: rgba(255,255,255,0.05); border: 1px solid ${done ? '#2ed573' : 'rgba(255,255,255,0.12)'}; border-radius: 10px; padding: 10px 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
          <span style="font-weight: 900; font-size: 0.92rem; color: #fff;">${b.title}</span>
          <span style="font-size: 0.78rem; font-weight: 800; color: #ffd32a;">+${b.coins} 🪙 • +${b.xp} XP</span>
        </div>
        <div style="font-size: 0.76rem; color: #a4b0be; margin-bottom: 6px;">${b.desc} (${cur}/${b.goal})</div>
        <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
          <div style="width: ${pct}%; height: 100%; background: #2ed573;"></div>
        </div>
        <button class="claim-bounty-btn" data-id="${b.id}" ${done && !claimed ? '' : 'disabled'} style="
          width: 100%; padding: 6px; border: none; border-radius: 6px; font-weight: 900; font-size: 0.8rem;
          cursor: ${done && !claimed ? 'pointer' : 'not-allowed'};
          background: ${claimed ? 'rgba(255,255,255,0.08)' : (done ? '#2ed573' : 'rgba(255,255,255,0.08)')};
          color: ${claimed ? '#2ed573' : (done ? '#07080c' : '#747d8c')};
        ">${claimed ? '✅ CLAIMED' : (done ? '🎁 Claim Reward' : 'In Progress...')}</button>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.claim-bounty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const b = todays.find(item => item.id === btn.dataset.id);
      if (!b || dailyState.claimed.includes(b.id)) return;
      dailyState.claimed.push(b.id);
      saveDailyState();
      if (typeof addCoinsAndXP === 'function') addCoinsAndXP(b.coins, b.xp);
      if (typeof sfx !== 'undefined') sfx.powerup();
      renderDailyModal();
    });
  });
}

function spinDailyWheel() {
  if (dailyState.spunToday) return;
  const prizes = [
    { label: '🪙 +250 Coins!', coins: 250, xp: 50 },
    { label: '🪙 +500 Coins!', coins: 500, xp: 100 },
    { label: '⚡ +1,000 Coins & 200 XP!', coins: 1000, xp: 200 },
    { label: '💎 MEGA JACKPOT: +2,500 Coins!', coins: 2500, xp: 400 }
  ];
  const roll = Math.random();
  const prizeIdx = roll < 0.45 ? 0 : (roll < 0.80 ? 1 : (roll < 0.95 ? 2 : 3));
  const prize = prizes.at(prizeIdx);

  dailyState.spunToday = true;
  saveDailyState();

  if (typeof addCoinsAndXP === 'function') addCoinsAndXP(prize.coins, prize.xp);
  if (typeof sfx !== 'undefined') sfx.victory();

  document.getElementById('spin-result-text').innerHTML = `<b style="color:#2ed573; font-size:0.95rem;">🎉 WON: ${prize.label}</b>`;
  renderDailyModal();
}

// --- Gameplay Hooks to Track Daily Progress ---
const _bountyOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  _bountyOrigDefeat(monster, clickX, clickY);
  recordDailyProgress('kills', 1);
  recordDailyProgress('max_combo', combo, true);
  if (monster.type === 'boss') recordDailyProgress('bosses', 1);
};

const _bountyOrigVictory = endGameVictory;
endGameVictory = function() {
  _bountyOrigVictory();
  recordDailyProgress('wins', 1);
  if (typeof activeMutators !== 'undefined' && Object.values(activeMutators).some(Boolean)) {
    recordDailyProgress('mut_wins', 1);
  }
};

const _bountyOrigFloat = spawnFloatingText;
spawnFloatingText = function(x, y, text, color) {
  _bountyOrigFloat(x, y, text, color);
  if (typeof text === 'string' && (text.includes('-2.0s') || text.includes('-4.0s'))) {
    recordDailyProgress('goblins', 1);
  }
};
