import Phaser from 'phaser';
import { StorageService } from './storage';

export class SoundService {
  private static instance: SoundService;
  private soundManager: Phaser.Sound.BaseSoundManager | null = null;
  private isUnlocked = false;
  private audioCtx: AudioContext | null = null;
  private bgmInterval: number | null = null;
  private currentBgmTrack: 'ambient' | 'battle' | 'focus' | null = null;
  private activeSoundscapeTrack: 'off' | 'rain' | 'drone' | 'matrix' = 'off';
  private soundscapeStopFn: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  public init(soundManager: Phaser.Sound.BaseSoundManager): void {
    this.soundManager = soundManager;
    this.setupGestureUnlock();
  }

  private setupGestureUnlock(): void {
    const unlock = () => {
      const sm = this.soundManager as unknown as { context?: AudioContext; unlock?: () => void };
      if (sm) {
        if (typeof sm.unlock === 'function') {
          sm.unlock();
        }
        if (sm.context && sm.context.state === 'suspended') {
          sm.context.resume().catch(() => {});
        }
      }
      try {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass && !this.audioCtx) {
          this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
      } catch (e) {
        console.warn('AudioContext setup warning:', e);
      }

      this.isUnlocked = true;
      if (this.currentBgmTrack) {
        this.startBgmLoop(this.currentBgmTrack);
      }
      const savedSoundscape = StorageService.getInstance().getActiveSoundscape();
      if (savedSoundscape && savedSoundscape !== 'off') {
        this.startSoundscape(savedSoundscape);
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  public isEnabled(): boolean {
    return StorageService.getInstance().isSoundEnabled();
  }

  public toggleMute(): boolean {
    const current = this.isEnabled();
    const next = !current;
    StorageService.getInstance().setSoundEnabled(next);
    if (!next) {
      this.stopBgm();
      this.stopSoundscape();
    } else {
      if (this.currentBgmTrack) {
        this.startBgmLoop(this.currentBgmTrack);
      }
      const savedSoundscape = StorageService.getInstance().getActiveSoundscape();
      if (savedSoundscape && savedSoundscape !== 'off') {
        this.startSoundscape(savedSoundscape);
      }
    }
    return next;
  }

  public play(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.isEnabled() || !this.soundManager) return;
    try {
      if (this.soundManager.get(key)) {
        this.soundManager.play(key, config);
      }
    } catch (e) {
      console.warn(`Could not play sound '${key}':`, e);
    }
  }

  public playSelect(): void {
    this.play('sfx-select', { volume: 0.6 });
  }

  public playBack(): void {
    this.play('sfx-back', { volume: 0.6 });
  }

  public playStartup(): void {
    this.play('sfx-startup', { volume: 0.8 });
  }

  public playEat(): void {
    this.play('sfx-eat', { volume: 0.7 });
  }

  public playHatch(): void {
    this.play('sfx-hatch', { volume: 0.8 });
  }

  public playEvolve(): void {
    this.play('sfx-evolve', { volume: 0.8 });
  }

  public playMoney(): void {
    this.play('sfx-money', { volume: 0.7 });
  }

  public playSwipe(variant: 1 | 2 = 1): void {
    this.play(variant === 1 ? 'sfx-swipe-1' : 'sfx-swipe-2', { volume: 0.6 });
  }

  public playCry(type: string): void {
    const key = `sfx-cry-${type}`;
    this.play(key, { volume: 0.7 });
  }

  public playWaterSplash(): void {
    if (!this.isEnabled()) return;
    try {
      this.ensureAudioCtx();
      if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
      const ctx = this.audioCtx;
      const t = ctx.currentTime;

      // Gentle bubbling frequency pitch bend
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.18);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch (e) {}
  }

  public playStretchChime(): void {
    if (!this.isEnabled()) return;
    // Soothing A-major meditative chord (A4, C#5, E5, A5)
    const chord = [440.00, 554.37, 659.25, 880.00];
    chord.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.playChiptuneNote(freq, 0.9, 'triangle', 0.035);
      }, idx * 100);
    });
  }

  public playStreakCelebration(): void {
    if (!this.isEnabled()) return;
    // Energetic ascending fanfare (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.playChiptuneNote(freq, 0.35, 'sawtooth', 0.04);
      }, idx * 80);
    });
  }

  private ensureAudioCtx(): void {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
    }
  }

  // --- Procedural Focus Soundscapes ---
  public startSoundscape(type: 'off' | 'rain' | 'drone' | 'matrix'): void {
    this.stopSoundscape();
    this.activeSoundscapeTrack = type;
    StorageService.getInstance().setActiveSoundscape(type);

    if (type === 'off' || !this.isEnabled()) return;

    this.ensureAudioCtx();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
    const ctx = this.audioCtx;

    if (type === 'rain') {
      // 1. Procedural Cyber Rain (Filtered Noise + Soft Rain Drops)
      try {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.1;
          b2 = 0.85 * b2 + white * 0.2;
          output[i] = (b0 + b1 + b2) * 0.4;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(850, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);

        // Slow LFO for rainfall intensity wave
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.18, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(200, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.045, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(rainGain);
        rainGain.connect(ctx.destination);

        whiteNoise.start();
        lfo.start();

        // Random roof droplets
        const dropInterval = window.setInterval(() => {
          if (!this.isEnabled() || this.activeSoundscapeTrack !== 'rain') return;
          if (Math.random() < 0.6) {
            const dropFreq = 1600 + Math.random() * 800;
            this.playChiptuneNote(dropFreq, 0.04, 'sine', 0.012);
          }
        }, 500);

        this.soundscapeStopFn = () => {
          window.clearInterval(dropInterval);
          try {
            whiteNoise.stop();
            lfo.stop();
            whiteNoise.disconnect();
            lfo.disconnect();
            filter.disconnect();
            rainGain.disconnect();
          } catch (e) {}
        };
      } catch (e) {
        console.warn('Rain soundscape error:', e);
      }
    } else if (type === 'drone') {
      // 2. Procedural Deep Space Drone (Binaural delta 55Hz & 55.8Hz)
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const droneFilter = ctx.createBiquadFilter();
        const droneGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(55.0, ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(55.8, ctx.currentTime); // ~0.8Hz binaural delta

        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(140, ctx.currentTime);

        droneGain.gain.setValueAtTime(0.05, ctx.currentTime);

        osc1.connect(droneFilter);
        osc2.connect(droneFilter);
        droneFilter.connect(droneGain);
        droneGain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        this.soundscapeStopFn = () => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            droneFilter.disconnect();
            droneGain.disconnect();
          } catch (e) {}
        };
      } catch (e) {
        console.warn('Drone soundscape error:', e);
      }
    } else if (type === 'matrix') {
      // 3. Procedural Matrix / Data Stream (Cyber pulses)
      try {
        const matrixNotes = [329.63, 392.00, 440.00, 493.88, 523.25, 659.25];
        let idx = 0;
        const interval = window.setInterval(() => {
          if (!this.isEnabled() || this.activeSoundscapeTrack !== 'matrix') return;
          const freq = matrixNotes[idx % matrixNotes.length];
          this.playChiptuneNote(freq, 0.08, 'triangle', 0.02);
          idx++;
        }, 220);

        this.soundscapeStopFn = () => {
          window.clearInterval(interval);
        };
      } catch (e) {
        console.warn('Matrix soundscape error:', e);
      }
    }
  }

  public stopSoundscape(): void {
    if (this.soundscapeStopFn) {
      try {
        this.soundscapeStopFn();
      } catch (e) {}
      this.soundscapeStopFn = null;
    }
    this.activeSoundscapeTrack = 'off';
  }

  public getActiveSoundscape(): 'off' | 'rain' | 'drone' | 'matrix' {
    return this.activeSoundscapeTrack;
  }

  // --- Procedural 8-bit Chiptune Synthesizer ---
  public playBgm(track: 'ambient' | 'battle' | 'focus'): void {
    this.currentBgmTrack = track;
    if (!this.isEnabled()) return;
    this.startBgmLoop(track);
  }

  public stopBgm(): void {
    if (this.bgmInterval !== null) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  private startBgmLoop(track: 'ambient' | 'battle' | 'focus'): void {
    this.stopBgm();
    if (!this.isEnabled()) return;

    // Frequencies (Hz) for retro pentatonic tunes
    const ambientMelody = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 329.63]; // C-D-E-G-A-C5
    const battleMelody = [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00, 392.00]; // Energetic minor
    const focusMelody = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 329.63, 261.63]; // Calm ambient

    const notes = track === 'battle' ? battleMelody : track === 'focus' ? focusMelody : ambientMelody;
    const intervalMs = track === 'battle' ? 240 : track === 'focus' ? 600 : 380;
    let noteIdx = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.isEnabled()) return;
      const freq = notes[noteIdx % notes.length];
      this.playChiptuneNote(freq, intervalMs / 1000 * 0.7, track === 'battle' ? 'sawtooth' : 'triangle', 0.05);
      noteIdx++;
    }, intervalMs);
  }

  private playChiptuneNote(freq: number, duration: number, wave: OscillatorType = 'triangle', vol = 0.04): void {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
      }
      if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = wave;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio note failed silently
    }
  }
}
