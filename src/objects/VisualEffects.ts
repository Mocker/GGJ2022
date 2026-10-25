import Phaser from 'phaser';
import { VisualAuraType } from '../types/pet';

export class VisualEffects {
  /**
   * Creates a procedural animated particle aura that anchors to and follows the pet sprite.
   */
  public static createAura(
    scene: Phaser.Scene,
    x: number,
    y: number,
    auraType: VisualAuraType,
    mask?: Phaser.Display.Masks.GeometryMask
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y).setDepth(9);
    if (mask) container.setMask(mask);

    if (auraType === 'none') return container;

    // 1. Celestial Radiant Aura (Golden pulsing rays + floating sparkles)
    if (auraType === 'celestial') {
      const haloGfx = scene.add.graphics();
      haloGfx.lineStyle(2.5, 0xfacc15, 0.85);
      haloGfx.strokeEllipse(0, -75, 46, 14);
      haloGfx.lineStyle(1, 0xfffbeb, 0.9);
      haloGfx.strokeEllipse(0, -75, 38, 10);
      container.add(haloGfx);

      // Gentle floating halo tween
      scene.tweens.add({
        targets: haloGfx,
        y: -5,
        alpha: 0.6,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Ambient rising golden sparkle dots
      for (let i = 0; i < 6; i++) {
        const dot = scene.add.text(
          Phaser.Math.Between(-40, 40),
          Phaser.Math.Between(-20, 40),
          '✦',
          { fontFamily: 'beryl-digivice', fontSize: '10px', color: '#fef08a' }
        ).setOrigin(0.5);
        container.add(dot);

        scene.tweens.add({
          targets: dot,
          y: '-=60',
          alpha: { from: 1, to: 0 },
          scale: { from: 1.2, to: 0.4 },
          duration: 1200 + i * 200,
          repeat: -1,
          delay: i * 250,
          ease: 'Cubic.easeOut',
        });
      }
    }

    // 2. Cyber Matrix Pulse (Cyan digital circuit reticle + data glitch bits)
    else if (auraType === 'cyber') {
      const ringGfx = scene.add.graphics();
      ringGfx.lineStyle(1.5, 0x38bdf8, 0.7);
      ringGfx.strokeCircle(0, 0, 68);
      ringGfx.lineStyle(1, 0x0284c7, 0.4);
      ringGfx.strokeCircle(0, 0, 78);
      container.add(ringGfx);

      scene.tweens.add({
        targets: ringGfx,
        scaleX: 1.08,
        scaleY: 1.08,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Linear',
      });

      // Digital binary bits rising
      for (let i = 0; i < 5; i++) {
        const bit = scene.add.text(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(0, 50),
          Math.random() > 0.5 ? '1' : '0',
          { fontFamily: 'beryl-digivice', fontSize: '9px', color: '#38bdf8' }
        ).setOrigin(0.5);
        container.add(bit);

        scene.tweens.add({
          targets: bit,
          y: '-=70',
          alpha: { from: 0.9, to: 0 },
          duration: 1100 + i * 200,
          repeat: -1,
          delay: i * 300,
          ease: 'Linear',
        });
      }
    }

    // 3. Void / Shadow Mist (Dark violet rising particles & ominous horns)
    else if (auraType === 'void') {
      const shadowGfx = scene.add.graphics();
      shadowGfx.fillStyle(0x4c1d95, 0.25);
      shadowGfx.fillEllipse(0, 45, 90, 24);
      container.add(shadowGfx);

      for (let i = 0; i < 7; i++) {
        const puff = scene.add.circle(
          Phaser.Math.Between(-45, 45),
          Phaser.Math.Between(20, 50),
          Phaser.Math.Between(5, 12),
          0x7c3aed,
          0.4
        );
        container.add(puff);

        scene.tweens.add({
          targets: puff,
          y: '-=80',
          x: `+=${Phaser.Math.Between(-15, 15)}`,
          alpha: { from: 0.5, to: 0 },
          scale: { from: 0.8, to: 1.8 },
          duration: 1400 + i * 150,
          repeat: -1,
          delay: i * 200,
          ease: 'Sine.easeOut',
        });
      }
    }

    // 4. Bioluminescent Ripple (Neon cyan rhythmic ocean wave)
    else if (auraType === 'bioluminescent') {
      const pulseGfx = scene.add.graphics();
      pulseGfx.lineStyle(2, 0x06b6d4, 0.6);
      pulseGfx.strokeEllipse(0, 20, 75, 45);
      container.add(pulseGfx);

      scene.tweens.add({
        targets: pulseGfx,
        scaleX: 1.25,
        scaleY: 1.25,
        alpha: { from: 0.8, to: 0 },
        duration: 1500,
        repeat: -1,
        ease: 'Sine.easeOut',
      });
    }

    // 5. Nature / Botanical Bloom (Emerald pollen & leaves)
    else if (auraType === 'nature') {
      for (let i = 0; i < 5; i++) {
        const leaf = scene.add.text(
          Phaser.Math.Between(-45, 45),
          Phaser.Math.Between(-20, 40),
          '🍃',
          { fontFamily: 'beryl-digivice', fontSize: '10px' }
        ).setOrigin(0.5);
        container.add(leaf);

        scene.tweens.add({
          targets: leaf,
          y: '-=65',
          x: `+=${Phaser.Math.Between(-20, 20)}`,
          angle: 360,
          alpha: { from: 1, to: 0 },
          duration: 1800 + i * 200,
          repeat: -1,
          delay: i * 350,
          ease: 'Sine.easeInOut',
        });
      }
    }

    // 6. Magma / Titan Volcanic Aura (Rising glowing embers)
    else if (auraType === 'magma') {
      for (let i = 0; i < 6; i++) {
        const ember = scene.add.circle(
          Phaser.Math.Between(-40, 40),
          Phaser.Math.Between(25, 55),
          Phaser.Math.Between(2, 5),
          i % 2 === 0 ? 0xef4444 : 0xf97316,
          0.85
        );
        container.add(ember);

        scene.tweens.add({
          targets: ember,
          y: '-=90',
          x: `+=${Phaser.Math.Between(-25, 25)}`,
          alpha: { from: 0.9, to: 0 },
          scale: { from: 1, to: 0.2 },
          duration: 900 + i * 180,
          repeat: -1,
          delay: i * 160,
          ease: 'Cubic.easeOut',
        });
      }
    }

    return container;
  }

  /**
   * Dramatic 4-phase metamorphosis visual ceremony.
   */
  public static triggerEvolutionCeremony(
    scene: Phaser.Scene,
    sprite: Phaser.GameObjects.Sprite,
    onPeak: () => void,
    onComplete: () => void
  ): void {
    const origScaleX = sprite.scaleX;
    const origScaleY = sprite.scaleY;

    // Phase 1: Pre-evolution energy absorption (darkening + rapid vibration)
    scene.tweens.add({
      targets: sprite,
      x: sprite.x + 4,
      duration: 50,
      yoyo: true,
      repeat: 8,
      ease: 'Linear',
      onComplete: () => {
        // Phase 2: Electric blinding flash
        scene.cameras.main.flash(450, 56, 189, 248);

        // Phase 3: Cocoon expansion and rapid scale pulse
        scene.tweens.add({
          targets: sprite,
          scaleX: origScaleX * 1.6,
          scaleY: origScaleY * 1.6,
          duration: 180,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            // Peak transformation moment: swap sprite / stats
            onPeak();

            // Phase 4: Big camera shake and burst
            scene.cameras.main.shake(260, 0.02);

            scene.tweens.add({
              targets: sprite,
              scaleX: origScaleX,
              scaleY: origScaleY,
              duration: 250,
              ease: 'Back.easeOut',
              onComplete: () => onComplete(),
            });
          },
        });
      },
    });
  }
}
