import { BlueEgg } from './BlueEgg';
import { Baby } from './Baby';
import { AdultCute } from './AdultCute';

export const PetClasses = {
    BlueEgg,
    Baby,
    AdultCute
};


export function PetFactory(petType) {
    return (args) => {
        return new PetClasses[petType](args);
    };
}