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
