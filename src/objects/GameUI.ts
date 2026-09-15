import Phaser from 'phaser';
import { PetModel } from '../types/pet';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';

export interface MenuItem {
  label: string;
  action: () => void;
}

export class GameUI {
  private scene: Phaser.Scene;
  public layer: Phaser.GameObjects.Layer;
  private menuLayer: Phaser.GameObjects.Layer;

  // Tabs
  private tabLeft!: Phaser.GameObjects.Text;
  private tabMid!: Phaser.GameObjects.Text;
  private tabRight!: Phaser.GameObjects.Text;
  public activeTab: 1 | 2 | 3 | null = null;

  // Bottom Status
  private txtName!: Phaser.GameObjects.Text;
  private txtStats!: Phaser.GameObjects.Text;
  private txtMoney!: Phaser.GameObjects.Text;

  // Menu Elements
  public isMenuOpen = false;
  private menuBG!: Phaser.GameObjects.Graphics;
  private menuItems: MenuItem[] = [];
  private menuTextObjects: Phaser.GameObjects.Text[] = [];
  private menuPointer!: Phaser.GameObjects.Text;
  private selectedIndex = 0;

  // Toast
  private toastText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create masked layers to keep all LCD graphics strictly inside the 400x400 screen
    this.layer = scene.add.layer().setDepth(15);
    this.menuLayer = scene.add.layer().setDepth(25);

    const maskGfx = scene.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskGfx);
    this.layer.setMask(mask);
    this.menuLayer.setMask(mask);

    this.buildTopTabs();
    this.buildBottomStatusBar();
    this.buildMenuOverlay();
    this.buildToast();
  }

  private buildTopTabs(): void {
    const tabBG = this.scene.add.graphics();
    tabBG.fillStyle(0x162b3c, 0.85);
    tabBG.fillRoundedRect(210, 206, 120, 26, 4);
    tabBG.fillRoundedRect(346, 206, 120, 26, 4);
    tabBG.fillRoundedRect(480, 206, 110, 26, 4);

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#93c5fd',
      align: 'center',
    };

    this.tabLeft = this.scene.add.text(225, 210, '1. ITEMS', style);
    this.tabMid = this.scene.add.text(360, 210, '2. ACTION', style);
    this.tabRight = this.scene.add.text(490, 210, '3. BATTLE', style);

    this.layer.add([tabBG, this.tabLeft, this.tabMid, this.tabRight]);
  }

  private buildBottomStatusBar(): void {
    const bottomBG = this.scene.add.graphics();
    bottomBG.fillStyle(0x0f172a, 0.8);
    bottomBG.fillRect(200, 560, 400, 40);

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#f8fafc',
    };

    this.txtName = this.scene.add.text(210, 566, 'PET: ---', style);
    this.txtStats = this.scene.add.text(210, 582, 'HUNG: 80% | HAP: 70%', { ...style, color: '#94a3b8', fontSize: '11px' });
    this.txtMoney = this.scene.add.text(520, 566, '🪙 0', { ...style, color: '#facc15' });

    this.layer.add([bottomBG, this.txtName, this.txtStats, this.txtMoney]);
  }

  private buildMenuOverlay(): void {
    this.menuBG = this.scene.add.graphics();
    this.menuBG.fillStyle(0x0a0f1d, 0.92);
    this.menuBG.lineStyle(2, 0x38bdf8, 0.8);
    this.menuBG.fillRoundedRect(220, 240, 360, 310, 8);
    this.menuBG.strokeRoundedRect(220, 240, 360, 310, 8);

    this.menuPointer = this.scene.add.text(230, 260, '▶', {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#38bdf8',
    });

    this.menuLayer.add([this.menuBG, this.menuPointer]);
    this.menuLayer.setVisible(false);
  }

  private buildToast(): void {
    this.toastText = this.scene.add.text(400, 380, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '16px',
      color: '#38bdf8',
      backgroundColor: '#0a0f1dcc',
      padding: { x: 12, y: 6 },
      align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(30);

    this.layer.add(this.toastText);
  }

  public showToast(message: string, durationMs = 2000): void {
    this.toastText.setText(message);
    this.toastText.setAlpha(1);
    this.scene.tweens.killTweensOf(this.toastText);
    this.scene.tweens.add({
      targets: this.toastText,
      alpha: 0,
      delay: durationMs,
      duration: 400,
    });
  }

  public updateStatus(pet: PetModel | null): void {
    const profile = StorageService.getInstance().getProfile();
    this.txtMoney.setText(`🪙 ${profile.money}`);

    if (!pet) {
      this.txtName.setText('NO PET');
      this.txtStats.setText('Select an egg');
      return;
    }

    this.txtName.setText(`${pet.name.toUpperCase()} [${pet.stage.toUpperCase()}]`);
    this.txtStats.setText(`HUNGER: ${pet.stats.hunger.current}% | HAPPY: ${pet.stats.happiness.current}%`);
  }

  public openMenu(items: MenuItem[], tabIndex: 1 | 2 | 3): void {
    this.closeMenu();
    this.activeTab = tabIndex;
    this.highlightTab(tabIndex);
    this.menuItems = items;
    this.selectedIndex = 0;
    this.isMenuOpen = true;

    // Render items
    this.menuTextObjects.forEach((t) => t.destroy());
    this.menuTextObjects = [];

    const startY = 260;
    const lineHeight = 32;

    items.forEach((item, index) => {
      const txt = this.scene.add.text(255, startY + index * lineHeight, item.label, {
        fontFamily: 'beryl-digivice',
        fontSize: '14px',
        color: index === 0 ? '#38bdf8' : '#e2e8f0',
      });
      this.menuLayer.add(txt);
      this.menuTextObjects.push(txt);
    });

    this.updatePointer();
    this.menuLayer.setVisible(true);
  }

  public closeMenu(): void {
    this.isMenuOpen = false;
    this.activeTab = null;
    this.highlightTab(null);
    this.menuLayer.setVisible(false);
    this.menuTextObjects.forEach((t) => t.destroy());
    this.menuTextObjects = [];
  }

  private highlightTab(tabIndex: 1 | 2 | 3 | null): void {
    this.tabLeft.setColor(tabIndex === 1 ? '#38bdf8' : '#93c5fd');
    this.tabMid.setColor(tabIndex === 2 ? '#38bdf8' : '#93c5fd');
    this.tabRight.setColor(tabIndex === 3 ? '#38bdf8' : '#93c5fd');
  }

  public handleButton1(): void {
    if (!this.isMenuOpen) return;
    // Previous menu option
    if (this.menuItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
    this.updatePointer();
  }

  public handleButton2(): void {
    if (!this.isMenuOpen) return;
    // Execute selected option
    const item = this.menuItems[this.selectedIndex];
    if (item && item.action) {
      item.action();
    }
  }

  public handleButton3(): void {
    if (!this.isMenuOpen) return;
    // Next menu option (or close if reached end)
    this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
    this.updatePointer();
  }

  private updatePointer(): void {
    const startY = 260;
    const lineHeight = 32;
    this.menuPointer.setY(startY + this.selectedIndex * lineHeight);

    this.menuTextObjects.forEach((txt, idx) => {
      txt.setColor(idx === this.selectedIndex ? '#38bdf8' : '#94a3b8');
    });
  }
}
