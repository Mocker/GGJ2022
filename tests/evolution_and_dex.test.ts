import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluateEvolution,
  checkEvolutionReadiness,
  BYTE_DEX_SPECIES,
  getSpeciesById,
  getSpeciesByLineage,
} from '../src/data/evolutionTree';
import { PetModel, PetType, EggType } from '../src/types/pet';
import { StorageService } from '../src/services/storage';

function createMockPet(overrides: Partial<PetModel> = {}): PetModel {
  return {
    id: 'test_pet_dex',
    name: 'Test Pet',
    type: 'tadpole',
    eggType: 'egg-blue',
    stage: 'baby',
    stats: {
      energy: { min: 0, current: 80, max: 100 },
      hunger: { min: 0, current: 80, max: 100 },
      happiness: { min: 0, current: 70, max: 100 },
      cleanliness: { min: 0, current: 90, max: 100 },
      discipline: 70,
      careMistakes: 0,
      poopCount: 0,
      generation: 1,
      battlesWon: 0,
      battlesTotal: 0,
      focusMinutes: 0,
      focusTokens: 0,
      timers: { lived: 10000 },
      level: 1,
      hp: 20,
      maxHp: 20,
      attack: 5,
      defense: 3,
    },
    status: 'idle',
    isSleeping: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('Tamer Byte-Dex Registry & Lineages', () => {
  it('contains 25 registered canonical species across 7 lineages', () => {
    expect(BYTE_DEX_SPECIES.length).toBeGreaterThanOrEqual(25);

    // Verify all dex numbers are unique and positive
    const dexNums = BYTE_DEX_SPECIES.map((s) => s.dexNumber);
    const uniqueNums = new Set(dexNums);
    expect(uniqueNums.size).toBe(dexNums.length);

    // Verify all 7 lineages are present
    const lineages = new Set(BYTE_DEX_SPECIES.map((s) => s.lineage));
    expect(lineages.has('aquatic')).toBe(true);
    expect(lineages.has('microbial')).toBe(true);
    expect(lineages.has('primordial')).toBe(true);
    expect(lineages.has('android')).toBe(true);
    expect(lineages.has('celestial')).toBe(true);
    expect(lineages.has('botanical')).toBe(true);
    expect(lineages.has('void')).toBe(true);
  });

  it('retrieves species by ID and by lineage accurately', () => {
    const rana = getSpeciesById('saint-rana');
    expect(rana).toBeDefined();
    expect(rana?.name).toBe('Saint Radiant Frog');
    expect(rana?.aura).toBe('celestial');

    const primordials = getSpeciesByLineage('primordial');
    expect(primordials.length).toBeGreaterThanOrEqual(4);
    expect(primordials.some((p) => p.id === 'shadow-rex')).toBe(true);
  });
});

describe('Multi-Variable Evolution Matrix', () => {
  it('hatches 7 distinct ancestral egg archetypes into their respective baby types', () => {
    const eggs: { eggType: EggType; expectedType: PetType; expectedName: string }[] = [
      { eggType: 'egg-blue', expectedType: 'tadpole', expectedName: 'Cute Tadpole' },
      { eggType: 'egg-green', expectedType: 'bacteria', expectedName: 'Baby Germ' },
      { eggType: 'egg-yellow', expectedType: 'sunfish', expectedName: 'Tiny Sunfish' },
      { eggType: 'egg-crimson', expectedType: 'dino', expectedName: 'Tiny Dino' },
      { eggType: 'egg-silver', expectedType: 'glitchbot', expectedName: 'Glitch Bot' },
      { eggType: 'egg-emerald', expectedType: 'seedling', expectedName: 'Digital Seedling' },
      { eggType: 'egg-obsidian', expectedType: 'shadowmite', expectedName: 'Shadow Mite' },
    ];

    for (const testEgg of eggs) {
      const pet = createMockPet({ stage: 'egg', eggType: testEgg.eggType });
      const evo = evaluateEvolution(pet);
      expect(evo.nextStage).toBe('baby');
      expect(evo.nextType).toBe(testEgg.expectedType);
      expect(evo.nextName).toBe(testEgg.expectedName);
      expect(evo.speciesId).toBeDefined();
    }
  });

  it('triggers Sage Branch evolution when focus minutes are high', () => {
    const focusedBaby = createMockPet({
      stage: 'baby',
      type: 'bacteria',
      stats: {
        ...createMockPet().stats,
        focusMinutes: 25,
        discipline: 55,
      },
    });

    const evo = evaluateEvolution(focusedBaby);
    expect(evo.branch).toBe('sage');
    expect(evo.nextName).toBe('Probiotic Sage');
    expect(evo.aura).toBe('cyber');
  });

  it('triggers Hero Branch evolution when discipline is high and mistakes are zero', () => {
    const heroBaby = createMockPet({
      stage: 'baby',
      type: 'tadpole',
      stats: {
        ...createMockPet().stats,
        discipline: 85,
        careMistakes: 0,
      },
    });

    const evo = evaluateEvolution(heroBaby);
    expect(evo.branch).toBe('hero');
    expect(evo.nextName).toBe('Radiant Frog');
    expect(evo.aura).toBe('bioluminescent');
  });

  it('triggers Cyber Branch evolution when battles won are high', () => {
    const battleBaby = createMockPet({
      stage: 'baby',
      type: 'tadpole',
      stats: {
        ...createMockPet().stats,
        discipline: 50,
        battlesWon: 3,
      },
    });

    const evo = evaluateEvolution(battleBaby);
    expect(evo.branch).toBe('cyber');
    expect(evo.nextStage).toBe('cyberMecha');
    expect(evo.aura).toBe('cyber');
  });

  it('triggers Shadow Branch evolution when care mistakes are high', () => {
    const neglectedBaby = createMockPet({
      stage: 'baby',
      type: 'tadpole',
      stats: {
        ...createMockPet().stats,
        careMistakes: 3,
        discipline: 30,
      },
    });

    const evo = evaluateEvolution(neglectedBaby);
    expect(evo.branch).toBe('shadow');
    expect(evo.nextStage).toBe('adultEvil');
    expect(evo.nextName).toBe('Shadow Test Pet');
    expect(evo.aura).toBe('void');
  });

  it('ascends to Titan Behemoth when battle victories reach apex level', () => {
    const adult = createMockPet({
      stage: 'adultCute',
      name: 'Magma Rex',
      type: 'dino',
      stats: {
        ...createMockPet().stats,
        battlesWon: 9,
        branchType: 'titan',
      },
    });

    const evo = evaluateEvolution(adult);
    expect(evo.branch).toBe('titan');
    expect(evo.nextStage).toBe('abyssalApex');
    expect(evo.nextName).toContain('Titan');
    expect(evo.aura).toBe('magma');
  });
});

describe('StorageService Byte-Dex Discovery Recording', () => {
  let storage: StorageService;

  beforeEach(() => {
    const store: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
      key: (i: number) => Object.keys(store)[i] || null,
      length: 0,
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });

    storage = StorageService.getInstance();
    storage.createDefaultProfile('DexTamer');
  });

  it('records novel discoveries in the Byte-Dex and tracks encounter frequencies', () => {
    expect(storage.getDiscoveredSpeciesCount()).toBeGreaterThanOrEqual(1);

    // Record new discovery
    const isNew1 = storage.recordByteDexEntry('saint-rana');
    expect(isNew1).toBe(true);
    expect(storage.getByteDex()['saint-rana'].timesEncountered).toBe(1);

    // Record duplicate encounter
    const isNew2 = storage.recordByteDexEntry('saint-rana');
    expect(isNew2).toBe(false);
    expect(storage.getByteDex()['saint-rana'].timesEncountered).toBe(2);

    expect(storage.getDiscoveredSpeciesCount()).toBe(2);
  });
});
