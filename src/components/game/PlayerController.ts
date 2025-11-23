"use client"

import type { Player, GameData, AssetUrl } from './types/GameTypes';

export class PlayerController {
  private scene: Phaser.Scene;
  private players: Player[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: any;
  private playerColors = [0x00ff00, 0x0080ff]; // Green and Blue
  private walkableTopY: number;
  private walkableBottomY: number;
  private movementEnabled = true;
  private onSceneTransition?: (direction: 'left' | 'right' | 'top' | 'bottom') => void;
  private transitionCooldown = 0;
  private isInBranchScene = false;
  private animationTime = 0;
  private gameData: GameData;
  private assetUrls: AssetUrl[];

  constructor(scene: Phaser.Scene, gameData: GameData, assetUrls: AssetUrl[], walkableVerticalRatio: number = 0.5) {
    this.scene = scene;
    this.gameData = gameData;
    this.assetUrls = assetUrls;

    // Calculate walkable area bounds (middle section of screen)
    const screenHeight = this.scene.scale.height;
    const walkableHeight = screenHeight * walkableVerticalRatio;
    this.walkableTopY = (screenHeight - walkableHeight) / 2;
    this.walkableBottomY = this.walkableTopY + walkableHeight;

    this.setupPlayers();
    this.setupControls();
  }

  private setupPlayers() {
    const startX = this.scene.scale.width * 0.2 - 100; // Start at 20% from left, minus 20 pixels
    const startY = (this.walkableTopY + this.walkableBottomY) / 2; // Center of walkable area
    const playerSize = this.gameData.players.player_size || 64;
    const sprites = this.gameData.players.sprites;
    const assetMap = new Map(this.assetUrls.map(a => [a.name, a.image_url]));

    for (let i = 0; i < sprites.length; i++) {
      const spriteId = sprites[i];
      let sprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
      const hasAsset = assetMap.has(spriteId);
      const xPos = startX + (i * 105); // Space players 105px apart

      if (hasAsset) {
        // Create image sprite from asset_urls
        sprite = this.scene.add.image(xPos, startY, `player_${i}`);
        // Scale to fit player_size while maintaining aspect ratio
        const scale = Math.min(
          playerSize / sprite.width,
          playerSize / sprite.height
        );
        sprite.setScale(scale);
        (sprite as any).originalScale = scale; // Store original scale
      } else {
        // Create rectangle sprite (fallback)
        sprite = this.scene.add.rectangle(
          xPos,
          startY,
          playerSize,
          playerSize,
          this.playerColors[i] || 0xff0000
        );
        (sprite as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0xffffff);
        (sprite as any).originalScale = 1; // Store original scale
      }

      const player: Player = {
        sprite: sprite,
        x: xPos,
        y: startY,
        speed: 300
      };

      sprite.setDepth(500); // Ensure players are visible above backgrounds

      // Enable physics
      this.scene.physics.add.existing(sprite);
      const body = sprite.body as Phaser.Physics.Arcade.Body;

      // Set custom bounds for walkable area
      body.setCollideWorldBounds(false); // We'll handle bounds manually

      this.players.push(player);
    }
  }

  private setupControls() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();

    // WASD for player 1, arrows for player 2
    this.wasd = this.scene.input.keyboard!.addKeys('W,S,A,D');
  }

  setOnSceneTransition(callback: (direction: 'left' | 'right' | 'top' | 'bottom') => void) {
    this.onSceneTransition = callback;
  }

  update() {
    if (!this.movementEnabled) return;

    // Update animation time
    this.animationTime += 0.15;

    // Update transition cooldown
    if (this.transitionCooldown > 0) {
      this.transitionCooldown--;
    }

    // Player 1 (WASD)
    if (this.players[0]) {
      this.updatePlayer(this.players[0], {
        up: this.wasd.W.isDown,
        down: this.wasd.S.isDown,
        left: this.wasd.A.isDown,
        right: this.wasd.D.isDown
      });
    }

    // Player 2 (Arrow keys for movement)
    if (this.players[1]) {
      this.updatePlayer(this.players[1], {
        up: this.cursors.up.isDown,
        down: this.cursors.down.isDown,
        left: this.cursors.left.isDown,
        right: this.cursors.right.isDown
      });
    }

    // Check for scene transitions based on player position
    if (this.transitionCooldown <= 0) {
      this.checkSceneTransitions();
    }
  }

  private updatePlayer(player: Player, controls: {up: boolean, down: boolean, left: boolean, right: boolean}) {
    const body = player.sprite.body as Phaser.Physics.Arcade.Body;

    // Reset velocity
    body.setVelocity(0);

    // Undertale-style 4-directional movement
    let velocityX = 0;
    let velocityY = 0;

    if (controls.left) {
      velocityX = -player.speed;
    } else if (controls.right) {
      velocityX = player.speed;
    }

    if (controls.up) {
      velocityY = -player.speed;
    } else if (controls.down) {
      velocityY = player.speed;
    }

    // Normalize diagonal movement (like in Undertale)
    if (velocityX !== 0 && velocityY !== 0) {
      const normalizedSpeed = player.speed * 0.707; // sqrt(2)/2
      velocityX = velocityX > 0 ? normalizedSpeed : -normalizedSpeed;
      velocityY = velocityY > 0 ? normalizedSpeed : -normalizedSpeed;
    }

    // Get current position BEFORE setting velocity
    const bodyX = body.x + body.halfWidth;
    const bodyY = body.y + body.halfHeight;

    // Check bounds and constrain velocity if needed (don't set position directly)
    const margin = 5;
    let finalVelocityX = velocityX;
    let finalVelocityY = velocityY;

    // Stop at screen edges
    if (bodyX <= margin && velocityX < 0) finalVelocityX = 0;
    if (bodyX >= this.scene.scale.width - margin && velocityX > 0) finalVelocityX = 0;
    if (bodyY <= margin && velocityY < 0) finalVelocityY = 0;
    if (bodyY >= this.scene.scale.height - margin && velocityY > 0) finalVelocityY = 0;

    // Constrain vertical movement to walkable area (except in branch scenes)
    if (!this.isInBranchScene) {
      const walkableMargin = 16;
      const topBoundary = this.walkableTopY + walkableMargin;
      const bottomBoundary = this.walkableBottomY - walkableMargin;
      const edgeBuffer = 15;

      // Only constrain if we're in the middle zone (not near screen edges)
      if (bodyY > margin + edgeBuffer && bodyY < this.scene.scale.height - margin - edgeBuffer) {
        if (bodyY <= topBoundary && velocityY < 0) finalVelocityY = 0;
        if (bodyY >= bottomBoundary && velocityY > 0) finalVelocityY = 0;
      }
    }

    // Set the velocity (Phaser will handle position updates)
    body.setVelocity(finalVelocityX, finalVelocityY);

    // Update player position tracking from body (for external reference)
    player.x = body.x + body.halfWidth;
    player.y = body.y + body.halfHeight;

    // Apply walking animation - simple scale bobbing without position offset
    const isMoving = velocityX !== 0 || velocityY !== 0;
    if (isMoving) {
      // Simple scale pulse animation to show movement
      const scaleBob = Math.abs(Math.sin(this.animationTime * 10)) * 0.05; // 5% scale variation
      const originalScale = (player.sprite as any).originalScale || 1;
      player.sprite.setScale(originalScale * (1 + scaleBob));
    } else {
      // Reset to original scale when idle
      const originalScale = (player.sprite as any).originalScale || 1;
      player.sprite.setScale(originalScale);
    }
  }

  private checkSceneTransitions() {
    // Check if any player has moved to screen edges for scene transitions
    this.players.forEach(player => {
      const edgeMargin = 5; // Very small margin for actual edge detection
      const body = player.sprite.body as Phaser.Physics.Arcade.Body;
      const playerX = body.x + body.halfWidth;
      const playerY = body.y + body.halfHeight;

      // Left edge transition
      if (playerX <= edgeMargin && this.onSceneTransition) {
        this.transitionCooldown = 60; // 1 second cooldown at 60fps
        this.onSceneTransition('left');
        return;
      }

      // Right edge transition
      if (playerX >= this.scene.scale.width - edgeMargin && this.onSceneTransition) {
        this.transitionCooldown = 60;
        this.onSceneTransition('right');
        return;
      }

      // Top edge transition - only at the very top of screen (not walkable area)
      if (playerY <= edgeMargin && this.onSceneTransition) {
        this.transitionCooldown = 60;
        this.onSceneTransition('top');
        return;
      }

      // Bottom edge transition - only at the very bottom of screen (not walkable area)
      if (playerY >= this.scene.scale.height - edgeMargin && this.onSceneTransition) {
        this.transitionCooldown = 60;
        this.onSceneTransition('bottom');
        return;
      }
    });
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getPlayerPositions(): { x: number; y: number }[] {
    return this.players.map(p => ({ x: p.x, y: p.y }));
  }

  setPlayerPositions(positions: { x: number; y: number }[]) {
    positions.forEach((pos, index) => {
      if (this.players[index]) {
        this.players[index].sprite.setPosition(pos.x, pos.y);
        this.players[index].x = pos.x;
        this.players[index].y = pos.y;
      }
    });
  }

  enableMovement() {
    this.movementEnabled = true;
  }

  disableMovement() {
    this.movementEnabled = false;
    this.players.forEach(player => {
      const body = player.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0);
    });
  }

  getWalkableArea() {
    return {
      topY: this.walkableTopY,
      bottomY: this.walkableBottomY,
      height: this.walkableBottomY - this.walkableTopY
    };
  }

  resetTransitionCooldown() {
    this.transitionCooldown = 0;
  }

  setInBranchScene(isInBranchScene: boolean) {
    this.isInBranchScene = isInBranchScene;
  }
}
