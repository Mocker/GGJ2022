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

const tintInOutAnimation = (target, options={}) => ({
    targets: target,
    duration: options.duration || 2000,
    from: 510,
    to: 0,
    onUpdate: function(tween)
    {
        const value = Math.abs( 255 - Math.floor(tween.getValue()) );
        if(options.getColor) {
            target.setTint(options.getColor(value));
        } else {
            target.setTint(Phaser.Display.Color.GetColor(255, value, value));
        }
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
    play: {counter: false, tween: playingAnimation},
    attack: {counter: false, tween: attackAnimation},
    tintInOut: {counter: true, tween: tintInOutAnimation}
}

export var playAnimationByName = (animationName, scene, target, options) => {
    if (animationDictionary[animationName].counter) {
        return scene.tweens.addCounter(
            animationDictionary[animationName].tween(target, options)
        );
    } else {
        return scene.tweens.add(
            animationDictionary[animationName].tween(target, options)
        );
    }
}