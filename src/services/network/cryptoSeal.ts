import { PetModel } from '../../types/pet';

const DEFAULT_SECRET = 'they-might-byte-auth-v2-salt-9811';

// Fast deterministic 64-bit cryptographic-style hash string
function fnv1a64(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ (ch >> 8), 0x01000193);
  }

  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `SEAL-${p1}${p2}`.toUpperCase();
}

export function buildPetCanonicalPayload(pet: PetModel): string {
  const g = pet.genome;
  return [
    pet.id,
    pet.name,
    pet.type,
    pet.stage,
    pet.stats.level,
    pet.stats.maxHp,
    pet.stats.attack,
    pet.stats.defense,
    pet.stats.generation ?? 1,
    pet.stats.battlesWon ?? 0,
    g ? g.dnaHash : 'NO_GENOME',
    g ? g.chromosomes.ivHp : 0,
    g ? g.chromosomes.ivAttack : 0,
    g ? g.chromosomes.ivDefense : 0,
    pet.createdAt,
  ].join('|');
}

export class CryptoSealService {
  public static createPetSeal(pet: PetModel, secret = DEFAULT_SECRET): string {
    const payload = buildPetCanonicalPayload(pet) + '::' + secret;
    return fnv1a64(payload);
  }

  public static verifyPetSeal(pet: PetModel, seal: string, secret = DEFAULT_SECRET): boolean {
    if (!seal) return false;
    const expected = this.createPetSeal(pet, secret);
    return seal === expected;
  }
}
