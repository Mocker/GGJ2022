import { PetModel } from '../types/pet';
import { UserProfile } from '../types/user';

export class CardExportService {
  public static async exportTamerCard(pet: PetModel, profile: UserProfile): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    // 1. Dark Cyber Card Background
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 1200);
    bgGradient.addColorStop(0, '#0a1128');
    bgGradient.addColorStop(0.5, '#101f42');
    bgGradient.addColorStop(1, '#050a18');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 1200);

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
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

    // Outer Neon Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 1160);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 1140);

    // 2. Header
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('THEY MIGHT BYTE', 400, 90);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '18px monospace';
    ctx.fillText(`DIGIVICE TAMER IDENTITY CARD // GEN ${pet.stats.generation ?? 1}`, 400, 125);

    // 3. Pet Art Display Box
    ctx.fillStyle = '#050d1a';
    ctx.fillRect(100, 160, 600, 480);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(100, 160, 600, 480);

    // Pet Sprite placeholder / render
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(400, 400, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px monospace';
    ctx.fillText('👾', 400, 440);

    // Branch Ribbon
    const branch = (pet.stats.branchType ?? 'neutral').toUpperCase();
    ctx.fillStyle = branch === 'HERO' ? '#10b981' : branch === 'SHADOW' ? '#a855f7' : branch === 'CYBER' ? '#06b6d4' : '#64748b';
    ctx.fillRect(250, 610, 300, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`[ ${branch} BRANCH ]`, 400, 635);

    // 4. Pet Identity Info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px monospace';
    ctx.fillText(pet.name.toUpperCase(), 400, 710);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px monospace';
    ctx.fillText(`STAGE: ${pet.stage.toUpperCase()} | LEVEL: ${pet.stats.level} | TAMER: ${profile.username}`, 400, 745);

    // 5. Stat Block Matrix
    const stats = [
      { label: 'MAX HP', val: pet.stats.maxHp },
      { label: 'ATTACK', val: pet.stats.attack },
      { label: 'DEFENSE', val: pet.stats.defense },
      { label: 'DISCIPLINE', val: `${pet.stats.discipline ?? 70}%` },
      { label: 'BATTLES WON', val: `${pet.stats.battlesWon ?? 0} W` },
      { label: 'FOCUS MINS', val: `${pet.stats.focusMinutes ?? 0}m` },
    ];

    const boxW = 180;
    const boxH = 80;
    const startX = 100;
    const startY = 780;

    stats.forEach((s, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = startX + col * (boxW + 30);
      const y = startY + row * (boxH + 20);

      ctx.fillStyle = '#0c1527';
      ctx.fillRect(x, y, boxW, boxH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxW, boxH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(s.label, x + boxW / 2, y + 30);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(String(s.val), x + boxW / 2, y + 62);
    });

    // 6. Security Barcode & POD Footer
    ctx.fillStyle = '#334155';
    for (let b = 100; b < 700; b += 8) {
      if (Math.sin(b * 12) > -0.2) {
        ctx.fillRect(b, 1020, 4, 40);
      }
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText(`SERIAL #${pet.id} // ANNA AGI POD-READY DIGITAL ASSET // GOAL-003`, 400, 1090);
    ctx.fillText('100% Zero-Debt Digital Product • Formatted for 2.5x3.5" Printful Holographic Sticker', 400, 1115);

    // 7. Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `tamer-card-${pet.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();

    return dataUrl;
  }
}
