/**
 * src/audio.js - Sistema de Áudio Procedural Sintético (Web Audio API)
 * Inclui síntese exata da Splash FluidCleb Interactive, ambiência gótica e SFX de combate.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.muted = false;
    this.sfxEnabled = true;
    this.bgmEnabled = true;
    this.bgmNodes = [];
    this.isBgmPlaying = false;
    this.initialized = false;

    // Listener para anúncios CrazyGames
    if (typeof window !== 'undefined') {
      window.addEventListener('crazygames_ad_start', () => this.setMuted(true));
      window.addEventListener('crazygames_ad_end', () => this.setMuted(false));
    }
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('Erro ao inicializar AudioContext:', e);
    }
  }

  setMuted(mute) {
    this.muted = mute;
    if (!this.masterGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.muted ? 0.0001 : 0.85, now);
    } catch {}
  }

  // ==========================================================
  // ÁUDIO OBRIGATÓRIO DA INTRO FLUIDCLEB INTERACTIVE
  // ==========================================================
  playFluidClebIntro() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.65);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch {}
  }

  playFluidFusion() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } catch {}
  }

  playFluidEject() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.65);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch {}
  }

  // ==========================================================
  // EFEITOS SONOROS DE GAMEPLAY & FORJA
  // ==========================================================
  playForgeHammer() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Golpe metálico na bigorna
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      // Ressonância metálica
      const resOsc = this.ctx.createOscillator();
      const resGain = this.ctx.createGain();
      resOsc.type = 'triangle';
      resOsc.frequency.setValueAtTime(1850, now);
      resOsc.frequency.exponentialRampToValueAtTime(1600, now + 0.4);
      resGain.gain.setValueAtTime(0.2, now);
      resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      resOsc.connect(resGain);
      resGain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.35);
      resOsc.start(now);
      resOsc.stop(now + 0.5);
    } catch {}
  }

  playBloodPickup() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(650 + Math.random() * 100, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  playSlash() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  playFireExplosion() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  playFrostNova() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playBossRoar() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch {}
  }

  playLevelUp() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const start = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }

  playItemDrop() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  playPlayerHurt() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  playDash() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  playReviveAura() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.4);
    } catch {}
  }

  playButtonClick() {
    if (!this.sfxEnabled || this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // ==========================================================
  // AMBIÊNCIA BGM PROCEDURAL (Hub & Combate Sombrio)
  // ==========================================================
  startGothicBgm(type = 'combat') {
    if (this.isBgmPlaying) return;
    this.init();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;
    try {
      const now = this.ctx.currentTime;
      // Drone contínuo grave em D menor (Re Menor)
      const droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(73.42, now); // D2

      // LFO para pulsação sombria lenta
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2, now);
      lfoGain.gain.setValueAtTime(0.08, now);
      lfo.connect(lfoGain);
      lfoGain.connect(droneGain.gain);

      droneGain.gain.setValueAtTime(0.18, now);
      droneOsc.connect(droneGain);
      droneGain.connect(this.bgmGain);

      droneOsc.start(now);
      lfo.start(now);

      this.bgmNodes = [droneOsc, lfo, droneGain, lfoGain];
    } catch (e) {
      console.warn('Erro ao iniciar BGM:', e);
    }
  }

  stopBgm() {
    this.isBgmPlaying = false;
    this.bgmNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {}
    });
    this.bgmNodes = [];
  }
}

export const audio = new AudioManager();
