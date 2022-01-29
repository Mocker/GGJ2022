export class Button {
    constructor(x, y, label, image, scene, callback) {
        this.label = label;
        this.bgColor = '#2020FF';
        this.button = new Phaser.GameObjects.Sprite(scene, x, y, image)
            .setInteractive({ useHandCursor: true })
            .setDisplaySize(100,100)
            .on('pointerdown', () => callback());

        scene.add.existing(this.button);
    }
}