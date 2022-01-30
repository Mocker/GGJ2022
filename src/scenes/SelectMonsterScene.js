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
            fontSize: 35
        });

        this.isActive = true;
        this.game.scene.getScene('BGScene').events.on('button-two-clicked', this.selectTile.bind(this));
        

    }

    moveTileLeft () {
        if (this.monsterTiles.length < 2) return;
    }

    moveTileRight () {
        if (this.monsterTiles.length < 2) return;
    }

    selectTile () {
        if (!this.isActive) return;
        this.isActive = false;
        console.log(`select tile {this.selectedTile}`);
        UserModel.getInstance().selectPet(0);
        this.game.scene.start('GameScene');
        this.game.scene.stop('SelectMonsterScene');
    }

    update () {

    }

    end () {

    }


}