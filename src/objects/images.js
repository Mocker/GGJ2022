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
        this.tweens = {};
        this.activeTween = null;
    }

    setImage () {
        this.image = this.scene.add.image(this.sizeX, this.sizeY, this.imageTag);
        this.image.setScale(.3);
    }

    // checks if an active tweet is playing. if it has finished, clean up
    tweetPlaying () {
        if (!this.activeTween) return false;
        if (this.tweens[this.activeTween].isPlaying()) return true;

        // clean up tween that has finished
        this.scene.tweens.remove(this.tweens[this.activeTween]);
        this.tweens[this.activeTween] = undefined;
        this.activeTween = null;
        return true;
    }

    tweenRedAndBack (duration=2000) {
        if (this.tweetPlaying()){
           return;
        }
        const self = this;
        this.tweens['redAndBack'] = this.scene.tweens.addCounter({
            from: 510,
            to: 0,
            duration: duration,
            onUpdate: function(tween)
            {
                const value = Math.abs( 255 - Math.floor(tween.getValue()) );
                self.image.setTint(Phaser.Display.Color.GetColor(255, value, value));
            }
        });
    }

    play () {
        playAnimationByName('play', this.scene, this.image);
    }

    attack () {
        playAnimationByName('attack', this.scene, this.image);
    }
}