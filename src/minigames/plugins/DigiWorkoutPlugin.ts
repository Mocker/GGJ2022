import Phaser from 'phaser';
import { MiniGamePlugin, MiniGameContext, MiniGameCategory } from '../types';
import { SoundService } from '../../services/audio';

export class DigiWorkoutPlugin implements MiniGamePlugin {
  public readonly id = 'digi-workout';
  public readonly name = 'Digi-Workout';
  public readonly icon = '⚡';
  public readonly category: MiniGameCategory = 'reflex';
  public readonly description = 'Precision timing workout. Tap in the green zone!';
  public readonly trainsStat = 'attack';

  private ctx!: MiniGameContext;
  private elements: Phaser.GameObjects.GameObject[] = [];
  private indicator!: Phaser.GameObjects.Graphics;
  private powerBarGfx!: Phaser.GameObjects.Graphics;
  private promptText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private petSprite!: Phaser.GameObjects.Sprite;

  private indicatorX = 300;
  private indicatorSpeed = 260;
  private minX = 260;
  private maxX = 540;
  private targetMin = 375;
  private targetMax = 425;

  private round = 1;
  private maxRounds = 3;
  private hits = 0;
  private isRoundActive = true;

  init(context: MiniGameContext): void {
    this.ctx = context;
    const { scene, container, mask, pet } = context;

    this.roundText = scene.add.text(400, 255, 'ROUND 1 / 3', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#94a3b8',
    }).setOrigin(0.5).setMask(mask);

    const petKey = pet && pet.stage !== 'egg' ? `pet-${pet.type === 'bacteria' ? 'germ' : pet.type}-idle` : 'pet-tadpole-idle';
    this.petSprite = scene.add.sprite(400, 360, petKey)
      .setDisplaySize(140, 140)
      .setDepth(10)
      .setMask(mask);
    if (scene.anims.exists(petKey)) {
      this.petSprite.play({ key: petKey, repeat: -1 });
    }

    this.powerBarGfx = scene.add.graphics().setMask(mask);
    this.drawPowerBar();

    this.indicator = scene.add.graphics().setMask(mask);
    this.updateIndicatorGfx();

    this.promptText = scene.add.text(400, 520, 'TAP [2 / SPACE] IN GREEN ZONE!', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    this.scoreText = scene.add.text(400, 545, 'SCORE: 0', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    this.elements.push(this.roundText, this.petSprite, this.powerBarGfx, this.indicator, this.promptText, this.scoreText);
    container.add(this.elements);

    this.round = 1;
    this.hits = 0;
    this.isRoundActive = true;
    this.indicatorX = this.minX;
    this.indicatorSpeed = 260;
  }

  private drawPowerBar(): void {
    this.powerBarGfx.clear();
    this.powerBarGfx.fillStyle(0x1e293b, 1);
    this.powerBarGfx.fillRoundedRect(this.minX, 460, this.maxX - this.minX, 22, 6);

    this.powerBarGfx.fillStyle(0x10b981, 0.85);
    this.powerBarGfx.fillRoundedRect(this.targetMin, 460, this.targetMax - this.targetMin, 22, 4);

    this.powerBarGfx.lineStyle(2, 0x38bdf8, 0.8);
    this.powerBarGfx.strokeRoundedRect(this.minX, 460, this.maxX - this.minX, 22, 6);
  }

  private updateIndicatorGfx(): void {
    this.indicator.clear();
    this.indicator.fillStyle(0xfacc15, 1);
    this.indicator.fillRect(this.indicatorX - 3, 456, 6, 30);
  }

  update(_time: number, delta: number): void {
    if (!this.isRoundActive) return;

    this.indicatorX += this.indicatorSpeed * (delta / 1000);

    if (this.indicatorX >= this.maxX) {
      this.indicatorX = this.maxX;
      this.indicatorSpeed = -Math.abs(this.indicatorSpeed);
    } else if (this.indicatorX <= this.minX) {
      this.indicatorX = this.minX;
      this.indicatorSpeed = Math.abs(this.indicatorSpeed);
    }

    this.updateIndicatorGfx();
  }

  handleButton(btn: 1 | 2 | 3): void {
    if (btn === 2 && this.isRoundActive) {
      this.evaluateHit();
    }
  }

  private evaluateHit(): void {
    this.isRoundActive = false;
    const isHit = this.indicatorX >= this.targetMin && this.indicatorX <= this.targetMax;

    if (isHit) {
      this.hits++;
      SoundService.getInstance().playMoney();
      this.promptText.setText('⭐ PERFECT TIMING! ⭐');
      this.promptText.setColor('#10b981');

      this.ctx.scene.tweens.add({
        targets: this.petSprite,
        y: 330,
        duration: 150,
        yoyo: true,
        repeat: 2,
      });
    } else {
      SoundService.getInstance().playBack();
      this.promptText.setText('MISS! Off target!');
      this.promptText.setColor('#f43f5e');
      this.ctx.scene.cameras.main.shake(120, 0.01);
    }

    this.scoreText.setText(`SCORE: ${this.hits} / ${this.round}`);

    this.ctx.scene.time.delayedCall(1200, () => {
      this.round++;
      if (this.round > this.maxRounds) {
        this.finishGame();
      } else {
        this.startNextRound();
      }
    });
  }

  private startNextRound(): void {
    this.roundText.setText(`ROUND ${this.round} / ${this.maxRounds}`);
    this.promptText.setText('TAP [2 / SPACE] IN GREEN ZONE!');
    this.promptText.setColor('#facc15');
    this.indicatorX = this.minX;
    this.indicatorSpeed = (260 + this.round * 40) * (Math.random() > 0.5 ? 1 : -1);
    this.isRoundActive = true;
  }

  private finishGame(): void {
    const earnedCoins = this.hits * 3 + 2;
    this.ctx.onGameOver({
      exp: this.hits * 25 + 10,
      coins: earnedCoins,
      statBonus: { stat: 'attack', value: this.hits },
      summary: `WORKOUT COMPLETE! +${earnedCoins}🪙 +${this.hits} ATK`,
    });
  }

  destroy(): void {
    this.elements.forEach((e) => e.destroy());
    this.elements = [];
  }
}
