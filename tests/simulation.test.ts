import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateEvolution } from '../src/data/evolutionTree';
import { PetModel } from '../src/types/pet';
import { StorageService } from '../src/services/storage';

function createMockPet(overrides: Partial<PetModel> = {}): PetModel {
  return {
    id: 'test_pet_1',
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

describe('Branching Evolution Matrix', () => {
  it('evolves egg to baby tadpole for blue egg', () => {
    const egg = createMockPet({ stage: 'egg', eggType: 'egg-blue' });
    const evo = evaluateEvolution(egg);
    expect(evo.nextStage).toBe('baby');
    expect(evo.nextName).toBe('Cute Tadpole');
    expect(evo.nextType).toBe('tadpole');
  });

  it('evolves egg to baby germ for green egg', () => {
    const egg = createMockPet({ stage: 'egg', eggType: 'egg-green' });
    const evo = evaluateEvolution(egg);
    expect(evo.nextStage).toBe('baby');
    expect(evo.nextName).toBe('Baby Germ');
    expect(evo.nextType).toBe('bacteria');
  });

  it('evolves baby to HERO branch when discipline is high and care mistakes are low', () => {
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
    expect(evo.nextStage).toBe('adultCute');
    expect(evo.nextName).toBe('Radiant Frog');
    expect(evo.bonusHp).toBeGreaterThanOrEqual(25);
  });

  it('evolves baby to CYBER branch when battle count is high', () => {
    const fighterBaby = createMockPet({
      stage: 'baby',
      type: 'tadpole',
      stats: {
        ...createMockPet().stats,
        discipline: 50,
        careMistakes: 1,
        battlesWon: 4,
      },
    });
    const evo = evaluateEvolution(fighterBaby);
    expect(evo.branch).toBe('cyber');
    expect(evo.nextStage).toBe('cyberMecha');
    expect(evo.bonusAttack).toBeGreaterThanOrEqual(15);
  });

  it('evolves baby to SHADOW branch when neglected with care mistakes', () => {
    const neglectedBaby = createMockPet({
      stage: 'baby',
      type: 'tadpole',
      stats: {
        ...createMockPet().stats,
        discipline: 30,
        careMistakes: 4,
        battlesWon: 0,
      },
    });
    const evo = evaluateEvolution(neglectedBaby);
    expect(evo.branch).toBe('shadow');
    expect(evo.nextStage).toBe('adultEvil');
    expect(evo.nextType).toBe('dino');
  });

  it('ascends adult to MEGA HERO when discipline reaches peak celestial level', () => {
    const adult = createMockPet({
      stage: 'adultCute',
      name: 'Radiant Frog',
      stats: {
        ...createMockPet().stats,
        discipline: 90,
        branchType: 'hero',
      },
    });
    const evo = evaluateEvolution(adult);
    expect(evo.branch).toBe('hero');
    expect(evo.nextStage).toBe('megaHero');
    expect(evo.nextName).toContain('Saint Radiant Frog');
  });
});

describe('StorageService & Lineage Mechanics', () => {
  let storage: StorageService;

  beforeEach(() => {
    // Mock localStorage safely for node environment
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
    storage.createDefaultProfile('TestTamer');
  });

  it('creates a profile with complete v2 simulation fields', () => {
    const pet = storage.getCurrentPet();
    expect(pet).not.toBeNull();
    expect(pet?.stats.discipline).toBe(70);
    expect(pet?.stats.careMistakes).toBe(0);
    expect(pet?.stats.poopCount).toBe(0);
    expect(pet?.stats.generation).toBe(1);
    expect(pet?.isSleeping).toBe(false);
  });

  it('toggles sleep mode properly', () => {
    const isSleeping = storage.toggleSleep();
    expect(isSleeping).toBe(true);
    expect(storage.getCurrentPet()?.isSleeping).toBe(true);
    expect(storage.getCurrentPet()?.status).toBe('sleeping');

    const isAwake = storage.toggleSleep();
    expect(isAwake).toBe(false);
    expect(storage.getCurrentPet()?.isSleeping).toBe(false);
  });

  it('handles poop addition and clean flush', () => {
    storage.updateCurrentPet((p) => {
      p.stage = 'baby';
    });

    storage.addPoop();
    storage.addPoop();
    expect(storage.getCurrentPet()?.stats.poopCount).toBe(2);

    const cleaned = storage.cleanPoop();
    expect(cleaned).toBe(2);
    expect(storage.getCurrentPet()?.stats.poopCount).toBe(0);
    expect(storage.getCurrentPet()?.stats.cleanliness.current).toBe(100);
  });

  it('awards focus sessions properly (GOAL-002 Cognitive Well-Being)', () => {
    const initialMoney = storage.getProfile().money;
    storage.addFocusSession(25, 5); // 25 min sprint, 5 tokens

    const pet = storage.getCurrentPet();
    expect(pet?.stats.focusMinutes).toBe(25);
    expect(pet?.stats.focusTokens).toBe(5);
    expect(pet?.stats.discipline).toBeGreaterThan(70);
    expect(storage.getProfile().money).toBe(initialMoney + 10);
  });

  it('retires adult pet to Hall of Fame and births next generation heirloom egg', () => {
    storage.updateCurrentPet((p) => {
      p.stage = 'adultCute';
      p.name = 'Old Champion';
      p.stats.level = 8;
      p.stats.battlesWon = 12;
    });

    const entry = storage.retirePetToHallOfFame();
    expect(entry).not.toBeNull();
    expect(entry?.name).toBe('Old Champion');
    expect(entry?.generation).toBe(1);

    const newPet = storage.getCurrentPet();
    expect(newPet?.stage).toBe('egg');
    expect(newPet?.stats.generation).toBe(2);
    expect(newPet?.stats.discipline).toBe(80); // Heirloom bonus
    expect(newPet?.stats.hp).toBe(25); // Heirloom HP bonus
  });
});
