"use client"

import type { GameData, Scene, GameState, NPC, Branch, ItemGround, AssetUrl } from './types/GameTypes';

export class SceneManager {
  private scene: Phaser.Scene;
  private gameData: GameData;
  private gameState: GameState;
  private assetUrls: AssetUrl[];
  private background?: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private npcs: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image)[] = [];
  private groundItems: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image)[] = [];
  private narratorUI?: Phaser.GameObjects.Container;
  private narratorBg?: Phaser.GameObjects.Rectangle;
  private narratorText?: Phaser.GameObjects.Text;
  private branchUI?: Phaser.GameObjects.Container;
  private onSceneChange?: (sceneId: string) => void;

  // Animation properties for narrator
  private narratorAnimationActive: boolean = false;
  private narratorFullText: string = '';
  private narratorAnimationTimer?: Phaser.Time.TimerEvent;
  private narratorCurrentCharIndex: number = 0;

  constructor(scene: Phaser.Scene, gameData: GameData, initialState: GameState, assetUrls: AssetUrl[]) {
    this.scene = scene;
    this.gameData = gameData;
    this.gameState = initialState;
    this.assetUrls = assetUrls;
  }

  setOnSceneChange(callback: (sceneId: string) => void) {
    this.onSceneChange = callback;
  }



  loadScene(sceneId: string) {
    this.gameState.currentScene = sceneId;
    const sceneData = this.gameData.scenes[sceneId];

    if (!sceneData) {
      console.error(`Scene ${sceneId} not found`);
      return;
    }

    // Clear previous scene elements
    this.clearScene();

    // Set background
    this.setBackground(sceneData.background);

    // Create NPCs
    this.createNPCs(sceneData.npcs || []);

    // Create ground items
    this.createGroundItems(sceneData.items_ground || []);

    // Handle scene type
    if (sceneData.narrator) {
      this.showNarrator(sceneData.narrator.lines);
    } else if (sceneData.branches) {
      this.showBranches(sceneData.branches);
    } else if (sceneData.dialog) {
      this.showDialog(sceneData.dialog);
    } else if (sceneData.requires_item) {
      this.handleItemRequirement(sceneData);
    } else if (sceneData.end_message) {
      this.showEndMessage(sceneData.end_message);
    }


  }

  private clearScene() {
    // Clear background
    if (this.background) {
      this.background.destroy();
    }

    // Clear NPCs
    this.npcs.forEach(npc => npc.destroy());
    this.npcs = [];

    // Clear ground items
    this.groundItems.forEach(item => item.destroy());
    this.groundItems = [];

    // Clear UI elements
    if (this.narratorUI) {
      this.narratorUI.destroy();
    }
    if (this.branchUI) {
      this.branchUI.destroy();
    }
  }

  private setBackground(backgroundId?: string) {
    if (!backgroundId) return;

    // Check if asset exists in asset_urls
    const assetMap = new Map(this.assetUrls.map(a => [a.name, a.image_url]));
    const hasAsset = assetMap.has(backgroundId);

    if (hasAsset && this.scene.textures.exists(backgroundId)) {
      // Use image background
      this.background = this.scene.add.image(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        backgroundId
      );
      // Scale to cover screen
      const scaleX = this.scene.scale.width / this.background.width;
      const scaleY = this.scene.scale.height / this.background.height;
      const scale = Math.max(scaleX, scaleY);
      this.background.setScale(scale);
    } else {
      // Fallback to colored rectangle
      const backgroundColors: { [key: string]: number } = {
        'bg_forest': 0x2d5016,      // Dark green
        'bg_crossroad': 0x8B4513,   // Brown
        'bg_room': 0x4B0082,        // Indigo
        'bg_final': 0x191970,       // Midnight blue
        'bg_mill': 0x8B7355         // Tan/beige for mill
      };

      const color = backgroundColors[backgroundId] || 0x333333;

      this.background = this.scene.add.rectangle(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        this.scene.scale.width,
        this.scene.scale.height,
        color
      );
    }
    this.background.setDepth(-100);
  }

  private createNPCs(npcs: NPC[]) {
    const assetMap = new Map(this.assetUrls.map(a => [a.name, a.image_url]));
    const npcSize = this.gameData.players.player_size || 80; // Use same size as players

    npcs.forEach(npcData => {
      // Calculate position based on absolute screen coordinates
      const x = npcData.x * this.scene.scale.width;
      const y = npcData.y * this.scene.scale.height;

      const hasAsset = assetMap.has(npcData.id);
      let npcSprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;

      if (hasAsset && this.scene.textures.exists(`npc_${npcData.id}`)) {
        // Use image sprite
        npcSprite = this.scene.add.image(x, y, `npc_${npcData.id}`);
        // Scale to fit npcSize
        const scale = Math.min(
          npcSize / npcSprite.width,
          npcSize / npcSprite.height
        );
        npcSprite.setScale(scale);
      } else {
        // Fallback to colored rectangle
        const npcColors: { [key: string]: number } = {
          'elder': 0x8B4513,     // Brown
          'child': 0xFFB6C1,     // Light pink
          'guard': 0x808080,     // Gray
          'cat_with_boots': 0xFFA500  // Orange for cat
        };

        const color = npcColors[npcData.id] || 0xff0000;
        npcSprite = this.scene.add.rectangle(x, y, npcSize, npcSize, color);
        (npcSprite as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0xffffff);
      }

      npcSprite.setData('npcId', npcData.id);
      npcSprite.setData('dialogId', npcData.dialog);
      npcSprite.setData('givesItem', npcData.gives_item);

      // Make NPC interactive
      npcSprite.setInteractive();

      this.npcs.push(npcSprite);
    });
  }

  private createGroundItems(items: ItemGround[]) {
    const assetMap = new Map(this.assetUrls.map(a => [a.name, a.image_url]));
    const itemSize = 48; // Default item size

    items.forEach(itemData => {
      // Calculate position based on screen coordinates
      const x = itemData.x * this.scene.scale.width;
      const y = itemData.y * this.scene.scale.height;

      const hasAsset = assetMap.has(itemData.item);
      let itemSprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;

      if (hasAsset && this.scene.textures.exists(`item_${itemData.item}`)) {
        // Use image sprite
        itemSprite = this.scene.add.image(x, y, `item_${itemData.item}`);
        // Scale to fit itemSize
        const scale = Math.min(
          itemSize / itemSprite.width,
          itemSize / itemSprite.height
        );
        itemSprite.setScale(scale);
      } else {
        // Fallback to colored diamond-shaped rectangle
        const itemColors: { [key: string]: number } = {
          'RED_FLOWER': 0xFF4500,     // Red-orange
          'MAGIC_SCROLL': 0x9370DB,   // Medium purple
          'KEY_OF_DOOR': 0xFFD700     // Gold
        };

        const color = itemColors[itemData.item] || 0x00FFFF; // Cyan default
        itemSprite = this.scene.add.rectangle(x, y, 32, 32, color);
        itemSprite.setRotation(Math.PI / 4); // 45 degrees
        (itemSprite as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0xffffff);
      }

      itemSprite.setData('itemType', itemData.item);

      // Make item interactive for pickup
      itemSprite.setInteractive();

      this.groundItems.push(itemSprite);
    });
  }

  private getWalkableArea() {
    const screenHeight = this.scene.scale.height;
    const walkableVerticalRatio = this.gameData.layout?.walkable_vertical_ratio || 0.5;
    const walkableHeight = screenHeight * walkableVerticalRatio;
    const topY = (screenHeight - walkableHeight) / 2;

    return {
      topY,
      bottomY: topY + walkableHeight,
      height: walkableHeight
    };
  }

  private showNarrator(lines: string[]) {
    this.narratorUI = this.scene.add.container(0, 0);
    this.narratorUI.setDepth(500);

    // Background for narrator text - will be resized dynamically
    this.narratorBg = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      80,
      this.scene.scale.width - 100,
      120, // Start with smaller height
      0x000000,
      0.8
    );
    this.narratorBg.setStrokeStyle(2, 0xffffff);
    this.narratorUI.add(this.narratorBg);

    // Start typewriter animation for narrator text
    this.narratorFullText = lines.join('\n\n');
    this.narratorCurrentCharIndex = 0;
    this.narratorAnimationActive = true;

    // Clear any existing timer
    if (this.narratorAnimationTimer) {
      this.narratorAnimationTimer.destroy();
    }

    // Create narrator text with empty content initially
    this.narratorText = this.scene.add.text(
      this.scene.scale.width / 2,
      80,
      '',
      {
        fontSize: '25px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: this.scene.scale.width - 180 },
        fontFamily: 'Arial',
        lineSpacing: -5,
      }
    ).setOrigin(0.5);
    this.narratorUI.add(this.narratorText);

    // Calculate proper sizing with full text temporarily
    this.narratorText.setText(this.narratorFullText);
    const textBounds = this.narratorText.getBounds();
    const minHeight = 120;
    const padding = 50;
    const newHeight = Math.max(minHeight, textBounds.height + padding);

    this.narratorBg.setSize(this.scene.scale.width - 100, newHeight);
    this.narratorBg.setY(40 + (newHeight / 2));
    this.narratorText.setY(40 + (newHeight / 2));

    // Reset to empty text and start animation
    this.narratorText.setText('');

    // Create typewriter effect
    this.narratorAnimationTimer = this.scene.time.addEvent({
      delay: 30, // milliseconds per character
      callback: this.animateNarratorText,
      callbackScope: this,
      repeat: this.narratorFullText.length - 1
    });

    // Continue instruction
    const continueText = this.scene.add.text(
      this.scene.scale.width / 2,
      40 + newHeight + 20,
      'ESPACIO Para continuar',
      {
        fontSize: '18px',
        color: '#cccccc',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
    this.narratorUI.add(continueText);
  }

  private animateNarratorText(): void {
    if (this.narratorCurrentCharIndex < this.narratorFullText.length) {
      const currentText = this.narratorFullText.substring(0, this.narratorCurrentCharIndex + 1);
      this.narratorText?.setText(currentText);
      this.narratorCurrentCharIndex++;

      // Check if animation just completed
      if (this.narratorCurrentCharIndex >= this.narratorFullText.length) {
        this.narratorAnimationActive = false;
        if (this.narratorAnimationTimer) {
          this.narratorAnimationTimer.destroy();
          this.narratorAnimationTimer = undefined;
        }
      }
    }
  }

  isNarratorAnimating(): boolean {
    return this.narratorAnimationActive;
  }

  completeNarratorAnimation(): void {
    if (this.narratorAnimationActive) {
      // Complete the animation immediately
      this.narratorAnimationActive = false;
      if (this.narratorAnimationTimer) {
        this.narratorAnimationTimer.destroy();
        this.narratorAnimationTimer = undefined;
      }
      this.narratorText?.setText(this.narratorFullText);
      this.narratorCurrentCharIndex = this.narratorFullText.length;
    }
  }

  private showBranches(branches: Branch[]) {
    this.branchUI = this.scene.add.container(0, 0);
    this.branchUI.setDepth(500);

    // Undertale-style positioning: top, right, bottom
    const positions = [
      { x: this.scene.scale.width / 2, y: 150 },      // top
      { x: this.scene.scale.width - 200, y: this.scene.scale.height / 2 }, // right
      { x: this.scene.scale.width / 2, y: this.scene.scale.height - 150 }  // bottom
    ];

    branches.forEach((branch, index) => {
      const pos = positions[index] || { x: this.scene.scale.width / 2, y: 300 + (index * 60) };

      // Branch background
      const bg = this.scene.add.rectangle(
        pos.x,
        pos.y,
        300,
        50,
        branch.main ? 0x4B0082 : 0x333333,
        0.8
      );
      bg.setStrokeStyle(2, 0xffffff);
      bg.setInteractive();
      bg.setData('target', branch.target);

      // Branch text with direction indicator
      const directionSymbols: { [key: string]: string } = {
        'top': '↑',
        'right': '→',
        'bottom': '↓'
      };

      const symbol = directionSymbols[branch.direction] || '';
      const text = this.scene.add.text(
        pos.x,
        pos.y,
        `${symbol} ${branch.label}`,
        {
          fontSize: '16px',
          color: '#ffffff',
          fontFamily: 'Arial'
        }
      ).setOrigin(0.5);

      if (this.branchUI) {
        this.branchUI.add(bg);
        this.branchUI.add(text);
      }

      // Add click handler
      bg.on('pointerdown', () => {
        if (this.onSceneChange) {
          this.onSceneChange(branch.target);
        }
      });
    });

    // Instructions
    const instructionText = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height - 50,
      'Use arrow keys or click to choose',
      {
        fontSize: '14px',
        color: '#cccccc',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    if (this.branchUI) {
      this.branchUI.add(instructionText);
    }
  }

  private showDialog(dialogId: string) {
    // This will be handled by the DialogSystem
    // Just store the dialog ID for the main engine to process
    this.gameState.currentDialog = this.gameData.dialogs[dialogId];
  }

  private handleItemRequirement(sceneData: Scene) {
    const hasItem = this.gameState.inventory.includes(sceneData.requires_item!);

    if (hasItem && sceneData.success) {
      if (this.onSceneChange) {
        this.onSceneChange(sceneData.success);
      }
    } else {
      // Show fail message
      this.narratorUI = this.scene.add.container(0, 0);
      this.narratorUI.setDepth(500);

      const text = this.scene.add.text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        sceneData.fail_message || 'You cannot proceed.',
        {
          fontSize: '20px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 450 },
          fontFamily: 'Arial',
          lineSpacing: 5
        }
      ).setOrigin(0.5);

      // Dynamic background sizing
      const textBounds = text.getBounds();
      const padding = 60;
      const bgWidth = Math.max(400, textBounds.width + padding);
      const bgHeight = Math.max(120, textBounds.height + padding);

      const bg = this.scene.add.rectangle(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        bgWidth,
        bgHeight,
        0x8B0000,
        0.9
      );
      bg.setStrokeStyle(2, 0xffffff);

      this.narratorUI.add(bg);
      this.narratorUI.add(text);
    }
  }

  private showEndMessage(message: string) {
    this.narratorUI = this.scene.add.container(0, 0);
    this.narratorUI.setDepth(500);

    const bg = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      600,
      200,
      0x000000,
      0.9
    );
    bg.setStrokeStyle(3, 0xffffff);

    const text = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      message,
      {
        fontSize: '40px',
        color: '#ffffff',
        align: 'center',
        fontFamily: 'Arial',
        lineSpacing: 10
      }
    ).setOrigin(0.5);

    this.narratorUI.add(bg);
    this.narratorUI.add(text);
  }

  getNPCs(): (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image)[] {
    return this.npcs;
  }

  getGroundItems(): (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image)[] {
    return this.groundItems;
  }

  getCurrentScene(): Scene {
    return this.gameData.scenes[this.gameState.currentScene];
  }

  proceedToNext() {
    const currentScene = this.getCurrentScene();
    if (currentScene.next) {
      if (this.onSceneChange) {
        this.onSceneChange(currentScene.next);
      }
    }
  }

  hideNarratorUI() {
    if (this.narratorUI) {
      this.narratorUI.destroy();
      this.narratorUI = undefined;
    }
  }

  handleBranchSelection(branchIndex: number) {
    const currentScene = this.getCurrentScene();
    if (currentScene.branches && currentScene.branches[branchIndex - 1]) {
      const target = currentScene.branches[branchIndex - 1].target;
      if (this.onSceneChange) {
        this.onSceneChange(target);
      }
    }
  }
}
