// --- Rare Prismatic Shiny & Radioactive Mutant Variants (1-in-35 Spawns!) ---
const shinyStats = JSON.parse(localStorage.getItem('monster_shiny_stats')) || {
  prismatic: 0,
  radioactive: 0
};

function saveShinyStats() {
  localStorage.setItem('monster_shiny_stats', JSON.stringify(shinyStats));
}

window.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes prismaticShimmer {
      0%   { filter: hue-rotate(0deg) drop-shadow(0 0 16px #ff9ff3) brightness(1.35); }
      50%  { filter: hue-rotate(180deg) drop-shadow(0 0 22px #00d2d3) brightness(1.45); }
      100% { filter: hue-rotate(360deg) drop-shadow(0 0 16px #ffd32a) brightness(1.35); }
    }
    .variant-prismatic {
      animation: prismaticShimmer 1.1s linear infinite !important;
    }
    .variant-radioactive {
      filter: drop-shadow(0 0 18px #39ff14) hue-rotate(85deg) saturate(2.5) !important;
    }
  `;
  document.head.appendChild(style);
});

// Scan newly spawned monsters reliably across all modes (1-in-35 Prismatic or Radioactive!)
setInterval(() => {
  if (!isGameRunning || typeof monsters === 'undefined') return;

  monsters.forEach(m => {
    if (m._shinyChecked || m.type === 'boss') return;
    m._shinyChecked = true;

    const roll = Math.random();
    if (roll < 0.028) {
      // 2.8% (~1 in 35): Prismatic Shiny!
      m.rareVariant = 'prismatic';
      m.hp += 1;
      m.maxHp += 1;
      m.el.classList.add('variant-prismatic');
      spawnFloatingText(m.x + m.size / 2, m.y - 10, '✨ SHINY SPAWN!', '#ff9ff3');
    } else if (roll < 0.056) {
      // 2.8% (~1 in 35): Radioactive Mutant!
      m.rareVariant = 'radioactive';
      m.hp += 1;
      m.maxHp += 1;
      m.el.classList.add('variant-radioactive');
      spawnFloatingText(m.x + m.size / 2, m.y - 10, '☢️ MUTANT SPAWN!', '#39ff14');
    }
  });
}, 250);

// Trigger Special Rewards & Toxic Chain-Explosions on Defeat
const _shinyOrigDefeat = defeatMonster;
defeatMonster = function(monster, clickX, clickY) {
  const variant = monster.rareVariant;
  _shinyOrigDefeat(monster, clickX, clickY);

  if (!variant) return;

  if (variant === 'prismatic') {
    shinyStats.prismatic++;
    saveShinyStats();
    if (typeof sfx !== 'undefined') sfx.victory();
    spawnParticles(clickX, clickY, '#ff9ff3', 35);
    spawnFloatingText(clickX, clickY - 22, '✨ PRISMATIC SHINY (+250 🪙 & +25⚡)!', '#ffd32a');

    if (typeof shopState !== 'undefined') {
      shopState.coins += 250;
      saveShopData();
    }
    if (typeof addEnergy === 'function') {
      addEnergy(25);
    }
  } else if (variant === 'radioactive') {
    shinyStats.radioactive++;
    saveShinyStats();
    if (typeof sfx !== 'undefined') sfx.bomb();
    triggerScreenShake();
    spawnParticles(clickX, clickY, '#39ff14', 35);
    spawnFloatingText(clickX, clickY - 22, '☢️ TOXIC NOVA!', '#39ff14');

    // Damage & slow all monsters within 165px
    [...monsters].forEach(other => {
      const ox = other.x + other.size / 2;
      const oy = other.y + other.size / 2;
      if (Math.hypot(ox - clickX, oy - clickY) <= 165) {
        other.vx *= 0.6;
        other.vy *= 0.6;
        handleMonsterClick(other, ox, oy);
      }
    });
  }
};

// Inject Shiny Discovery Counter at the top of the Monster Bestiary Modal
if (typeof renderBestiaryModal === 'function') {
  const _shinyOrigDex = renderBestiaryModal;
  renderBestiaryModal = function() {
    _shinyOrigDex();
    const listEl = document.getElementById('dex-list');
    if (!listEl) return;

    const banner = document.createElement('div');
    banner.style.cssText = `
      background: linear-gradient(135deg, rgba(255,159,243,0.16), rgba(57,255,20,0.14));
      border: 1px solid #ff9ff3; border-radius: 10px; padding: 9px 12px;
      display: flex; justify-content: space-around; font-weight: 900; font-size: 0.82rem;
    `;
    banner.innerHTML = `
      <span style="color:#ff9ff3;">✨ Prismatic Shinies Found: ${shinyStats.prismatic}</span>
      <span style="color:#39ff14;">☢️ Radioactive Mutants: ${shinyStats.radioactive}</span>
    `;
    listEl.insertBefore(banner, listEl.firstChild);
  };
}
