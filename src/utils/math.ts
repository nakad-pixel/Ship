/**
 * Math utilities for game calculations
 */

import * as THREE from 'three';

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between a and b
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Smooth step interpolation
 */
export function smoothStep(a: number, b: number, t: number): number {
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
  }

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Get the shortest angle between two angles in radians
 */
export function angleDifference(current: number, target: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/**
 * Move angle towards target with max delta
 */
export function rotateTowards(current: number, target: number, maxDelta: number): number {
  const diff = angleDifference(current, target);
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}

/**
 * Calculate distance between two 2D points
 */
export function distance2D(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance (faster, no sqrt)
 */
export function distanceSquared2D(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * Calculate distance between two 3D points
 */
export function distance3D(a: THREE.Vector3, b: THREE.Vector3): number {
  return a.distanceTo(b);
}

/**
 * Check if a point is within a rectangle
 */
export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Check if a point is within a circle
 */
export function pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
  return distanceSquared2D(px, py, cx, cy) <= radius * radius;
}

/**
 * Get direction vector from angle (in radians)
 */
export function angleToDirection(angle: number): { x: number; y: number } {
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
}

/**
 * Get angle from direction vector
 */
export function directionToAngle(x: number, y: number): number {
  return Math.atan2(y, x);
}

/**
 * Normalize a vector
 */
export function normalize(x: number, y: number): { x: number; y: number; length: number } {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0, length: 0 };
  return { x: x / length, y: y / length, length };
}

/**
 * Project a point onto a line segment
 */
export function projectOnSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { x: number; y: number; t: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return { x: x1, y: y1, t: 0 };

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = clamp(t, 0, 1);

  return {
    x: x1 + t * dx,
    y: y1 + t * dy,
    t
  };
}

/**
 * Calculate closest point on circle to a point
 */
export function closestOnCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number } {
  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { x: cx + radius, y: cy };

  return {
    x: cx + (dx / dist) * radius,
    y: cy + (dy / dist) * radius
  };
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

/**
 * Perlin noise (simplified 2D)
 */
export class PerlinNoise {
  private perm: number[];

  constructor() {
    this.perm = new Array(512);
    const p = new Array(256).fill(0).map((_, i) => i);
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.perm[X] + Y;
    const B = this.perm[X + 1] + Y;

    return this.lerp(
      this.lerp(this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y), u),
      this.lerp(this.grad(this.perm[A + 1], x, y - 1), this.grad(this.perm[B + 1], x - 1, y - 1), u),
      v
    );
  }
}

/**
 * Easing functions
 */
export const Easing = {
  linear: (t: number): number => t,
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};
