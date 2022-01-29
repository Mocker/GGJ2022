import Phaser from 'phaser';
import * as petData from '../data/pets.json';
import { GameUI } from '../objects/gameUI';
import { UserModel } from '../utils';

// Select Existing Pet or Select an Egg to start a new one

export class SelectMonsterScene extends Phaser.Scene
{

    constructor ()
    {
        super("SelectMonsterScene");
        this.monsterTiles = [];
        this.selectedTile = null;
    }
    
    preload ()
    {
        
    }


    create ()
    {

        this.add.text(300, 300, "Select Pet", {
            fontFamily: 'beryl-digivice',
            fontSize: 25
        });

        this.user = UserModel.getInstance();

    }

    moveTileLeft () {
        if (this.monsterTiles.length < 2) return;
    }

    moveTileRight () {
        if (this.monsterTiles.length < 2) return;
    }

    selectTile () {
        console.log(`select tile {this.selectedTile}`);
    }

    update () {

    }

    end () {

    }


}