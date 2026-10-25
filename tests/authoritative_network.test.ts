import { describe, it, expect, beforeEach } from 'vitest';
import {
  AuthoritativeServerClient,
  DeterministicCombatResolver,
  PetIntegrityValidator,
  getElementalMultiplier,
  AuthoritativePetState,
} from '../src/services/network/authServerProtocol';
import { PetModel } from '../src/types/pet';

function createMockPetState(overrides: Partial<AuthoritativePetState> = {}): AuthoritativePetState {
  return {
    id: 'pet_auth_01',
    owner: 'TamerOne',
    name: 'Gladiator Sol',
    stage: 'adultCute',
    type: 'tadpole',
    speciesId: 'radiant-frog',
    level: 5,
    hp: 45,
    maxHp: 45,
    attack: 18,
    defense: 12,
    discipline: 80,
    generation: 2,
    battlesWon: 5,
    focusMinutes: 30,
    genomeHash: 'DNA-ABCD-1234',
    ivHp: 24,
    ivAttack: 28,
    ivDefense: 19,
    traits: ['Bioluminescent'],
    syncNonce: 10001,
    timestamp: Date.now(),
    signature: 'SEAL-VALID-MOCK',
    ...overrides,
  };
}

describe('Authoritative Server Protocol & Data Integrity', () => {
  it('validates legitimate pet states within statistical boundaries', () => {
    const pet = createMockPetState();
    const result = PetIntegrityValidator.validatePetState(pet);
    expect(result.valid).toBe(true);
  });

  it('rejects tampered or hacked pet states exceeding stat thresholds', () => {
    // Injected Level 9999
    const hackedLevel = createMockPetState({ level: 9999 });
    expect(PetIntegrityValidator.validatePetState(hackedLevel).valid).toBe(false);

    // Injected 99999 HP
    const hackedHp = createMockPetState({ maxHp: 99999 });
    expect(PetIntegrityValidator.validatePetState(hackedHp).valid).toBe(false);

    // Illegal IVs (> 31)
    const hackedIv = createMockPetState({ ivAttack: 99 });
    expect(PetIntegrityValidator.validatePetState(hackedIv).valid).toBe(false);
  });
});

describe('Deterministic Async PvP Combat Resolver', () => {
  it('calculates elemental affinities accurately', () => {
    // Aquatic vs Dino (Primordial) -> advantage
    expect(getElementalMultiplier('tadpole', 'dino')).toBe(1.25);
    // Dino vs Aquatic -> disadvantage
    expect(getElementalMultiplier('dino', 'tadpole')).toBe(0.8);
    // Neutral matching
    expect(getElementalMultiplier('tadpole', 'tadpole')).toBe(1.0);
  });

  it('produces 100% deterministic combat outcomes for identical seeds', () => {
    const challenger = createMockPetState({ id: 'challenger_1', attack: 22, defense: 14 });
    const defender = createMockPetState({ id: 'defender_2', type: 'dino', attack: 20, defense: 10 });
    const seed = 987654321;

    const outcomeA = DeterministicCombatResolver.resolveBattle('CHALLENGE_01', challenger, defender, seed);
    const outcomeB = DeterministicCombatResolver.resolveBattle('CHALLENGE_01', challenger, defender, seed);

    expect(outcomeA.winnerId).toBe(outcomeB.winnerId);
    expect(outcomeA.totalRounds).toBe(outcomeB.totalRounds);
    expect(outcomeA.challengerFinalHp).toBe(outcomeB.challengerFinalHp);
    expect(outcomeA.defenderFinalHp).toBe(outcomeB.defenderFinalHp);
    expect(outcomeA.verificationHash).toBe(outcomeB.verificationHash);
    expect(outcomeA.battleLog).toEqual(outcomeB.battleLog);
  });

  it('verifies combat outcomes across independent client/server simulations', () => {
    const client = AuthoritativeServerClient.getInstance();
    const challenger = createMockPetState({ id: 'c1', attack: 25 });
    const defender = createMockPetState({ id: 'd1', attack: 15 });

    const battleOutcome = client.simulateAsyncPvP(challenger, defender, 123456);
    expect(battleOutcome.winnerId).toBeDefined();

    // Verifying outcome matches
    const isValid = client.verifyBattleOutcome(battleOutcome, challenger, defender);
    expect(isValid).toBe(true);

    // Tampered winner should fail verification
    const tampered = { ...battleOutcome, winnerId: 'fake_winner_id' };
    const isTamperedValid = client.verifyBattleOutcome(tampered, challenger, defender);
    expect(isTamperedValid).toBe(false);
  });
});
