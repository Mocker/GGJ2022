import Phaser from 'phaser';
import { Image, Button } from '../../objects'

// Our game scene


let image;

class GameScene extends Phaser.Scene
{

    constructor ()
    {
        super();
        this.isPaused = false;
        this.pet = null;
    }

    preload ()
    {
        image = new Image(this, 'monster', 'monster_test_01-big.png', 400, 400);
    }

    create ()
    {

        image.setImage();

        const button = new Button(100, 100, 'Play', this, () => image.play());
        const button2 = new Button(200, 100, 'Attack', this, () => image.attack());
        const buttonRedFlash = new Button(300, 100, 'RedFlash', this, () => image.tweenRedAndBack());

    }

    update () {

    }


    end () {

    }

}


export { GameScene };
