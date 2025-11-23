"use client"

import * as Phaser from 'phaser';
import './style.css';
import { GameEngine } from './GameEngine.js';
import { sampleGameData, assetUrls } from './SampleGameData.js';

// Initialize the game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  parent: 'game-root',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: GameEngine
};

// Clear the app div and start the game
document.querySelector<HTMLDivElement>('#game-root')!.innerHTML = '';
const game = new Phaser.Game(config);

// Load sample game data and asset URLs separately
game.registry.set('gameData', sampleGameData);
game.registry.set('assetUrls', assetUrls);
