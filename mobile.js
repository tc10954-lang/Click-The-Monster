// --- Mobile Touchscreen Mode (Toggled OFF by Default) ---
const mobileMode = {
  enabled: false
};

window.addEventListener('DOMContentLoaded', () => {
  // 1. Add Toggle Button to Top-Right HUD (next to Mute button)
  const hudGroup = document.querySelector('.hud-group');
  const muteBtn = document.getElementById('mute-btn');

  if (hudGroup) {
    const touchBtn = document.createElement('button');
    touchBtn.id = 'touch-toggle-btn';
    touchBtn.title = 'Toggle Mobile Touch Mode';
    touchBtn.textContent = '📱 OFF';
    touchBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #a4b0be;
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 800;
      transition: all 0.2s;
    `;

    touchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMode(touchBtn);
    });

    if (muteBtn) {
      hudGroup.insertBefore(touchBtn, muteBtn);
    } else {
      hudGroup.appendChild(touchBtn);
    }
  }

  // 2. Inject Mobile-Friendly Hitbox & Scroll-Lock Styles
  const style = document.createElement('style');
  style.textContent = `
    body.mobile-touch-active {
      touch-action: none;
      overscroll-behavior: none;
    }
    body.mobile-touch-active .monster {
      padding: 12px;
      margin: -12px;
    }
    body.mobile-touch-active .powerup {
      width: 60px;
      height: 60px;
      font-size: 1.8rem;
    }
    @media (max-width: 650px) {
      #hud { padding: 0 10px; height: 60px; }
      #game-title { font-size: 1rem; letter-spacing: 1px; }
      .hud-stat { font-size: 0.8rem; padding: 4px 8px; }
      #weapon-bar { bottom: 10px; padding: 6px 8px; gap: 6px; width: 95vw; justify-content: center; }
      .w-btn { padding: 6px 8px; font-size: 0.75rem; }
    }
  `;
  document.head.appendChild(style);

  // 3. Multi-Touch Tap & Drag Support (Only active when toggled ON)
  const playField = document.getElementById('play-field');
  if (!playField) return;

  playField.addEventListener('touchstart', (e) => {
    if (!mobileMode.enabled || !isGameRunning) return;
    e.preventDefault(); // Stops 300ms click delay & screen zooming

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const tx = touch.clientX;
      const ty = touch.clientY;

      // Check if Splash Blast weapon is selected
      if (typeof arsenal !== 'undefined' && arsenal.weapon === 'splash') {
        triggerSplashBlast(tx, ty);
        continue;
      }

      // Check what element was tapped directly under the finger
      const targetEl = document.elementFromPoint(tx, ty);
      const monsterEl = targetEl ? targetEl.closest('.monster') : null;
      const powerupEl = targetEl ? targetEl.closest('.powerup') : null;

      if (powerupEl) {
        powerupEl.dispatchEvent(new MouseEvent('mousedown', { clientX: tx, clientY: ty, bubbles: true }));
      } else if (monsterEl) {
        monsterEl.dispatchEvent(new MouseEvent('mousedown', { clientX: tx, clientY: ty, bubbles: true }));
      } else {
        // Missed tap on empty space
        spawnClickRing(tx, ty);
        totalClicks++;
        if (combo > 1) {
          combo = 1;
          comboDisplay.textContent = `x${combo}`;
          spawnFloatingText(tx, ty, 'MISS!', '#ff4757');
        }
        sfx.miss();
      }
    }
  }, { passive: false });

  // 4. Touch-Drag Support for Rapid Laser
  playField.addEventListener('touchmove', (e) => {
    if (!mobileMode.enabled || !isGameRunning) return;
    e.preventDefault();

    if (typeof arsenal !== 'undefined' && arsenal.weapon === 'laser') {
      const touch = e.touches[0];
      if (!touch) return;
      const tx = touch.clientX;
      const ty = touch.clientY;

      if (arsenal.energy < 4) {
        selectWeapon('blaster');
        return;
      }

      spendEnergy(4);
      spawnClickRing(tx, ty);
      sfx.playTone(750, 'sawtooth', 0.05, 0.08, 300);

      for (let i = monsters.length - 1; i >= 0; i--) {
        const m = monsters[i];
        if (tx >= m.x - 10 && tx <= m.x + m.size + 10 && ty >= m.y - 10 && ty <= m.y + m.size + 10) {
          handleMonsterClick(m, tx, ty);
          break;
        }
      }
    }
  }, { passive: false });
});

function toggleMobileMode(btn) {
  mobileMode.enabled = !mobileMode.enabled;
  document.body.classList.toggle('mobile-touch-active', mobileMode.enabled);

  if (mobileMode.enabled) {
    btn.textContent = '📱 ON';
    btn.style.borderColor = '#2ed573';
    btn.style.background = 'rgba(46, 213, 115, 0.22)';
    btn.style.color = '#2ed573';
    btn.style.boxShadow = '0 0 12px rgba(46, 213, 115, 0.35)';
  } else {
    btn.textContent = '📱 OFF';
    btn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    btn.style.background = 'rgba(255, 255, 255, 0.08)';
    btn.style.color = '#a4b0be';
    btn.style.boxShadow = 'none';
  }
}
