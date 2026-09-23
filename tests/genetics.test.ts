import { describe, it, expect } from 'vitest';
import { generateRandomGenome, crossoverGenomes, expressPhenotype, hueToHex } from '../src/genetics/evolutionEngine';

describe('Evolutionary Genetics & Family Trees', () => {
  it('generates a valid random genome with full chromosome loci', () => {
    const genome = generateRandomGenome(1, 'Prime Founder');

    expect(genome.generation).toBe(1);
    expect(genome.dnaHash).toMatch(/^DNA-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(genome.familyTree.ancestorNames).toContain('Prime Founder');

    const c = genome.chromosomes;
    expect(c.colorHue).toBeGreaterThanOrEqual(0);
    expect(c.colorHue).toBeLessThanOrEqual(360);
    expect(c.scaleModifier).toBeGreaterThanOrEqual(0.85);
    expect(c.scaleModifier).toBeLessThanOrEqual(1.25);

    // Individual Values (IVs) between 0 and 31
    expect(c.ivHp).toBeGreaterThanOrEqual(0);
    expect(c.ivHp).toBeLessThanOrEqual(31);
    expect(c.ivAttack).toBeGreaterThanOrEqual(0);
    expect(c.ivAttack).toBeLessThanOrEqual(31);
  });

  it('expresses phenotype with IV grades and hex tints', () => {
    const genome = generateRandomGenome(1);
    const pheno = expressPhenotype(genome);

    expect(pheno.ivTotal).toBe(
      genome.chromosomes.ivHp +
      genome.chromosomes.ivAttack +
      genome.chromosomes.ivDefense +
      genome.chromosomes.ivSpeed
    );
    expect(['S', 'A', 'B', 'C']).toContain(pheno.ivGrade);
    expect(typeof pheno.tintHex).toBe('number');
    expect(pheno.summary).toContain(`GEN 1`);
  });

  it('performs crossover between parents, increments generation, and builds lineage', () => {
    const parentA = generateRandomGenome(1, 'Alpha');
    const parentB = generateRandomGenome(1, 'Beta');

    const child = crossoverGenomes(parentA, parentB, 0.1);

    expect(child.generation).toBe(2);
    expect(child.familyTree.parents.sire).toBe(parentA.dnaHash);
    expect(child.familyTree.parents.dam).toBe(parentB.dnaHash);
    expect(child.familyTree.ancestorNames).toEqual(
      expect.arrayContaining(['Alpha', 'Beta'])
    );
  });

  it('converts hue degrees to valid RGB hex integers', () => {
    const cyan = hueToHex(180);
    expect(cyan).toBeGreaterThan(0);
    expect(cyan).toBeLessThanOrEqual(0xffffff);

    const red = hueToHex(0);
    expect(red).toBeGreaterThan(0);
  });
});
