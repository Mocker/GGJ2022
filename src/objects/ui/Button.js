export class Button {
    constructor(x, y, label, scene, callback) {
        this.label = label;
        this.bgColor = '#2020FF';
        this.button = new Phaser.GameObjects.Text(scene, x, y, label)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: this.bgColor })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => callback())
            .on('pointerover', () => this.button.setStyle({ backgroundColor: '#f39c12' }))
            .on('pointerout', () => this.button.setStyle({ backgroundColor: this.bgColor }));
        scene.add.existing(this.button);
    }
}