import Phaser from 'phaser';
import { Image, Button } from '../../objects'

// Our game scene
var gameScene = new Phaser.Scene("game");

gameScene.init = function() {

};

let image;

gameScene.preload = function() {
    image = new Image(this, 'monster', 'monster_test_01-big.png', 400, 400);
};

gameScene.create = function() {

    image.setImage();

    const button = new Button(100, 100, 'Play', this, () => image.play());
    const button2 = new Button(200, 100, 'Attack', this, () => image.attack());

};

gameScene.update = function() {

};


gameScene.end = function() {

};


export { gameScene };
