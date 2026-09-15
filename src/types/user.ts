import { PetModel } from './pet';
import { InventoryItem } from './item';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  isDemo: boolean;
  money: number;
  selectedTheme: string;
  currentPetIndex: number;
  pets: PetModel[];
  items: InventoryItem[];
}
