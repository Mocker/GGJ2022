import { Pet } from '../pet';
import { Egg } from './Egg';
import { playAnimationByName } from '../../tweensanimations';

export class BlueEgg extends Egg
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
    }

    OnActionOne () {
        playAnimationByName('play', this.scene, this.sprite);
    }

    OnActionTwo () {
       playAnimationByName('tintInOut', this.scene, this.sprite, {
           duration: 1500
       });
    }

    OnActionThree () {
        playAnimationByName('attack', this.scene, this.sprite);
    }
}
