// --- Custom Visual Themes (Arcade Neon, Haunted Graveyard, Deep Space) ---
const THEMES = {
  neon: {
    name: '🕹️ Arcade Neon',
    bgDark: '#07080c',
    glow: 'rgba(255, 71, 87, 0.09)',
    grid: 'rgba(255, 255, 255, 0.025)',
    accentRed: '#ff4757',
    accentGreen: '#2ed573',
    accentGold: '#ffa502',
    grunt: '#ff4757',
    speedster: '#a55eea',
    tank: '#2ed573',
    bossLight: '#ff6b81',
    bossDark: '#b33939'
  },
  graveyard: {
    name: '🪦 Graveyard',
    bgDark: '#0b0e0b',
    glow: 'rgba(46, 213, 115, 0.12)',
    grid: 'rgba(123, 237, 159, 0.035)',
    accentRed: '#ff7f50',
    accentGreen: '#7bed9f',
    accentGold: '#eccc68',
    grunt: '#dfe4ea',     // Ghostly white
    speedster: '#ff7f50', // Jack-o'-lantern orange
    tank: '#2ed573',      // Toxic zombie green
    bossLight: '#a4b0be',
    bossDark: '#2f3542'
  },
  space: {
    name: '🚀 Deep Space',
    bgDark: '#040510',
    glow: 'rgba(55, 66, 250, 0.16)',
    grid: 'rgba(112, 161, 255, 0.04)',
    accentRed: '#ff6b81',
    accentGreen: '#1e90ff',
    accentGold: '#70a1ff',
    grunt: '#ff6b81',     // Nebula pink
    speedster: '#1e90ff', // Hyperdrive blue
    tank: '#eccc68',      // Asteroid gold
    bossLight: '#5352ed',
    bossDark: '#192a56'
  }
};

let currentTheme = localStorage.getItem('monster_theme') || 'neon';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Theme Switcher Buttons onto the Start Screen
  const startCard = document.querySelector('#start-screen .card');
  const startBtn = document.getElementById('start-btn');

  if (startCard && startBtn) {
    const themeGroup = document.createElement('div');
    themeGroup.className = 'difficulty-group';
    themeGroup.style.marginBottom = '18px';
    themeGroup.innerHTML = `
      <button class="theme-btn diff-btn" data-theme="neon">🕹️<br><small>Neon</small></button>
      <button class="theme-btn diff-btn" data-theme="graveyard">🪦<br><small>Graveyard</small></button>
      <button class="theme-btn diff-btn" data-theme="space">🚀<br><small>Space</small></button>
    `;
    startCard.insertBefore(themeGroup, startBtn);

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
      });
    });
  }

  // Apply saved or default theme immediately
  applyTheme(currentTheme);
});

function applyTheme(themeKey) {
  const t = THEMES[themeKey] || THEMES.neon;
  currentTheme = themeKey;
  localStorage.setItem('monster_theme', themeKey);

  // Update active button styling
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeKey);
  });

  // Swap CSS variables & dynamic background grid
  const root = document.documentElement;
  root.style.setProperty('--bg-dark', t.bgDark);
  root.style.setProperty('--accent-red', t.accentRed);
  root.style.setProperty('--accent-green', t.accentGreen);
  root.style.setProperty('--accent-gold', t.accentGold);

  document.body.style.backgroundColor = t.bgDark;
  document.body.style.backgroundImage = `
    radial-gradient(circle at 50% 50%, ${t.glow} 0%, transparent 75%),
    linear-gradient(${t.grid} 1px, transparent 1px),
    linear-gradient(90deg, ${t.grid} 1px, transparent 1px)
  `;
}

// 2. Override Monster SVGs dynamically to match the selected theme
const _origGetMonsterSVG = getMonsterSVG;
getMonsterSVG = function(type) {
  const t = THEMES[currentTheme] || THEMES.neon;
  let svg = _origGetMonsterSVG(type);

  if (type === 'grunt') {
    svg = svg.replace('#ff4757', t.grunt);
  } else if (type === 'speedster') {
    svg = svg.replace('#a55eea', t.speedster);
  } else if (type === 'tank') {
    svg = svg.replace('#2ed573', t.tank);
  } else if (type === 'boss') {
    svg = svg.replace('#ff6b81', t.bossLight).replace('#b33939', t.bossDark);
  }
  return svg;
};
