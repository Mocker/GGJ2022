import { Pet } from '../pet';

export class Egg extends Pet
{
    constructor(baseData, customData)
    {
        super(baseData);
        this.customData = customData; //current stats etc for the pet

    }
}