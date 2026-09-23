import { MiniGamePlugin } from './types';

export class MiniGameRegistry {
  private static instance: MiniGameRegistry;
  private plugins = new Map<string, MiniGamePlugin>();

  private constructor() {}

  public static getInstance(): MiniGameRegistry {
    if (!MiniGameRegistry.instance) {
      MiniGameRegistry.instance = new MiniGameRegistry();
    }
    return MiniGameRegistry.instance;
  }

  public register(plugin: MiniGamePlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  public getAll(): MiniGamePlugin[] {
    return Array.from(this.plugins.values());
  }

  public get(id: string): MiniGamePlugin | undefined {
    return this.plugins.get(id);
  }

  public getDailyFeatured(): MiniGamePlugin {
    const list = this.getAll();
    if (list.length === 0) throw new Error('No mini-games registered');
    // Deterministic daily rotation
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return list[dayOfYear % list.length];
  }
}
