import { PetModel, PetStage, PetType, BranchType } from '../types/pet';

export interface EvolutionResult {
  nextStage: PetStage;
  nextName: string;
  nextType: PetType;
  branch: BranchType;
  bonusHp: number;
  bonusAttack: number;
  bonusDefense: number;
  evolutionMessage: string;
}

export function evaluateEvolution(pet: PetModel): EvolutionResult {
  const discipline = pet.stats.discipline ?? 50;
  const mistakes = pet.stats.careMistakes ?? 0;
  const battlesWon = pet.stats.battlesWon ?? 0;
  const level = pet.stats.level ?? 1;

  // 1. Egg -> Baby
  if (pet.stage === 'egg') {
    let babyName = 'Cute Tadpole';
    let babyType: PetType = 'tadpole';

    if (pet.eggType === 'egg-green') {
      babyName = 'Baby Germ';
      babyType = 'bacteria';
    } else if (pet.eggType === 'egg-yellow') {
      babyName = 'Tiny Sunfish';
      babyType = 'sunfish';
    }

    return {
      nextStage: 'baby',
      nextName: babyName,
      nextType: babyType,
      branch: 'neutral',
      bonusHp: 10,
      bonusAttack: 3,
      bonusDefense: 2,
      evolutionMessage: `${babyName} hatched from the shell!`,
    };
  }

  // 2. Baby -> Adult
  if (pet.stage === 'baby') {
    // Hero Branch: High discipline & attentive care
    if (discipline >= 60 && mistakes <= 1) {
      const heroName = pet.type === 'tadpole' ? 'Radiant Frog' : pet.type === 'bacteria' ? 'Pure Probiotic' : 'Solar Sunfish';
      return {
        nextStage: 'adultCute',
        nextName: heroName,
        nextType: pet.type,
        branch: 'hero',
        bonusHp: 25,
        bonusAttack: 8,
        bonusDefense: 10,
        evolutionMessage: `High discipline guided ${pet.name} to the HERO path!`,
      };
    }

    // Cyber / Combat Branch: High battle experience or high level
    if (battlesWon >= 2 || level >= 5) {
      return {
        nextStage: 'cyberMecha',
        nextName: `Cyber ${pet.name}`,
        nextType: 'snuffler',
        branch: 'cyber',
        bonusHp: 30,
        bonusAttack: 15,
        bonusDefense: 8,
        evolutionMessage: `Combat valor sparked CYBER evolution into Cyber Snuffler!`,
      };
    }

    // Shadow Branch: Neglected care or excessive mistakes
    if (mistakes >= 3) {
      return {
        nextStage: 'adultEvil',
        nextName: `Shadow ${pet.name}`,
        nextType: 'dino',
        branch: 'shadow',
        bonusHp: 20,
        bonusAttack: 18,
        bonusDefense: 4,
        evolutionMessage: `Dark glitches mutated ${pet.name} into SHADOW Dino!`,
      };
    }

    // Neutral Branch: Balanced
    return {
      nextStage: 'adultCute',
      nextName: `Mega ${pet.name}`,
      nextType: pet.type,
      branch: 'neutral',
      bonusHp: 20,
      bonusAttack: 10,
      bonusDefense: 6,
      evolutionMessage: `${pet.name} grew into a loyal adult form!`,
    };
  }

  // 3. Adult -> Mega / Ascended
  if (pet.stage === 'adultCute' || pet.stage === 'cyberMecha' || pet.stage === 'adultEvil') {
    if (pet.stats.branchType === 'hero' || discipline >= 75) {
      return {
        nextStage: 'megaHero',
        nextName: `Saint ${pet.name}`,
        nextType: pet.type,
        branch: 'hero',
        bonusHp: 50,
        bonusAttack: 20,
        bonusDefense: 25,
        evolutionMessage: `Celestial alignment! ${pet.name} ascended to MEGA HERO!`,
      };
    } else if (pet.stats.branchType === 'shadow' || mistakes >= 4) {
      return {
        nextStage: 'megaShadow',
        nextName: `Abyssal ${pet.name}`,
        nextType: 'dino',
        branch: 'shadow',
        bonusHp: 40,
        bonusAttack: 35,
        bonusDefense: 15,
        evolutionMessage: `Void resonance! ${pet.name} awakened as MEGA SHADOW!`,
      };
    } else {
      return {
        nextStage: 'cyberMecha',
        nextName: `Omni ${pet.name}`,
        nextType: 'snuffler',
        branch: 'cyber',
        bonusHp: 45,
        bonusAttack: 28,
        bonusDefense: 20,
        evolutionMessage: `Overclocked matrix! ${pet.name} morphed into OMNI MECHA!`,
      };
    }
  }

  // Fallback
  return {
    nextStage: 'adultCute',
    nextName: `Ancient ${pet.name}`,
    nextType: pet.type,
    branch: 'neutral',
    bonusHp: 20,
    bonusAttack: 10,
    bonusDefense: 10,
    evolutionMessage: `${pet.name} attained ancient enlightenment!`,
  };
}
