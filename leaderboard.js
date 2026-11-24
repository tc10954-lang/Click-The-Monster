// --- Local Top 10 Arcade Leaderboard with AI Rivals & 3-Letter Initials ---
const AI_RIVALS_BASE = {
  easy: [
    { name: 'REX', time: 11.40, isAI: true },
    { name: 'NOVA', time: 13.85, isAI: true },
    { name: 'ZED', time: 16.20, isAI: true },
    { name: 'KAI', time: 18.90, isAI: true },
    { name: 'PIX', time: 21.50, isAI: true },
    { name: 'LUX', time: 24.80, isAI: true },
    { name: 'JAX', time: 28.10, isAI: true },
    { name: 'BOT', time: 33.00, isAI: true }
  ],
  normal: [
    { name: 'REX', time: 15.20, isAI: true },
    { name: 'NOVA', time: 18.40, isAI: true },
    { name: 'ZED', time: 21.75, isAI: true },
    { name: 'KAI', time: 25.10, isAI: true },
    { name: 'PIX', time: 28.90, isAI: true },
    { name: 'LUX', time: 32.60, isAI: true },
    { name: 'JAX', time: 37.20, isAI: true },
    { name: 'BOT', time: 42.50, isAI: true }
  ],
  insane: [
    { name: 'REX', time: 20.50, isAI: true },
    { name: 'NOVA', time: 24.30, isAI: true },
    { name: 'ZED', time: 28.80, isAI: true },
    { name: 'KAI', time: 33.40, isAI: true },
    { name: 'PIX', time: 38.90, isAI: true },
    { name: 'LUX', time: 44.10, isAI: true },
    { name: 'JAX', time: 49.50, isAI: true },
    { name: 'BOT', time: 55.00, isAI: true }
  ],
  nightmare: [
    { name: 'REX', time: 26.80, isAI: true },
    { name: 'NOVA', time: 31.50, isAI: true },
    { name: 'ZED', time: 36.90, isAI: true },
    { name: 'KAI', time: 42.20, isAI: true },
    { name: 'PIX', time: 48.00, isAI: true },
    { name: 'LUX', time: 54.40, isAI: true },
    { name: 'JAX', time: 61.00, isAI: true },
    { name: 'BOT', time: 68.50, isAI: true }
  ],
  hellfire: [
    { name: 'REX', time: 34.50, isAI: true },
    { name: 'NOVA', time: 41.20, isAI: true },
    { name: 'ZED', time: 48.60, isAI: true },
    { name: 'KAI', time: 55.90, isAI: true },
    { name: 'PIX', time: 63.40, isAI: true },
    { name: 'LUX', time: 71.00, isAI: true },
    { name: 'JAX', time: 79.50, isAI: true },
    { name: 'BOT', time: 88.00, isAI: true }
  ]
};

let savedTag = localStorage.getItem('monster_player_tag') || 'YOU';
let viewBoardDiff = 'normal';

function getLeaderboard(diff) {
  const key = `monster_top10_${diff}`;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);

  const initial = [...(AI_RIVALS_BASE[diff] || AI_RIVALS_BASE.normal)];
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

function saveLeaderboardScore(diff, name, timeVal) {
  const cleanName = (name || 'YOU').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'YOU';
  savedTag = cleanName;
  localStorage.setItem('monster_player_tag', cleanName);

  const board = getLeaderboard(diff);
  board.push({ name: cleanName, time: parseFloat(timeVal.toFixed(2)), isAI: false });
  board.sort((a, b) => a.time - b.time);
  const top10 = board.slice(0, 10);

  localStorage.setItem(`monster_top10_${diff}`, JSON.stringify(top10));
  return top10;
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add "🏅 Top 10 Board" Button to Start Screen
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const lbBtn = document.createElement('button');
    lbBtn.className = 'action-btn';
    lbBtn.innerHTML = '🏅 Top 10 Board';
    lbBtn.style.cssText = 'margin-top: 10px; background: linear-gradient(135deg, #ff9f43, #ee5253); color: #fff; font-size: 0.92rem; padding: 10px;';
    lbBtn.addEventListener('click', () => {
      viewBoardDiff = currentDiff || 'normal';
      renderLeaderboardModal();
      document.getElementById('lb-modal').classList.remove('hidden');
    });

    const extrasGrid = document.getElementById('menu-extras-grid');
    if (extrasGrid) {
      extrasGrid.appendChild(lbBtn);
    } else {
      startCard.appendChild(lbBtn);
    }
  }

  // 2. Build Top 10 Leaderboard Modal
  const lbModal = document.createElement('div');
  lbModal.id = 'lb-modal';
  lbModal.className = 'screen-overlay hidden';
  lbModal.style.zIndex = '129';
  lbModal.innerHTML = `
    <div class="card" style="max-width: 520px; max-height: 90vh; display: flex; flex-direction: column;">
      <h2 style="color: #ff9f43; margin: 0 0 6px 0; font-size: 1.8rem;">🏅 Top 10 Arcade Board</h2>
      <p class="subtitle" style="margin-bottom: 12px;">Beat AI Rivals to claim the #1 spot on every difficulty!</p>

      <div id="lb-diff-tabs" style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
        <button class="lb-tab diff-btn" data-d="easy" style="padding: 6px; font-size: 0.78rem;">Easy</button>
        <button class="lb-tab diff-btn" data-d="normal" style="padding: 6px; font-size: 0.78rem;">Normal</button>
        <button class="lb-tab diff-btn" data-d="insane" style="padding: 6px; font-size: 0.78rem;">Insane</button>
        <button class="lb-tab diff-btn" data-d="nightmare" style="padding: 6px; font-size: 0.78rem;">💀 Nightmare</button>
        <button class="lb-tab diff-btn" data-d="hellfire" style="padding: 6px; font-size: 0.78rem;">🔥 Hellfire</button>
      </div>

      <div id="lb-rows" style="overflow-y: auto; flex: 1; margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px;"></div>

      <button class="action-btn" id="close-lb-btn" style="background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;">Close</button>
    </div>
  `;
  document.body.appendChild(lbModal);

  lbModal.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      viewBoardDiff = tab.dataset.d;
      renderLeaderboardModal();
    });
  });

  document.getElementById('close-lb-btn').addEventListener('click', () => {
    lbModal.classList.add('hidden');
  });

  // 3. Inject 3-Letter Initials Entry Box onto Victory Screen
  const victoryCard = document.querySelector('#victory-screen .card');
  const statsGrid = document.querySelector('#victory-screen .stats-grid');
  if (victoryCard && statsGrid) {
    const entryBox = document.createElement('div');
    entryBox.id = 'lb-entry-box';
    entryBox.style.cssText = `
      display: none; background: rgba(255, 159, 67, 0.14); border: 2px solid #ff9f43;
      border-radius: 12px; padding: 10px 14px; margin-bottom: 14px;
    `;
    entryBox.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 900; color: #ff9f43; margin-bottom: 6px;">
        🎉 TOP 10 RANK ACHIEVED! ENTER INITIALS:
      </div>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <input id="lb-tag-input" type="text" maxlength="3" value="${savedTag}" style="
          width: 90px; text-align: center; font-size: 1.2rem; font-weight: 900;
          text-transform: uppercase; letter-spacing: 3px; border-radius: 8px;
          border: 2px solid #fff; background: #07080c; color: #ffd32a; padding: 6px;
        "/>
        <button id="lb-save-tag-btn" style="
          background: #2ed573; color: #07080c; border: none; border-radius: 8px;
          padding: 6px 16px; font-weight: 900; cursor: pointer; font-size: 0.9rem;
        ">Save Rank</button>
      </div>
    `;
    statsGrid.insertAdjacentElement('afterend', entryBox);
  }
});

function renderLeaderboardModal() {
  const rowsEl = document.getElementById('lb-rows');
  if (!rowsEl) return;

  document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.d === viewBoardDiff);
  });

  const board = getLeaderboard(viewBoardDiff);
  const medals = ['🥇', '🥈', '🥉'];

  rowsEl.innerHTML = board.map((entry, idx) => {
    const rankIcon = medals[idx] || `#${idx + 1}`;
    const isPlayer = !entry.isAI;
    return `
      <div style="
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 14px; border-radius: 10px;
        background: ${isPlayer ? 'rgba(46, 213, 115, 0.16)' : 'rgba(255, 255, 255, 0.04)'};
        border: 1px solid ${isPlayer ? '#2ed573' : 'rgba(255, 255, 255, 0.08)'};
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: 900; width: 28px; text-align: left; color: ${idx < 3 ? '#ffd32a' : '#a4b0be'};">${rankIcon}</span>
          <span style="font-weight: 900; letter-spacing: 2px; color: ${isPlayer ? '#2ed573' : '#fff'};">${entry.name}</span>
          <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: #a4b0be;">
            ${isPlayer ? 'PLAYER' : 'AI RIVAL'}
          </span>
        </div>
        <div style="font-weight: 900; font-variant-numeric: tabular-nums; color: ${isPlayer ? '#2ed573' : '#ff9f43'};">
          ${entry.time.toFixed(2)}s
        </div>
      </div>
    `;
  }).join('');
}

// --- Hook Victory Screen to Check Top 10 Qualification ---
const _lbOrigVictory = endGameVictory;
endGameVictory = function() {
  _lbOrigVictory();

  const finalSeconds = (performance.now() - startTime) / 1000;
  const board = getLeaderboard(currentDiff);
  const tenthPlaceTime = board.length >= 10 ? board[board.length - 1].time : Infinity;

  const entryBox = document.getElementById('lb-entry-box');
  const tagInput = document.getElementById('lb-tag-input');
  const saveBtn = document.getElementById('lb-save-tag-btn');

  if (entryBox && finalSeconds < tenthPlaceTime) {
    entryBox.style.display = 'block';
    tagInput.value = savedTag;
    saveBtn.textContent = 'Save Rank';
    saveBtn.disabled = false;

    saveBtn.onclick = () => {
      saveLeaderboardScore(currentDiff, tagInput.value, finalSeconds);
      saveBtn.textContent = '✅ Saved!';
      saveBtn.disabled = true;
      if (typeof sfx !== 'undefined') sfx.powerup();
    };
  } else if (entryBox) {
    entryBox.style.display = 'none';
  }
};
