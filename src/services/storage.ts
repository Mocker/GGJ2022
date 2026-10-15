import { UserProfile, HallOfFameEntry, DailyHabit, DailyStreakInfo, BioSyncState } from '../types/user';
import { PetModel, PetType, EggType } from '../types/pet';
import { InventoryItem } from '../types/item';
import { generateRandomGenome, crossoverGenomes } from '../genetics/evolutionEngine';
import { GeneticMutationTrait } from '../genetics/types';

const STORAGE_KEY = 'they_might_byte_save_v2';

export function getTodayDateString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DailyStreakReward {
  day: number;
  coins: number;
  itemId?: string;
  itemName?: string;
  happinessBonus: number;
  description: string;
}

export const STREAK_REWARDS: DailyStreakReward[] = [
  { day: 1, coins: 5, happinessBonus: 15, description: '🪙 5 Coins + Happiness boost' },
  { day: 2, coins: 10, itemId: 'parsnip', itemName: 'Parsnip', happinessBonus: 20, description: '🪙 10 Coins + Crunchy Parsnip' },
  { day: 3, coins: 15, itemId: 'candy-cane', itemName: 'Candy Cane', happinessBonus: 25, description: '🪙 15 Coins + Peppermint Candy Cane' },
  { day: 4, coins: 20, itemId: 'daycare-bowl', itemName: 'Daycare Snack Bowl', happinessBonus: 30, description: '🪙 20 Coins + Auto-feeding Daycare Bowl' },
  { day: 5, coins: 25, itemId: 'protein-shake', itemName: 'Mega Protein Shake', happinessBonus: 35, description: '🪙 25 Coins + Mega Protein Shake' },
  { day: 6, coins: 30, itemId: 'medicine', itemName: 'Vaccine Spray', happinessBonus: 40, description: '🪙 30 Coins + Vaccine Spray' },
  { day: 7, coins: 50, itemId: 'golden-apple', itemName: 'Golden Digi-Apple', happinessBonus: 50, description: '🪙 50 Coins + Rare Golden Digi-Apple + Genetic Mutation!' },
];

export function getDefaultDailyHabits(): DailyHabit[] {
  return [
    {
      id: 'hydro_1',
      label: '💧 Hydro-Byte Morning',
      description: 'Drink first glass of water to hydrate',
      icon: '💧',
      rewardCoins: 2,
      rewardDiscipline: 2,
      completed: false,
      category: 'hydration',
    },
    {
      id: 'hydro_2',
      label: '💧 Hydro-Byte Afternoon',
      description: 'Afternoon hydration recharge',
      icon: '💧',
      rewardCoins: 2,
      rewardDiscipline: 2,
      completed: false,
      category: 'hydration',
    },
    {
      id: 'hydro_3',
      label: '💧 Hydro-Byte Evening',
      description: 'Evening hydration goal',
      icon: '💧',
      rewardCoins: 2,
      rewardDiscipline: 2,
      completed: false,
      category: 'hydration',
    },
    {
      id: 'desk_stretch',
      label: '🧘 Bio-Sync Desk Stretch',
      description: '30s posture & eye reset away from the screen',
      icon: '🧘',
      rewardCoins: 3,
      rewardDiscipline: 5,
      completed: false,
      category: 'movement',
    },
    {
      id: 'focus_sprint',
      label: '🎯 Cyber Focus Sprint',
      description: 'Complete any Pomodoro focus session',
      icon: '🎯',
      rewardCoins: 5,
      rewardDiscipline: 10,
      completed: false,
      category: 'focus',
    },
    {
      id: 'clean_pet',
      label: '✨ Habitat Refresh',
      description: 'Clean waste or give your pet a bath',
      icon: '✨',
      rewardCoins: 2,
      rewardDiscipline: 3,
      completed: false,
      category: 'pet_care',
    },
    {
      id: 'tamer_workout',
      label: '⚡ Digi-Workout / Arena',
      description: 'Play a mini-game or compete in the battle arena',
      icon: '⚡',
      rewardCoins: 4,
      rewardDiscipline: 5,
      completed: false,
      category: 'pet_care',
    },
  ];
}


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
    if (!prof.unlockedThemes) prof.unlockedThemes = ['Mountain Steel', 'Sage Bog'];
    if (!prof.unlockedHabitats) prof.unlockedHabitats = ['default'];
    if (!prof.selectedHabitat) prof.selectedHabitat = 'default';
    if (!prof.lastSaved) prof.lastSaved = Date.now();

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

    if (!prof.dailyStreak) {
      prof.dailyStreak = {
        currentStreak: 0,
        longestStreak: 0,
        claimedToday: false,
      };
    }
    const today = getTodayDateString();
    if (!prof.dailyHabitsDate || prof.dailyHabitsDate !== today) {
      prof.dailyHabits = getDefaultDailyHabits();
      prof.dailyHabitsDate = today;
      if (!prof.bioSync) {
        prof.bioSync = { waterDrunkToday: 0, waterGoal: 6, deskStretchesToday: 0 };
      } else {
        prof.bioSync.waterDrunkToday = 0;
        prof.bioSync.deskStretchesToday = 0;
      }
    }
    if (!prof.dailyHabits || prof.dailyHabits.length === 0) {
      prof.dailyHabits = getDefaultDailyHabits();
    }
    if (!prof.bioSync) {
      prof.bioSync = { waterDrunkToday: 0, waterGoal: 6, deskStretchesToday: 0 };
    }
    if (!prof.activeSoundscape) {
      prof.activeSoundscape = 'off';
    }
    prof.dailyStreak.claimedToday = prof.dailyStreak.lastClaimDate === today;

    return prof;
  }

  public createDefaultProfile(username = 'Tamer'): UserProfile {
    const today = getTodayDateString();
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
      unlockedThemes: ['Mountain Steel', 'Sage Bog'],
      unlockedHabitats: ['default'],
      selectedHabitat: 'default',
      lastSaved: Date.now(),
      dailyStreak: {
        currentStreak: 0,
        longestStreak: 0,
        claimedToday: false,
      },
      dailyHabits: getDefaultDailyHabits(),
      dailyHabitsDate: today,
      bioSync: {
        waterDrunkToday: 0,
        waterGoal: 6,
        deskStretchesToday: 0,
      },
      activeSoundscape: 'off',
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
    this.profile.lastSaved = Date.now();
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
    if (itemId === 'catalyst-stone' && pet.genome) {
      const allTraits: GeneticMutationTrait[] = ['Bioluminescent', 'Titan', 'Armored', 'Cybernetic', 'Pyre', 'Zen', 'GlitchShift'];
      const unacquired = allTraits.filter((t) => !pet.genome?.traits.includes(t));
      if (unacquired.length > 0) {
        const novel = unacquired[Math.floor(Math.random() * unacquired.length)];
        pet.genome.traits.push(novel);
        if (novel === 'Titan') {
          pet.genome.chromosomes.scaleModifier = 1.22;
          pet.stats.maxHp += 10;
          pet.stats.hp += 10;
        }
      }
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

  public getUnlockedThemes(): string[] {
    return this.profile.unlockedThemes || ['Mountain Steel', 'Sage Bog'];
  }

  public unlockTheme(themeName: string): boolean {
    if (!this.profile.unlockedThemes) {
      this.profile.unlockedThemes = ['Mountain Steel', 'Sage Bog'];
    }
    if (!this.profile.unlockedThemes.includes(themeName)) {
      this.profile.unlockedThemes.push(themeName);
      this.saveProfile();
      return true;
    }
    return false;
  }

  public getUnlockedHabitats(): string[] {
    return this.profile.unlockedHabitats || ['default'];
  }

  public unlockHabitat(habitatId: string): boolean {
    if (!this.profile.unlockedHabitats) {
      this.profile.unlockedHabitats = ['default'];
    }
    if (!this.profile.unlockedHabitats.includes(habitatId)) {
      this.profile.unlockedHabitats.push(habitatId);
      this.saveProfile();
      return true;
    }
    return false;
  }

  public setHabitat(habitatId: string): void {
    this.profile.selectedHabitat = habitatId;
    this.saveProfile();
  }

  public processOfflineCatchUp(): string | null {
    const pet = this.getCurrentPet();
    if (!pet) return null;

    const last = this.profile.lastSaved;
    if (!last || isNaN(last)) {
      this.profile.lastSaved = Date.now();
      this.saveProfile();
      return null;
    }

    const elapsedMs = Date.now() - last;
    if (elapsedMs < 60000) return null;

    const simMs = Math.min(elapsedMs, 8 * 3600 * 1000);
    const ticks = Math.floor(simMs / 30000);
    const hours = (elapsedMs / (1000 * 60 * 60)).toFixed(1);

    pet.stats.timers.lived += simMs;
    let message = '';

    if (pet.isSleeping) {
      pet.stats.energy.current = 100;
      pet.stats.hp = pet.stats.maxHp;
      pet.stats.hunger.current = Math.max(25, pet.stats.hunger.current - Math.floor(ticks * 0.4));
      message = `Welcome back! (${hours}h away) ${pet.name} slept soundly & restored Energy/HP!`;
    } else {
      const daycareBowl = this.profile.items.find((i) => i.id === 'daycare-bowl');
      let bowlsUsed = 0;
      if (daycareBowl && daycareBowl.quantity > 0) {
        const needed = Math.min(daycareBowl.quantity, Math.ceil(ticks / 35));
        bowlsUsed = needed;
        daycareBowl.quantity -= needed;
        if (daycareBowl.quantity <= 0) {
          this.profile.items = this.profile.items.filter((i) => i.id !== 'daycare-bowl');
        }
      }

      const netHungerDecay = Math.max(0, ticks - (bowlsUsed * 35));
      pet.stats.hunger.current = Math.max(15, pet.stats.hunger.current - netHungerDecay);
      pet.stats.cleanliness.current = Math.max(15, pet.stats.cleanliness.current - Math.floor(ticks * 0.5));
      pet.stats.happiness.current = Math.max(20, pet.stats.happiness.current - Math.floor(ticks * 0.4));

      if (pet.stage !== 'egg') {
        const addedPoop = ticks > 40 ? 2 : ticks > 15 ? 1 : 0;
        pet.stats.poopCount = Math.min(2, (pet.stats.poopCount || 0) + addedPoop);
      }

      if (pet.stats.hunger.current <= 15) {
        pet.status = 'hungry';
      } else if ((pet.stats.poopCount || 0) > 0) {
        pet.status = 'poopy';
      } else {
        pet.status = 'idle';
      }

      if (bowlsUsed > 0) {
        message = `Welcome back! (${hours}h away) Daycare Bowl auto-fed ${bowlsUsed} snack(s) to ${pet.name}!`;
      } else {
        message = `Welcome back! (${hours}h away) ${pet.name} was cared for while offline.`;
      }
    }

    this.profile.lastSaved = Date.now();
    this.saveProfile();
    return message;
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
    if (cleaned > 0) {
      this.completeHabit('clean_pet');
    }
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
    this.completeHabit('focus_sprint');
    this.saveProfile();
  }

  // --- Productivity & Daily Protocol Systems ---

  public checkDailyReset(): boolean {
    const today = getTodayDateString();
    let resetOccurred = false;

    if (this.profile.dailyHabitsDate !== today) {
      this.profile.dailyHabits = getDefaultDailyHabits();
      this.profile.dailyHabitsDate = today;
      if (!this.profile.bioSync) {
        this.profile.bioSync = { waterDrunkToday: 0, waterGoal: 6, deskStretchesToday: 0 };
      } else {
        this.profile.bioSync.waterDrunkToday = 0;
        this.profile.bioSync.deskStretchesToday = 0;
      }
      resetOccurred = true;
    }

    if (!this.profile.dailyStreak) {
      this.profile.dailyStreak = { currentStreak: 0, longestStreak: 0, claimedToday: false };
      resetOccurred = true;
    }

    this.profile.dailyStreak.claimedToday = this.profile.dailyStreak.lastClaimDate === today;

    if (resetOccurred) {
      this.saveProfile();
    }
    return resetOccurred;
  }

  public getDailyStreak(): DailyStreakInfo {
    this.checkDailyReset();
    return this.profile.dailyStreak || { currentStreak: 0, longestStreak: 0, claimedToday: false };
  }

  public claimDailyLoginBonus(): {
    success: boolean;
    alreadyClaimed: boolean;
    streak: number;
    reward?: DailyStreakReward;
    message: string;
    coinsAwarded: number;
    itemAwarded?: InventoryItem;
  } {
    this.checkDailyReset();
    const today = getTodayDateString();
    const yesterday = getTodayDateString(-1);
    const streak = this.profile.dailyStreak || { currentStreak: 0, longestStreak: 0, claimedToday: false };

    if (streak.claimedToday || streak.lastClaimDate === today) {
      return {
        success: false,
        alreadyClaimed: true,
        streak: streak.currentStreak,
        message: 'Daily bonus already claimed for today! Return tomorrow to keep your streak.',
        coinsAwarded: 0,
      };
    }

    let nextStreak = 1;
    if (streak.lastClaimDate === yesterday) {
      nextStreak = streak.currentStreak + 1;
    }

    streak.currentStreak = nextStreak;
    streak.longestStreak = Math.max(streak.longestStreak, nextStreak);
    streak.lastClaimDate = today;
    streak.claimedToday = true;

    const cycleDay = ((nextStreak - 1) % 7) + 1;
    const reward = STREAK_REWARDS[cycleDay - 1];

    this.addMoney(reward.coins);

    let itemAwarded: InventoryItem | undefined;
    if (reward.itemId && reward.itemName) {
      itemAwarded = {
        id: reward.itemId,
        name: reward.itemName,
        description: `Day ${cycleDay} Streak Reward`,
        effects: reward.itemId === 'golden-apple'
          ? { hunger: 50, happiness: 60, energy: 50, cureSick: true }
          : reward.itemId === 'daycare-bowl'
          ? { hunger: 35 }
          : reward.itemId === 'medicine'
          ? { cureSick: true, cleanliness: 50 }
          : reward.itemId === 'protein-shake'
          ? { hunger: 20, attack: 2, defense: 1, discipline: 5 }
          : { hunger: 25, happiness: 25 },
        quantity: 1,
        shopValue: reward.coins,
      };
      this.addItem(itemAwarded);
    }

    const pet = this.getCurrentPet();
    if (pet) {
      pet.stats.happiness.current = Math.min(100, pet.stats.happiness.current + reward.happinessBonus);
      if (cycleDay === 7 && pet.genome) {
        // Day 7 spontaneous mutation or attribute refinement
        pet.stats.maxHp += 5;
        pet.stats.hp = pet.stats.maxHp;
        pet.stats.attack += 1;
        pet.stats.defense += 1;
      }
    }

    this.profile.dailyStreak = streak;
    this.saveProfile();

    return {
      success: true,
      alreadyClaimed: false,
      streak: nextStreak,
      reward,
      message: `Day ${nextStreak} Streak Claimed! Received ${reward.coins}🪙${itemAwarded ? ` + ${itemAwarded.name}` : ''}!`,
      coinsAwarded: reward.coins,
      itemAwarded,
    };
  }

  public getDailyHabits(): DailyHabit[] {
    this.checkDailyReset();
    return this.profile.dailyHabits || [];
  }

  public completeHabit(habitId: string, awardDirect = true): {
    completed: boolean;
    allCompleted: boolean;
    rewardCoins: number;
    habit?: DailyHabit;
  } {
    this.checkDailyReset();
    if (!this.profile.dailyHabits) return { completed: false, allCompleted: false, rewardCoins: 0 };

    const habit = this.profile.dailyHabits.find((h) => h.id === habitId);
    if (!habit || habit.completed) {
      const allCompleted = this.profile.dailyHabits.every((h) => h.completed);
      return { completed: false, allCompleted, rewardCoins: 0, habit };
    }

    habit.completed = true;
    let earnedCoins = habit.rewardCoins;

    if (awardDirect) {
      this.addMoney(earnedCoins);
      const pet = this.getCurrentPet();
      if (pet) {
        pet.stats.discipline = Math.min(100, (pet.stats.discipline ?? 70) + (habit.rewardDiscipline ?? 2));
      }
    }

    const allCompleted = this.profile.dailyHabits.every((h) => h.completed);
    if (allCompleted) {
      // Overclock bonus: 15 bonus coins + full pet energy!
      this.addMoney(15);
      earnedCoins += 15;
      const pet = this.getCurrentPet();
      if (pet) {
        pet.stats.energy.current = 100;
        pet.stats.happiness.current = 100;
      }
    }

    this.saveProfile();
    return { completed: true, allCompleted, rewardCoins: earnedCoins, habit };
  }

  public toggleHabit(habitId: string): {
    completed: boolean;
    allCompleted: boolean;
    rewardCoins: number;
    habit?: DailyHabit;
  } {
    return this.completeHabit(habitId, true);
  }

  public getBioSync(): BioSyncState {
    this.checkDailyReset();
    if (!this.profile.bioSync) {
      this.profile.bioSync = { waterDrunkToday: 0, waterGoal: 6, deskStretchesToday: 0 };
    }
    return this.profile.bioSync;
  }

  public logWaterIntake(): { waterDrunkToday: number; coinsEarned: number; bonusCompleted: boolean } {
    this.checkDailyReset();
    const bio = this.getBioSync();
    bio.waterDrunkToday = Math.min(12, bio.waterDrunkToday + 1);
    bio.lastWaterTimestamp = Date.now();

    const pet = this.getCurrentPet();
    if (pet) {
      pet.stats.cleanliness.current = Math.min(100, pet.stats.cleanliness.current + 10);
      pet.stats.happiness.current = Math.min(100, pet.stats.happiness.current + 10);
    }

    this.addMoney(2);

    let bonusCompleted = false;
    if (bio.waterDrunkToday >= 1) {
      const res = this.completeHabit('hydro_1', false);
      if (res.completed) bonusCompleted = true;
    }
    if (bio.waterDrunkToday >= 2) {
      const res = this.completeHabit('hydro_2', false);
      if (res.completed) bonusCompleted = true;
    }
    if (bio.waterDrunkToday >= 3) {
      const res = this.completeHabit('hydro_3', false);
      if (res.completed) bonusCompleted = true;
    }

    this.saveProfile();
    return { waterDrunkToday: bio.waterDrunkToday, coinsEarned: 2, bonusCompleted };
  }

  public performDeskStretch(): { deskStretchesToday: number; coinsEarned: number } {
    this.checkDailyReset();
    const bio = this.getBioSync();
    bio.deskStretchesToday = (bio.deskStretchesToday ?? 0) + 1;

    const pet = this.getCurrentPet();
    if (pet) {
      pet.stats.energy.current = Math.min(100, pet.stats.energy.current + 15);
      pet.stats.discipline = Math.min(100, (pet.stats.discipline ?? 70) + 5);
    }

    this.addMoney(3);
    this.completeHabit('desk_stretch', false);
    this.saveProfile();

    return { deskStretchesToday: bio.deskStretchesToday, coinsEarned: 3 };
  }

  public getActiveSoundscape(): 'off' | 'rain' | 'drone' | 'matrix' {
    return this.profile.activeSoundscape || 'off';
  }

  public setActiveSoundscape(soundscape: 'off' | 'rain' | 'drone' | 'matrix'): void {
    this.profile.activeSoundscape = soundscape;
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
