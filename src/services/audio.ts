import Phaser from 'phaser';
import { StorageService } from './storage';

export class SoundService {
  private static instance: SoundService;
  private soundManager: Phaser.Sound.BaseSoundManager | null = null;
  private isUnlocked = false;
  private audioCtx: AudioContext | null = null;
  private bgmInterval: number | null = null;
  private currentBgmTrack: 'ambient' | 'battle' | 'focus' | null = null;

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
    } else if (this.currentBgmTrack) {
      this.startBgmLoop(this.currentBgmTrack);
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
