import { Pet } from '../pet';
import { playAnimationByName } from '../../tweensanimations';
import * as petData from '../../data/pets.json';

export class Tadpole extends Pet
{
    constructor(baseData, customData)
    {   
        super(baseData, customData);
        console.log("customData");
        console.log(customData);
        // TODO:: set random range of evolve timer
        this.customData.msLeftToEvolve = 500; //1000 * 60000 * 1;
        this.name = this.customData.name || this.baseData.name;
        if (!this.customData.stats) {
            this.customData.stats = {
                energy: { min: 0, current: 90, max: 100 },
                name: "?? EGG ??",
                timers: {
                    lived: 60000*5 //5 minutes?
                },
                type: baseData.type,
                stage: baseData.stage,
            };
        }
        this.type = baseData.type;
        this.stage = baseData.stage;
        console.log('tadpole', baseData, customData);
    }

    SetActive (scene, x, y) {
        super.SetActive(scene, x, y);
        if(!this.sprite){
            //this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
            this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `pet-tadpole-idle`);
            this.sprite.setDisplaySize(300,300);
        }   
        this.scene.isPaused = true;
        if (this.scene.sfx.cryTadpole) {
            this.scene.sfx.cryTadpole.play();
        }
        this.sprite.play('pet-tadpole-idle');
        
        setTimeout(()=>{
            
            if (this.name) {
                this.scene.isPaused = false;
            } else {
                this.scene.promptNewPetName();
            }
        }, 1);
    }

    Evolve () {
        super.Evolve();
        // transition to tadpole
        //this.scene.ui.closeMenu();
        this.scene.isPaused = true;
        this.playOnce('pet-tadpole-happy', null, -1);
        this.sprite.setScale(400,400);
        setTimeout(()=>{
            const newBaby = this.scene.createPet('tadpole','adultCute', this.customData);
            newBaby.customData.timers.lived = 0;
            this.scene.activatePet(newBaby);
            this.clearPieces();
            this.scene.playLayer.remove(this.sprite);
            this.sprite.destroy();
        },1500);

    }

    getActionMenu () {
        return [
            ['Ribbit', this.shakeIt.bind(this), true],
            ...super.getActionMenu()
        ];
    }

    shakeIt () {
        //const prevSprite = this.sprite;
        this.playOnce(`pet-tadpole-happy`, `pet-tadpole-idle`, 0);
    }

    getBattleMenu () {
        return [ //Too young to be battlin
            ['To Battle!', this.scene.ui.showMessage.bind(this.scene.ui, 'Too young to be battlin', 1200)], 
            ['Go Explorin', this.doExplore.bind(this), true],
            ...super.getBattleMenu()
        ];
    }

    doBattle () {
        // no battling for this er boy
    }

    doExplore () {
        this.scene.isPaused = true;
        this.playOnce(`pet-tadpole-explore`, `pet-tadpole-idle`, 2, this.doneExploring.bind(this));
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