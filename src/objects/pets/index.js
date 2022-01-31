import { BlueEgg } from './BlueEgg';
import { GreenEgg } from './GreenEgg';
import { YellowEgg } from './YellowEgg';
import { Baby } from './Baby';
import { AdultCute } from './AdultCute';
import { AdultEvil } from './AdultEvil';
import { Tadpole } from './Tadpole';
import { Bacteria } from './Bacteria';
import { Fish } from './Fish';
export const PetClasses = {
    BlueEgg,
    GreenEgg,
    Baby,
    AdultCute,
    Tadpole,
    Bacteria,
    AdultEvil,
    Fish,
    YellowEgg
};


export function PetFactory(petType) {
    console.log('petType: ' + petType);
    return (baseData, customData) => {
        return new PetClasses[petType](baseData, customData);
    };
}