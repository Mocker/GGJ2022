import Phaser from 'phaser';
import { Button } from '../objects/ui/Button';
import { UserModel, clearButtonEvents } from '../utils';

// Background frame, should remain active at all times

export class BGScene extends Phaser.Scene
{
    constructor () {
        super("BGScene");
        this.isPowerOn = false;
        this.activeScene = null;

        this.themes = {
            'Mountain Steel': {
                suffix: 'Mountain Steel'
            },
            'Dragon Blood': {
                suffix: 'DB'
            },
            'Golden Beam': {
                suffix: 'gold'
            },
            'Sage Bog': {
                suffix: 'Sage Bog'
            },
            'Cool Bronze': {
                suffix: 'Cool Bronze'
            }
        };
        this.currentTheme = 'Mountain Steel';
    }

    preload () {
        //this.load.image('bg-frame', 'images/ui/DEVICE_A01_0008_device body.png');
        this.load.image('bg-frame', 'images/ui/Mountain Steel/MiteByte_Mountain Steel.png');
        this.load.image('bg-solid', 'images/ui/test-A-_0000_BG.png');
        this.load.image('ui-btn-left', 'images/ui/DEVICE_A01_crop_0000s_0004_L-.png');
        this.load.image('ui-btn-circle', 'images/ui/DEVICE_A01_crop_0000s_0002_circle.png');
        this.load.image('ui-btn-right', 'images/ui/DEVICE_A01_crop_0000s_0006_R.png');
        this.load.image('ui-btn-left-on', 'images/ui/DEVICE_A01_crop_0000s_0005_L-push.png');
        this.load.image('ui-btn-circle-on', 'images/ui/DEVICE_A01_crop_0000s_0003_circle-push.png');
        this.load.image('ui-btn-right-on', 'images/ui/DEVICE_A01_crop_0000s_0007_R-push.png');

        const themeKeys = Object.keys(this.themes);
        for (let i=0; i<themeKeys.length; i++) {
            const theme = this.themes[themeKeys[i]];
            this.load.image('ui-frame'+themeKeys[i], `images/ui/${themeKeys[i]}/MiteByte_${theme.suffix}.png`);
            this.load.image('ui-btn-left'+themeKeys[i], `images/ui/${themeKeys[i]}/L_${theme.suffix}.png`);
            this.load.image('ui-btn-circle'+themeKeys[i], `images/ui/${themeKeys[i]}/B 1_${theme.suffix}.png`);
            this.load.image('ui-btn-right'+themeKeys[i], `images/ui/${themeKeys[i]}/R_${theme.suffix}.png`);
            this.load.image(`ui-btn-left${themeKeys[i]}-on`, `images/ui/${themeKeys[i]}/L push_${theme.suffix}.png`);
            this.load.image(`ui-btn-circle${themeKeys[i]}-on`, `images/ui/${themeKeys[i]}/B 1 push_${theme.suffix}.png`);
            this.load.image(`ui-btn-right${themeKeys[i]}-on`, `images/ui/${themeKeys[i]}/R push_${theme.suffix}.png`);
        }

        
    }

    create () {
        clearButtonEvents(this.game);
        const themeKeys = Object.keys(this.themes);
        this.currentTheme = themeKeys[Math.floor(Math.random()*themeKeys.length)];
        console.log(this.currentTheme);
        this.bgFrame = this.add.sprite(400, 400, 'ui-frame'+this.currentTheme)
            .setDisplaySize(800,800);
        this.bgSolid = this.add.sprite(400, 400, 'bg-solid')
            .setAlpha(0)
            .setDisplaySize(400, 400);

        this.powerLight = new Phaser.GameObjects.Graphics(this).setAlpha(0);
        this.powerLight.fillStyle(0xff0000);
        this.powerLight.fillCircle(269, 170, 10);
        this.add.existing(this.powerLight);

        this.buttonLayer = this.add.layer();

        const button = new Button(321 * 0.8, 852 * 0.8, 'Play', 'ui-btn-left'+this.currentTheme, this, this.onButtonOne.bind(this));
        const button2 = new Button(504 * 0.8, 862 * 0.8, 'Attack', 'ui-btn-circle'+this.currentTheme, this, this.onButtonTwo.bind(this));
        const button3 = new Button(683 * 0.8, 851 * 0.8, 'RedFlash', 'ui-btn-right'+this.currentTheme, this, this.onButtonThree.bind(this));

        this.buttonLayer.add([button.button, button2.button, button3.button]);


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

    logout () {
        clearButtonEvents(this.game);
        //reset all the things, clear user session, power down
        this.game.scene.stop('GameScene');
        this.game.scene.stop('TitleScene');
        this.game.scene.stop('SelectMonsterScene');
        this.game.scene.stop('LoginScene');
        UserModel.getInstance().logout();
        this.tweens.add({
            duration: 1500,
            targets: this.powerLight,
            alpha: 0
        });
        this.tweens.add({
            duration: 3000,
            targets: this.bgSolid,
            alpha: 0
        });
        setTimeout(this.resetPower.bind(this), 1500);
        
    }

    resetPower () {
        this.isPowerOn=false; this.events.on('button-two-clicked', this.onPowerOn.bind(this));
    }

    onButtonOne () {
        this.events.emit('button-one-clicked');
    }

    onButtonTwo () {
        this.events.emit('button-two-clicked');
    }
    onButtonThree () {
        this.events.emit('button-three-clicked');
    }

}