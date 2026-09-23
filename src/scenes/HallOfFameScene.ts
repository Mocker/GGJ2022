import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';

export class HallOfFameScene extends Phaser.Scene {
  private listTexts: Phaser.GameObjects.Text[] = [];
  private infoText!: Phaser.GameObjects.Text;

  constructor() {
    super('HallOfFameScene');
  }

  create(): void {
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Regal navy background
    const bg = this.add.graphics();
    bg.fillStyle(0x0c1322, 0.96);
    bg.fillRect(200, 200, 400, 400);
    bg.setMask(mask);

    // Header
    this.add.text(400, 225, '🏛️ HALL OF FAME & LINEAGE 🏛️', {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    const storage = StorageService.getInstance();
    const profile = storage.getProfile();
    const fameList = profile.hallOfFame || [];

    if (fameList.length === 0) {
      this.add.text(400, 340, 'No retired pets yet!\nAscend an adult pet to\ncommemorate their legacy.', {
        fontFamily: 'beryl-digivice',
        fontSize: '13px',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 8,
      }).setOrigin(0.5).setMask(mask);
    } else {
      const startY = 260;
      fameList.slice(0, 5).forEach((entry, idx) => {
        const line = `Gen ${entry.generation}: ${entry.name} (Lvl ${entry.level} ${entry.stage}) - Won: ${entry.battlesWon} ⚔`;
        const txt = this.add.text(220, startY + idx * 30, line, {
          fontFamily: 'beryl-digivice',
          fontSize: '11px',
          color: '#38bdf8',
        }).setMask(mask);
        this.listTexts.push(txt);
      });
    }

    const currentPet = storage.getCurrentPet();
    const canAscend = currentPet && currentPet.stage !== 'egg' && (currentPet.stats.level >= 3 || currentPet.stage === 'adultCute' || currentPet.stage === 'cyberMecha');

    this.infoText = this.add.text(400, 465, canAscend ? '1: ASCEND CURRENT PET   3: EXIT' : 'Raise pet to Adult to Ascend! [3: EXIT]', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: canAscend ? '#10b981' : '#64748b',
    }).setOrigin(0.5).setMask(mask);

    this.add.text(400, 530, 'Rebirth grants inherited stat perks & new eggs.', {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#64748b',
    }).setOrigin(0.5).setMask(mask);
  }

  public onButton1(): void {
    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();
    if (!pet || pet.stage === 'egg') return;

    if (pet.stats.level >= 3 || pet.stage === 'adultCute' || pet.stage === 'cyberMecha') {
      SoundService.getInstance().playEvolve();
      const entry = storage.retirePetToHallOfFame();
      if (entry) {
        this.infoText.setText(`Ascended ${entry.name}! Hatched Gen ${entry.generation + 1} Egg!`);
        this.infoText.setColor('#facc15');
        this.time.delayedCall(1600, () => this.returnToPetScene());
      }
    }
  }

  public onButton2(): void {
    this.returnToPetScene();
  }

  public onButton3(): void {
    this.returnToPetScene();
  }

  private returnToPetScene(): void {
    SoundService.getInstance().playBgm('ambient');
    this.scene.start('PetScene');
    this.scene.stop('HallOfFameScene');
  }
}
