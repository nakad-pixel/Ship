/**
 * Game constants
 */

// Game Settings
export const GAME_SETTINGS = {
  // World
  WORLD_SIZE: 1000,
  CHUNK_SIZE: 50,
  DESPAWN_DISTANCE: 150,
  SPAWN_DISTANCE: 120,

  // Camera
  CAMERA_HEIGHT: 40,
  CAMERA_OFFSET: { x: 0, y: 40, z: 30 },
  CAMERA_SMOOTHING: 0.1,
  CAMERA_MIN_ZOOM: 20,
  CAMERA_MAX_ZOOM: 80,

  // Player
  PLAYER_START_HEALTH: 100,
  PLAYER_START_SPEED: 8,
  PLAYER_TURN_SPEED: 3,
  PLAYER_INVINCIBILITY_TIME: 1,

  // Combat
  CANNONBALL_SPEED: 40,
  CANNONBALL_LIFETIME: 3,
  CANNONBALL_GRAVITY: 9.8,
  AUTO_TARGET_RANGE: 60,
  FIRE_ARC_HEIGHT: 5,

  // Economy
  DOUBLOONS_PER_LEVEL: 100,
  SKULLS_PER_100_DOUBLOONS: 1,
  BOSS_SKULL_BONUS: 10,

  // Wave System
  WAVE_DURATION: 60,
  BOSS_WAVE_INTERVAL: 8,
  MAX_WAVES: 30,

  // Fleet
  FLEET_ORBIT_DISTANCE: 8,
  FLEET_ORBIT_SPEED: 0.5,
  MAX_FLEET_SIZE: 20,

  // Pickups
  DOUBLOON_PICKUP_RADIUS: 3,
  DOUBLOON_MAGNET_RADIUS: 15,
  CHEST_PICKUP_RADIUS: 5,

  // Particles
  MAX_PARTICLES: 500,
  PARTICLE_LIFETIME: 2,

  // Audio
  MAX_CONCURRENT_SOUNDS: 32,
  MUSIC_FADE_TIME: 2,

  // UI
  HUD_UPDATE_RATE: 10,
  MINIMAP_SIZE: 200,
  MINIMAP_RANGE: 100,
};

// Ship Stats
export const SHIP_STATS = {
  sloop: {
    health: 100,
    speed: 8,
    turnSpeed: 3,
    fireRate: 1.5,
    damage: 10,
    range: 50,
    cannons: 2,
    armor: 0,
  },
  rowboat_gang: {
    health: 60,
    speed: 6,
    turnSpeed: 4,
    fireRate: 0.8,
    damage: 5,
    range: 40,
    cannons: 6,
    armor: 0,
  },
  wraith: {
    health: 120,
    speed: 10,
    turnSpeed: 3.5,
    fireRate: 1.2,
    damage: 15,
    range: 55,
    cannons: 4,
    armor: 0.3,
  },
  armada_commander: {
    health: 200,
    speed: 5,
    turnSpeed: 2,
    fireRate: 2,
    damage: 20,
    range: 60,
    cannons: 4,
    armor: 0.2,
  },
};

// Enemy Definitions
export const ENEMY_DEFINITIONS = {
  rowboat_raider: {
    model: 'boat-row-small',
    health: 20,
    speed: 5,
    damage: 5,
    fireRate: 2,
    doubloons: 2,
    xp: 5,
    weight: 40,
    minWave: 0,
  },
  sloop_hunter: {
    model: 'ship-small',
    health: 50,
    speed: 6,
    damage: 10,
    fireRate: 1.5,
    doubloons: 5,
    xp: 10,
    weight: 30,
    minWave: 2,
  },
  navy_frigate: {
    model: 'ship-medium',
    health: 100,
    speed: 4,
    damage: 15,
    fireRate: 1.2,
    doubloons: 10,
    xp: 20,
    weight: 20,
    minWave: 5,
  },
  armada_galleon: {
    model: 'ship-large',
    health: 250,
    speed: 3,
    damage: 25,
    fireRate: 1,
    doubloons: 25,
    xp: 50,
    weight: 8,
    minWave: 10,
  },
  ghost_ship: {
    model: 'ship-ghost',
    health: 75,
    speed: 7,
    damage: 20,
    fireRate: 1.5,
    doubloons: 15,
    xp: 30,
    weight: 2,
    minWave: 3,
  },
  ghost_boss: {
    model: 'ship-ghost',
    health: 2000,
    speed: 4,
    damage: 40,
    fireRate: 0.8,
    doubloons: 200,
    xp: 500,
    weight: 0,
    minWave: 8,
    isBoss: true,
  },
};

// Colors
export const COLORS = {
  // Ocean
  ocean: 0x1a6fa8,
  oceanDark: 0x0d4a3e,
  oceanCurse: 0x0d3a2e,
  foam: 0xffffff,

  // Ships
  player: 0x8b4513,
  fleet: 0xd2691e,
  enemy: 0x8b0000,
  ghost: 0x2ecc71,
  ghostEmissive: 0x00ff00,

  // Projectiles
  cannonball: 0x1a1a1a,
  trail: 0x888888,

  // Pickups
  doubloon: 0xffd700,
  chest: 0xffaa00,
  skull: 0xf0f0f0,

  // Particles
  explosion: 0xff5500,
  smoke: 0x555555,
  spark: 0xffdd00,
  water: 0x88ccff,

  // UI
  health: 0xe74c3c,
  healthBg: 0x2c3e50,
  xp: 0xf1c40f,
  text: 0xffffff,
  textShadow: 0x000000,

  // Rarity
  common: 0xbdc3c7,
  rare: 0x3498db,
  epic: 0x9b59b6,
  legendary: 0xf1c40f,
};

// Layer constants for rendering order
export const RENDER_LAYERS = {
  OCEAN: 0,
  SHADOWS: 1,
  WRECKS: 2,
  SHIPS: 3,
  PROJECTILES: 4,
  PARTICLES: 5,
  PICKUPS: 6,
  UI_3D: 7,
  EFFECTS: 8,
};

// Collision groups for physics
export const COLLISION_GROUPS = {
  PLAYER: 1,
  FLEET: 2,
  ENEMY: 4,
  PROJECTILE: 8,
  PICKUP: 16,
  ISLAND: 32,
  WRECK: 64,
};

// Input keys
export const INPUT_KEYS = {
  UP: ['w', 'arrowup'],
  DOWN: ['s', 'arrowdown'],
  LEFT: ['a', 'arrowleft'],
  RIGHT: ['d', 'arrowright'],
  PAUSE: ['escape', 'p'],
  INTERACT: ['e', ' '],
  CARD_1: ['1'],
  CARD_2: ['2'],
  CARD_3: ['3'],
  ZOOM_IN: ['+', '='],
  ZOOM_OUT: ['-', '_'],
};

// Local storage keys
export const STORAGE_KEYS = {
  PLAYER_STATS: 'maelstrom_player_stats',
  SETTINGS: 'maelstrom_settings',
  LAST_RUN: 'maelstrom_last_run',
  DAILY_CHALLENGE: 'maelstrom_daily',
  UNLOCKS: 'maelstrom_unlocks',
  HIGH_SCORES: 'maelstrom_high_scores',
};

// Asset paths
export const ASSET_PATHS = {
  models: '/assets/models/',
  textures: '/assets/textures/',
  audio: '/assets/audio/',
  icons: '/icons/',
};

// Starting Ship Definitions (duplicate from upgrades.ts to avoid circular deps)
export const STARTING_SHIPS = [
  {
    type: 'sloop' as const,
    name: 'The Sloop',
    description: 'A nimble pirate sloop. Balanced and reliable.',
    model: 'ship-pirate-small',
    cost: 0,
    stats: { health: 100, speed: 8, cannons: 2, damage: 10 },
    unlocked: true,
  },
  {
    type: 'rowboat_gang' as const,
    name: 'Rowboat Gang',
    description: 'Three rowboats chained together. High fire rate, fragile.',
    model: 'boat-row-small',
    cost: 30,
    stats: { health: 60, speed: 6, cannons: 6, damage: 5 },
    unlocked: false,
  },
  {
    type: 'wraith' as const,
    name: 'The Wraith',
    description: 'A ghostly vessel. Immune to collision damage.',
    model: 'ship-ghost',
    cost: 150,
    stats: { health: 120, speed: 10, cannons: 4, damage: 15 },
    unlocked: false,
  },
  {
    type: 'armada_commander' as const,
    name: 'Armada Commander',
    description: 'A mighty galleon. Starts with extra fleet ships.',
    model: 'ship-pirate-large',
    cost: 200,
    stats: { health: 200, speed: 5, cannons: 4, damage: 20 },
    unlocked: false,
  },
];

// Game mode configurations
export const GAME_MODE_CONFIG = {
  open_ocean: {
    duration: 0, // endless
    bossInterval: 8,
    specialRules: [],
  },
  treasure_hunt: {
    duration: 600, // 10 minutes
    bossInterval: 0,
    specialRules: ['central_island', 'timer'],
  },
  ghost_fleet: {
    duration: 1200, // 20 minutes
    bossInterval: 10,
    specialRules: ['ghost_only', 'curse_effect'],
  },
  island_fortress: {
    duration: 0,
    bossInterval: 0,
    specialRules: ['building_phase', 'defense_waves'],
  },
  daily_challenge: {
    duration: 0,
    bossInterval: 8,
    specialRules: ['fixed_seed'],
  },
};
