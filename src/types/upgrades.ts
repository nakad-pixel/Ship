/**
 * Upgrade card system types
 */

import { Rarity, UpgradeCategory, ShipType } from './game';

export interface UpgradeCard {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  rarity: Rarity;
  icon: string;
  maxStacks: number;
  effect: UpgradeEffect;
}

export interface UpgradeEffect {
  type: EffectType;
  value: number;
  target?: string;
}

export enum EffectType {
  ADD_FLEET_SHIP = 'add_fleet_ship',
  INCREASE_DAMAGE = 'increase_damage',
  INCREASE_FIRE_RATE = 'increase_fire_rate',
  INCREASE_RANGE = 'increase_range',
  INCREASE_HEALTH = 'increase_health',
  INCREASE_SPEED = 'increase_speed',
  ADD_CANNON = 'add_cannon',
  SPREAD_SHOT = 'spread_shot',
  RAM_PROW = 'ram_prow',
  GHOST_HULL = 'ghost_hull',
  BARREL_BOMB = 'barrel_bomb',
  CANNON_TOWER = 'cannon_tower',
  VORTEX = 'vortex',
  TREASURE_MAGNET = 'treasure_magnet',
  CRIT_CHANCE = 'crit_chance',
  LIFESTEAL = 'lifesteal',
}

export interface UpgradeState {
  availableUpgrades: UpgradeCard[];
  selectedUpgrades: Map<string, number>;
}

export interface StartingShip {
  type: ShipType;
  name: string;
  description: string;
  model: string;
  cost: number;
  stats: {
    health: number;
    speed: number;
    cannons: number;
    damage: number;
  };
  unlocked: boolean;
}

export interface PermanentUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  costPerLevel: number[];
  effect: PermanentUpgradeEffect;
}

export interface PermanentUpgradeEffect {
  type: PermanentEffectType;
  values: number[];
}

export enum PermanentEffectType {
  STARTING_HEALTH = 'starting_health',
  STARTING_FLEET = 'starting_fleet',
  DOUBLOON_MULTIPLIER = 'doubloon_multiplier',
  DAMAGE_BOOST = 'damage_boost',
  GHOST_RESISTANCE = 'ghost_resistance',
  BUILD_COST_REDUCTION = 'build_cost_reduction',
  FLEET_DAMAGE_BOOST = 'fleet_damage_boost',
  GHOST_HULL_UNLOCK = 'ghost_hull_unlock',
}

// Upgrade Card Definitions
export const UPGRADE_CARDS: UpgradeCard[] = [
  // Fleet Expansion
  {
    id: 'rowboat_recruit',
    name: 'Rowboat Recruit',
    description: 'Add a rowboat to your fleet that orbits your flagship',
    category: UpgradeCategory.FLEET,
    rarity: Rarity.COMMON,
    icon: 'boat-row-small',
    maxStacks: 10,
    effect: { type: EffectType.ADD_FLEET_SHIP, value: 1, target: 'boat-row-small' },
  },
  {
    id: 'sloop_reinforcement',
    name: 'Sloop Reinforcement',
    description: 'Add a pirate sloop to your fleet with dual cannons',
    category: UpgradeCategory.FLEET,
    rarity: Rarity.RARE,
    icon: 'ship-pirate-small',
    maxStacks: 5,
    effect: { type: EffectType.ADD_FLEET_SHIP, value: 1, target: 'ship-pirate-small' },
  },
  {
    id: 'frigate_alliance',
    name: 'Frigate Alliance',
    description: 'A powerful frigate joins your armada',
    category: UpgradeCategory.FLEET,
    rarity: Rarity.EPIC,
    icon: 'ship-pirate-medium',
    maxStacks: 3,
    effect: { type: EffectType.ADD_FLEET_SHIP, value: 1, target: 'ship-pirate-medium' },
  },
  {
    id: 'galleon_command',
    name: 'Galleon Command',
    description: 'A massive galleon fights alongside you',
    category: UpgradeCategory.FLEET,
    rarity: Rarity.LEGENDARY,
    icon: 'ship-pirate-large',
    maxStacks: 2,
    effect: { type: EffectType.ADD_FLEET_SHIP, value: 1, target: 'ship-pirate-large' },
  },

  // Weapon Upgrades
  {
    id: 'cannon_mastery',
    name: 'Cannon Mastery',
    description: 'Increase cannon damage by 15%',
    category: UpgradeCategory.WEAPON,
    rarity: Rarity.COMMON,
    icon: 'cannon',
    maxStacks: 5,
    effect: { type: EffectType.INCREASE_DAMAGE, value: 0.15 },
  },
  {
    id: 'rapid_reload',
    name: 'Rapid Reload',
    description: 'Increase fire rate by 20%',
    category: UpgradeCategory.WEAPON,
    rarity: Rarity.COMMON,
    icon: 'cannon-ball',
    maxStacks: 5,
    effect: { type: EffectType.INCREASE_FIRE_RATE, value: 0.20 },
  },
  {
    id: 'extended_range',
    name: 'Extended Range',
    description: 'Increase cannon range by 25%',
    category: UpgradeCategory.WEAPON,
    rarity: Rarity.RARE,
    icon: 'flag-pirate',
    maxStacks: 3,
    effect: { type: EffectType.INCREASE_RANGE, value: 0.25 },
  },
  {
    id: 'triple_cannons',
    name: 'Triple Cannons',
    description: 'Fire 3 cannonballs in a spread pattern',
    category: UpgradeCategory.WEAPON,
    rarity: Rarity.RARE,
    icon: 'cannon-mobile',
    maxStacks: 1,
    effect: { type: EffectType.SPREAD_SHOT, value: 3 },
  },
  {
    id: 'critical_strike',
    name: 'Critical Strike',
    description: 'Cannons have 15% chance to deal double damage',
    category: UpgradeCategory.WEAPON,
    rarity: Rarity.EPIC,
    icon: 'chest',
    maxStacks: 3,
    effect: { type: EffectType.CRIT_CHANCE, value: 0.15 },
  },

  // Ship Upgrades
  {
    id: 'reinforced_hull',
    name: 'Reinforced Hull',
    description: 'Increase max health by 25%',
    category: UpgradeCategory.SHIP,
    rarity: Rarity.COMMON,
    icon: 'crate',
    maxStacks: 4,
    effect: { type: EffectType.INCREASE_HEALTH, value: 0.25 },
  },
  {
    id: 'swift_sails',
    name: 'Swift Sails',
    description: 'Increase movement speed by 15%',
    category: UpgradeCategory.SHIP,
    rarity: Rarity.COMMON,
    icon: 'mast',
    maxStacks: 4,
    effect: { type: EffectType.INCREASE_SPEED, value: 0.15 },
  },
  {
    id: 'iron_ram',
    name: 'Iron Ram Prow',
    description: 'Deal damage when ramming enemy ships',
    category: UpgradeCategory.SHIP,
    rarity: Rarity.RARE,
    icon: 'ship-wreck',
    maxStacks: 3,
    effect: { type: EffectType.RAM_PROW, value: 50 },
  },
  {
    id: 'ghost_hull',
    name: 'Ghost Hull',
    description: 'Take 30% less damage from ghost ships',
    category: UpgradeCategory.SHIP,
    rarity: Rarity.EPIC,
    icon: 'ship-ghost',
    maxStacks: 1,
    effect: { type: EffectType.GHOST_HULL, value: 0.30 },
  },
  {
    id: 'vampiric_plating',
    name: 'Vampiric Plating',
    description: 'Heal 5% of damage dealt',
    category: UpgradeCategory.SHIP,
    rarity: Rarity.LEGENDARY,
    icon: 'bottle',
    maxStacks: 1,
    effect: { type: EffectType.LIFESTEAL, value: 0.05 },
  },

  // Abilities
  {
    id: 'barrel_bomb',
    name: 'Barrel Bombs',
    description: 'Drop explosive barrels that damage nearby enemies',
    category: UpgradeCategory.ABILITY,
    rarity: Rarity.RARE,
    icon: 'barrel',
    maxStacks: 3,
    effect: { type: EffectType.BARREL_BOMB, value: 100 },
  },
  {
    id: 'cannon_tower',
    name: 'Cannon Tower',
    description: 'Place stationary cannon towers that auto-fire',
    category: UpgradeCategory.ABILITY,
    rarity: Rarity.EPIC,
    icon: 'tower-complete-large',
    maxStacks: 5,
    effect: { type: EffectType.CANNON_TOWER, value: 1 },
  },
  {
    id: 'whirlpool_vortex',
    name: 'Whirlpool Vortex',
    description: 'Create a vortex that pulls enemies in and damages them',
    category: UpgradeCategory.ABILITY,
    rarity: Rarity.LEGENDARY,
    icon: 'hole',
    maxStacks: 1,
    effect: { type: EffectType.VORTEX, value: 200 },
  },
  {
    id: 'treasure_sense',
    name: 'Treasure Sense',
    description: 'Increase doubloon pickup range by 50%',
    category: UpgradeCategory.ABILITY,
    rarity: Rarity.COMMON,
    icon: 'chest',
    maxStacks: 3,
    effect: { type: EffectType.TREASURE_MAGNET, value: 0.5 },
  },
];

// Permanent Upgrade Definitions
export const PERMANENT_UPGRADES: PermanentUpgrade[] = [
  {
    id: 'hull_reinforcement',
    name: 'Hull Reinforcement',
    description: 'Start with +10% health per level',
    icon: 'crate',
    maxLevel: 5,
    costPerLevel: [10, 25, 50, 100, 200],
    effect: { type: PermanentEffectType.STARTING_HEALTH, values: [0.1, 0.2, 0.3, 0.4, 0.5] },
  },
  {
    id: 'starting_fleet',
    name: 'Starting Fleet',
    description: 'Start with additional rowboats',
    icon: 'boat-row-small',
    maxLevel: 4,
    costPerLevel: [30, 60, 120, 250],
    effect: { type: PermanentEffectType.STARTING_FLEET, values: [1, 2, 3, 4] },
  },
  {
    id: 'treasure_magnet',
    name: 'Treasure Magnet',
    description: 'Increase skulls earned by 10% per level',
    icon: 'chest',
    maxLevel: 5,
    costPerLevel: [20, 40, 80, 150, 300],
    effect: { type: PermanentEffectType.DOUBLOON_MULTIPLIER, values: [0.1, 0.2, 0.3, 0.4, 0.5] },
  },
  {
    id: 'cannon_master',
    name: 'Cannon Master',
    description: 'Increase starting damage by 10% per level',
    icon: 'cannon',
    maxLevel: 5,
    costPerLevel: [15, 35, 75, 150, 300],
    effect: { type: PermanentEffectType.DAMAGE_BOOST, values: [0.1, 0.2, 0.3, 0.4, 0.5] },
  },
  {
    id: 'ghost_ward',
    name: 'Ghost Ward',
    description: 'Reduce damage from ghost ships by 10% per level',
    icon: 'ship-ghost',
    maxLevel: 3,
    costPerLevel: [50, 150, 400],
    effect: { type: PermanentEffectType.GHOST_RESISTANCE, values: [0.1, 0.25, 0.5] },
  },
  {
    id: 'island_anchor',
    name: 'Island Anchor',
    description: 'Reduce building costs in Island Fortress by 10% per level',
    icon: 'tower-base',
    maxLevel: 3,
    costPerLevel: [40, 100, 250],
    effect: { type: PermanentEffectType.BUILD_COST_REDUCTION, values: [0.1, 0.2, 0.35] },
  },
  {
    id: 'flag_bearer',
    name: 'Flag Bearer',
    description: 'Increase fleet ship damage by 15% per level',
    icon: 'flag-pirate',
    maxLevel: 3,
    costPerLevel: [60, 150, 350],
    effect: { type: PermanentEffectType.FLEET_DAMAGE_BOOST, values: [0.15, 0.35, 0.6] },
  },
  {
    id: 'ghost_hull_mastery',
    name: 'Ghost Hull Mastery',
    description: 'Unlock Ghost Hull upgrade in runs',
    icon: 'ship-ghost',
    maxLevel: 1,
    costPerLevel: [150],
    effect: { type: PermanentEffectType.GHOST_HULL_UNLOCK, values: [1] },
  },
];

// Starting Ship Definitions
export const STARTING_SHIPS: StartingShip[] = [
  {
    type: ShipType.SLOOP,
    name: 'The Sloop',
    description: 'A nimble pirate sloop. Balanced and reliable.',
    model: 'ship-pirate-small',
    cost: 0,
    stats: { health: 100, speed: 8, cannons: 2, damage: 10 },
    unlocked: true,
  },
  {
    type: ShipType.ROWBOAT_GANG,
    name: 'Rowboat Gang',
    description: 'Three rowboats chained together. High fire rate, fragile.',
    model: 'boat-row-small',
    cost: 30,
    stats: { health: 60, speed: 6, cannons: 6, damage: 5 },
    unlocked: false,
  },
  {
    type: ShipType.WRAITH,
    name: 'The Wraith',
    description: 'A ghostly vessel. Immune to collision damage.',
    model: 'ship-ghost',
    cost: 150,
    stats: { health: 120, speed: 10, cannons: 4, damage: 15 },
    unlocked: false,
  },
  {
    type: ShipType.ARMADA_COMMANDER,
    name: 'Armada Commander',
    description: 'A mighty galleon. Starts with extra fleet ships.',
    model: 'ship-pirate-large',
    cost: 200,
    stats: { health: 200, speed: 5, cannons: 4, damage: 20 },
    unlocked: false,
  },
];
