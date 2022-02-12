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
        this.sleepyTimer = 0;
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
        this.setSleepyTimer();
        this.status = 'idle';
    }

    setSleepyTimer () {
        this.sleepyTimer = Math.random()*60*1000; //time of inactivity until it sleeps
    }

    Evolve () {
        console.log("cannot evolve further");
    }

    getActionMenu () {
        return [
            ['Cuddle', this.cuddleIt.bind(this), true],
            ['Poke', this.pokeIt.bind(this), true],
            ...super.getActionMenu()
        ];
    }

    cuddleIt () {
        this.scene.isPaused = true;
        this.setSleepyTimer();
        if (this.status == 'hungry' ) {
            this.onIsHungry();
            return;
        }
        this.playOnce('pet-snuffler-happy', 'pet-snuffler-idle', 0, this.resume.bind(this));
    }

    pokeIt () {
        this.scene.isPaused = true;
        this.setSleepyTimer();
        if (this.status == 'hungry' ) {
            this.onIsHungry();
            return;
        }
        this.playOnce('pet-snuffler-mad', 'pet-snuffler-idle', 0, this.resume.bind(this));
    }

    onIsHungry () {
        this.status = 'hungry';
        this.sleepyTimer = 9999999;
        this.playOnce('pet-snuffler-weak', 'pet-snuffler-weak', -1);
        this.scene.ui.showMessage(this.name+' is hungry!', 1200)
    }

    getBattleMenu () {
        return [
            ['To Battle!', this.scene.ui.showMessage.bind(this.scene.ui, 'Coming soon', 1200)],
            ['Go Explorin', this.doExplore.bind(this), true],
            ...super.getBattleMenu()
        ];
    }

    useItem (item) { //should probably do something with the items
        this.setSleepyTimer();
        this.status = 'idle';
        this.hungerMeter = (Math.random()*120+60)*1000;
        this.playOnce('pet-snuffler-eating', 'pet-snuffler-idle', 0);
        return true;
    }

    doBattle () {
        this.scene.isPaused = true;
        this.setSleepyTimer();
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
        this.setSleepyTimer();
        this.playOnce('pet-snuffler-explore', 'pet-snuffler-explore', 0, this.doneExploring.bind(this));
    }

    doneExploring () {
        const rando = Math.random();
        // TODO:: fill in exploration rewards here
        if  (rando > 0.8) {
            this.scene.foundItem({
                name: 'Angel Cake',
                quantity: 2
            });
        } else {
            this.scene.foundMoney(Math.random()*10+2);
        }
        this.resume();
    }

    update (time, delta) {
        if (!this.scene.isPaused) {
            this.sleepyTimer -= delta;
            if (this.sleepyTimer < 0) {
                this.playOnce('pet-snuffler-sleep', null, -1);
                this.setSleepyTimer();
            }
        }
    }
}