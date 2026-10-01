import { UserProfile, HallOfFameEntry } from '../types/user';
import { PetModel, PetType, EggType } from '../types/pet';
import { InventoryItem } from '../types/item';
import { generateRandomGenome, crossoverGenomes } from '../genetics/evolutionEngine';

const STORAGE_KEY = 'they_might_byte_save_v2';

export class StorageService {
  private static instance: StorageService;
  private profile: UserProfile;

  private constructor() {
    this.profile = this.loadProfile();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private loadProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as UserProfile;
        if (parsed && typeof parsed === 'object') {
          return this.migrateProfile(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read saved data from localStorage, generating new profile:', e);
    }

    return this.createDefaultProfile();
  }

  private migrateProfile(prof: UserProfile): UserProfile {
    if (!prof.hallOfFame) prof.hallOfFame = [];
    if (prof.soundEnabled === undefined) prof.soundEnabled = true;

    prof.pets = prof.pets.map((pet, idx) => {
      if (!pet.stats) {
        pet.stats = {
          energy: { min: 0, current: 80, max: 100 },
          hunger: { min: 0, current: 75, max: 100 },
          happiness: { min: 0, current: 60, max: 100 },
          cleanliness: { min: 0, current: 90, max: 100 },
          discipline: 70,
          careMistakes: 0,
          poopCount: 0,
          generation: 1,
          battlesWon: 0,
          battlesTotal: 0,
          focusMinutes: 0,
          focusTokens: 0,
          timers: { lived: 0 },
          level: 1,
          hp: 20,
          maxHp: 20,
          attack: 5,
          defense: 3,
        };
      }
      if (pet.stats.discipline === undefined) pet.stats.discipline = 70;
      if (pet.stats.careMistakes === undefined) pet.stats.careMistakes = 0;
      if (pet.stats.poopCount === undefined) pet.stats.poopCount = 0;
      if (pet.stats.generation === undefined) pet.stats.generation = 1;
      if (pet.stats.battlesWon === undefined) pet.stats.battlesWon = 0;
      if (pet.stats.battlesTotal === undefined) pet.stats.battlesTotal = 0;
      if (pet.stats.focusMinutes === undefined) pet.stats.focusMinutes = 0;
      if (pet.stats.focusTokens === undefined) pet.stats.focusTokens = 0;
      if (pet.isSleeping === undefined) pet.isSleeping = false;
      if (!pet.genome) pet.genome = generateRandomGenome(pet.stats.generation ?? 1, pet.name);
      return pet;
    });

    return prof;
  }

  public createDefaultProfile(username = 'Tamer'): UserProfile {
    const defaultItems: InventoryItem[] = [
      {
        id: 'cake',
        name: 'Cake',
        description: 'A delicious frosted cake. Boosts happiness and energy!',
        effects: { hunger: 30, happiness: 40, energy: 20 },
        quantity: 3,
        shopValue: 5,
      },
      {
        id: 'candy-cane',
        name: 'Candy Cane',
        description: 'Sweet peppermint treat. Fast sugar rush!',
        effects: { hunger: 15, happiness: 25, energy: 25 },
        quantity: 5,
        shopValue: 3,
      },
      {
        id: 'parsnip',
        name: 'Parsnip',
        description: 'Healthy crunchy root vegetable.',
        effects: { hunger: 25, energy: 15, cleanliness: 5 },
        quantity: 4,
        shopValue: 2,
      },
      {
        id: 'medicine',
        name: 'Vaccine Spray',
        description: 'Cures pet sickness and cleans germs.',
        effects: { cureSick: true, cleanliness: 50 },
        quantity: 2,
        shopValue: 10,
      },
    ];

    const defaultPet: PetModel = {
      id: 'starter_egg_' + Date.now(),
      name: 'Blue Egg',
      type: 'tadpole',
      eggType: 'egg-blue',
      stage: 'egg',
      stats: {
        energy: { min: 0, current: 90, max: 100 },
        hunger: { min: 0, current: 80, max: 100 },
        happiness: { min: 0, current: 50, max: 100 },
        cleanliness: { min: 0, current: 100, max: 100 },
        discipline: 70,
        careMistakes: 0,
        poopCount: 0,
        generation: 1,
        battlesWon: 0,
        battlesTotal: 0,
        focusMinutes: 0,
        focusTokens: 0,
        timers: { lived: 0, lastFed: Date.now() },
        msLeftToEvolve: 15000,
        level: 1,
        hp: 20,
        maxHp: 20,
        attack: 5,
        defense: 3,
      },
      status: 'idle',
      isSleeping: false,
      genome: generateRandomGenome(1, 'Blue Origin'),
      createdAt: Date.now(),
    };

    const newProfile: UserProfile = {
      id: 'tamer_' + Math.random().toString(36).substring(2, 9),
      username,
      isDemo: true,
      money: 30,
      selectedTheme: 'Mountain Steel',
      soundEnabled: true,
      currentPetIndex: 0,
      pets: [defaultPet],
      items: defaultItems,
      hallOfFame: [],
    };

    this.saveProfile(newProfile);
    return newProfile;
  }

  public getProfile(): UserProfile {
    return this.profile;
  }

  public saveProfile(profile?: UserProfile): void {
    if (profile) {
      this.profile = profile;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.error('Failed to write save profile to localStorage:', e);
    }
  }

  public getCurrentPet(): PetModel | null {
    if (this.profile.pets.length === 0) return null;
    const idx = Math.max(0, Math.min(this.profile.currentPetIndex, this.profile.pets.length - 1));
    return this.profile.pets[idx];
  }

  public updateCurrentPet(updater: (pet: PetModel) => void): void {
    const pet = this.getCurrentPet();
    if (pet) {
      updater(pet);
      this.saveProfile();
    }
  }

  public addPet(pet: PetModel): void {
    this.profile.pets.push(pet);
    this.profile.currentPetIndex = this.profile.pets.length - 1;
    this.saveProfile();
  }

  public selectPet(index: number): void {
    if (index >= 0 && index < this.profile.pets.length) {
      this.profile.currentPetIndex = index;
      this.saveProfile();
    }
  }

  public useItem(itemId: string): boolean {
    const item = this.profile.items.find((i) => i.id === itemId);
    const pet = this.getCurrentPet();
    if (!item || item.quantity <= 0 || !pet) return false;

    if (item.effects.hunger) {
      pet.stats.hunger.current = Math.min(pet.stats.hunger.max, pet.stats.hunger.current + item.effects.hunger);
    }
    if (item.effects.happiness) {
      pet.stats.happiness.current = Math.min(pet.stats.happiness.max, pet.stats.happiness.current + item.effects.happiness);
    }
    if (item.effects.energy) {
      pet.stats.energy.current = Math.min(pet.stats.energy.max, pet.stats.energy.current + item.effects.energy);
    }
    if (item.effects.cleanliness) {
      pet.stats.cleanliness.current = Math.min(pet.stats.cleanliness.max, pet.stats.cleanliness.current + item.effects.cleanliness);
    }
    if (item.effects.cureSick && pet.status === 'sick') {
      pet.status = 'idle';
    }
    if (item.effects.attack) {
      pet.stats.attack += item.effects.attack;
    }
    if (item.effects.defense) {
      pet.stats.defense += item.effects.defense;
    }
    if (item.effects.maxHp) {
      pet.stats.maxHp += item.effects.maxHp;
      pet.stats.hp = Math.min(pet.stats.maxHp, pet.stats.hp + item.effects.maxHp);
    }
    if (item.effects.discipline) {
      pet.stats.discipline = Math.min(100, (pet.stats.discipline ?? 70) + item.effects.discipline);
    }

    item.quantity--;
    if (item.quantity <= 0) {
      this.profile.items = this.profile.items.filter((i) => i.id !== itemId);
    }

    this.saveProfile();
    return true;
  }

  public addItem(item: InventoryItem): void {
    const existing = this.profile.items.find((i) => i.id === item.id || i.name === item.name);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.profile.items.push(item);
    }
    this.saveProfile();
  }

  public addMoney(amount: number): void {
    this.profile.money += amount;
    this.saveProfile();
  }

  public spendMoney(amount: number): boolean {
    if (this.profile.money >= amount) {
      this.profile.money -= amount;
      this.saveProfile();
      return true;
    }
    return false;
  }

  public setTheme(themeName: string): void {
    this.profile.selectedTheme = themeName;
    this.saveProfile();
  }

  public isSoundEnabled(): boolean {
    return this.profile.soundEnabled ?? true;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.profile.soundEnabled = enabled;
    this.saveProfile();
  }

  public toggleSleep(): boolean {
    const pet = this.getCurrentPet();
    if (!pet) return false;
    pet.isSleeping = !pet.isSleeping;
    pet.status = pet.isSleeping ? 'sleeping' : 'idle';
    this.saveProfile();
    return pet.isSleeping;
  }

  public cleanPoop(): number {
    const pet = this.getCurrentPet();
    if (!pet) return 0;
    const cleaned = pet.stats.poopCount;
    pet.stats.poopCount = 0;
    pet.stats.cleanliness.current = 100;
    if (pet.status === 'poopy') pet.status = 'idle';
    this.saveProfile();
    return cleaned;
  }

  public addPoop(): void {
    const pet = this.getCurrentPet();
    if (!pet || pet.stage === 'egg' || pet.isSleeping) return;
    pet.stats.poopCount = Math.min(4, pet.stats.poopCount + 1);
    if (pet.stats.poopCount >= 2 && pet.status !== 'sick') {
      pet.status = 'poopy';
    }
    this.saveProfile();
  }

  public addFocusSession(minutes: number, tokens: number): void {
    const pet = this.getCurrentPet();
    if (!pet) return;
    pet.stats.focusMinutes = (pet.stats.focusMinutes ?? 0) + minutes;
    pet.stats.focusTokens = (pet.stats.focusTokens ?? 0) + tokens;
    pet.stats.discipline = Math.min(100, (pet.stats.discipline ?? 70) + 5);
    pet.stats.happiness.current = Math.min(100, pet.stats.happiness.current + 15);
    this.addMoney(tokens * 2);
    this.saveProfile();
  }

  public retirePetToHallOfFame(): HallOfFameEntry | null {
    const pet = this.getCurrentPet();
    if (!pet || pet.stage === 'egg') return null;

    const entry: HallOfFameEntry = {
      id: pet.id,
      name: pet.name,
      stage: pet.stage,
      type: pet.type,
      level: pet.stats.level,
      generation: pet.stats.generation ?? 1,
      battlesWon: pet.stats.battlesWon ?? 0,
      focusMinutes: pet.stats.focusMinutes ?? 0,
      retiredAt: Date.now(),
    };

    if (!this.profile.hallOfFame) {
      this.profile.hallOfFame = [];
    }
    this.profile.hallOfFame.unshift(entry);

    // Hatch next generation egg with heirlooms
    const nextGen = (pet.stats.generation ?? 1) + 1;
    const heirloomPet: PetModel = {
      id: 'egg_gen_' + nextGen + '_' + Date.now(),
      name: `Gen ${nextGen} Egg`,
      type: pet.type,
      eggType: nextGen % 3 === 0 ? 'egg-yellow' : nextGen % 2 === 0 ? 'egg-green' : 'egg-blue',
      stage: 'egg',
      stats: {
        energy: { min: 0, current: 100, max: 100 },
        hunger: { min: 0, current: 90, max: 100 },
        happiness: { min: 0, current: 80, max: 100 },
        cleanliness: { min: 0, current: 100, max: 100 },
        discipline: 80, // Heirloom discipline bonus!
        careMistakes: 0,
        poopCount: 0,
        generation: nextGen,
        battlesWon: 0,
        battlesTotal: 0,
        focusMinutes: 0,
        focusTokens: 0,
        timers: { lived: 0 },
        level: 1,
        hp: 25, // Heirloom HP bonus!
        maxHp: 25,
        attack: 6, // Heirloom ATK bonus!
        defense: 4,
      },
      status: 'idle',
      isSleeping: false,
      genome: pet.genome
        ? crossoverGenomes(pet.genome, generateRandomGenome(nextGen, 'Ether Founder'))
        : generateRandomGenome(nextGen, pet.name),
      createdAt: Date.now(),
    };

    // Replace current pet with next gen
    this.profile.pets[this.profile.currentPetIndex] = heirloomPet;
    this.addMoney(20); // Rebirth bonus
    this.saveProfile();
    return entry;
  }
}
