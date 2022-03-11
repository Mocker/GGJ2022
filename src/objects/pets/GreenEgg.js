import { Pet } from '../pet';
import { Egg } from './Egg';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';

export class GreenEgg extends Egg
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
        // TODO:: set random range of evolve timer
        this.customData.msLeftToEvolve = 500; //1000 * 60000 * 1;
        if (!this.customData.stats) {
            this.customData.stats = {
                energy: { min: 0, current: 90, max: 100 },
                attachment: { min: 0, current: 10, max: 100 },
                luck: { min: 0, current: 10, max: 100 },
                name: "?? EGG ??",
                timers: {
                    lived: 60000*5 //5 minutes?
                }
            };
        }
        this.type = baseData.type;
        this.stage = baseData.stage;
        console.log('blueegg', baseData, customData);
    }

    getBattleMenu () {
        return [ //Too young to be a battlin
            ...super.getBattleMenu()
        ];
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        if(!this.sprite){
            //this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
            this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `pet-egg-green-idle`);
            this.sprite.setDisplaySize(300,300);
        }   
        
        this.sprite.play('pet-egg-green-idle');

    }

    


    update (time, delta) {
        super.update(time, delta);
        // evolve counter only counts down when pet has energy
        // if (this.customData.energy.current > 0 && this.customData.msLeftToEvolve > 0) {
        //     this.customData.msLeftToEvolve -= delta;
        //     if (this.customData.msLeftToEvolve <= 0) {
        //         this.Evolve();
        //     }
        // }
    }

    onPeek () {
        if (!this.scene.isPaused) {
            this.playOnce('pet-egg-green-peek', 'pet-egg-green-idle', 0);
        }
    }

    Evolve () {
        this.scene.isPaused = true;
        if (this.scene.sfx['hatch']) this.scene.sfx['hatch'].play();
        this.playOnce('pet-egg-green-hatch', 'pet-egg-green-hatch', 1, this.makeNewPet.bind(this));
        

    }

    makeNewPet () {
        const self = this;
        this.playOnce('pet-egg-green-shatter', 'pet-egg-green-shatter', 1);
        setTimeout(() => {
            const newBaby = self.scene.createPet('bacteria','baby', this.customData);
            newBaby.customData.timers.lived = 0;
            self.scene.activatePet(newBaby);
            if (self.scene.sfx['evolve']) self.scene.sfx['evolve'].play();
            //this.clearPieces();
            self.sprite.destroy();
            setTimeout( this.scene.promptNewPetName.bind(self.scene)
                ,500);
        }, 1500);
    }
}
