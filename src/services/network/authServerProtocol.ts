import { PetModel, PetType, PetStage } from '../../types/pet';
import { CryptoSealService } from './cryptoSeal';

export interface AuthoritativePetState {
  id: string;
  owner: string;
  name: string;
  stage: PetStage;
  type: PetType;
  speciesId: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  discipline: number;
  generation: number;
  battlesWon: number;
  focusMinutes: number;
  genomeHash: string;
  ivHp: number;
  ivAttack: number;
  ivDefense: number;
  traits: string[];
  syncNonce: number;
  timestamp: number;
  signature: string;
}

export interface BattleTurnRecord {
  round: number;
  attackerId: string;
  defenderId: string;
  damage: number;
  isCrit: boolean;
  elementalMultiplier: number;
  defenderRemainingHp: number;
}

export interface PvPBattleOutcome {
  challengeId: string;
  winnerId: string;
  loserId: string;
  totalRounds: number;
  seed: number;
  challengerFinalHp: number;
  defenderFinalHp: number;
  battleLog: BattleTurnRecord[];
  verificationHash: string;
  timestamp: number;
}

export interface AsyncPvPChallenge {
  challengeId: string;
  challenger: AuthoritativePetState;
  defender: AuthoritativePetState;
  seed: number;
  createdAt: number;
}

// Deterministic Pseudo-Random Number Generator (Mulberry32)
export function createDeterministicRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Elemental Affinity Matrix for Async PvP
export function getElementalMultiplier(attackerType: PetType, defenderType: PetType): number {
  const advantageMap: Record<string, string[]> = {
    tadpole: ['dino', 'wyrm'],      // Aquatic douses Fire/Primordial
    dino: ['seedling'],             // Primordial crushes Botanical
    seedling: ['tadpole', 'sunfish'], // Botanical absorbs Aquatic
    celestial: ['shadowmite', 'dino'], // Light repels Shadow
    shadowmite: ['celestial', 'seraph'], // Void corrupts Light
    glitchbot: ['bacteria'],        // Cyber neutralizes Bio
    bacteria: ['glitchbot', 'snuffler'], // Bio corrodes Cyber
  };

  const advantages = advantageMap[attackerType];
  if (advantages && advantages.includes(defenderType)) {
    return 1.25; // 25% elemental advantage
  }

  const disadvantages = advantageMap[defenderType];
  if (disadvantages && disadvantages.includes(attackerType)) {
    return 0.8; // 20% elemental disadvantage
  }

  return 1.0;
}

export class DeterministicCombatResolver {
  public static resolveBattle(
    challengeId: string,
    challenger: AuthoritativePetState,
    defender: AuthoritativePetState,
    seed = Date.now()
  ): PvPBattleOutcome {
    const rng = createDeterministicRng(seed);
    const battleLog: BattleTurnRecord[] = [];

    let cCurHp = challenger.maxHp;
    let dCurHp = defender.maxHp;

    const cElemMult = getElementalMultiplier(challenger.type, defender.type);
    const dElemMult = getElementalMultiplier(defender.type, challenger.type);

    let round = 1;
    const maxRounds = 20;

    // Determine turn initiative by comparing IVs and level
    const challengerSpeed = challenger.level * 3 + (challenger.ivAttack ?? 0);
    const defenderSpeed = defender.level * 3 + (defender.ivAttack ?? 0);
    const challengerGoesFirst = challengerSpeed >= defenderSpeed;

    while (cCurHp > 0 && dCurHp > 0 && round <= maxRounds) {
      const order = challengerGoesFirst
        ? [{ atk: challenger, def: defender, elem: cElemMult, isChallenger: true }, { atk: defender, def: challenger, elem: dElemMult, isChallenger: false }]
        : [{ atk: defender, def: challenger, elem: dElemMult, isChallenger: false }, { atk: challenger, def: defender, elem: cElemMult, isChallenger: true }];

      for (const turn of order) {
        if (cCurHp <= 0 || dCurHp <= 0) break;

        const isCrit = rng() < 0.12;
        const critMultiplier = isCrit ? 1.5 : 1.0;
        const variance = 0.9 + rng() * 0.2; // 0.9 to 1.1

        const rawDmg = Math.max(3, turn.atk.attack * 1.2 - turn.def.defense * 0.45);
        const finalDmg = Math.round(rawDmg * turn.elem * critMultiplier * variance);

        if (turn.isChallenger) {
          dCurHp = Math.max(0, dCurHp - finalDmg);
          battleLog.push({
            round,
            attackerId: challenger.id,
            defenderId: defender.id,
            damage: finalDmg,
            isCrit,
            elementalMultiplier: turn.elem,
            defenderRemainingHp: dCurHp,
          });
        } else {
          cCurHp = Math.max(0, cCurHp - finalDmg);
          battleLog.push({
            round,
            attackerId: defender.id,
            defenderId: challenger.id,
            damage: finalDmg,
            isCrit,
            elementalMultiplier: turn.elem,
            defenderRemainingHp: cCurHp,
          });
        }
      }
      round++;
    }

    const winnerId = cCurHp > 0 ? challenger.id : defender.id;
    const loserId = cCurHp > 0 ? defender.id : challenger.id;

    // Deterministic outcome hash
    const hashPayload = `${challengeId}|${winnerId}|${seed}|${cCurHp}|${dCurHp}|${battleLog.length}`;
    const verificationHash = CryptoSealService.hash(hashPayload);

    return {
      challengeId,
      winnerId,
      loserId,
      totalRounds: round - 1,
      seed,
      challengerFinalHp: cCurHp,
      defenderFinalHp: dCurHp,
      battleLog,
      verificationHash,
      timestamp: Date.now(),
    };
  }
}

export class PetIntegrityValidator {
  public static validatePetState(state: AuthoritativePetState): { valid: boolean; reason?: string } {
    if (!state.id || !state.name || state.level < 1) {
      return { valid: false, reason: 'Invalid basic identity fields' };
    }

    // Level ceiling check (prevent injected level 9999)
    if (state.level > 100) {
      return { valid: false, reason: 'Level exceeds maximum allowed tamer ceiling' };
    }

    // IV bounds check (0 to 31)
    if (state.ivHp < 0 || state.ivHp > 31 || state.ivAttack < 0 || state.ivAttack > 31 || state.ivDefense < 0 || state.ivDefense > 31) {
      return { valid: false, reason: 'Individual values exceed genetic loci bounds' };
    }

    // Stat integrity formula check (HP cannot exceed theoretical max for level + IVs)
    const theoreticalMaxHp = 20 + state.level * 15 + state.ivHp * 2 + 100;
    if (state.maxHp > theoreticalMaxHp) {
      return { valid: false, reason: 'Max HP exceeds mathematical upper boundary' };
    }

    return { valid: true };
  }
}

const SHOWCASE_STORAGE_KEY = 'they_might_byte_authoritative_showcase_v2';

export class AuthoritativeServerClient {
  private static instance: AuthoritativeServerClient;

  public static getInstance(): AuthoritativeServerClient {
    if (!AuthoritativeServerClient.instance) {
      AuthoritativeServerClient.instance = new AuthoritativeServerClient();
    }
    return AuthoritativeServerClient.instance;
  }

  public createAuthoritativeState(pet: PetModel, owner: string): AuthoritativePetState {
    const seal = CryptoSealService.createPetSeal(pet);
    const g = pet.genome;

    return {
      id: pet.id,
      owner,
      name: pet.name,
      stage: pet.stage,
      type: pet.type,
      speciesId: pet.speciesId || `${pet.type}-${pet.stage}`,
      level: pet.stats.level,
      hp: pet.stats.hp,
      maxHp: pet.stats.maxHp,
      attack: pet.stats.attack,
      defense: pet.stats.defense,
      discipline: pet.stats.discipline ?? 70,
      generation: pet.stats.generation ?? 1,
      battlesWon: pet.stats.battlesWon ?? 0,
      focusMinutes: pet.stats.focusMinutes ?? 0,
      genomeHash: g ? g.dnaHash : 'DNA-NONE',
      ivHp: g ? g.chromosomes.ivHp : 15,
      ivAttack: g ? g.chromosomes.ivAttack : 15,
      ivDefense: g ? g.chromosomes.ivDefense : 15,
      traits: g ? g.traits : [],
      syncNonce: Date.now(),
      timestamp: Date.now(),
      signature: seal,
    };
  }

  public async syncPet(pet: PetModel, owner: string): Promise<{ success: boolean; authoritativeState: AuthoritativePetState }> {
    const state = this.createAuthoritativeState(pet, owner);
    const validation = PetIntegrityValidator.validatePetState(state);

    if (!validation.valid) {
      throw new Error(`Sync rejected: ${validation.reason}`);
    }

    await this.publishToShowcase(state);
    return { success: true, authoritativeState: state };
  }

  public async publishToShowcase(state: AuthoritativePetState): Promise<boolean> {
    try {
      const showcase = await this.fetchGlobalShowcase();
      const filtered = showcase.filter((p) => p.id !== state.id);
      filtered.unshift(state);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SHOWCASE_STORAGE_KEY, JSON.stringify(filtered.slice(0, 30)));
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async fetchGlobalShowcase(): Promise<AuthoritativePetState[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(SHOWCASE_STORAGE_KEY);
        if (raw) return JSON.parse(raw) as AuthoritativePetState[];
      }
    } catch (e) {}
    return [];
  }

  public simulateAsyncPvP(challenger: AuthoritativePetState, defender: AuthoritativePetState, seed = Date.now()): PvPBattleOutcome {
    return DeterministicCombatResolver.resolveBattle(`CHALLENGE-${Date.now()}`, challenger, defender, seed);
  }

  public verifyBattleOutcome(outcome: PvPBattleOutcome, challenger: AuthoritativePetState, defender: AuthoritativePetState): boolean {
    const simulated = DeterministicCombatResolver.resolveBattle(outcome.challengeId, challenger, defender, outcome.seed);
    return simulated.winnerId === outcome.winnerId && simulated.battleLog.length === outcome.battleLog.length;
  }
}
