import Phaser from 'phaser';
import { GameScene, LoginScene, MonsterNameScene, BattleScene } from './scenes';
import { FireBaseSingleton, UserModel } from './utils';

//import { TitleScene } from './scenes/titlescreen';

var config = {
    type: Phaser.WEBGL,
    backgroundColor: '#2d2d2d',
    parent: 'game',
    dom: {
        createContainer: true
    },
    scene: [ LoginScene, GameScene, MonsterNameScene, BattleScene ],
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Our game Object
var game = new Phaser.Game(config);

new FireBaseSingleton(game);
new UserModel();

// Add both scenes (it does not start them)
/*game.scene.add('titlescreen', titleScene);
game.scene.add("game", GameScene, true);

// Start the title scene
game.scene.start('game');*/