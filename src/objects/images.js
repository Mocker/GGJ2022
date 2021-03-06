import Phaser from 'phaser';
import { playAnimationByName } from '../tweensanimations';

export class Image
{
    constructor (scene, imageTag, sizeX, sizeY, scale=0.2, extras={})
    {
        this.scene = scene;
        this.imageTag = imageTag;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.extras = extras;
        //this.scene.load.image(imageTag, `images/${imageName}`);
        this.tweens = {};
        this.activeTween = null;
        this.image = this.scene.add.image(this.sizeX, this.sizeY, this.imageTag);
        this.image.setScale(scale);
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

    


    moveTo (options) {
        playAnimationByName('moveTo', this.scene, this.image, options);
    }

    play () {
        playAnimationByName('play', this.scene, this.image);
    }

    attack () {
        playAnimationByName('attack', this.scene, this.image);
    }
}