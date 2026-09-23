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
}
