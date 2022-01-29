import { Button }  from './ui/Button';

// All UI components should be in a layer here to prevent any mixup when applying effects to the game
// The menu items will be loaded from the active pet eventually

export class GameUI   {

    constructor (scene) {
        this.scene = scene;
        this.layer = scene.add.layer();
        const playMaskShape = this.scene.make.graphics();
        playMaskShape.fillStyle(0xffffff);
        playMaskShape.beginPath();
        playMaskShape.fillRect(200,200,400,600);
        const playMask = new Phaser.Display.Masks.GeometryMask(this.scene, playMaskShape);
        this.layer.setMask(playMask);

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

        const button = new Button(260, 680, 'Play', 'ui-btn-left', this.scene, () => this.onButtonOne());
        const button2 = new Button(400, 690, 'Attack', 'ui-btn-circle', this.scene, () => this.onButtonTwo());
        const button3 = new Button(540, 680, 'RedFlash', 'ui-btn-right', this.scene, () => this.onButtonThree());

        this.layer.add([button.button, button2.button, button3.button]);
        

        const tabBG = new Phaser.GameObjects.Graphics(this.scene);
        tabBG.fillStyle(0x333311, 0.8);
        tabBG.fillRoundedRect(210, 205, 120, 25, 4);
        tabBG.fillRoundedRect(346, 205, 120, 25, 4);
        tabBG.fillRoundedRect(475, 205, 120, 25, 4);
        this.scene.add.existing(tabBG);
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
        this.tabRight = new Phaser.GameObjects.Text(this.scene, 485, 210, this.activeMenu[2].label)
        .setStyle(tabTextStyle);
        this.scene.add.existing(this.tabLeft); this.scene.add.existing(this.tabMid); this.scene.add.existing(this.tabRight);
        this.layer.add([tabBG, this.tabLeft, this.tabMid, this.tabRight]);

        this.txtPetName = new Phaser.GameObjects.Text(this.scene, 220, 550, 'PET NAME')
            .setStyle({
                align: 'left',
                fixedWidth: 380,
                color: '#ffffff',
                fontSize: 25,
                fontFamily: 'beryl-digivice'
            });
        this.scene.add.existing(this.txtPetName);
        this.layer.add([this.txtPetName]);

        this.txtCornerNumber = new Phaser.GameObjects.Text(this.scene, 550, 570, '002')
            .setStyle({
                align: 'left',
                fixedWidth: 50,
                color: '#333333',
                fontSize: 15,
                fontFamily: 'beryl-digivice'
            });
        this.scene.add.existing(this.txtCornerNumber);
        this.layer.add([this.txtCornerNumber]);

        this.evolveDots = new Phaser.GameObjects.Graphics(this.scene);
        this.scene.add.existing(this.evolveDots);
        this.layer.add([this.evolveDots]);

        this.drawEvolveDots(220, 580, 10, 1, 3);
    }

    drawEvolveDots( x, y, w, filledDots, maxDots) {
        this.evolveDots.clear();
        
        for (let i=0; i<maxDots; i++) {
            this.evolveDots.fillStyle(0x333333);
            this.evolveDots.fillRect(x+(i*(w+5)), y, w, w);
            if  (i<filledDots) {
                this.evolveDots.fillStyle(0xffffff);
                this.evolveDots.fillRect(x+(i*(w+5)), y, w, w);
            }
        }
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