export * from './firebase';
export * from './gamescreen';
export * from './backgroundmanager';

import * as petData from '../data/pets.json';
import { PetFactory } from '../objects/pets/index';

export const createPet = (petType, stage, customData={}) =>
{   
    const baseData = petData.default.types[petType].stages[stage];
    console.log(petType, stage, baseData, customData);
    return PetFactory(baseData.className)(baseData, customData);
}
