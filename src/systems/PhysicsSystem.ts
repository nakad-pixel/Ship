/**
 * Physics System
 * Wrapper around Cannon.js physics
 */

import * as CANNON from 'cannon-es';

export class PhysicsSystem {
  public world: CANNON.World;
  private bodies: Map<string, CANNON.Body> = new Map();

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    // Default materials
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      { friction: 0.3, restitution: 0.3 }
    );
    this.world.addContactMaterial(defaultContactMaterial);
  }

  public update(deltaTime: number): void {
    this.world.step(1 / 60, deltaTime, 3);
  }

  public addBody(id: string, body: CANNON.Body): void {
    this.bodies.set(id, body);
    this.world.addBody(body);
  }

  public removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(id);
    }
  }

  public getBody(id: string): CANNON.Body | undefined {
    return this.bodies.get(id);
  }
}
