import { BlueEgg } from './BlueEgg';
import { Baby } from './Baby';
import { AdultCute } from './AdultCute';
import { Tadpole } from './Tadpole';

export const PetClasses = {
    BlueEgg,
    Baby,
    AdultCute,
    Tadpole
};


export function PetFactory(petType) {
    console.log('petType: ' + petType);
    return (baseData, customData) => {
        return new PetClasses[petType](baseData, customData);
    };
}