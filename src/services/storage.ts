import { UserProfile } from '../types/user';
import { PetModel, PetType, EggType } from '../types/pet';
import { InventoryItem } from '../types/item';

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
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return parsed as UserProfile;
        }
      }
    } catch (e) {
      console.warn('Could not read saved data from localStorage, generating new profile:', e);
    }

    return this.createDefaultProfile();
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
        timers: { lived: 0, lastFed: Date.now() },
        msLeftToEvolve: 15000, // 15 seconds to hatch in demo/fast mode
        level: 1,
        hp: 20,
        maxHp: 20,
        attack: 5,
        defense: 3,
      },
      status: 'idle',
      createdAt: Date.now(),
    };

    const newProfile: UserProfile = {
      id: 'tamer_' + Math.random().toString(36).substring(2, 9),
      username,
      isDemo: true,
      money: 25,
      selectedTheme: 'Mountain Steel',
      currentPetIndex: 0,
      pets: [defaultPet],
      items: defaultItems,
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

    // Apply effects
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
}
