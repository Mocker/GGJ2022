import Phaser from 'phaser';
import { PetModel, PetType } from '../types/pet';
import { SoundService } from '../services/audio';

export class PetEntity {
  public scene: Phaser.Scene;
  public petData: PetModel;
  public sprite: Phaser.GameObjects.Sprite;
  public isBusy = false;
  private wanderTimer: Phaser.Time.TimerEvent | null = null;

  // Screen constraints inside 400x400 LCD
  private minX = 280;
  private maxX = 520;
  private groundY = 460;

  constructor(scene: Phaser.Scene, petData: PetModel, x = 400, y = 460) {
    this.scene = scene;
    this.petData = petData;
    this.groundY = y;

    const initialAnim = this.getIdleAnimKey();
    this.sprite = scene.add.sprite(x, y, initialAnim)
      .setDisplaySize(200, 200)
      .setDepth(10);

    this.playIdle();
    this.startWanderLoop();
  }

  public getIdleAnimKey(): string {
    if (this.petData.stage === 'egg') {
      return `pet-${this.petData.eggType}-idle`;
    }
    const typeKey = this.petData.type === 'bacteria' ? 'germ' : this.petData.type;
    return `pet-${typeKey}-idle`;
  }

  public getAnimKey(action: string): string {
    if (this.petData.stage === 'egg') {
      return `pet-${this.petData.eggType}-${action}`;
    }
    const typeKey = this.petData.type === 'bacteria' ? 'germ' : this.petData.type;
    // Map action names according to available atlas keys
    let act = action;
    if (action === 'eat' && typeKey === 'germ') act = 'chomp';
    if (action === 'eat' && typeKey === 'snuffler') act = 'eating';

    const testKey = `pet-${typeKey}-${act}`;
    return this.scene.anims.exists(testKey) ? testKey : this.getIdleAnimKey();
  }

  public playIdle(): void {
    if (this.sprite && this.sprite.active) {
      const idleKey = this.getIdleAnimKey();
      if (this.scene.anims.exists(idleKey)) {
        this.sprite.play({ key: idleKey, repeat: -1 }, true);
      }
    }
  }

  public playAction(actionName: string, durationMs = 1500, onComplete?: () => void): void {
    if (this.isBusy) return;
    this.isBusy = true;

    const animKey = this.getAnimKey(actionName);
    if (this.scene.anims.exists(animKey)) {
      this.sprite.play({ key: animKey, repeat: 0 }, true);
    }

    this.scene.time.delayedCall(durationMs, () => {
      this.isBusy = false;
      this.playIdle();
      onComplete?.();
    });
  }

  public feed(onFed?: () => void): void {
    SoundService.getInstance().playEat();
    this.playAction('eat', 1600, () => {
      SoundService.getInstance().playCry(this.petData.type);
      this.playHappy();
      onFed?.();
    });
  }

  public playHappy(): void {
    this.playAction('happy', 1400);
    // Little jump tween
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.groundY - 30,
      duration: 200,
      yoyo: true,
      repeat: 2,
    });
  }

  public poke(): void {
    SoundService.getInstance().playSwipe(1);
    this.playAction('mad', 1200);
  }

  public clean(): void {
    SoundService.getInstance().playSwipe(2);
    // Sparkle effect
    this.playHappy();
  }

  public hatch(onHatched: () => void): void {
    this.isBusy = true;
    this.stopWanderLoop();
    SoundService.getInstance().playHatch();

    const hatchKey = `pet-${this.petData.eggType}-hatch`;
    const shatterKey = `pet-${this.petData.eggType}-shatter`;

    if (this.scene.anims.exists(hatchKey)) {
      this.sprite.play({ key: hatchKey, repeat: 1 });
    }

    this.scene.time.delayedCall(1600, () => {
      if (this.scene.anims.exists(shatterKey)) {
        this.sprite.play({ key: shatterKey, repeat: 0 });
      }
      SoundService.getInstance().playEvolve();

      this.scene.time.delayedCall(1200, () => {
        onHatched();
      });
    });
  }

  private startWanderLoop(): void {
    if (this.petData.stage === 'egg') {
      // Egg randomly wiggles / peeks
      this.wanderTimer = this.scene.time.addEvent({
        delay: Phaser.Math.Between(4000, 8000),
        loop: true,
        callback: () => {
          if (!this.isBusy && Math.random() > 0.4) {
            const peekKey = `pet-${this.petData.eggType}-peek`;
            if (this.scene.anims.exists(peekKey)) {
              this.playAction('peek', 800);
            }
          }
        },
      });
      return;
    }

    this.wanderTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 7000),
      loop: true,
      callback: () => {
        if (this.isBusy || Math.random() < 0.35) return;
        const targetX = Phaser.Math.Between(this.minX, this.maxX);
        const dist = Math.abs(targetX - this.sprite.x);
        const duration = dist * 14;

        this.sprite.setFlipX(targetX < this.sprite.x);
        const exploreKey = this.getAnimKey('explore');

        if (this.scene.anims.exists(exploreKey)) {
          this.sprite.play({ key: exploreKey, repeat: -1 });
        }

        this.scene.tweens.add({
          targets: this.sprite,
          x: targetX,
          duration,
          ease: 'Linear',
          onComplete: () => {
            this.playIdle();
          },
        });
      },
    });
  }

  public stopWanderLoop(): void {
    if (this.wanderTimer) {
      this.wanderTimer.remove();
      this.wanderTimer = null;
    }
  }

  public destroy(): void {
    this.stopWanderLoop();
    this.sprite.destroy();
  }
}
