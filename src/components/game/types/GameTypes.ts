"use client"

// Type definitions for the Game DSL

export interface AssetUrl {
  asset_id: string;
  name: string;
  image_url: string;
}

export interface GameData {
  players: {
    sprites: string[];
    player_size?: number;
  };
  layout: {
    walkable_vertical_ratio: number;
    branch_directions: string[];
    walkable_band?: { y_start: number; y_end: number };
  };
  scenes: { [sceneId: string]: Scene };
  dialogs: { [dialogId: string]: DialogLine[] };
}

export interface Scene {
  background?: string;
  music?: string;
  narrator?: {
    lines: string[];
  };
  npcs?: NPC[];
  items_ground?: ItemGround[];
  npc_rewards?: NPCReward[];
  next?: string | null;
  prev?: string | null;
  branches?: Branch[];
  dialog?: string;
  requires_item?: string;
  fail_message?: string;
  success?: string;
  end_message?: string;
}

export interface NPC {
  id: string;
  x: number; // 0.0 to 1.0 across screen width
  y: number; // 0.0 to 1.0 across screen height (within walkable area)
  dialog: string;
  gives_item?: string | null;
}

export interface Branch {
  direction: string; // "top", "right", "bottom", "left"
  label: string;
  target: string;
  main?: boolean;
}

export interface ItemGround {
  item: string;
  x: number; // 0.0 to 1.0 across screen width
  y: number; // 0.0 to 1.0 across screen height
  dialog: string;
}

export interface NPCReward {
  npc: string;
  item: string;
}

export interface DialogLine {
  character: string;
  text: string;
}

export interface Player {
  sprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  x: number;
  y: number;
  speed: number;
}

export interface GameState {
  currentScene: string;
  inventory: string[];
  playerPositions: { x: number; y: number }[];
  isInDialog: boolean;
  currentDialog?: DialogLine[];
  dialogIndex: number;
  completedDialogs: Set<string>; // Track completed NPC dialogs globally
}
