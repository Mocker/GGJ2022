import { PetModel, PetStage, PetType, BranchType, VisualAuraType, SpeciesEntry, EggType } from '../types/pet';

export type { SpeciesEntry };

export interface EvolutionResult {
  nextStage: PetStage;
  nextName: string;
  nextType: PetType;
  branch: BranchType;
  aura: VisualAuraType;
  speciesId: string;
  bonusHp: number;
  bonusAttack: number;
  bonusDefense: number;
  evolutionMessage: string;
}

export interface EvolutionReadiness {
  canEvolve: boolean;
  reason?: string;
}

// --- Canonical Tamer Field Guide (Byte-Dex) Registry ---
export const BYTE_DEX_SPECIES: SpeciesEntry[] = [
  // 1. Aquatic Lineage (Blue Egg)
  {
    id: 'cute-tadpole',
    dexNumber: 1,
    name: 'Cute Tadpole',
    lineage: 'aquatic',
    stage: 'baby',
    type: 'tadpole',
    branch: 'neutral',
    aura: 'bioluminescent',
    baseHp: 20,
    baseAttack: 5,
    baseDefense: 4,
    lore: 'A curious newborn amphibian with glowing translucent fins. Swims toward friendly digital currents.',
    evolutionHint: 'Hatched from standard Blue Origin egg.',
  },
  {
    id: 'radiant-frog',
    dexNumber: 2,
    name: 'Radiant Frog',
    lineage: 'aquatic',
    stage: 'adultCute',
    type: 'tadpole',
    branch: 'hero',
    aura: 'bioluminescent',
    baseHp: 45,
    baseAttack: 13,
    baseDefense: 14,
    lore: 'Nurtured with gentle care and high discipline. Emits a soothing ambient glow that calms nearby data packets.',
    evolutionHint: 'Evolve baby with Discipline >= 60 and <= 1 Care Mistake.',
  },
  {
    id: 'tidal-leviathan',
    dexNumber: 3,
    name: 'Tidal Leviathan',
    lineage: 'aquatic',
    stage: 'adultCute',
    type: 'sunfish',
    branch: 'titan',
    aura: 'bioluminescent',
    baseHp: 60,
    baseAttack: 16,
    baseDefense: 18,
    lore: 'A massive armored deep-sea voyager with hydrodynamic scales capable of withstanding crushing server depths.',
    evolutionHint: 'Evolve baby with 4+ Hydro-Bytes logged and high Cleanliness.',
  },
  {
    id: 'saint-rana',
    dexNumber: 4,
    name: 'Saint Radiant Frog',
    lineage: 'aquatic',
    stage: 'megaHero',
    type: 'tadpole',
    branch: 'hero',
    aura: 'celestial',
    baseHp: 95,
    baseAttack: 33,
    baseDefense: 39,
    lore: 'Ascended celestial guardian. Golden halos shimmer across its lotus crown as it harmonizes living ecosystems.',
    evolutionHint: 'Ascend adult with Discipline >= 75 or Hero branch lineage.',
  },

  // 2. Microbial Lineage (Green Egg)
  {
    id: 'baby-germ',
    dexNumber: 5,
    name: 'Baby Germ',
    lineage: 'microbial',
    stage: 'baby',
    type: 'bacteria',
    branch: 'neutral',
    aura: 'nature',
    baseHp: 22,
    baseAttack: 6,
    baseDefense: 3,
    lore: 'A tiny microscopic cluster of sentient code that absorbs background digital clutter with endless enthusiasm.',
    evolutionHint: 'Hatched from Emerald Bio-Green egg.',
  },
  {
    id: 'pure-probiotic',
    dexNumber: 6,
    name: 'Pure Probiotic',
    lineage: 'microbial',
    stage: 'adultCute',
    type: 'bacteria',
    branch: 'hero',
    aura: 'nature',
    baseHp: 48,
    baseAttack: 14,
    baseDefense: 15,
    lore: 'Beneficial microscopic organism that strengthens tamer immunity and restores internal system balance.',
    evolutionHint: 'Evolve with regular hydration and zero sickness incidents.',
  },
  {
    id: 'probiotic-sage',
    dexNumber: 7,
    name: 'Probiotic Sage',
    lineage: 'microbial',
    stage: 'adultCute',
    type: 'bacteria',
    branch: 'sage',
    aura: 'cyber',
    baseHp: 44,
    baseAttack: 12,
    baseDefense: 19,
    lore: 'A deeply meditative microbial colony that decodes complex encrypted data while hovering in zen stillness.',
    evolutionHint: 'Complete at least 15 minutes of Pomodoro Focus as a baby.',
  },
  {
    id: 'omni-spore',
    dexNumber: 8,
    name: 'Omni Spore Supreme',
    lineage: 'microbial',
    stage: 'omniAscended',
    type: 'bacteria',
    branch: 'hero',
    aura: 'celestial',
    baseHp: 100,
    baseAttack: 34,
    baseDefense: 40,
    lore: 'Living network consciousness. Spreads ethereal spores that repair corrupt memory sectors across galaxies.',
    evolutionHint: 'Ascend Probiotic Sage with max discipline and 30m+ total focus time.',
  },

  // 3. Primordial Dino Lineage (Crimson Egg)
  {
    id: 'tiny-dino',
    dexNumber: 9,
    name: 'Tiny Dino',
    lineage: 'primordial',
    stage: 'baby',
    type: 'dino',
    branch: 'neutral',
    aura: 'magma',
    baseHp: 25,
    baseAttack: 7,
    baseDefense: 4,
    lore: 'An energetic primordial hatchling with volcanic embers crackling inside its sharp toothy maw.',
    evolutionHint: 'Hatched from Crimson Dragon Blood egg.',
  },
  {
    id: 'shadow-rex',
    dexNumber: 10,
    name: 'Shadow Dino',
    lineage: 'primordial',
    stage: 'adultEvil',
    type: 'dino',
    branch: 'shadow',
    aura: 'void',
    baseHp: 45,
    baseAttack: 25,
    baseDefense: 8,
    lore: 'Corrupted by glitch feedback and unattended waste. Its terrifying roar distorts audio buffers.',
    evolutionHint: 'Accumulate 3+ care mistakes or let waste persist.',
  },
  {
    id: 'magma-wyrm',
    dexNumber: 11,
    name: 'Magma Wyrm',
    lineage: 'primordial',
    stage: 'adultCute',
    type: 'wyrm',
    branch: 'titan',
    aura: 'magma',
    baseHp: 55,
    baseAttack: 22,
    baseDefense: 14,
    lore: 'A fiercely loyal prehistoric serpent that bathes in overclocked CPU heat-sinks and breathes solar flame.',
    evolutionHint: 'Evolve with high battle wins and disciplined feeding.',
  },
  {
    id: 'abyssal-rex',
    dexNumber: 12,
    name: 'Abyssal Dino',
    lineage: 'primordial',
    stage: 'megaShadow',
    type: 'dino',
    branch: 'shadow',
    aura: 'void',
    baseHp: 85,
    baseAttack: 53,
    baseDefense: 19,
    lore: 'A cataclysmic apex predator from the void partition. Devours corrupt registry tables whole.',
    evolutionHint: 'Ascend Shadow Dino with 4+ care mistakes.',
  },
  {
    id: 'obsidian-behemoth',
    dexNumber: 13,
    name: 'Obsidian Behemoth',
    lineage: 'primordial',
    stage: 'abyssalApex',
    type: 'dino',
    branch: 'titan',
    aura: 'magma',
    baseHp: 110,
    baseAttack: 48,
    baseDefense: 35,
    lore: 'An indestructible walking volcano whose footsteps trigger earthquakes across virtual RAM.',
    evolutionHint: 'Attain Level 10 and 10+ Colosseum battle victories.',
  },

  // 4. Android / Cyber Lineage (Silver Egg)
  {
    id: 'glitch-bot',
    dexNumber: 14,
    name: 'Glitch Bot',
    lineage: 'android',
    stage: 'baby',
    type: 'glitchbot',
    branch: 'neutral',
    aura: 'cyber',
    baseHp: 24,
    baseAttack: 6,
    baseDefense: 5,
    lore: 'A chirping mechanical sprite assembled from recycled firmware microchips and glowing copper diodes.',
    evolutionHint: 'Hatched from Silver Metallic egg.',
  },
  {
    id: 'cyber-snuffler',
    dexNumber: 15,
    name: 'Cyber Snuffler',
    lineage: 'android',
    stage: 'cyberMecha',
    type: 'snuffler',
    branch: 'cyber',
    aura: 'cyber',
    baseHp: 50,
    baseAttack: 21,
    baseDefense: 12,
    lore: 'Equipped with pneumatic treads and precision radar antennas. Sniffs out corrupted files and virus nodes.',
    evolutionHint: 'Win 2+ Colosseum battles or reach Level 5 as a baby.',
  },
  {
    id: 'omni-mecha',
    dexNumber: 16,
    name: 'Omni Mecha Snuffler',
    lineage: 'android',
    stage: 'cyberMecha',
    type: 'snuffler',
    branch: 'cyber',
    aura: 'cyber',
    baseHp: 95,
    baseAttack: 49,
    baseDefense: 32,
    lore: 'Heavily augmented artillery platform fitted with dual rail cannons and a titanium alloy chassis.',
    evolutionHint: 'Ascend Cyber Snuffler with 5+ battle victories.',
  },

  // 5. Celestial / Solar Lineage (Yellow Egg)
  {
    id: 'tiny-sunfish',
    dexNumber: 17,
    name: 'Tiny Sunfish',
    lineage: 'celestial',
    stage: 'baby',
    type: 'sunfish',
    branch: 'neutral',
    aura: 'celestial',
    baseHp: 21,
    baseAttack: 5,
    baseDefense: 5,
    lore: 'A radiant golden hatchling that drifts on solar winds, emitting warmth and gentle chimes.',
    evolutionHint: 'Hatched from Solar Gold egg.',
  },
  {
    id: 'solar-sunfish',
    dexNumber: 18,
    name: 'Solar Sunfish',
    lineage: 'celestial',
    stage: 'adultCute',
    type: 'sunfish',
    branch: 'hero',
    aura: 'celestial',
    baseHp: 46,
    baseAttack: 15,
    baseDefense: 16,
    lore: 'Harnesses pure photon energy across its luminous dorsal sails, illuminating dark corners of the device.',
    evolutionHint: 'Evolve with high discipline and attentive feeding.',
  },
  {
    id: 'seraphim-koi',
    dexNumber: 19,
    name: 'Seraphim Koi',
    lineage: 'celestial',
    stage: 'megaHero',
    type: 'seraph',
    branch: 'hero',
    aura: 'celestial',
    baseHp: 92,
    baseAttack: 36,
    baseDefense: 38,
    lore: 'Ethereal celestial being with six radiant wings of woven light. Inspires peace and clarity in its tamer.',
    evolutionHint: 'Ascend Solar Sunfish with Discipline >= 80 and 20m+ Focus.',
  },

  // 6. Botanical / Flora Lineage (Emerald Egg)
  {
    id: 'seedling',
    dexNumber: 20,
    name: 'Digital Seedling',
    lineage: 'botanical',
    stage: 'baby',
    type: 'seedling',
    branch: 'neutral',
    aura: 'nature',
    baseHp: 23,
    baseAttack: 4,
    baseDefense: 6,
    lore: 'A sprouting digital shoot rooted in pure memory logic. Thrives when nourished with clean water.',
    evolutionHint: 'Hatched from Emerald Jade egg.',
  },
  {
    id: 'digital-bonsai',
    dexNumber: 21,
    name: 'Digital Bonsai',
    lineage: 'botanical',
    stage: 'adultCute',
    type: 'seedling',
    branch: 'nature',
    aura: 'nature',
    baseHp: 52,
    baseAttack: 14,
    baseDefense: 20,
    lore: 'Carefully pruned living code that blossoms with seasonal pixel flora, purifying device background memory.',
    evolutionHint: 'Log 6 Hydro-Bytes and perform 2 desk stretches as a baby.',
  },
  {
    id: 'yggdrasil-ancient',
    dexNumber: 22,
    name: 'Yggdrasil Ancient',
    lineage: 'botanical',
    stage: 'botanicAncient',
    type: 'seedling',
    branch: 'nature',
    aura: 'nature',
    baseHp: 105,
    baseAttack: 32,
    baseDefense: 45,
    lore: 'Colossal World Tree consciousness whose roots span across the network, connecting all tamer devices.',
    evolutionHint: 'Ascend Digital Bonsai with 100% cleanliness and perfect daily streak.',
  },

  // 7. Void / Glitch Lineage (Obsidian Egg)
  {
    id: 'shadow-mite',
    dexNumber: 23,
    name: 'Shadow Mite',
    lineage: 'void',
    stage: 'baby',
    type: 'shadowmite',
    branch: 'neutral',
    aura: 'void',
    baseHp: 19,
    baseAttack: 8,
    baseDefense: 3,
    lore: 'A mischievous anomaly born from unhandled exceptions. Cloaked in dark void static and shadowy mist.',
    evolutionHint: 'Hatched from Obsidian Void egg.',
  },
  {
    id: 'glitch-phantom',
    dexNumber: 24,
    name: 'Glitch Phantom',
    lineage: 'void',
    stage: 'adultEvil',
    type: 'shadowmite',
    branch: 'shadow',
    aura: 'void',
    baseHp: 42,
    baseAttack: 27,
    baseDefense: 7,
    lore: 'Flickers between physical memory addresses at will. Unpredictable and wildly aggressive in combat.',
    evolutionHint: 'Evolve with high care mistakes or erratic feeding.',
  },
  {
    id: 'abyssal-anomaly',
    dexNumber: 25,
    name: 'Abyssal Anomaly Zero',
    lineage: 'void',
    stage: 'abyssalApex',
    type: 'shadowmite',
    branch: 'shadow',
    aura: 'void',
    baseHp: 88,
    baseAttack: 58,
    baseDefense: 15,
    lore: 'The ultimate glitch paradox. Bends LCD scanlines and emits low-frequency static hums of pure chaos.',
    evolutionHint: 'Ascend Glitch Phantom with peak care mistakes and high battle experience.',
  },
];

export function getSpeciesById(id: string): SpeciesEntry | undefined {
  return BYTE_DEX_SPECIES.find((s) => s.id === id);
}

export function getAllSpecies(): SpeciesEntry[] {
  return BYTE_DEX_SPECIES;
}

export function getSpeciesByLineage(lineage: string): SpeciesEntry[] {
  return BYTE_DEX_SPECIES.filter((s) => s.lineage === lineage);
}

export function checkEvolutionReadiness(pet: PetModel): EvolutionReadiness {
  if (pet.stage === 'egg') {
    return { canEvolve: true };
  }

  const level = pet.stats.level ?? 1;
  const battlesWon = pet.stats.battlesWon ?? 0;
  const focusMinutes = pet.stats.focusMinutes ?? 0;
  const livedMs = pet.stats.timers.lived ?? 0;

  if (pet.stage === 'baby') {
    const hasProgress = level >= 2 || battlesWon >= 1 || focusMinutes >= 5 || livedMs >= 120000;
    if (!hasProgress) {
      return {
        canEvolve: false,
        reason: 'Baby is still growing! (Train to Level 2, win 1 Battle, or complete a 5m Focus sprint)',
      };
    }
    return { canEvolve: true };
  }

  if (pet.stage === 'adultCute' || pet.stage === 'adultEvil' || pet.stage === 'cyberMecha') {
    const hasProgress = level >= 4 && (battlesWon >= 3 || focusMinutes >= 15 || livedMs >= 300000);
    if (!hasProgress) {
      return {
        canEvolve: false,
        reason: 'Adult must train further for Mega Ascension! (Reach Level 4 and win 3 Battles or 15m Focus)',
      };
    }
    return { canEvolve: true };
  }

  return {
    canEvolve: false,
    reason: `${pet.name} has attained apex form! Ascend to Hall of Fame in the Lineage Shrine.`,
  };
}

export function evaluateEvolution(pet: PetModel): EvolutionResult {
  const discipline = pet.stats.discipline ?? 50;
  const mistakes = pet.stats.careMistakes ?? 0;
  const battlesWon = pet.stats.battlesWon ?? 0;
  const level = pet.stats.level ?? 1;
  const focusMinutes = pet.stats.focusMinutes ?? 0;

  // 1. Egg -> Baby
  if (pet.stage === 'egg') {
    let babyName = 'Cute Tadpole';
    let babyType: PetType = 'tadpole';
    let speciesId = 'cute-tadpole';
    let aura: VisualAuraType = 'bioluminescent';

    if (pet.eggType === 'egg-green') {
      babyName = 'Baby Germ';
      babyType = 'bacteria';
      speciesId = 'baby-germ';
      aura = 'nature';
    } else if (pet.eggType === 'egg-yellow') {
      babyName = 'Tiny Sunfish';
      babyType = 'sunfish';
      speciesId = 'tiny-sunfish';
      aura = 'celestial';
    } else if (pet.eggType === 'egg-crimson') {
      babyName = 'Tiny Dino';
      babyType = 'dino';
      speciesId = 'tiny-dino';
      aura = 'magma';
    } else if (pet.eggType === 'egg-silver') {
      babyName = 'Glitch Bot';
      babyType = 'glitchbot';
      speciesId = 'glitch-bot';
      aura = 'cyber';
    } else if (pet.eggType === 'egg-emerald') {
      babyName = 'Digital Seedling';
      babyType = 'seedling';
      speciesId = 'seedling';
      aura = 'nature';
    } else if (pet.eggType === 'egg-obsidian') {
      babyName = 'Shadow Mite';
      babyType = 'shadowmite';
      speciesId = 'shadow-mite';
      aura = 'void';
    }

    return {
      nextStage: 'baby',
      nextName: babyName,
      nextType: babyType,
      branch: 'neutral',
      aura,
      speciesId,
      bonusHp: 10,
      bonusAttack: 3,
      bonusDefense: 2,
      evolutionMessage: `${babyName} hatched from the shell!`,
    };
  }

  // 2. Baby -> Adult
  if (pet.stage === 'baby') {
    // A. Hero Branch: High discipline & attentive care (0-1 care mistakes)
    if (discipline >= 60 && mistakes <= 1) {
      const heroName =
        pet.type === 'tadpole'
          ? 'Radiant Frog'
          : pet.type === 'bacteria'
          ? 'Pure Probiotic'
          : pet.type === 'dino'
          ? 'Magma Wyrm'
          : pet.type === 'seedling'
          ? 'Digital Bonsai'
          : 'Solar Sunfish';

      const heroSpecies =
        pet.type === 'tadpole'
          ? 'radiant-frog'
          : pet.type === 'bacteria'
          ? 'pure-probiotic'
          : pet.type === 'dino'
          ? 'magma-wyrm'
          : pet.type === 'seedling'
          ? 'digital-bonsai'
          : 'solar-sunfish';

      const aura: VisualAuraType = pet.type === 'dino' ? 'magma' : pet.type === 'seedling' ? 'nature' : 'bioluminescent';

      return {
        nextStage: 'adultCute',
        nextName: heroName,
        nextType: pet.type,
        branch: 'hero',
        aura,
        speciesId: heroSpecies,
        bonusHp: 25,
        bonusAttack: 8,
        bonusDefense: 10,
        evolutionMessage: `High discipline guided ${pet.name} to the HERO path!`,
      };
    }

    // B. Sage Branch: Deep cognitive flow & high Pomodoro focus sprints
    if (focusMinutes >= 15 && discipline >= 50) {
      return {
        nextStage: 'adultCute',
        nextName: pet.type === 'bacteria' ? 'Probiotic Sage' : `Psionic ${pet.name}`,
        nextType: pet.type,
        branch: 'sage',
        aura: 'cyber',
        speciesId: pet.type === 'bacteria' ? 'probiotic-sage' : 'probiotic-sage',
        bonusHp: 22,
        bonusAttack: 7,
        bonusDefense: 15,
        evolutionMessage: `Deep focus unlocked the SAGE path for ${pet.name}!`,
      };
    }

    // C. Cyber / Combat Branch: High battle experience or high level
    if (battlesWon >= 2 || level >= 5) {
      return {
        nextStage: 'cyberMecha',
        nextName: `Cyber ${pet.name}`,
        nextType: 'snuffler',
        branch: 'cyber',
        aura: 'cyber',
        speciesId: 'cyber-snuffler',
        bonusHp: 30,
        bonusAttack: 15,
        bonusDefense: 8,
        evolutionMessage: `Combat valor sparked CYBER evolution into Cyber Snuffler!`,
      };
    }

    // D. Shadow Branch: Neglected care or excessive mistakes (3+ mistakes)
    if (mistakes >= 3) {
      return {
        nextStage: 'adultEvil',
        nextName: `Shadow ${pet.name}`,
        nextType: 'dino',
        branch: 'shadow',
        aura: 'void',
        speciesId: 'shadow-rex',
        bonusHp: 20,
        bonusAttack: 18,
        bonusDefense: 4,
        evolutionMessage: `Dark glitches mutated ${pet.name} into SHADOW Dino!`,
      };
    }

    // E. Neutral Branch: Balanced growth
    return {
      nextStage: 'adultCute',
      nextName: `Mega ${pet.name}`,
      nextType: pet.type,
      branch: 'neutral',
      aura: 'bioluminescent',
      speciesId: 'radiant-frog',
      bonusHp: 20,
      bonusAttack: 10,
      bonusDefense: 6,
      evolutionMessage: `${pet.name} grew into a loyal adult form!`,
    };
  }

  // 3. Adult -> Mega / Ascended
  if (pet.stage === 'adultCute' || pet.stage === 'cyberMecha' || pet.stage === 'adultEvil') {
    // Celestial / Saint Ascension
    if (pet.stats.branchType === 'hero' || discipline >= 75) {
      const nextName = `Saint ${pet.name}`;
      const speciesId = pet.type === 'sunfish' || pet.type === 'seraph' ? 'seraphim-koi' : 'saint-rana';
      return {
        nextStage: 'megaHero',
        nextName,
        nextType: pet.type,
        branch: 'hero',
        aura: 'celestial',
        speciesId,
        bonusHp: 50,
        bonusAttack: 20,
        bonusDefense: 25,
        evolutionMessage: `Celestial alignment! ${pet.name} ascended to MEGA HERO!`,
      };
    }

    // Void / Abyssal Awakening
    if (pet.stats.branchType === 'shadow' || mistakes >= 4) {
      return {
        nextStage: 'megaShadow',
        nextName: `Abyssal ${pet.name}`,
        nextType: 'dino',
        branch: 'shadow',
        aura: 'void',
        speciesId: 'abyssal-rex',
        bonusHp: 40,
        bonusAttack: 35,
        bonusDefense: 15,
        evolutionMessage: `Void resonance! ${pet.name} awakened as MEGA SHADOW!`,
      };
    }

    // Titan / Primordial Ascension
    if (pet.stats.branchType === 'titan' || battlesWon >= 8) {
      return {
        nextStage: 'abyssalApex',
        nextName: `Titan ${pet.name}`,
        nextType: pet.type === 'dino' ? 'dino' : 'golem',
        branch: 'titan',
        aura: 'magma',
        speciesId: 'obsidian-behemoth',
        bonusHp: 55,
        bonusAttack: 30,
        bonusDefense: 25,
        evolutionMessage: `Tectonic eruption! ${pet.name} evolved into TITAN BEHEMOTH!`,
      };
    }

    // Omni Mecha Overclock
    return {
      nextStage: 'cyberMecha',
      nextName: `Omni ${pet.name}`,
      nextType: 'snuffler',
      branch: 'cyber',
      aura: 'cyber',
      speciesId: 'omni-mecha',
      bonusHp: 45,
      bonusAttack: 28,
      bonusDefense: 20,
      evolutionMessage: `Overclocked matrix! ${pet.name} morphed into OMNI MECHA!`,
    };
  }

  // Fallback
  return {
    nextStage: 'adultCute',
    nextName: `Ancient ${pet.name}`,
    nextType: pet.type,
    branch: 'neutral',
    aura: 'bioluminescent',
    speciesId: 'radiant-frog',
    bonusHp: 20,
    bonusAttack: 10,
    bonusDefense: 10,
    evolutionMessage: `${pet.name} attained ancient enlightenment!`,
  };
}
