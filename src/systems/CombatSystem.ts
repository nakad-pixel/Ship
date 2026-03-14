/**
 * Combat System
 * Handles projectiles, damage, and combat interactions
 */

import * as THREE from 'three';
import { Game } from '../core/Game';
import { GAME_SETTINGS, COLORS } from '../utils/constants';

interface ProjectileConfig {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  damage: number;
  speed: number;
  owner: any;
}

interface Projectile {
  id: string;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  damage: number;
  lifetime: number;
  owner: any;
}

export class CombatSystem {
  private game: Game;
  private projectiles: Map<string, Projectile> = new Map();
  private projectilePool: THREE.Mesh[] = [];

  constructor(game: Game) {
    this.game = game;
    this.createProjectilePool();
  }

  private createProjectilePool(): void {
    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshStandardMaterial({ color: COLORS.cannonball });

    for (let i = 0; i < GAME_SETTINGS.MAX_PARTICLES; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.visible = false;
      this.game.scene.add(mesh);
      this.projectilePool.push(mesh);
    }
  }

  public start(): void {
    this.projectiles.clear();
  }

  public update(deltaTime: number): void {
    const toRemove: string[] = [];

    this.projectiles.forEach((proj, id) => {
      // Update position
      proj.mesh.position.add(proj.velocity.clone().multiplyScalar(deltaTime));
      proj.lifetime -= deltaTime;

      // Gravity arc
      proj.velocity.y -= GAME_SETTINGS.CANNONBALL_GRAVITY * deltaTime;

      // Check collision with water
      if (proj.mesh.position.y < -1) {
        this.spawnSplash(proj.mesh.position);
        toRemove.push(id);
        return;
      }

      // Check collision with enemies
      this.checkCollisions(proj, toRemove, id);

      // Lifetime expired
      if (proj.lifetime <= 0) {
        toRemove.push(id);
      }
    });

    // Remove projectiles
    toRemove.forEach(id => this.removeProjectile(id));
  }

  private checkCollisions(proj: Projectile, toRemove: string[], id: string): void {
    const game = this.game;
    game.getEntities().forEach(entity => {
      if (entity === proj.owner || !entity.active) return;
      if (entity.type !== 'enemy' && entity.type !== 'player' && entity.type !== 'fleet_ship') return;

      const dist = proj.mesh.position.distanceTo(entity.position);
      if (dist < 3) {
        // Hit!
        if (entity.takeDamage) {
          entity.takeDamage(proj.damage);
        }
        this.spawnHitEffect(proj.mesh.position);
        toRemove.push(id);

        // Play sound
        game.audioSystem.playSound('cannon_hit');
      }
    });
  }

  public spawnProjectile(config: ProjectileConfig): void {
    const mesh = this.getProjectileFromPool();
    if (!mesh) return;

    mesh.position.copy(config.position);
    mesh.visible = true;

    const velocity = config.direction.clone().multiplyScalar(config.speed);
    velocity.y = GAME_SETTINGS.FIRE_ARC_HEIGHT; // Add arc

    const projectile: Projectile = {
      id: `proj_${Date.now()}_${Math.random()}`,
      mesh,
      velocity,
      damage: config.damage,
      lifetime: GAME_SETTINGS.CANNONBALL_LIFETIME,
      owner: config.owner,
    };

    this.projectiles.set(projectile.id, projectile);
  }

  private getProjectileFromPool(): THREE.Mesh | null {
    for (const mesh of this.projectilePool) {
      if (!mesh.visible) return mesh;
    }
    return null;
  }

  private removeProjectile(id: string): void {
    const proj = this.projectiles.get(id);
    if (proj) {
      proj.mesh.visible = false;
      this.projectiles.delete(id);
    }
  }

  private spawnSplash(position: THREE.Vector3): void {
    this.game.particleSystem.spawnSplash(position);
  }

  private spawnHitEffect(position: THREE.Vector3): void {
    this.game.particleSystem.spawnHitSparks(position);
  }

  public spawnWreck(position: THREE.Vector3, rotation: number): void {
    const game = this.game;
    const wreck = game.assetManager.getModel('ship-wreck');
    if (wreck) {
      wreck.position.copy(position);
      wreck.position.y = 0;
      wreck.rotation.y = rotation;
      wreck.scale.setScalar(0.8 + Math.random() * 0.4);
      game.scene.add(wreck);

      // Fade out and remove after some time
      setTimeout(() => {
        game.scene.remove(wreck);
      }, 60000);
    }
  }
}
