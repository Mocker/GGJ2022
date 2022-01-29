import Phaser from 'phaser';
import { GameUI } from '../../objects/gameUI';
import { UserModel } from '../../utils' ;

export class TitleScene extends Phaser.Scene
{

    constructor ()
    {
        super("TitleScene");
        this.monsterTiles = [];
        this.goAway = false;
    }

    preload ()
    {
    }

    create ()
    {

        console.log("title loaded");
        this.titleText = new Phaser.GameObjects.Text(this, 200, 200,
            'They Might Byte!',
            {
                fontSize: 35,
                color: '#303030',
                fontFamily: 'beryl-digivice'
            })
        .setOrigin(0, 0)
        .setAlpha(0)
        .setScale(0.2, 0.2);
        this.add.existing(this.titleText);
        this.turningOn = false;
        this.game.scene.getScene('BGScene').events.on('button-two-clicked', this.nextScene.bind(this));
        this.onPowerButton();
    }

    onPowerButton () {
        
        this.turningOn = true;
        this.tweens.add({
            duration: 3000,
            targets: this.titleText,
            alpha: 1.0,
            x: 220,
            y: 380,
            scale: 1.0,
            ease: 'Expo.easeInOut',
            //onComplete: this.nextScene.bind(this)
        });
        
    }

    nextScene () {
        if (this.goAway) {
            return;
        }
        this.goAway = true;
        const userModel = UserModel.getInstance();
        if  (userModel.user) {
            this.game.scene.start("SelectMonsterScene");
        } else {
            this.game.scene.start("LoginScene");
        }
        this.game.scene.stop("TitleScene");
    }
}