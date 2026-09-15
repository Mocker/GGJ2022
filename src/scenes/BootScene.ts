import Phaser from 'phaser';
import { DIGIVICE_THEMES } from '../services/theme';
import { SoundService } from '../services/audio';

const PET_ANIM_FILES: Record<string, string[]> = {
  dino: ['idle'],
  germ: ['chomp', 'explore', 'happy', 'idle', 'sick', 'sleep', 'weak'],
  snuffler: ['eating', 'explore', 'flinch', 'happy', 'hurt', 'idle', 'mad', 'sleep'],
  sunfish: ['explore', 'happy', 'idle', 'mad', 'sleep', 'weak'],
  tadpole: ['eat', 'explore', 'flinch', 'happy', 'idle', 'mad', 'sleep', 'weak'],
  'egg-yellow': ['idle', 'peek', 'hatch', 'shatter'],
  'egg-blue': ['idle', 'peek', 'hatch', 'shatter'],
  'egg-green': ['idle', 'peek', 'hatch', 'shatter'],
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // 1. Loading UI inside the 400x400 LCD area
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x162b3c, 0.8);
    progressBox.fillRect(250, 380, 300, 30);

    const loadingText = this.add.text(400, 350, 'DIGIVICE BOOTING...', {
      fontFamily: 'beryl-digivice',
      fontSize: '16px',
      color: '#38bdf8',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x38bdf8, 1);
      progressBar.fillRect(255, 385, 290 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 2. Hardware Digivice Themes
    this.load.image('bg-solid', 'images/ui/test-A-_0000_BG.png');
    this.load.image('ui-power-on', 'images/ui/light.png');
    this.load.image('title-text', 'images/ui/title-text.png');

    for (const key of Object.keys(DIGIVICE_THEMES)) {
      const theme = DIGIVICE_THEMES[key];
      this.load.image(`ui-frame-${theme.name}`, `images/ui/${theme.name}/MiteByte_${theme.suffix}.png`);
      this.load.image(`ui-btn-left-${theme.name}`, `images/ui/${theme.name}/L_${theme.suffix}.png`);
      this.load.image(`ui-btn-circle-${theme.name}`, `images/ui/${theme.name}/B 1_${theme.suffix}.png`);
      this.load.image(`ui-btn-right-${theme.name}`, `images/ui/${theme.name}/R_${theme.suffix}.png`);
      this.load.image(`ui-btn-left-${theme.name}-on`, `images/ui/${theme.name}/L push_${theme.suffix}.png`);
      this.load.image(`ui-btn-circle-${theme.name}-on`, `images/ui/${theme.name}/B 1 push_${theme.suffix}.png`);
      this.load.image(`ui-btn-right-${theme.name}-on`, `images/ui/${theme.name}/R push_${theme.suffix}.png`);
    }

    // 3. Pet Atlases
    for (const petType of Object.keys(PET_ANIM_FILES)) {
      for (const anim of PET_ANIM_FILES[petType]) {
        this.load.atlas(
          `pet-${petType}-${anim}`,
          `images/pets/${petType}/${anim}.png`,
          `images/pets/${petType}/${anim}.json`
        );
      }
    }

    // 4. Sound Effects
    this.load.audio('sfx-startup', 'images/sfx/startup.mp3');
    this.load.audio('sfx-back', 'images/sfx/back.mp3');
    this.load.audio('sfx-select', 'images/sfx/select.mp3');
    this.load.audio('sfx-eat', 'images/sfx/eat.mp3');
    this.load.audio('sfx-hatch', 'images/sfx/hatch.mp3');
    this.load.audio('sfx-evolve', 'images/sfx/evolve.mp3');
    this.load.audio('sfx-money', 'images/sfx/money.mp3');
    this.load.audio('sfx-swipe-1', 'images/sfx/swipe_1.mp3');
    this.load.audio('sfx-swipe-2', 'images/sfx/swipe_2.mp3');
    this.load.audio('sfx-cry-tadpole', 'images/sfx/cry_tadpole.mp3');
    this.load.audio('sfx-cry-fish', 'images/sfx/cry_fish.mp3');
    this.load.audio('sfx-cry-cutie', 'images/sfx/cry_cutie.mp3');
    this.load.audio('sfx-cry-germ', 'images/sfx/cry_germ.mp3');
    this.load.audio('sfx-cry-dino', 'images/sfx/cry_dino.mp3');
  }

  create(): void {
    // Initialize global SoundService
    SoundService.getInstance().init(this.sound);

    // Create animation presets for all atlases
    for (const petType of Object.keys(PET_ANIM_FILES)) {
      for (const anim of PET_ANIM_FILES[petType]) {
        const atlasKey = `pet-${petType}-${anim}`;
        if (this.textures.exists(atlasKey)) {
          const frames = this.textures.get(atlasKey).getFrameNames().map((f) => ({
            key: atlasKey,
            frame: f,
          }));

          if (frames.length > 0) {
            this.anims.create({
              key: atlasKey,
              frames,
              frameRate: 6,
              repeat: anim === 'idle' || anim === 'sleep' ? -1 : 0,
            });
          }
        }
      }
    }

    // Launch persistent hardware Digivice shell scene
    this.scene.launch('DigiviceScene');

    // Start TitleScene
    this.scene.start('TitleScene');
  }
}
