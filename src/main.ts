import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { DigiviceScene } from './scenes/DigiviceScene';
import { TitleScene } from './scenes/TitleScene';
import { SelectPetScene } from './scenes/SelectPetScene';
import { PetScene } from './scenes/PetScene';
import { BattleScene } from './scenes/BattleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 800,
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  dom: {
    createContainer: true,
  },
  scene: [BootScene, DigiviceScene, TitleScene, SelectPetScene, PetScene, BattleScene],
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});
