import Phaser from 'phaser';
import { DigiviceShell } from '../objects/DigiviceShell';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';

export class DigiviceScene extends Phaser.Scene {
  public shell!: DigiviceShell;
  public isPowered = false;
  private lcdOverlayGfx!: Phaser.GameObjects.Graphics;
  private filterMode = 0;
  private readonly filterNames = [
    'Clear Modern LCD',
    '1997 Dot-Matrix',
    'Cyber Scanlines',
    'Warm Amber CRT',
  ];

  constructor() {
    super('DigiviceScene');
  }

  create(): void {
    const profile = StorageService.getInstance().getProfile();
    this.shell = new DigiviceShell(this, profile.selectedTheme || 'Mountain Steel');

    // LCD Mask (200, 200, 400, 400)
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Retro LCD Filter Overlay (depth 28: above game layers, beneath physical shell buttons)
    this.lcdOverlayGfx = this.add.graphics().setDepth(28).setMask(mask);
    this.drawLcdFilter();

    // 1. Physical / direct hardware button events
    this.events.on('hardware-btn-1', () => this.dispatchAction(['onButton1', 'onNavLeft']));
    this.events.on('hardware-btn-2', () => this.handleCenterButton());
    this.events.on('hardware-btn-3', () => this.dispatchAction(['onButton3', 'onNavRight']));

    // 2. Ergonomic semantic navigation events
    this.events.on('nav-up', () => this.dispatchAction(['onNavUp', 'onButton1']));
    this.events.on('nav-down', () => this.dispatchAction(['onNavDown', 'onButton3']));
    this.events.on('nav-left', () => this.dispatchAction(['onNavLeft', 'onButton1']));
    this.events.on('nav-right', () => this.dispatchAction(['onNavRight', 'onButton3']));
    this.events.on('confirm', () => this.handleConfirm());
    this.events.on('cancel', () => this.dispatchAction(['onCancel', 'onButton3']));
  }

  public cycleLcdFilter(): string {
    this.filterMode = (this.filterMode + 1) % this.filterNames.length;
    this.drawLcdFilter();
    SoundService.getInstance().playSelect();
    return this.filterNames[this.filterMode];
  }

  public getFilterName(): string {
    return this.filterNames[this.filterMode];
  }

  private drawLcdFilter(): void {
    if (!this.lcdOverlayGfx) return;
    this.lcdOverlayGfx.clear();

    if (this.filterMode === 1) {
      // 1997 Dot-Matrix Mesh
      this.lcdOverlayGfx.fillStyle(0x061a0f, 0.35);
      for (let y = 200; y < 600; y += 3) {
        for (let x = 200; x < 600; x += 3) {
          this.lcdOverlayGfx.fillRect(x, y, 1, 1);
        }
      }
      this.lcdOverlayGfx.fillStyle(0x0d381e, 0.07);
      this.lcdOverlayGfx.fillRect(200, 200, 400, 400);
    } else if (this.filterMode === 2) {
      // Cyber Scanlines
      this.lcdOverlayGfx.fillStyle(0x000000, 0.22);
      for (let y = 200; y < 600; y += 3) {
        this.lcdOverlayGfx.fillRect(200, y, 400, 1);
      }
      this.lcdOverlayGfx.fillStyle(0x38bdf8, 0.05);
      this.lcdOverlayGfx.fillRect(200, 200, 400, 400);
    } else if (this.filterMode === 3) {
      // Warm Amber CRT
      this.lcdOverlayGfx.fillStyle(0x000000, 0.24);
      for (let y = 200; y < 600; y += 3) {
        this.lcdOverlayGfx.fillRect(200, y, 400, 1);
      }
      this.lcdOverlayGfx.fillStyle(0xf59e0b, 0.12);
      this.lcdOverlayGfx.fillRect(200, 200, 400, 400);
    }
  }

  private handleCenterButton(): void {
    if (!this.isPowered) {
      this.powerOn();
    } else {
      this.dispatchAction(['onButton2', 'onConfirm']);
    }
  }

  private handleConfirm(): void {
    if (!this.isPowered) {
      this.powerOn();
    } else {
      this.dispatchAction(['onConfirm', 'onButton2']);
    }
  }

  public powerOn(onComplete?: () => void): void {
    if (this.isPowered) return;
    this.isPowered = true;
    SoundService.getInstance().playStartup();
    this.shell.setPower(true, onComplete);
  }

  public powerOff(): void {
    this.isPowered = false;
    this.shell.setPower(false);
  }

  public setTheme(themeName: string): void {
    this.shell.setTheme(themeName);
    StorageService.getInstance().setTheme(themeName);
  }

  private dispatchAction(methodNames: string[]): void {
    const activeScenes = [
      'PedigreeScene',
      'VisitorArenaScene',
      'MiniGameScene',
      'FocusScene',
      'HallOfFameScene',
      'BattleScene',
      'PetScene',
      'SelectPetScene',
      'TitleScene',
    ];
    for (const key of activeScenes) {
      if (this.scene.isActive(key)) {
        const target = this.scene.get(key) as unknown as Record<string, () => void>;
        for (const methodName of methodNames) {
          if (typeof target[methodName] === 'function') {
            target[methodName]();
            return;
          }
        }
      }
    }
  }
}
