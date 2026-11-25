// --- Smart Start Menu Sorter (Organizes Modes & RPG Buttons by Importance) ---
function organizeStartMenu() {
  const startCard = document.querySelector('#start-screen .card');
  const startBtn = document.getElementById('start-btn');
  const extrasGrid = document.getElementById('menu-extras-grid');
  if (!startCard || !startBtn || !extrasGrid) return;

  // Gather every button inside the card below STANDARD HUNT
  const allButtons = Array.from(startCard.querySelectorAll('button')).filter(btn => {
    const txt = btn.textContent.toUpperCase();
    // Ignore difficulty buttons, theme buttons, mutator toggles, class buttons, fullscreen, and STANDARD HUNT itself
    if (btn === startBtn) return false;
    if (btn.classList.contains('diff-btn') || btn.classList.contains('theme-btn')) return false;
    if (btn.classList.contains('inline-mut-btn') || btn.classList.contains('pick-class-btn')) return false;
    if (btn.id === 'fullscreen-btn') return false;
    return txt.length > 0;
  });

  // 1. Pull primary Game Modes out of the grid and stack them right under STANDARD HUNT
  const modeKeywords = ['WORLD MAP', 'ENDLESS WAVE', 'BOSS RUSH'];
  const modeButtons = [];

  modeKeywords.forEach(kw => {
    const found = allButtons.find(b => b.textContent.toUpperCase().includes(kw));
    if (found) modeButtons.push(found);
  });

  let insertAnchor = startBtn;
  modeButtons.forEach(btn => {
    btn.style.width = '100%';
    btn.style.marginTop = '8px';
    btn.style.marginBottom = '0';
    insertAnchor.insertAdjacentElement('afterend', btn);
    insertAnchor = btn;
  });

  // 2. Priority ranking for all remaining Feature / RPG Menu buttons (lowest index = highest importance!)
  const PRIORITY_ORDER = [
    'GEAR & FORGE',       // #1 Inventory & Equipment
    'ARMORY SHOP',        // #2 Core Upgrades
    'ALCHEMIST LAB',      // #3 Potions
    'DAILY QUESTS',       // #4 Daily Bounties & Spin
    'SKILL TREE',         // #5 Ascension Skill Tree (if present)
    'CAREER STATS',       // #6 Rebirths & Prestige
    'ENDGAME VAULT',      // #7 Crates, Pets, Evolutions & Relics
    'MERCENARY GUILD',    // #8 Offline Idle Income
    'MYTHIC CONTRACTS',   // #9 Endgame Counter-Attack Bosses
    'ACHIEVEMENTS',       // #10 Trophy Room
    'MONSTER DEX',        // #11 Bestiary & Shinies
    'CROSSHAIR ARMORY',   // #12 Cosmetics
    'TOP 10 BOARD',       // #13 Leaderboard
    'LEVEL & RAID SANDBOX'// #14 Sandbox Creator
  ];

  const gridButtons = allButtons.filter(b => !modeButtons.includes(b));

  gridButtons.sort((a, b) => {
    const txtA = a.textContent.toUpperCase();
    const txtB = b.textContent.toUpperCase();
    const idxA = PRIORITY_ORDER.findIndex(kw => txtA.includes(kw));
    const idxB = PRIORITY_ORDER.findIndex(kw => txtB.includes(kw));
    const rankA = idxA === -1 ? 999 : idxA;
    const rankB = idxB === -1 ? 999 : idxB;
    return rankA - rankB;
  });

  // Re-append into extrasGrid in exact priority order
  extrasGrid.style.marginTop = '12px';
  gridButtons.forEach(btn => {
    btn.style.width = '100%';
    btn.style.marginTop = '0';
    extrasGrid.appendChild(btn);
  });
}

// Run immediately after all DOMContentLoaded scripts have injected their buttons
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(organizeStartMenu, 60);
  setTimeout(organizeStartMenu, 350);
});
