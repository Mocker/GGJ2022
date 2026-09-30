# 👾 They Might Byte

> **Retro 1997-Style LCD Digivice Virtual Pet & Cyber Focus Companion**  
> *Procedural Mendelian genetics, offline-first cryptographic state seals, Pomodoro deep-work sprints, and arcade mini-games.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Phaser](https://img.shields.io/badge/Phaser-3.90-E04E39?logo=phaser&logoColor=white)](https://phaser.io/)
[![Vitest](https://img.shields.io/badge/Vitest-5.x-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](./LICENSE)

---

## 📖 Overview

**They Might Byte** captures the tactile grit, monochrome LCD charm, and pixelated animations of vintage 1990s keychain virtual pets (Digivice, Tamagotchi)—reimagined as a modern desktop companion and productivity tool.

Originally conceived during Global Game Jam 2022 (*Theme: Duality*), the project has undergone a complete architectural renovation into a high-performance, strictly typed, offline-first web game with procedural genetics, branching evolutions, and zero external runtime server dependencies.

---

## ✨ Key Features

### 🧬 Procedural Mendelian Genetics & Pedigree Tree
- **Continuous & Discrete Alleles**: Every hatched pet possesses continuous chromosomal loci (color hue shift, sprite scale, metabolic rate) and discrete Individual Values (0–31 IVs for HP, Attack, and Defense).
- **Heritability & Point Mutations**: Breeding and ascension pass genetic material to offspring with stochastic crossover and configurable mutation rates.
- **Phylogenetic Pedigree Tree**: Inspect historical generations, inherited genotypes, and ancestral lineages in an interactive family tree view (`PedigreeScene`).

### 🧘 Cyber Focus Companion (Pomodoro Mode)
- **Productivity Sprints**: Set 15-minute, 25-minute, or 45-minute deep-work focus sessions (`FocusScene`).
- **Levitation & Aura States**: Your companion enters a meditative levitation state with procedural ambient hums while you work.
- **Discipline & Token Rewards**: Completing sprints awards discipline, coins, and focus tokens; neglecting or abandoning sprints causes fatigue or triggers chaotic shadow evolutions.

### 🕹️ Arcade Mini-Games
Train your pet's attributes through 3 distinct retro mini-games (`MiniGameScene`):
1. **⚡ Digi-Workout**: Precision reflex timing bar to train Attack power, Energy, and Discipline.
2. **🧠 Memory Matrix**: Simon-style 4-quadrant visual sequence recall to sharpen Happiness and mental stats.
3. **🗺️ Digi-Crawler**: 5-floor turn-based roguelite dungeon crawling with random encounters, combat choices, coin treasures, and rare edible snacks.

### 🛡️ Cryptographic State Seals & Portable Pet Passports
- **Client-Side Tamper Detection**: Save state attributes are verified with 64-bit cryptographic hashing (`cryptoSeal.ts`).
- **URL-Safe Pet Passports**: Export your pet into a compact, self-contained Base64 URL parameter (`?importPet=...`) to share, trade, or spar with friends without needing a central database.

### 📇 Holographic Tamer Card Exporter
- Dynamically render an **800×1200** holographic trading card onto an offscreen canvas (`cardExport.ts`).
- Displays your pet’s sprite, stage, IV radar stats, Generation rank, and unique DNA hash ready for download or zero-inventory print-on-demand card printing.

### 🎨 Authentic Digivice Hardware Shells
- Choose between 5 vintage shell colorways with tactile button animations:
  - **Cool Bronze**
  - **Dragon Blood**
  - **Golden Beam**
  - **Mountain Steel**
  - **Sage Bog**

### 🔊 Procedural 8-bit Synthesizer Audio
- Authentic retro audio generated in real time using the Web Audio API (square, triangle, and noise wave bursts). No bulky prerecorded audio clips required for synthesizer fanfares.

---

## 🕹️ Controls & Keybindings

The game emulates a 3-button handheld LCD device. You can click the tactile buttons on screen or use your keyboard:

| Hardware Button | Keyboard Keys | Action / Context |
| :--- | :--- | :--- |
| **Button 1 (Left)** | <kbd>A</kbd> / <kbd>Z</kbd> / <kbd>◀</kbd> | Open Items Menu / Scroll & Cycle selections |
| **Button 2 (Center)** | <kbd>SPACE</kbd> / <kbd>S</kbd> / <kbd>X</kbd> | Action Menu / Confirm / Feed / Pet / Bath / Sleep |
| **Button 3 (Right)** | <kbd>D</kbd> / <kbd>C</kbd> / <kbd>▶</kbd> | Battle Arena / Mini-Games / Options / Cancel |
| **Audio Toggle** | <kbd>M</kbd> | Mute or unmute procedural audio |

---

## 🚀 Getting Started

### 🐳 Isolated Devbox Workflow (Recommended)

This repository includes first-class support for isolated Docker devbox workflows:

```bash
# 1. Start the isolated container
devbox start ggj2022

# 2. Run the Vite development server with HMR
devbox exec ggj2022 pnpm dev

# 3. Execute the Vitest test suite
devbox exec ggj2022 pnpm test

# 4. Compile production bundle
devbox exec ggj2022 pnpm run build
```

### 💻 Local Host Development

Prerequisites: **Node.js 20+** and **pnpm 9+**.

```bash
# Clone the repository
git clone git@github.com:Mocker/GGJ2022.git
cd GGJ2022

# Install dependencies
pnpm install

# Start local dev server (default: http://localhost:5173)
pnpm dev

# Run Vitest unit & simulation tests
pnpm test

# Build for production
pnpm run build

# Preview production build locally
pnpm run preview

# Package Itch.io distribution release zip
pnpm run build:itch
```

### 🐳 Docker & Docker Compose

To run the production static container via Docker Compose:

```bash
docker compose up -d --build
```
Access the game at `http://localhost:8085`.

---

## 🧪 Testing & Verification

The project maintains comprehensive unit and simulation test coverage powered by **Vitest**:

```bash
pnpm test
```

### Test Suites (`tests/`)
- [`tests/simulation.test.ts`](file:///home/ubuntu/projects/ggj2022/tests/simulation.test.ts): Pet lifecycle simulation, hunger/happiness decay, hygiene degradation, and care mistake triggers.
- [`tests/genetics.test.ts`](file:///home/ubuntu/projects/ggj2022/tests/genetics.test.ts): Mendelian inheritance, chromosomal crossover, IV calculations, and mutation boundaries.
- [`tests/minigames.test.ts`](file:///home/ubuntu/projects/ggj2022/tests/minigames.test.ts): Plugin registry verification, scoring logic, and difficulty scaling.
- [`tests/cryptoSeal.test.ts`](file:///home/ubuntu/projects/ggj2022/tests/cryptoSeal.test.ts): Cryptographic save sealing, signature verification, and anti-tamper rejection.

---

## 📁 Project Structure

```text
ggj2022/
├── images/                   # Pixel art spritesheets, UI themes, and retro audio
│   ├── pets/                 # Pet sprite atlases (animations: idle, eat, explore, hatch, sleep)
│   ├── sfx/                  # Retro sound effects
│   └── ui/                   # Digivice shell frames, buttons, and backgrounds
├── public/                   # Static PWA assets, fonts, and service worker
│   ├── ConnectionIi-2wj8.otf # Retro pixel font
│   ├── manifest.webmanifest  # PWA manifest
│   └── sw.js                 # Service worker cache strategy
├── scripts/
│   └── build-itch.sh         # Itch.io automated release packaging script
├── src/
│   ├── data/                 # Evolution branching tree, starter definitions, and shop catalogs
│   ├── genetics/             # Mendelian genetics engine, chromosome types, crossover logic
│   ├── minigames/            # Mini-game plugin architecture (Crawler, Workout, Matrix)
│   ├── objects/              # Phaser game objects (DigiviceShell, GameUI, PetEntity)
│   ├── scenes/               # Phaser scenes (Boot, Title, Pet, Battle, Focus, Pedigree, etc.)
│   ├── services/             # Audio, local storage, card export, and network crypto
│   ├── types/                # TypeScript type definitions (Pet, Item, User)
│   ├── main.ts               # Game entrypoint & Phaser configuration
│   └── style.css             # CRT styling, flex centering, and responsive layout
├── tests/                    # Vitest automated test suites
├── Dockerfile                # Multi-stage production Nginx container
├── docker-compose.yml        # Docker Compose configuration (port 8085)
├── package.json              # Project scripts and dependencies
├── pnpm-lock.yaml            # Deterministic lockfile
└── tsconfig.json             # Strict TypeScript configuration
```

---

## 📜 License

Distributed under the **GNU General Public License v3.0** (GPL-3.0). See [`LICENSE`](file:///home/ubuntu/projects/ggj2022/LICENSE) for details.
