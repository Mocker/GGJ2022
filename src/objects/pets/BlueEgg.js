import { Pet } from '../pet';
import { Egg } from './Egg';
import { playAnimationByName } from '../../tweensanimations';

export class BlueEgg extends Egg
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        
        this.implode();

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
}
