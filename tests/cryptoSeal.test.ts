import { describe, it, expect } from 'vitest';
import { CryptoSealService } from '../src/services/network/cryptoSeal';
import { PetPassportService } from '../src/services/network/petPassport';
import { generateRandomGenome } from '../src/genetics/evolutionEngine';
import { PetModel } from '../src/types/pet';

function createMockPet(): PetModel {
  return {
    id: 'seal_test_pet_1',
    name: 'Cyber Tadpole',
    type: 'tadpole',
    eggType: 'egg-blue',
    stage: 'adultCute',
    stats: {
      energy: { min: 0, current: 80, max: 100 },
      hunger: { min: 0, current: 80, max: 100 },
      happiness: { min: 0, current: 70, max: 100 },
      cleanliness: { min: 0, current: 90, max: 100 },
      discipline: 75,
      careMistakes: 0,
      poopCount: 0,
      generation: 1,
      battlesWon: 5,
      battlesTotal: 6,
      focusMinutes: 45,
      focusTokens: 9,
      timers: { lived: 50000 },
      level: 4,
      hp: 35,
      maxHp: 35,
      attack: 14,
      defense: 10,
    },
    status: 'idle',
    isSleeping: false,
    genome: generateRandomGenome(1, 'Cyber Origin'),
    createdAt: 1726700000000,
  };
}

describe('Cryptographic State Seal & Pet Passport', () => {
  it('generates deterministic seal for pet state', () => {
    const pet = createMockPet();
    const seal1 = CryptoSealService.createPetSeal(pet);
    const seal2 = CryptoSealService.createPetSeal(pet);
    expect(seal1).toBe(seal2);
    expect(seal1).toMatch(/^SEAL-[0-9A-F]{16}$/);
    expect(CryptoSealService.verifyPetSeal(pet, seal1)).toBe(true);
  });

  it('detects tampering when level or attack is modified', () => {
    const pet = createMockPet();
    const seal = CryptoSealService.createPetSeal(pet);

    // Tamper with attack
    const tampered = JSON.parse(JSON.stringify(pet)) as PetModel;
    tampered.stats.attack = 999;
    expect(CryptoSealService.verifyPetSeal(tampered, seal)).toBe(false);

    // Tamper with level
    tampered.stats.attack = pet.stats.attack;
    tampered.stats.level = 50;
    expect(CryptoSealService.verifyPetSeal(tampered, seal)).toBe(false);
  });

  it('exports and imports Pet Passport with signature integrity', () => {
    const pet = createMockPet();
    const token = PetPassportService.exportPassport(pet, 'TamerRyan');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(50);

    const imported = PetPassportService.importPassport(token);
    expect(imported).not.toBeNull();
    expect(imported?.isValid).toBe(true);
    expect(imported?.owner).toBe('TamerRyan');
    expect(imported?.pet.name).toBe('Cyber Tadpole');
    expect(imported?.pet.genome?.dnaHash).toBe(pet.genome?.dnaHash);
  });
});
