import Phaser from 'phaser';
import { clearButtonEvents } from '../../utils';

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
        var textLabel = document.createElement('textLabel');

        textLabel.style.color = "white";
        textLabel.style.fontFamily = "gameFont"
        textLabel.style.fontSize = "3vw";

        const switchMessage = (message, fontSize) => {
            textLabel.style.fontSize = fontSize;
            textLabel.innerText = message;
        }

        this.add.dom(170, 30, textLabel);
    
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        var element = this.add.dom(screenCenterX, screenCenterY - 30).createFromCache('monster-form');
    
        element.setPerspective(800);

        const createMonsterButton = document.getElementById( 'createMonsterButton' );

        createMonsterButton.onclick = (event) => {
            const inputMonsterName = document.getElementById("monstername");

            if(inputMonsterName.value !== '' && inputMonsterName.value.length < 9) {
                this.game.scene.getScene('GameScene').setPetName(inputMonsterName.value);
            }
        }

    }
    

    update () {

    }


    end () {
        
    }

}
