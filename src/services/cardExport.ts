import type Phaser from 'phaser';
import { PetModel } from '../types/pet';
import { UserProfile } from '../types/user';
import { expressPhenotype } from '../genetics/evolutionEngine';

export class CardExportService {
  public static async exportTamerCard(
    pet: PetModel,
    profile: UserProfile,
    scene?: Phaser.Scene
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    // 1. Determine Dynamic Color Scheme from Pet Genetics & Type
    let hue = 195; // Default cyber cyan
    let tintHex = 0x38bdf8;
    let ivSummary = 'STANDARD ISSUE';
    let ivGrade = 'B';

    if (pet.genome) {
      hue = pet.genome.chromosomes.colorHue;
      tintHex = pet.genome.chromosomes.auraTint;
      const pheno = expressPhenotype(pet.genome);
      ivSummary = `${pheno.primaryTraitBadge} // IV ${pheno.ivTotal}/124`;
      ivGrade = pheno.ivGrade;
    } else {
      const typeHues: Record<string, number> = {
        tadpole: 215,
        bacteria: 285,
        dino: 140,
        snuffler: 30,
        sunfish: 190,
        'egg-blue': 210,
        'egg-green': 135,
        'egg-yellow': 48,
      };
      hue = typeHues[pet.type] ?? (pet.stage === 'egg' ? (typeHues[pet.eggType] ?? 195) : 195);
    }

    const primaryColor = `hsl(${hue}, 85%, 60%)`;
    const secondaryColor = `hsl(${(hue + 40) % 360}, 90%, 65%)`;
    const bgDark = `hsl(${hue}, 40%, 6%)`;
    const bgMid = `hsl(${(hue + 25) % 360}, 35%, 11%)`;
    const boxBg = `hsla(${hue}, 35%, 10%, 0.88)`;
    const boxBorder = `hsla(${hue}, 50%, 28%, 0.8)`;
    const textMuted = `hsl(${hue}, 20%, 70%)`;

    // 2. Card Background Gradient & Cyber Grid
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 1200);
    bgGradient.addColorStop(0, bgDark);
    bgGradient.addColorStop(0.5, bgMid);
    bgGradient.addColorStop(1, '#040711');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 1200);

    // Dynamic Cyber Grid lines matching color scheme
    ctx.strokeStyle = `hsla(${hue}, 85%, 60%, 0.08)`;
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1200);
      ctx.stroke();
    }
    for (let y = 0; y < 1200; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Outer Neon Card Borders
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 1160);

    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 1140);

    // Decorative corner notches
    ctx.fillStyle = primaryColor;
    ctx.fillRect(16, 16, 24, 8);
    ctx.fillRect(16, 16, 8, 24);
    ctx.fillRect(760, 16, 24, 8);
    ctx.fillRect(776, 16, 8, 24);
    ctx.fillRect(16, 1176, 24, 8);
    ctx.fillRect(16, 1160, 8, 24);
    ctx.fillRect(760, 1176, 24, 8);
    ctx.fillRect(776, 1160, 8, 24);

    // 3. Header Section
    ctx.fillStyle = secondaryColor;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('THEY MIGHT BYTE', 400, 85);

    ctx.fillStyle = primaryColor;
    ctx.font = '16px monospace';
    ctx.fillText(`DIGIVICE TAMER IDENTITY CARD // GEN ${pet.stats.generation ?? 1} // RANK ${ivGrade}`, 400, 118);

    // 4. Pet Showcase Art Box (100, 150, 600, 480)
    ctx.fillStyle = '#030712';
    ctx.fillRect(100, 150, 600, 480);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 150, 600, 480);

    // Glowing Aura behind Pet
    const auraGrad = ctx.createRadialGradient(400, 380, 40, 400, 380, 200);
    auraGrad.addColorStop(0, `hsla(${hue}, 90%, 65%, 0.35)`);
    auraGrad.addColorStop(0.7, `hsla(${hue}, 80%, 45%, 0.12)`);
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(100, 150, 600, 480);

    // 5. Draw Actual Pet Sprite onto Offscreen Canvas
    let drewPetSprite = false;
    const typeKey = pet.type === 'bacteria' ? 'germ' : pet.type;
    const atlasKey = pet.stage === 'egg' ? `pet-${pet.eggType}-idle` : `pet-${typeKey}-idle`;

    if (scene && scene.textures && scene.textures.exists(atlasKey)) {
      try {
        const tex = scene.textures.get(atlasKey);
        const frameNames = tex.getFrameNames();
        if (frameNames.length > 0) {
          const f = tex.get(frameNames[0]);
          const sourceImg = tex.getSourceImage() as CanvasImageSource;

          if (sourceImg) {
            // Offscreen canvas for crisp pixel scaling and color tinting
            const offscreen = document.createElement('canvas');
            offscreen.width = 340;
            offscreen.height = 340;
            const oCtx = offscreen.getContext('2d');

            if (oCtx) {
              oCtx.imageSmoothingEnabled = false;
              oCtx.drawImage(
                sourceImg,
                f.cutX, f.cutY, f.cutWidth, f.cutHeight,
                0, 0, 340, 340
              );

              // Apply genetic phenotype tint if pet is not an egg
              if (pet.stage !== 'egg' && tintHex) {
                const r = (tintHex >> 16) & 0xff;
                const g = (tintHex >> 8) & 0xff;
                const b = tintHex & 0xff;

                oCtx.globalCompositeOperation = 'multiply';
                oCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                oCtx.fillRect(0, 0, 340, 340);

                oCtx.globalCompositeOperation = 'destination-atop';
                oCtx.drawImage(
                  sourceImg,
                  f.cutX, f.cutY, f.cutWidth, f.cutHeight,
                  0, 0, 340, 340
                );
              }

              // Draw offscreen sprite onto card canvas
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(offscreen, 230, 210, 340, 340);
              drewPetSprite = true;
            }
          }
        }
      } catch (err) {
        console.warn('Could not extract pet texture from scene:', err);
      }
    }

    // Fallback: If sprite could not be extracted, render stylized insignia
    if (!drewPetSprite) {
      ctx.fillStyle = boxBg;
      ctx.beginPath();
      ctx.arc(400, 380, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 32px monospace';
      ctx.fillText(pet.name.toUpperCase(), 400, 390);
    }

    // Branch Ribbon at Bottom of Art Box
    const branch = (pet.stats.branchType ?? 'neutral').toUpperCase();
    const branchBadgeColor =
      branch === 'HERO' ? '#10b981' :
      branch === 'SHADOW' ? '#a855f7' :
      branch === 'CYBER' ? '#06b6d4' : primaryColor;

    ctx.fillStyle = branchBadgeColor;
    ctx.fillRect(250, 595, 300, 35);
    ctx.fillStyle = '#050a18';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`[ ${branch} BRANCH ]`, 400, 618);

    // 6. Pet Identity Block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px monospace';
    ctx.fillText(pet.name.toUpperCase(), 400, 690);

    ctx.fillStyle = textMuted;
    ctx.font = '18px monospace';
    ctx.fillText(
      `STAGE: ${pet.stage.toUpperCase()} | LVL: ${pet.stats.level} | TAMER: ${profile.username}`,
      400,
      722
    );

    ctx.fillStyle = secondaryColor;
    ctx.font = '14px monospace';
    ctx.fillText(ivSummary, 400, 746);

    // 7. Stat Matrix Blocks (6 Cards)
    const stats = [
      { label: 'MAX HP', val: pet.stats.maxHp },
      { label: 'ATTACK', val: pet.stats.attack },
      { label: 'DEFENSE', val: pet.stats.defense },
      { label: 'DISCIPLINE', val: `${pet.stats.discipline ?? 70}%` },
      { label: 'BATTLES WON', val: `${pet.stats.battlesWon ?? 0} W` },
      { label: 'FOCUS SPRINT', val: `${pet.stats.focusMinutes ?? 0}m` },
    ];

    const boxW = 180;
    const boxH = 75;
    const startX = 100;
    const startY = 775;

    stats.forEach((s, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = startX + col * (boxW + 30);
      const y = startY + row * (boxH + 18);

      // Box background & border
      ctx.fillStyle = boxBg;
      ctx.fillRect(x, y, boxW, boxH);
      ctx.strokeStyle = boxBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxW, boxH);

      // Top colored accent strip on each stat box
      ctx.fillStyle = primaryColor;
      ctx.fillRect(x, y, boxW, 4);

      // Label & Value
      ctx.fillStyle = textMuted;
      ctx.font = '13px monospace';
      ctx.fillText(s.label, x + boxW / 2, y + 28);

      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 22px monospace';
      ctx.fillText(String(s.val), x + boxW / 2, y + 58);
    });

    // 8. DNA Hash Barcode & Digital Security Seal
    const dnaHash = pet.genome?.dnaHash || `DNA-${pet.id.slice(-8).toUpperCase()}`;

    ctx.fillStyle = primaryColor;
    for (let b = 100; b < 700; b += 8) {
      const seed = Math.sin(b * 19.3 + hue);
      if (seed > -0.25) {
        ctx.fillRect(b, 1005, 4, 38);
      }
    }

    ctx.fillStyle = textMuted;
    ctx.font = '12px monospace';
    ctx.fillText(`AUTHENTIC GENOME SEAL // ${dnaHash} // GEN ${pet.stats.generation ?? 1}`, 400, 1075);

    ctx.fillStyle = `hsla(${hue}, 40%, 50%, 0.8)`;
    ctx.font = '11px monospace';
    ctx.fillText('100% Offline-First Tamper-Sealed Digital Asset • Formatted for 2.5x3.5" Printful Holographic Foil', 400, 1098);

    // 9. Trigger instant PNG download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `tamer-card-${pet.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();

    return dataUrl;
  }
}
