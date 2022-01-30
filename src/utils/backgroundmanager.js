export const clearButtonEvents = (game) => {
    game.scene.getScene('BGScene').events.off('button-one-clicked');
    game.scene.getScene('BGScene').events.off('button-two-clicked');
    game.scene.getScene('BGScene').events.off('button-three-clicked');
}