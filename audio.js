class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmInterval = null;
    this.step = 0;
    this.isBossMusic = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, vol = 0.15, slideFreq = null) {
    if (this.muted || !freq) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playNoise(duration, vol = 0.15, filterType = 'lowpass', freq = 1000) {
    if (this.muted) return;
    this.init();
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  // --- Multi-Track Arcade Sequencer ---
  startMusic(bossMode = false) {
    this.stopMusic();
    this.init();
    this.isBossMusic = bossMode;
    this.step = 0;

    // 16-step A-minor arcade loop
    const normalBass = [110, 0, 110, 130.81, 146.83, 0, 130.81, 98, 110, 0, 110, 164.81, 146.83, 130.81, 98, 0];
    const normalLead = [440, 0, 523.25, 0, 659.25, 587.33, 523.25, 0, 493.88, 0, 523.25, 587.33, 659.25, 0, 392, 0];

    // Faster, darker D-minor Boss theme
    const bossBass   = [73.42, 73.42, 87.31, 73.42, 98, 73.42, 110, 98, 73.42, 73.42, 87.31, 73.42, 116.54, 110, 87.31, 82.41];
    const bossLead   = [293.66, 349.23, 440, 0, 466.16, 440, 349.23, 0, 329.63, 392, 493.88, 0, 587.33, 523.25, 466.16, 440];

    const tempoMs = bossMode ? 125 : 165;

    this.bgmInterval = setInterval(() => {
      if (this.muted) return;
      const idx = this.step % 16;

      // Bass track
      const bassNote = bossMode ? bossBass[idx] : normalBass[idx];
      if (bassNote) this.playTone(bassNote, 'triangle', 0.14, 0.055);

      // Lead melody track
      const leadNote = bossMode ? bossLead[idx] : normalLead[idx];
      if (leadNote) this.playTone(leadNote, 'square', 0.12, 0.025);

      // Percussion (Kick on 0,4,8,12 | Snare on 4,12 | Hi-hat on off-beats)
      if (idx % 4 === 0) this.playTone(95, 'sine', 0.09, 0.08, 35);
      if (idx === 4 || idx === 12) this.playNoise(0.08, 0.045, 'highpass', 800);
      if (idx % 2 === 1) this.playNoise(0.03, 0.018, 'highpass', 5000);

      this.step++;
    }, tempoMs);
  }

  stopMusic() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // --- Sound Effects ---
  hit(combo) {
    const pitch = Math.min(280 + combo * 24, 920);
    this.playTone(pitch, 'square', 0.11, 0.12, pitch * 1.45);
    this.playNoise(0.06, 0.08);
  }

  armorHit() {
    this.playTone(160, 'sawtooth', 0.1, 0.15, 95);
  }

  miss() {
    this.playTone(115, 'triangle', 0.14, 0.1, 60);
  }

  milestone() {
    this.playTone(440, 'sine', 0.14, 0.16);
    setTimeout(() => this.playTone(587.33, 'sine', 0.24, 0.16), 95);
  }

  powerup() {
    this.playTone(523.25, 'sine', 0.1, 0.15);
    setTimeout(() => this.playTone(783.99, 'sine', 0.12, 0.15), 70);
    setTimeout(() => this.playTone(1046.5, 'sine', 0.2, 0.15), 140);
  }

  bomb() {
    this.playTone(130, 'sawtooth', 0.4, 0.22, 32);
    this.playNoise(0.35, 0.25);
  }

  bossSpawn() {
    this.playTone(110, 'sawtooth', 0.6, 0.22, 48);
    this.playNoise(0.45, 0.18);
    this.startMusic(true); // Automatically switches to fast Boss Battle theme!
  }

  victory() {
    this.stopMusic();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'triangle', 0.3, 0.18), i * 110);
    });
  }
}

const sfx = new SoundFX();
