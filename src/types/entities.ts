/**
 * Entity Component System types
 */

import type * as THREE from 'three';
import type { EnemyType } from './game';

export interface Transform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export interface Entity {
  id: string;
  type: EntityType;
  transform: Transform;
  mesh?: THREE.Object3D;
  active: boolean;
  components: Component[];
}

export enum EntityType {
  PLAYER = 'player',
  FLEET_SHIP = 'fleet_ship',
  ENEMY = 'enemy',
  PROJECTILE = 'projectile',
  DOUBLOON = 'doubloon',
  CHEST = 'chest',
  WRECK = 'wreck',
  ISLAND = 'island',
  PARTICLE = 'particle',
  BOSS = 'boss',
}

export interface Component {
  type: ComponentType;
  entity: Entity;
  update(deltaTime: number): void;
}

export enum ComponentType {
  HEALTH = 'health',
  MOVEMENT = 'movement',
  COMBAT = 'combat',
  AI = 'ai',
  COLLIDER = 'collider',
  LIFETIME = 'lifetime',
  ANIMATION = 'animation',
}

export interface HealthComponent extends Component {
  maxHealth: number;
  currentHealth: number;
  armor: number;
  onDeath?: () => void;
  takeDamage(amount: number): void;
  heal(amount: number): void;
}

export interface MovementComponent extends Component {
  velocity: THREE.Vector3;
  maxSpeed: number;
  acceleration: number;
  rotationSpeed: number;
  targetPosition?: THREE.Vector3;
  moveTowards(target: THREE.Vector3, deltaTime: number): void;
}

export interface CombatComponent extends Component {
  damage: number;
  fireRate: number;
  range: number;
  lastFireTime: number;
  projectileSpeed: number;
  autoTarget: boolean;
  canFire(): boolean;
  fire(target: THREE.Vector3): void;
}

export interface AIComponent extends Component {
  behavior: AIBehavior;
  target?: Entity;
  detectionRange: number;
  attackRange: number;
  updateAI(deltaTime: number): void;
}

export enum AIBehavior {
  IDLE = 'idle',
  CHASE = 'chase',
  ATTACK = 'attack',
  FLEE = 'flee',
  ORBIT = 'orbit',
  BOSS_PHASE_1 = 'boss_phase_1',
  BOSS_PHASE_2 = 'boss_phase_2',
  BOSS_PHASE_3 = 'boss_phase_3',
}

export interface ShipStats {
  maxHealth: number;
  speed: number;
  turnSpeed: number;
  fireRate: number;
  damage: number;
  range: number;
  cannons: number;
  armor: number;
}

export interface EnemyDefinition {
  type: EnemyType;
  model: string;
  stats: ShipStats;
  doubloonDrop: number;
  xpValue: number;
  spawnWeight: number;
  minWave: number;
}

export interface ProjectileData {
  damage: number;
  speed: number;
  lifetime: number;
  piercing: boolean;
  areaOfEffect: number;
  owner: Entity;
}

export interface ParticleEffect {
  position: THREE.Vector3;
  color: THREE.Color;
  size: number;
  lifetime: number;
  velocity: THREE.Vector3;
}
