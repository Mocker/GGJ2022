export const getCenterOfScreen = (scene) => {
    const screenCenterX = scene.cameras.main.worldView.x + scene.cameras.main.width / 2;
    const screenCenterY = scene.cameras.main.worldView.y + scene.cameras.main.height / 2;

    return {
        screenCenterY,
        screenCenterX
    }
}