import { Pet } from '../pet';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';

export class Bacteria extends Pet
{
    constructor(baseData, customData)
    {
        super(baseData, customData);
        // TODO:: set random range of evolve timer
        this.customData.msLeftToEvolve = 500; //1000 * 60000 * 1;
        this.name = this.customData.name || this.baseData.name;
        if (!this.customData.stats) {
            this.customData.stats = {
                energy: { min: 0, current: 90, max: 100 },
                name: "?? EGG ??",
                timers: {
                    lived: 60000*5 //5 minutes?
                }
            };
        }
        this.type = baseData.type;
        this.stage = baseData.stage;
        console.log('bacteria', baseData, customData);
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        this.scene.isPaused = true;
        if(!this.sprite){
            //this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
            this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `pet-germ-idle`);
            this.sprite.setDisplaySize(300,300);
        }
        if (this.scene.sfx.cryBacteria) {
            this.scene.sfx.cryBacteria.play();
        }
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
        // transition to cute/evil aduilt
        //this.scene.ui.closeMenu();
        this.scene.isPaused = true;
        this.playOnce('pet-germ-happy', 'pet-germ-idle', -1);
        this.sprite.setScale(400, 400);
        this.scene.isEvolving = true;
        setTimeout(()=>{
            const newBaby = this.scene.createPet('bacteria','adultEvil', this.customData);
            newBaby.customData.timers.lived = 0;
            this.scene.activatePet(newBaby);
            this.clearPieces();
            this.scene.playLayer.remove(this.sprite);
            this.sprite.destroy();
            this.scene.isEvolving = false;
        },1500);

    }

    getActionMenu () {
        return [
            ['Shake It!', this.shakeIt.bind(this), true],
            ['Take Antibiotics!', this.antibioticsIt.bind(this), true],
            ...super.getActionMenu()
        ];
    }

    shakeIt () {
        this.setSleepyTimer();
        if (this.status == 'hungry' ) {
            this.onIsHungry();
            return;
        }
        this.playOnce('pet-germ-happy', 'pet-germ-idle', 0);
    }
    antibioticsIt () {
        this.setSleepyTimer();
        if (this.status == 'hungry' ) {
            this.onIsHungry();
            return;
        }
        this.playOnce('pet-germ-sick', 'pet-germ-idle', 0);
    }
    onIsHungry () {
        this.status = 'hungry';
        this.sleepyTimer = 9999999;
        this.playOnce('pet-germ-weak', 'pet-germ-weak', -1);
        this.scene.ui.showMessage(this.name+' is hungry!', 30)
    }

    useItem () {
        this.status = 'idle';
        this.playOnce('pet-germ-chomp', 'pet-germ-idle', 0);
        this.hungerMeter = (Math.random()*120+60)*1000;
        return true;
    }

    getBattleMenu () {
        return [ //Too young to be a battlin
            //['To Battle!', this.doBattle.bind(this), true],
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
        this.playOnce('pet-germ-explore', 'pet-germ-idle', 0, this.doneExploring.bind(this));
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

    onSleepyTimer () {
        if (!this.scene.isPaused) {
            this.playOnce('pet-germ-sleep', 'pet-germ-sleep', 0);
        }
    }

    update (time, delta) {
        super.update(time, delta);
    }
}