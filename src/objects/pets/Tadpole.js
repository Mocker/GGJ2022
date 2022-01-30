import { Pet } from '../pet';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';

export class Tadpole extends Pet
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
        // TODO:: set random range of evolve timer
        this.customData.msLeftToEvolve = 500; //1000 * 60000 * 1;
        this.name = this.customData.name || this.baseData.name;
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
            this.scene.promptNewPetName();
        }, 500);
    }

    Evolve () {
        console.log("tadpole evolves");
    }

    update (time, delta) {
        
    }
}