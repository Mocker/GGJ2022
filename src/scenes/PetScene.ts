import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { PetEntity } from '../objects/PetEntity';
import { GameUI, MenuItem } from '../objects/GameUI';
import { PetModel, PetStage } from '../types/pet';
import { DIGIVICE_THEMES, THEME_NAMES } from '../services/theme';
import { DigiviceScene } from './DigiviceScene';

export class PetScene extends Phaser.Scene {
  private petEntity: PetEntity | null = null;
  public ui!: GameUI;
  private statDecayTimer!: Phaser.Time.TimerEvent;

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
  }

  private spawnPet(petData: PetModel): void {
    if (this.petEntity) {
      this.petEntity.destroy();
      this.petEntity = null;
    }
    this.petEntity = new PetEntity(this, petData);
    this.ui.updateStatus(petData);
  }

  private tickPetStats(): void {
    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();
    if (!pet || this.ui.isMenuOpen) return;

    // Decay stats slowly
    storage.updateCurrentPet((p) => {
      p.stats.timers.lived += 10000;
      if (p.stage !== 'egg') {
        p.stats.hunger.current = Math.max(0, p.stats.hunger.current - 2);
        p.stats.happiness.current = Math.max(0, p.stats.happiness.current - 1);
        p.stats.cleanliness.current = Math.max(0, p.stats.cleanliness.current - 1);

        if (p.stats.hunger.current <= 15) {
          p.status = 'hungry';
        } else if (p.stats.cleanliness.current <= 10) {
          p.status = 'sick';
        } else {
          p.status = 'idle';
        }
      }
    });

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

    // Bag items
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
      { id: 'medicine', name: 'Vaccine Spray', cost: 10, hunger: 0, cureSick: true, cleanliness: 50 },
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

      items.push({
        label: '💖 Pet & Cheer',
        action: () => {
          storage.updateCurrentPet((p) => {
            p.stats.happiness.current = Math.min(100, p.stats.happiness.current + 20);
          });
          this.petEntity?.playHappy();
          this.ui.showToast(`${pet.name} is cheerful!`);
          this.ui.updateStatus(storage.getCurrentPet());
          this.ui.closeMenu();
        },
      });

      items.push({
        label: '🚿 Clean & Wash',
        action: () => {
          storage.updateCurrentPet((p) => {
            p.stats.cleanliness.current = 100;
            if (p.status === 'poopy') p.status = 'idle';
          });
          this.petEntity?.clean();
          this.ui.showToast('Sparkling clean!');
          this.ui.updateStatus(storage.getCurrentPet());
          this.ui.closeMenu();
        },
      });

      items.push({
        label: '⚡ Train & Exercise',
        action: () => {
          storage.updateCurrentPet((p) => {
            p.stats.energy.current = Math.max(0, p.stats.energy.current - 15);
            p.stats.level += 1;
            p.stats.attack += 2;
            p.stats.maxHp += 5;
            p.stats.hp = p.stats.maxHp;
          });
          storage.addMoney(3);
          SoundService.getInstance().playSwipe(1);
          this.petEntity?.playAction('explore', 1200, () => {
            SoundService.getInstance().playMoney();
            this.ui.showToast(`Level up! Lvl ${pet.stats.level} (+3🪙)`);
            this.ui.updateStatus(storage.getCurrentPet());
          });
          this.ui.closeMenu();
        },
      });

      items.push({
        label: '✨ Force Evolution',
        action: () => this.triggerEvolve(),
      });
    }

    items.push({
      label: '🎨 Change Shell Color',
      action: () => this.cycleTheme(),
    });

    items.push({
      label: '✖ Close Menu',
      action: () => this.ui.closeMenu(),
    });

    this.ui.openMenu(items, 2);
  }

  // 3. Battle Menu (Tab 3)
  private openBattleMenu(): void {
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
      storage.updateCurrentPet((p) => {
        p.stage = 'baby';
        p.name = p.type === 'tadpole' ? 'Cute Tadpole' : p.type === 'bacteria' ? 'Baby Germ' : 'Mini Dino';
      });
      const updated = storage.getCurrentPet()!;
      this.spawnPet(updated);
      this.ui.showToast(`Hatched into ${updated.name}!`);
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

    const nextStage: PetStage = pet.stage === 'baby' ? 'adultCute' : 'adultEvil';
    SoundService.getInstance().playEvolve();

    this.petEntity?.playAction('happy', 2000, () => {
      storage.updateCurrentPet((p) => {
        p.stage = nextStage;
        p.name = nextStage === 'adultCute' ? 'Mega ' + p.name : 'Shadow ' + p.name;
        p.stats.attack += 10;
        p.stats.maxHp += 20;
        p.stats.hp = p.stats.maxHp;
      });
      const updated = storage.getCurrentPet()!;
      this.spawnPet(updated);
      this.ui.showToast(`Evolved to ${updated.stage.toUpperCase()}!`);
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
