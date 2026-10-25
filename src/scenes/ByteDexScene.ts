import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { BYTE_DEX_SPECIES } from '../data/evolutionTree';
import { SpeciesEntry } from '../types/pet';
import { DigiviceScene } from './DigiviceScene';

export class ByteDexScene extends Phaser.Scene {
  private selectedIndex = 0;
  private currentFilter: 'ALL' | 'aquatic' | 'microbial' | 'primordial' | 'android' | 'celestial' | 'botanical' | 'void' = 'ALL';
  private filteredSpecies: SpeciesEntry[] = [];
  private listContainer!: Phaser.GameObjects.Container;
  private detailContainer!: Phaser.GameObjects.Container;
  private headerCountText!: Phaser.GameObjects.Text;
  private filterTabText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;

  private readonly filters: ('ALL' | 'aquatic' | 'microbial' | 'primordial' | 'android' | 'celestial' | 'botanical' | 'void')[] = [
    'ALL',
    'aquatic',
    'microbial',
    'primordial',
    'android',
    'celestial',
    'botanical',
    'void',
  ];

  constructor() {
    super('ByteDexScene');
  }

  create(): void {
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Deep Indigo Cyber LCD Background
    const bg = this.add.graphics();
    bg.fillStyle(0x060f1e, 0.96);
    bg.fillRect(200, 200, 400, 400);
    bg.setMask(mask);

    // Header Title
    this.add.text(400, 218, '📖 TAMER FIELD GUIDE (BYTE-DEX)', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    // Discovery Stats Header
    this.headerCountText = this.add.text(400, 236, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    // Filter Bar
    const filterBG = this.add.graphics();
    filterBG.fillStyle(0x132338, 0.85);
    filterBG.fillRoundedRect(220, 248, 360, 20, 4);
    filterBG.setMask(mask);

    this.filterTabText = this.add.text(400, 258, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#93c5fd',
    }).setOrigin(0.5).setMask(mask).setInteractive({ useHandCursor: true });
    this.filterTabText.on('pointerdown', () => this.cycleFilter(1));

    // Dynamic Containers
    this.listContainer = this.add.container(0, 0).setMask(mask);
    this.detailContainer = this.add.container(0, 0).setMask(mask);

    // Toast
    this.toastText = this.add.text(400, 390, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#facc15',
      backgroundColor: '#030712ee',
      padding: { x: 12, y: 6 },
      align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(35).setMask(mask);

    // Footer Hint
    this.add.text(400, 584, '▲/▼: Navigate   ◀/▶: Filter   ESC: Return', {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#64748b',
    }).setOrigin(0.5).setMask(mask);

    this.updateFilterList();
  }

  private showToast(msg: string): void {
    this.toastText.setText(msg);
    this.toastText.setAlpha(1);
    this.tweens.killTweensOf(this.toastText);
    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      delay: 1800,
      duration: 300,
    });
  }

  private updateFilterList(): void {
    if (this.currentFilter === 'ALL') {
      this.filteredSpecies = [...BYTE_DEX_SPECIES];
    } else {
      this.filteredSpecies = BYTE_DEX_SPECIES.filter((s) => s.lineage === this.currentFilter);
    }

    this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, this.filteredSpecies.length - 1));
    this.renderHeader();
    this.renderList();
    this.renderDetail();
  }

  private cycleFilter(direction: -1 | 1): void {
    const idx = this.filters.indexOf(this.currentFilter);
    const nextIdx = (idx + direction + this.filters.length) % this.filters.length;
    this.currentFilter = this.filters[nextIdx];
    this.selectedIndex = 0;
    SoundService.getInstance().playSelect();
    this.updateFilterList();
  }

  private renderHeader(): void {
    const storage = StorageService.getInstance();
    const discoveredMap = storage.getByteDex();
    const totalDiscovered = Object.keys(discoveredMap).length;
    const totalCount = BYTE_DEX_SPECIES.length;
    const percent = Math.round((totalDiscovered / totalCount) * 100);

    this.headerCountText.setText(`[ DISCOVERED: ${totalDiscovered} / ${totalCount} (${percent}%) ]`);
    this.filterTabText.setText(`LINEAGE: < ${this.currentFilter.toUpperCase()} > (Click/Arrows)`);
  }

  private renderList(): void {
    this.listContainer.removeAll(true);
    const storage = StorageService.getInstance();
    const discoveredMap = storage.getByteDex();

    const startY = 276;
    const itemHeight = 22;
    const maxVisible = 5;

    // Calculate window offset
    const scrollOffset = Math.max(0, Math.min(this.selectedIndex - 2, this.filteredSpecies.length - maxVisible));

    for (let i = 0; i < maxVisible; i++) {
      const idx = scrollOffset + i;
      if (idx >= this.filteredSpecies.length) break;

      const sp = this.filteredSpecies[idx];
      const isSelected = idx === this.selectedIndex;
      const isDiscovered = !!discoveredMap[sp.id];

      const numStr = `#${String(sp.dexNumber).padStart(2, '0')}`;
      const nameStr = isDiscovered ? sp.name : '??? [LOCKED]';
      const checkMark = isDiscovered ? '☑' : '☐';
      const pointer = isSelected ? '▶ ' : '  ';

      const color = isDiscovered
        ? isSelected
          ? '#f8fafc'
          : '#38bdf8'
        : isSelected
        ? '#94a3b8'
        : '#475569';

      const txt = this.add.text(225, startY + i * itemHeight, `${pointer}${checkMark} ${numStr} ${nameStr}`, {
        fontFamily: 'beryl-digivice',
        fontSize: '11px',
        color,
      }).setInteractive({ useHandCursor: true });

      const clickIdx = idx;
      txt.on('pointerdown', () => {
        this.selectedIndex = clickIdx;
        SoundService.getInstance().playSelect();
        this.renderList();
        this.renderDetail();
      });

      this.listContainer.add(txt);
    }
  }

  private renderDetail(): void {
    this.detailContainer.removeAll(true);
    const sp = this.filteredSpecies[this.selectedIndex];
    if (!sp) return;

    const storage = StorageService.getInstance();
    const discoveredMap = storage.getByteDex();
    const discoveryInfo = discoveredMap[sp.id];
    const isDiscovered = !!discoveryInfo;

    // Detail Panel Background Box
    const detailBG = this.add.graphics();
    detailBG.fillStyle(0x0a1628, 0.95);
    detailBG.lineStyle(1.5, isDiscovered ? 0x38bdf8 : 0x334155, 0.85);
    detailBG.fillRoundedRect(220, 396, 360, 176, 6);
    detailBG.strokeRoundedRect(220, 396, 360, 176, 6);
    this.detailContainer.add(detailBG);

    if (isDiscovered) {
      // Discovered specimen presentation
      const title = this.add.text(232, 404, `#${sp.dexNumber} ${sp.name.toUpperCase()}`, {
        fontFamily: 'beryl-digivice',
        fontSize: '12px',
        color: '#facc15',
      });

      const badge = this.add.text(568, 404, `[${sp.lineage.toUpperCase()} | ${sp.stage.toUpperCase()}]`, {
        fontFamily: 'beryl-digivice',
        fontSize: '10px',
        color: '#38bdf8',
      }).setOrigin(1, 0);

      // Base Stats
      const stats = this.add.text(232, 424, `BASE STATS: HP ${sp.baseHp} | ATK ${sp.baseAttack} | DEF ${sp.baseDefense}`, {
        fontFamily: 'beryl-digivice',
        fontSize: '10px',
        color: '#10b981',
      });

      // Lore Description
      const lore = this.add.text(232, 444, sp.lore, {
        fontFamily: 'beryl-digivice',
        fontSize: '10px',
        color: '#e2e8f0',
        wordWrap: { width: 336 },
        lineSpacing: 4,
      });

      // Encounter count & generation
      const genStr = `Generation: ${discoveryInfo.generationDiscovered} | Times Encountered: ${discoveryInfo.timesEncountered}`;
      const footerMeta = this.add.text(232, 546, genStr, {
        fontFamily: 'beryl-digivice',
        fontSize: '9px',
        color: '#64748b',
      });

      this.detailContainer.add([title, badge, stats, lore, footerMeta]);
    } else {
      // Locked mystery silhouette presentation
      const title = this.add.text(232, 404, `#${sp.dexNumber} ??? [UNDISCOVERED SPECIMEN]`, {
        fontFamily: 'beryl-digivice',
        fontSize: '12px',
        color: '#94a3b8',
      });

      const badge = this.add.text(568, 404, `[${sp.lineage.toUpperCase()}]`, {
        fontFamily: 'beryl-digivice',
        fontSize: '10px',
        color: '#64748b',
      }).setOrigin(1, 0);

      const hintTitle = this.add.text(232, 436, 'RESEARCH HYPOTHESIS & HINT:', {
        fontFamily: 'beryl-digivice',
        fontSize: '10px',
        color: '#facc15',
      });

      const hintText = this.add.text(232, 456, sp.evolutionHint, {
        fontFamily: 'beryl-digivice',
        fontSize: '10px',
        color: '#cbd5e1',
        wordWrap: { width: 336 },
        lineSpacing: 5,
      });

      const lockNotice = this.add.text(400, 535, 'Nurture your Digi-Pet through this path to unlock full entry!', {
        fontFamily: 'beryl-digivice',
        fontSize: '9px',
        color: '#64748b',
      }).setOrigin(0.5);

      this.detailContainer.add([title, badge, hintTitle, hintText, lockNotice]);
    }
  }

  // --- NAVIGATION EVENT HANDLERS ---
  public onNavUp(): void {
    if (this.filteredSpecies.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.filteredSpecies.length) % this.filteredSpecies.length;
    SoundService.getInstance().playSelect();
    this.renderList();
    this.renderDetail();
  }

  public onNavDown(): void {
    if (this.filteredSpecies.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.filteredSpecies.length;
    SoundService.getInstance().playSelect();
    this.renderList();
    this.renderDetail();
  }

  public onNavLeft(): void {
    this.cycleFilter(-1);
  }

  public onNavRight(): void {
    this.cycleFilter(1);
  }

  public onButton1(): void {
    this.onNavUp();
  }

  public onButton2(): void {
    // Claim milestone check
    const storage = StorageService.getInstance();
    const count = storage.getDiscoveredSpeciesCount();
    if (count >= 12 && !storage.getUnlockedThemes().includes('Dragon Blood')) {
      storage.unlockTheme('Dragon Blood');
      SoundService.getInstance().playStreakCelebration();
      const digivice = this.scene.get('DigiviceScene') as DigiviceScene;
      digivice?.pulseAlertLed(8);
      this.showToast('Milestone! Unlocked Crimson Dragon Blood Shell!');
    } else {
      SoundService.getInstance().playSelect();
      this.showToast('Field Guide Entry Active');
    }
  }

  public onButton3(): void {
    this.returnToPetScene();
  }

  public onConfirm(): void {
    this.onButton2();
  }

  public onCancel(): void {
    this.returnToPetScene();
  }

  private returnToPetScene(): void {
    SoundService.getInstance().playBack();
    this.scene.start('PetScene');
    this.scene.stop('ByteDexScene');
  }
}
