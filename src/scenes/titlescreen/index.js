import Phaser from 'phaser';
import { GameUI } from '../../objects/gameUI';
import { UserModel } from '../../utils' ;

export class TitleScene extends Phaser.Scene
{

    constructor ()
    {
        super("TitleScene");
        this.monsterTiles = [];
        this.goAway = false;
        this.pieces = [];
        this.sprite = null;
        this.FRAME_WIDTH = 16;
    }

    preload ()
    {
        this.load.image('title-text', 'images/ui/title-text.png');
    }

    create ()
    {

        console.log("title loaded");
        this.titleText = this.make.text({
            add: false,
            x: 200,
            y: 200,
            text: 'They Might Byte!',
            style: {
                fontSize: 35,
                color: '#303030',
                fontFamily: 'beryl-digivice'
                }
            })
        .setOrigin(0, 0)
        .setAlpha(1)
        .setScale(0.2, 0.2)
        .setRotation(0);
        // this.titleTexture = this.textures.addCanvas('text', this.titleText.canvas);
        // this.titleTexture.x = 200; this.titleTexture.y = 200;
       //this.add.existing(this.titleText);
        this.titleTextImage = new Phaser.GameObjects.Sprite(this, 220, 320, 'title-text')
            .setOrigin(0, 0)
            .setAlpha(0)
            .setTintFill(0x162b3c)
            .setScale(0.3, 0.3);
        this.add.existing(this.titleTextImage);
        this.titleTextImage.x = 220; this.titleTextImage.y = 320;
        this.sprite = this.titleTextImage;
        this.turningOn = false;
        this.game.scene.getScene('BGScene').events.on('button-two-clicked', this.nextScene.bind(this));
        this.onPowerButton();
    }

    buildPieces () {
        if (this.pieces.length < 1) {
            const source = this.textures.get(`title-text`).source[0].image;
            if(!this.FRAME_WIDTH) this.FRAME_WIDTH = 32;
            this.piecesSprite = this.textures.addSpriteSheet(`title-text-pieces`, source, {
                frameWidth: this.FRAME_WIDTH,
                frameHeight: this.FRAME_WIDTH
            });
            console.log(this.piecesSprite);
            this.piecesSpritesFrames = this.piecesSprite.frameTotal;
            this.pieces = [];
            
            
        
            for (let i=0; i<this.piecesSprite.frameTotal; i++){
                
                this.pieces.push(this.add.image(0, 0, `title-text-pieces`, i));
                this.pieces[this.pieces.length - 1].setVisible(false);
                this.pieces[this.pieces.length - 1].setScale(this.sprite.scale)
                .setTintFill(0x162b3c);
                
            }
        }
    }

    implode (duration=4000,bounds={}) {

        this.buildPieces();

        let pX = 0;
        let pY = 0;
        let minMaxX = [
            bounds.minX || this.sprite.x - (this.sprite.displayWidth / 2),
            bounds.maxX || this.sprite.x + (this.sprite.displayWidth / 2)
        ];
        let minMaxY = [
            bounds.minY || this.sprite.y - (this.sprite.displayHeight / 2),
            bounds.maxY || this.sprite.y + (this.sprite.displayHeight / 2)
        ];
        let columns = Math.floor(this.sprite.width / this.FRAME_WIDTH);
        let scaledWidth = Math.floor(this.sprite.displayWidth / columns); 
        for( let i=0; i<this.pieces.length; i++) {
            
            const startX = Phaser.Math.Between(minMaxX[0], minMaxX[1]);
            const startY = Phaser.Math.Between(minMaxY[0], minMaxY[1]);
            this.pieces[i].x = startX; this.pieces[i].y = startY;
            this.pieces[i].setVisible(true);
            this.pieces[i].setAlpha(1);
            this.pieces[i].setScale(0.3);
            const dx = minMaxX[0] + pX*scaledWidth;
            const dy = minMaxY[0] + pY*scaledWidth;
            this.tweens.add({
                targets: this.pieces[i],
                duration: duration,
                x: dx,
                y: dy,
                scaleX: this.sprite.scale,
                scaleY: this.sprite.scale,
                angle: 360,
                alpha: 1,
                delay: i / 3.5,
                yoyo: false

            });
            pX++;
            if (pX == columns) {
                pX = 0;
                pY++;
            }
        }
        setTimeout(this.hideExplodeys.bind(this, true), duration + (this.pieces.length/3.5)); 
    }

    hideExplodeys (setSpriteVisible=true) {
        this.titleTextImage.setAlpha(1);
        this.pieces.forEach( o => {
            o.setVisible(false);
        });
    }

    onPowerButton () {
        
        this.turningOn = true;
        this.implode(1000,
            {
            minX: 220,
            maxX: 600,
            minY: 320,
            maxY: 600
        });
        
    }

    nextScene () {
        if (this.goAway) {
            return;
        }
        this.goAway = true;
        if (UserModel.getInstance().user) {
            this.game.scene.start('SelectMonsterScene');
        } else {
            this.game.scene.start("LoginScene");
        }
        this.game.scene.stop("TitleScene");
    }
}