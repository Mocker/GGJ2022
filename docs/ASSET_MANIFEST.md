# They Might Byte: Production Asset Manifest & Placeholder Tracking

> **Purpose**: This document tracks all visual, audio, and hardware assets required for the full release of *They Might Byte*, cataloging existing procedural placeholders, technical specifications, and production priorities.

---

## 1. Overview of Active Procedural Placeholders

Until bespoke hand-drawn pixel art and audio files are produced, the engine uses the following procedural systems as placeholders:

| Feature Area | Current Placeholder Implementation | Target Asset to Replace |
| :--- | :--- | :--- |
| **Evolution Branch Visuals** | Base sprite atlases (`tadpole`, `germ`, `dino`, `snuffler`, `sunfish`) with procedural HSV tinting (`tintHex`) and scale multipliers (`0.85x – 1.25x`). | Bespoke animated sprite atlases for all 25+ species. |
| **Visual Elemental Auras** | Procedural Phaser particle systems (`VisualEffects.ts`): Celestial gold halos, Cyber scanline reticles, Void smoke, Nature leaves, Volcanic embers. | Multi-layered particle sprite sheets and custom GLSL fragment shaders. |
| **Metamorphosis Ceremony** | Procedural screen camera flash, rapid sine scale oscillation, and screen-shake tween. | 4-stage animated cocoon hatching sequence with electric lightning sprites. |
| **Living Habitats** | Solid and tiled static backgrounds (`test-A-_0000_BG.png`). | 400x400 parallax-layered biome backgrounds with animated elements. |
| **Focus Soundscapes** | Pure Web Audio API procedural synthesis (filtered pink noise rain, dual 55Hz binaural sine drone, pentatonic matrix pulse). | Optional high-fidelity looping lossless ambient audio stems. |

---

## 2. Species Sprite Atlases (Visual Assets)

### 2.1 Technical Specifications
- **Format**: Texture Atlas (Sprite sheet PNG + JSON Array/Hash format compatible with Phaser 3).
- **Native Frame Size**: $64 \times 64$ px or $128 \times 128$ px pixel art.
- **Color Palette**: Restricted 16-color or 32-color retro cyber/LCD palette.
- **Target Frame Rate**: 6–8 FPS (authentic virtual-pet cadence).

### 2.2 Required Animation Keys per Species Atlas
1. `idle`: 4–6 frames (breathing, subtle bobbing, eye blink).
2. `explore`: 6–8 frames (walking, crawling, floating, or slithering across LCD ground).
3. `happy`: 4–6 frames (celebration hop, sparkle eyes, wagging tail).
4. `eat`: 4–6 frames (mouth opening, chomping, satisfied gulp).
5. `sleep`: 2–4 frames (closed eyes, chest rising, resting posture).
6. `sick`: 4 frames (shivering, dizziness, head slumped).
7. `weak`: 4 frames (flinching, low energy breathing).
8. `attack_physical`: 4–6 frames (claw strike, tackle, tail lash, headbutt).
9. `attack_energy`: 6–8 frames (projectile beam, mouth blast, laser discharge).
10. `victory`: 6 frames (victory backflip, arm raise, wink).

---

### 2.3 Species Atlas Production Checklist

#### Lineage 1: 💧 Aquatic Lineage (Blue Egg)
- [ ] `pet-tadpole-baby`: Cute Tadpole (Rookie/Baby) — *Existing basic atlas, needs attack/victory frames.*
- [ ] `pet-tadpole-radiant`: Radiant Frog (Adult Hero) — Bespoke noble frog with lotus crown.
- [ ] `pet-sunfish-titan`: Tidal Leviathan (Adult Titan) — Armored deep-sea sunfish with hydrodynamic dorsal crest.
- [ ] `pet-tadpole-saint`: Saint Radiant Frog (Mega Hero) — Ascended amphibian with golden halo and energy orbs.

#### Lineage 2: 🦠 Microbial Lineage (Green Egg)
- [ ] `pet-bacteria-baby`: Baby Germ (Rookie/Baby) — *Existing basic atlas, needs combat frames.*
- [ ] `pet-bacteria-probiotic`: Pure Probiotic (Adult Hero) — Luminous cellular cluster.
- [ ] `pet-bacteria-sage`: Probiotic Sage (Adult Sage) — Hovering meditative cell colony with third-eye crystal.
- [ ] `pet-bacteria-omni`: Omni Spore Supreme (Mega Ascended) — Galaxy-like spore cluster with orbiting micro-drones.

#### Lineage 3: 🦖 Primordial Dino Lineage (Crimson Egg)
- [ ] `pet-dino-baby`: Tiny Dino (Rookie/Baby) — Bipedal baby raptor with ember tail.
- [ ] `pet-dino-shadow`: Shadow Dino (Adult Shadow) — Jagged obsidian raptor with void horns.
- [ ] `pet-wyrm-titan`: Magma Wyrm (Adult Titan) — Armored volcanic serpent.
- [ ] `pet-dino-abyssal`: Abyssal Dino (Mega Shadow) — Spined apex predator with dark void aura.
- [ ] `pet-dino-behemoth`: Obsidian Behemoth (Mega Titan) — Quadrupedal walking volcano.

#### Lineage 4: ⚙️ Android Lineage (Silver Egg)
- [ ] `pet-glitchbot-baby`: Glitch Bot (Rookie/Baby) — Chirping diode bot on rolling sphere.
- [ ] `pet-snuffler-cyber`: Cyber Snuffler (Adult Mecha) — *Existing basic atlas, needs railgun attack.*
- [ ] `pet-snuffler-omni`: Omni Mecha Snuffler (Mega Mecha) — Heavy artillery walker with dual cannons.

#### Lineage 5: ☀️ Celestial Lineage (Yellow Egg)
- [ ] `pet-sunfish-baby`: Tiny Sunfish (Rookie/Baby) — *Existing basic atlas.*
- [ ] `pet-sunfish-solar`: Solar Sunfish (Adult Hero) — Radiant koi with photon sails.
- [ ] `pet-seraph-mega`: Seraphim Koi (Mega Hero) — Six-winged celestial entity.

#### Lineage 6: 🌿 Botanical Lineage (Emerald Egg)
- [ ] `pet-seedling-baby`: Digital Seedling (Rookie/Baby) — Sprouting memory shoot.
- [ ] `pet-seedling-bonsai`: Digital Bonsai (Adult Nature) — Pruned flowering data bonsai.
- [ ] `pet-seedling-yggdrasil`: Yggdrasil Ancient (Mega Ancient) — Colossal network tree entity.

#### Lineage 7: 🌌 Void Lineage (Obsidian Egg)
- [ ] `pet-shadowmite-baby`: Shadow Mite (Rookie/Baby) — Flickering void wisp with curious white eyes.
- [ ] `pet-shadowmite-phantom`: Glitch Phantom (Adult Shadow) — Phase-shifting cloaked specter.
- [ ] `pet-shadowmite-anomaly`: Abyssal Anomaly Zero (Mega Apex) — Fragmented digital singularity.

---

## 3. Habitat Biome Tilesets (Environment Art)

- **Target Size**: $400 \times 400$ px with 2–3 parallax layers (Background, Midground, Foreground ground plane).
- **Format**: PNG with transparency for overlay layers.

| Habitat Biome | Layer 1 (Backdrop) | Layer 2 (Animated Midground) | Layer 3 (Ground Plane) |
| :--- | :--- | :--- | :--- |
| **Cyberpunk Neo-Tokyo** | Dark neon skyscraper silhouettes | Blinking kanji billboards, flying delivery drones, rain streaks | Puddle-slick metal catwalk with neon reflections |
| **Server Vault 1999** | Vintage mainframe server racks | Blinking rack status LEDs, spinning cooling fans, cable bundles | Perforated raised computer room floor tiles |
| **Zen Digital Bonsai** | Soft misty digital watercolor mountains | Swaying bamboo stalks, falling pink pixel sakura petals | Sand raked into zen garden patterns, smooth river stones |
| **Deep Space Nebula** | Rich purple/cyan interstellar dust clouds | Slowly tumbling textured pixel asteroids, distant pulsar flare | Metal observation deck with rivet details |
| **Volcanic Core** | Dark basalt cave walls with magma cracks | Rising heat-wave distortion, bubbling lava pool | Hardened black obsidian rock ledge |
| **Cloud Glade** | Soft pastel blue sky with lens flares | Floating fluffy pixel clouds drifting left to right | Floating island grassy turf with wild data flowers |

---

## 4. Hardware Chassis & UI Skins

- **Target Size**: $800 \times 800$ px outer Digivice body with cutouts for LCD viewport ($400 \times 400$) and 3 hardware buttons.
- **Variants Needed**:
  1. `Translucent Atomic Purple`: Polycarbonate purple shell revealing simulated circuit board, capacitor, and battery traces.
  2. `Industrial Hazard Yellow`: High-contrast matte yellow with black diagonal warning stripes and metal screws.
  3. `Glacier Ice Clear`: Frosted glass aesthetic with ice blue buttons.
  4. `Carbon Fiber Stealth`: Woven dark carbon fiber texture with ruby red LED bezel.

---

## 5. Audio Production Manifest (SFX & Music)

### 5.1 Species Voice Cries
- 8-bit / 16-bit synthesized voice chirps ($0.4 – 0.8$ seconds) for each elemental lineage:
  - `sfx-cry-aquatic`: Bubbling, playful dolphin/frog chirp.
  - `sfx-cry-microbial`: High-pitched squishy squeak.
  - `sfx-cry-primordial`: Deep guttural pixel roar.
  - `sfx-cry-android`: Mechanical modem baud connect / servo beep.
  - `sfx-cry-celestial`: Glass harmonica / chime harmonic.
  - `sfx-cry-botanical`: Gentle rustling woodwind whistle.
  - `sfx-cry-void`: Low-frequency reversed static glitch.

### 5.2 Combat & Evolution Audio
- `sfx-combat-laser`: Sharp retro laser discharge.
- `sfx-combat-tackle`: Heavy punch / kick impact with screen-shake punchiness.
- `sfx-combat-crit`: Piercing metallic critical strike chime.
- `sfx-evolution-climax`: Full 8-bit fanfare with ascending arpeggios celebrating metamorphosis completion.

---

## 6. Asset Production Priority Matrix

| Priority | Asset Package | Estimated Effort | Impact on Player Experience |
| :---: | :--- | :---: | :--- |
| **P0 (Immediate)** | Combat & Metamorphosis FX (Lightning cocoon, elemental combat attack bursts, halo/horns). | Low | High — Replaces static tints with immediate combat and evolution juice. |
| **P0 (Immediate)** | 6x Habitat Biome Backgrounds (Neo-Tokyo, Server Vault, Zen Bonsai, Nebula, Magma, Cloud). | Medium | Very High — Transforms the screen from a blank box to a living world. |
| **P1 (Next Sprint)** | Adult & Mega Sprite Atlases for Top 4 most popular lineages (Aquatic, Dino, Android, Celestial). | High | Massive — Delivers true species identity upon evolution. |
| **P1 (Next Sprint)** | Species Elemental Voice Cries & Combat Impacts. | Low | High — Solidifies creature personality. |
| **P2 (Polish)** | Remaining 3 Lineage Atlases (Microbial, Botanical, Void). | High | High — Completes the full 25-species Byte-Dex. |
| **P2 (Polish)** | Translucent Atomic Purple & Hazard Chassis Skins. | Medium | Moderate — Aesthetic reward for collector progression. |
