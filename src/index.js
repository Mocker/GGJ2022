import Phaser from 'phaser';
import { GameScene } from './scenes/game';
import { titleScene } from './scenes/titlescreen';

var config = {
    type: Phaser.WEBGL,
    width: 820,
    height: 820,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: [ GameScene ],
    dom: {
        createContainer: true
    }
};

// Our game Object
var game = new Phaser.Game(config);

// Add both scenes (it does not start them)
/*game.scene.add('titlescreen', titleScene);
game.scene.add("game", GameScene, true);

// Start the title scene
game.scene.start('game');*/