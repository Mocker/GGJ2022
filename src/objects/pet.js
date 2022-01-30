import Phaser from 'phaser';
import { Image } from './images'

export class Pet
{

    constructor (baseData, customData={}) {
        this.baseData = baseData; //base stats for type->stage of pet
        this.customData = customData;
        this.active = false;
        this.scene = null;
        this.sprite = null;
        this.x = 0;
        this.y = 0;
        this.name = this.customData.name || this.baseData.name;
        this.pieces = [];
    }

    SetActive(scene, x, y) {
        this.active = true;
        if (scene && this.scene != scene) this.scene=scene;
        if (x) this.x=x;
        if (y) this.y=y;
        if(this.sprite){
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        } else {
            //this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
            this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `${this.baseData.type}-${this.baseData.stage}`);
            this.sprite.setDisplaySize(300,300);
            this.buildPieces();
        }

        
        
    }


    reloadSprite () {
        this.sprite.destroy();
        this.clearPieces();
        this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `${this.baseData.type}-${this.baseData.stage}`);
        this.sprite.setDisplaySize(300,300);
        this.scene.add.existing(this.sprite);
        this.scene.playLayer.add([this.sprite]);
        this.buildPieces();
    }

    buildPieces () {
        if (this.pieces.length < 1) {
            const source = this.scene.textures.get(`${this.baseData.type}-${this.baseData.stage}`).source[0].image;
            this.FRAME_WIDTH = 32;
            this.piecesSprite = this.scene.textures.addSpriteSheet(`${this.baseData.type}-${this.baseData.stage}-pieces`, source, {
                frameWidth: this.FRAME_WIDTH,
                frameHeight: this.FRAME_WIDTH
            });
            this.piecesSpritesFrames = this.piecesSprite.frameTotal;
            this.pieces = [];
            
            
        
            for (let i=0; i<this.piecesSprite.frameTotal; i++){
                
                this.pieces.push(this.scene.add.image(0, 0, `${this.baseData.type}-${this.baseData.stage}-pieces`, i));
                this.pieces[i].setVisible(false);
                this.pieces[i].setScale(this.sprite.scale);
                
            }
            this.scene.playLayer.add(this.pieces);
        }
    }

    clearPieces () {
        this.scene.playLayer.remove(this.pieces);
        for (let i=0; i<this.pieces.length; i++){
            this.pieces[i].destroy();
        }
        this.pieces = [];
    }

    implode (duration=4000,bounds) {
        let pX = 0;
        let pY = 0;
        let minMaxX = [
            bounds ? bounds.minX : this.sprite.x - (this.sprite.displayWidth / 2),
            bounds ? bounds.maxX : this.sprite.x + (this.sprite.displayWidth / 2)
        ];
        let minMaxY = [
            bounds ? bounds.minY : this.sprite.y - (this.sprite.displayHeight / 2),
            bounds ? bounds.maxY : this.sprite.y + (this.sprite.displayHeight / 2)
        ];
        let columns = Math.floor(this.sprite.width / this.FRAME_WIDTH);
        let scaledWidth = Math.floor(this.sprite.displayWidth / columns); 
        for( let i=0; i<this.pieces.length; i++) {
            
            const startX = Phaser.Math.Between(minMaxX[0], minMaxX[1]);
            const startY = Phaser.Math.Between(minMaxY[0], minMaxY[1]);
            this.pieces[i].x = startX; this.pieces[i].y = startY;
            this.pieces[i].setVisible(true);
            this.pieces[i].setAlpha(0.3);
            this.pieces[i].setScale(0.1);
            const dx = minMaxX[0] + pX*scaledWidth;
            const dy = minMaxY[0] + pY*scaledWidth;
            if (i<2) {
                console.log(startX,startY,dx,dy);
            }
            this.scene.tweens.add({
                targets: this.pieces[i],
                duration: duration,
                x: dx,
                y: dy,
                scaleX: this.sprite.scale,
                scaleY: this.sprite.scale,
                angle: 360,
                alpha: 1,
                //delay: i / 3.5,
                yoyo: false

            });
            pX++;
            if (pX == columns) {
                pX = 0;
                pY++;
            }
        }
        this.sprite.setVisible(false);
        setTimeout(this.hideExplodeys.bind(this, true), duration /*+ (this.pieces.length/3.5)*/); 
    }

    explode (duration=4000) {
        let pX = 0;
        let pY = 0;
        let minMaxX = [
            this.sprite.x - (this.sprite.displayWidth / 2),
            this.sprite.x + (this.sprite.displayWidth / 2)
        ];
        let minMaxY = [
            this.sprite.y - (this.sprite.displayHeight / 2),
            this.sprite.y + (this.sprite.displayHeight / 2)
        ];
        let columns = Math.floor(this.sprite.width / this.FRAME_WIDTH);
        let scaledWidth = Math.floor(this.sprite.displayWidth / columns); 
        for( let i=0; i<this.pieces.length; i++) {
            
            const startX = Phaser.Math.Between(minMaxX[0], minMaxX[1]);
            const startY = Phaser.Math.Between(minMaxY[0], minMaxY[1]);
            //this.pieces[i].x = startX; this.pieces[i].y = startY;
            this.pieces[i].setVisible(true);
            this.pieces[i].setAlpha(1);
            this.pieces[i].setScale(this.sprite.scale);
            this.pieces[i].x = minMaxX[0] + pX*scaledWidth;
            this.pieces[i].y = minMaxY[0] + pY*scaledWidth;
            this.scene.tweens.add({
                targets: this.pieces[i],
                duration: duration,
                x: startX,
                y: startY,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                angle: 360,
                delay: i / 3.5,
                yoyo: false

            });
            pX++;
            if (pX == columns) {
                pX = 0;
                pY++;
            }
        }
        this.sprite.setVisible(false);
        setTimeout(this.hideExplodeys.bind(this, false), duration + (this.pieces.length/3.5));
    }

    hideExplodeys (setSpriteVisible=true) {
        this.sprite.setVisible(setSpriteVisible);
        this.pieces.forEach( o => {
            o.setVisible(false);
        });
    }

    Evolve() {
        console.log(`Time for the pet to evolve!`);
    }
    
    OnActionOne() {
        console.log(`pressed one`);
    }

    OnActionTwo() {
        console.log(`pressed two`);
    }

    OnActionThree() {
        console.log(`pressed three`);
    }

    update (time, delta) {

    }
}