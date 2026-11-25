// --- Comprehensive Settings Menu, Jukebox, Playtime & Performance Controls ---
const gameSettings = Object.assign({
  screenShake: true,
  floatingText: true,
  particles: 'high', // 'high' | 'low' | 'off'
  holdToFire: false,
  jukeboxTrack: 'auto'
}, JSON.parse(localStorage.getItem('monster_game_settings') || '{}'));

let totalPlaytimeSec = parseInt(localStorage.getItem('monster_total_playtime_sec') || '0', 10);

function saveGameSettings() {
  localStorage.setItem('monster_game_settings', JSON.stringify(gameSettings));
}

function formatPlaytime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

// Tick total playtime every second & update live display if Settings modal is open
setInterval(() => {
  totalPlaytimeSec++;
  if (totalPlaytimeSec % 5 === 0) {
    localStorage.setItem('monster_total_playtime_sec', String(totalPlaytimeSec));
  }
  const ptEl = document.getElementById('settings-playtime-val');
  if (ptEl) ptEl.textContent = formatPlaytime(totalPlaytimeSec);
}, 1000);

window.addEventListener('DOMContentLoaded', () => {
  // 1. Hide the old top-right audio buttons since they now live cleanly inside Settings
  const oldMuteBtn = document.getElementById('mute-btn');
  if (oldMuteBtn) oldMuteBtn.style.display = 'none';
  const oldMusicBtn = document.getElementById('music-toggle-btn');
  if (oldMusicBtn) oldMusicBtn.style.display = 'none';

  // 2. Create Floating Left-Side "⚙️" Settings Button
  const gearBtn = document.createElement('button');
  gearBtn.id = 'left-settings-btn';
  gearBtn.title = 'Game Settings & Audio';
  gearBtn.innerHTML = '⚙️';
  gearBtn.style.cssText = `
    position: fixed; left: 14px; top: 50%; transform: translateY(-50%);
    width: 46px; height: 46px; border-radius: 14px; z-index: 115;
    background: rgba(15, 18, 28, 0.88); backdrop-filter: blur(8px);
    border: 1.5px solid rgba(255, 255, 255, 0.2); color: #fff;
    font-size: 1.35rem; cursor: pointer; box-shadow: 0 4px 18px rgba(0,0,0,0.45);
    transition: transform 0.2s, border-color 0.2s;
  `;
  gearBtn.addEventListener('mouseenter', () => {
    gearBtn.style.transform = 'translateY(-50%) scale(1.1) rotate(35deg)';
    gearBtn.style.borderColor = '#00d2d3';
  });
  gearBtn.addEventListener('mouseleave', () => {
    gearBtn.style.transform = 'translateY(-50%) scale(1) rotate(0deg)';
    gearBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  });
  gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderSettingsModal();
    document.getElementById('settings-modal').classList.remove('hidden');
  });
  document.body.appendChild(gearBtn);

  // 3. Build the Settings Modal Shell
  const modal = document.createElement('div');
  modal.id = 'settings-modal';
  modal.className = 'screen-overlay hidden';
  modal.style.zIndex = '160';
  modal.innerHTML = `
    <div class="card" style="max-width: 540px; width: 92vw; max-height: 90vh; overflow-y: auto; text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="color: #00d2d3; margin: 0; font-size: 1.65rem;">⚙️ Game Settings</h2>
        <button id="close-settings-x" style="background:none; border:none; color:#a4b0be; font-size:1.4rem; cursor:pointer;">✖</button>
      </div>
      <div id="settings-body-content" style="display: flex; flex-direction: column; gap: 14px;"></div>
      <button class="action-btn" id="close-settings-btn" style="margin-top: 16px; width: 100%; background: linear-gradient(135deg, #00d2d3, #01a3a4); color: #07080c;">
        Save & Close
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-settings-btn').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('close-settings-x').addEventListener('click', () => modal.classList.add('hidden'));
});
let resetArmed = false;

function togglePillHtml(id, label, desc, isOn) {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
      <div>
        <div style="font-weight:800; font-size:0.88rem; color:#fff;">${label}</div>
        <div style="font-size:0.72rem; color:#a4b0be;">${desc}</div>
      </div>
      <button id="${id}" style="
        min-width: 68px; padding: 6px 12px; border: none; border-radius: 8px;
        font-weight: 900; font-size: 0.78rem; cursor: pointer;
        background: ${isOn ? '#2ed573' : 'rgba(255,255,255,0.1)'};
        color: ${isOn ? '#07080c' : '#a4b0be'};
      ">${isOn ? 'ON' : 'OFF'}</button>
    </div>
  `;
}

function renderSettingsModal() {
  const body = document.getElementById('settings-body-content');
  if (!body) return;
  resetArmed = false;

  const sfxOn = typeof sfx !== 'undefined' ? !sfx.isMuted : true;
  const musicOn = typeof dynamicDJ !== 'undefined' ? !dynamicDJ.musicMuted : true;

  const tracks = [
    ['auto', '🤖 Auto-DJ (Dynamic)'],
    ['menu', '🏠 Menu Synthwave'],
    ['easy', '🟢 Easy Adventure'],
    ['normal', '🔵 Normal Arcade'],
    ['insane', '🟣 Insane Cyber'],
    ['nightmare', '💀 Nightmare Bass'],
    ['hellfire', '🔥 Hellfire Speed-Metal'],
    ['flashlight', '🔦 Lights Out Horror'],
    ['chaos', '🎲 Chaos Glitch'],
    ['boss', '👹 Final Boss Anthem'],
    ['victory', '🏆 Victory Fanfare']
  ];

  body.innerHTML = `
    <!-- SECTION 1: AUDIO & JUKEBOX -->
    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
      <div style="font-weight: 900; font-size: 0.85rem; color: #00d2d3; margin-bottom: 6px;">🔊 AUDIO & 10-SONG JUKEBOX</div>
      ${togglePillHtml('set-sfx-btn', 'Sound Effects (SFX)', 'Blaster, explosions, combos & chimes', sfxOn)}
      ${togglePillHtml('set-music-btn', 'Background Music', 'Procedural Web Audio synth soundtrack', musicOn)}
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding-top:8px;">
        <div style="font-weight:800; font-size:0.85rem; color:#fff;">🎵 Jukebox Track</div>
        <select id="set-jukebox-select" style="
          background: #141824; color: #fff; border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; padding: 6px 10px; font-weight: 800; font-size: 0.8rem; cursor: pointer;
        ">
          ${tracks.map(([val, name]) => `<option value="${val}" ${gameSettings.jukeboxTrack === val ? 'selected' : ''}>${name}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- SECTION 2: VISUALS & CHROMEBOOK PERFORMANCE -->
    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
      <div style="font-weight: 900; font-size: 0.85rem; color: #ffd32a; margin-bottom: 6px;">🎨 VISUALS & PERFORMANCE</div>
      ${togglePillHtml('set-shake-btn', 'Screen Shake', 'Camera recoil on explosions & boss hits', gameSettings.screenShake)}
      ${togglePillHtml('set-float-btn', 'Floating Combat Text', 'Show damage, crit & coin popups', gameSettings.floatingText)}
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding-top:8px;">
        <div>
          <div style="font-weight:800; font-size:0.85rem; color:#fff;">✨ Particle Quality</div>
          <div style="font-size:0.7rem; color:#a4b0be;">Lower for smoother FPS on Chromebooks</div>
        </div>
        <div style="display:flex; gap:5px;">
          ${['high', 'low', 'off'].map(lvl => `
            <button class="set-part-btn" data-lvl="${lvl}" style="
              padding: 5px 10px; border: none; border-radius: 6px; font-weight: 900; font-size: 0.74rem; text-transform: uppercase; cursor: pointer;
              background: ${gameSettings.particles === lvl ? '#ffd32a' : 'rgba(255,255,255,0.1)'};
              color: ${gameSettings.particles === lvl ? '#07080c' : '#a4b0be'};
            ">${lvl}</button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- SECTION 3: CONTROLS -->
    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
      <div style="font-weight: 900; font-size: 0.85rem; color: #ff9ff3; margin-bottom: 6px;">🎯 CONTROLS</div>
      ${togglePillHtml('set-holdfire-btn', 'Hold-to-Fire Blaster', 'Hold left-click to auto-fire standard Blaster', gameSettings.holdToFire)}
    </div>

    <!-- SECTION 4: PLAYTHROUGH & SAVE DATA -->
    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
      <div style="font-weight: 900; font-size: 0.85rem; color: #ff6b81; margin-bottom: 8px;">📊 PLAYTHROUGH & SAVE DATA</div>
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px; margin-bottom:10px;">
        <span style="font-size:0.82rem; color:#ced6e0; font-weight:700;">⏱️ Total Playtime</span>
        <span id="settings-playtime-val" style="font-weight:900; color:#2ed573; font-family:monospace; font-size:0.95rem;">${formatPlaytime(totalPlaytimeSec)}</span>
      </div>
      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <button id="set-export-btn" style="flex:1; padding:8px; border:1px solid rgba(255,255,255,0.2); border-radius:8px; background:rgba(255,255,255,0.08); color:#fff; font-weight:800; font-size:0.78rem; cursor:pointer;">
          📋 Copy Save Backup
        </button>
        <button id="set-import-btn" style="flex:1; padding:8px; border:1px solid rgba(255,255,255,0.2); border-radius:8px; background:rgba(255,255,255,0.08); color:#fff; font-weight:800; font-size:0.78rem; cursor:pointer;">
          📥 Paste Save Backup
        </button>
      </div>
      <button id="set-reset-btn" style="
        width:100%; padding:9px; border:1.5px solid #ff4757; border-radius:8px;
        background:rgba(255,71,87,0.15); color:#ff4757; font-weight:900; font-size:0.82rem; cursor:pointer;
      ">🗑️ Reset All Save Data</button>
    </div>
  `;

  // Wire Event Listeners
  document.getElementById('set-sfx-btn').addEventListener('click', () => {
    const oldMute = document.getElementById('mute-btn');
    if (oldMute) oldMute.click();
    renderSettingsModal();
  });

  document.getElementById('set-music-btn').addEventListener('click', () => {
    if (typeof dynamicDJ !== 'undefined') {
      dynamicDJ.musicMuted = !dynamicDJ.musicMuted;
      localStorage.setItem('monster_music_muted', dynamicDJ.musicMuted);
      if (typeof switchMusicTrack === 'function' && typeof determineDesiredTrack === 'function') {
        switchMusicTrack(determineDesiredTrack());
      }
    }
    renderSettingsModal();
  });

  document.getElementById('set-jukebox-select').addEventListener('change', (e) => {
    gameSettings.jukeboxTrack = e.target.value;
    saveGameSettings();
    if (typeof switchMusicTrack === 'function' && typeof determineDesiredTrack === 'function') {
      switchMusicTrack(determineDesiredTrack());
    }
  });

  document.getElementById('set-shake-btn').addEventListener('click', () => {
    gameSettings.screenShake = !gameSettings.screenShake;
    saveGameSettings();
    renderSettingsModal();
  });

  document.getElementById('set-float-btn').addEventListener('click', () => {
    gameSettings.floatingText = !gameSettings.floatingText;
    saveGameSettings();
    renderSettingsModal();
  });

  body.querySelectorAll('.set-part-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gameSettings.particles = btn.dataset.lvl;
      saveGameSettings();
      renderSettingsModal();
    });
  });

  document.getElementById('set-holdfire-btn').addEventListener('click', () => {
    gameSettings.holdToFire = !gameSettings.holdToFire;
    saveGameSettings();
    renderSettingsModal();
  });

  document.getElementById('set-export-btn').addEventListener('click', () => {
    const dump = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('monster_')) dump[k] = localStorage.getItem(k);
    }
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(dump))));
    navigator.clipboard.writeText(code).then(() => {
      document.getElementById('set-export-btn').textContent = '✅ Copied to Clipboard!';
    }).catch(() => prompt('Copy your save backup code:', code));
  });

  document.getElementById('set-import-btn').addEventListener('click', () => {
    const code = prompt('Paste your save backup code here:');
    if (!code) return;
    try {
      const dump = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      Object.entries(dump).forEach(([k, v]) => {
        if (k.startsWith('monster_')) localStorage.setItem(k, v);
      });
      alert('✅ Save restored! Reloading game...');
      location.reload();
    } catch {
      alert('❌ Invalid save backup code.');
    }
  });

  const resetBtn = document.getElementById('set-reset-btn');
  resetBtn.addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true;
      resetBtn.style.background = '#ff4757';
      resetBtn.style.color = '#fff';
      resetBtn.textContent = '⚠️ CLICK AGAIN TO PERMANENTLY WIPE SAVE!';
    } else {
      localStorage.clear();
      location.reload();
    }
  });
}
// --- Runtime Hooks for Jukebox, Visual Performance & Hold-to-Fire ---

// 1. Jukebox Track Override (allows locking any of the 10 songs manually)
if (typeof determineDesiredTrack === 'function') {
  const _setOrigDesiredTrack = determineDesiredTrack;
  determineDesiredTrack = function() {
    if (typeof sfx === 'undefined' || sfx.isMuted || (typeof dynamicDJ !== 'undefined' && dynamicDJ.musicMuted)) {
      return null;
    }
    if (gameSettings.jukeboxTrack && gameSettings.jukeboxTrack !== 'auto') {
      return gameSettings.jukeboxTrack;
    }
    return _setOrigDesiredTrack();
  };
}

// 2. Screen Shake Toggle Hook
if (typeof triggerScreenShake === 'function') {
  const _setOrigShake = triggerScreenShake;
  triggerScreenShake = function() {
    if (!gameSettings.screenShake) return;
    _setOrigShake();
  };
}

// 3. Floating Combat Text Toggle Hook
if (typeof spawnFloatingText === 'function') {
  const _setOrigFloatText = spawnFloatingText;
  spawnFloatingText = function(x, y, text, color) {
    if (!gameSettings.floatingText) return;
    _setOrigFloatText(x, y, text, color);
  };
}

// 4. Particle Quality Hook ('high' | 'low' | 'off')
if (typeof spawnParticles === 'function') {
  const _setOrigParticles = spawnParticles;
  spawnParticles = function(x, y, color, count) {
    if (gameSettings.particles === 'off') return;
    const adjustedCount = gameSettings.particles === 'low' ? Math.max(2, Math.round(count * 0.35)) : count;
    _setOrigParticles(x, y, color, adjustedCount);
  };
}

// 5. Hold-to-Fire Standard Blaster Toggle
let holdFireDown = false;
let lastMouseX = window.innerWidth / 2;
let lastMouseY = window.innerHeight / 2;

window.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    holdFireDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});
window.addEventListener('mouseup', () => { holdFireDown = false; });
window.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

setInterval(() => {
  if (!gameSettings.holdToFire || !holdFireDown || !isGameRunning || isFrozen) return;
  if (typeof activeWeapon !== 'undefined' && activeWeapon !== 'blaster') return;

  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters.at(i);
    if (!m) continue;
    const cx = m.x + m.size / 2;
    const cy = m.y + m.size / 2;
    if (Math.hypot(cx - lastMouseX, cy - lastMouseY) <= m.size * 0.58) {
      handleMonsterClick(m, lastMouseX, lastMouseY);
      break;
    }
  }
}, 95);
