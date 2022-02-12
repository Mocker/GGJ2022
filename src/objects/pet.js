import Phaser from 'phaser';

export class Pet
{

    constructor (baseData, customData={}) {
        this.baseData = baseData; //base stats for type->stage of pet
        this.customData = customData;
        if (!this.customData.timers ) {
            this.customData.timers = {};
        }
        if (!this.customData.timers.lived) {
            this.customData.timers.lived = 1;
        }
        this.active = false;
        this.scene = null;
        this.sprite = null;
        this.x = 0;
        this.y = 0;
        this.name = this.customData.name || this.baseData.name;
        this.pieces = [];
        this.status = 'idle';
        this.sleepyTimer = 0;
        this.hungerMeter = (Math.random()*120+60)*1000;
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
            //TODO:: every class should have their own default animation! load the spritesheet and animations instead of a static image
            //this.sprite = this.scene.add.sprite(this.x, this.y, `${this.baseData.type}-${this.baseData.stage.stage}`);
            //this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `${this.baseData.type}-${this.baseData.stage}`);
            //this.sprite.setDisplaySize(300,300);
            //this.buildPieces();
        } 
        this.setSleepyTimer();       
    }

    setSleepyTimer () {
        this.sleepyTimer = Math.random()*60*1000; //time of inactivity until it sleeps
    }

    resume() {
        this.scene.isPaused = false;
        return this;
    }

    playOnce(animName, idleAnim, repeat=0, cb) {
        this.sprite.destroy();
        this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, animName);
        this.sprite.setDisplaySize(300,300);
        const aConf = {
            key: animName,
            repeat: repeat
        };
        if (repeat !== -1) {
            this.sprite.once('animationcomplete', this.onAnimationComplete.bind(this, idleAnim, cb));
        }
        this.sprite.play(aConf);
        this.scene.add.existing(this.sprite);
        this.scene.playLayer.add([this.sprite]);
    }

    onAnimationComplete(idleAnim, cb) {
        console.log(`done playing, back to idle ${idleAnim} - cb ${cb}`);
        if (idleAnim) {
            this.sprite.destroy();
            this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, idleAnim);
            this.sprite.setDisplaySize(300,300);
            this.sprite.play(idleAnim);
            this.scene.add.existing(this.sprite);
        }
        if (cb) cb(this);
    }

    reloadSprite (rebuildPieces=true) {
        if (this.sprite) this.sprite.destroy();
        if (rebuildPieces && this.pieces.length > 0) this.clearPieces();
        this.sprite = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, `${this.baseData.type}-${this.baseData.stage}`);
        this.sprite.setDisplaySize(300,300);
        this.scene.add.existing(this.sprite);
        this.scene.playLayer.add([this.sprite]);
        if (rebuildPieces) this.buildPieces();
    }

    buildPieces () {
        // if (this.pieces.length < 1) {
        //     const source = this.scene.textures.get(`${this.baseData.type}-${this.baseData.stage}`).source[0].image;
        //     this.FRAME_WIDTH = 32;
        //     this.piecesSprite = this.scene.textures.addSpriteSheet(`${this.baseData.type}-${this.baseData.stage}-pieces`, source, {
        //         frameWidth: this.FRAME_WIDTH,
        //         frameHeight: this.FRAME_WIDTH
        //     });
        //     this.piecesSpritesFrames = this.piecesSprite.frameTotal;
        //     this.pieces = [];
            
            
        
        //     for (let i=0; i<this.piecesSprite.frameTotal; i++){
                
        //         this.pieces.push(this.scene.add.image(0, 0, `${this.baseData.type}-${this.baseData.stage}-pieces`, i));
        //         this.pieces[i].setVisible(false);
        //         this.pieces[i].setScale(this.sprite.scale);
                
        //     }
        //     this.scene.playLayer.add(this.pieces);
        // }
    }

    clearPieces () {
        this.scene.playLayer.remove(this.pieces);
        for (let i=0; i<this.pieces.length; i++){
            this.pieces[i].destroy();
        }
        this.pieces = [];
    }

    implode (duration=4000,bounds) {
        // let pX = 0;
        // let pY = 0;
        // let minMaxX = [
        //     bounds ? bounds.minX : this.sprite.x - (this.sprite.displayWidth / 2),
        //     bounds ? bounds.maxX : this.sprite.x + (this.sprite.displayWidth / 2)
        // ];
        // let minMaxY = [
        //     bounds ? bounds.minY : this.sprite.y - (this.sprite.displayHeight / 2),
        //     bounds ? bounds.maxY : this.sprite.y + (this.sprite.displayHeight / 2)
        // ];
        // let columns = Math.floor(this.sprite.width / this.FRAME_WIDTH);
        // let scaledWidth = Math.floor(this.sprite.displayWidth / columns); 
        // for( let i=0; i<this.pieces.length; i++) {
            
        //     const startX = Phaser.Math.Between(minMaxX[0], minMaxX[1]);
        //     const startY = Phaser.Math.Between(minMaxY[0], minMaxY[1]);
        //     this.pieces[i].x = startX; this.pieces[i].y = startY;
        //     this.pieces[i].setVisible(true);
        //     this.pieces[i].setAlpha(0.3);
        //     this.pieces[i].setScale(0.1);
        //     const dx = minMaxX[0] + pX*scaledWidth;
        //     const dy = minMaxY[0] + pY*scaledWidth;
        //     if (i<2) {
        //         console.log(startX,startY,dx,dy);
        //     }
        //     this.scene.tweens.add({
        //         targets: this.pieces[i],
        //         duration: duration,
        //         x: dx,
        //         y: dy,
        //         scaleX: this.sprite.scale,
        //         scaleY: this.sprite.scale,
        //         angle: 360,
        //         alpha: 1,
        //         //delay: i / 3.5,
        //         yoyo: false

        //     });
        //     pX++;
        //     if (pX == columns) {
        //         pX = 0;
        //         pY++;
        //     }
        // }
        //this.sprite.setVisible(false);
        //setTimeout(this.hideExplodeys.bind(this, true), duration /*+ (this.pieces.length/3.5)*/); 
    }

    explode (duration=4000) {
        // let pX = 0;
        // let pY = 0;
        // let minMaxX = [
        //     this.sprite.x - (this.sprite.displayWidth / 2),
        //     this.sprite.x + (this.sprite.displayWidth / 2)
        // ];
        // let minMaxY = [
        //     this.sprite.y - (this.sprite.displayHeight / 2),
        //     this.sprite.y + (this.sprite.displayHeight / 2)
        // ];
        // let columns = Math.floor(this.sprite.width / this.FRAME_WIDTH);
        // let scaledWidth = Math.floor(this.sprite.displayWidth / columns); 
        // for( let i=0; i<this.pieces.length; i++) {
            
        //     const startX = Phaser.Math.Between(minMaxX[0], minMaxX[1]);
        //     const startY = Phaser.Math.Between(minMaxY[0], minMaxY[1]);
        //     //this.pieces[i].x = startX; this.pieces[i].y = startY;
        //     this.pieces[i].setVisible(true);
        //     this.pieces[i].setAlpha(1);
        //     this.pieces[i].setScale(this.sprite.scale);
        //     this.pieces[i].x = minMaxX[0] + pX*scaledWidth;
        //     this.pieces[i].y = minMaxY[0] + pY*scaledWidth;
        //     this.scene.tweens.add({
        //         targets: this.pieces[i],
        //         duration: duration,
        //         x: startX,
        //         y: startY,
        //         alpha: 0,
        //         scaleX: 0,
        //         scaleY: 0,
        //         angle: 360,
        //         delay: i / 3.5,
        //         yoyo: false

        //     });
        //     pX++;
        //     if (pX == columns) {
        //         pX = 0;
        //         pY++;
        //     }
        // }
        //this.sprite.setVisible(false);
        //setTimeout(this.hideExplodeys.bind(this, false), duration + (this.pieces.length/3.5));
    }

    hideExplodeys (setSpriteVisible=true) {
        this.sprite.setVisible(setSpriteVisible);
        // this.pieces.forEach( o => {
        //     o.setVisible(false);
        // });
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

    getActionMenu() {
        return [];
    }

    getBattleMenu() {
        return [["Coming Soon!", () => console.log("coming soon!")]];
    }

    doBattle () {
        console.log("Get battlin");
    }

    doExplore () {
        console.log("Gone explorin");
    }


    useItem (item) {
        console.log(`${this.name} uses ${item.name} - its super effective`, item);
        const msg = `${this.name} uses ${item.name} .. ` +
        ((item.tags && (item.tags[this.type] || item.tags[this.baseData.classname]))
            ? 'delicious!'
            : 'meh');
        this.scene.ui.showMessage(msg, 1500);
        return true;
    }

    resume () {
        this.scene.isPaused = false;
    }

    pause () {
        this.scene.isPaused = true;
    }

    onSleepyTimer () {
        //override with sleep animation
    }

    onIsHungry () {
        //override if you care about hunger you monster
    }

    update (time, delta) {
        this.customData.timers.lived += delta;
        if (this.active && this.scene && this.scene.isPaused == false) {
            this.sleepyTimer -= delta;
            if (this.sleepyTimer < 0 ) {
                this.setSleepyTimer();
                this.onSleepyTimer();
            }
            if (this.hungerMeter >= 0 ) this.hungerMeter -= delta;
            if (this.hungerMeter < 0 ) this.onIsHungry();
        }
    }
}