/**
 * Player Ship Entity
 * The player's flagship that they control
 */

import * as THREE from 'three';
import { Game } from '../core/Game';
import { StartingShip } from '../types/upgrades';
import { GAME_SETTINGS, SHIP_STATS, COLORS } from '../utils/constants';
import { clamp, rotateTowards } from '../utils/math';

export class PlayerShip {
  public id: string;
  public type = 'player';
  public position: THREE.Vector3;
  public rotation: number = 0;
  public mesh: THREE.Group | null = null;
  public active: boolean = true;

  // Stats
  public maxHealth: number;
  public health: number;
  public speed: number;
  public turnSpeed: number;
  public fireRate: number;
  public damage: number;
  public range: number;
  public cannons: number;
  public armor: number;

  // State
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private targetRotation: number = 0;
  private lastFireTime: number = 0;
  private invincible: boolean = false;
  private invincibleTime: number = 0;

  constructor(game: Game, shipDef: StartingShip) {
    this.id = `player_${Date.now()}`;
    this.position = new THREE.Vector3();

    // Apply base stats
    const baseStats = SHIP_STATS[shipDef.type] || SHIP_STATS.sloop;
    const permanentUpgrades = game.saveSystem.getPermanentUpgrades();

    this.maxHealth = baseStats.health * (1 + (permanentUpgrades.hullReinforcement * 0.1));
    this.health = this.maxHealth;
    this.speed = baseStats.speed;
    this.turnSpeed = baseStats.turnSpeed;
    this.fireRate = baseStats.fireRate;
    this.damage = baseStats.damage * (1 + (permanentUpgrades.cannonMaster * 0.1));
    this.range = baseStats.range;
    this.cannons = baseStats.cannons;
    this.armor = baseStats.armor;

    this.createMesh(game, shipDef.model);
  }

  private createMesh(game: Game, modelName: string): void {
    const model = game.assetManager.getModel(modelName);
    if (model) {
      this.mesh = model;
      this.mesh.position.copy(this.position);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
    }
  }

  public update(deltaTime: number): void {
    if (!this.active || !this.mesh) return;

    const game = (window as any).game as Game;

    // Handle input
    const input = game.inputManager.getMovement();

    // Calculate target rotation from input
    if (input.x !== 0 || input.y !== 0) {
      this.targetRotation = Math.atan2(input.x, -input.y);
    }

    // Smooth rotation
    this.rotation = rotateTowards(this.rotation, this.targetRotation, this.turnSpeed * deltaTime);

    // Apply movement
    if (input.x !== 0 || input.y !== 0) {
      const moveSpeed = this.speed * deltaTime;
      this.velocity.x = Math.sin(this.rotation) * moveSpeed;
      this.velocity.z = Math.cos(this.rotation) * moveSpeed;
    } else {
      // Decelerate when no input
      this.velocity.multiplyScalar(0.9);
    }

    // Update position
    this.position.add(this.velocity);

    // Apply ocean bobbing
    if (game.oceanSystem) {
      const waveHeight = game.oceanSystem.getWaveHeight(this.position.x, this.position.z);
      this.position.y = waveHeight;

      // Apply wave normal for tilt
      const normal = game.oceanSystem.getWaveNormal(this.position.x, this.position.z);
      const tiltAmount = 0.1;
      this.mesh.rotation.x = normal.z * tiltAmount;
      this.mesh.rotation.z = -normal.x * tiltAmount;
    }

    // Update mesh
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;

    // Auto-fire at nearest enemy
    this.handleCombat(game, deltaTime);

    // Update invincibility
    if (this.invincible) {
      this.invincibleTime -= deltaTime;
      if (this.invincibleTime <= 0) {
        this.invincible = false;
        this.mesh.visible = true;
      } else {
        // Flash effect
        this.mesh.visible = Math.floor(this.invincibleTime * 10) % 2 === 0;
      }
    }
  }

  private handleCombat(game: Game, deltaTime: number): void {
    const now = game.getGameTime();
    if (now - this.lastFireTime < this.fireRate) return;

    // Find nearest enemy
    const enemies = game.getNearbyEnemies(this.position, this.range);
    if (enemies.length === 0) return;

    const target = enemies[0];
    this.fireAt(game, target.position);
    this.lastFireTime = now;
  }

  private fireAt(game: Game, targetPos: THREE.Vector3): void {
    // Calculate fire direction
    const direction = new THREE.Vector3()
      .subVectors(targetPos, this.position)
      .normalize();

    // Fire from each cannon
    const angleStep = Math.PI / 4; // 45 degrees between cannons
    const startAngle = -((this.cannons - 1) * angleStep) / 2;

    for (let i = 0; i < this.cannons; i++) {
      const angle = startAngle + i * angleStep;
      const fireDir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

      game.combatSystem.spawnProjectile({
        position: this.position.clone().add(fireDir.clone().multiplyScalar(2)),
        direction: fireDir,
        damage: this.damage,
        speed: GAME_SETTINGS.CANNONBALL_SPEED,
        owner: this,
      });
    }

    // Play sound
    game.audioSystem.playSound('cannon_fire', 0.5);

    // Spawn muzzle flash particles
    game.particleSystem.spawnMuzzleFlash(this.position.clone().add(direction.multiplyScalar(2)));
  }

  public takeDamage(amount: number): void {
    if (this.invincible || !this.active) return;

    // Apply armor reduction
    const actualDamage = amount * (1 - this.armor);
    this.health = clamp(this.health - actualDamage, 0, this.maxHealth);

    // Make invincible briefly
    this.invincible = true;
    this.invincibleTime = GAME_SETTINGS.PLAYER_INVINCIBILITY_TIME;

    // Play damage sound
    const game = (window as any).game as Game;
    game.audioSystem.playSound('damage');

    // Spawn damage particles
    game.particleSystem.spawnDamageParticles(this.position);

    if (this.health <= 0) {
      this.die();
    }
  }

  public heal(amount: number): void {
    this.health = clamp(this.health + amount, 0, this.maxHealth);
  }

  private die(): void {
    this.active = false;

    // Spawn explosion
    const game = (window as any).game as Game;
    game.particleSystem.spawnExplosion(this.position, COLORS.explosion, 2);

    // Create wreck
    game.combatSystem.spawnWreck(this.position, this.rotation);

    // Hide mesh
    if (this.mesh) {
      this.mesh.visible = false;
    }
  }

  public dispose(): void {
    if (this.mesh) {
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
  }
}
