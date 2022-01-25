import Phaser from 'phaser';
import { Image } from './images'

export class Pet
{

    constructor (baseData) {
        this.baseData = baseData; //base stats for type->stage of pet
        this.active = false;
        this.scene = null;
        this.sprite = null;
        this.x = 0;
        this.y = 0;
    }

    SetActive(scene, x, y) {
        this.active = true;
        if (scene && this.scene != scene) this.scene=scene;
        if (x) this.x=x;
        if (y) this.y=y;
        if(this.sprite){
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        } else {
            this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
        }
    }

    Evolve() {
        console.log(`Time for the pet to evolve!`);
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