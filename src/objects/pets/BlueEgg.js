import { Pet } from '../pet';
import { Egg } from './Egg';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';

export class BlueEgg extends Egg
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
        // TODO:: set random range of evolve timer
        this.customData.msLeftToEvolve = 500; //1000 * 60000 * 1;
        if (!this.customData.stats) {
            this.customData.stats = {
                energy: { min: 0, current: 90, max: 100 },
                name: "?? EGG ??",
                timers: {
                    lived: 60000*5 //5 minutes?
                }
            };
        }
        console.log('blueegg', baseData, customData);
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        this.scene.isPaused = true;
        this.implode(500);
        setTimeout(()=>{
            this.scene.isPaused = false;
        }, 500);

    }

    

    OnActionOne () {
        playAnimationByName('play', this.scene, this.sprite);
    }

    OnActionTwo () {
       /*playAnimationByName('tintInOut', this.scene, this.sprite, {
           duration: 1500
       });*/
       this.explode();
    }

    OnActionThree () {
        playAnimationByName('attack', this.scene, this.sprite);
    }

    update (time, delta) {
        super.update(time, delta);
        // evolve counter only counts down when pet has energy
        if (this.customData.energy.current > 0 && this.customData.msLeftToEvolve > 0) {
            this.customData.msLeftToEvolve -= delta;
            if (this.customData.msLeftToEvolve <= 0) {
                this.Evolve();
            }
        }
    }

    Evolve () {
        super.Evolve();
        // transition to tadpole
        this.scene.ui.closeMenu();
        this.scene.isPaused = true;
        this.explode(1500);
        setTimeout(()=>{
            const newBaby = this.scene.createPet('tadpole','baby', this.customData);
            this.scene.activatePet(newBaby);
            this.clearPieces();
            this.scene.playLayer.remove(this.sprite);
            this.sprite.destroy();
            /*this.baseData = petData.types['tadpole'].stages.baby;
            this.name = this.baseData.name;

            console.log(this.baseData);
            this.reloadSprite();
            this.sprite.setVisible(false);
            console.log(this.pieces);
            this.implode(500, {
                minX: 200,
                maxX: 600,
                minY: 200,
                maxY: 600
            });
            this.scene.ui.emit('petActivated');
            setTimeout( this.scene.promptNewPetName.bind(this.scene)
                ,500);
            */
        },1500);

    }
}
