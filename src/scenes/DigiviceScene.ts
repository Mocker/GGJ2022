import Phaser from 'phaser';
import { DigiviceShell } from '../objects/DigiviceShell';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';

export class DigiviceScene extends Phaser.Scene {
  public shell!: DigiviceShell;
  public isPowered = false;

  constructor() {
    super('DigiviceScene');
  }

  create(): void {
    const profile = StorageService.getInstance().getProfile();
    this.shell = new DigiviceShell(this, profile.selectedTheme || 'Mountain Steel');

    // Forward hardware buttons to the active foreground screen
    this.events.on('hardware-btn-1', () => this.dispatchToActiveScene('onButton1'));
    this.events.on('hardware-btn-2', () => this.handleCenterButton());
    this.events.on('hardware-btn-3', () => this.dispatchToActiveScene('onButton3'));
  }

  private handleCenterButton(): void {
    if (!this.isPowered) {
      this.powerOn();
    } else {
      this.dispatchToActiveScene('onButton2');
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
  private dispatchToActiveScene(methodName: 'onButton1' | 'onButton2' | 'onButton3'): void {
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
        if (typeof target[methodName] === 'function') {
          target[methodName]();
          return;
        }
      }
    }
  }
}
