import Phaser from 'phaser';
import * as petData from '../../data/pets.json';
import { PetFactory } from '../../objects/pets/index';
import { GameUI } from '../../objects/gameUI';

// Our game scene


class GameScene extends Phaser.Scene
{

    constructor ()
    {
        super("GameScene");
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
        this.load.image('bg-solid', 'images/ui/test-A-_0000_BG.png');
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
        this.add.sprite(200, 200, 'bg-solid');

        this.pet = this.createPet('tadpole', 'egg');
        console.log(this.pet);
        this.pet.SetActive(this, 400, 250);

        
        this.ui = new GameUI(this);
    }

    

    update () {

    }


    end () {

    }

}


export { GameScene };
