import { Pet } from '../pet';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';

export class AdultEvil extends Pet
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
        console.log('adult evil', baseData, customData);
        this.setSleepyTimer();
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        this.scene.isPaused = true;
        if(!this.sprite){
            //this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
            this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `pet-dino-idle`);
            this.sprite.setDisplaySize(300,300);
        }   
        if (this.scene.sfx.cryDino) {
            this.scene.sfx.cryDino.play();
        }
        this.sprite.play('pet-dino-idle');
        setTimeout(()=>{
            this.scene.isPaused = false;
        }, 500);
    }


    Evolve () {
        console.log("cannot evolve further");
    }

    getActionMenu () {
        return [
            ['Roar', this.shakeIt.bind(this), true],
            ...super.getActionMenu()
        ];
    }

    shakeIt () {
        playAnimationByName('play', this.scene, this.sprite);
    }

    getBattleMenu () {
        return [
            ['Roar!', this.scene.ui.showMessage.bind(this.scene.ui, 'Coming soon..', 1200)],
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
            x: 400,
            y: 400,
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
                name: 'Bone',
                quantity: 2
            });
        } else {
            this.scene.foundMoney(Math.floor(Math.random()*5+2));
        }
        this.resume();
    }

    onSleepyTimer () {
        // no sleep anim
        if (!this.scene.isPaused && this.scene.sfx.cryDino) {
            this.scene.sfx.cryDino.play();
        }
    }

    useItem (item) { //should probably do something with the items
        this.setSleepyTimer();
        this.status = 'idle';
        this.hungerMeter = (Math.random()*120+60)*1000;
        this.playOnce('pet-dino-ido', 'pet-dino-idle', 0);
        return true;
    }

    update (time, delta) {
        super.update(time, delta);
    }
}