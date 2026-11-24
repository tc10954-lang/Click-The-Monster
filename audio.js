class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmInterval = null;
    this.step = 0;
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
    if (this.muted) return;
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

  playNoise(duration, vol = 0.15) {
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
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  startMusic() {
    this.stopMusic();
    this.init();
    const bassline = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    this.step = 0;
    this.bgmInterval = setInterval(() => {
      if (this.muted) return;
      const note = bassline[this.step % bassline.length];
      this.playTone(note, 'triangle', 0.16, 0.05);
      this.step++;
    }, 220);
  }

  stopMusic() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

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
