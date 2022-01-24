import Phaser from 'phaser';
import { Image } from './images'

export class Pet
{

    constructor (petType) {
        this.petType = petType
    }

    
    OnActionOne() {
        console.log(`pressed one`);
    }

    OnActionTwo() {
        console.log(`pressed two`);
    }

    OnActionThree() {
        console.log(`pressed three`);
    }
}