"use client"

import type { DialogLine } from './types/GameTypes';

export class DialogSystem {
  private scene: Phaser.Scene;
  private dialogBox?: Phaser.GameObjects.Container;
  private dialogBg?: Phaser.GameObjects.Rectangle;
  private dialogText?: Phaser.GameObjects.Text;
  private characterText?: Phaser.GameObjects.Text;
  private characterSprite?: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private currentDialog: DialogLine[] = [];
  private currentIndex = 0;
  private isActive = false;
  private onComplete?: () => void;
  private isAnimating = false;
  private fullText = '';
  private animationTimer?: Phaser.Time.TimerEvent;
  private currentCharIndex = 0;
  private assetUrls: any[];

  constructor(scene: Phaser.Scene, assetUrls: any[] = []) {
    this.scene = scene;
    this.assetUrls = assetUrls;
    this.setupUI();
  }

  private setupUI() {
    // Create dialog container
    this.dialogBox = this.scene.add.container(0, 0);
    this.dialogBox.setDepth(1000);

    // Dialog background - will be resized dynamically
    this.dialogBg = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height - 150,
      this.scene.scale.width - 100,
      250, // Start with larger height
      0x000000,
      0.8
    );
    this.dialogBg.setStrokeStyle(2, 0xffffff);
    this.dialogBox.add(this.dialogBg);

    // Character name background
    const nameBg = this.scene.add.rectangle(
      150,
      this.scene.scale.height - 230,
      200,
      40,
      0x333333,
      0.9
    );
    nameBg.setStrokeStyle(1, 0xffffff);
    this.dialogBox.add(nameBg);

    // Character sprite preview (64x64 colored rectangle) - will be positioned dynamically
    this.characterSprite = this.scene.add.rectangle(
      0,
      0,
      64,
      64,
      0xff0000
    );
    this.characterSprite.setStrokeStyle(2, 0xffffff);
    this.dialogBox.add(this.characterSprite);

    // Character name text
    this.characterText = this.scene.add.text(
      150,
      this.scene.scale.height - 230,
      '',
      {
        fontSize: '22px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
    this.dialogBox.add(this.characterText);

    // Dialog text
    this.dialogText = this.scene.add.text(
      150 + 20,
      this.scene.scale.height - 150,
      '',
      {
        fontSize: '26px',
        color: '#ffffff',
        wordWrap: { width: this.scene.scale.width - 280 },
        fontFamily: 'Arial',
        lineSpacing: 5
      }
    ).setOrigin(0, 0.5);
    this.dialogBox.add(this.dialogText);

    // Skip instruction
    const skipText = this.scene.add.text(
      this.scene.scale.width - 150,
      this.scene.scale.height - 80,
      'ESPACIO Para continuar',
      {
        fontSize: '16px',
        color: '#cccccc',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
    this.dialogBox.add(skipText);

    this.dialogBox.setVisible(false);
  }

  startDialog(dialog: DialogLine[], onComplete?: () => void) {
    this.currentDialog = dialog;
    this.currentIndex = 0;
    this.isActive = true;
    this.onComplete = onComplete;
    this.dialogBox?.setVisible(true);
    this.showCurrentLine();
  }

  private showCurrentLine() {
    if (this.currentIndex >= this.currentDialog.length) {
      this.endDialog();
      return;
    }

    const line = this.currentDialog[this.currentIndex];

    // Update character name
    this.characterText?.setText(line.character.toUpperCase());

    // Update character sprite - use image if available, otherwise fallback to colored rectangle
    const assetMap = new Map(this.assetUrls.map(a => [a.name, a.image_url]));
    const hasAsset = assetMap.has(line.character);

    // Remove old sprite if it exists
    if (this.characterSprite) {
      this.dialogBox?.remove(this.characterSprite, true);
    }

    if (hasAsset && this.scene.textures.exists(`npc_${line.character}`)) {
      // Use image sprite
      this.characterSprite = this.scene.add.image(80, this.scene.scale.height - 230, `npc_${line.character}`);
      const scale = Math.min(64 / this.characterSprite.width, 64 / this.characterSprite.height);
      this.characterSprite.setScale(scale);
    } else {
      // Fallback to colored rectangle
      const characterColors: { [key: string]: number } = {
        'elder': 0x8B4513,
        'child': 0xFFB6C1,
        'guard': 0x808080,
        'narrator': 0x4B0082,
        'cat_with_boots': 0xFFA500,
        'king': 0xFFD700,
        'ogre': 0x556B2F,
        'princess': 0xFFB6C1
      };
      const color = characterColors[line.character] || 0xff0000;
      this.characterSprite = this.scene.add.rectangle(80, this.scene.scale.height - 230, 64, 64, color);
      (this.characterSprite as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0xffffff);
    }

    this.dialogBox?.add(this.characterSprite);

    // Start typewriter animation for dialog text
    this.fullText = line.text;
    this.currentCharIndex = 0;
    this.isAnimating = true;

    // Clear any existing timer
    if (this.animationTimer) {
      this.animationTimer.destroy();
    }

    // Start with empty text
    this.dialogText?.setText('');

    // Create typewriter effect
    this.animationTimer = this.scene.time.addEvent({
      delay: 30, // milliseconds per character
      callback: this.animateText,
      callbackScope: this,
      repeat: this.fullText.length - 1
    });

    // Initial resize with full text for proper sizing
    if (this.dialogText && this.dialogBg) {
      // Temporarily set full text to calculate bounds
      const tempText = this.fullText;
      this.dialogText.setText(tempText);
      const textBounds = this.dialogText.getBounds();
      const minHeight = 150;
      const padding = 60;
      const newHeight = Math.max(minHeight, textBounds.height + padding);

      // Update dialog background size and position
      this.dialogBg.setSize(this.scene.scale.width - 100, newHeight);
      this.dialogBg.setY(this.scene.scale.height - (newHeight / 2) - 50);

      // Center character sprite vertically in dialog box
      this.characterSprite?.setPosition(
        80 + 30,
        this.scene.scale.height - (newHeight / 2) - 50
      );

      // Update dialog text position to stay centered in new box
      this.dialogText.setY(this.scene.scale.height - (newHeight / 2) - 50);

      // Reset to empty text to start animation
      this.dialogText.setText('');
    }
  }

  private animateText(): void {
    if (this.currentCharIndex < this.fullText.length) {
      const currentText = this.fullText.substring(0, this.currentCharIndex + 1);
      this.dialogText?.setText(currentText);
      this.currentCharIndex++;

      // Check if animation just completed
      if (this.currentCharIndex >= this.fullText.length) {
        this.isAnimating = false;
        if (this.animationTimer) {
          this.animationTimer.destroy();
          this.animationTimer = undefined;
        }
      }
    }
  }

  nextLine(): void {
    if (!this.isActive) return;

    // Handle space key during animation - complete it but don't advance yet
    if (this.isAnimating) {
      // Complete the animation immediately and stay on current line
      this.isAnimating = false;
      if (this.animationTimer) {
        this.animationTimer.destroy();
        this.animationTimer = undefined;
      }
      this.dialogText?.setText(this.fullText);
      this.currentCharIndex = this.fullText.length;
      return;
    }

    // Animation is complete, advance to next line
    if (this.currentDialog && this.currentIndex < this.currentDialog.length - 1) {
      this.currentIndex++;
      this.showCurrentLine();
    } else {
      this.endDialog();
    }
  }  private endDialog() {
    this.isActive = false;
    this.isAnimating = false;

    // Clean up animation timer
    if (this.animationTimer) {
      this.animationTimer.destroy();
      this.animationTimer = undefined;
    }

    this.dialogBox?.setVisible(false);
    if (this.onComplete) {
      this.onComplete();
    }
  }

  isDialogActive(): boolean {
    return this.isActive;
  }

  skipDialog() {
    this.endDialog();
  }
}
