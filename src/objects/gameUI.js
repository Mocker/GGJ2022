import { Button }  from './ui/Button';

// All UI components should be in a layer here to prevent any mixup when applying effects to the game
// The menu items will be loaded from the active pet eventually

export class GameUI   {

    constructor (scene) {
        this.scene = scene;
        this.layer = scene.add.layer();

        this.menu = [
            {
                label: "ITEM",
                children : [{
                    label: "ABCDEFGHIJKL"
                }],
                onClick : null
            },
            {
                label: "ACTION",
                children: [],
                onClick : null
            },
            {
                label: "BATTLE",
                children: [],
                onClick : null
            }
        ];

        this.activeMenu = this.menu;

        this.paused = false;
        const button = new Button(100, 550, 'Play', this.scene, () => this.onButtonOne());
        const button2 = new Button(300, 550, 'Attack', this.scene, () => this.onButtonTwo());
        const button3 = new Button(500, 550, 'RedFlash', this.scene, () => this.onButtonThree());

        this.layer.add([button.button, button2.button, button3.button]);

        const tabBG = new Phaser.GameObjects.Graphics(this.scene);
        tabBG.fillStyle(0x555500, 0.5);
        tabBG.fillRoundedRect(16, 16, 200, 60, 8);
        tabBG.fillRoundedRect(266, 16, 200, 60, 8);
        tabBG.fillRoundedRect(516, 16, 200, 60, 8);
        this.scene.add.existing(tabBG);
        const tabLeft = new Phaser.GameObjects.Text(this.scene, 16, 16, this.activeMenu[0].label)
            .setStyle({
                align: 'center',
                fixedWidth: 200,
                padding: { y: 30 }
            });
        const tabMid = new Phaser.GameObjects.Text(this.scene, 266, 16, this.activeMenu[1].label)
            .setStyle({
                align: 'center',
                fixedWidth: 200,
                padding: { y: 30 }
            });;
        const tabRight = new Phaser.GameObjects.Text(this.scene, 516, 16, this.activeMenu[2].label)
        .setStyle({
            align: 'center',
            fixedWidth: 200,
            padding: { y: 30 }
        });;
        this.scene.add.existing(tabLeft); this.scene.add.existing(tabMid); this.scene.add.existing(tabRight);
        this.layer.add([tabBG, tabLeft, tabMid, tabRight]);
    }


    onButtonOne () {
        if (!this.paused && this.scene.pet) {
            this.scene.pet.OnActionOne();
        }
    }

    onButtonTwo () {
        if (!this.paused && this.scene.pet) {
            this.scene.pet.OnActionTwo();
        }
    }
    onButtonThree () {
        if (!this.paused && this.scene.pet) {
            this.scene.pet.OnActionThree();
        }
    }
}