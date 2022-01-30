import Phaser from 'phaser';
import * as petData from '../../data/pets.json';
import { PetFactory } from '../../objects/pets/index';
import { GameUI } from '../../objects/gameUI';
import { UserModel } from '../../utils';

// Our game scene


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
        for (let petType in petData.types) {
            for (let imageFile in petData.types[petType].images) {
                console.log('preloading', `${petType}-${imageFile}`);
                this.load.image(`${petType}-${imageFile}`, 'images/'+petData.types[petType].images[imageFile]);
            }
        }
        //image = new Image(this, 'monster', 'monster_test_01-big.png', 400, 400);
    }

    createPet(petType, stage, customData={})
    {   
        const baseData = this.petData.types[petType].stages[stage];
        console.log(petType, stage, baseData, customData);
        return PetFactory(baseData.className)(baseData, customData);
    }

    create ()
    {   
        this.game.scene.getScene('BGScene').events.off('button-one-clicked');
        this.game.scene.getScene('BGScene').events.off('button-two-clicked');
        this.game.scene.getScene('BGScene').events.off('button-three-clicked');

        this.user = UserModel.getInstance();

        this.playLayer = this.add.layer();
        const playMaskShape = this.make.graphics();
        playMaskShape.fillStyle(0xffffff);
        playMaskShape.beginPath();
        playMaskShape.fillRect(220,220,400,400);
        const playMask = new Phaser.Display.Masks.GeometryMask(this, playMaskShape);
        this.playLayer.setMask(playMask);
        
        const pet = this.createPet(this.user.pet.type, this.user.pet.stage, this.user.pet.stats);
        this.ui = new GameUI(this);
        this.activatePet(pet);
        console.log(this.pet);
        

        this.bgScene = this.game.scene.getScene('BGScene');
        this.bgScene.events.on('button-one-clicked', this.onButtonOne.bind(this));
        this.bgScene.events.on('button-two-clicked', this.onButtonTwo.bind(this));
        this.bgScene.events.on('button-three-clicked', this.onButtonThree.bind(this));

    }

    // always passing to the ui for now because all pet interaction will be done via menus
    onButtonOne () {
        if  (this.ui.isMenuShown) {
            this.ui.onButtonOne();
        } else { // build menu one (items)
            
            this.buildItemMenu();
            this.ui.tabLeft.setTint(0xffffff, 0xff0000).setScale(1.2);
        }
    }
    onButtonTwo () {
        if  (this.ui.isMenuShown) {
            this.ui.onButtonTwo();
        } else { // show menu 2 ('action')
            //this.ui.tabLeft.setTintFill(0xccccff).setScale(1.2);
        }

    }
    onButtonThree () {
        if  (this.ui.isMenuShown) {
            this.ui.onButtonThree();
        } else { // build menu 3 battle/explore
            //this.ui.tabLeft.setTintFill(0xccccff).setScale(1.2);
        }
    }

    buildItemMenu (itemIndex=0) {
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
        this.ui.buildMenu(itemData, itemIndex);
    }

    consumeItem (itemIndex) {
        console.log('consume item', itemIndex, this.user.items[itemIndex]);
        if (this.user.items[itemIndex].quantity && this.user.items[itemIndex].quantity > 1) {
            this.user.items[itemIndex].quantity--;
        } else {
            this.user.items.splice(itemIndex, 1);
            itemIndex = 0;
        }
        this.buildItemMenu(itemIndex);
    }

    activatePet (pet) {
        this.pet = pet;
        this.pet.SetActive(this, 400, 400);
        this.playLayer.add([this.pet.sprite]);
        this.ui.emit('petActivated');
        
    }


    promptNewPetName () {
        this.game.scene.start('MonsterNameScene');
    }
    setPetName (petName) {
        this.pet.name = petName;
        this.pet.customData.name = petName;
        this.ui.txtPetName.setText(petName);
        this.game.scene.stop('MonsterNameScene');
        this.isPaused = false;
    }

    update (time, delta) {
        if (!this.isPaused) {
            if (this.pet) {
                this.pet.update(time, delta);
            }
        }
    }


    end () {

    }

}


export { GameScene };
