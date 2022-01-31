import Phaser from 'phaser';
import { clearButtonEvents, UserModel } from '../../utils';

export class MonsterNameScene extends Phaser.Scene
{

    constructor ()
    {
        super("MonsterNameScene");
    }

    preload ()
    {
        this.load.html('monster-form', 'public/monster_form.html');
    }

    create ()
    {   
        clearButtonEvents(this.game);

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        var element = this.add.dom(screenCenterX, screenCenterY - 30).createFromCache('monster-form');
    
        element.setPerspective(800);

        this.game.scene.getScene('BGScene').events.on('button-two-clicked', () => {
            const inputMonsterName = document.getElementById("monstername");

            if(inputMonsterName.value !== '' && inputMonsterName.value.length < 9) {
                UserModel.getInstance().updateCurrentMonsterName(inputMonsterName.value);
                this.game.scene.getScene('GameScene').setPetName(inputMonsterName.value);
            }
        });

    }
    

    update () {

    }


    end () {
        
    }

}
