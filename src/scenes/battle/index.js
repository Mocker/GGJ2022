import Phaser from 'phaser';
import { Button } from '../../objects';
import { UserModel, clearButtonEvents, createPet } from '../../utils';
import { BattleUI } from '../../objects/ui/battleUI';
import * as petDataDefault from '../../data/pets.json';

export class BattleScene extends Phaser.Scene
{

    constructor ()
    {
        super("BattleScene");
        this.user = null;
    }

    preload ()
    {
        this.petData = petDataDefault.default;
        for (let petType in this.petData.types) {
            for (let imageFile in this.petData.types[petType].images) {
                this.load.image(`${petType}-${imageFile}`, 'images/'+this.petData.types[petType].images[imageFile]);
            }
            for (let soundFile in this.petData.types[petType].sounds) {
                this.load.audio(`${petType}-${soundFile}`, 'images/sfx/'+this.petData.types[petType].sounds[soundFile]);
            }
        }

        for(let i = 0; i < 15; i++) {
            if(i < 10) {
                this.load.image(`germidle${i}`, `images/pets/germ/Germ%20idle/Germ_Idle0000${i}.png`);
            }
            else {
                this.load.image(`germidle${i}`, `images/pets/germ/Germ%20idle/Germ_Idle000${i}.png`);
            }
        }
    }

    create ()
    {   
        this.sfx = {};
        for (let petType in this.petData.types) {
            for (let soundFile in this.petData.types[petType].sounds) {
                if (!this.sfx[`${soundFile}`]) {
                    this.sfx[`${soundFile}`] = this.sound.add(`${petType}-${soundFile}`);
                }
            }
        }
        clearButtonEvents(this.game);
        this.user = UserModel.getInstance();
        this.playLayer = this.add.layer();
        const playMaskShape = this.make.graphics();
        playMaskShape.fillStyle(0xffffff);
        playMaskShape.beginPath();
        playMaskShape.fillRect(200,200,400,400);
        const playMask = new Phaser.Display.Masks.GeometryMask(this, playMaskShape);
        this.playLayer.setMask(playMask);
        this.pet = createPet(this.user.pet.type, this.user.pet.stage, this.user.pet.stats);
        this.ui = new BattleUI(this, this.pet.customData.stats.hp, this.pet.customData.stats.atk);
        this.bgScene = this.game.scene.getScene('BGScene');
        this.activatePet(this.pet); 
        //const button = new Button(100, 100, 'Start Battle', this, () => user.startBattleWithMonster());   
    }

    activatePet() {
        this.pet.SetActive(this, 200, 200, true);
        this.playLayer.add([this.pet.sprite]);
        /*this.bgScene.events.on('button-one-clicked', this.onButtonOne.bind(this));
        this.bgScene.events.on('button-two-clicked', this.onButtonTwo.bind(this));
        this.bgScene.events.on('button-three-clicked', this.onButtonThree.bind(this));*/
    }

    update () {
    }


    end () {
        
    }

}
