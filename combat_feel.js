// --- Arcade & RPG Juice Engine (Damage Numbers, Kill-Streak Announcer & Hit-Markers) ---
window.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Kill-Streak Announcer Banner ("DOUBLE KILL!", "RAMPAGE!", "UNSTOPPABLE!", "GODLIKE!")
  const style = document.createElement('style');
  style.textContent = `
    #announcer-banner {
      position: fixed; top: 112px; left: 50%; transform: translateX(-50%) scale(0.8);
      font-size: 1.55rem; font-weight: 900; letter-spacing: 2px;
      text-transform: uppercase; pointer-events: none; z-index: 48;
      opacity: 0; transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-shadow: 0 4px 18px rgba(0,0,0,0.9);
    }
    #announcer-banner.show {
      opacity: 1;
      transform: translateX(-50%) scale(1.08);
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.id = 'announcer-banner';
  document.body.appendChild(banner);
});

let announcerTimeout = null;
function triggerAnnouncer(text, color) {
  const banner = document.getElementById('announcer-banner');
  if (!banner) return;
  banner.textContent = text;
  banner.style.color = color;
  banner.classList.add('show');
  clearTimeout(announcerTimeout);
  announcerTimeout = setTimeout(() => {
    banner.classList.remove('show');
  }, 1150);
}

// 1. Floating RPG Damage Numbers + Crit Sparks
const _feelOrigClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  const hpBefore = monster.hp;
  _feelOrigClick(monster, clickX, clickY);
  const dmgDealt = Math.max(1, hpBefore - Math.max(0, monster.hp));

  const offsetX = clickX + (Math.random() - 0.5) * 32;
  const offsetY = clickY - 14;

  if (dmgDealt >= 6) {
    spawnFloatingText(offsetX, offsetY, `-${dmgDealt}💥`, '#ff4757');
    spawnParticles(clickX, clickY, '#ffd32a', 6);
  } else if (dmgDealt >= 2) {
    spawnFloatingText(offsetX, offsetY, `-${dmgDealt}!`, '#ffd32a');
  } else {
    spawnFloatingText(offsetX, offsetY, `-1`, '#ffffff');
  }
};

// 2. Kill-Streak Announcer Milestones on Defeat
const _feelOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  _feelOrigDefeat(monster, clickX, clickY);
  if (!isGameRunning) return;

  if (monster.type === 'boss') {
    triggerAnnouncer('👑 BOSS VANQUISHED!', '#ffd32a');
    return;
  }

  if (combo === 10)  triggerAnnouncer('🔥 KILLING SPREE (x10)!', '#ffa502');
  if (combo === 25)  triggerAnnouncer('⚡ RAMPAGE (x25)!', '#00d2d3');
  if (combo === 40)  triggerAnnouncer('💀 UNSTOPPABLE (x40)!', '#ff4757');
  if (combo === 65)  triggerAnnouncer('🌌 MONSTER SLAYER (x65)!', '#a55eea');
  if (combo === 100) triggerAnnouncer('👑 GODLIKE (x100)!!', '#ffd32a');
};
