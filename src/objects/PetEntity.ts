import Phaser from 'phaser';
import { PetModel, PetType } from '../types/pet';
import { SoundService } from '../services/audio';

import { expressPhenotype } from '../genetics/evolutionEngine';

export class PetEntity {
  public scene: Phaser.Scene;
  public petData: PetModel;
  public sprite: Phaser.GameObjects.Sprite;
  public isBusy = false;
  private wanderTimer: Phaser.Time.TimerEvent | null = null;
  private poopSprites: Phaser.GameObjects.Text[] = [];
  private zzzText: Phaser.GameObjects.Text | null = null;
  private sickText: Phaser.GameObjects.Text | null = null;
  private traitBadge: Phaser.GameObjects.Text | null = null;

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

    // Apply procedural genetic phenotype
    if (this.petData.genome) {
      const pheno = expressPhenotype(this.petData.genome);
      if (this.petData.stage !== 'egg') {
        this.sprite.setTint(pheno.tintHex);
        const sz = 200 * pheno.scaleMultiplier;
        this.sprite.setDisplaySize(sz, sz);
      }
    }

    this.playIdle();
    this.startWanderLoop();
    this.updateStatusVisuals();
  }

  public getIdleAnimKey(): string {
    if (this.petData.stage === 'egg') {
      return `pet-${this.petData.eggType}-idle`;
    }
    if (this.petData.isSleeping) {
      const typeKey = this.petData.type === 'bacteria' ? 'germ' : this.petData.type;
      const sleepKey = `pet-${typeKey}-sleep`;
      if (this.scene.anims.exists(sleepKey)) return sleepKey;
    }
    const typeKey = this.petData.type === 'bacteria' ? 'germ' : this.petData.type;
    return `pet-${typeKey}-idle`;
  }

  public getAnimKey(action: string): string {
    if (this.petData.stage === 'egg') {
      return `pet-${this.petData.eggType}-${action}`;
    }
    const typeKey = this.petData.type === 'bacteria' ? 'germ' : this.petData.type;
    let act = action;
    if (action === 'eat' && typeKey === 'germ') act = 'chomp';
    if (action === 'eat' && typeKey === 'snuffler') act = 'eating';
    if (action === 'sick' && typeKey === 'tadpole') act = 'weak';
    if (action === 'sick' && typeKey === 'sunfish') act = 'weak';
    if (action === 'sick' && typeKey === 'snuffler') act = 'hurt';

    const testKey = `pet-${typeKey}-${act}`;
    return this.scene.anims.exists(testKey) ? testKey : this.getIdleAnimKey();
  }

  public playIdle(): void {
    if (this.sprite && this.sprite.active) {
      if (this.petData.isSleeping) {
        const sleepKey = this.getAnimKey('sleep');
        if (this.scene.anims.exists(sleepKey)) {
          this.sprite.play({ key: sleepKey, repeat: -1 }, true);
          return;
        }
      }
      if (this.petData.status === 'sick') {
        const sickKey = this.getAnimKey('sick');
        if (this.scene.anims.exists(sickKey)) {
          this.sprite.play({ key: sickKey, repeat: -1 }, true);
          return;
        }
      }
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

  public updateStatusVisuals(): void {
    // 1. Sleep Zzz Indicator
    if (this.petData.isSleeping) {
      if (!this.zzzText) {
        this.zzzText = this.scene.add.text(this.sprite.x + 30, this.sprite.y - 70, 'Zzz...', {
          fontFamily: 'beryl-digivice',
          fontSize: '16px',
          color: '#38bdf8',
        }).setDepth(20);

        this.scene.tweens.add({
          targets: this.zzzText,
          y: this.sprite.y - 95,
          alpha: 0.3,
          duration: 1200,
          yoyo: true,
          repeat: -1,
        });
      }
    } else {
      if (this.zzzText) {
        this.zzzText.destroy();
        this.zzzText = null;
      }
    }

    // 2. Sickness Skull / Warning Indicator
    if (this.petData.status === 'sick') {
      if (!this.sickText) {
        this.sickText = this.scene.add.text(this.sprite.x - 40, this.sprite.y - 75, '💀 SICK', {
          fontFamily: 'beryl-digivice',
          fontSize: '13px',
          color: '#f43f5e',
        }).setDepth(20);

        this.scene.tweens.add({
          targets: this.sickText,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 400,
          yoyo: true,
          repeat: -1,
        });
      }
    } else {
      if (this.sickText) {
        this.sickText.destroy();
        this.sickText = null;
      }
    }

    // 3. Poop Display
    this.updatePoopSprites();
  }

  public updatePoopSprites(): void {
    this.poopSprites.forEach((s) => s.destroy());
    this.poopSprites = [];

    const count = this.petData.stats?.poopCount ?? 0;
    const poopPositions = [
      { x: 260, y: 505 },
      { x: 310, y: 515 },
      { x: 490, y: 515 },
      { x: 535, y: 505 },
    ];

    for (let i = 0; i < Math.min(count, poopPositions.length); i++) {
      const pos = poopPositions[i];
      const pText = this.scene.add.text(pos.x, pos.y, '💩', {
        fontSize: '22px',
      }).setOrigin(0.5).setDepth(15);

      this.scene.tweens.add({
        targets: pText,
        y: pos.y - 4,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      this.poopSprites.push(pText);
    }
  }

  public clean(onCleaned?: () => void): void {
    SoundService.getInstance().playSwipe(2);

    // Blue water sweep across 400x400 LCD
    const waterWave = this.scene.add.graphics();
    waterWave.fillStyle(0x38bdf8, 0.6);
    waterWave.fillRect(200, 200, 30, 400);
    waterWave.setDepth(25);

    this.scene.tweens.add({
      targets: waterWave,
      x: 370,
      duration: 600,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        waterWave.destroy();
        this.updatePoopSprites();
        this.playHappy();
        onCleaned?.();
      },
    });
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

  public setSleeping(sleeping: boolean): void {
    this.petData.isSleeping = sleeping;
    if (sleeping) {
      this.stopWanderLoop();
    } else {
      this.startWanderLoop();
    }
    this.playIdle();
    this.updateStatusVisuals();
  }

  private startWanderLoop(): void {
    if (this.petData.stage === 'egg') {
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

    if (this.petData.isSleeping) return;

    this.wanderTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 7000),
      loop: true,
      callback: () => {
        if (this.isBusy || this.petData.isSleeping || Math.random() < 0.35) return;
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
    if (this.zzzText) this.zzzText.destroy();
    if (this.sickText) this.sickText.destroy();
    this.poopSprites.forEach((s) => s.destroy());
    this.sprite.destroy();
  }
}
