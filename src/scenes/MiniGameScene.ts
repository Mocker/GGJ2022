import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { MiniGameRegistry } from '../minigames/registry';
import { MiniGamePlugin, MiniGameReward } from '../minigames/types';
import { DigiWorkoutPlugin } from '../minigames/plugins/DigiWorkoutPlugin';
import { MemoryMatrixPlugin } from '../minigames/plugins/MemoryMatrixPlugin';
import { DigiCrawlerPlugin } from '../minigames/plugins/DigiCrawlerPlugin';

export class MiniGameScene extends Phaser.Scene {
  private activePlugin: MiniGamePlugin | null = null;
  private gameContainer!: Phaser.GameObjects.Container;
  private selectContainer!: Phaser.GameObjects.Container;
  private mask!: Phaser.Display.Masks.GeometryMask;

  // Selector elements
  private selectedGameIdx = 0;
  private titleText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private categoryText!: Phaser.GameObjects.Text;
  private iconText!: Phaser.GameObjects.Text;
  private statText!: Phaser.GameObjects.Text;

  private state: 'SELECT' | 'PLAYING' | 'GAME_OVER' = 'SELECT';
  private gameOverText!: Phaser.GameObjects.Text;

  constructor() {
    super('MiniGameScene');
  }

  create(): void {
    // 1. Ensure all plugins are registered
    const registry = MiniGameRegistry.getInstance();
    if (!registry.get('digi-workout')) registry.register(new DigiWorkoutPlugin());
    if (!registry.get('memory-matrix')) registry.register(new MemoryMatrixPlugin());
    if (!registry.get('digi-crawler')) registry.register(new DigiCrawlerPlugin());

    // 2. LCD Mask
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    this.mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Dark LCD background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a101d, 0.96);
    bg.fillRect(200, 200, 400, 400);
    bg.setMask(this.mask);

    this.selectContainer = this.add.container(0, 0).setMask(this.mask);
    this.gameContainer = this.add.container(0, 0).setMask(this.mask);

    this.buildSelectorUI();
    this.state = 'SELECT';
    this.updateSelectorDisplay();

    SoundService.getInstance().playBgm('focus');
  }

  private buildSelectorUI(): void {
    this.titleText = this.add.text(400, 230, '🎮 ARCADE LOUNGE 🎮', {
      fontFamily: 'beryl-digivice',
      fontSize: '15px',
      color: '#38bdf8',
    }).setOrigin(0.5);

    this.categoryText = this.add.text(400, 260, 'GENRE: REFLEX', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#facc15',
    }).setOrigin(0.5);

    this.iconText = this.add.text(400, 335, '⚡', {
      fontSize: '64px',
    }).setOrigin(0.5);

    this.descText = this.add.text(400, 420, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#e2e8f0',
      align: 'center',
      wordWrap: { width: 340 },
    }).setOrigin(0.5);

    this.statText = this.add.text(400, 465, 'TRAINS: ATTACK', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#10b981',
    }).setOrigin(0.5);

    const controlsPrompt = this.add.text(400, 520, '1: NEXT   2: LAUNCH   3: EXIT', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#38bdf8',
    }).setOrigin(0.5);

    this.selectContainer.add([
      this.titleText,
      this.categoryText,
      this.iconText,
      this.descText,
      this.statText,
      controlsPrompt,
    ]);
  }

  private updateSelectorDisplay(): void {
    const list = MiniGameRegistry.getInstance().getAll();
    const game = list[this.selectedGameIdx % list.length];

    this.categoryText.setText(`[ ${game.category.toUpperCase()} ] - ${game.name.toUpperCase()}`);
    this.iconText.setText(game.icon);
    this.descText.setText(game.description);
    this.statText.setText(`TRAINS: ${game.trainsStat.toUpperCase()}`);
  }

  public onNavUp(): void {
    this.onButton1();
  }

  public onNavLeft(): void {
    this.onButton1();
  }

  public onNavDown(): void {
    this.onButton1();
  }

  public onNavRight(): void {
    this.onButton1();
  }

  public onConfirm(): void {
    this.onButton2();
  }

  public onCancel(): void {
    this.onButton3();
  }

  public onButton1(): void {
    if (this.state === 'SELECT') {
      const list = MiniGameRegistry.getInstance().getAll();
      this.selectedGameIdx = (this.selectedGameIdx + 1) % list.length;
      SoundService.getInstance().playSelect();
      this.updateSelectorDisplay();
    } else if (this.state === 'PLAYING') {
      this.activePlugin?.handleButton(1);
    } else if (this.state === 'GAME_OVER') {
      this.returnToPetScene();
    }
  }

  public onButton2(): void {
    if (this.state === 'SELECT') {
      this.launchSelectedGame();
    } else if (this.state === 'PLAYING') {
      this.activePlugin?.handleButton(2);
    } else if (this.state === 'GAME_OVER') {
      this.returnToPetScene();
    }
  }

  public onButton3(): void {
    if (this.state === 'SELECT') {
      this.returnToPetScene();
    } else if (this.state === 'PLAYING') {
      this.activePlugin?.handleButton(3);
    } else if (this.state === 'GAME_OVER') {
      this.returnToPetScene();
    }
  }

  private launchSelectedGame(): void {
    const list = MiniGameRegistry.getInstance().getAll();
    const plugin = list[this.selectedGameIdx % list.length];
    const pet = StorageService.getInstance().getCurrentPet();
    if (!pet) return;

    this.activePlugin = plugin;
    this.state = 'PLAYING';
    this.selectContainer.setVisible(false);
    this.gameContainer.removeAll(true);
    this.gameContainer.setVisible(true);

    SoundService.getInstance().playStartup();

    plugin.init({
      pet,
      scene: this,
      container: this.gameContainer,
      mask: this.mask,
      onGameOver: (reward) => this.handleGameOver(reward),
    });
  }

  private handleGameOver(reward: MiniGameReward): void {
    this.state = 'GAME_OVER';
    if (this.activePlugin) {
      this.activePlugin.destroy();
      this.activePlugin = null;
    }
    this.gameContainer.removeAll(true);

    const storage = StorageService.getInstance();
    storage.addMoney(reward.coins);

    storage.updateCurrentPet((p) => {
      p.stats.energy.current = Math.max(0, p.stats.energy.current - 15);
      p.stats.discipline = Math.min(100, (p.stats.discipline ?? 70) + 4);

      if (reward.statBonus) {
        if (reward.statBonus.stat === 'attack') p.stats.attack += reward.statBonus.value;
        if (reward.statBonus.stat === 'defense') p.stats.defense += reward.statBonus.value;
        if (reward.statBonus.stat === 'discipline') {
          p.stats.discipline = Math.min(100, (p.stats.discipline ?? 70) + reward.statBonus.value);
        }
        if (reward.statBonus.stat === 'happiness') {
          p.stats.happiness.current = Math.min(100, p.stats.happiness.current + reward.statBonus.value);
        }
      }
    });

    SoundService.getInstance().playEvolve();

    this.gameOverText = this.add.text(400, 360, `${reward.summary}\n\n[Press any button to return]`, {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#38bdf8',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setMask(this.mask);

    this.gameContainer.add(this.gameOverText);
  }

  update(time: number, delta: number): void {
    if (this.state === 'PLAYING' && this.activePlugin?.update) {
      this.activePlugin.update(time, delta);
    }
  }

  private returnToPetScene(): void {
    if (this.activePlugin) {
      this.activePlugin.destroy();
      this.activePlugin = null;
    }
    SoundService.getInstance().playBgm('ambient');
    this.scene.start('PetScene');
    this.scene.stop('MiniGameScene');
  }
}
