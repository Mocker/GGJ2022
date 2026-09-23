import Phaser from 'phaser';
import { MiniGamePlugin, MiniGameContext, MiniGameCategory } from '../types';
import { SoundService } from '../../services/audio';

interface DungeonDoor {
  type: 'monster' | 'treasure' | 'spring' | 'portal';
  label: string;
  desc: string;
}

export class DigiCrawlerPlugin implements MiniGamePlugin {
  public readonly id = 'digi-crawler';
  public readonly name = 'Digi-Crawler';
  public readonly icon = '🗺️';
  public readonly category: MiniGameCategory = 'dungeon';
  public readonly description = '5-floor procedural cyber dungeon crawl. Choose your path!';
  public readonly trainsStat = 'defense';

  private ctx!: MiniGameContext;
  private elements: Phaser.GameObjects.GameObject[] = [];

  private floorText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private doorBoxes: Phaser.GameObjects.Graphics[] = [];
  private doorLabels: Phaser.GameObjects.Text[] = [];

  private currentFloor = 1;
  private maxFloors = 5;
  private collectedCoins = 0;
  private battlesWon = 0;
  private currentDoors: DungeonDoor[] = [];
  private canChoose = true;

  init(context: MiniGameContext): void {
    this.ctx = context;
    const { scene, container, mask } = context;

    this.floorText = scene.add.text(400, 255, 'FLOOR B1 / B5', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    this.logText = scene.add.text(400, 310, 'CHOOSE A CYBER DOOR TO ENTER', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#facc15',
      align: 'center',
    }).setOrigin(0.5).setMask(mask);

    // 3 Door boxes: 1 (270, 410), 2 (400, 410), 3 (530, 410)
    const xs = [270, 400, 530];
    xs.forEach((x, idx) => {
      const box = scene.add.graphics().setMask(mask);
      this.doorBoxes.push(box);

      const lbl = scene.add.text(x, 410, '', {
        fontFamily: 'beryl-digivice',
        fontSize: '11px',
        color: '#f8fafc',
        align: 'center',
        wordWrap: { width: 90 },
      }).setOrigin(0.5).setMask(mask);
      this.doorLabels.push(lbl);
    });

    this.promptText = scene.add.text(400, 520, '1: LEFT   2: CENTER   3: RIGHT', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    this.elements.push(this.floorText, this.logText, ...this.doorBoxes, ...this.doorLabels, this.promptText);
    container.add(this.elements);

    this.currentFloor = 1;
    this.collectedCoins = 0;
    this.battlesWon = 0;
    this.canChoose = true;

    this.generateFloorDoors();
  }

  private generateFloorDoors(): void {
    this.floorText.setText(`FLOOR B${this.currentFloor} / B${this.maxFloors} ${this.currentFloor === 5 ? '🔥 BOSS FLOOR' : ''}`);

    if (this.currentFloor === 5) {
      this.currentDoors = [
        { type: 'monster', label: '⚔️\nGUARDIAN\n[1]', desc: 'Face the floor boss!' },
        { type: 'monster', label: '⚔️\nTITAN\n[2]', desc: 'Face the floor titan!' },
        { type: 'treasure', label: '💎\nVAULT\n[3]', desc: 'Attempt to loot vault!' },
      ];
    } else {
      const possible: DungeonDoor[] = [
        { type: 'monster', label: '⚔️\nSKIRMISH\n[?]', desc: 'Wild glitch encounter!' },
        { type: 'treasure', label: '💎\nDATA CACHE\n[?]', desc: 'Encrypted loot container!' },
        { type: 'spring', label: '🧪\nNANO POOL\n[?]', desc: 'Restorative liquid!' },
        { type: 'portal', label: '🚪\nGATE\n[?]', desc: 'Direct descent shaft!' },
      ];

      // Pick 3 random doors
      Phaser.Utils.Array.Shuffle(possible);
      this.currentDoors = [
        { ...possible[0], label: `${possible[0].label.replace('[?]', '[1]')}` },
        { ...possible[1], label: `${possible[1].label.replace('[?]', '[2]')}` },
        { ...possible[2], label: `${possible[2].label.replace('[?]', '[3]')}` },
      ];
    }

    const xs = [270, 400, 530];
    xs.forEach((x, idx) => {
      const box = this.doorBoxes[idx];
      box.clear();
      box.fillStyle(0x1e293b, 0.9);
      box.fillRoundedRect(x - 50, 360, 100, 100, 6);
      box.lineStyle(2, 0x38bdf8, 0.8);
      box.strokeRoundedRect(x - 50, 360, 100, 100, 6);

      this.doorLabels[idx].setText(this.currentDoors[idx].label);
    });

    this.logText.setText('SCANNING SECTOR: Choose an entrance');
    this.canChoose = true;
  }

  handleButton(btn: 1 | 2 | 3): void {
    if (!this.canChoose) return;
    this.canChoose = false;

    const chosen = this.currentDoors[btn - 1];
    SoundService.getInstance().playSwipe(1);

    if (chosen.type === 'monster') {
      this.battlesWon++;
      this.collectedCoins += 5;
      SoundService.getInstance().playMoney();
      this.logText.setText(`DEFEATED ENEMY! +5🪙 Loot recovered!`);
      this.logText.setColor('#10b981');
    } else if (chosen.type === 'treasure') {
      const loot = 8 + Math.floor(Math.random() * 6);
      this.collectedCoins += loot;
      SoundService.getInstance().playMoney();
      this.logText.setText(`OPENED DATA CACHE! Found ${loot}🪙!`);
      this.logText.setColor('#facc15');
    } else if (chosen.type === 'spring') {
      SoundService.getInstance().playStartup();
      this.logText.setText('RESTORATIVE BATH! Energy replenished!');
      this.logText.setColor('#38bdf8');
    } else if (chosen.type === 'portal') {
      SoundService.getInstance().playEvolve();
      this.logText.setText('WARP PORTAL! Descended safely!');
      this.logText.setColor('#a855f7');
    }

    this.ctx.scene.time.delayedCall(1500, () => {
      this.currentFloor++;
      if (this.currentFloor > this.maxFloors) {
        this.finishDungeon();
      } else {
        this.generateFloorDoors();
      }
    });
  }

  private finishDungeon(): void {
    const totalCoins = this.collectedCoins + 10;
    this.ctx.onGameOver({
      exp: this.currentFloor * 30 + this.battlesWon * 20,
      coins: totalCoins,
      statBonus: { stat: 'defense', value: 2 + this.battlesWon },
      summary: `DUNGEON CLEARED! +${totalCoins}🪙 +${2 + this.battlesWon} DEF!`,
    });
  }

  destroy(): void {
    this.elements.forEach((e) => e.destroy());
    this.elements = [];
    this.doorBoxes = [];
    this.doorLabels = [];
  }
}
