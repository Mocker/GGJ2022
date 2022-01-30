import { BlueEgg } from './BlueEgg';
import { Baby } from './Baby';
import { AdultCute } from './AdultCute';

export const PetClasses = {
    blueEgg: BlueEgg,
    baby: Baby,
    adultCute: AdultCute
};


export function PetFactory(petType) {
    console.log('petType: ' + petType);
    return (baseData, customData) => {
        return new PetClasses[petType](baseData, customData);
    };
}