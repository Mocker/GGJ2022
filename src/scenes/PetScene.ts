import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { PetEntity } from '../objects/PetEntity';
import { GameUI, MenuItem } from '../objects/GameUI';
import { PetModel, PetStage } from '../types/pet';
import { evaluateEvolution } from '../data/evolutionTree';
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

    // Start stat decay timer (runs every 10 seconds)
    this.statDecayTimer = this.time.addEvent({
      delay: 10000,
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
      p.stats.timers.lived += 10000;

      // Sleep mechanics: recover HP & Energy, slower metabolism
      if (p.isSleeping) {
        p.stats.energy.current = Math.min(100, p.stats.energy.current + 5);
        p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + 2);
        p.stats.hunger.current = Math.max(0, p.stats.hunger.current - 1);
        p.status = 'sleeping';
        return;
      }

      if (p.stage !== 'egg') {
        p.stats.hunger.current = Math.max(0, p.stats.hunger.current - 2);
        p.stats.happiness.current = Math.max(0, p.stats.happiness.current - 1);
        p.stats.cleanliness.current = Math.max(0, p.stats.cleanliness.current - 1);

        // Waste generation chance if fed and awake
        if (p.stats.hunger.current > 30 && Math.random() < 0.20 && (p.stats.poopCount ?? 0) < 4) {
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

  // Hardware Button Handlers
  public onButton1(): void {
    if (this.ui.isMenuOpen) {
      this.ui.handleButton1();
    } else {
      this.openItemsMenu();
    }
  }

  public onButton2(): void {
    if (this.ui.isMenuOpen) {
      this.ui.handleButton2();
    } else {
      this.openActionMenu();
    }
  }

  public onButton3(): void {
    if (this.ui.isMenuOpen) {
      this.ui.handleButton3();
    } else {
      this.openBattleMenu();
    }
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
      { id: 'cake', name: 'Cake', cost: 5, hunger: 30, happiness: 40, energy: 20 },
      { id: 'candy-cane', name: 'Candy Cane', cost: 3, hunger: 15, happiness: 25, energy: 25 },
      { id: 'parsnip', name: 'Parsnip', cost: 2, hunger: 25, energy: 15, cleanliness: 5 },
      { id: 'medicine', name: 'Vaccine Spray', cost: 8, hunger: 0, cureSick: true, cleanliness: 50 },
    ];

    const items: MenuItem[] = shopList.map((shopItem) => ({
      label: `Buy ${shopItem.name} (🪙${shopItem.cost})`,
      action: () => {
        if (storage.spendMoney(shopItem.cost)) {
          SoundService.getInstance().playMoney();
          storage.addItem({
            id: shopItem.id,
            name: shopItem.name,
            description: 'Purchased from Digi-Shop',
            effects: {
              hunger: shopItem.hunger,
              happiness: shopItem.happiness,
              energy: shopItem.energy,
              cureSick: shopItem.cureSick,
              cleanliness: shopItem.cleanliness,
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
            await CardExportService.exportTamerCard(pet, storage.getProfile());
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

    const evo = evaluateEvolution(pet);
    SoundService.getInstance().playEvolve();

    this.petEntity?.playAction('happy', 2000, () => {
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
    });
  }

  private cycleTheme(): void {
    const storage = StorageService.getInstance();
    const profile = storage.getProfile();
    const currentIdx = THEME_NAMES.indexOf(profile.selectedTheme);
    const nextTheme = THEME_NAMES[(currentIdx + 1) % THEME_NAMES.length];

    const digivice = this.scene.get('DigiviceScene') as DigiviceScene;
    digivice.setTheme(nextTheme);
    this.ui.showToast(`Theme: ${DIGIVICE_THEMES[nextTheme].displayName}`);
  }
}
