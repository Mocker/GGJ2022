import { Pet } from '../pet';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';

export class AdultCute extends Pet
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
        this.name = this.customData.name || this.baseData.name;
        if (!this.customData.stats) {
            this.customData.stats = {
                energy: { min: 0, current: 90, max: 100 },
                timers: {
                    lived: 60000*5 //5 minutes?
                }
            };
        }
        this.type = baseData.type;
        this.stage = baseData.stage;
        console.log('adult cute', baseData, customData);
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        if(!this.sprite){
            //this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
            this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `pet-snuffler-idle`);
            this.sprite.setDisplaySize(300,300);
        }   
        this.scene.isPaused = true;
        if (this.scene.sfx.cryCutie) {
            this.scene.sfx.cryCutie.play();
        }
        this.sprite.play('pet-snuffler-idle');
        this.scene.isPaused = false;
    }

    Evolve () {
        console.log("cannot evolve further");
    }

    getActionMenu () {
        return [
            ['Cuddle', this.shakeIt.bind(this), true],
            ...super.getActionMenu()
        ];
    }

    shakeIt () {
        playAnimationByName('play', this.scene, this.sprite);
    }

    getBattleMenu () {
        return [
            ['To Battle!', this.doBattle.bind(this), true],
            ['Go Explorin', this.doExplore.bind(this), true],
            ...super.getBattleMenu()
        ];
    }

    doBattle () {
        this.scene.isPaused = true;
        if (this.scene.sfx.swipe) {
            this.scene.sfx.swipe.play();
        }
        playAnimationByName('tintInOut', this.scene, this.sprite, {
            duration: 2500
        });
        this.scene.tweens.add({
            targets: this.sprite,
            duration: 750,
            scale: 2.5,
            yoyo: true,
            repeat: 3,
            onComplete: this.resume.bind(this)
        });
    }

    doExplore () {
        this.scene.isPaused = true;
        this.scene.tweens.add({
            targets: this.sprite,
            duration: 2500,
            rotation: 6,
            x: 800,
            y: 800,
            scale: 0.1,
            yoyo: true,
            onComplete: this.doneExploring.bind(this)
        });
    }

    doneExploring () {
        const rando = Math.random();
        // TODO:: fill in exploration rewards here
        if  (rando > 0.8) {
            this.scene.foundItem({
                name: 'Cake',
                quantity: 2
            });
        } else {
            this.scene.foundMoney(5);
        }
        this.resume();
    }

    update (time, delta) {

    }
}