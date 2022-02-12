import { Pet } from '../pet';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';
import { reauthenticateWithRedirect } from 'firebase/auth';

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
        this.type = baseData.type;
        this.stage = baseData.stage;
        console.log('fish', baseData, customData);
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        if(!this.sprite){
            //this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
            this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `pet-sunfish-idle`);
            this.sprite.setDisplaySize(300,300);
        }
        this.scene.isPaused = true;
        this.sprite.play('pet-sunfish-idle');
        setTimeout(()=>{
            
            if (this.name) {
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
        this.scene.isEvolving = true;
        this.playOnce('pet-sunfish-happy', 'pet-sunfish-idle', -1);
        this.sprite.setScale(400, 400);
        const whichEvolve = (0.5 < Math.random()) ? 'adultCute' : 'adultEvil';
        setTimeout(()=>{
            const newBaby = this.scene.createPet('fish',whichEvolve, this.customData);
            newBaby.customData.timers.lived = 0;
            this.scene.activatePet(newBaby);
            this.clearPieces();
            this.scene.playLayer.remove(this.sprite);
            this.sprite.destroy();
            this.scene.isEvolving = false;
        },1500);

    }

    setSleepyTimer () {
        this.sleepyTimer = Math.random()*30*1000 ; //sleeps a lot
    }

    onSleepyTimer () {
        if (!this.scene.isPaused) {
            this.playOnce('pet-sunfish-sleep', 'pet-sunfish-sleep', 0);
        }
    }

    getActionMenu () {
        return [
            ['Flop', this.flopIt.bind(this), true],
            ['Go on a walk', this.walkIt.bind(this), true],
            ['Lift some weights bro', this.gymIt.bind(this), true],
            ...super.getActionMenu()
        ];
    }

    flopIt () {
        this.setSleepyTimer();
        if (this.status == 'hungry' ) {
            this.onIsHungry();
            return;
        }
        this.playOnce('pet-sunfish-happy', 'pet-sunfish-idle', 0);
    }

    walkIt () {
        this.setSleepyTimer();
        if (this.status == 'hungry' ) {
            this.onIsHungry();
            return;
        }
        this.playOnce('pet-sunfish-mad', 'pet-sunfish-idle', 0);
    }

    gymIt () {
        this.setSleepyTimer();
        if (this.status == 'hungry' ) {
            this.onIsHungry();
            return;
        }
        this.playOnce('pet-sunfish-weak', 'pet-sunfish-idle', 0);
    }

    getBattleMenu () {
        return [ //Too young to be battlin
            ['To Battle!', this.scene.ui.showMessage.bind(this.scene.ui, 'Too young to be battlin', 1200)], 
            ['Go Explorin', this.doExplore.bind(this), true],
            ...super.getBattleMenu()
        ];
    }

    onIsHungry () {
        this.status = 'hungry';
        this.sleepyTimer = 9999999;
        this.playOnce('pet-sunfish-weak', 'pet-sunfish-weak', -1);
        this.scene.ui.showMessage(this.name+' is hungry!', 1200)
    }

    useItem (item) { //should probably do something with the items
        this.setSleepyTimer();
        this.status = 'idle';
        this.hungerMeter = (Math.random()*120+60)*1000;
        this.playOnce('pet-sunfish-happy', 'pet-sunfish-idle', 0);
        return true;
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
        this.playOnce('pet-sunfish-explore', 'pet-sunfish-idle', 0, this.doneExploring.bind(this));
    }

    doneExploring () {
        const rando = Math.random();
        // TODO:: fill in exploration rewards here
        if  (rando > 0.8) {
            this.scene.foundItem({
                name: 'Sushi',
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