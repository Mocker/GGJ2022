import type Phaser from 'phaser';
import { PetModel } from '../types/pet';

export type MiniGameCategory = 'reflex' | 'puzzle' | 'dungeon' | 'tactics';

export interface MiniGameReward {
  exp: number;
  coins: number;
  statBonus?: {
    stat: 'attack' | 'defense' | 'discipline' | 'happiness';
    value: number;
  };
  summary: string;
}

export interface MiniGameContext {
  pet: PetModel;
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  mask: Phaser.Display.Masks.GeometryMask;
  onGameOver: (reward: MiniGameReward) => void;
}

export interface MiniGamePlugin {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly category: MiniGameCategory;
  readonly description: string;
  readonly trainsStat: 'attack' | 'defense' | 'discipline' | 'happiness';

  init(context: MiniGameContext): void;
  update?(time: number, delta: number): void;
  handleButton(btn: 1 | 2 | 3): void;
  destroy(): void;
}
