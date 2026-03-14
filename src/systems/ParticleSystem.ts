/**
 * Particle System
 * Visual effects and particles
 */

import * as THREE from 'three';
import { Game } from '../core/Game';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
}

export class ParticleSystem {
  private game: Game;
  private particles: Particle[] = [];
  private particlePool: THREE.Mesh[] = [];
  private poolIndex: number = 0;

  constructor(game: Game) {
    this.game = game;
    this.createParticlePool();
  }

  private createParticlePool(): void {
    const geometry = new THREE.PlaneGeometry(0.5, 0.5);

    for (let i = 0; i < 500; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      this.game.scene.add(mesh);
      this.particlePool.push(mesh);
    }
  }

  private getParticle(): THREE.Mesh | null {
    for (let i = 0; i < this.particlePool.length; i++) {
      const idx = (this.poolIndex + i) % this.particlePool.length;
      const mesh = this.particlePool[idx];
      if (!mesh.visible) {
        this.poolIndex = idx;
        return mesh;
      }
    }
    return null;
  }

  public update(deltaTime: number): void {
    const toRemove: Particle[] = [];

    this.particles.forEach(particle => {
      particle.lifetime -= deltaTime;
      particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
      particle.velocity.y -= 2 * deltaTime; // Gravity

      // Fade out
      const alpha = particle.lifetime / particle.maxLifetime;
      (particle.mesh.material as THREE.MeshBasicMaterial).opacity = alpha;

      if (particle.lifetime <= 0) {
        particle.mesh.visible = false;
        toRemove.push(particle);
      }
    });

    toRemove.forEach(p => {
      const idx = this.particles.indexOf(p);
      if (idx >= 0) this.particles.splice(idx, 1);
    });
  }

  public spawnExplosion(position: THREE.Vector3, color: number, scale: number = 1): void {
    const count = Math.floor(20 * scale);
    for (let i = 0; i < count; i++) {
      const mesh = this.getParticle();
      if (!mesh) break;

      mesh.visible = true;
      mesh.position.copy(position);
      mesh.scale.setScalar(scale * (0.5 + Math.random()));
      (mesh.material as THREE.MeshBasicMaterial).color.setHex(color);

      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 10;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        5 + Math.random() * 5,
        Math.sin(angle) * speed
      );

      this.particles.push({
        mesh,
        velocity,
        lifetime: 1 + Math.random(),
        maxLifetime: 2,
      });
    }
  }

  public spawnMuzzleFlash(position: THREE.Vector3): void {
    for (let i = 0; i < 5; i++) {
      const mesh = this.getParticle();
      if (!mesh) break;

      mesh.visible = true;
      mesh.position.copy(position);
      mesh.scale.setScalar(0.3 + Math.random() * 0.3);
      (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00);

      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 3;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 3,
        Math.sin(angle) * speed
      );

      this.particles.push({
        mesh,
        velocity,
        lifetime: 0.3,
        maxLifetime: 0.3,
      });
    }
  }

  public spawnSplash(position: THREE.Vector3): void {
    for (let i = 0; i < 8; i++) {
      const mesh = this.getParticle();
      if (!mesh) break;

      mesh.visible = true;
      mesh.position.copy(position);
      mesh.scale.setScalar(0.2 + Math.random() * 0.3);
      (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x88ccff);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        3 + Math.random() * 3,
        Math.sin(angle) * speed
      );

      this.particles.push({
        mesh,
        velocity,
        lifetime: 0.5 + Math.random() * 0.5,
        maxLifetime: 1,
      });
    }
  }

  public spawnHitSparks(position: THREE.Vector3): void {
    for (let i = 0; i < 6; i++) {
      const mesh = this.getParticle();
      if (!mesh) break;

      mesh.visible = true;
      mesh.position.copy(position);
      mesh.scale.setScalar(0.15 + Math.random() * 0.15);
      (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffdd00);

      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 5,
        Math.sin(angle) * speed
      );

      this.particles.push({
        mesh,
        velocity,
        lifetime: 0.2 + Math.random() * 0.3,
        maxLifetime: 0.5,
      });
    }
  }

  public spawnDamageParticles(position: THREE.Vector3): void {
    for (let i = 0; i < 4; i++) {
      const mesh = this.getParticle();
      if (!mesh) break;

      mesh.visible = true;
      mesh.position.copy(position);
      mesh.scale.setScalar(0.2);
      (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);

      const angle = Math.random() * Math.PI * 2;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * 2,
        2 + Math.random() * 2,
        Math.sin(angle) * 2
      );

      this.particles.push({
        mesh,
        velocity,
        lifetime: 0.5,
        maxLifetime: 0.5,
      });
    }
  }
}
