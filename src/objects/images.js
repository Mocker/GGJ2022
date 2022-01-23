import Phaser from 'phaser';
import { playAnimationByName } from '../tweensanimations';

export class Image
{
    constructor (scene, imageTag, imageName, sizeX, sizeY)
    {
        this.scene = scene;
        this.imageTag = imageTag;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.scene.load.image(imageTag, `../images/${imageName}`);
    }

    setImage () {
        this.image = this.scene.add.image(this.sizeX, this.sizeY, this.imageTag);
        this.image.setScale(.3);
    }

    play () {
        playAnimationByName('play', this.scene, this.image);
    }

    attack () {
        playAnimationByName('attack', this.scene, this.image);
    }
}