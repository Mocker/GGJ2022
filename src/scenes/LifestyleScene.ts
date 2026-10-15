import Phaser from 'phaser';
import { StorageService } from '../services/storage';
import { SoundService } from '../services/audio';
import { DigiviceScene } from './DigiviceScene';
import { expressPhenotype } from '../genetics/evolutionEngine';

export class LifestyleScene extends Phaser.Scene {
  private activeTab: 1 | 2 | 3 = 1;
  private selectedIndex = 0;
  private contentContainer!: Phaser.GameObjects.Container;
  private tabLeftText!: Phaser.GameObjects.Text;
  private tabMidText!: Phaser.GameObjects.Text;
  private tabRightText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;

  // Stretch countdown state
  private isStretching = false;
  private stretchSecondsRemaining = 0;
  private stretchTimer: Phaser.Time.TimerEvent | null = null;
  private petSprite: Phaser.GameObjects.Sprite | null = null;

  constructor() {
    super('LifestyleScene');
  }

  create(): void {
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(200, 200, 400, 400);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskGfx);

    // Deep Cyber LCD Background
    const bg = this.add.graphics();
    bg.fillStyle(0x07111e, 0.96);
    bg.fillRect(200, 200, 400, 400);
    bg.setMask(mask);

    // Header Title
    this.add.text(400, 218, '📋 CYBER PROTOCOL & LIFESTYLE', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#38bdf8',
    }).setOrigin(0.5).setMask(mask);

    // Sub-Tabs Header
    const tabBG = this.add.graphics();
    tabBG.fillStyle(0x132338, 0.9);
    tabBG.fillRoundedRect(210, 234, 120, 24, 4);
    tabBG.fillRoundedRect(340, 234, 120, 24, 4);
    tabBG.fillRoundedRect(470, 234, 120, 24, 4);
    tabBG.setMask(mask);

    const tabStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      align: 'center',
    };

    this.tabLeftText = this.add.text(270, 246, '1. PROTOCOL', tabStyle).setOrigin(0.5).setMask(mask);
    this.tabMidText = this.add.text(400, 246, '2. BIO-SYNC', tabStyle).setOrigin(0.5).setMask(mask);
    this.tabRightText = this.add.text(530, 246, '3. STREAK', tabStyle).setOrigin(0.5).setMask(mask);

    // Clickable tabs
    this.tabLeftText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.switchTab(1));
    this.tabMidText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.switchTab(2));
    this.tabRightText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.switchTab(3));

    // Dynamic Content Container
    this.contentContainer = this.add.container(0, 0).setMask(mask);

    // Toast
    this.toastText = this.add.text(400, 390, '', {
      fontFamily: 'beryl-digivice',
      fontSize: '14px',
      color: '#facc15',
      backgroundColor: '#030712ee',
      padding: { x: 12, y: 6 },
      align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(35).setMask(mask);

    // Footer Hint
    this.add.text(400, 584, '▲/▼: Move  ENTER: Select  ESC: Back', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#64748b',
    }).setOrigin(0.5).setMask(mask);

    this.activeTab = 1;
    this.selectedIndex = 0;
    this.renderTab();
  }

  private showToast(msg: string): void {
    this.toastText.setText(msg);
    this.toastText.setAlpha(1);
    this.tweens.killTweensOf(this.toastText);
    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      delay: 1800,
      duration: 300,
    });
  }

  private switchTab(tab: 1 | 2 | 3): void {
    if (this.isStretching) return;
    this.activeTab = tab;
    this.selectedIndex = 0;
    SoundService.getInstance().playSelect();
    this.renderTab();
  }

  private renderTab(): void {
    this.contentContainer.removeAll(true);
    this.updateTabHeaders();

    if (this.activeTab === 1) {
      this.renderProtocolTab();
    } else if (this.activeTab === 2) {
      this.renderBioSyncTab();
    } else {
      this.renderStreakTab();
    }
  }

  private updateTabHeaders(): void {
    this.tabLeftText.setColor(this.activeTab === 1 ? '#38bdf8' : '#94a3b8');
    this.tabMidText.setColor(this.activeTab === 2 ? '#38bdf8' : '#94a3b8');
    this.tabRightText.setColor(this.activeTab === 3 ? '#38bdf8' : '#94a3b8');
  }

  // --- TAB 1: PROTOCOL MATRIX ---
  private renderProtocolTab(): void {
    const storage = StorageService.getInstance();
    const habits = storage.getDailyHabits();
    const completedCount = habits.filter((h) => h.completed).length;

    // Progress Bar
    const progressText = this.add.text(220, 266, `PROTOCOL PROGRESS: ${completedCount}/${habits.length}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#38bdf8',
    });

    const progBarGfx = this.add.graphics();
    progBarGfx.fillStyle(0x1e293b, 1);
    progBarGfx.fillRoundedRect(220, 282, 360, 6, 3);
    progBarGfx.fillStyle(0x10b981, 1);
    progBarGfx.fillRoundedRect(220, 282, 360 * (completedCount / habits.length), 6, 3);

    this.contentContainer.add([progressText, progBarGfx]);

    if (completedCount === habits.length) {
      const bonusText = this.add.text(400, 296, '⭐ PERFECT PROTOCOL BONUS ACTIVE! (+15🪙)', {
        fontFamily: 'beryl-digivice',
        fontSize: '11px',
        color: '#facc15',
      }).setOrigin(0.5);
      this.contentContainer.add(bonusText);
    }

    // List of habits
    const startY = 308;
    const lineHeight = 33;

    habits.forEach((habit, idx) => {
      const isSelected = this.selectedIndex === idx;
      const checkMark = habit.completed ? '☑' : '☐';
      const color = habit.completed ? '#10b981' : isSelected ? '#f8fafc' : '#94a3b8';
      const pointer = isSelected ? '▶ ' : '  ';

      const label = `${pointer}${checkMark} ${habit.label}`;
      const rewardBadge = `+${habit.rewardCoins}🪙`;

      const txt = this.add.text(220, startY + idx * lineHeight, label, {
        fontFamily: 'beryl-digivice',
        fontSize: '12px',
        color,
      });

      const badge = this.add.text(575, startY + idx * lineHeight, rewardBadge, {
        fontFamily: 'beryl-digivice',
        fontSize: '11px',
        color: habit.completed ? '#10b981' : '#facc15',
      }).setOrigin(1, 0);

      const desc = this.add.text(244, startY + idx * lineHeight + 16, habit.description, {
        fontFamily: 'beryl-digivice',
        fontSize: '9px',
        color: '#64748b',
      });

      this.contentContainer.add([txt, badge, desc]);
    });

    // Exit Button option
    const isExitSelected = this.selectedIndex === habits.length;
    const exitTxt = this.add.text(400, 552, `${isExitSelected ? '▶ ' : ''}[ RETURN TO DIGIVICE ]`, {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: isExitSelected ? '#38bdf8' : '#64748b',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    exitTxt.on('pointerdown', () => this.returnToPetScene());
    this.contentContainer.add(exitTxt);
  }

  // --- TAB 2: BIO-SYNC & HYDRATION ---
  private renderBioSyncTab(): void {
    const storage = StorageService.getInstance();
    const bio = storage.getBioSync();
    const pet = storage.getCurrentPet();

    if (this.isStretching) {
      this.renderActiveStretchScreen();
      return;
    }

    // Section 1: Hydration Tracker
    const hydroTitle = this.add.text(220, 268, '💧 HYDRO-BYTE HYDRATION MATRIX', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#38bdf8',
    });

    // Water Glass Icons (e.g. 6 goal)
    let glassStr = '';
    for (let i = 0; i < 6; i++) {
      glassStr += i < bio.waterDrunkToday ? ' 💧 ' : ' ⚪ ';
    }
    const glassesTxt = this.add.text(400, 300, glassStr, {
      fontFamily: 'beryl-digivice',
      fontSize: '20px',
    }).setOrigin(0.5);

    const hydroStatus = this.add.text(400, 328, `${bio.waterDrunkToday} / ${bio.waterGoal} Glasses Drank Today`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#94a3b8',
    }).setOrigin(0.5);

    // Hydrate button option
    const isHydrateSelected = this.selectedIndex === 0;
    const btnHydrate = this.add.text(400, 355, `${isHydrateSelected ? '▶ ' : ''}[ 💧 DRINK WATER (+2🪙, +Clean/Hap) ]`, {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: isHydrateSelected ? '#38bdf8' : '#e2e8f0',
      backgroundColor: '#0e2439',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnHydrate.on('pointerdown', () => this.executeAction());

    // Section 2: Desk Stretch Bio-Break
    const stretchTitle = this.add.text(220, 395, '🧘 BIO-SYNC DESK STRETCH', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#38bdf8',
    });

    const stretchDesc = this.add.text(400, 422, `Desk Resets Today: ${bio.deskStretchesToday} | Relieves eye & posture fatigue`, {
      fontFamily: 'beryl-digivice',
      fontSize: '10px',
      color: '#94a3b8',
    }).setOrigin(0.5);

    const isStretchSelected = this.selectedIndex === 1;
    const btnStretch = this.add.text(400, 452, `${isStretchSelected ? '▶ ' : ''}[ 🧘 10s GUIDED DESK STRETCH (+3🪙) ]`, {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: isStretchSelected ? '#10b981' : '#e2e8f0',
      backgroundColor: '#0c2e27',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnStretch.on('pointerdown', () => this.startDeskStretch());

    // Exit Button option
    const isExitSelected = this.selectedIndex === 2;
    const exitTxt = this.add.text(400, 540, `${isExitSelected ? '▶ ' : ''}[ RETURN TO DIGIVICE ]`, {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: isExitSelected ? '#38bdf8' : '#64748b',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    exitTxt.on('pointerdown', () => this.returnToPetScene());

    this.contentContainer.add([
      hydroTitle,
      glassesTxt,
      hydroStatus,
      btnHydrate,
      stretchTitle,
      stretchDesc,
      btnStretch,
      exitTxt,
    ]);
  }

  private renderActiveStretchScreen(): void {
    const mask = this.contentContainer.mask;
    const pet = StorageService.getInstance().getCurrentPet();
    const petKey = pet && pet.stage !== 'egg' ? `pet-${pet.type === 'bacteria' ? 'germ' : pet.type}-happy` : 'pet-tadpole-happy';

    const stretchTitle = this.add.text(400, 280, '🧘 GUIDED POSTURE & BREATHING 🧘', {
      fontFamily: 'beryl-digivice',
      fontSize: '13px',
      color: '#10b981',
    }).setOrigin(0.5);

    const countdownTxt = this.add.text(400, 320, `${this.stretchSecondsRemaining}s`, {
      fontFamily: 'beryl-digivice',
      fontSize: '32px',
      color: '#facc15',
    }).setOrigin(0.5);

    const instructions = [
      'Roll your shoulders back. Relax your jaw.',
      'Look 20 feet away at a distant horizon.',
      'Take a deep 4-second breath in...',
      'Slowly release tension on exhale...',
      'Gentle neck tilt left, then right.',
    ];
    const instrTxt = this.add.text(400, 360, instructions[this.stretchSecondsRemaining % instructions.length], {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#38bdf8',
      align: 'center',
      wordWrap: { width: 340 },
    }).setOrigin(0.5);

    // Display pet exercising with tamer
    const petSprite = this.add.sprite(400, 440, petKey).setDisplaySize(120, 120);
    if (pet?.genome) {
      const pheno = expressPhenotype(pet.genome);
      petSprite.setTint(pheno.tintHex);
    }
    if (this.anims.exists(petKey)) {
      petSprite.play({ key: petKey, repeat: -1 });
    }

    this.tweens.add({
      targets: petSprite,
      y: 430,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const skipTxt = this.add.text(400, 530, '[ PRESS 3 / ESC TO CANCEL ]', {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#64748b',
    }).setOrigin(0.5);

    this.contentContainer.add([stretchTitle, countdownTxt, instrTxt, petSprite, skipTxt]);
  }

  // --- TAB 3: DAILY STREAK & FOCUS SOUNDSCAPES ---
  private renderStreakTab(): void {
    const storage = StorageService.getInstance();
    const streak = storage.getDailyStreak();
    const activeSound = storage.getActiveSoundscape();

    // Section 1: Daily Login Streak
    const streakTitle = this.add.text(220, 268, '🔥 TAMER DAILY LOGIN STREAK', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#f97316',
    });

    const streakCount = this.add.text(220, 288, `Current: 🔥 Day ${streak.currentStreak}   |   Best: 🏆 Day ${streak.longestStreak}`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: '#facc15',
    });

    // 7-Day Rewards Strip
    const startX = 220;
    const stripY = 312;
    const boxW = 48;
    const days = [
      { d: 1, r: '5🪙' },
      { d: 2, r: '🥕' },
      { d: 3, r: '🍬' },
      { d: 4, r: '🥣' },
      { d: 5, r: '🥤' },
      { d: 6, r: '💉' },
      { d: 7, r: '🍎' },
    ];

    days.forEach((day, idx) => {
      const isPast = streak.currentStreak >= day.d;
      const isToday = ((streak.currentStreak - 1) % 7) + 1 === day.d;
      const box = this.add.graphics();
      box.fillStyle(isToday ? 0x1e3a5f : isPast ? 0x14532d : 0x1e293b, 0.9);
      box.lineStyle(1, isToday ? 0x38bdf8 : 0x334155, 1);
      box.fillRoundedRect(startX + idx * (boxW + 4), stripY, boxW, 40, 4);
      box.strokeRoundedRect(startX + idx * (boxW + 4), stripY, boxW, 40, 4);

      const dTxt = this.add.text(startX + idx * (boxW + 4) + boxW / 2, stripY + 6, `D${day.d}`, {
        fontFamily: 'beryl-digivice',
        fontSize: '9px',
        color: isToday ? '#38bdf8' : '#94a3b8',
      }).setOrigin(0.5, 0);

      const rTxt = this.add.text(startX + idx * (boxW + 4) + boxW / 2, stripY + 22, day.r, {
        fontFamily: 'beryl-digivice',
        fontSize: '12px',
      }).setOrigin(0.5, 0);

      this.contentContainer.add([box, dTxt, rTxt]);
    });

    // Claim Streak Button
    const isClaimSelected = this.selectedIndex === 0;
    const claimLabel = streak.claimedToday
      ? '✔ Day Bonus Claimed Today!'
      : `▶ CLAIM DAY ${streak.currentStreak + 1} REWARD!`;
    const btnClaim = this.add.text(400, 375, `${isClaimSelected ? '▶ ' : ''}[ ${claimLabel} ]`, {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: streak.claimedToday ? '#64748b' : isClaimSelected ? '#facc15' : '#e2e8f0',
      backgroundColor: streak.claimedToday ? '#1e293b' : '#3b2f0a',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnClaim.on('pointerdown', () => this.executeAction());

    // Section 2: Ambient Procedural Soundscapes
    const soundTitle = this.add.text(220, 415, '🎧 PROCEDURAL FOCUS SOUNDSCAPES', {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: '#38bdf8',
    });

    const soundNames: Record<string, string> = {
      off: '🔇 OFF (Chiptune Only)',
      rain: '🌧 CYBER RAIN (Filtered Rooftop)',
      drone: '🪐 DEEP SPACE DRONE (55Hz Binaural)',
      matrix: '💾 DATA STREAM (Lo-Fi Matrix)',
    };

    const isSoundSelected = this.selectedIndex === 1;
    const btnSound = this.add.text(400, 452, `${isSoundSelected ? '▶ ' : ''}[ Active: ${soundNames[activeSound]} ]`, {
      fontFamily: 'beryl-digivice',
      fontSize: '11px',
      color: isSoundSelected ? '#38bdf8' : '#e2e8f0',
      backgroundColor: '#0a1d37',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnSound.on('pointerdown', () => this.cycleSoundscape());

    const soundHelp = this.add.text(400, 482, 'Pure Web Audio synthesis. Zero external assets.', {
      fontFamily: 'beryl-digivice',
      fontSize: '9px',
      color: '#64748b',
    }).setOrigin(0.5);

    // Exit Button option
    const isExitSelected = this.selectedIndex === 2;
    const exitTxt = this.add.text(400, 540, `${isExitSelected ? '▶ ' : ''}[ RETURN TO DIGIVICE ]`, {
      fontFamily: 'beryl-digivice',
      fontSize: '12px',
      color: isExitSelected ? '#38bdf8' : '#64748b',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    exitTxt.on('pointerdown', () => this.returnToPetScene());

    this.contentContainer.add([
      streakTitle,
      streakCount,
      btnClaim,
      soundTitle,
      btnSound,
      soundHelp,
      exitTxt,
    ]);
  }

  // --- ACTIONS & EXECUTION ---

  public executeAction(): void {
    if (this.isStretching) return;
    const storage = StorageService.getInstance();

    if (this.activeTab === 1) {
      // Protocol Tab
      const habits = storage.getDailyHabits();
      if (this.selectedIndex === habits.length) {
        this.returnToPetScene();
        return;
      }

      const habit = habits[this.selectedIndex];
      if (!habit) return;

      if (habit.id === 'hydro_1' || habit.id === 'hydro_2' || habit.id === 'hydro_3') {
        const res = storage.logWaterIntake();
        SoundService.getInstance().playWaterSplash();
        this.showToast(`Drank water! +${res.coinsEarned}🪙 (Glass ${res.waterDrunkToday})`);
        this.renderTab();
        return;
      }

      if (habit.id === 'desk_stretch') {
        this.switchTab(2);
        this.startDeskStretch();
        return;
      }

      if (habit.id === 'focus_sprint') {
        this.scene.start('FocusScene');
        this.scene.stop('LifestyleScene');
        return;
      }

      if (habit.id === 'tamer_workout') {
        this.scene.start('MiniGameScene');
        this.scene.stop('LifestyleScene');
        return;
      }

      // Generic toggle
      const result = storage.toggleHabit(habit.id);
      if (result.completed) {
        SoundService.getInstance().playMoney();
        this.showToast(`Completed ${habit.label}! +${result.rewardCoins}🪙`);
      } else {
        SoundService.getInstance().playSelect();
      }
      this.renderTab();
    } else if (this.activeTab === 2) {
      // Bio-Sync Tab
      if (this.selectedIndex === 0) {
        // Drink water
        const res = storage.logWaterIntake();
        SoundService.getInstance().playWaterSplash();
        this.showToast(`Hydrated! +${res.coinsEarned}🪙 (${res.waterDrunkToday} glasses today)`);
        this.renderTab();
      } else if (this.selectedIndex === 1) {
        // Desk stretch
        this.startDeskStretch();
      } else {
        this.returnToPetScene();
      }
    } else {
      // Streak Tab
      if (this.selectedIndex === 0) {
        const claim = storage.claimDailyLoginBonus();
        if (claim.success) {
          SoundService.getInstance().playStreakCelebration();
          const digivice = this.scene.get('DigiviceScene') as DigiviceScene;
          digivice?.pulseAlertLed(8);
          this.showToast(claim.message);
        } else {
          SoundService.getInstance().playBack();
          this.showToast(claim.message);
        }
        this.renderTab();
      } else if (this.selectedIndex === 1) {
        this.cycleSoundscape();
      } else {
        this.returnToPetScene();
      }
    }
  }

  private cycleSoundscape(): void {
    const storage = StorageService.getInstance();
    const current = storage.getActiveSoundscape();
    const cycle: ('off' | 'rain' | 'drone' | 'matrix')[] = ['off', 'rain', 'drone', 'matrix'];
    const nextIdx = (cycle.indexOf(current) + 1) % cycle.length;
    const next = cycle[nextIdx];

    SoundService.getInstance().startSoundscape(next);
    SoundService.getInstance().playSelect();
    this.showToast(`Soundscape set to: ${next.toUpperCase()}`);
    this.renderTab();
  }

  private startDeskStretch(): void {
    if (this.isStretching) return;
    this.isStretching = true;
    this.stretchSecondsRemaining = 10;
    SoundService.getInstance().playStretchChime();

    const digivice = this.scene.get('DigiviceScene') as DigiviceScene;
    digivice?.pulseAlertLed(4);

    this.renderActiveStretchScreen();

    this.stretchTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.stretchSecondsRemaining--;
        if (this.stretchSecondsRemaining <= 0) {
          this.finishDeskStretch();
        } else {
          this.contentContainer.removeAll(true);
          this.renderActiveStretchScreen();
        }
      },
    });
  }

  private finishDeskStretch(): void {
    if (this.stretchTimer) {
      this.stretchTimer.remove();
      this.stretchTimer = null;
    }
    this.isStretching = false;
    const res = StorageService.getInstance().performDeskStretch();
    SoundService.getInstance().playEvolve();

    const digivice = this.scene.get('DigiviceScene') as DigiviceScene;
    digivice?.pulseAlertLed(6);

    this.showToast(`Bio-Sync Complete! +${res.coinsEarned}🪙 +15 Energy!`);
    this.renderTab();
  }

  private cancelDeskStretch(): void {
    if (this.stretchTimer) {
      this.stretchTimer.remove();
      this.stretchTimer = null;
    }
    this.isStretching = false;
    SoundService.getInstance().playBack();
    this.renderTab();
  }

  private returnToPetScene(): void {
    if (this.stretchTimer) {
      this.stretchTimer.remove();
      this.stretchTimer = null;
    }
    this.isStretching = false;
    SoundService.getInstance().playBack();
    this.scene.start('PetScene');
    this.scene.stop('LifestyleScene');
  }

  // --- NAVIGATION EVENT HANDLERS ---
  public onNavUp(): void {
    if (this.isStretching) return;
    const maxIdx = this.getMaxSelectionIndex();
    this.selectedIndex = (this.selectedIndex - 1 + maxIdx + 1) % (maxIdx + 1);
    SoundService.getInstance().playSelect();
    this.renderTab();
  }

  public onNavDown(): void {
    if (this.isStretching) return;
    const maxIdx = this.getMaxSelectionIndex();
    this.selectedIndex = (this.selectedIndex + 1) % (maxIdx + 1);
    SoundService.getInstance().playSelect();
    this.renderTab();
  }

  public onNavLeft(): void {
    if (this.isStretching) return;
    const nextTab = this.activeTab === 1 ? 3 : ((this.activeTab - 1) as 1 | 2 | 3);
    this.switchTab(nextTab);
  }

  public onNavRight(): void {
    if (this.isStretching) return;
    const nextTab = this.activeTab === 3 ? 1 : ((this.activeTab + 1) as 1 | 2 | 3);
    this.switchTab(nextTab);
  }

  public onButton1(): void {
    this.onNavUp();
  }

  public onButton2(): void {
    this.onConfirm();
  }

  public onButton3(): void {
    if (this.isStretching) {
      this.cancelDeskStretch();
    } else {
      this.returnToPetScene();
    }
  }

  public onConfirm(): void {
    this.executeAction();
  }

  public onCancel(): void {
    if (this.isStretching) {
      this.cancelDeskStretch();
    } else {
      this.returnToPetScene();
    }
  }

  private getMaxSelectionIndex(): number {
    if (this.activeTab === 1) {
      const habits = StorageService.getInstance().getDailyHabits();
      return habits.length; // habits + exit button
    }
    return 2; // 0, 1, 2
  }
}
