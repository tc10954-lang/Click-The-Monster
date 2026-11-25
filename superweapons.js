// --- Super-Weapons Arsenal ([4], [5], [6] Unlockables) ---
const superWeaponsState = {
  unlocked: JSON.parse(localStorage.getItem('monster_super_weapons')) || []
};

const SUPER_WEAPONS = [
  { id: 'boomerang', key: '4', icon: '🪃', name: 'Boomerang', cost: 2500, energy: 35, desc: 'Pierces through enemies & curves back to cursor' },
  { id: 'turret',    key: '5', icon: '🗼', name: 'Turret',    cost: 4500, energy: 50, desc: 'Deploys an auto-firing laser turret for 10s' },
  { id: 'beam',      key: '6', icon: '☄️', name: 'Beam',      cost: 8000, energy: 80, desc: 'Fires a screen-wide annihilation beam' }
];

function saveSuperWeapons() {
  localStorage.setItem('monster_super_weapons', JSON.stringify(superWeaponsState.unlocked));
}

function isSuperWeaponUnlocked(id) {
  return superWeaponsState.unlocked.includes(id);
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Copy the exact button styling from [1] Blaster so [4], [5], [6] match 100%
  const weaponBar = document.getElementById('weapon-bar');
  const blasterBtn = document.getElementById('wp-blaster');

  if (weaponBar) {
    SUPER_WEAPONS.forEach(sw => {
      const btn = document.createElement('button');
      btn.id = `wp-${sw.id}`;
      btn.className = blasterBtn ? blasterBtn.className : 'wp-btn';
      btn.style.cssText = `
        display: ${isSuperWeaponUnlocked(sw.id) ? 'inline-flex' : 'none'};
        flex-direction: column; align-items: center; justify-content: center;
        background: rgba(15, 18, 28, 0.92); color: #fff;
        border: 1.5px solid rgba(255, 255, 255, 0.18); border-radius: 10px;
        padding: 6px 10px; font-weight: 800; font-size: 0.78rem; cursor: pointer;
      `;
      btn.innerHTML = `<span>[${sw.key}] ${sw.icon}</span><span>${sw.name}</span><small style="color:#ffd32a;">(${sw.energy}⚡)</small>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof selectWeapon === 'function') selectWeapon(sw.id);
      });
      weaponBar.appendChild(btn);
    });
  }

  // Lift the Potion Belt ([Q] [E] [R]) above the wider 6-weapon dock
  const potionBelt = document.getElementById('live-potion-belt');
  if (potionBelt) {
    potionBelt.style.bottom = '86px';
  }

  // 2. Add Super-Weapon Unlock Cards inside the Armory Shop Modal
  const shopGrid = document.getElementById('shop-items-grid');
  if (shopGrid) {
    const swSection = document.createElement('div');
    swSection.id = 'shop-superweapons-section';
    swSection.style.cssText = 'grid-column: 1 / -1; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 10px;';
    shopGrid.parentNode.insertBefore(swSection, shopGrid.nextSibling);
    renderSuperWeaponsInShop();
  }
});

function renderSuperWeaponsInShop() {
  const sec = document.getElementById('shop-superweapons-section');
  if (!sec || typeof shopState === 'undefined') return;

  sec.innerHTML = `
    <div style="font-size: 0.78rem; font-weight: 900; color: #ff9f43; text-align: left; margin-bottom: 6px;">
      🚀 HEAVY SUPER-WEAPONS (PERMANENT UNLOCKS)
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: left;">
      ${SUPER_WEAPONS.map(sw => {
        const owned = isSuperWeaponUnlocked(sw.id);
        const canAfford = !owned && shopState.coins >= sw.cost;
        return `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid ${owned ? '#2ed573' : 'rgba(255,255,255,0.12)'}; border-radius: 10px; padding: 8px;">
            <div style="font-weight: 900; font-size: 0.82rem; color: #fff;">[${sw.key}] ${sw.icon} ${sw.name}</div>
            <div style="font-size: 0.68rem; color: #a4b0be; margin: 3px 0 6px 0;">${sw.desc}</div>
            <button class="buy-sw-btn" data-id="${sw.id}" ${owned || !canAfford ? 'disabled' : ''} style="
              width: 100%; padding: 6px; border: none; border-radius: 6px; font-weight: 900; font-size: 0.74rem;
              cursor: ${owned || !canAfford ? 'not-allowed' : 'pointer'};
              background: ${owned ? 'rgba(46,213,115,0.2)' : (canAfford ? '#ff9f43' : 'rgba(255,255,255,0.08)')};
              color: ${owned ? '#2ed573' : (canAfford ? '#07080c' : '#747d8c')};
            ">${owned ? '✅ UNLOCKED' : `Unlock (${sw.cost.toLocaleString()} 🪙)`}</button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  sec.querySelectorAll('.buy-sw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sw = SUPER_WEAPONS.find(item => item.id === btn.dataset.id);
      if (!sw || isSuperWeaponUnlocked(sw.id) || shopState.coins < sw.cost) return;

      shopState.coins -= sw.cost;
      saveShopData();
      superWeaponsState.unlocked.push(sw.id);
      saveSuperWeapons();

      const hudBtn = document.getElementById(`wp-${sw.id}`);
      if (hudBtn) hudBtn.style.display = 'inline-flex';

      if (typeof sfx !== 'undefined') sfx.powerup();
      renderSuperWeaponsInShop();
    });
  });
}
// --- Keyboard Hotkeys (4, 5, 6) & Weapon Selection Highlight ---
window.addEventListener('keydown', (e) => {
  if (!isGameRunning) return;
  if (e.key === '4' && isSuperWeaponUnlocked('boomerang')) selectWeapon('boomerang');
  if (e.key === '5' && isSuperWeaponUnlocked('turret')) selectWeapon('turret');
  if (e.key === '6' && isSuperWeaponUnlocked('beam')) selectWeapon('beam');
});

if (typeof selectWeapon === 'function') {
  const _swOrigSelect = selectWeapon;
  selectWeapon = function(w) {
    _swOrigSelect(w);
    SUPER_WEAPONS.forEach(sw => {
      const btn = document.getElementById(`wp-${sw.id}`);
      if (!btn) return;
      const isSelected = (typeof activeWeapon !== 'undefined' && activeWeapon === sw.id);
      btn.style.borderColor = isSelected ? '#00d2d3' : 'rgba(255, 255, 255, 0.18)';
      btn.style.background = isSelected ? 'rgba(0, 210, 211, 0.22)' : 'rgba(15, 18, 28, 0.92)';
      btn.style.boxShadow = isSelected ? '0 0 12px rgba(0, 210, 211, 0.45)' : 'none';
    });
  };
}

// --- Fire Super-Weapons on Field Click ---
playField.addEventListener('mousedown', (e) => {
  if (!isGameRunning || typeof activeWeapon === 'undefined') return;
  if (typeof contractState !== 'undefined' && contractState.active && activeWeapon !== 'blaster') return;

  if (activeWeapon === 'boomerang' && typeof spendEnergy === 'function' && spendEnergy(35)) {
    firePlasmaBoomerang(e.clientX, e.clientY);
  } else if (activeWeapon === 'turret' && typeof spendEnergy === 'function' && spendEnergy(50)) {
    deployAutoTurret(e.clientX, e.clientY);
  } else if (activeWeapon === 'beam' && typeof spendEnergy === 'function' && spendEnergy(80)) {
    fireOrbitalBeam(e.clientY);
  }
});

function firePlasmaBoomerang(tx, ty) {
  if (typeof sfx !== 'undefined') sfx.powerup();
  const disc = document.createElement('div');
  disc.textContent = '🪃';
  disc.style.cssText = 'position:fixed; font-size:2.2rem; pointer-events:none; z-index:48; filter:drop-shadow(0 0 10px #00d2d3);';
  document.body.appendChild(disc);

  let x = window.innerWidth / 2;
  let y = window.innerHeight - 90;
  const angle = Math.atan2(ty - y, tx - x);
  let vx = Math.cos(angle) * 18;
  let vy = Math.sin(angle) * 18;
  let frames = 0;

  const loop = setInterval(() => {
    if (!isGameRunning || frames > 65) {
      clearInterval(loop);
      disc.remove();
      return;
    }
    frames++;
    if (frames === 32) { vx = -vx; vy = -vy; }
    x += vx;
    y += vy;
    disc.style.left = `${x - 18}px`;
    disc.style.top = `${y - 18}px`;
    disc.style.transform = `rotate(${frames * 28}deg)`;

    [...monsters].forEach(m => {
      if (Math.hypot((m.x + m.size / 2) - x, (m.y + m.size / 2) - y) < m.size * 0.65) {
        handleMonsterClick(m, x, y);
      }
    });
  }, 16);
}

function deployAutoTurret(x, y) {
  if (typeof sfx !== 'undefined') sfx.powerup();
  const turret = document.createElement('div');
  turret.textContent = '🗼';
  turret.style.cssText = `
    position: fixed; left: ${x - 20}px; top: ${y - 20}px; font-size: 2.2rem;
    pointer-events: none; z-index: 46; filter: drop-shadow(0 0 12px #ff9f43);
  `;
  document.body.appendChild(turret);
  spawnFloatingText(x, y - 20, '🗼 SENTRY DEPLOYED!', '#ff9f43');

  let shots = 0;
  const fireTimer = setInterval(() => {
    if (!isGameRunning || shots >= 22) {
      clearInterval(fireTimer);
      turret.remove();
      return;
    }
    shots++;
    if (monsters.length > 0) {
      const target = monsters.at(Math.floor(Math.random() * monsters.length));
      if (target) {
        const tx = target.x + target.size / 2;
        const ty = target.y + target.size / 2;
        spawnParticles(tx, ty, '#ff9f43', 6);
        handleMonsterClick(target, tx, ty);
      }
    }
  }, 420);
}

function fireOrbitalBeam(yPos) {
  if (typeof sfx !== 'undefined') sfx.bomb();
  triggerScreenShake();

  const beam = document.createElement('div');
  beam.style.cssText = `
    position: fixed; left: 0; top: ${yPos - 45}px; width: 100vw; height: 90px;
    background: linear-gradient(180deg, transparent, #00d2d3, #fff, #00d2d3, transparent);
    box-shadow: 0 0 35px #00d2d3; pointer-events: none; z-index: 49; opacity: 0.95;
  `;
  document.body.appendChild(beam);
  setTimeout(() => beam.remove(), 350);

  [...monsters].forEach(m => {
    const cy = m.y + m.size / 2;
    if (Math.abs(cy - yPos) <= 95) {
      for (let d = 0; d < 4; d++) {
        if (monsters.includes(m)) handleMonsterClick(m, m.x + m.size / 2, cy);
      }
    }
  });
}
