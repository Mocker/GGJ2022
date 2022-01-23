var playingAnimation = (target) => ({
    targets: target,
    alpha: { from: 0, to: 175 },
    duration: 2000, 
    onUpdate: (tween) => {
        var max = 25;
        var min = -25;
        var range = max - min ;
        target.setAngle(min + Math.abs(((tween.getValue() + range) % (range * 2)) - range));
    }
});

const attackAnimation = (target) => ({
    targets: target,
    x: 500,
    duration: 200, 
    ease: 'Bounce.easeInOut', 
    yoyo: true, 
    delay: 500 
});

export var animationDictionary = {
    play: playingAnimation,
    attack: attackAnimation
}

export var playAnimationByName = (animationName, scene, target) => {
    scene.tweens.add(
        animationDictionary[animationName](target)
    );
}