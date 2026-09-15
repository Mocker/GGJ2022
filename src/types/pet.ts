export type PetType = 'tadpole' | 'bacteria' | 'dino' | 'snuffler' | 'sunfish';
export type EggType = 'egg-blue' | 'egg-green' | 'egg-yellow';

export type PetStage = 'egg' | 'baby' | 'adultCute' | 'adultEvil';

export interface PetStats {
  energy: { min: number; current: number; max: number };
  hunger: { min: number; current: number; max: number }; // 0 = starving, 100 = full
  happiness: { min: number; current: number; max: number }; // 0 = depressed, 100 = ecstatic
  cleanliness: { min: number; current: number; max: number }; // 0 = filthy, 100 = sparkling
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
  status: 'idle' | 'sleeping' | 'hungry' | 'sick' | 'poopy' | 'happy';
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
