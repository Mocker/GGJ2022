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
  private scrollbarGfx!: Phaser.GameObjects.Graphics;
  private menuHeaderTitle!: Phaser.GameObjects.Text;
  private menuHeaderCounter!: Phaser.GameObjects.Text;
  private scrollUpIndicator!: Phaser.GameObjects.Text;
  private scrollDownIndicator!: Phaser.GameObjects.Text;
  private menuFooterHint!: Phaser.GameObjects.Text;
  private menuItems: MenuItem[] = [];
  private menuTextObjects: Phaser.GameObjects.Text[] = [];
  private menuPointer!: Phaser.GameObjects.Text;
  public selectedIndex = 0;
  private scrollOffset = 0;

  // Scroll parameters
  private readonly MAX_VISIBLE = 7;
  private readonly START_Y = 282;
  private readonly LINE_HEIGHT = 30;

  // Toast
  private toastText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create masked layers to keep all LCD graphics strictly inside the 400x400 screen (200, 200, 400, 400)
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
    this.scrollbarGfx = this.scene.add.graphics();

    // Menu header title & counter
    this.menuHeaderTitle = this.scene.add.text(234, 246, 'MENU', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#94a3b8',
    });

    this.menuHeaderCounter = this.scene.add.text(564, 246, '[1/1]', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#38bdf8',
      align: 'right',
    }).setOrigin(1, 0);

    // Scroll indicators
    this.scrollUpIndicator = this.scene.add.text(400, 269, '▲  ▲  ▲', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#38bdf8',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.scrollUpIndicator.on('pointerdown', () => this.navigateUp());

    this.scrollDownIndicator = this.scene.add.text(400, 497, '▼  ▼  ▼', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#38bdf8',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.scrollDownIndicator.on('pointerdown', () => this.navigateDown());

    // Footer control hint
    this.menuFooterHint = this.scene.add.text(400, 528, '▲/▼: Navigate | ENTER: Select | ESC: Close', {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#64748b',
      align: 'center',
    }).setOrigin(0.5);

    // Selection pointer
    this.menuPointer = this.scene.add.text(230, this.START_Y, '▶', {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#38bdf8',
    });

    this.menuLayer.add([
      this.menuBG,
      this.scrollbarGfx,
      this.menuHeaderTitle,
      this.menuHeaderCounter,
      this.scrollUpIndicator,
      this.scrollDownIndicator,
      this.menuFooterHint,
      this.menuPointer,
    ]);
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
    const soundIcon = StorageService.getInstance().isSoundEnabled() ? '🔊' : '🔇';
    this.txtMoney.setText(`${soundIcon} 🪙 ${profile.money}`);

    if (!pet) {
      this.txtName.setText('NO PET');
      this.txtStats.setText('Select an egg');
      return;
    }

    let statusBadge = '';
    if (pet.isSleeping) statusBadge = ' [💤SLEEP]';
    else if (pet.status === 'sick') statusBadge = ' [💀SICK]';
    else if ((pet.stats.poopCount ?? 0) > 0) statusBadge = ` [💩x${pet.stats.poopCount}]`;

    const disc = pet.stats.discipline ?? 70;
    this.txtName.setText(`${pet.name.toUpperCase()} Lvl ${pet.stats.level}${statusBadge}`);
    this.txtStats.setText(`HUN:${pet.stats.hunger.current}% HAP:${pet.stats.happiness.current}% CLN:${pet.stats.cleanliness.current}% DSC:${disc}%`);
  }

  public openMenu(items: MenuItem[], tabIndex: 1 | 2 | 3, customTitle?: string): void {
    this.closeMenu();
    this.activeTab = tabIndex;
    this.highlightTab(tabIndex);
    this.menuItems = items;
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    this.isMenuOpen = true;

    // Header label
    const defaultTitles: Record<number, string> = {
      1: '📦 ITEMS & INVENTORY',
      2: '⚡ PET ACTION MENU',
      3: '⚔️ BATTLE & SYSTEM',
    };
    this.menuHeaderTitle.setText(customTitle || defaultTitles[tabIndex] || 'MENU');

    // Draw background panel
    this.menuBG.clear();
    this.menuBG.fillStyle(0x0a0f1d, 0.94);
    this.menuBG.lineStyle(2, 0x38bdf8, 0.85);
    this.menuBG.fillRoundedRect(220, 240, 360, 310, 8);
    this.menuBG.strokeRoundedRect(220, 240, 360, 310, 8);

    // Subtle header separator line
    this.menuBG.lineStyle(1, 0x1e293b, 0.8);
    this.menuBG.lineBetween(230, 263, 570, 263);

    // Subtle footer separator line
    this.menuBG.lineBetween(230, 517, 570, 517);

    this.renderVisibleItems();
    this.menuLayer.setVisible(true);
  }

  public closeMenu(): void {
    this.isMenuOpen = false;
    this.activeTab = null;
    this.highlightTab(null);
    this.menuLayer.setVisible(false);
    this.menuTextObjects.forEach((t) => t.destroy());
    this.menuTextObjects = [];
    this.scrollbarGfx.clear();
  }

  private highlightTab(tabIndex: 1 | 2 | 3 | null): void {
    this.tabLeft.setColor(tabIndex === 1 ? '#38bdf8' : '#93c5fd');
    this.tabMid.setColor(tabIndex === 2 ? '#38bdf8' : '#93c5fd');
    this.tabRight.setColor(tabIndex === 3 ? '#38bdf8' : '#93c5fd');
  }

  public navigateUp(): void {
    if (!this.isMenuOpen || this.menuItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;

    // Adjust scroll offset
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.MAX_VISIBLE) {
      this.scrollOffset = Math.max(0, this.selectedIndex - this.MAX_VISIBLE + 1);
    }

    SoundService.getInstance().playSelect();
    this.renderVisibleItems();
  }

  public navigateDown(): void {
    if (!this.isMenuOpen || this.menuItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;

    // Adjust scroll offset
    if (this.selectedIndex >= this.scrollOffset + this.MAX_VISIBLE) {
      this.scrollOffset = this.selectedIndex - this.MAX_VISIBLE + 1;
    } else if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    }

    SoundService.getInstance().playSelect();
    this.renderVisibleItems();
  }

  public executeSelected(): void {
    if (!this.isMenuOpen || this.menuItems.length === 0) return;
    const item = this.menuItems[this.selectedIndex];
    if (item && item.action) {
      item.action();
    }
  }

  // Hardware Button Fallbacks
  public handleButton1(): void {
    this.navigateUp();
  }

  public handleButton2(): void {
    this.executeSelected();
  }

  public handleButton3(): void {
    this.navigateDown();
  }

  private renderVisibleItems(): void {
    // Clear previously rendered text items
    this.menuTextObjects.forEach((t) => t.destroy());
    this.menuTextObjects = [];

    const total = this.menuItems.length;
    if (total === 0) {
      this.menuPointer.setVisible(false);
      this.scrollUpIndicator.setVisible(false);
      this.scrollDownIndicator.setVisible(false);
      this.menuHeaderCounter.setText('[0/0]');
      this.scrollbarGfx.clear();
      return;
    }

    // Clamp scroll offset safely
    this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, total - this.MAX_VISIBLE));

    // Update Counter
    this.menuHeaderCounter.setText(`[${this.selectedIndex + 1}/${total}]`);

    // Update Scroll Arrows
    const hasMoreAbove = this.scrollOffset > 0;
    const hasMoreBelow = this.scrollOffset + this.MAX_VISIBLE < total;

    this.scrollUpIndicator.setVisible(hasMoreAbove);
    this.scrollDownIndicator.setVisible(hasMoreBelow);

    // Draw Scrollbar on Right Edge (x: 568)
    this.scrollbarGfx.clear();
    const trackX = 568;
    const trackY = this.START_Y;
    const trackH = this.MAX_VISIBLE * this.LINE_HEIGHT - 6;

    if (total > this.MAX_VISIBLE) {
      // Track background
      this.scrollbarGfx.fillStyle(0x1e293b, 0.7);
      this.scrollbarGfx.fillRoundedRect(trackX, trackY, 4, trackH, 2);

      // Thumb
      const thumbHeight = Math.max(16, (this.MAX_VISIBLE / total) * trackH);
      const maxScroll = total - this.MAX_VISIBLE;
      const scrollRatio = maxScroll > 0 ? this.scrollOffset / maxScroll : 0;
      const thumbY = trackY + scrollRatio * (trackH - thumbHeight);

      this.scrollbarGfx.fillStyle(0x38bdf8, 0.9);
      this.scrollbarGfx.fillRoundedRect(trackX, thumbY, 4, thumbHeight, 2);
    }

    // Slice visible items
    const visibleCount = Math.min(this.MAX_VISIBLE, total - this.scrollOffset);

    for (let i = 0; i < visibleCount; i++) {
      const globalIndex = this.scrollOffset + i;
      const item = this.menuItems[globalIndex];
      const isSelected = globalIndex === this.selectedIndex;
      const itemY = this.START_Y + i * this.LINE_HEIGHT;

      // Label text
      const txt = this.scene.add.text(255, itemY, item.label, {
        fontFamily: 'beryl-digivice',
        fontSize: '13px',
        color: isSelected ? '#38bdf8' : '#cbd5e1',
      }).setInteractive({ useHandCursor: true });

      // Direct mouse click on item
      txt.on('pointerdown', () => {
        this.selectedIndex = globalIndex;
        this.executeSelected();
      });

      txt.on('pointerover', () => {
        if (this.selectedIndex !== globalIndex) {
          this.selectedIndex = globalIndex;
          this.renderVisibleItems();
        }
      });

      this.menuLayer.add(txt);
      this.menuTextObjects.push(txt);

      // Update pointer if selected
      if (isSelected) {
        this.menuPointer.setPosition(232, itemY);
        this.menuPointer.setVisible(true);
      }
    }
  }
}
