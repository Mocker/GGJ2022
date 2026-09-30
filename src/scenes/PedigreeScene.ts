import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { expressPhenotype } from '../genetics/evolutionEngine';
import { SoundService } from '../services/audio';

export class PedigreeScene extends Phaser.Scene {
  constructor() {
    super('PedigreeScene');
  }

  create(): void {
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Deep slate genetics background
    const bg = this.add.graphics();
    bg.fillStyle(0x060f1e, 0.96);
    bg.fillRect(200, 200, 400, 400);
    bg.setMask(mask);

    // Header
    this.add.text(400, 225, '🧬 PEDIGREE & GENE MATRIX 🧬', {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();

    if (!pet || !pet.genome) {
      this.add.text(400, 360, 'NO GENOME DATA\nHatch an egg to sequence DNA.', {
        fontFamily: 'beryl-digivice',
        fontSize: '13px',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 8,
      }).setOrigin(0.5).setMask(mask);
      return;
    }

    const genome = pet.genome;
    const pheno = expressPhenotype(genome);

    // 1. Identity & DNA Hash
    this.add.text(400, 255, `${pet.name.toUpperCase()} • GEN ${genome.generation}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '15px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    this.add.text(400, 275, `HASH: ${genome.dnaHash}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    // 2. IV Stats Radar Box
    const ivBox = this.add.graphics().setMask(mask);
    ivBox.fillStyle(0x131f37, 0.9);
    ivBox.fillRoundedRect(220, 298, 360, 68, 6);
    ivBox.lineStyle(1, 0x38bdf8, 0.6);
    ivBox.strokeRoundedRect(220, 298, 360, 68, 6);

    const c = genome.chromosomes;
    this.add.text(235, 308, `RANK: [${pheno.ivGrade}]  IV TOTAL: ${pheno.ivTotal} / 124`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#10b981',
    }).setMask(mask);

    this.add.text(235, 328, `HP: ${c.ivHp}/31   ATK: ${c.ivAttack}/31   DEF: ${c.ivDefense}/31   SPD: ${c.ivSpeed}/31`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#f8fafc',
    }).setMask(mask);

    this.add.text(235, 346, `METABOLISM: ${(c.metabolicEfficiency * 100).toFixed(0)}%   FOCUS EFF: ${(c.focusAffinity * 100).toFixed(0)}%`, {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#94a3b8',
    }).setMask(mask);

    // 3. Family Lineage & Ancestors
    const fam = genome.familyTree;
    const lineageBox = this.add.graphics().setMask(mask);
    lineageBox.fillStyle(0x131f37, 0.9);
    lineageBox.fillRoundedRect(220, 376, 360, 84, 6);
    lineageBox.lineStyle(1, 0x38bdf8, 0.6);
    lineageBox.strokeRoundedRect(220, 376, 360, 84, 6);

    this.add.text(235, 386, `LINEAGE: ${fam.lineageId}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#facc15',
    }).setMask(mask);

    const sireName = fam.parents.sire || 'Origin Primordial';
    const damName = fam.parents.dam || 'None (Spontaneous)';
    this.add.text(235, 406, `PARENTS: ${sireName.slice(0, 14)} x ${damName.slice(0, 14)}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#cbd5e1',
    }).setMask(mask);

    const ancestors = fam.ancestorNames.length > 0 ? fam.ancestorNames.slice(-3).join(' ➔ ') : 'First Generation Founder';
    this.add.text(235, 424, `TREE: ${ancestors}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#94a3b8',
    }).setMask(mask);

    const traitsStr = genome.traits.length > 0 ? genome.traits.join(', ') : 'Pure / Standard';
    this.add.text(235, 442, `TRAITS: ${traitsStr}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#38bdf8',
    }).setMask(mask);

    // 4. Action Prompts
    this.add.text(400, 520, '2: EXPORT PASSPORT   3: RETURN', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);
  }

  public onConfirm(): void {
    this.onButton2();
  }

  public onCancel(): void {
    this.onButton3();
  }

  public onButton1(): void {
    // Reserved
  }

  public async onButton2(): Promise<void> {
    const storage = StorageService.getInstance();
    const pet = storage.getCurrentPet();
    if (!pet) return;

    try {
      const { PetPassportService } = await import('../services/network/petPassport');
      const token = PetPassportService.exportPassport(pet);
      // Copy to clipboard or prompt
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(token);
      }
      SoundService.getInstance().playMoney();
    } catch (e) {
      console.warn('Passport export notice:', e);
    }
  }

  public onButton3(): void {
    SoundService.getInstance().playBack();
    this.scene.start('PetScene');
    this.scene.stop('PedigreeScene');
  }
}
