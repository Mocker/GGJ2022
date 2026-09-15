import Phaser from 'phaser';

export class SoundService {
  private static instance: SoundService;
  private soundManager: Phaser.Sound.BaseSoundManager | null = null;
  private isUnlocked = false;

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
      this.isUnlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  public play(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.soundManager) return;
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
}
