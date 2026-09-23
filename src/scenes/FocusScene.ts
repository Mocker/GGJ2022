import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';

export class FocusScene extends Phaser.Scene {
  private timerText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private quoteText!: Phaser.GameObjects.Text;
  private progressGfx!: Phaser.GameObjects.Graphics;
  private petSprite!: Phaser.GameObjects.Sprite;

  private totalSeconds = 25 * 60;
  private remainingSeconds = 25 * 60;
  private isFocusActive = false;
  private isFinished = false;
  private countdownTimer: Phaser.Time.TimerEvent | null = null;
  private selectedDurationIdx = 1; // 0: 15m, 1: 25m, 2: 45m, 3: 30s Demo

  private durations = [
    { label: '15m Sprint', seconds: 15 * 60 },
    { label: '25m Pomodoro', seconds: 25 * 60 },
    { label: '45m Deep Flow', seconds: 45 * 60 },
    { label: '30s Fast Demo', seconds: 30 },
  ];

  constructor() {
    super('FocusScene');
  }

  create(): void {
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Dark zen LCD background
    const bg = this.add.graphics();
    bg.fillStyle(0x060d17, 0.96);
    bg.fillRect(200, 200, 400, 400);
    bg.setMask(mask);

    // Title
    this.add.text(400, 225, '🧘 CYBER FOCUS COMPANION 🧘', {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    // Pet in meditation
    const pet = StorageService.getInstance().getCurrentPet();
    const petKey = pet && pet.stage !== 'egg' ? `pet-${pet.type === 'bacteria' ? 'germ' : pet.type}-idle` : 'pet-tadpole-idle';
    this.petSprite = this.add.sprite(400, 340, petKey)
      .setDisplaySize(140, 140)
      .setDepth(10)
      .setMask(mask);

    if (this.anims.exists(petKey)) {
      this.petSprite.play({ key: petKey, repeat: -1 });
    }

    // Gentle levitation tween
    this.tweens.add({
      targets: this.petSprite,
      y: 330,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Progress Bar
    this.progressGfx = this.add.graphics().setMask(mask);

    // Timer & Status Text
    this.timerText = this.add.text(400, 435, '25:00', {
      fontFamily: 'beryl-digivice',
      fontSize: '32px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    this.statusText = this.add.text(400, 475, '1: DURATION   2: START   3: EXIT', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    this.quoteText = this.add.text(400, 525, 'Anna: "Calibrate your energy window."', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: 360 },
    }).setOrigin(0.5).setMask(mask);

    this.isFocusActive = false;
    this.isFinished = false;
    this.selectedDurationIdx = 1;
    this.applySelectedDuration();

    SoundService.getInstance().playBgm('focus');
  }

  private applySelectedDuration(): void {
    const dur = this.durations[this.selectedDurationIdx];
    this.totalSeconds = dur.seconds;
    this.remainingSeconds = dur.seconds;
    this.updateTimerDisplay();
    this.drawProgress(0);
    this.quoteText.setText(`Target: ${dur.label}`);
  }

  private updateTimerDisplay(): void {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    this.timerText.setText(`${pad(mins)}:${pad(secs)}`);
  }

  private drawProgress(ratio: number): void {
    this.progressGfx.clear();
    const x = 250;
    const y = 410;
    const width = 300;
    const height = 8;

    // Track
    this.progressGfx.fillStyle(0x1e293b, 1);
    this.progressGfx.fillRoundedRect(x, y, width, height, 4);

    // Fill
    this.progressGfx.fillStyle(0x10b981, 1);
    this.progressGfx.fillRoundedRect(x, y, width * Math.min(1, Math.max(0, ratio)), height, 4);
  }

  public onButton1(): void {
    if (this.isFinished) {
      this.returnToPetScene();
      return;
    }
    if (this.isFocusActive) return;

    // Cycle duration
    this.selectedDurationIdx = (this.selectedDurationIdx + 1) % this.durations.length;
    this.applySelectedDuration();
    SoundService.getInstance().playSelect();
  }

  public onButton2(): void {
    if (this.isFinished) {
      this.returnToPetScene();
      return;
    }
    if (!this.isFocusActive) {
      this.startFocusSession();
    }
  }

  public onButton3(): void {
    this.returnToPetScene();
  }

  private startFocusSession(): void {
    this.isFocusActive = true;
    SoundService.getInstance().playStartup();
    this.statusText.setText('FOCUSING... [3: CANCEL]');
    this.statusText.setColor('#10b981');
    this.quoteText.setText('Pet is meditating with you. Stay in flow.');

    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.remainingSeconds--;
        this.updateTimerDisplay();
        const progress = 1 - this.remainingSeconds / this.totalSeconds;
        this.drawProgress(progress);

        if (this.remainingSeconds <= 0) {
          this.completeFocusSession();
        }
      },
    });
  }

  private completeFocusSession(): void {
    if (this.countdownTimer) {
      this.countdownTimer.remove();
      this.countdownTimer = null;
    }

    this.isFocusActive = false;
    this.isFinished = true;
    SoundService.getInstance().playEvolve();

    const focusMinutes = Math.max(1, Math.round(this.totalSeconds / 60));
    const tokens = Math.max(1, Math.round(focusMinutes / 5));

    StorageService.getInstance().addFocusSession(focusMinutes, tokens);

    this.timerText.setText('COMPLETED!');
    this.timerText.setColor('#10b981');
    this.statusText.setText(`+${tokens * 2}🪙 +${tokens} Tokens +Discipline!`);
    this.statusText.setColor('#facc15');

    // Anna empathetic rest chime insight
    const insights = [
      'Anna: "Sprint complete! Stand, stretch, and hydrate."',
      'Anna: "Cognitive energy preserved. Take 5m off-screen break."',
      'Anna: "Focus window closed cleanly. Rest your eyes on the horizon."',
    ];
    this.quoteText.setText(insights[Math.floor(Math.random() * insights.length)]);
  }

  private returnToPetScene(): void {
    if (this.countdownTimer) {
      this.countdownTimer.remove();
      this.countdownTimer = null;
    }
    SoundService.getInstance().playBgm('ambient');
    this.scene.start('PetScene');
    this.scene.stop('FocusScene');
  }
}
