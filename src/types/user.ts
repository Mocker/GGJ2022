import { PetModel } from './pet';
import { InventoryItem } from './item';

export interface HallOfFameEntry {
  id: string;
  name: string;
  stage: string;
  type: string;
  level: number;
  generation: number;
  battlesWon: number;
  focusMinutes: number;
  retiredAt: number;
}

export interface DailyHabit {
  id: string;
  label: string;
  description: string;
  icon: string;
  rewardCoins: number;
  rewardDiscipline?: number;
  completed: boolean;
  category: 'hydration' | 'movement' | 'focus' | 'mindset' | 'pet_care';
}

export interface DailyStreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastClaimDate?: string; // YYYY-MM-DD
  claimedToday: boolean;
}

export interface BioSyncState {
  waterDrunkToday: number;
  waterGoal: number;
  lastWaterTimestamp?: number;
  deskStretchesToday: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  isDemo: boolean;
  money: number;
  selectedTheme: string;
  soundEnabled?: boolean;
  currentPetIndex: number;
  pets: PetModel[];
  items: InventoryItem[];
  hallOfFame?: HallOfFameEntry[];
  lastSaved?: number;
  unlockedThemes?: string[];
  unlockedHabitats?: string[];
  selectedHabitat?: string;
  // Productivity & Lifestyle Systems
  dailyStreak?: DailyStreakInfo;
  dailyHabits?: DailyHabit[];
  dailyHabitsDate?: string; // YYYY-MM-DD
  bioSync?: BioSyncState;
  activeSoundscape?: 'off' | 'rain' | 'drone' | 'matrix';
}

