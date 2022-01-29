import Phaser from 'phaser';
import { GameScene, LoginScene, MonsterNameScene, BattleScene } from './scenes';
import { FireBaseSingleton, UserModel } from './utils';

//import { TitleScene } from './scenes/titlescreen';

var config = {
    type: Phaser.WEBGL,
    width: 820,
    height: 820,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: [ LoginScene, GameScene, MonsterNameScene, BattleScene ],
    dom: {
        createContainer: true
    },
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