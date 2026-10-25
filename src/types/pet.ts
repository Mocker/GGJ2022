import type { PetGenotype } from '../genetics/types';

export type PetType =
  | 'tadpole'
  | 'bacteria'
  | 'dino'
  | 'snuffler'
  | 'sunfish'
  | 'seedling'
  | 'glitchbot'
  | 'shadowmite'
  | 'wyrm'
  | 'golem'
  | 'seraph';

export type EggType =
  | 'egg-blue'
  | 'egg-green'
  | 'egg-yellow'
  | 'egg-crimson'
  | 'egg-silver'
  | 'egg-emerald'
  | 'egg-obsidian';

export type PetStage =
  | 'egg'
  | 'baby'
  | 'adultCute'
  | 'adultEvil'
  | 'cyberMecha'
  | 'megaHero'
  | 'megaShadow'
  | 'omniAscended'
  | 'botanicAncient'
  | 'abyssalApex';

export type BranchType = 'hero' | 'shadow' | 'cyber' | 'neutral' | 'sage' | 'nature' | 'titan';

export type VisualAuraType = 'none' | 'celestial' | 'cyber' | 'void' | 'bioluminescent' | 'nature' | 'magma';

export interface SpeciesEntry {
  id: string;
  dexNumber: number;
  name: string;
  lineage: 'aquatic' | 'microbial' | 'celestial' | 'primordial' | 'android' | 'botanical' | 'void';
  stage: PetStage;
  type: PetType;
  branch: BranchType;
  aura: VisualAuraType;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  lore: string;
  evolutionHint: string;
}

export interface PetStats {
  energy: { min: number; current: number; max: number };
  hunger: { min: number; current: number; max: number }; // 0 = starving, 100 = full
  happiness: { min: number; current: number; max: number }; // 0 = depressed, 100 = ecstatic
  cleanliness: { min: number; current: number; max: number }; // 0 = filthy, 100 = sparkling
  discipline: number; // 0 = rebellious, 100 = perfectly disciplined
  careMistakes: number;
  poopCount: number;
  generation: number;
  battlesWon: number;
  battlesTotal: number;
  focusMinutes: number;
  focusTokens: number;
  branchType?: BranchType;
  timers: {
    lived: number; // ms lived
    lastFed?: number;
    lastSlept?: number;
  };
  msLeftToEvolve?: number;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

export interface PetModel {
  id: string;
  name: string;
  type: PetType;
  eggType: EggType;
  stage: PetStage;
  stats: PetStats;
  status: 'idle' | 'sleeping' | 'hungry' | 'sick' | 'poopy' | 'happy' | 'meditating';
  isSleeping: boolean;
  genome?: PetGenotype;
  aura?: VisualAuraType;
  speciesId?: string;
  createdAt: number;
}

export interface PetStageConfig {
  stage: PetStage;
  name: string;
  displayName: string;
  className: string;
  type: PetType;
  evolveDots: number;
}

export interface PetTypeConfig {
  images: Record<string, string>;
  sounds: Record<string, string>;
  stages: Record<string, PetStageConfig>;
}
