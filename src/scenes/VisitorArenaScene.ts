import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { MockLocalPetServerClient, LobbyPetSummary } from '../services/network/serverClient';

export class VisitorArenaScene extends Phaser.Scene {
  private lobbyPets: LobbyPetSummary[] = [];
  private selectedIdx = 0;

  private titleText!: Phaser.GameObjects.Text;
  private tamerText!: Phaser.GameObjects.Text;
  private petInfoText!: Phaser.GameObjects.Text;
  private dnaText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private visitorSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super('VisitorArenaScene');
  }

  async create(): Promise<void> {
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Deep cyan space arena background
    const bg = this.add.graphics();
    bg.fillStyle(0x04111d, 0.96);
    bg.fillRect(200, 200, 400, 400);
    bg.setMask(mask);

    this.titleText = this.add.text(400, 225, '🌐 GLOBAL TAMER SHOWCASE 🌐', {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    this.tamerText = this.add.text(400, 255, 'LOADING SHOWCASE...', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#facc15',
    }).setOrigin(0.5).setMask(mask);

    this.visitorSprite = this.add.sprite(400, 345, 'pet-snuffler-idle')
      .setDisplaySize(140, 140)
      .setDepth(10)
      .setMask(mask);

    this.petInfoText = this.add.text(400, 425, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#f8fafc',
    }).setOrigin(0.5).setMask(mask);

    this.dnaText = this.add.text(400, 450, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#94a3b8',
    }).setOrigin(0.5).setMask(mask);

    this.promptText = this.add.text(400, 520, '1: NEXT TAMER   2: SPAR DUEL   3: EXIT', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    // Fetch Lobby
    this.lobbyPets = await MockLocalPetServerClient.getInstance().fetchLobby();
    this.selectedIdx = 0;
    this.updateDisplay();

    SoundService.getInstance().playBgm('ambient');
  }

  private updateDisplay(): void {
    if (this.lobbyPets.length === 0) {
      this.tamerText.setText('NO TAMERS ONLINE');
      return;
    }

    const current = this.lobbyPets[this.selectedIdx % this.lobbyPets.length];
    this.tamerText.setText(`TAMER: ${current.owner.toUpperCase()}`);

    const spriteKey = `pet-${current.type === 'bacteria' ? 'germ' : current.type}-idle`;
    if (this.textures.exists(spriteKey)) {
      this.visitorSprite.setTexture(spriteKey);
      if (this.anims.exists(spriteKey)) {
        this.visitorSprite.play({ key: spriteKey, repeat: -1 });
      }
    }

    this.petInfoText.setText(`${current.petName.toUpperCase()} • LVL ${current.level} [${current.stage.toUpperCase()}]`);
    this.dnaText.setText(`DNA: ${current.dnaHash} • RANK: [${current.ivGrade}] • GEN: ${current.generation}`);
  }

  public onNavUp(): void {
    this.onButton1();
  }

  public onNavDown(): void {
    this.onButton1();
  }

  public onNavLeft(): void {
    this.onButton1();
  }

  public onNavRight(): void {
    this.onButton1();
  }

  public onConfirm(): void {
    this.onButton2();
  }

  public onCancel(): void {
    this.onButton3();
  }

  public onButton1(): void {
    if (this.lobbyPets.length > 0) {
      this.selectedIdx = (this.selectedIdx + 1) % this.lobbyPets.length;
      SoundService.getInstance().playSelect();
      this.updateDisplay();
    }
  }

  public onButton2(): void {
    // Launch sparring duel in BattleScene
    SoundService.getInstance().playStartup();
    this.scene.start('BattleScene');
    this.scene.stop('VisitorArenaScene');
  }

  public onButton3(): void {
    SoundService.getInstance().playBack();
    this.scene.start('PetScene');
    this.scene.stop('VisitorArenaScene');
  }
}
