import { LEFT } from 'phaser';
import { Button }  from './Button';

// All UI components should be in a layer here to prevent any mixup when applying effects to the game
// The menu items will be loaded from the active pet eventually

export class BattleUI   {

    constructor (scene, hp, atk) {
        this.scene = scene;
        this.layer = scene.add.layer();
        this.buttonLayer = scene.add.layer();
        this.eventListeners = {};
        const playMaskShape = this.scene.make.graphics();
        playMaskShape.fillStyle(0xffffff);
        playMaskShape.beginPath();
        playMaskShape.fillRect(200,200,400,600);
        const playMask = new Phaser.Display.Masks.GeometryMask(this.scene, playMaskShape);
        this.layer.setMask(playMask);
        this.welcomeHasBeenDone = false;

        this.attributes = [
            {
                label: `HP ▦ ▦ ▦ ▦`,
                children : [{
                    label: "ABCDEFGHIJKL"
                }],
                onClick : null
            },
            {
                label: `ATK ▦ ▦`,
                children: [],
                onClick : null
            },
        ];

        this.activeMenu = this.attributes;
        this.paused = false;
        this.isMenuShown = false;

        const tabBG = new Phaser.GameObjects.Graphics(this.scene);
        tabBG.fillStyle(0x333311, 0.8);
        tabBG.fillRoundedRect(210, 205, 120, 25, 4);
        tabBG.fillRoundedRect(346, 205, 120, 25, 4);
        this.tabBG = tabBG;
        this.scene.add.existing(this.tabBG);
        const tabTextStyle = {
            align: 'left',
            fixedWidth: 100,
            color: '#aaaaff',
            fontFamily: 'beryl-digivice'
        };
        this.tabLeft = new Phaser.GameObjects.Text(this.scene, 220, 210, this.activeMenu[0].label)
            .setStyle(tabTextStyle);
        this.tabMid = new Phaser.GameObjects.Text(this.scene, 356, 210, this.activeMenu[1].label)
            .setStyle(tabTextStyle);
        this.scene.add.existing(this.tabLeft); this.scene.add.existing(this.tabMid);
        this.layer.add([this.tabBG, this.tabLeft, this.tabMid]);
    }

    closeMenu () {
        console.log("close menu");
        for(let i=0; i<this.menuOptions.length; i++){
            this.menuOptions[i].destroy();
        }
        this.menuOptions = [];
        this.menuOptionsData = [];
        this.menuLayer.setVisible(false);
        this.isMenuShown = false;
        this.tabLeft.clearTint().setScale(1);
        this.tabMid.clearTint().setScale(1);
        this.scene.game.scene.getScene('BGScene').sfxBack.play();
    }
}