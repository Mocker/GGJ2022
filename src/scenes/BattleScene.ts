import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { PetModel } from '../types/pet';

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

  private logText!: Phaser.GameObjects.Text;
  private isPlayerTurn = true;
  private battleEnded = false;
  private selectedAction = 0; // 0: Strike, 1: Special, 2: Run

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

    // 1. Setup Fighters
    this.playerFighter = {
      name: pet ? pet.name : 'Your Pet',
      maxHp: pet ? pet.stats.maxHp : 30,
      hp: pet ? pet.stats.hp : 30,
      attack: pet ? pet.stats.attack : 8,
      spriteKey: pet && pet.stage !== 'egg' ? `pet-${pet.type === 'bacteria' ? 'germ' : pet.type}-idle` : 'pet-tadpole-idle',
    };

    const enemyTypes = ['germ', 'dino', 'sunfish', 'snuffler'];
    const randomEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    this.enemyFighter = {
      name: 'Wild ' + randomEnemy.toUpperCase(),
      maxHp: 25 + Math.floor(Math.random() * 20),
      hp: 25,
      attack: 5 + Math.floor(Math.random() * 4),
      spriteKey: `pet-${randomEnemy}-idle`,
    };
    this.enemyFighter.hp = this.enemyFighter.maxHp;

    // 2. Battle Arena Background & Grid
    const arenaBG = this.add.graphics();
    arenaBG.fillStyle(0x0f172a, 0.9);
    arenaBG.fillRect(200, 200, 400, 400);
    arenaBG.setMask(mask);

    this.add.text(400, 225, '⚔ DIGI-ARENA ⚔', {
      fontFamily: 'beryl-digivice',
      fontSize: '16px',
      color: '#f43f5e',
    }).setOrigin(0.5).setMask(mask);

    // 3. Sprites
    this.playerSprite = this.add.sprite(310, 410, this.playerFighter.spriteKey)
      .setDisplaySize(140, 140)
      .setDepth(10)
      .setMask(mask);
    if (this.anims.exists(this.playerFighter.spriteKey)) {
      this.playerSprite.play({ key: this.playerFighter.spriteKey, repeat: -1 });
    }

    this.enemySprite = this.add.sprite(490, 320, this.enemyFighter.spriteKey)
      .setDisplaySize(130, 130)
      .setFlipX(true)
      .setDepth(10)
      .setMask(mask);
    if (this.anims.exists(this.enemyFighter.spriteKey)) {
      this.enemySprite.play({ key: this.enemyFighter.spriteKey, repeat: -1 });
    }

    // 4. HP Bars
    this.playerHpBar = this.add.graphics().setMask(mask);
    this.enemyHpBar = this.add.graphics().setMask(mask);

    this.playerHpText = this.add.text(230, 470, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#38bdf8',
    }).setMask(mask);

    this.enemyHpText = this.add.text(410, 248, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#f43f5e',
    }).setMask(mask);

    this.updateHpBars();

    // 5. Combat Log & Action Prompt
    this.logText = this.add.text(400, 520, '1: STRIKE   2: SELECT   3: FLEE', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    this.isPlayerTurn = true;
    this.battleEnded = false;
  }

  private updateHpBars(): void {
    this.playerHpBar.clear();
    this.playerHpBar.fillStyle(0x334155, 0.8);
    this.playerHpBar.fillRect(230, 485, 120, 8);
    const playerRatio = Math.max(0, this.playerFighter.hp / this.playerFighter.maxHp);
    this.playerHpBar.fillStyle(playerRatio > 0.3 ? 0x10b981 : 0xef4444, 1);
    this.playerHpBar.fillRect(230, 485, 120 * playerRatio, 8);
    this.playerHpText.setText(`${this.playerFighter.name}: ${this.playerFighter.hp}/${this.playerFighter.maxHp}`);

    this.enemyHpBar.clear();
    this.enemyHpBar.fillStyle(0x334155, 0.8);
    this.enemyHpBar.fillRect(410, 265, 120, 8);
    const enemyRatio = Math.max(0, this.enemyFighter.hp / this.enemyFighter.maxHp);
    this.enemyHpBar.fillStyle(enemyRatio > 0.3 ? 0x10b981 : 0xef4444, 1);
    this.enemyHpBar.fillRect(410, 265, 120 * enemyRatio, 8);
    this.enemyHpText.setText(`${this.enemyFighter.name}: ${this.enemyFighter.hp}/${this.enemyFighter.maxHp}`);
  }

  public onButton1(): void {
    if (!this.isPlayerTurn || this.battleEnded) return;
    this.executePlayerAttack(false);
  }

  public onButton2(): void {
    if (!this.isPlayerTurn || this.battleEnded) return;
    this.executePlayerAttack(true);
  }

  public onButton3(): void {
    if (this.battleEnded) {
      this.returnToPetScene();
      return;
    }
    // Flee
    SoundService.getInstance().playBack();
    this.logText.setText('Fled safely from battle!');
    this.time.delayedCall(800, () => this.returnToPetScene());
  }

  private executePlayerAttack(isSpecial: boolean): void {
    this.isPlayerTurn = false;
    const dmg = isSpecial
      ? Math.floor(this.playerFighter.attack * 1.5) + Phaser.Math.Between(1, 4)
      : this.playerFighter.attack + Phaser.Math.Between(-1, 2);

    SoundService.getInstance().playSwipe(isSpecial ? 2 : 1);

    // Attack dash tween
    this.tweens.add({
      targets: this.playerSprite,
      x: 370,
      y: 380,
      duration: 120,
      yoyo: true,
      onComplete: () => {
        // Enemy hurt flash
        this.enemyFighter.hp = Math.max(0, this.enemyFighter.hp - dmg);
        this.updateHpBars();
        this.cameras.main.shake(100, 0.01);
        this.logText.setText(`${isSpecial ? 'MEGA CRIT' : 'HIT'}! Dealt ${dmg} damage!`);

        if (this.enemyFighter.hp <= 0) {
          this.handleVictory();
        } else {
          this.time.delayedCall(1200, () => this.executeEnemyTurn());
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
        this.logText.setText(`Enemy struck for ${dmg} dmg!`);

        if (this.playerFighter.hp <= 0) {
          this.handleDefeat();
        } else {
          this.isPlayerTurn = true;
          this.time.delayedCall(1000, () => {
            this.logText.setText('1: STRIKE   2: SPECIAL   3: FLEE');
          });
        }
      },
    });
  }

  private handleVictory(): void {
    this.battleEnded = true;
    SoundService.getInstance().playMoney();
    const rewardCoins = 8 + Phaser.Math.Between(2, 6);
    StorageService.getInstance().addMoney(rewardCoins);

    // Save HP back
    StorageService.getInstance().updateCurrentPet((p) => {
      p.stats.hp = this.playerFighter.hp;
      p.stats.happiness.current = Math.min(100, p.stats.happiness.current + 25);
    });

    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0,
      duration: 500,
    });

    this.logText.setText(`VICTORY! Won ${rewardCoins}🪙! [Press any btn]`);
  }

  private handleDefeat(): void {
    this.battleEnded = true;
    SoundService.getInstance().playBack();

    StorageService.getInstance().updateCurrentPet((p) => {
      p.stats.hp = 5;
    });

    this.logText.setText('Defeated! Retiring... [Press any btn]');
  }

  private returnToPetScene(): void {
    this.scene.start('PetScene');
    this.scene.stop('BattleScene');
  }
}
