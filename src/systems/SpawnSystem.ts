/**
 * Spawn System
 * Manages enemy spawning based on wave progression
 */

import * as THREE from 'three';
import { Game } from '../core/Game';
import { ENEMY_DEFINITIONS, GAME_SETTINGS } from '../utils/constants';
import { EnemyType } from '../types/game';

interface Enemy {
  id: string;
  mesh: THREE.Group;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  position: THREE.Vector3;
  active: boolean;
}

export class SpawnSystem {
  private game: Game;
  private enemies: Map<string, Enemy> = new Map();
  private nextId: number = 0;
  private spawnTimer: number = 0;
  private waveTimer: number = 0;
  private currentWave: number = 1;
  private bossSpawned: boolean = false;

  constructor(game: Game) {
    this.game = game;
  }

  public start(): void {
    this.enemies.clear();
    this.spawnTimer = 0;
    this.waveTimer = 0;
    this.currentWave = 1;
    this.bossSpawned = false;
  }

  public update(deltaTime: number): void {
    this.waveTimer += deltaTime;
    this.spawnTimer += deltaTime;

    // Update wave
    const waveDuration = GAME_SETTINGS.WAVE_DURATION;
    if (this.waveTimer >= waveDuration) {
      this.waveTimer = 0;
      this.currentWave++;
      this.bossSpawned = false;
      this.game.runState.wave = this.currentWave;
    }

    // Spawn enemies
    const spawnInterval = Math.max(0.5, 3 - this.currentWave * 0.1);
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    // Spawn boss every 8 waves
    if (this.currentWave % 8 === 0 && !this.bossSpawned && this.waveTimer > waveDuration / 2) {
      this.spawnBoss();
      this.bossSpawned = true;
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      if (!enemy.active) return;
      this.updateEnemy(enemy, deltaTime);
    });

    // Remove dead enemies
    this.enemies.forEach((enemy, id) => {
      if (!enemy.active) {
        this.game.scene.remove(enemy.mesh);
        this.enemies.delete(id);
      }
    });
  }

  private spawnEnemy(): void {
    const availableTypes = this.getAvailableEnemyTypes();
    if (availableTypes.length === 0) return;

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const def = ENEMY_DEFINITIONS[type];

    const spawnPos = this.getSpawnPosition();

    const model = this.game.assetManager.getModel(def.model);
    if (!model) return;

    const enemy: Enemy = {
      id: `enemy_${this.nextId++}`,
      mesh: model.clone(),
      type,
      health: def.health * (1 + this.currentWave * 0.1),
      maxHealth: def.health * (1 + this.currentWave * 0.1),
      speed: def.speed,
      damage: def.damage,
      position: spawnPos,
      active: true,
    };

    enemy.mesh.position.copy(spawnPos);
    enemy.mesh.castShadow = true;
    enemy.mesh.receiveShadow = true;

    this.game.scene.add(enemy.mesh);
    this.enemies.set(enemy.id, enemy);
  }

  private spawnBoss(): void {
    const def = ENEMY_DEFINITIONS.ghost_boss;
    const spawnPos = this.getSpawnPosition();

    const model = this.game.assetManager.getModel(def.model);
    if (!model) return;

    const boss: Enemy = {
      id: `boss_${this.nextId++}`,
      mesh: model.clone(),
      type: EnemyType.GHOST_BOSS,
      health: def.health * (1 + this.currentWave * 0.2),
      maxHealth: def.health * (1 + this.currentWave * 0.2),
      speed: def.speed,
      damage: def.damage,
      position: spawnPos,
      active: true,
    };

    boss.mesh.position.copy(spawnPos);
    boss.mesh.scale.setScalar(2);
    boss.mesh.castShadow = true;
    boss.mesh.receiveShadow = true;

    this.game.scene.add(boss.mesh);
    this.enemies.set(boss.id, boss);

    this.game.audioSystem.playSound('boss_spawn');
  }

  private updateEnemy(enemy: Enemy, deltaTime: number): void {
    if (!this.game.player) return;

    const playerPos = this.game.player.position;

    // Move towards player
    const direction = new THREE.Vector3()
      .subVectors(playerPos, enemy.position)
      .normalize();

    const moveSpeed = enemy.speed * deltaTime;
    enemy.position.add(direction.multiplyScalar(moveSpeed));

    // Apply ocean bobbing
    const waveHeight = this.game.oceanSystem.getWaveHeight(enemy.position.x, enemy.position.z);
    enemy.position.y = waveHeight;

    enemy.mesh.position.copy(enemy.position);
    enemy.mesh.lookAt(playerPos);

    // Damage player on collision
    const distToPlayer = enemy.position.distanceTo(playerPos);
    if (distToPlayer < 5) {
      this.game.player.takeDamage(enemy.damage);
    }
  }

  private getAvailableEnemyTypes(): EnemyType[] {
    const types: EnemyType[] = [];
    const wave = this.currentWave;

    if (wave >= ENEMY_DEFINITIONS.rowboat_raider.minWave) {
      types.push(EnemyType.ROWBOAT_RAIDER);
    }
    if (wave >= ENEMY_DEFINITIONS.sloop_hunter.minWave) {
      types.push(EnemyType.SLOOP_HUNTER);
    }
    if (wave >= ENEMY_DEFINITIONS.navy_frigate.minWave) {
      types.push(EnemyType.NAVY_FRIGATE);
    }
    if (wave >= ENEMY_DEFINITIONS.armada_galleon.minWave) {
      types.push(EnemyType.ARMADA_GALLEON);
    }
    if (wave >= ENEMY_DEFINITIONS.ghost_ship.minWave) {
      types.push(EnemyType.GHOST_SHIP);
    }

    return types;
  }

  private getSpawnPosition(): THREE.Vector3 {
    const playerPos = this.game.player?.position || new THREE.Vector3();
    const angle = Math.random() * Math.PI * 2;
    const distance = GAME_SETTINGS.SPAWN_DISTANCE;

    return new THREE.Vector3(
      playerPos.x + Math.cos(angle) * distance,
      0,
      playerPos.z + Math.sin(angle) * distance
    );
  }

  public removeEnemy(id: string): void {
    const enemy = this.enemies.get(id);
    if (enemy) {
      enemy.active = false;
      this.game.addDoubloons(ENEMY_DEFINITIONS[enemy.type]?.doubloons || 1);
      this.game.addKill();
    }
  }
}
