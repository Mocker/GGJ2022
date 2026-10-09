import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { PetEntity } from '../objects/PetEntity';
import { GameUI, MenuItem } from '../objects/GameUI';
import { PetModel, PetStage } from '../types/pet';
import { evaluateEvolution, checkEvolutionReadiness } from '../data/evolutionTree';
import { DIGIVICE_THEMES, THEME_NAMES } from '../services/theme';
import { DigiviceScene } from './DigiviceScene';

export class PetScene extends Phaser.Scene {
  private petEntity: PetEntity | null = null;
  public ui!: GameUI;
  private statDecayTimer!: Phaser.Time.TimerEvent;
  private sleepOverlay!: Phaser.GameObjects.Graphics;

  constructor() {
    super('PetScene');
  }

  create(): void {
    const storage = StorageService.getInstance();
    let currentPet = storage.getCurrentPet();

    // If no pet exists yet, fallback to starter egg
    if (!currentPet) {
      storage.createDefaultProfile();
      currentPet = storage.getCurrentPet()!;
    }

    // Masked sleep overlay for Lights Out mode
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    this.sleepOverlay = this.add.graphics().setDepth(12).setMask(mask);
    this.updateSleepOverlay(currentPet.isSleeping);

    // Initialize HUD and UI overlay
    this.ui = new GameUI(this);

    // Spawn Pet Entity
    this.spawnPet(currentPet);

    // Process offline progression catch-up if returning after absence
    const offlineReport = storage.processOfflineCatchUp();
    if (offlineReport) {
      this.time.delayedCall(1000, () => {
        this.ui.showToast(offlineReport);
        const updated = storage.getCurrentPet();
        if (updated) {
          this.spawnPet(updated);
          this.ui.updateStatus(updated);
        }
      });
    }

    // Start stat decay timer (rebalanced to 30-second ticks for peaceful companion play)
    this.statDecayTimer = this.time.addEvent({
      delay: 30000,
      loop: true,
      callback: () => this.tickPetStats(),
    });

    // Start ambient procedural BGM
    SoundService.getInstance().playBgm('ambient');
  }

  private updateSleepOverlay(isSleeping: boolean): void {
    this.sleepOverlay.clear();
    if (isSleeping) {
      this.sleepOverlay.fillStyle(0x020617, 0.75);
      this.sleepOverlay.fillRect(200, 200, 400, 400);
    }
  }

  private spawnPet(petData: PetModel): void {
    if (this.petEntity) {
      this.petEntity.destroy();
      this.petEntity = null;
    }
    this.petEntity = new PetEntity(this, petData);
    this.ui.updateStatus(petData);
    this.updateSleepOverlay(petData.isSleeping);
  }

  private tickPetStats(): void {
    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();
    if (!pet || this.ui.isMenuOpen) return;

    storage.updateCurrentPet((p) => {
      p.stats.timers.lived += 30000;

      // Sleep mechanics: recover HP & Energy, slower metabolism
      if (p.isSleeping) {
        p.stats.energy.current = Math.min(100, p.stats.energy.current + 8);
        p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + 3);
        p.stats.hunger.current = Math.max(0, p.stats.hunger.current - 1);
        p.status = 'sleeping';
        return;
      }

      if (p.stage !== 'egg') {
        p.stats.hunger.current = Math.max(0, p.stats.hunger.current - 1);
        p.stats.happiness.current = Math.max(0, p.stats.happiness.current - 1);
        p.stats.cleanliness.current = Math.max(0, p.stats.cleanliness.current - 1);

        // Autopilot Daycare Snack Bowl: auto-feed if hungry and bowl is in inventory
        if (p.stats.hunger.current <= 25) {
          const profile = storage.getProfile();
          const daycareBowl = profile.items.find((i) => i.id === 'daycare-bowl' && i.quantity > 0);
          if (daycareBowl) {
            daycareBowl.quantity--;
            if (daycareBowl.quantity <= 0) {
              profile.items = profile.items.filter((i) => i.id !== 'daycare-bowl');
            }
            p.stats.hunger.current = Math.min(100, p.stats.hunger.current + 35);
            p.stats.happiness.current = Math.min(100, p.stats.happiness.current + 10);
            this.ui.showToast(`🥣 Daycare Bowl auto-fed ${p.name}!`);
            this.petEntity?.playHappy();
          }
        }

        // Waste generation chance if fed and awake (15% per 30s)
        if (p.stats.hunger.current > 30 && Math.random() < 0.15 && (p.stats.poopCount ?? 0) < 4) {
          p.stats.poopCount = (p.stats.poopCount ?? 0) + 1;
          p.stats.cleanliness.current = Math.max(0, p.stats.cleanliness.current - 15);
        }

        // Sickness trigger from low hygiene or excessive waste
        if (p.stats.cleanliness.current <= 10 || (p.stats.poopCount ?? 0) >= 3) {
          if (p.status !== 'sick') {
            p.stats.careMistakes = (p.stats.careMistakes ?? 0) + 1;
          }
          p.status = 'sick';
        } else if (p.stats.hunger.current <= 15) {
          p.status = 'hungry';
        } else if ((p.stats.poopCount ?? 0) > 0) {
          p.status = 'poopy';
        } else {
          p.status = 'idle';
        }
      }
    });

    this.petEntity?.updateStatusVisuals();
    this.ui.updateStatus(pet);
  }

  // Semantic Navigation Handlers
  public onNavUp(): void {
    if (this.ui.isMenuOpen) {
      this.ui.navigateUp();
    } else {
      this.petEntity?.playHappy();
      this.ui.showToast(`${this.petEntity?.petData.name ?? 'Pet'} is cheerful!`);
    }
  }

  public onNavDown(): void {
    if (this.ui.isMenuOpen) {
      this.ui.navigateDown();
    } else {
      this.openActionMenu();
    }
  }

  public onNavLeft(): void {
    if (this.ui.isMenuOpen) {
      this.switchMenuTab(-1);
    } else {
      this.openItemsMenu();
    }
  }

  public onNavRight(): void {
    if (this.ui.isMenuOpen) {
      this.switchMenuTab(1);
    } else {
      this.openBattleMenu();
    }
  }

  public onConfirm(): void {
    if (this.ui.isMenuOpen) {
      this.ui.executeSelected();
    } else {
      this.openActionMenu();
    }
  }

  public onCancel(): void {
    if (this.ui.isMenuOpen) {
      this.ui.closeMenu();
      SoundService.getInstance().playBack();
    }
  }

  // Hardware Button Handlers
  public onButton1(): void {
    if (this.ui.isMenuOpen) {
      this.ui.navigateUp();
    } else {
      this.openItemsMenu();
    }
  }

  public onButton2(): void {
    if (this.ui.isMenuOpen) {
      this.ui.executeSelected();
    } else {
      this.openActionMenu();
    }
  }

  public onButton3(): void {
    if (this.ui.isMenuOpen) {
      this.ui.navigateDown();
    } else {
      this.openBattleMenu();
    }
  }

  private switchMenuTab(direction: -1 | 1): void {
    if (!this.ui.isMenuOpen) return;
    const current = this.ui.activeTab || 2;
    let nextTab = (current + direction) as 1 | 2 | 3;
    if (nextTab < 1) nextTab = 3;
    if (nextTab > 3) nextTab = 1;

    SoundService.getInstance().playSelect();
    if (nextTab === 1) this.openItemsMenu();
    else if (nextTab === 2) this.openActionMenu();
    else if (nextTab === 3) this.openBattleMenu();
  }

  // 1. Items Menu (Tab 1)
  private openItemsMenu(): void {
    const storage = StorageService.getInstance();
    const profile = storage.getProfile();
    const items: MenuItem[] = [];

    profile.items.forEach((item) => {
      items.push({
        label: `${item.name} (x${item.quantity})`,
        action: () => {
          if (storage.useItem(item.id)) {
            this.petEntity?.feed(() => {
              this.ui.showToast(`Gave ${item.name}!`);
              this.ui.updateStatus(storage.getCurrentPet());
            });
            this.ui.closeMenu();
          }
        },
      });
    });

    items.push({
      label: '🏪 Visit Shop',
      action: () => this.openShopMenu(),
    });

    items.push({
      label: '✖ Close Menu',
      action: () => this.ui.closeMenu(),
    });

    this.ui.openMenu(items, 1);
  }

  // Shop Menu
  private openShopMenu(): void {
    const storage = StorageService.getInstance();
    const shopList = [
      // Sustenance Consumables
      { id: 'parsnip', name: 'Parsnip', cost: 2, hunger: 25, energy: 15, cleanliness: 5 },
      { id: 'candy-cane', name: 'Candy Cane', cost: 3, hunger: 15, happiness: 25, energy: 25 },
      { id: 'cyber-meat', name: 'Prime Dino Ribs', cost: 5, hunger: 45, happiness: 15, energy: 15 },
      { id: 'cake', name: 'Cake', cost: 6, hunger: 30, happiness: 40, energy: 20 },
      { id: 'medicine', name: 'Vaccine Spray', cost: 10, hunger: 0, cureSick: true, cleanliness: 50 },

      // Training & Automation
      { id: 'daycare-bowl', name: 'Daycare Snack Bowl', cost: 12, hunger: 35, desc: 'Auto-feeds pet when hungry' },
      { id: 'protein-shake', name: 'Mega Protein Shake', cost: 15, hunger: 20, attack: 2, defense: 1, discipline: 5 },
      { id: 'power-bracer', name: 'Titan Bracer', cost: 25, maxHp: 5, attack: 2, defense: 2, discipline: 10 },
      { id: 'golden-apple', name: 'Golden Digi-Apple', cost: 30, hunger: 50, happiness: 60, energy: 50, cureSick: true },

      // High-Tier Gene Sinks
      { id: 'catalyst-stone', name: 'Ancient Gene Catalyst', cost: 65, desc: 'Induces rare spontaneous mutation' },

      // Collectible Shell Casings
      { id: 'shell-dragon', name: 'Crimson Red Shell', cost: 50, themeName: 'Dragon Blood', type: 'theme' },
      { id: 'shell-bronze', name: 'Bronze Metal Shell', cost: 60, themeName: 'Cool Bronze', type: 'theme' },
      { id: 'shell-gold', name: 'Solar Gold Shell', cost: 75, themeName: 'Golden Beam', type: 'theme' },
    ];

    const items: MenuItem[] = shopList.map((shopItem) => ({
      label: `Buy ${shopItem.name} (🪙${shopItem.cost})`,
      action: () => {
        if ((shopItem as any).type === 'theme') {
          const themeName = (shopItem as any).themeName;
          if (storage.getUnlockedThemes().includes(themeName)) {
            this.ui.showToast('Already unlocked & owned!');
            return;
          }
          if (storage.spendMoney(shopItem.cost)) {
            storage.unlockTheme(themeName);
            storage.setTheme(themeName);
            const digivice = this.scene.get('DigiviceScene') as DigiviceScene;
            digivice?.setTheme(themeName);
            SoundService.getInstance().playMoney();
            this.ui.showToast(`Unlocked & equipped ${DIGIVICE_THEMES[themeName]?.displayName || themeName}!`);
            this.ui.updateStatus(storage.getCurrentPet());
          } else {
            this.ui.showToast('Not enough coins!');
          }
          return;
        }

        if (storage.spendMoney(shopItem.cost)) {
          SoundService.getInstance().playMoney();
          storage.addItem({
            id: shopItem.id,
            name: shopItem.name,
            description: (shopItem as any).desc || 'Purchased from Digi-Shop',
            effects: {
              hunger: (shopItem as any).hunger,
              happiness: (shopItem as any).happiness,
              energy: (shopItem as any).energy,
              cureSick: (shopItem as any).cureSick,
              cleanliness: (shopItem as any).cleanliness,
              attack: (shopItem as any).attack,
              defense: (shopItem as any).defense,
              maxHp: (shopItem as any).maxHp,
              discipline: (shopItem as any).discipline,
            },
            quantity: 1,
            shopValue: shopItem.cost,
          });
          this.ui.showToast(`Bought ${shopItem.name}!`);
          this.ui.updateStatus(storage.getCurrentPet());
        } else {
          this.ui.showToast('Not enough coins!');
        }
      },
    }));

    items.push({
      label: '⬅ Back to Items',
      action: () => this.openItemsMenu(),
    });

    this.ui.openMenu(items, 1);
  }

  // 2. Action Menu (Tab 2)
  private openActionMenu(): void {
    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();
    if (!pet) return;

    const items: MenuItem[] = [];

    if (pet.stage === 'egg') {
      items.push({
        label: '🐣 Hatch Egg Now',
        action: () => this.triggerHatch(),
      });
      items.push({
        label: '👋 Poke Egg',
        action: () => {
          this.petEntity?.playAction('peek', 800);
          this.ui.showToast('Egg wiggles softly...');
          this.ui.closeMenu();
        },
      });
    } else {
      // Sleep Toggle (Lights Out)
      items.push({
        label: pet.isSleeping ? '☀️ Wake Up (Lights On)' : '💤 Lights Out (Sleep)',
        action: () => {
          const sleeping = storage.toggleSleep();
          this.petEntity?.setSleeping(sleeping);
          this.updateSleepOverlay(sleeping);
          this.ui.showToast(sleeping ? 'Lights out. Rest well!' : 'Good morning, Tamer!');
          this.ui.updateStatus(storage.getCurrentPet());
          this.ui.closeMenu();
        },
      });

      // Quick Feed
      items.push({
        label: '🍖 Feed Quick Snack',
        action: () => {
          storage.updateCurrentPet((p) => {
            p.stats.hunger.current = Math.min(100, p.stats.hunger.current + 20);
          });
          this.petEntity?.feed(() => {
            this.ui.showToast('Pet is satisfied!');
            this.ui.updateStatus(storage.getCurrentPet());
          });
          this.ui.closeMenu();
        },
      });

      // Pet & Cheer
      items.push({
        label: '💖 Pet & Cheer',
        action: () => {
          storage.updateCurrentPet((p) => {
            p.stats.happiness.current = Math.min(100, p.stats.happiness.current + 20);
            p.stats.discipline = Math.min(100, (p.stats.discipline ?? 70) + 2);
          });
          this.petEntity?.playHappy();
          this.ui.showToast(`${pet.name} is cheerful!`);
          this.ui.updateStatus(storage.getCurrentPet());
          this.ui.closeMenu();
        },
      });

      // Bath & Flush Poop
      items.push({
        label: '🚿 Bath & Flush Poop',
        action: () => {
          storage.cleanPoop();
          this.petEntity?.clean(() => {
            this.ui.showToast('Flushed and sparkling clean!');
            this.ui.updateStatus(storage.getCurrentPet());
          });
          this.ui.closeMenu();
        },
      });

      // Medicine if sick
      if (pet.status === 'sick') {
        items.push({
          label: '💉 Administer Medicine',
          action: () => {
            storage.updateCurrentPet((p) => {
              p.status = 'idle';
              p.stats.hp = p.stats.maxHp;
            });
            SoundService.getInstance().playStartup();
            this.petEntity?.updateStatusVisuals();
            this.ui.showToast('Vaccine administered! Cured!');
            this.ui.updateStatus(storage.getCurrentPet());
            this.ui.closeMenu();
          },
        });
      }

      // Interactive Mini-Game
      items.push({
        label: '⚡ Digi-Workout (Mini-Game)',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('MiniGameScene');
          this.scene.stop('PetScene');
        },
      });

      // Focus Companion Mode (GOAL-002)
      items.push({
        label: '🧘 Cyber Focus (Pomodoro)',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('FocusScene');
          this.scene.stop('PetScene');
        },
      });

      // Branching Evolution
      items.push({
        label: '✨ Branch Evolution',
        action: () => this.triggerEvolve(),
      });

      // Hall of Fame
      items.push({
        label: '🏛️ Hall of Fame & Lineage',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('HallOfFameScene');
          this.scene.stop('PetScene');
        },
      });

      // Pedigree & Genetics
      items.push({
        label: '🧬 Pedigree & Genetics',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('PedigreeScene');
          this.scene.stop('PetScene');
        },
      });

      // Export Tamer Card (PNG)
      items.push({
        label: '📇 Export Tamer Card (PNG)',
        action: async () => {
          this.ui.closeMenu();
          try {
            const { CardExportService } = await import('../services/cardExport');
            await CardExportService.exportTamerCard(pet, storage.getProfile(), this);
            this.ui.showToast('Downloaded Tamer Card PNG!');
          } catch (e) {
            console.error('Card export error:', e);
            this.ui.showToast('Card export failed');
          }
        },
      });

      // Share Pet Passport
      items.push({
        label: '🔗 Copy Pet Passport URL',
        action: async () => {
          this.ui.closeMenu();
          try {
            const { PetPassportService } = await import('../services/network/petPassport');
            const url = PetPassportService.generateShareableUrl(pet, storage.getProfile().username);
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              await navigator.clipboard.writeText(url);
              this.ui.showToast('Copied Pet URL to Clipboard!');
            } else {
              this.ui.showToast('Passport Generated!');
            }
          } catch (e) {
            this.ui.showToast('Passport copy failed');
          }
        },
      });
    }

    items.push({
      label: '🎨 Change Shell Color',
      action: () => this.cycleTheme(),
    });

    items.push({
      label: '📺 Cycle LCD Filter (F)',
      action: () => {
        const digiScene = this.scene.get('DigiviceScene') as DigiviceScene;
        const filterName = digiScene?.cycleLcdFilter ? digiScene.cycleLcdFilter() : 'Default';
        this.ui.showToast(`LCD Filter: ${filterName}`);
        this.ui.closeMenu();
      },
    });

    items.push({
      label: StorageService.getInstance().isSoundEnabled() ? '🔇 Mute Audio (M)' : '🔊 Enable Audio (M)',
      action: () => {
        const enabled = SoundService.getInstance().toggleMute();
        this.ui.showToast(enabled ? 'Sound Enabled' : 'Sound Muted');
        this.ui.updateStatus(storage.getCurrentPet());
        this.ui.closeMenu();
      },
    });

    items.push({
      label: '✖ Close Menu',
      action: () => this.ui.closeMenu(),
    });

    this.ui.openMenu(items, 2);
  }

  // 3. Battle Menu (Tab 3)
  private openBattleMenu(): void {
    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();

    const items: MenuItem[] = [
      {
        label: '⚔ Enter Battle Arena',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('BattleScene');
          this.scene.stop('PetScene');
        },
      },
      {
        label: '🌐 Global Tamer Showcase',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('VisitorArenaScene');
          this.scene.stop('PetScene');
        },
      },
      {
        label: '🚀 Publish Pet to Lobby',
        action: async () => {
          if (!pet) return;
          this.ui.closeMenu();
          try {
            const { MockLocalPetServerClient } = await import('../services/network/serverClient');
            await MockLocalPetServerClient.getInstance().publishPet(pet, storage.getProfile().username);
            SoundService.getInstance().playMoney();
            this.ui.showToast('Published to Global Lobby!');
          } catch (e) {
            this.ui.showToast('Publish failed');
          }
        },
      },
      {
        label: '🎮 Arcade Mini-Games',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('MiniGameScene');
          this.scene.stop('PetScene');
        },
      },
      {
        label: '🔄 Switch Digi-Pet',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('SelectPetScene');
          this.scene.stop('PetScene');
        },
      },
      {
        label: '🚪 Title Screen',
        action: () => {
          this.ui.closeMenu();
          this.scene.start('TitleScene');
          this.scene.stop('PetScene');
        },
      },
      {
        label: '✖ Close Menu',
        action: () => this.ui.closeMenu(),
      },
    ];

    this.ui.openMenu(items, 3);
  }

  private triggerHatch(): void {
    this.ui.closeMenu();
    this.petEntity?.hatch(() => {
      const storage = StorageService.getInstance();
      const pet = storage.getCurrentPet()!;
      const evo = evaluateEvolution(pet);

      storage.updateCurrentPet((p) => {
        p.stage = evo.nextStage;
        p.name = evo.nextName;
        p.type = evo.nextType;
        p.stats.hp += evo.bonusHp;
        p.stats.maxHp += evo.bonusHp;
        p.stats.attack += evo.bonusAttack;
        p.stats.defense += evo.bonusDefense;
      });

      const updated = storage.getCurrentPet()!;
      this.spawnPet(updated);
      this.ui.showToast(evo.evolutionMessage);
    });
  }

  private triggerEvolve(): void {
    this.ui.closeMenu();
    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();
    if (!pet) return;

    if (pet.stage === 'egg') {
      this.triggerHatch();
      return;
    }

    const readiness = checkEvolutionReadiness(pet);
    if (!readiness.canEvolve) {
      SoundService.getInstance().playBack();
      this.ui.showToast(readiness.reason || 'Not ready to evolve yet.');
      return;
    }

    const evo = evaluateEvolution(pet);
    SoundService.getInstance().playStartup();
    this.ui.showToast(`✨ ${pet.name} is metamorphosing...!`);

    // Suspenseful Metamorphosis Ceremony: camera flash, rapid sprite pulsing
    this.cameras.main.flash(700, 56, 189, 248);
    if (this.petEntity) {
      this.tweens.add({
        targets: this.petEntity.sprite,
        scaleX: { from: 0.22, to: 0.40 },
        scaleY: { from: 0.22, to: 0.40 },
        duration: 160,
        yoyo: true,
        repeat: 7,
        onComplete: () => {
          SoundService.getInstance().playEvolve();
          this.cameras.main.shake(220, 0.015);
          storage.updateCurrentPet((p) => {
            p.stage = evo.nextStage;
            p.name = evo.nextName;
            p.type = evo.nextType;
            p.stats.branchType = evo.branch;
            p.stats.hp += evo.bonusHp;
            p.stats.maxHp += evo.bonusHp;
            p.stats.attack += evo.bonusAttack;
            p.stats.defense += evo.bonusDefense;
            p.stats.careMistakes = 0; // Reset care mistakes for new stage
          });

          const updated = storage.getCurrentPet()!;
          this.spawnPet(updated);
          this.ui.showToast(evo.evolutionMessage);
        },
      });
    }
  }

  private cycleTheme(): void {
    const storage = StorageService.getInstance();
    const unlocked = storage.getUnlockedThemes();
    const profile = storage.getProfile();
    const currentIdx = unlocked.indexOf(profile.selectedTheme);
    const nextTheme = unlocked[(currentIdx + 1) % unlocked.length];

    const digivice = this.scene.get('DigiviceScene') as DigiviceScene;
    digivice.setTheme(nextTheme);
    this.ui.showToast(`Theme: ${DIGIVICE_THEMES[nextTheme]?.displayName || nextTheme}`);
  }
}
