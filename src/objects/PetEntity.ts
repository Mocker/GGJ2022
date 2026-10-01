import Phaser from 'phaser';
import { PetModel } from '../types/pet';
import { SoundService } from '../services/audio';
import { StorageService } from '../services/storage';
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

  // Speech & Thought Bubble Elements
  private bubbleContainer: Phaser.GameObjects.Container | null = null;
  private bubbleTimer: Phaser.Time.TimerEvent | null = null;

  // Screen constraints inside 400x400 LCD (x: 200..600, y: 200..600)
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
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    // Tap/Click response on pet
    this.sprite.on('pointerdown', () => this.onPetTapped());

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
      this.showSpeechBubble('Delicious! 🍖✨');
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
    this.showSpeechBubble('Hey! Be gentle! 💢');
  }

  public onPetTapped(): void {
    if (this.isBusy) return;

    if (this.petData.stage === 'egg') {
      SoundService.getInstance().playSwipe(1);
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.15,
        scaleY: 0.85,
        duration: 90,
        yoyo: true,
        repeat: 2,
      });
      this.showSpeechBubble('*tap tap* ...warm egg wiggles! 🐣');
      return;
    }

    if (this.petData.isSleeping) {
      this.showSpeechBubble('Zzz... so cozy... 💤');
      return;
    }

    if (this.petData.status === 'sick') {
      this.showSpeechBubble('Oof... need medicine... 💀');
      return;
    }

    if ((this.petData.stats.poopCount ?? 0) > 0) {
      this.showSpeechBubble('Time for a bath please! 💩');
      return;
    }

    if (this.petData.stats.hunger.current <= 30) {
      this.showSpeechBubble('My tummy is rumbling! 🍖');
      return;
    }

    // Playful bounce reaction
    SoundService.getInstance().playCry(this.petData.type);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 1.25,
      scaleX: 0.85,
      duration: 120,
      yoyo: true,
      repeat: 1,
    });

    // Award micro-happiness
    StorageService.getInstance().updateCurrentPet((p) => {
      p.stats.happiness.current = Math.min(100, p.stats.happiness.current + 3);
    });

    // Contextual personality dialogue
    const pool = [
      `Ready to train! ⚡`,
      `You're the best tamer! 💖`,
      `Feeling energetic today! ✨`,
      `Let's do a focus sprint! 🧘`,
      `Training makes me strong! 💪`,
      `Level ${this.petData.stats.level} and climbing! ⭐`,
      `Colosseum gauntlet time? ⚔️`,
      `The digital horizon is bright! 🌐`,
    ];

    if (this.petData.genome) {
      const trait = this.petData.genome.traits[0] || 'Pure';
      pool.push(`Genome trait: [${trait}] 🧬`);
      pool.push(`Gen ${this.petData.stats.generation} legacy! 🏛️`);
    }

    const phrase = pool[Math.floor(Math.random() * pool.length)];
    this.showSpeechBubble(phrase);
  }

  public showSpeechBubble(message: string, durationMs = 2800): void {
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
      this.bubbleContainer = null;
    }
    if (this.bubbleTimer) {
      this.bubbleTimer.remove();
      this.bubbleTimer = null;
    }

    const bubbleX = Phaser.Math.Clamp(this.sprite.x, 290, 510);
    const bubbleY = this.sprite.y - 110;

    this.bubbleContainer = this.scene.add.container(bubbleX, bubbleY).setDepth(26);

    const txt = this.scene.add.text(0, -2, message, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#090d16',
      align: 'center',
    }).setOrigin(0.5);

    const bubbleWidth = Math.max(80, txt.width + 20);
    const bubbleHeight = 28;

    const gfx = this.scene.add.graphics();
    // Bubble background
    gfx.fillStyle(0x38bdf8, 0.95);
    gfx.lineStyle(1.5, 0x090d16, 1);
    gfx.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 6);
    gfx.strokeRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 6);

    // Pointer notch pointing down towards pet
    gfx.fillTriangle(0, bubbleHeight / 2 + 5, -5, bubbleHeight / 2, 5, bubbleHeight / 2);
    gfx.strokeTriangle(0, bubbleHeight / 2 + 5, -5, bubbleHeight / 2, 5, bubbleHeight / 2);

    this.bubbleContainer.add([gfx, txt]);

    // Pop-in scale bounce tween
    this.bubbleContainer.setScale(0.5);
    this.scene.tweens.add({
      targets: this.bubbleContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });

    this.bubbleTimer = this.scene.time.delayedCall(durationMs, () => {
      if (this.bubbleContainer) {
        this.scene.tweens.add({
          targets: this.bubbleContainer,
          alpha: 0,
          scaleY: 0.5,
          duration: 150,
          onComplete: () => {
            if (this.bubbleContainer) {
              this.bubbleContainer.destroy();
              this.bubbleContainer = null;
            }
          },
        });
      }
    });
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
        this.showSpeechBubble('Sparkling fresh! 🚿✨');
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
            // Occasional spontaneous wandering thought
            if (Math.random() < 0.3 && !this.isBusy && !this.petData.isSleeping) {
              const thoughts = ['✨', '🍖', '⚔️', '💡', '🎵', '👀', '💖', '⭐'];
              this.showSpeechBubble(thoughts[Math.floor(Math.random() * thoughts.length)], 1600);
            }
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
    if (this.bubbleContainer) this.bubbleContainer.destroy();
    if (this.bubbleTimer) this.bubbleTimer.remove();
    if (this.zzzText) this.zzzText.destroy();
    if (this.sickText) this.sickText.destroy();
    this.poopSprites.forEach((s) => s.destroy());
    this.sprite.destroy();
  }
}
