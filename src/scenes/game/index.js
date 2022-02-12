import Phaser from 'phaser';
import * as petData from '../../data/pets.json';
import * as shopData from '../../data/shop.json';
import { PetFactory } from '../../objects/pets/index';
import { GameUI } from '../../objects/gameUI';
import { UserModel, clearButtonEvents } from '../../utils';

// Our game scene
const petAnimFiles = {
    "dino" : ["idle"],
    "germ" : ["chomp","explore","happy","idle","sick","sleep","weak"],
    "snuffler": ["eating","explore","flinch","happy","hurt","idle","mad","sleep"],
    "sunfish": ["explore","happy","idle","mad","sleep","weak"],
    "tadpole": ["eat","explore","flinch","happy","idle","mad","sleep","weak"],
    "egg-yellow": ["idle","peek","hatch","shatter"],
    "egg-blue": ["idle","peek","hatch","shatter"],
    "egg-green": ["idle","peek","hatch","shatter"]
};

class GameScene extends Phaser.Scene
{

    constructor ()
    {
        super("GameScene");
        this.isPaused = false;
        this.pet = null;
        this.petData = petData.default;
        this.playerData = {
            name: "Player 1",
            email: "loL@lol.com",
            session_token: null
        };
        this.ui = null;
        this.user = null;
        
        
    }

    preload ()
    {
        //TODO:: we dont really need to preload everything, we could just load when we select the current pet
        for (let petType in petData.types) {
            for (let imageFile in petData.types[petType].images) {
                this.load.image(`${petType}-${imageFile}`, 'images/'+petData.types[petType].images[imageFile]);
            }
            for (let soundFile in petData.types[petType].sounds) {
                this.load.audio(`${petType}-${soundFile}`, 'images/sfx/'+petData.types[petType].sounds[soundFile]);
            }
        }

        //but quick hack.. load everyyyything
        
        const petAnimTypes = Object.keys(petAnimFiles);
        for(let petAnimTypeI in petAnimTypes) {
            const petAnimType = petAnimTypes[petAnimTypeI];
            for(let i=0; i<petAnimFiles[petAnimType].length; i++) {
                this.load.atlas(`pet-${petAnimType}-${petAnimFiles[petAnimType][i]}`, `images/pets/${petAnimType}/${petAnimFiles[petAnimType][i]}.png`, `images/pets/${petAnimType}/${petAnimFiles[petAnimType][i]}.json`);
    
            }
        }
        

    }

    createPet(petType, stage, customData={})
    {   
        const baseData = this.petData.types[petType].stages[stage];
        console.log(petType, stage, baseData, customData);
        return PetFactory(baseData.className)(baseData, customData);
    }

    create ()
    {   
        clearButtonEvents(this.game);
        this.game.scene.getScene('BGScene').events.off('button-one-clicked');
        this.game.scene.getScene('BGScene').events.off('button-two-clicked');
        this.game.scene.getScene('BGScene').events.off('button-three-clicked');

        this.sfx = {};
        for (let petType in petData.types) {
            for (let soundFile in petData.types[petType].sounds) {
                if (!this.sfx[`${soundFile}`]) {
                    console.log(`sfx ${soundFile}`);
                    this.sfx[`${soundFile}`] = this.sound.add(`${petType}-${soundFile}`);
                }
            }
        }

        //but quick hack.. load everyyyything
        const petAnimTypes = Object.keys(petAnimFiles);
        for(let petAnimTypeIndex in petAnimTypes) {
            const petType = petAnimTypes[petAnimTypeIndex];
            for(let i=0; i<petAnimFiles[petType].length; i++) {
                const frameNames = this.textures.get(`pet-${petType}-${petAnimFiles[petType][i]}`).getFrameNames();
                const frames = frameNames.map(o => {
                    return { key: `pet-${petType}-${petAnimFiles[petType][i]}`, frame: o};
                });
                console.log(`pet-${petType}-${petAnimFiles[petType][i]}`);
                this.anims.create({
                    key:  `pet-${petType}-${petAnimFiles[petType][i]}`,
                    frames: frames,
                    frameRate: 5,
                    repeat: (
                        petAnimFiles[petType][i] == 'idle' ||
                        petAnimFiles[petType][i] == 'sleep'
                    ) ? -1 : 0
                });
            }
        }

        this.user = UserModel.getInstance();

        this.playLayer = this.add.layer();
        this.playLayer.depth = 1;
        const playMaskShape = this.make.graphics();
        playMaskShape.fillStyle(0xffffff);
        playMaskShape.beginPath();
        playMaskShape.fillRect(200,200,400,400);
        const playMask = new Phaser.Display.Masks.GeometryMask(this, playMaskShape);
        this.playLayer.setMask(playMask);
        const pet = this.createPet(this.user.pet.type, this.user.pet.stage, this.user.pet.stats);
        this.ui = new GameUI(this);
        this.bgScene = this.game.scene.getScene('BGScene');
        this.activatePet(pet);        

        /*this.bgScene.events.on('button-one-clicked', this.onButtonOne.bind(this));
        this.bgScene.events.on('button-two-clicked', this.onButtonTwo.bind(this));
        this.bgScene.events.on('button-three-clicked', this.onButtonThree.bind(this));*/

    }

    // always passing to the ui for now because all pet interaction will be done via menus
    onButtonOne () {
        if (this.isEvolving) return;
        if  (this.ui.isMenuShown) {
            this.ui.onButtonOne();
        } else if (!this.isPaused) { // build menu one (items)
            
            this.buildItemMenu();
            this.ui.tabLeft.setTint(0xffffff, 0xff0000).setScale(1.2);
        }
    }
    onButtonTwo () {
        console.log('clicked button two');
        if (this.isEvolving) return;
        if  (this.ui.isMenuShown) {
            console.log("menu shown");
            this.ui.onButtonTwo();
        } else if (!this.isPaused) { // show menu 2 ('action')
            console.log("show action menu");
            this.buildActionMenu();
            this.ui.tabMid.setTint(0xffffff, 0xff0000).setScale(1.2);
        } else {
            console.log("GameScene paused");
        }

    }
    onButtonThree () {
        if (this.isEvolving) return;
        if  (this.ui.isMenuShown) {
            this.ui.onButtonThree();
        } else if (!this.isPaused) { // build menu 3 battle/explore
            this.buildBattleMenu();
            this.ui.tabRight.setTint(0xffffff, 0xff0000).setScale(1.2);
        }
    }

    buildActionMenu () {
        const actionData = [
            ...this.pet.getActionMenu(),
            ['Force Evolve', this.pet.Evolve.bind(this.pet), true],
            //['Logout', this.logout.bind(this)],
            
        ];
        this.ui.buildMenu(actionData);
    }

    buildBattleMenu () {
        const battleData = [
            ...this.pet.getBattleMenu()
        ];
        this.ui.buildMenu(battleData);
    }

    //
    logout () {
        this.game.scene.getScene('BGScene').logout();
    }

    buildItemMenu (itemIndex=0) {
        let menuData = [
            ['Check Bag', this.buildInventoryMenu.bind(this)],
            ['Visit Shop', this.buildShopMenu.bind(this), false]
        ];
        this.ui.buildMenu(menuData, itemIndex);
    }

    buildInventoryMenu (itemIndex=0) {
        let itemData = [];
        for (let i=0; i<this.user.items.length; i++) {
            itemData.push([
                this.user.items[i].name + 
                    ((this.user.items[i].quantity && this.user.items[i].quantity > 1)
                        ? `  x ${this.user.items[i].quantity}`
                        : ''),
                this.consumeItem.bind(this)
            ]);
        }
        //itemData.push(...this.getShopItems());
        this.ui.buildMenu(itemData, itemIndex);
    }

    buildShopMenu (itemIndex=0) {
        let itemData = this.getShopItems();
        this.ui.buildMenu(itemData, itemIndex=0);
        return false;
    }

    // return list of items that user can by, disabled if they dont have the moneys
    getShopItems () {
        if (!this.user.money) this.user.money = 0;
        let shop = [];
        console.log(shopData.items);
        for (let i=0; i<shopData.items.length; i++) {
            let item = shopData.items[i];
            shop.push([
                '$'+`${item.shopValue} - ${item.name}`,
                this.buyItem.bind(this),
                (this.user.money >= item.shopValue)
            ]);
        }
        return shop;
    }

    buyItem (itemIndex) {
        // this index relates to menu position, we are assuming user items are first in the menu, this might not always be true
        let item = shopData.items[itemIndex];
        console.log('buyItem', item);
        if (this.user.money < item.shopValue) {
            // Todo: sound?
            this.ui.showMessage(`You can't afford ${item.name}!`, 1200);
            console.log("Can't afford!"); return;
        }
        this.user.money -= item.shopValue ;
        this.ui.txtMoneyNumber.setText('$'+this.user.money);
        this.foundItem(item);
        this.user.updateUser();
    }

    consumeItem (itemIndex) {
        console.log('consume item', itemIndex, this.user.items[itemIndex]);
        if (!this.pet.useItem(this.user.items[itemIndex])) {
            //returns false when pet cant use the item
            console.log('cant use item');
            return;
        }
        if (this.sfx.eat) {
            this.sfx.eat.play();
        }
        
        if (this.user.items[itemIndex].quantity && this.user.items[itemIndex].quantity > 1) {
            this.user.items[itemIndex].quantity--;
        } else {
            this.user.items.splice(itemIndex, 1);
            itemIndex = 0;
        }
        this.user.updateUser(this.pet);
        this.buildItemMenu(itemIndex);
    }

    // acquired, add or increment user items
    // should add most logic to users class
    foundItem (newItem) {
        if (this.sfx.swipe) this.sfx.swipe.play();
        let incrementedItem = false;
        for (let i=0; i<this.user.items.length; i++) {
            if (this.user.items[i].name == newItem.name) {
                incrementedItem = true;
                this.user.items[i].quantity += newItem.quantity;
                break;
            }
        }
        if  (!incrementedItem) {
            this.user.items.push(newItem);
        }
        this.ui.showMessage(`Acquired ${newItem.name}${newItem.quantity ? 'x'+newItem.quantity: ''}`, 1200);
        this.user.updateUser();
    }

    foundMoney (coins) {
        if (this.sfx.money) {
            this.sfx.money.play();
        }
        this.user.money += coins;
        this.ui.txtMoneyNumber.setText('$'+this.user.money);
        this.ui.showMessage(`Found ${coins} shiny coins`, 1200);
        this.user.updateUser();
    }

    activatePet (pet) {
        this.pet = pet;
        this.user.updateUser(this.pet);
        this.pet.SetActive(this, 400, 400);
        this.playLayer.add([this.pet.sprite]);
        this.ui.emit('petActivated');
        this.isPaused = false;
        this.game.scene.getScene('BGScene').events.off('button-one-clicked');
        this.game.scene.getScene('BGScene').events.off('button-two-clicked');
        this.game.scene.getScene('BGScene').events.off('button-three-clicked');
        this.bgScene.events.on('button-one-clicked', this.onButtonOne.bind(this));
        this.bgScene.events.on('button-two-clicked', this.onButtonTwo.bind(this));
        this.bgScene.events.on('button-three-clicked', this.onButtonThree.bind(this));
    }


    promptNewPetName () {
        this.isPaused = true;
        this.game.scene.start('MonsterNameScene');
    }
    setPetName (petName) {
        this.pet.name = petName;
        this.pet.customData.name = petName;
        this.ui.txtPetName.setText(petName);
        console.log("stop monster scene");
        this.game.scene.stop('MonsterNameScene');
        this.isPaused = false;
        this.game.scene.getScene('BGScene').events.off('button-one-clicked');
        this.game.scene.getScene('BGScene').events.off('button-two-clicked');
        this.game.scene.getScene('BGScene').events.off('button-three-clicked');
        this.bgScene.events.on('button-one-clicked', this.onButtonOne.bind(this));
        this.bgScene.events.on('button-two-clicked', this.onButtonTwo.bind(this));
        this.bgScene.events.on('button-three-clicked', this.onButtonThree.bind(this));
    }
    
    pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      }

    update (time, delta) {
        if (!this.isPaused) {
            if (this.pet) {
                this.pet.update(time, delta);
                this.ui.txtCornerNumber.setText(this.pad( 
                    Math.floor(this.pet.customData.timers.lived / (1000*1)),
                    3
                ));
            }
        }
    }


    end () {

    }

}


export { GameScene };
