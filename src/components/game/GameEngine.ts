"use client"

import * as Phaser from 'phaser';
import type { GameData, GameState } from './types/GameTypes';
import { PlayerController } from './PlayerController';
import { DialogSystem } from './DialogSystem';
import { SceneManager } from './SceneManager';

export class GameEngine extends Phaser.Scene {
  private gameData!: GameData;
  private gameState!: GameState;
  private playerController!: PlayerController;
  private dialogSystem!: DialogSystem;
  private sceneManager!: SceneManager;

  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private inventoryCells: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];
  private inventoryTexts: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];
  private inventorySprites: (Phaser.GameObjects.Image | Phaser.GameObjects.Text)[] = [];
  private updateInventoryGrid?: () => void;

  constructor() {
    super({ key: 'GameEngine' });
  }

  preload() {
    // Preload game data assets using asset_urls lookup
    const gameData = this.registry.get('gameData');
    const assetUrls = this.registry.get('assetUrls') || [];
    if (gameData && assetUrls.length > 0) {
      const assetMap = new Map(assetUrls.map((a: any) => [a.name, a.image_url]));

      // Preload player sprites
      gameData.players.sprites.forEach((spriteId: string, index: number) => {
        const url = assetMap.get(spriteId);
        if (url && typeof url === 'string') {
          this.load.image(`player_${index}`, url);
        }
      });

      // Preload backgrounds
      Object.values(gameData.scenes).forEach((scene: any) => {
        if (scene.background) {
          const url = assetMap.get(scene.background);
          if (url && typeof url === 'string') {
            this.load.image(scene.background, url);
          }
        }

        // Preload NPC sprites
        if (scene.npcs) {
          scene.npcs.forEach((npc: any) => {
            const url = assetMap.get(npc.id);
            if (url && typeof url === 'string') {
              this.load.image(`npc_${npc.id}`, url);
            }
          });
        }

        // Preload ground items
        if (scene.items_ground) {
          scene.items_ground.forEach((item: any) => {
            const url = assetMap.get(item.item);
            if (url && typeof url === 'string') {
              this.load.image(`item_${item.item}`, url);
            }
          });
        }
      });
    }
  }  create() {
    // Get game data from registry
    this.gameData = this.registry.get('gameData');
    const assetUrls = this.registry.get('assetUrls') || [];

    // Initialize game state
    this.gameState = {
      currentScene: this.findIntroScene(),
      inventory: [],
      playerPositions: [],
      isInDialog: false,
      currentDialog: undefined,
      dialogIndex: 0,
      completedDialogs: new Set<string>()
    };

    // Initialize systems
    const walkableRatio = this.gameData.layout?.walkable_vertical_ratio || 0.5;
    this.playerController = new PlayerController(this, this.gameData, assetUrls, walkableRatio);
    this.dialogSystem = new DialogSystem(this, assetUrls);
    this.sceneManager = new SceneManager(this, this.gameData, this.gameState, assetUrls);

    // Setup input
    this.setupInput();

    // Setup scene change handler
    this.sceneManager.setOnSceneChange((sceneId: string) => {
      this.loadScene(sceneId);
    });

    // Setup scene transition handler
    this.playerController.setOnSceneTransition((direction: 'left' | 'right' | 'top' | 'bottom') => {
      this.handleSceneTransition(direction);
    });

    // Setup NPC interaction
    this.setupNPCInteraction();

    // Display initial UI (before loading scene so inventory exists)
    this.createUI();

    // Load initial scene
    this.loadScene(this.gameState.currentScene);
  }

  private setupInput() {
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Arrow keys no longer needed for branch selection (using movement instead)

    // Handle key events
    this.spaceKey.on('down', () => {
      if (this.dialogSystem.isDialogActive()) {
        this.dialogSystem.nextLine();
      } else {
        // Handle narrator dialog with SPACE
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene.narrator) {
          // Check if narrator is still animating
          if (this.sceneManager.isNarratorAnimating()) {
            // Complete the animation immediately
            this.sceneManager.completeNarratorAnimation();
          } else {
            // Hide narrator UI and re-enable movement
            this.sceneManager.hideNarratorUI();
            this.playerController.enableMovement();
            this.showInventory();
            // Mark narrator as completed for this scene
            this.gameState.isInDialog = false;
          }
        }
      }
    });

    this.enterKey.on('down', () => {
      // ENTER key no longer used for narrator progression
    });

    // Branch selection now handled by movement-based transitions
  }

  private setupNPCInteraction() {
    // Track which NPCs are currently in proximity (to avoid spam)
    let proximityTracker = new Set<string>();

    // Store reference for clearing on scene change
    this.clearDialogTriggers = () => {
      proximityTracker = new Set<string>();
    };

    // Check for NPC proximity and interaction
    this.physics.world.on('worldstep', () => {
      if (this.dialogSystem.isDialogActive() || this.gameState.isInDialog) return;

      const players = this.playerController.getPlayers();
      const npcs = this.sceneManager.getNPCs();

      players.forEach(player => {
        npcs.forEach(npc => {
          // Use physics body position for accurate hitbox detection
          const playerBody = player.sprite.body as Phaser.Physics.Arcade.Body;
          const playerX = playerBody.x + playerBody.halfWidth;
          const playerY = playerBody.y + playerBody.halfHeight;

          const distance = Phaser.Math.Distance.Between(
            playerX, playerY,
            npc.x, npc.y
          );

          const npcId = npc.getData('npcId');
          const dialogId = npc.getData('dialogId');
          const proximityKey = `${this.gameState.currentScene}_${npcId}`;
          const globalDialogKey = `${npcId}_${dialogId}`;

          // If player is close to NPC (within 80 pixels)
          if (distance < 80) {
            // Check if dialog hasn't been completed globally and isn't currently triggered
            if (dialogId &&
                this.gameData.dialogs[dialogId] &&
                !this.gameState.completedDialogs.has(globalDialogKey) &&
                !proximityTracker.has(proximityKey)) {

              proximityTracker.add(proximityKey);
              this.startDialog(this.gameData.dialogs[dialogId], () => {
                // Mark dialog as permanently completed
                this.gameState.completedDialogs.add(globalDialogKey);

                // Give item if NPC has one
                const givesItem = npc.getData('givesItem');
                if (givesItem && !this.gameState.inventory.includes(givesItem)) {
                  this.gameState.inventory.push(givesItem);
                  console.log(`Received item: ${givesItem}`);
                  this.updateInventoryGrid?.();
                }
              });
            }
          } else {
            // Player moved away, allow retriggering
            proximityTracker.delete(proximityKey);
          }
        });

        // Check for ground item proximity and pickup
        const groundItems = this.sceneManager.getGroundItems();
        groundItems.forEach((item: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image) => {
          // Use physics body position for accurate hitbox detection
          const playerBody = player.sprite.body as Phaser.Physics.Arcade.Body;
          const playerX = playerBody.x + playerBody.halfWidth;
          const playerY = playerBody.y + playerBody.halfHeight;

          const distance = Phaser.Math.Distance.Between(
            playerX, playerY,
            item.x, item.y
          );

          // If player is close to item (within 60 pixels)
          if (distance < 60) {
            const itemType = item.getData('itemType');
            if (itemType && !this.gameState.inventory.includes(itemType)) {
              // Pick up the item
              this.gameState.inventory.push(itemType);
              console.log(`Picked up item: ${itemType}`);

              // Update inventory display
              this.updateInventoryGrid?.();

              // Remove the item from the scene
              item.destroy();
              const index = groundItems.indexOf(item);
              if (index > -1) {
                groundItems.splice(index, 1);
              }
            }
          }
        });
      });
    });
  }

  private clearDialogTriggers?: () => void;

  private findIntroScene(): string {
    // Find scene that is not referenced in any branches
    const scenes = this.gameData.scenes;
    const referencedScenes = new Set<string>();

    // Collect all scenes referenced in branches
    Object.values(scenes).forEach(scene => {
      if (scene.branches) {
        scene.branches.forEach(branch => {
          referencedScenes.add(branch.target);
        });
      }
    });

    // Find scenes that are not referenced by any branch
    const unreferencedScenes = Object.keys(scenes).filter(sceneId =>
      !referencedScenes.has(sceneId)
    );

    // Return the first unreferenced scene, or first scene if all are referenced
    return unreferencedScenes[0] || Object.keys(scenes)[0] || 'intro_scene';
  }

  private loadScene(sceneId: string) {
    console.log(`Loading scene: ${sceneId}`);

    // Clear dialog triggers when changing scenes
    if (this.clearDialogTriggers) {
      this.clearDialogTriggers();
    }

    this.sceneManager.loadScene(sceneId);

    const currentScene = this.sceneManager.getCurrentScene();

    // Set branch scene status for player controller movement
    // Only consider it a "branch scene" (crossroad) if it has branches other than just left/right
    const isRealCrossroad = currentScene.branches && currentScene.branches.some(b =>
      b.direction === 'top' || b.direction === 'bottom'
    );
    this.playerController.setInBranchScene(!!isRealCrossroad);

    // If scene has narrator, disable movement until narrator ends
    if (currentScene.narrator) {
      console.log('Scene has narrator - disabling movement');
      this.gameState.isInDialog = true;
      this.playerController.disableMovement();
    } else {
      // Enable movement for non-narrator scenes
      console.log('Scene has no narrator - enabling movement');
      this.gameState.isInDialog = false;
      this.playerController.enableMovement();
    }

    // Handle scene-specific dialog (but don't auto-proceed)
    if (currentScene.dialog && this.gameData.dialogs[currentScene.dialog]) {
      this.startDialog(this.gameData.dialogs[currentScene.dialog]);
    }
  }

  private startDialog(dialog: any[], onComplete?: () => void) {
    this.gameState.isInDialog = true;
    this.playerController.disableMovement();
    this.hideInventory();

    this.dialogSystem.startDialog(dialog, () => {
      this.gameState.isInDialog = false;
      this.playerController.enableMovement();
      this.showInventory();
      if (onComplete) {
        onComplete();
      }
    });
  }

  private handleSceneTransition(direction: 'left' | 'right' | 'top' | 'bottom') {
    if (this.gameState.isInDialog) return;

    const currentScene = this.sceneManager.getCurrentScene();
    let targetScene: string | null = null;

    // Only check branches - simplified scene connection system
    if (currentScene.branches) {
      const branch = currentScene.branches.find(b => b.direction === direction);
      if (branch) {
        targetScene = branch.target;
      }
    }

    if (targetScene) {
      this.loadScene(targetScene);
      // Teleport players to appropriate side based on entry direction
      this.teleportPlayersForTransition(direction);
      // Reset transition cooldown to prevent immediate retriggering
      this.playerController.resetTransitionCooldown();
    }
  }



  private teleportPlayersForTransition(transitionDirection: 'left' | 'right' | 'top' | 'bottom') {
    const walkableArea = this.playerController.getWalkableArea();
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const centerY = (walkableArea.topY + walkableArea.bottomY) / 2;

    let newX: number;
    let newY = centerY;

    // Determine spawn position - OPPOSITE side from where we came
    switch (transitionDirection) {
      case 'right':
        // Went right, so spawn on LEFT side of new scene
        newX = 80;
        break;
      case 'left':
        // Went left, so spawn on RIGHT side of new scene
        newX = screenWidth - 80;
        break;
      case 'top':
        // Went up, so spawn at BOTTOM of new scene
        newX = screenWidth / 2;
        newY = screenHeight - 80;
        break;
      case 'bottom':
        // Went down, so spawn at TOP of new scene
        newX = screenWidth / 2;
        newY = 80;
        break;
    }

    // Make sure spawn position is within walkable area for non-branch scenes
    const currentScene = this.sceneManager.getCurrentScene();
    if (!currentScene.branches) {
      // Constrain Y position to walkable area for regular scenes
      if (transitionDirection === 'left' || transitionDirection === 'right') {
        newY = Math.max(walkableArea.topY + 50, Math.min(walkableArea.bottomY - 50, centerY));
      }
    }

    // Teleport both players to new positions
    const players = this.playerController.getPlayers();
    players.forEach((player, index) => {
      const offsetX = index * 80 - 40; // Spread players apart
      player.sprite.setPosition(newX + offsetX, newY);
      player.x = newX + offsetX;
      player.y = newY;
    });
  }



  private createUI() {
    // Minecraft-style inventory grid in bottom left
    const cellSize = 60; // Increased from 40
    const cellSpacing = 6;
    const inventoryStartX = 20;
    const inventoryStartY = this.scale.height - 80;

    // Create initial inventory grid (will expand as items are added)
    this.updateInventoryGrid = () => {
      const itemCount = this.gameState.inventory.length;
      const neededCells = Math.max(itemCount, 3); // Show at least 3 cells
      const assetUrls = this.registry.get('assetUrls') || [];
      const assetMap = new Map(assetUrls.map((a: any) => [a.name, a.image_url]));

      // Remove old cells
      this.inventoryCells.forEach(cell => cell.destroy());
      this.inventoryTexts.forEach(text => text.destroy());
      this.inventorySprites.forEach(sprite => sprite.destroy());
      this.inventoryCells.length = 0;
      this.inventoryTexts.length = 0;
      this.inventorySprites.length = 0;

      // Create cells for current inventory
      for (let i = 0; i < neededCells; i++) {
        const x = inventoryStartX + (i * (cellSize + cellSpacing));
        const y = inventoryStartY;

        // Cell background
        const cell = this.add.rectangle(x, y, cellSize, cellSize, 0x000000, 0.8);
        cell.setStrokeStyle(2, i < itemCount ? 0xffffff : 0x666666);
        cell.setOrigin(0, 0);
        cell.setDepth(100);
        this.inventoryCells.push(cell);

        // Item sprite or text
        if (i < itemCount) {
          const itemName = this.gameState.inventory[i];
          const hasAsset = assetMap.has(itemName);

          if (hasAsset && this.textures.exists(`item_${itemName}`)) {
            // Use image sprite
            const itemSprite = this.add.image(
              x + cellSize / 2,
              y + cellSize / 2,
              `item_${itemName}`
            );
            // Scale to fit within cell with some padding
            const maxSize = cellSize - 10;
            const scale = Math.min(
              maxSize / itemSprite.width,
              maxSize / itemSprite.height
            );
            itemSprite.setScale(scale);
            itemSprite.setDepth(101);
            this.inventorySprites.push(itemSprite);
          } else {
            // Fallback to text abbreviation
            const itemText = this.add.text(
              x + cellSize / 2,
              y + cellSize / 2,
              itemName.substring(0, 2).toUpperCase(),
              {
                fontSize: '18px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
              }
            );
            itemText.setOrigin(0.5);
            itemText.setDepth(101);
            this.inventoryTexts.push(itemText);
          }
        }
      }
    };

    // Initial inventory render
    this.updateInventoryGrid();

    // Update inventory display when items change
    this.events.on('wake', () => {
      this.updateInventoryGrid?.();
    });

    // Scene name display
    if (!this.gameState.isInDialog) {
      this.playerController.update();
    }

    // Update inventory grid display
    this.events.emit('wake');
  }

  private hideInventory() {
    this.inventoryCells.forEach(cell => cell.setVisible(false));
    this.inventoryTexts.forEach(text => text.setVisible(false));
    this.inventorySprites.forEach(sprite => sprite.setVisible(false));
  }

  private showInventory() {
    this.inventoryCells.forEach(cell => cell.setVisible(true));
    this.inventoryTexts.forEach(text => text.setVisible(true));
    this.inventorySprites.forEach(sprite => sprite.setVisible(true));
  }

  update() {
    // Update inventory visibility - hide only during NPC dialogs, not narrator
    if (this.dialogSystem.isDialogActive()) {
      this.hideInventory();
    } else {
      this.showInventory();
    }

    // Handle narrator dismissal
    if (this.sceneManager.isNarratorAnimating()) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.sceneManager.completeNarratorAnimation();
      }
    } else if (this.gameState.isInDialog) {
      // Narrator finished animating, wait for dismissal
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        console.log('Narrator dismissed - enabling movement');
        this.gameState.isInDialog = false;
        this.playerController.enableMovement();
      }
    }

    // Update player controller only when not in dialog AND no active NPC dialog
    if (!this.gameState.isInDialog && !this.dialogSystem.isDialogActive()) {
      this.playerController.update();
    }
  }
}
