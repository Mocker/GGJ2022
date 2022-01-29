import Phaser from 'phaser';
import { Button } from '../objects/ui/Button';

// Background frame, should remain active at all times

export class BGScene extends Phaser.Scene
{
    constructor () {
        super("BGScene");
        this.isPowerOn = false;
        this.activeScene = null;
    }

    preload () {
        this.load.image('bg-frame', 'images/ui/DEVICE_A01_0008_device body.png');
        this.load.image('bg-solid', 'images/ui/test-A-_0000_BG.png');
        this.load.image('ui-btn-left', 'images/ui/DEVICE_A01_crop_0000s_0004_L-.png');
        this.load.image('ui-btn-circle', 'images/ui/DEVICE_A01_crop_0000s_0002_circle.png');
        this.load.image('ui-btn-right', 'images/ui/DEVICE_A01_crop_0000s_0006_R.png');
    }

    create () {
        this.bgFrame = this.add.sprite(400, 400, 'bg-frame')
            .setDisplaySize(800,800);
        this.bgSolid = this.add.sprite(400, 400, 'bg-solid')
            .setAlpha(0)
            .setDisplaySize(400, 400);

        this.powerLight = new Phaser.GameObjects.Graphics(this).setAlpha(0);
        this.powerLight.fillStyle(0xff0000);
        this.powerLight.fillCircle(269, 170, 10);
        this.add.existing(this.powerLight);

        this.buttonLayer = this.add.layer();

        const button = new Button(260, 680, 'Play', 'ui-btn-left', this, this.onButtonOne.bind(this));
        const button2 = new Button(400, 690, 'Attack', 'ui-btn-circle', this, this.onButtonTwo.bind(this));
        const button3 = new Button(540, 680, 'RedFlash', 'ui-btn-right', this, this.onButtonThree.bind(this));

        //this.buttonLayer.add([button.button, button2.button, button3.button]);

        console.log("bgFrame created");

        this.events.on('button-two-clicked', this.onPowerOn.bind(this));
    }

    onPowerOn () {
        if (this.isPowerOn) return;
        this.isPowerOn = true;
        this.tweens.add({
            duration: 1500,
            targets: this.powerLight,
            alpha: 1
        });
        this.tweens.add({
            duration: 3000,
            targets: this.bgSolid,
            alpha: 1
        });
        this.game.scene.start('TitleScene');
    }

    onButtonOne () {
        this.events.emit('button-one-clicked');
    }

    onButtonTwo () {
        console.log("BUTTON TWO CLICKY");
        this.events.emit('button-two-clicked');
    }
    onButtonThree () {
        this.events.emit('button-three-clicked');
    }

}