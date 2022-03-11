import { Pet } from '../pet';

export class Egg extends Pet
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
        this.peekMeter = Math.random()*60*1000;
    }

    useItem (item) {
        //can't use items
        return false;
    }

    update (time, delta) {
        super.update(time, delta);
        this.peekMeter -= delta;
        if (this.peekMeter < 0) {
            this.onPeek();
            this.peekMeter = Math.random()*60*1000;
        }
    }

    onPeek () {
        // play egg peek animation here
    }

    
}