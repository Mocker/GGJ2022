import { Pet } from '../pet';
import { Egg } from './Egg';

export class BlueEgg extends Egg
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
    }
}