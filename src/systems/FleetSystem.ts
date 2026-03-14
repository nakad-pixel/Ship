/**
 * Fleet System
 * Manages fleet ships orbiting the player
 */

import * as THREE from 'three';
import { Game } from '../core/Game';

interface FleetShip {
  id: string;
  mesh: THREE.Group;
  angle: number;
  radius: number;
  orbitSpeed: number;
  model: string;
  health: number;
  maxHealth: number;
}

export class FleetSystem {
  private game: Game;
  private ships: FleetShip[] = [];
  private nextId: number = 0;

  constructor(game: Game) {
    this.game = game;
  }

  public update(deltaTime: number): void {
    if (!this.game.player) return;

    const playerPos = this.game.player.position;

    this.ships.forEach(ship => {
      // Update orbit angle
      ship.angle += ship.orbitSpeed * deltaTime;

      // Calculate position
      const x = playerPos.x + Math.cos(ship.angle) * ship.radius;
      const z = playerPos.z + Math.sin(ship.angle) * ship.radius;

      // Apply ocean bobbing
      const waveHeight = this.game.oceanSystem.getWaveHeight(x, z);

      ship.mesh.position.set(x, waveHeight, z);

      // Face away from player (defensive formation)
      ship.mesh.rotation.y = ship.angle + Math.PI / 2;

      // Fire at nearby enemies
      this.fireIfEnemyNearby(ship);
    });

    // Update formations based on count
    this.updateFormation();
  }

  private fireIfEnemyNearby(ship: FleetShip): void {
    const game = this.game;
    const enemies = game.getNearbyEnemies(ship.mesh.position, 40);
    if (enemies.length === 0) return;

    const target = enemies[0];
    const direction = new THREE.Vector3()
      .subVectors(target.position, ship.mesh.position)
      .normalize();

    game.combatSystem.spawnProjectile({
      position: ship.mesh.position.clone().add(direction.clone().multiplyScalar(2)),
      direction,
      damage: 8,
      speed: 35,
      owner: ship,
    });
  }

  public addFleetShip(modelName: string): void {
    const model = this.game.assetManager.getModel(modelName);
    if (!model) return;

    const ship: FleetShip = {
      id: `fleet_${this.nextId++}`,
      mesh: model.clone(),
      angle: (this.ships.length * Math.PI * 2) / Math.max(1, this.ships.length + 1),
      radius: 8 + Math.floor(this.ships.length / 6) * 4,
      orbitSpeed: 0.5 + Math.random() * 0.2,
      model: modelName,
      health: 50,
      maxHealth: 50,
    };

    ship.mesh.castShadow = true;
    ship.mesh.receiveShadow = true;
    this.game.scene.add(ship.mesh);
    this.ships.push(ship);
  }

  private updateFormation(): void {
    const count = this.ships.length;
    if (count === 0) return;

    // Distribute evenly in rings
    this.ships.forEach((ship, i) => {
      const ring = Math.floor(i / 6);
      const indexInRing = i % 6;
      const ringCount = Math.min(count - ring * 6, 6);

      ship.radius = 8 + ring * 5;
      ship.angle = (indexInRing * Math.PI * 2) / ringCount + (ring % 2) * 0.5;
    });
  }

  public removeFleetShip(id: string): void {
    const idx = this.ships.findIndex(s => s.id === id);
    if (idx >= 0) {
      const ship = this.ships[idx];
      this.game.scene.remove(ship.mesh);
      this.ships.splice(idx, 1);
    }
  }
}
