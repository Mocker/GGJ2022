export interface ItemEffects {
  energy?: number;
  hunger?: number;
  happiness?: number;
  cleanliness?: number;
  cureSick?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  effects: ItemEffects;
  quantity: number;
  icon?: string;
  shopValue?: number;
}

export interface ShopItem {
  name: string;
  description: string;
  effects: ItemEffects;
  shopValue: number;
  tags?: Record<string, number>;
}
