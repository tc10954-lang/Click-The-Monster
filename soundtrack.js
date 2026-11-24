// --- 10-Track Dynamic Web Audio Soundtrack Engine ---
const TRACK_LIBRARY = {
  menu: {
    tempo: 210,
    wave: 'sine',
    bassWave: 'triangle',
    lead: [261.6, 329.6, 392.0, 493.9, 523.3, 493.9, 392.0, 329.6, 220.0, 261.6, 329.6, 392.0, 440.0, 392.0, 329.6, 261.6],
    bass: [130.8, 0, 130.8, 0, 164.8, 0, 164.8, 0, 110.0, 0, 110.0, 0, 146.8, 0, 146.8, 0]
  },
  victory: {
    tempo: 150,
    wave: 'triangle',
    bassWave: 'sine',
    lead: [523.3, 659.3, 784.0, 1046.5, 784.0, 1046.5, 0, 1046.5, 587.3, 740.0, 880.0, 1174.7, 880.0, 1174.7, 0, 1046.5],
    bass: [261.6, 261.6, 196.0, 196.0, 261.6, 261.6, 329.6, 329.6, 293.7, 293.7, 220.0, 220.0, 261.6, 196.0, 130.8, 0]
  },
  easy: {
    tempo: 155,
    wave: 'triangle',
    bassWave: 'sine',
    lead: [392.0, 493.9, 587.3, 493.9, 523.3, 659.3, 784.0, 659.3, 587.3, 523.3, 493.9, 392.0, 440.0, 523.3, 587.3, 0],
    bass: [196.0, 0, 146.8, 0, 130.8, 0, 196.0, 0, 146.8, 0, 196.0, 0, 220.0, 0, 146.8, 0]
  },
  normal: {
    tempo: 135,
    wave: 'square',
    bassWave: 'triangle',
    lead: [329.6, 0, 392.0, 440.0, 493.9, 0, 440.0, 392.0, 329.6, 0, 293.7, 329.6, 392.0, 0, 246.9, 0],
    bass: [164.8, 164.8, 130.8, 130.8, 196.0, 196.0, 146.8, 146.8, 164.8, 164.8, 110.0, 110.0, 123.5, 123.5, 164.8, 0]
  },
  insane: {
    tempo: 112,
    wave: 'sawtooth',
    bassWave: 'square',
    lead: [440.0, 523.3, 659.3, 523.3, 440.0, 659.3, 784.0, 659.3, 493.9, 587.3, 740.0, 587.3, 493.9, 740.0, 880.0, 740.0],
    bass: [110.0, 220.0, 110.0, 220.0, 110.0, 220.0, 110.0, 220.0, 123.5, 246.9, 123.5, 246.9, 123.5, 246.9, 123.5, 246.9]
  },
  nightmare: {
    tempo: 105,
    wave: 'sawtooth',
    bassWave: 'sawtooth',
    lead: [220.0, 233.1, 220.0, 277.2, 261.6, 246.9, 220.0, 196.0, 220.0, 233.1, 293.7, 277.2, 261.6, 233.1, 220.0, 0],
    bass: [55.0, 55.0, 58.3, 55.0, 65.4, 65.4, 55.0, 49.0, 55.0, 55.0, 73.4, 69.3, 65.4, 58.3, 55.0, 55.0]
  },
  hellfire: {
    tempo: 88,
    wave: 'sawtooth',
    bassWave: 'square',
    lead: [329.6, 349.2, 329.6, 493.9, 329.6, 466.2, 329.6, 440.0, 329.6, 392.0, 349.2, 329.6, 293.7, 329.6, 349.2, 493.9],
    bass: [82.4, 82.4, 82.4, 82.4, 87.3, 87.3, 82.4, 82.4, 73.4, 73.4, 73.4, 73.4, 82.4, 82.4, 98.0, 98.0]
  },
  flashlight: {
    tempo: 185,
    wave: 'sine',
    bassWave: 'triangle',
    lead: [196.0, 0, 207.7, 0, 196.0, 0, 293.7, 277.2, 185.0, 0, 196.0, 0, 138.6, 0, 0, 0],
    bass: [49.0, 0, 0, 49.0, 51.9, 0, 0, 49.0, 46.2, 0, 0, 46.2, 36.7, 0, 49.0, 0]
  },
  chaos: {
    tempo: 108,
    wave: 'square',
    bassWave: 'sawtooth',
    lead: [392.0, 554.4, 329.6, 622.3, 440.0, 293.7, 587.3, 369.9, 493.9, 311.1, 659.3, 415.3, 523.3, 277.2, 740.0, 0],
    bass: [130.8, 185.0, 110.0, 155.6, 146.8, 98.0, 196.0, 123.5, 164.8, 103.8, 220.0, 138.6, 174.6, 92.5, 246.9, 130.8]
  },
  boss: {
    tempo: 95,
    wave: 'sawtooth',
    bassWave: 'square',
    lead: [293.7, 293.7, 440.0, 415.3, 392.0, 349.2, 293.7, 349.2, 392.0, 261.6, 261.6, 440.0, 415.3, 392.0, 349.2, 493.9],
    bass: [73.4, 146.8, 73.4, 146.8, 65.4, 130.8, 65.4, 130.8, 58.3, 116.5, 58.3, 116.5, 65.4, 130.8, 73.4, 146.8]
  }
};
const dynamicDJ = {
  currentTrackKey: null,
  timer: null,
  step: 0,
  musicMuted: localStorage.getItem('monster_music_muted') === 'true'
};

function determineDesiredTrack() {
  if (typeof sfx === 'undefined' || sfx.isMuted || dynamicDJ.musicMuted) return null;

  // 1. Check if Victory Screen is visible
  const vicScreen = document.getElementById('victory-screen');
  if (vicScreen && !vicScreen.classList.contains('hidden')) {
    return 'victory';
  }

  // 2. Check if Start Screen is visible (Menu music!)
  const startScreenEl = document.getElementById('start-screen');
  if (!isGameRunning && startScreenEl && !startScreenEl.classList.contains('hidden')) {
    return 'menu';
  }

  if (!isGameRunning) return null;

  // 3. Boss Rush, Mythic Contract, or Overlord Boss active
  if ((typeof contractState !== 'undefined' && contractState.active) ||
      (typeof bossRushState !== 'undefined' && bossRushState.active) ||
      (typeof bossSpawned !== 'undefined' && bossSpawned)) {
    return 'boss';
  }

  // 4. Chaos Mutators active during gameplay
  if (typeof activeMutators !== 'undefined') {
    if (activeMutators.flashlight) return 'flashlight';
    if (activeMutators.mitosis || activeMutators.evasive || activeMutators.chaos) return 'chaos';
  }

  // 5. Match current difficulty track (easy, normal, insane, nightmare, hellfire)
  const diff = (typeof currentDiff !== 'undefined' && TRACK_LIBRARY[currentDiff]) ? currentDiff : 'normal';
  return diff;
}

function playTrackStep(track) {
  if (typeof sfx === 'undefined' || !sfx.ctx || sfx.isMuted || dynamicDJ.musicMuted) return;

  const idx = dynamicDJ.step % track.lead.length;
  const leadFreq = track.lead.at(idx);
  const bassFreq = track.bass.at(idx);
  const noteDur = (track.tempo / 1000) * 0.85;

  // Lead Melody Synth
  if (leadFreq > 0) {
    sfx.playTone(leadFreq, track.wave, noteDur, 0.042);
  }

  // Bassline Synth
  if (bassFreq > 0) {
    sfx.playTone(bassFreq, track.bassWave, noteDur * 1.1, 0.055);
  }

  // Subtle Percussion Hi-Hat / Kick on off-beats for high-intensity tracks
  if (track.tempo <= 140 && idx % 2 === 1) {
    sfx.playTone(90, 'sine', 0.04, 0.03, 40);
  }

  dynamicDJ.step++;
}

function switchMusicTrack(trackKey) {
  if (dynamicDJ.currentTrackKey === trackKey) return;
  dynamicDJ.currentTrackKey = trackKey;
  clearInterval(dynamicDJ.timer);
  dynamicDJ.timer = null;

  if (!trackKey || !TRACK_LIBRARY[trackKey]) return;

  const track = TRACK_LIBRARY[trackKey];
  dynamicDJ.step = 0;

  if (typeof sfx !== 'undefined') sfx.init();
  playTrackStep(track);

  dynamicDJ.timer = setInterval(() => {
    if (dynamicDJ.currentTrackKey !== trackKey) return;
    playTrackStep(track);
  }, track.tempo);
}
// Override the original single-track music methods so the 10-track DJ takes over seamlessly
if (typeof sfx !== 'undefined') {
  sfx.startMusic = function() {
    switchMusicTrack(determineDesiredTrack());
  };
  sfx.stopMusic = function() {
    switchMusicTrack(null);
  };
}

// Continuously sync the active track every 350ms (handles menu, difficulty swaps, mutators, boss spawns & victory!)
setInterval(() => {
  const desired = determineDesiredTrack();
  if (desired !== dynamicDJ.currentTrackKey) {
    switchMusicTrack(desired);
  }
}, 350);

// Unlock browser audio context on the very first click/tap anywhere on the menu so menu music starts immediately
['pointerdown', 'keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (typeof sfx !== 'undefined') {
      sfx.init();
      const desired = determineDesiredTrack();
      if (desired && !dynamicDJ.currentTrackKey) {
        switchMusicTrack(desired);
      }
    }
  }, { once: true });
});

// Add a dedicated "🎵" Music Toggle button right next to the "🔊" Sound button in the top HUD
window.addEventListener('DOMContentLoaded', () => {
  const hudGroup = document.querySelector('.hud-group');
  const muteBtn = document.getElementById('mute-btn');

  if (hudGroup) {
    const musicBtn = document.createElement('button');
    musicBtn.id = 'music-toggle-btn';
    musicBtn.title = 'Toggle Background Music';
    musicBtn.textContent = dynamicDJ.musicMuted ? '🔇🎵' : '🎵';
    musicBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: ${dynamicDJ.musicMuted ? '#747d8c' : '#00d2d3'};
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 1.05rem;
      transition: all 0.2s;
    `;

    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dynamicDJ.musicMuted = !dynamicDJ.musicMuted;
      localStorage.setItem('monster_music_muted', dynamicDJ.musicMuted);
      musicBtn.textContent = dynamicDJ.musicMuted ? '🔇🎵' : '🎵';
      musicBtn.style.color = dynamicDJ.musicMuted ? '#747d8c' : '#00d2d3';
      switchMusicTrack(determineDesiredTrack());
    });

    if (muteBtn) {
      hudGroup.insertBefore(musicBtn, muteBtn);
    } else {
      hudGroup.appendChild(musicBtn);
    }
  }
});
