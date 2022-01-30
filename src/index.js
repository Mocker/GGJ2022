import Phaser from 'phaser';
import { 
    GameScene,
    LoginScene,
    MonsterNameScene,
    BattleScene,
    TitleScene,
    SelectMonsterScene,
    BGScene
} from './scenes';
import { FireBaseSingleton, UserModel } from './utils';


var config = {
    type: Phaser.WEBGL,
    //backgroundColor: '#829c7a',
    parent: 'game',
    dom: {
        createContainer: true
    },
    scene: [ BGScene, TitleScene, LoginScene, GameScene, SelectMonsterScene, MonsterNameScene, BattleScene ],
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        //autoCenter: Phaser.Scale.CENTER_BOTH
    },
    "render.transparent": true,
    transparent: true
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