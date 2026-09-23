import { describe, it, expect } from 'vitest';
import { MiniGameRegistry } from '../src/minigames/registry';
import { MiniGamePlugin, MiniGameContext } from '../src/minigames/types';

class MockReflexPlugin implements MiniGamePlugin {
  id = 'mock-reflex';
  title = 'Cyber Reflex';
  description = 'Reflex timing test';
  category = 'reflex' as const;
  icon = 'reflex-icon';
  init(_context: MiniGameContext): void {}
  update(_time: number, _delta: number): void {}
  destroy(): void {}
}

class MockPuzzlePlugin implements MiniGamePlugin {
  id = 'mock-puzzle';
  title = 'Matrix Puzzle';
  description = 'Memory pattern test';
  category = 'puzzle' as const;
  icon = 'puzzle-icon';
  init(_context: MiniGameContext): void {}
  update(_time: number, _delta: number): void {}
  destroy(): void {}
}

class MockDungeonPlugin implements MiniGamePlugin {
  id = 'mock-dungeon';
  title = 'Grid Crawler';
  description = 'Dungeon crawl test';
  category = 'dungeon' as const;
  icon = 'dungeon-icon';
  init(_context: MiniGameContext): void {}
  update(_time: number, _delta: number): void {}
  destroy(): void {}
}

describe('Mini-Game Plugin Framework & Registry', () => {
  it('registers and retrieves plugins across multiple genres', () => {
    const registry = MiniGameRegistry.getInstance();
    const reflex = new MockReflexPlugin();
    const puzzle = new MockPuzzlePlugin();
    const dungeon = new MockDungeonPlugin();

    registry.register(reflex);
    registry.register(puzzle);
    registry.register(dungeon);

    expect(registry.get('mock-reflex')).toBe(reflex);
    expect(registry.get('mock-puzzle')).toBe(puzzle);
    expect(registry.get('mock-dungeon')).toBe(dungeon);

    const all = registry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(3);

    const categories = all.map((p) => p.category);
    expect(categories).toContain('reflex');
    expect(categories).toContain('puzzle');
    expect(categories).toContain('dungeon');
  });

  it('selects a daily featured mini-game deterministically', () => {
    const registry = MiniGameRegistry.getInstance();
    const featured1 = registry.getDailyFeatured();
    const featured2 = registry.getDailyFeatured();
    expect(featured1.id).toBe(featured2.id);
  });
});
