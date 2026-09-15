import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { DigiviceScene } from './DigiviceScene';

export class TitleScene extends Phaser.Scene {
  private titleSprite!: Phaser.GameObjects.Sprite;
  private pieces: Phaser.GameObjects.Image[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private isImploding = false;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    // Mask to LCD screen
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Title image (assembled target position)
    this.titleSprite = this.add.sprite(400, 330, 'title-text')
      .setScale(0.32)
      .setTintFill(0x162b3c)
      .setAlpha(0)
      .setDepth(10);
    this.titleSprite.setMask(mask);

    // Subtitle & instructions
    this.add.text(400, 400, 'THEY MIGHT BYTE', {
      fontFamily: 'beryl-digivice',
      fontSize: '22px',
      color: '#1e293b',
    }).setOrigin(0.5).setMask(mask);

    this.promptText = this.add.text(400, 480, 'PRESS [CENTER BUTTON] TO START', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#0284c7',
    }).setOrigin(0.5).setMask(mask);

    this.add.text(400, 520, 'Controls: [A] Left  [SPACE] Select  [D] Right', {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#64748b',
    }).setOrigin(0.5).setMask(mask);

    // Pulse prompt text
    this.tweens.add({
      targets: this.promptText,
      alpha: { from: 0.3, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // Automatically make sure Digivice power is on or assemble title
    const digiviceScene = this.scene.get('DigiviceScene') as DigiviceScene;
    if (digiviceScene && !digiviceScene.isPowered) {
      digiviceScene.powerOn(() => {
        this.runImplodeEffect();
      });
    } else {
      this.runImplodeEffect();
    }
  }

  private runImplodeEffect(): void {
    if (this.isImploding) return;
    this.isImploding = true;

    // Build scattered pieces
    const frameSize = 32;
    const source = this.textures.get('title-text').getSourceImage() as HTMLImageElement;
    if (!source) {
      this.titleSprite.setAlpha(1);
      return;
    }

    const sheetKey = 'title-text-pieces';
    if (!this.textures.exists(sheetKey)) {
      this.textures.addSpriteSheet(sheetKey, source, {
        frameWidth: frameSize,
        frameHeight: frameSize,
      });
    }

    const sheet = this.textures.get(sheetKey);
    const totalFrames = sheet.frameTotal;
    const columns = Math.floor(this.titleSprite.width / frameSize);

    const startX = 400 - (this.titleSprite.displayWidth / 2);
    const startY = 330 - (this.titleSprite.displayHeight / 2);
    const scaledWidth = this.titleSprite.displayWidth / columns;

    this.pieces = [];

    for (let i = 0; i < totalFrames; i++) {
      const pX = i % columns;
      const pY = Math.floor(i / columns);

      const targetX = startX + pX * scaledWidth + scaledWidth / 2;
      const targetY = startY + pY * scaledWidth + scaledWidth / 2;

      // Random scattered starting pos
      const randomX = Phaser.Math.Between(220, 580);
      const randomY = Phaser.Math.Between(240, 440);

      const piece = this.add.image(randomX, randomY, sheetKey, i)
        .setScale(0.32)
        .setTintFill(0x162b3c)
        .setDepth(15);

      this.pieces.push(piece);

      this.tweens.add({
        targets: piece,
        x: targetX,
        y: targetY,
        angle: 360,
        duration: 900,
        delay: i * 12,
        ease: 'Cubic.easeOut',
      });
    }

    this.time.delayedCall(1100 + totalFrames * 12, () => {
      this.titleSprite.setAlpha(1);
      this.pieces.forEach((p) => p.destroy());
      this.pieces = [];
      this.isImploding = false;
    });
  }

  public onButton1(): void {
    // Optional theme preview toggle
    const profile = StorageService.getInstance().getProfile();
    const themes = ['Mountain Steel', 'Dragon Blood', 'Golden Beam', 'Sage Bog', 'Cool Bronze'];
    const currentIdx = themes.indexOf(profile.selectedTheme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    const digivice = this.scene.get('DigiviceScene') as DigiviceScene;
    digivice.setTheme(nextTheme);
  }

  public onButton2(): void {
    SoundService.getInstance().playSelect();
    const profile = StorageService.getInstance().getProfile();

    if (profile.pets && profile.pets.length > 0) {
      this.scene.start('PetScene');
    } else {
      this.scene.start('SelectPetScene');
    }
    this.scene.stop('TitleScene');
  }

  public onButton3(): void {
    // Select Pet carousel
    this.scene.start('SelectPetScene');
    this.scene.stop('TitleScene');
  }
}
