import Phaser from 'phaser';
import { UserModel } from '../utils';
import { Image } from '../objects';
import * as petData from '../data/pets.json';
import { clearButtonEvents } from '../utils';


// Select Existing Pet or Select an Egg to start a new one
const NEW_MONSTER_TYPE = 'tadpole';
const ACTIVE_MONSTER_X = 390;
const ACTIVE_MONSTER_Y = 500;
const COMING_MONSTER_X = 250;

export class SelectMonsterScene extends Phaser.Scene
{

    constructor ()
    {
        super({
            key: "SelectMonsterScene",
            active: false
        });
        this.newMonsterOption = null;
        this.userMonsterImages = [];
    }
    
    preload ()
    {
        for (let petType in petData.types) {
            for (let imageFile in petData.types[petType].images) {
                this.load.image(`${petType}-${imageFile}`, 'images/'+petData.types[petType].images[imageFile]);
            }
        }
    }

    create ()
    {
        this.newMonsterOptions = [];
        this.userMonsterImages = [];
        clearButtonEvents(this.game);
        this.user = UserModel.getInstance();
        const initFunc = () => {
            for ( let petType in petData.types ) {
                const positionX = COMING_MONSTER_X;
                const image = new Image(this, `${petType}-egg`, positionX, ACTIVE_MONSTER_Y, 0.2, {
                    petType: petType,
                    stage: 'egg',
                    baseData: petData.types[petType].stages.egg,
                    isNewEgg: true
                });
                image.image.setVisible(false);
                this.newMonsterOptions.push(image);
            }
            console.log(this.newMonsterOptions);
            for ( let monster of this.user.monsters ) {
                const image = new Image(this, `${monster.type}-${monster.stage}`, COMING_MONSTER_X, ACTIVE_MONSTER_Y);
                image.image.setVisible(false);
                this.userMonsterImages.push(image);
            }
            
        }

        initFunc();

        this.add.text(300, 250, "Select Pet", {
            fontFamily: 'beryl-digivice',
            fontSize: 35
        }); 

        let selectCounter = 0;

        const monsterOptions = [...this.userMonsterImages, ...this.newMonsterOptions ];
        const nameOptions = [
            ...(this.user.monsters.map( monster => monster.stats ? monster.stats.name : petData[monster.type].stages[monster.stage].name)),
            ...(Object.keys(petData.types).map(name => `New ${petData.types[name].stages.egg.name}`))
        ];

        const currentMonsterName = this.add.text(300, 350, nameOptions[0], {
            fontFamily: 'beryl-digivice',
            fontSize: 25
        });
        monsterOptions[selectCounter].image.setVisible(true);
        monsterOptions[selectCounter].moveTo({
            x: 400
        });

        const scrollMonster = (action) => {

            if(monsterOptions.length == 1) return;

            currentMonsterName.setVisible(false);
            const currentOption = monsterOptions[selectCounter % monsterOptions.length];

            if(action === "right") {
                if(selectCounter == monsterOptions.length - 1){
                    selectCounter = 0;
                }else{
                    selectCounter++;
                }
            }
            else {
                if(selectCounter == 0) {
                    selectCounter = monsterOptions.length - 1;
                }
                else {
                    selectCounter--;
                }
            }

            const newOption = monsterOptions[selectCounter % monsterOptions.length];

            currentOption.moveTo({ x: 560 - (newOption.image.displayWidth * newOption.image.scaleX), onComplete: () => {
                currentOption.image.setVisible(false);
                currentOption.image.x=COMING_MONSTER_X;
                newOption.image.setVisible(true);
                newOption.moveTo({x: ACTIVE_MONSTER_X, onComplete: () => {
                    currentMonsterName.setVisible(true);
                }});
            }});

            currentMonsterName.setText(nameOptions[selectCounter % monsterOptions.length])
        }

        this.game.scene.getScene('BGScene').events.on('button-one-clicked', () => scrollMonster("left"));
        this.game.scene.getScene('BGScene').events.on('button-three-clicked',  () => scrollMonster("right"));

        this.game.scene.getScene('BGScene').events.on('button-two-clicked',  () => {
            const selectedOption = monsterOptions[selectCounter];
            if  (selectedOption.extras && selectedOption.extras.isNewEgg){
                const newMonster = {
                    type: selectedOption.extras.petType,
                    stage: selectedOption.extras.stage,
                    name: selectedOption.extras.baseData.name,
                    baseData: selectedOption.extras.baseData,
                    stats: {
                        energy: { min: 0, current: 90, max: 100 },
                        timers: {
                            lived: 0
                        },
                    }
                };
                console.log('new', newMonster);
                this.user.addMonster(newMonster);
                this.user.selectPet(this.user.monsters.length-1);
                this.user.updateUser();
                this.game.scene.start('GameScene');
                this.game.scene.stop('SelectMonsterScene');
            }
            else {
                console.log('existing', selectedOption);
                this.user.selectPet(selectCounter);
                this.game.scene.start('GameScene');
                this.game.scene.stop('SelectMonsterScene');
            }

        });

    }

    update () {

    }

    end () {

    }


}