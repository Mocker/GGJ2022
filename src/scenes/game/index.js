import Phaser from 'phaser';
import * as petData from '../../data/pets.json';
import { PetFactory } from '../../objects/pets/index';
import { GameUI } from '../../objects/gameUI';

// Our game scene


class GameScene extends Phaser.Scene
{

    constructor ()
    {
        super();
        this.isPaused = false;
        this.pet = null;
        this.petData = petData.default;
        this.pets = [];
        this.playerData = {
            name: "Player 1",
            email: "loL@lol.com",
            session_token: null
        };
        this.ui = null;
    }

    preload ()
    {
        this.load.image('bg-frame', 'images/ui/DEVICE_A01_0008_device body.png');
        this.load.image('bg-solid', 'images/ui/test-A-_0000_BG.png');
        this.load.image('ui-btn-left', 'images/ui/DEVICE_A01_crop_0000s_0004_L-.png');
        this.load.image('ui-btn-circle', 'images/ui/DEVICE_A01_crop_0000s_0002_circle.png');
        this.load.image('ui-btn-right', 'images/ui/DEVICE_A01_crop_0000s_0006_R.png');
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
        const baseData = {
            type: petType,
            stage: this.petData.types['tadpole'].stages["egg"]
        };
        return PetFactory(this.petData.types['tadpole'].stages["egg"].className)(baseData, customData);
    }

    create ()
    {
        
        
        this.bgFrame = this.add.sprite(400, 400, 'bg-frame')
            .setDisplaySize(800,800);
        this.bgSolid = this.add.sprite(400, 400, 'bg-solid')
            .setAlpha(0.7)
            .setDisplaySize(400, 400);

        
        const pet = this.createPet('tadpole', 'egg');
        this.ui = new GameUI(this);
        this.activatePet(pet);
        
        const playMaskShape = this.make.graphics();
        playMaskShape.fillStyle(0xffffff);
        playMaskShape.beginPath();
        playMaskShape.fillRect(220,220,400,400);
        const playMask = new Phaser.Display.Masks.GeometryMask(this, playMaskShape);
        this.playLayer.setMask(playMask);

    }

    activatePet (pet) {
        this.pet = pet;
        this.pet.SetActive(this, 400, 400);
        this.playLayer = this.add.layer([this.pet.sprite]);
        this.ui.txtPetName.setText(this.pet.name);
    }

    

    update () {

    }


    end () {

    }

}


export { GameScene };
