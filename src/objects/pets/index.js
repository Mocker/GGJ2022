import { BlueEgg } from './BlueEgg';
import { GreenEgg } from './GreenEgg';
import { Baby } from './Baby';
import { AdultCute } from './AdultCute';
import { Tadpole } from './Tadpole';
import { Bacteria } from './Bacteria';
export const PetClasses = {
    BlueEgg,
    GreenEgg,
    Baby,
    AdultCute,
    Tadpole,
    Bacteria
};


export function PetFactory(petType) {
    console.log('petType: ' + petType);
    return (baseData, customData) => {
        return new PetClasses[petType](baseData, customData);
    };
}