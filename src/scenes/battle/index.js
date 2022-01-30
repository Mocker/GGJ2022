import Phaser from 'phaser';
import { Button } from '../../objects';
import { UserModel, clearButtonEvents } from '../../utils';

export class BattleScene extends Phaser.Scene
{

    constructor ()
    {
        super("BattleScene");
    }

    preload ()
    {
        
    }

    create ()
    {   
        clearButtonEvents(this.game);
        const user = UserModel.getInstance();
        const button = new Button(100, 100, 'Start Battle', this, () => user.startBattleWithMonster());   
    }
    

    update () {
    }


    end () {
        
    }

}
