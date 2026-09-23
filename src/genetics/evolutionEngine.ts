import { PetGenotype, ChromosomeLoci, GeneticMutationTrait, PhenotypeConfig } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateDnaHash(): string {
  const segment = () => Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `DNA-${segment()}-${segment()}-${segment()}`;
}

export function hueToHex(hueDegrees: number): number {
  // Convert HSV (H, 0.45, 0.95) to Hex for pleasing pet pastel/cyber tints
  const h = (hueDegrees % 360) / 60;
  const s = 0.35;
  const v = 0.98;
  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 1) { r = c; g = x; }
  else if (h >= 1 && h < 2) { r = x; g = c; }
  else if (h >= 2 && h < 3) { g = c; b = x; }
  else if (h >= 3 && h < 4) { g = x; b = c; }
  else if (h >= 4 && h < 5) { r = x; b = c; }
  else { r = c; b = x; }

  const ir = Math.round((r + m) * 255);
  const ig = Math.round((g + m) * 255);
  const ib = Math.round((b + m) * 255);
  return (ir << 16) | (ig << 8) | ib;
}

const ALL_TRAITS: GeneticMutationTrait[] = [
  'Bioluminescent',
  'Titan',
  'Armored',
  'Cybernetic',
  'Pyre',
  'Zen',
  'GlitchShift',
];

export function generateRandomGenome(generation = 1, parentName?: string): PetGenotype {
  const hue = randomInt(0, 360);
  const traits: GeneticMutationTrait[] = [];
  if (Math.random() < 0.25) {
    traits.push(ALL_TRAITS[randomInt(0, ALL_TRAITS.length - 1)]);
  }

  const chromosomes: ChromosomeLoci = {
    colorHue: hue,
    auraTint: hueToHex(hue),
    scaleModifier: traits.includes('Titan') ? 1.22 : randomFloat(0.92, 1.12),
    patternDensity: randomInt(10, 90),
    metabolicEfficiency: randomFloat(0.85, 1.15),
    energyRecoveryRate: randomFloat(0.9, 1.2),
    sicknessResistance: randomInt(30, 95),
    focusAffinity: randomFloat(0.9, 1.25),
    disciplineTendency: randomInt(50, 85),
    curiosityGene: randomInt(40, 90),
    ivHp: randomInt(10, 31),
    ivAttack: randomInt(10, 31),
    ivDefense: randomInt(10, 31),
    ivSpeed: randomInt(10, 31),
  };

  return {
    dnaHash: generateDnaHash(),
    generation,
    familyTree: {
      lineageId: `LINEAGE-${Date.now().toString(36).toUpperCase()}`,
      generation,
      parents: { sire: parentName },
      ancestorNames: parentName ? [parentName] : [],
      mutations: [...traits],
    },
    chromosomes,
    traits,
  };
}

export function crossoverGenomes(parentA: PetGenotype, parentB: PetGenotype, mutationRate = 0.12): PetGenotype {
  const nextGen = Math.max(parentA.generation, parentB.generation) + 1;

  // Single-point allele crossover
  const pick = <T>(a: T, b: T): T => (Math.random() > 0.5 ? a : b);

  // Inherited chromosomes with possible mutation drift
  const mutateScalar = (val: number, min: number, max: number, drift: number) => {
    if (Math.random() < mutationRate) {
      const delta = (Math.random() * 2 - 1) * drift;
      return Math.min(max, Math.max(min, val + delta));
    }
    return val;
  };

  const inheritedHue = Math.round(mutateScalar(pick(parentA.chromosomes.colorHue, parentB.chromosomes.colorHue), 0, 360, 40));

  const inheritedTraits = Array.from(new Set([...parentA.traits, ...parentB.traits]));
  // Chance of spontaneous new mutation
  if (Math.random() < mutationRate) {
    const novelTrait = ALL_TRAITS[randomInt(0, ALL_TRAITS.length - 1)];
    if (!inheritedTraits.includes(novelTrait)) {
      inheritedTraits.push(novelTrait);
    }
  }

  const chromosomes: ChromosomeLoci = {
    colorHue: inheritedHue,
    auraTint: hueToHex(inheritedHue),
    scaleModifier: inheritedTraits.includes('Titan') ? 1.22 : mutateScalar(pick(parentA.chromosomes.scaleModifier, parentB.chromosomes.scaleModifier), 0.85, 1.25, 0.05),
    patternDensity: Math.round(mutateScalar(pick(parentA.chromosomes.patternDensity, parentB.chromosomes.patternDensity), 0, 100, 15)),
    metabolicEfficiency: mutateScalar(pick(parentA.chromosomes.metabolicEfficiency, parentB.chromosomes.metabolicEfficiency), 0.8, 1.3, 0.05),
    energyRecoveryRate: mutateScalar(pick(parentA.chromosomes.energyRecoveryRate, parentB.chromosomes.energyRecoveryRate), 0.8, 1.3, 0.05),
    sicknessResistance: Math.round(mutateScalar(pick(parentA.chromosomes.sicknessResistance, parentB.chromosomes.sicknessResistance), 20, 100, 8)),
    focusAffinity: mutateScalar(pick(parentA.chromosomes.focusAffinity, parentB.chromosomes.focusAffinity), 0.85, 1.4, 0.06),
    disciplineTendency: Math.round(mutateScalar(pick(parentA.chromosomes.disciplineTendency, parentB.chromosomes.disciplineTendency), 40, 95, 6)),
    curiosityGene: Math.round(mutateScalar(pick(parentA.chromosomes.curiosityGene, parentB.chromosomes.curiosityGene), 30, 95, 8)),
    ivHp: Math.round(mutateScalar(pick(parentA.chromosomes.ivHp, parentB.chromosomes.ivHp), 0, 31, 3)),
    ivAttack: Math.round(mutateScalar(pick(parentA.chromosomes.ivAttack, parentB.chromosomes.ivAttack), 0, 31, 3)),
    ivDefense: Math.round(mutateScalar(pick(parentA.chromosomes.ivDefense, parentB.chromosomes.ivDefense), 0, 31, 3)),
    ivSpeed: Math.round(mutateScalar(pick(parentA.chromosomes.ivSpeed, parentB.chromosomes.ivSpeed), 0, 31, 3)),
  };

  const ancestors = Array.from(new Set([...parentA.familyTree.ancestorNames, ...parentB.familyTree.ancestorNames]));

  return {
    dnaHash: generateDnaHash(),
    generation: nextGen,
    familyTree: {
      lineageId: parentA.familyTree.lineageId || parentB.familyTree.lineageId,
      generation: nextGen,
      parents: {
        sire: parentA.dnaHash,
        dam: parentB.dnaHash,
      },
      ancestorNames: ancestors,
      mutations: inheritedTraits,
    },
    chromosomes,
    traits: inheritedTraits,
  };
}

export function expressPhenotype(genome: PetGenotype): PhenotypeConfig {
  const ivTotal = genome.chromosomes.ivHp + genome.chromosomes.ivAttack + genome.chromosomes.ivDefense + genome.chromosomes.ivSpeed;
  let ivGrade: 'S' | 'A' | 'B' | 'C' = 'C';
  if (ivTotal >= 100) ivGrade = 'S';
  else if (ivTotal >= 80) ivGrade = 'A';
  else if (ivTotal >= 60) ivGrade = 'B';

  const primaryTrait = genome.traits.length > 0 ? genome.traits[0] : 'Pure';

  return {
    tintHex: genome.chromosomes.auraTint,
    scaleMultiplier: genome.chromosomes.scaleModifier,
    ivTotal,
    ivGrade,
    primaryTraitBadge: primaryTrait,
    summary: `GEN ${genome.generation} [${ivGrade}-Rank IV: ${ivTotal}/124] ${primaryTrait}`,
  };
}
