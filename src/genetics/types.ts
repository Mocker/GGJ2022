export type GeneticMutationTrait =
  | 'Bioluminescent'
  | 'Titan'
  | 'Armored'
  | 'Cybernetic'
  | 'Pyre'
  | 'Zen'
  | 'GlitchShift';

export interface FamilyTree {
  lineageId: string;
  generation: number;
  parents: {
    sire?: string; // Parent A (ID or Name)
    dam?: string;  // Parent B (ID or Name)
  };
  ancestorNames: string[];
  mutations: GeneticMutationTrait[];
}

export interface ChromosomeLoci {
  // Physical / Cosmetic
  colorHue: number;          // 0–360 hue degrees
  auraTint: number;          // 0xRRGGBB hex color tint
  scaleModifier: number;     // 0.85 to 1.25 scale
  patternDensity: number;    // 0 to 100

  // Metabolic
  metabolicEfficiency: number; // 0.8 to 1.2 (slower hunger decay)
  energyRecoveryRate: number;  // 0.8 to 1.3
  sicknessResistance: number;  // 0 to 100

  // Cognitive / Behavior
  focusAffinity: number;       // multiplier on focus sprint rewards
  disciplineTendency: number;  // baseline discipline adherence
  curiosityGene: number;       // wander frequency

  // Combat Individual Values (0 to 31 like classic RPG genetics)
  ivHp: number;
  ivAttack: number;
  ivDefense: number;
  ivSpeed: number;
}

export interface PetGenotype {
  dnaHash: string; // e.g. "DNA-7F2A-B904-C811"
  generation: number;
  familyTree: FamilyTree;
  chromosomes: ChromosomeLoci;
  traits: GeneticMutationTrait[];
}

export interface PhenotypeConfig {
  tintHex: number;
  scaleMultiplier: number;
  ivTotal: number;
  ivGrade: 'S' | 'A' | 'B' | 'C';
  primaryTraitBadge: string;
  summary: string;
}
