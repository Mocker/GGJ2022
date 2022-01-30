export class Button {
    constructor(x, y, label, image, scene, callback) {
        this.label = label;
        this.bgColor = '#2020FF';
        this.callback = callback;
        this.image = image;
        this.button = new Phaser.GameObjects.Sprite(scene, x, y, image)
            .setInteractive({ useHandCursor: true })
            .setScale(0.8)
            //.setDisplaySize(100,100)
            .on('pointerdown', this.clickDaButton.bind(this));
        scene.add.existing(this.button);
    }

    clickDaButton () {
        this.button.setTexture(`${this.image}-on`);
        setTimeout( this.resetDaButton.bind(this), 1000);
        this.callback();
    }

    resetDaButton () {
        this.button.setTexture(`${this.image}`);
    }
}