// --- Super-Weapons Arsenal (,, Unlockables) ---
const superWeaponsState = {
  unlocked: JSON.parse(localStorage.getItem('monster_super_weapons')) || []
};

const SUPER_WEAPONS = [
  { id: 'boomerang', key: '4', icon: '🪃', name: 'Plasma Boomerang', cost: 2500, energy: 35, desc: 'Pierces through enemies & curves back to cursor' },
  { id: 'turret',    key: '5', icon: '🗼', name: 'Auto-Sentry Turret', cost: 4500, energy: 50, desc: 'Deploys a laser turret on the field for 10s' },
  { id: 'beam',      key: '6', icon: '☄️', name: 'Orbital Omega Beam', cost: 8000, energy: 80, desc: 'Fires a screen-wide annihilation beam' }
];

function saveSuperWeapons() {
  localStorage.setItem('monster_super_weapons', JSON.stringify(superWeaponsState.unlocked));
}

function isSuperWeaponUnlocked(id) {
  return superWeaponsState.unlocked.includes(id);
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Super-Weapon Buttons matching the exact .wp-btn style of,,
  const weaponBar = document.getElementById('weapon-bar');
  if (weaponBar) {
    SUPER_WEAPONS.forEach(sw => {
      const btn = document.createElement('button');
      btn.id = `wp-${sw.id}`;
      btn.className = 'wp-btn';
      btn.style.display = isSuperWeaponUnlocked(sw.id) ? 'inline-block' : 'none';
      btn.innerHTML = `[${sw.key}] ${sw.icon} ${sw.name.split(' ').at(-1)} <small>(${sw.energy}⚡)</small>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof selectWeapon === 'function') selectWeapon(sw.id);
      });
      weaponBar.appendChild(btn);
    });
  }

  // Lift the Potion Belt ([Q] [E] [R]) slightly so it never overlaps the wider 6-weapon dock
  const potionBelt = document.getElementById('live-potion-belt');
  if (potionBelt) {
    potionBelt.style.bottom = '74px';
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
      if (hudBtn) hudBtn.style.display = 'inline-block';

      if (typeof sfx !== 'undefined') sfx.powerup();
      renderSuperWeaponsInShop();
    });
  });
}


// Fire Super-Weapons when clicking anywhere in the playfield while selected
playField.addEventListener('mousedown', (e) => {
  if (!isGameRunning || typeof currentWeapon === 'undefined') return;
  const sw = SUPER_WEAPONS.find(item => item.id === currentWeapon);
  if (!sw) return;

  // Keep Mythic Contracts fair (only Blaster & Laser allowed)
  if (typeof contractState !== 'undefined' && contractState.active) {
    spawnFloatingText(e.clientX, e.clientY - 18, '🚫 SUPER-WEAPONS BANNED IN CONTRACTS!', '#ff4757');
    return;
  }

  if (typeof energy === 'undefined' || energy < sw.energy) {
    spawnFloatingText(e.clientX, e.clientY - 18, `NEED ${sw.energy}⚡ ENERGY!`, '#ff4757');
    return;
  }

  energy -= sw.energy;
  if (typeof updateEnergyUI === 'function') updateEnergyUI();

  if (sw.id === 'boomerang') launchPlasmaBoomerang(e.clientX, e.clientY);
  if (sw.id === 'turret')    deployTeslaTurret(e.clientX, e.clientY);
  if (sw.id === 'ion')       fireOrbitalIonBeam(e.clientX);
});

// 1. 🪃 Plasma Boomerang: Ricochets off all 4 walls for 3.5 seconds slicing enemies
function launchPlasmaBoomerang(startX, startY) {
  if (typeof sfx !== 'undefined') sfx.powerup();
  const disc = document.createElement('div');
  disc.textContent = '🪃';
  disc.style.cssText = `
    position: fixed; font-size: 2.2rem; pointer-events: none; z-index: 44;
    filter: drop-shadow(0 0 14px #00d2d3); transform: translate(-50%, -50%);
  `;
  document.body.appendChild(disc);

  let bx = startX;
  let by = startY;
  const angle = Math.random() * Math.PI * 2;
  let vx = Math.cos(angle) * 14;
  let vy = Math.sin(angle) * 14;
  let spin = 0;
  let ticks = 0;
  const hitCooldown = new Map();

  const loop = setInterval(() => {
    ticks++;
    if (!isGameRunning || ticks > 210) {
      clearInterval(loop);
      disc.remove();
      return;
    }

    bx += vx;
    by += vy;
    spin += 28;

    if (bx <= 20 || bx >= window.innerWidth - 20) vx *= -1;
    if (by <= 75 || by >= window.innerHeight - 20) vy *= -1;

    disc.style.left = `${bx}px`;
    disc.style.top = `${by}px`;
    disc.style.transform = `translate(-50%, -50%) rotate(${spin}deg)`;

    [...monsters].forEach(m => {
      const mx = m.x + m.size / 2;
      const my = m.y + m.size / 2;
      if (Math.hypot(mx - bx, my - by) < m.size * 0.65 + 24) {
        const lastHit = hitCooldown.get(m) || 0;
        if (ticks - lastHit > 12) {
          hitCooldown.set(m, ticks);
          spawnParticles(mx, my, '#00d2d3', 8);
          handleMonsterClick(m, mx, my);
          if (monsters.includes(m)) handleMonsterClick(m, mx, my);
        }
      }
    });
  }, 16);
}

// 2. 🌩️ Tesla Coil Turret: Automated lightning pylon for 6 seconds
function deployTeslaTurret(tx, ty) {
  if (typeof sfx !== 'undefined') sfx.powerup();
  const pylon = document.createElement('div');
  pylon.innerHTML = '🌩️';
  pylon.style.cssText = `
    position: fixed; left: ${tx}px; top: ${ty}px; transform: translate(-50%, -50%);
    font-size: 2.3rem; pointer-events: none; z-index: 43;
    filter: drop-shadow(0 0 18px #54a0ff);
  `;
  document.body.appendChild(pylon);
  spawnFloatingText(tx, ty - 24, '🌩️ TESLA TURRET ONLINE!', '#54a0ff');

  let zaps = 0;
  const zapTimer = setInterval(() => {
    zaps++;
    if (!isGameRunning || zaps > 15) {
      clearInterval(zapTimer);
      pylon.remove();
      return;
    }

    const nearby = monsters
      .filter(m => Math.hypot((m.x + m.size / 2) - tx, (m.y + m.size / 2) - ty) <= 220)
      .slice(0, 3);

    nearby.forEach(t => {
      const mx = t.x + t.size / 2;
      const my = t.y + t.size / 2;
      spawnParticles(mx, my, '#54a0ff', 10);
      handleMonsterClick(t, mx, my);
    });
  }, 400);
}

// 3. ☄️ Orbital Ion Beam: Colossal vertical sky-laser column (6 DMG)
function fireOrbitalIonBeam(beamX) {
  if (typeof sfx !== 'undefined') sfx.bomb();
  triggerScreenShake();

  const beam = document.createElement('div');
  beam.style.cssText = `
    position: fixed; top: 0; left: ${beamX - 75}px; width: 150px; height: 100vh;
    background: linear-gradient(90deg, transparent 0%, rgba(255,71,87,0.45) 20%, #fff 50%, rgba(255,71,87,0.45) 80%, transparent 100%);
    box-shadow: 0 0 55px #ff4757; pointer-events: none; z-index: 46;
    transition: opacity 0.45s ease;
  `;
  document.body.appendChild(beam);
  spawnFloatingText(beamX, 140, '☄️ ORBITAL ION STRIKE!', '#ff4757');

  [...monsters].forEach(m => {
    const mx = m.x + m.size / 2;
    if (Math.abs(mx - beamX) <= 95) {
      const my = m.y + m.size / 2;
      spawnParticles(mx, my, '#ff4757', 20);
      for (let d = 0; d < 6; d++) {
        if (monsters.includes(m)) handleMonsterClick(m, mx, my);
      }
    }
  });

  setTimeout(() => { beam.style.opacity = '0'; }, 120);
  setTimeout(() => { beam.remove(); }, 580);
}
