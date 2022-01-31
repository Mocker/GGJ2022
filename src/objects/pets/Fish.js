import { Pet } from '../pet';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';

export class Fish extends Pet
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
        // TODO:: set random range of evolve timer
        this.customData.msLeftToEvolve = 500; //1000 * 60000 * 1;
        this.name = this.customData.name || this.baseData.name;
        if (!this.customData.stats) { 
            // starter stats? this should be passed in from the egg stage though
            this.customData.stats = {
                energy: { min: 0, current: 90, max: 100 },
                name: "?? FISH ??",
                timers: {
                    lived: 60000*5 //5 minutes?
                }
            };
        }
        console.log('fish', baseData, customData);
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        this.scene.isPaused = true;
        this.implode(500);
        if (this.scene.sfx.cryFish) {
            this.scene.sfx.cryFish.play();
        }
        setTimeout(()=>{
            
            if (this.customData.name) {
                this.scene.isPaused = false;
            } else {
                this.scene.promptNewPetName();
            }
        }, 500);
    }

    Evolve () {
        super.Evolve();
        // transition to tadpole
        //this.scene.ui.closeMenu();
        this.scene.isPaused = true;
        this.explode(1500);
        const whichEvolve = (0.5 < Math.random()) ? 'adultCute' : 'adultEvil';
        setTimeout(()=>{
            const newBaby = this.scene.createPet('fish',whichEvolve, this.customData);
            newBaby.customData.timers.lived = 0;
            this.scene.activatePet(newBaby);
            this.clearPieces();
            this.scene.playLayer.remove(this.sprite);
            this.sprite.destroy();
        },1500);

    }

    getActionMenu () {
        return [
            ['Flop', this.shakeIt.bind(this), true],
            ...super.getActionMenu()
        ];
    }

    shakeIt () {
        playAnimationByName('play', this.scene, this.sprite);
    }

    getBattleMenu () {
        return [ //Too young to be battlin
            ['To Battle!', this.scene.ui.showMessage.bind(this.scene.ui, 'Too young to be battlin', 1200)], 
            ['Go Explorin', this.doExplore.bind(this), true],
            ...super.getBattleMenu()
        ];
    }

    doBattle () {
        this.scene.isPaused = true;
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
        super.update(time, delta);
    }
}