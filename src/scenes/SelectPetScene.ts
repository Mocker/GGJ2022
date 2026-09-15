import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { PetModel, EggType, PetType } from '../types/pet';

interface CarouselOption {
  isNew: boolean;
  name: string;
  subText: string;
  textureKey: string;
  eggType?: EggType;
  petType?: PetType;
  petIndex?: number;
}

export class SelectPetScene extends Phaser.Scene {
  private options: CarouselOption[] = [];
  private currentIndex = 0;
  private sprite!: Phaser.GameObjects.Sprite;
  private txtTitle!: Phaser.GameObjects.Text;
  private txtName!: Phaser.GameObjects.Text;
  private txtDesc!: Phaser.GameObjects.Text;

  constructor() {
    super('SelectPetScene');
  }

  create(): void {
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    this.txtTitle = this.add.text(400, 240, 'CHOOSE YOUR DIGI-EGG', {
      fontFamily: 'beryl-digivice',
      fontSize: '18px',
      color: '#0284c7',
    }).setOrigin(0.5).setMask(mask);

    // Build carousel options: existing pets first, then 3 starter eggs
    const storage = StorageService.getInstance();
    const profile = storage.getProfile();
    this.options = [];

    // Existing pets
    profile.pets.forEach((pet, index) => {
      const animKey = pet.stage === 'egg' ? `pet-${pet.eggType}-idle` : `pet-${pet.type}-idle`;
      this.options.push({
        isNew: false,
        name: pet.name,
        subText: `Stage: ${pet.stage.toUpperCase()} | Lvl ${pet.stats.level}`,
        textureKey: animKey,
        petIndex: index,
      });
    });

    // New Starter Eggs
    this.options.push({
      isNew: true,
      name: 'Aqua Tadpole Egg',
      subText: 'Hatches into Cute Tadpole (Water Line)',
      textureKey: 'pet-egg-blue-idle',
      eggType: 'egg-blue',
      petType: 'tadpole',
    });

    this.options.push({
      isNew: true,
      name: 'Bio Bacteria Egg',
      subText: 'Hatches into Germ / Bacteria (Bio Line)',
      textureKey: 'pet-egg-green-idle',
      eggType: 'egg-green',
      petType: 'bacteria',
    });

    this.options.push({
      isNew: true,
      name: 'Solar Dino Egg',
      subText: 'Hatches into Dino / Sunfish (Solar Line)',
      textureKey: 'pet-egg-yellow-idle',
      eggType: 'egg-yellow',
      petType: 'dino',
    });

    this.sprite = this.add.sprite(400, 370, this.options[0].textureKey)
      .setDisplaySize(180, 180)
      .setMask(mask);

    this.txtName = this.add.text(400, 470, this.options[0].name, {
      fontFamily: 'beryl-digivice',
      fontSize: '16px',
      color: '#1e293b',
    }).setOrigin(0.5).setMask(mask);

    this.txtDesc = this.add.text(400, 495, this.options[0].subText, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#64748b',
    }).setOrigin(0.5).setMask(mask);

    this.add.text(400, 540, '[1] PREV   [2] SELECT   [3] NEXT', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#0284c7',
    }).setOrigin(0.5).setMask(mask);

    this.updateDisplay();
  }

  private updateDisplay(): void {
    const opt = this.options[this.currentIndex];
    this.txtName.setText(opt.name);
    this.txtDesc.setText(opt.subText);

    if (this.anims.exists(opt.textureKey)) {
      this.sprite.play({ key: opt.textureKey, repeat: -1 });
    } else {
      this.sprite.setTexture(opt.textureKey);
    }

    // Small bounce tween
    this.tweens.add({
      targets: this.sprite,
      scaleX: { from: 0.1, to: 0.35 },
      scaleY: { from: 0.1, to: 0.35 },
      duration: 250,
      ease: 'Back.easeOut',
    });
  }

  public onButton1(): void {
    SoundService.getInstance().playSelect();
    this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
    this.updateDisplay();
  }

  public onButton3(): void {
    SoundService.getInstance().playSelect();
    this.currentIndex = (this.currentIndex + 1) % this.options.length;
    this.updateDisplay();
  }

  public onButton2(): void {
    SoundService.getInstance().playSelect();
    const selected = this.options[this.currentIndex];
    const storage = StorageService.getInstance();

    if (selected.isNew) {
      const newPet: PetModel = {
        id: 'pet_' + Date.now(),
        name: selected.name.replace(' Egg', ''),
        type: selected.petType || 'tadpole',
        eggType: selected.eggType || 'egg-blue',
        stage: 'egg',
        stats: {
          energy: { min: 0, current: 90, max: 100 },
          hunger: { min: 0, current: 80, max: 100 },
          happiness: { min: 0, current: 60, max: 100 },
          cleanliness: { min: 0, current: 100, max: 100 },
          timers: { lived: 0, lastFed: Date.now() },
          msLeftToEvolve: 12000,
          level: 1,
          hp: 20,
          maxHp: 20,
          attack: 5,
          defense: 3,
        },
        status: 'idle',
        createdAt: Date.now(),
      };
      storage.addPet(newPet);
    } else if (selected.petIndex !== undefined) {
      storage.selectPet(selected.petIndex);
    }

    this.scene.start('PetScene');
    this.scene.stop('SelectPetScene');
  }
}
