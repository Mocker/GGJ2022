import { LEFT } from 'phaser';
import { Button }  from './ui/Button';

// All UI components should be in a layer here to prevent any mixup when applying effects to the game
// The menu items will be loaded from the active pet eventually

export class GameUI   {

    constructor (scene) {
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
        this.isMenuShown = false;

        
        

        const tabBG = new Phaser.GameObjects.Graphics(this.scene);
        tabBG.fillStyle(0x333311, 0.8);
        tabBG.fillRoundedRect(210, 205, 120, 25, 4);
        tabBG.fillRoundedRect(346, 205, 120, 25, 4);
        tabBG.fillRoundedRect(475, 205, 120, 25, 4);
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
        this.tabRight = new Phaser.GameObjects.Text(this.scene, 485, 210, this.activeMenu[2].label)
        .setStyle(tabTextStyle);
        this.scene.add.existing(this.tabLeft); this.scene.add.existing(this.tabMid); this.scene.add.existing(this.tabRight);
        this.layer.add([this.tabBG, this.tabLeft, this.tabMid, this.tabRight]);

        this.menuBG = new Phaser.GameObjects.Graphics(this.scene);
        this.menuBG.fillStyle(0x333311, 0.7);
        this.MENU_RIGHT = 210; this.MENU_TOP = 235;
        this.menuBG.fillRoundedRect(this.MENU_RIGHT, this.MENU_TOP, 370, 350, 4);
        this.scene.add.existing(this.menuBG);
        this.menuLayer = this.scene.add.layer([this.menuBG]);
        this.menuPointer = new Phaser.GameObjects.Text(this.scene, this.MENU_RIGHT+5, this.MENU_TOP+25, '->', {
            fontFamily: 'beryl-digivice',
            fontSize: 15
        });
        this.scene.add.existing(this.menuPointer);
        this.menuLayer.add([this.menuPointer]);
        this.menuOptionsData = [];
        const testMenu = [
            ['Menu Option One', () => { console.log('selected menu one'); }],
            ['Menu Close', this.closeMenu.bind(this)]
        ];
        this.menuOptions = [];
        this.menuOptionSelected = false;
        //this.buildMenu(testMenu);
        this.menuLayer.setVisible(false);

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

        this.txtMoneyNumber = new Phaser.GameObjects.Text(this.scene, 450, 570, '$$')
            .setStyle({
                align: 'left',
                fixedWidth: 50,
                color: '#336633',
                fontSize: 18,
                fontFamily: 'beryl-digivice'
            });
        this.scene.add.existing(this.txtMoneyNumber);
        this.layer.add([this.txtMoneyNumber]);

        this.evolveDots = new Phaser.GameObjects.Graphics(this.scene);
        this.scene.add.existing(this.evolveDots);
        this.layer.add([this.evolveDots]);


        this.msgLayer = this.scene.add.layer();
        this.msgBG = new Phaser.GameObjects.Graphics(this.scene);
        this.msgBG.fillStyle(0x333311, 0.9);
        this.msgBG.fillRoundedRect(this.MENU_RIGHT+50, this.MENU_TOP+50, 270, 200, 4);
        this.msgText = new Phaser.GameObjects.Text(this.scene, this.MENU_RIGHT+60, this.MENU_TOP+60, '', {
            color: '#ffff',
            align: 'left',
            fontSize: 20,
            wordWrap: true,
            wordWrapWidth: 250,
            fontFamily: 'beryl-digivice'
        });
        //this.msgText.setDisplaySize(250, 180);
        this.scene.add.existing(this.msgBG);
        this.scene.add.existing(this.msgText);
        this.msgLayer.add([this.msgBG, this.msgText]);
        this.hideMessage();

        this.on('petActivated', this.onPetActivated.bind(this));
        
    }

    hideMessage () {
        this.msgLayer.setVisible(false);
    }

    showMessage (content, duration=0) {
        this.msgText.setText(content);
        this.msgText.setWordWrapWidth(250);
        this.msgBG.setVisible(true);
        this.msgLayer.setVisible(true);
        if (duration) {
            setTimeout(this.hideMessage.bind(this), duration);
        }
    }

    // build the game objects to display menu options
    buildMenu (menuData, selectOption=0) {
        this.closeMenu();
        const MENU_PADDING_RIGHT = 40;
        const MENU_PADDING_UP = 30;
        this.MENU_PADDING_UP = MENU_PADDING_UP;
        menuData.push(['Close', this.closeMenu.bind(this)]);
        for(let i=0; i<menuData.length; i++){
            const menuObject = new Phaser.GameObjects.Text(this.scene,
                this.MENU_RIGHT+MENU_PADDING_RIGHT,
                this.MENU_TOP+((i+1)*MENU_PADDING_UP),
                //300, 300,
                menuData[i][0], 
                {
                    fontFamily: 'beryl-digivice'
                });
            this.menuOptions[i] = menuObject;
            this.scene.add.existing(this.menuOptions[i]);
            
        }
        this.menuLayer.add(this.menuOptions);
        this.menuOptionsData = menuData;
        this.menuOptionSelected = selectOption;
        this.positionMenuPointer();
        this.menuPointer.y = this.MENU_TOP + MENU_PADDING_UP;
        this.isMenuShown = true;
        this.menuLayer.setVisible(true);
    }

    closeMenu () {
        for(let i=0; i<this.menuOptions.length; i++){
            this.menuOptions[i].destroy();
        }
        this.menuOptions = [];
        this.menuOptionsData = [];
        this.menuLayer.setVisible(false);
        this.isMenuShown = false;
        this.tabLeft.clearTint().setScale(1);
        this.tabMid.clearTint().setScale(1);
        this.tabRight.clearTint().setScale(1);
    }


    onButtonOne () {
        if (this.msgLayer.visible) {
            this.hideMessage();
            return;
        }
        if (this.isMenuShown) {
            this.menuOptionSelected--;
            if (this.menuOptionSelected < 0) {
                this.menuOptionSelected = this.menuOptions.length - 1;
            }
            this.positionMenuPointer();
        }
    }
    onButtonTwo () {
        if (this.msgLayer.visible) {
            this.hideMessage();
            return;
        }
        if (this.isMenuShown) {
            if (this.menuOptionSelected !== null && this.menuOptionsData[this.menuOptionSelected]) {
                console.log(this.menuOptionsData[this.menuOptionSelected]);
                this.menuOptionsData[this.menuOptionSelected][1](this.menuOptionSelected);
                if (this.isMenuShown && this.menuOptionsData[this.menuOptionSelected].length > 2 && this.menuOptionsData[this.menuOptionSelected][2]) {
                    this.closeMenu();
                }
            }
        }
    }
    onButtonThree () {
        if (this.msgLayer.visible) {
            this.hideMessage();
            return;
        }
        if (this.isMenuShown) {
            this.menuOptionSelected++;
            if (this.menuOptionSelected >= this.menuOptions.length) {
                this.menuOptionSelected = 0;
            }
            this.positionMenuPointer();
        }
    }

    positionMenuPointer () {
        this.menuPointer.y = this.MENU_TOP + (this.MENU_PADDING_UP*(this.menuOptionSelected+1));
    }

    drawEvolveDots  ( x, y, w, filledDots, maxDots) {
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

    

    onPetActivated () {
        this.txtMoneyNumber.setText('$'+this.scene.user.money);
        this.txtPetName.setText(this.scene.pet.name);
        this.drawEvolveDots(220, 580, 10, this.scene.pet.baseData.evolveDots, 3);
        this.showMessage(`${this.scene.pet.name} welcomes you back`, 1500);
    }

    emit (eventName, eventData) {
        if  (this.eventListeners[eventName]) {
            for (let i=0; i<this.eventListeners[eventName].length; i++) {
                this.eventListeners[eventName][i](eventData);
            }
        }
    }

    on (eventName, callback) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].push(callback);
        } else {
            this.eventListeners[eventName] = [callback];
        }
    }

    
}