/**
 * Core game types for MAELSTROM
 */

export enum GameState {
  LOADING = 'loading',
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  VICTORY = 'victory',
  UPGRADE_SELECT = 'upgrade_select',
}

export enum GameMode {
  OPEN_OCEAN = 'open_ocean',
  TREASURE_HUNT = 'treasure_hunt',
  GHOST_FLEET = 'ghost_fleet',
  ISLAND_FORTRESS = 'island_fortress',
  DAILY_CHALLENGE = 'daily_challenge',
}

export enum ShipType {
  SLOOP = 'sloop',
  ROWBOAT_GANG = 'rowboat_gang',
  WRAITH = 'wraith',
  ARMADA_COMMANDER = 'armada_commander',
}

export enum EnemyType {
  ROWBOAT_RAIDER = 'rowboat_raider',
  SLOOP_HUNTER = 'sloop_hunter',
  NAVY_FRIGATE = 'navy_frigate',
  ARMADA_GALLEON = 'armada_galleon',
  GHOST_SHIP = 'ghost_ship',
  GHOST_BOSS = 'ghost_boss',
}

export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum UpgradeCategory {
  FLEET = 'fleet',
  WEAPON = 'weapon',
  SHIP = 'ship',
  ABILITY = 'ability',
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface GameConfig {
  seed: string;
  mode: GameMode;
  shipType: ShipType;
  difficulty: number;
}

export interface PlayerStats {
  doubloons: number;
  skulls: number;
  highScore: number;
  longestSurvival: number;
  totalRuns: number;
  unlockedShips: ShipType[];
  permanentUpgrades: PermanentUpgradeState;
}

export interface PermanentUpgradeState {
  hullReinforcement: number;
  startingFleet: number;
  treasureMagnet: number;
  cannonMaster: number;
  ghostWard: number;
  islandAnchor: number;
  flagBearer: number;
  ghostHullMastery: number;
}

export interface RunState {
  score: number;
  survivalTime: number;
  doubloons: number;
  skullsEarned: number;
  level: number;
  doubloonsToNextLevel: number;
  kills: number;
  wave: number;
}

export interface LeaderboardEntry {
  playerName: string;
  shipUsed: ShipType;
  survivalTime: number;
  score: number;
  mode: GameMode;
  date: string;
}

export interface DailyChallenge {
  date: string;
  seed: string;
  mode: GameMode;
  topScores: LeaderboardEntry[];
}
