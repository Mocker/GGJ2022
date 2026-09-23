import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';

interface Fighter {
  name: string;
  maxHp: number;
  hp: number;
  attack: number;
  spriteKey: string;
}

export class BattleScene extends Phaser.Scene {
  private playerFighter!: Fighter;
  private enemyFighter!: Fighter;

  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;

  private playerHpBar!: Phaser.GameObjects.Graphics;
  private enemyHpBar!: Phaser.GameObjects.Graphics;
  private playerHpText!: Phaser.GameObjects.Text;
  private enemyHpText!: Phaser.GameObjects.Text;
  private spGaugeGfx!: Phaser.GameObjects.Graphics;
  private roundText!: Phaser.GameObjects.Text;

  private logText!: Phaser.GameObjects.Text;
  private isPlayerTurn = true;
  private battleEnded = false;
  private playerSp = 0; // 0 to 100
  private colosseumRound = 1;
  private maxColosseumRounds = 3;

  constructor() {
    super('BattleScene');
  }

  create(): void {
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();

    // Setup Player Fighter
    this.playerFighter = {
      name: pet ? pet.name : 'Your Pet',
      maxHp: pet ? pet.stats.maxHp : 30,
      hp: pet ? pet.stats.hp : 30,
      attack: pet ? pet.stats.attack : 8,
      spriteKey: pet && pet.stage !== 'egg' ? `pet-${pet.type === 'bacteria' ? 'germ' : pet.type}-idle` : 'pet-tadpole-idle',
    };

    // Track battle attempt
    storage.updateCurrentPet((p) => {
      p.stats.battlesTotal = (p.stats.battlesTotal ?? 0) + 1;
    });

    // Battle Arena Background
    const arenaBG = this.add.graphics();
    arenaBG.fillStyle(0x0f172a, 0.95);
    arenaBG.fillRect(200, 200, 400, 400);
    arenaBG.setMask(mask);

    this.add.text(400, 220, '⚔ COLOSSEUM GAUNTLET ⚔', {
      fontFamily: 'beryl-digivice',
      fontSize: '15px',
      color: '#f43f5e',
    }).setOrigin(0.5).setMask(mask);

    this.roundText = this.add.text(400, 238, `STAGE 1 / ${this.maxColosseumRounds}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    // Sprites
    this.playerSprite = this.add.sprite(310, 410, this.playerFighter.spriteKey)
      .setDisplaySize(140, 140)
      .setDepth(10)
      .setMask(mask);
    if (this.anims.exists(this.playerFighter.spriteKey)) {
      this.playerSprite.play({ key: this.playerFighter.spriteKey, repeat: -1 });
    }

    this.enemySprite = this.add.sprite(490, 320, 'pet-germ-idle')
      .setDisplaySize(130, 130)
      .setFlipX(true)
      .setDepth(10)
      .setMask(mask);

    // HP & SP Bars
    this.playerHpBar = this.add.graphics().setMask(mask);
    this.enemyHpBar = this.add.graphics().setMask(mask);
    this.spGaugeGfx = this.add.graphics().setMask(mask);

    this.playerHpText = this.add.text(230, 470, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#38bdf8',
    }).setMask(mask);

    this.enemyHpText = this.add.text(410, 252, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#f43f5e',
    }).setMask(mask);

    // Combat Log & Action Prompt
    this.logText = this.add.text(400, 520, '1: STRIKE   2: SPECIAL (SP)   3: FLEE', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    this.colosseumRound = 1;
    this.playerSp = 20;
    this.setupEnemy(1);
    this.updateHpBars();

    SoundService.getInstance().playBgm('battle');
  }

  private setupEnemy(stage: number): void {
    const enemyTypes = ['germ', 'tadpole', 'sunfish', 'dino', 'snuffler'];
    const enemyType = enemyTypes[(stage - 1) % enemyTypes.length];
    const isBoss = stage === this.maxColosseumRounds;

    const baseHp = 20 + stage * 12 + (isBoss ? 20 : 0);
    const baseAtk = 4 + stage * 3;

    this.enemyFighter = {
      name: isBoss ? `BOSS ${enemyType.toUpperCase()}` : `WILD ${enemyType.toUpperCase()}`,
      maxHp: baseHp,
      hp: baseHp,
      attack: baseAtk,
      spriteKey: `pet-${enemyType}-idle`,
    };

    this.enemySprite.setTexture(this.enemyFighter.spriteKey);
    this.enemySprite.setAlpha(1);
    if (this.anims.exists(this.enemyFighter.spriteKey)) {
      this.enemySprite.play({ key: this.enemyFighter.spriteKey, repeat: -1 });
    }

    this.roundText.setText(`STAGE ${stage} / ${this.maxColosseumRounds} ${isBoss ? '🔥 BOSS 🔥' : ''}`);
    this.isPlayerTurn = true;
    this.battleEnded = false;
  }

  private updateHpBars(): void {
    this.playerHpBar.clear();
    this.playerHpBar.fillStyle(0x334155, 0.8);
    this.playerHpBar.fillRect(230, 485, 120, 7);
    const playerRatio = Math.max(0, this.playerFighter.hp / this.playerFighter.maxHp);
    this.playerHpBar.fillStyle(playerRatio > 0.3 ? 0x10b981 : 0xef4444, 1);
    this.playerHpBar.fillRect(230, 485, 120 * playerRatio, 7);
    this.playerHpText.setText(`${this.playerFighter.name}: ${this.playerFighter.hp}/${this.playerFighter.maxHp}`);

    // SP gauge under player HP
    this.spGaugeGfx.clear();
    this.spGaugeGfx.fillStyle(0x1e293b, 0.8);
    this.spGaugeGfx.fillRect(230, 495, 120, 4);
    this.spGaugeGfx.fillStyle(0x38bdf8, 1);
    this.spGaugeGfx.fillRect(230, 495, 120 * (this.playerSp / 100), 4);

    this.enemyHpBar.clear();
    this.enemyHpBar.fillStyle(0x334155, 0.8);
    this.enemyHpBar.fillRect(410, 268, 120, 7);
    const enemyRatio = Math.max(0, this.enemyFighter.hp / this.enemyFighter.maxHp);
    this.enemyHpBar.fillStyle(enemyRatio > 0.3 ? 0x10b981 : 0xef4444, 1);
    this.enemyHpBar.fillRect(410, 268, 120 * enemyRatio, 7);
    this.enemyHpText.setText(`${this.enemyFighter.name}: ${this.enemyFighter.hp}/${this.enemyFighter.maxHp}`);
  }

  public onButton1(): void {
    if (this.battleEnded) {
      this.returnToPetScene();
      return;
    }
    if (!this.isPlayerTurn) return;
    this.executePlayerAttack(false);
  }

  public onButton2(): void {
    if (this.battleEnded) {
      this.returnToPetScene();
      return;
    }
    if (!this.isPlayerTurn) return;

    if (this.playerSp >= 50) {
      this.playerSp = Math.max(0, this.playerSp - 50);
      this.executePlayerAttack(true);
    } else {
      SoundService.getInstance().playBack();
      this.logText.setText('Need 50% SP to Mega Strike!');
    }
  }

  public onButton3(): void {
    if (this.battleEnded) {
      this.returnToPetScene();
      return;
    }
    SoundService.getInstance().playBack();
    this.logText.setText('Fled safely from Colosseum!');
    this.time.delayedCall(800, () => this.returnToPetScene());
  }

  private executePlayerAttack(isSpecial: boolean): void {
    this.isPlayerTurn = false;
    const dmg = isSpecial
      ? Math.floor(this.playerFighter.attack * 2.2) + Phaser.Math.Between(3, 8)
      : this.playerFighter.attack + Phaser.Math.Between(-1, 3);

    if (!isSpecial) {
      this.playerSp = Math.min(100, this.playerSp + 25);
    }

    SoundService.getInstance().playSwipe(isSpecial ? 2 : 1);

    this.tweens.add({
      targets: this.playerSprite,
      x: 370,
      y: 380,
      duration: 120,
      yoyo: true,
      onComplete: () => {
        this.enemyFighter.hp = Math.max(0, this.enemyFighter.hp - dmg);
        this.updateHpBars();
        this.cameras.main.shake(120, isSpecial ? 0.02 : 0.01);
        this.logText.setText(`${isSpecial ? '💥 MEGA FINISHER' : '⚔ STRIKE'}! Dealt ${dmg} dmg!`);

        if (this.enemyFighter.hp <= 0) {
          this.handleStageVictory();
        } else {
          this.time.delayedCall(1100, () => this.executeEnemyTurn());
        }
      },
    });
  }

  private executeEnemyTurn(): void {
    if (this.battleEnded) return;
    const dmg = this.enemyFighter.attack + Phaser.Math.Between(-1, 2);
    SoundService.getInstance().playSwipe(1);

    this.tweens.add({
      targets: this.enemySprite,
      x: 430,
      y: 350,
      duration: 120,
      yoyo: true,
      onComplete: () => {
        this.playerFighter.hp = Math.max(0, this.playerFighter.hp - dmg);
        this.updateHpBars();
        this.cameras.main.shake(100, 0.01);
        this.logText.setText(`${this.enemyFighter.name} struck for ${dmg} dmg!`);

        if (this.playerFighter.hp <= 0) {
          this.handleDefeat();
        } else {
          this.isPlayerTurn = true;
          this.time.delayedCall(900, () => {
            this.logText.setText(`1: STRIKE   2: SPECIAL (${this.playerSp}% SP)   3: FLEE`);
          });
        }
      },
    });
  }

  private handleStageVictory(): void {
    SoundService.getInstance().playMoney();
    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0,
      duration: 500,
    });

    if (this.colosseumRound < this.maxColosseumRounds) {
      this.colosseumRound++;
      this.logText.setText(`Stage Clear! Advancing to Stage ${this.colosseumRound}...`);
      this.time.delayedCall(1400, () => {
        this.setupEnemy(this.colosseumRound);
        this.updateHpBars();
      });
    } else {
      this.handleColosseumChampion();
    }
  }

  private handleColosseumChampion(): void {
    this.battleEnded = true;
    SoundService.getInstance().playEvolve();
    const rewardCoins = 20;
    const storage = StorageService.getInstance();
    storage.addMoney(rewardCoins);

    // Save pet victories & HP
    storage.updateCurrentPet((p) => {
      p.stats.hp = this.playerFighter.hp;
      p.stats.battlesWon = (p.stats.battlesWon ?? 0) + 1;
      p.stats.level += 1;
      p.stats.attack += 3;
      p.stats.maxHp += 5;
      p.stats.happiness.current = Math.min(100, p.stats.happiness.current + 30);
    });

    this.logText.setText(`COLOSSEUM CHAMPION! +${rewardCoins}🪙 Lvl Up! [Press any btn]`);
  }

  private handleDefeat(): void {
    this.battleEnded = true;
    SoundService.getInstance().playBack();

    StorageService.getInstance().updateCurrentPet((p) => {
      p.stats.hp = 5;
      p.stats.energy.current = Math.max(0, p.stats.energy.current - 20);
    });

    this.logText.setText('Defeated! Retiring from arena... [Press any btn]');
  }

  private returnToPetScene(): void {
    SoundService.getInstance().playBgm('ambient');
    this.scene.start('PetScene');
    this.scene.stop('BattleScene');
  }
}
