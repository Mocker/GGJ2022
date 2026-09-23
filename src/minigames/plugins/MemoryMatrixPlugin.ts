import Phaser from 'phaser';
import { MiniGamePlugin, MiniGameContext, MiniGameCategory } from '../types';
import { SoundService } from '../../services/audio';

export class MemoryMatrixPlugin implements MiniGamePlugin {
  public readonly id = 'memory-matrix';
  public readonly name = 'Memory Matrix';
  public readonly icon = '🧩';
  public readonly category: MiniGameCategory = 'puzzle';
  public readonly description = 'Cyber pattern recall puzzle. Memorize and repeat!';
  public readonly trainsStat = 'discipline';

  private ctx!: MiniGameContext;
  private elements: Phaser.GameObjects.GameObject[] = [];

  private roundText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private sequenceDisplay!: Phaser.GameObjects.Text;
  private pads: Phaser.GameObjects.Graphics[] = [];

  private round = 1;
  private maxRounds = 3;
  private currentSequence: (1 | 2 | 3)[] = [];
  private playerInputIdx = 0;
  private state: 'SHOWING' | 'PLAYER' | 'RESULT' = 'SHOWING';
  private successfulRounds = 0;

  init(context: MiniGameContext): void {
    this.ctx = context;
    const { scene, container, mask } = context;

    this.roundText = scene.add.text(400, 255, 'ROUND 1 / 3', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#94a3b8',
    }).setOrigin(0.5).setMask(mask);

    this.sequenceDisplay = scene.add.text(400, 310, 'WATCH SEQUENCE...', {
      fontFamily: 'beryl-digivice',
      fontSize: '16px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    // 3 Visual Pads on LCD screen: Left (280, 420), Mid (400, 420), Right (520, 420)
    const padCoords = [280, 400, 520];
    padCoords.forEach((x, idx) => {
      const pad = scene.add.graphics().setMask(mask);
      this.drawPad(pad, x, 420, 0x1e293b, 0x38bdf8);
      this.pads.push(pad);

      const label = scene.add.text(x, 420, String(idx + 1), {
        fontFamily: 'beryl-digivice',
        fontSize: '20px',
        color: '#94a3b8',
      }).setOrigin(0.5).setMask(mask);
      this.elements.push(label);
    });

    this.promptText = scene.add.text(400, 520, 'MEMORIZE THE FLASHES!', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    this.elements.push(this.roundText, this.sequenceDisplay, ...this.pads, this.promptText);
    container.add(this.elements);

    this.round = 1;
    this.successfulRounds = 0;
    this.startRound();
  }

  private drawPad(gfx: Phaser.GameObjects.Graphics, x: number, y: number, fill: number, stroke: number): void {
    gfx.clear();
    gfx.fillStyle(fill, 1);
    gfx.fillCircle(x, y, 36);
    gfx.lineStyle(3, stroke, 1);
    gfx.strokeCircle(x, y, 36);
  }

  private startRound(): void {
    this.state = 'SHOWING';
    this.roundText.setText(`ROUND ${this.round} / ${this.maxRounds}`);
    this.sequenceDisplay.setText('WATCH PATTERN...');
    this.promptText.setText('MEMORIZE THE FLASHES!');
    this.promptText.setColor('#facc15');

    // Generate sequence: round 1 has 3 items, round 2 has 4, round 3 has 5
    const seqLen = 2 + this.round;
    this.currentSequence = [];
    for (let i = 0; i < seqLen; i++) {
      this.currentSequence.push((Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3);
    }

    this.playerInputIdx = 0;
    this.playSequence();
  }

  private playSequence(): void {
    let step = 0;
    const playNext = () => {
      if (step >= this.currentSequence.length) {
        this.ctx.scene.time.delayedCall(400, () => {
          this.state = 'PLAYER';
          this.sequenceDisplay.setText('YOUR TURN! [1] [2] [3]');
          this.promptText.setText(`REPEAT ${this.currentSequence.length} STEPS`);
          this.promptText.setColor('#10b981');
        });
        return;
      }

      const btn = this.currentSequence[step];
      this.flashPad(btn);
      step++;
      this.ctx.scene.time.delayedCall(650, playNext);
    };

    this.ctx.scene.time.delayedCall(600, playNext);
  }

  private flashPad(btn: 1 | 2 | 3): void {
    const pad = this.pads[btn - 1];
    const x = [280, 400, 520][btn - 1];
    SoundService.getInstance().playSwipe(btn === 2 ? 2 : 1);

    this.drawPad(pad, x, 420, 0x38bdf8, 0xfacc15);
    this.ctx.scene.time.delayedCall(300, () => {
      this.drawPad(pad, x, 420, 0x1e293b, 0x38bdf8);
    });
  }

  handleButton(btn: 1 | 2 | 3): void {
    if (this.state !== 'PLAYER') return;

    this.flashPad(btn);
    const expected = this.currentSequence[this.playerInputIdx];

    if (btn === expected) {
      this.playerInputIdx++;
      if (this.playerInputIdx >= this.currentSequence.length) {
        // Round cleared
        this.successfulRounds++;
        this.state = 'RESULT';
        SoundService.getInstance().playMoney();
        this.sequenceDisplay.setText('⭐ PATTERN MATCHED! ⭐');
        this.promptText.setText('+Discipline bonus earned!');
        this.promptText.setColor('#10b981');

        this.ctx.scene.time.delayedCall(1200, () => {
          this.round++;
          if (this.round > this.maxRounds) {
            this.finishGame();
          } else {
            this.startRound();
          }
        });
      }
    } else {
      // Mistake
      this.state = 'RESULT';
      SoundService.getInstance().playBack();
      this.ctx.scene.cameras.main.shake(120, 0.015);
      this.sequenceDisplay.setText('PATTERN MISMATCH!');
      this.promptText.setText('Wrong step entered!');
      this.promptText.setColor('#f43f5e');

      this.ctx.scene.time.delayedCall(1400, () => {
        this.round++;
        if (this.round > this.maxRounds) {
          this.finishGame();
        } else {
          this.startRound();
        }
      });
    }
  }

  private finishGame(): void {
    const coins = this.successfulRounds * 4 + 2;
    this.ctx.onGameOver({
      exp: this.successfulRounds * 30 + 15,
      coins,
      statBonus: { stat: 'discipline', value: this.successfulRounds * 5 },
      summary: `PUZZLE COMPLETE! +${coins}🪙 +${this.successfulRounds * 5}% Discipline`,
    });
  }

  destroy(): void {
    this.elements.forEach((e) => e.destroy());
    this.elements = [];
    this.pads = [];
  }
}
