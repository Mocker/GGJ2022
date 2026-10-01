import Phaser from 'phaser';
import { DIGIVICE_THEMES } from '../services/theme';
import { SoundService } from '../services/audio';

export class DigiviceShell {
  private scene: Phaser.Scene;
  private bgFrame!: Phaser.GameObjects.Sprite;
  private bgSolid!: Phaser.GameObjects.Sprite;
  private powerLight!: Phaser.GameObjects.Sprite;
  private btn1!: Phaser.GameObjects.Sprite;
  private btn2!: Phaser.GameObjects.Sprite;
  private btn3!: Phaser.GameObjects.Sprite;
  private themeKey: string;
  public isPowerOn = false;

  constructor(scene: Phaser.Scene, initialTheme = 'Mountain Steel') {
    this.scene = scene;
    this.themeKey = initialTheme;
    this.buildShell();
    this.setupKeyboardControls();
  }

  private buildShell(): void {
    const theme = DIGIVICE_THEMES[this.themeKey] || DIGIVICE_THEMES['Mountain Steel'];

    // 1. Device Outer Body Frame (800x800 at center 400, 400)
    this.bgFrame = this.scene.add.sprite(400, 400, `ui-frame-${theme.name}`)
      .setDisplaySize(800, 800)
      .setDepth(0);

    // 2. Inner LCD screen background (400x400 at 400, 400)
    this.bgSolid = this.scene.add.sprite(400, 400, 'bg-solid')
      .setDisplaySize(400, 400)
      .setAlpha(0)
      .setDepth(1);

    // 3. Power LED Indicator (Top-left on the bezel)
    this.powerLight = this.scene.add.sprite(334 * 0.8, 207 * 0.8, 'ui-power-on')
      .setAlpha(0)
      .setDepth(5);

    // 4. Three Hardware Buttons
    const btnScale = 0.8;
    this.btn1 = this.createButton(321 * btnScale, 852 * btnScale, `ui-btn-left-${theme.name}`, () => this.onButtonPress(1));
    this.btn2 = this.createButton(504 * btnScale, 862 * btnScale, `ui-btn-circle-${theme.name}`, () => this.onButtonPress(2));
    this.btn3 = this.createButton(683 * btnScale, 851 * btnScale, `ui-btn-right-${theme.name}`, () => this.onButtonPress(3));
  }

  private createButton(x: number, y: number, textureKey: string, onClick: () => void): Phaser.GameObjects.Sprite {
    const btn = this.scene.add.sprite(x, y, textureKey)
      .setScale(0.8)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      btn.setTexture(`${textureKey}-on`);
      this.scene.time.delayedCall(120, () => {
        btn.setTexture(textureKey);
      });
      onClick();
    });

    return btn;
  }

  public triggerButtonVisual(btnIndex: 1 | 2 | 3): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch (e) {}
    }
    const theme = DIGIVICE_THEMES[this.themeKey] || DIGIVICE_THEMES['Mountain Steel'];
    if (btnIndex === 1) {
      this.triggerButtonAnim(this.btn1, `ui-btn-left-${theme.name}`);
    } else if (btnIndex === 2) {
      this.triggerButtonAnim(this.btn2, `ui-btn-circle-${theme.name}`);
    } else if (btnIndex === 3) {
      this.triggerButtonAnim(this.btn3, `ui-btn-right-${theme.name}`);
    }
  }

  public onButtonPress(btnIndex: 1 | 2 | 3): void {
    this.triggerButtonVisual(btnIndex);

    if (btnIndex === 1) {
      SoundService.getInstance().playSelect();
      this.scene.events.emit('hardware-btn-1');
    } else if (btnIndex === 2) {
      SoundService.getInstance().playSelect();
      this.scene.events.emit('hardware-btn-2');
    } else if (btnIndex === 3) {
      SoundService.getInstance().playBack();
      this.scene.events.emit('hardware-btn-3');
    }
  }

  private triggerButtonAnim(btn: Phaser.GameObjects.Sprite, baseTexture: string): void {
    btn.setTexture(`${baseTexture}-on`);
    this.scene.time.delayedCall(150, () => {
      btn.setTexture(baseTexture);
    });
  }

  private setupKeyboardControls(): void {
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.repeat) return;
      const code = event.code;

      // 1. Direct Hardware Digivice Buttons (1, 2, 3 or J, K, L)
      if (code === 'Digit1' || code === 'KeyJ') {
        this.onButtonPress(1);
        return;
      }
      if (code === 'Digit2' || code === 'KeyK') {
        this.onButtonPress(2);
        return;
      }
      if (code === 'Digit3' || code === 'KeyL') {
        this.onButtonPress(3);
        return;
      }

      // 2. Vertical Navigation (ArrowUp / W and ArrowDown / S)
      if (code === 'ArrowUp' || code === 'KeyW') {
        this.triggerButtonVisual(1);
        this.scene.events.emit('nav-up');
        return;
      }
      if (code === 'ArrowDown' || code === 'KeyS') {
        this.triggerButtonVisual(3);
        this.scene.events.emit('nav-down');
        return;
      }

      // 3. Horizontal Navigation / Tabs (ArrowLeft / A and ArrowRight / D)
      if (code === 'ArrowLeft' || code === 'KeyA') {
        this.triggerButtonVisual(1);
        this.scene.events.emit('nav-left');
        return;
      }
      if (code === 'ArrowRight' || code === 'KeyD') {
        this.triggerButtonVisual(3);
        this.scene.events.emit('nav-right');
        return;
      }

      // 4. Confirm / Select / Action (Enter, Space, Z)
      if (code === 'Enter' || code === 'Space' || code === 'KeyZ') {
        this.triggerButtonVisual(2);
        this.scene.events.emit('confirm');
        return;
      }

      // 5. Cancel / Close / Back (Escape, Backspace, X)
      if (code === 'Escape' || code === 'Backspace' || code === 'KeyX') {
        this.triggerButtonVisual(3);
        this.scene.events.emit('cancel');
        return;
      }

      // 6. Sound Mute
      if (code === 'KeyM') {
        SoundService.getInstance().toggleMute();
        return;
      }

      // 7. Toggle Retro LCD Filter (Clear / 1997 Dot-Matrix / Cyber Scanlines / Amber CRT)
      if (code === 'KeyF') {
        const digiScene = this.scene as unknown as { cycleLcdFilter?: () => string };
        if (typeof digiScene.cycleLcdFilter === 'function') {
          digiScene.cycleLcdFilter();
        }
        return;
      }
    });
  }

  public setTheme(newThemeName: string): void {
    if (!DIGIVICE_THEMES[newThemeName]) return;
    this.themeKey = newThemeName;
    const theme = DIGIVICE_THEMES[this.themeKey];

    this.bgFrame.setTexture(`ui-frame-${theme.name}`);
    this.btn1.setTexture(`ui-btn-left-${theme.name}`);
    this.btn2.setTexture(`ui-btn-circle-${theme.name}`);
    this.btn3.setTexture(`ui-btn-right-${theme.name}`);
  }

  public setPower(powerOn: boolean, onComplete?: () => void): void {
    this.isPowerOn = powerOn;
    if (powerOn) {
      this.powerLight.setAlpha(1);
      this.scene.tweens.add({
        targets: this.bgSolid,
        alpha: 1,
        duration: 1200,
        ease: 'Quad.easeOut',
        onComplete: () => onComplete?.(),
      });
    } else {
      this.scene.tweens.add({
        targets: [this.powerLight, this.bgSolid],
        alpha: 0,
        duration: 800,
        ease: 'Quad.easeIn',
        onComplete: () => onComplete?.(),
      });
    }
  }
}
