import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, getTodayDateString, STREAK_REWARDS } from '../src/services/storage';

describe('Gamified Lifestyle & Daily Protocol Systems', () => {
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
    storage.createDefaultProfile('TestTamer');
  });

  it('initializes default daily habits and bio-sync metrics', () => {
    const habits = storage.getDailyHabits();
    expect(habits).toHaveLength(7);
    expect(habits.every((h) => !h.completed)).toBe(true);

    const bio = storage.getBioSync();
    expect(bio.waterDrunkToday).toBe(0);
    expect(bio.waterGoal).toBe(6);
    expect(bio.deskStretchesToday).toBe(0);

    const streak = storage.getDailyStreak();
    expect(streak.currentStreak).toBe(0);
    expect(streak.claimedToday).toBe(false);
  });

  it('tracks water intake (Hydro-Bytes) and completes tiered hydration habits', () => {
    const initialMoney = storage.getProfile().money;
    const initialClean = storage.getCurrentPet()?.stats.cleanliness.current ?? 0;

    // Log 1st glass
    const w1 = storage.logWaterIntake();
    expect(w1.waterDrunkToday).toBe(1);
    expect(w1.coinsEarned).toBe(2);
    expect(storage.getProfile().money).toBe(initialMoney + 2);

    let habits = storage.getDailyHabits();
    expect(habits.find((h) => h.id === 'hydro_1')?.completed).toBe(true);
    expect(habits.find((h) => h.id === 'hydro_2')?.completed).toBe(false);

    // Log 2nd glass
    const w2 = storage.logWaterIntake();
    expect(w2.waterDrunkToday).toBe(2);
    habits = storage.getDailyHabits();
    expect(habits.find((h) => h.id === 'hydro_2')?.completed).toBe(true);

    // Log 3rd glass
    const w3 = storage.logWaterIntake();
    expect(w3.waterDrunkToday).toBe(3);
    habits = storage.getDailyHabits();
    expect(habits.find((h) => h.id === 'hydro_3')?.completed).toBe(true);

    // Check pet cleanliness and happiness boosts
    const pet = storage.getCurrentPet();
    expect(pet?.stats.cleanliness.current).toBeGreaterThanOrEqual(initialClean);
  });

  it('tracks desk stretch bio-sync, discipline buffs, and completes habit', () => {
    const initialMoney = storage.getProfile().money;
    const initialDisc = storage.getCurrentPet()?.stats.discipline ?? 70;

    const res = storage.performDeskStretch();
    expect(res.deskStretchesToday).toBe(1);
    expect(res.coinsEarned).toBe(3);
    expect(storage.getProfile().money).toBe(initialMoney + 3);

    const habit = storage.getDailyHabits().find((h) => h.id === 'desk_stretch');
    expect(habit?.completed).toBe(true);

    const pet = storage.getCurrentPet();
    expect(pet?.stats.discipline).toBe(initialDisc + 5);
  });

  it('awards Perfect Protocol Overclock bonus when all daily habits are completed', () => {
    const initialMoney = storage.getProfile().money;
    const habits = storage.getDailyHabits();

    // Complete the first 6 habits
    for (let i = 0; i < 6; i++) {
      storage.completeHabit(habits[i].id);
    }
    expect(storage.getDailyHabits().every((h) => h.completed)).toBe(false);

    // Complete 7th habit -> should trigger +15 coins overclock bonus!
    const res = storage.completeHabit(habits[6].id);
    expect(res.allCompleted).toBe(true);

    // Total coins earned = sum of 7 habits rewards + 15 overclock bonus
    const totalHabitCoins = habits.reduce((acc, h) => acc + h.rewardCoins, 0);
    expect(storage.getProfile().money).toBe(initialMoney + totalHabitCoins + 15);

    // Full pet energy
    const pet = storage.getCurrentPet();
    expect(pet?.stats.energy.current).toBe(100);
    expect(pet?.stats.happiness.current).toBe(100);
  });

  it('manages daily login streak progression and prevents double claim on same day', () => {
    const initialMoney = storage.getProfile().money;

    // Day 1 claim
    const claim1 = storage.claimDailyLoginBonus();
    expect(claim1.success).toBe(true);
    expect(claim1.streak).toBe(1);
    expect(claim1.coinsAwarded).toBe(STREAK_REWARDS[0].coins);
    expect(storage.getProfile().money).toBe(initialMoney + STREAK_REWARDS[0].coins);

    // Attempting duplicate claim on same day fails gracefully
    const claimDuplicate = storage.claimDailyLoginBonus();
    expect(claimDuplicate.success).toBe(false);
    expect(claimDuplicate.alreadyClaimed).toBe(true);
    expect(claimDuplicate.streak).toBe(1);
    expect(claimDuplicate.coinsAwarded).toBe(0);
  });

  it('advances streak on consecutive days and resets if day is skipped', () => {
    const prof = storage.getProfile();
    // Simulate last claimed yesterday
    prof.dailyStreak = {
      currentStreak: 2,
      longestStreak: 2,
      lastClaimDate: getTodayDateString(-1),
      claimedToday: false,
    };
    storage.saveProfile(prof);

    // Should advance to Day 3 streak and award Day 3 rewards
    const claim = storage.claimDailyLoginBonus();
    expect(claim.success).toBe(true);
    expect(claim.streak).toBe(3);
    expect(claim.reward?.itemId).toBe('candy-cane');
    expect(storage.getDailyStreak().longestStreak).toBe(3);

    // Simulate skipped 3 days ago (streak broken)
    const profBroken = storage.getProfile();
    profBroken.dailyStreak = {
      currentStreak: 5,
      longestStreak: 5,
      lastClaimDate: getTodayDateString(-3),
      claimedToday: false,
    };
    storage.saveProfile(profBroken);

    // Next claim resets to Day 1
    const claimReset = storage.claimDailyLoginBonus();
    expect(claimReset.success).toBe(true);
    expect(claimReset.streak).toBe(1);
    // Longest streak remains 5
    expect(storage.getDailyStreak().longestStreak).toBe(5);
  });

  it('awards Day 7 milestone with golden apple and spontaneous genetic bonus', () => {
    const prof = storage.getProfile();
    prof.dailyStreak = {
      currentStreak: 6,
      longestStreak: 6,
      lastClaimDate: getTodayDateString(-1),
      claimedToday: false,
    };
    storage.saveProfile(prof);

    const petInitialMaxHp = storage.getCurrentPet()?.stats.maxHp ?? 20;

    const claim7 = storage.claimDailyLoginBonus();
    expect(claim7.success).toBe(true);
    expect(claim7.streak).toBe(7);
    expect(claim7.reward?.itemId).toBe('golden-apple');
    expect(claim7.coinsAwarded).toBe(50);

    // Check item added to inventory
    const apple = storage.getProfile().items.find((i) => i.id === 'golden-apple');
    expect(apple).toBeDefined();

    // Check pet received mutation stats
    const pet = storage.getCurrentPet();
    expect(pet?.stats.maxHp).toBe(petInitialMaxHp + 5);
  });

  it('persists and switches active focus soundscapes', () => {
    expect(storage.getActiveSoundscape()).toBe('off');

    storage.setActiveSoundscape('rain');
    expect(storage.getActiveSoundscape()).toBe('rain');
    expect(storage.getProfile().activeSoundscape).toBe('rain');

    storage.setActiveSoundscape('drone');
    expect(storage.getActiveSoundscape()).toBe('drone');

    storage.setActiveSoundscape('matrix');
    expect(storage.getActiveSoundscape()).toBe('matrix');
  });

  it('resets daily habits and hydration count on a new calendar day', () => {
    // Complete some habits and log water
    storage.logWaterIntake();
    storage.logWaterIntake();
    storage.completeHabit('tamer_workout');

    expect(storage.getBioSync().waterDrunkToday).toBe(2);
    expect(storage.getDailyHabits().find((h) => h.id === 'tamer_workout')?.completed).toBe(true);

    // Simulate date rolling over to tomorrow
    const prof = storage.getProfile();
    prof.dailyHabitsDate = getTodayDateString(-1); // yesterday
    storage.saveProfile(prof);

    // checkDailyReset should detect the new day
    const reset = storage.checkDailyReset();
    expect(reset).toBe(true);

    // All habits should be fresh and water count reset to 0
    expect(storage.getBioSync().waterDrunkToday).toBe(0);
    expect(storage.getDailyHabits().every((h) => !h.completed)).toBe(true);
  });
});
