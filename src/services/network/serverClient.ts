import { PetModel } from '../../types/pet';
import { CryptoSealService } from './cryptoSeal';

export interface LobbyPetSummary {
  owner: string;
  petName: string;
  stage: string;
  type: string;
  level: number;
  generation: number;
  dnaHash: string;
  ivGrade: string;
  seal: string;
  publishedAt: number;
}

export interface IPetServerClient {
  publishPet(pet: PetModel, owner: string): Promise<{ success: boolean; seal: string }>;
  fetchLobby(): Promise<LobbyPetSummary[]>;
  verifyPet(pet: PetModel, seal: string): Promise<boolean>;
}

const LOBBY_STORAGE_KEY = 'they_might_byte_public_lobby_v2';

export class MockLocalPetServerClient implements IPetServerClient {
  private static instance: MockLocalPetServerClient;

  private constructor() {
    this.seedDefaultLobby();
  }

  public static getInstance(): MockLocalPetServerClient {
    if (!MockLocalPetServerClient.instance) {
      MockLocalPetServerClient.instance = new MockLocalPetServerClient();
    }
    return MockLocalPetServerClient.instance;
  }

  private seedDefaultLobby(): void {
    if (typeof localStorage === 'undefined') return;
    if (!localStorage.getItem(LOBBY_STORAGE_KEY)) {
      const defaultLobby: LobbyPetSummary[] = [
        {
          owner: 'Satoshi_99',
          petName: 'Cyber Sol',
          stage: 'cyberMecha',
          type: 'snuffler',
          level: 12,
          generation: 4,
          dnaHash: 'DNA-77A1-BC02-E941',
          ivGrade: 'S',
          seal: 'SEAL-VALID-ORIGIN-01',
          publishedAt: Date.now() - 3600000 * 24,
        },
        {
          owner: 'Valkyrie_Byte',
          petName: 'Saint Rana',
          stage: 'megaHero',
          type: 'tadpole',
          level: 9,
          generation: 2,
          dnaHash: 'DNA-3F44-99D1-002A',
          ivGrade: 'A',
          seal: 'SEAL-VALID-ORIGIN-02',
          publishedAt: Date.now() - 3600000 * 12,
        },
        {
          owner: 'VoidSeeker',
          petName: 'Shadow Rex',
          stage: 'adultEvil',
          type: 'dino',
          level: 8,
          generation: 3,
          dnaHash: 'DNA-01B9-7C4E-FA22',
          ivGrade: 'A',
          seal: 'SEAL-VALID-ORIGIN-03',
          publishedAt: Date.now() - 3600000 * 6,
        },
      ];
      localStorage.setItem(LOBBY_STORAGE_KEY, JSON.stringify(defaultLobby));
    }
  }

  public async publishPet(pet: PetModel, owner: string): Promise<{ success: boolean; seal: string }> {
    const seal = CryptoSealService.createPetSeal(pet);
    const summary: LobbyPetSummary = {
      owner,
      petName: pet.name,
      stage: pet.stage,
      type: pet.type,
      level: pet.stats.level,
      generation: pet.stats.generation ?? 1,
      dnaHash: pet.genome ? pet.genome.dnaHash : 'DNA-UNKNOWN',
      ivGrade: pet.genome ? (pet.genome.chromosomes.ivHp > 25 ? 'S' : 'A') : 'B',
      seal,
      publishedAt: Date.now(),
    };

    try {
      const lobby = await this.fetchLobby();
      const filtered = lobby.filter((p) => p.dnaHash !== summary.dnaHash);
      filtered.unshift(summary);
      localStorage.setItem(LOBBY_STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
      return { success: true, seal };
    } catch (e) {
      return { success: false, seal: '' };
    }
  }

  public async fetchLobby(): Promise<LobbyPetSummary[]> {
    try {
      const raw = localStorage.getItem(LOBBY_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as LobbyPetSummary[];
    } catch (e) {}
    return [];
  }

  public async verifyPet(pet: PetModel, seal: string): Promise<boolean> {
    return CryptoSealService.verifyPetSeal(pet, seal);
  }
}
