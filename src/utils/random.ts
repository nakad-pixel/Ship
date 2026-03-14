/**
 * Seeded Random Number Generator
 * Provides deterministic randomness for replay verification and daily challenges
 */

export class SeededRNG {
  private seed: string;
  private state: number;

  constructor(seed: string = '') {
    this.seed = seed || this.generateRandomSeed();
    this.state = this.hashString(this.seed);
  }

  private generateRandomSeed(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Get the current seed
   */
  getSeed(): string {
    return this.seed;
  }

  /**
   * Reset the RNG to its initial state
   */
  reset(): void {
    this.state = this.hashString(this.seed);
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    this.state = (this.state * 9301 + 49297) % 233280;
    return this.state / 233280;
  }

  /**
   * Generate random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat(min, max + 1));
  }

  /**
   * Generate random boolean with given probability
   */
  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Pick multiple random elements from array
   */
  pickMany<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle([...array]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Generate random position within a circle
   */
  nextInCircle(radius: number): { x: number; y: number } {
    const r = radius * Math.sqrt(this.next());
    const theta = this.next() * 2 * Math.PI;
    return {
      x: r * Math.cos(theta),
      y: r * Math.sin(theta)
    };
  }

  /**
   * Generate random position on circle edge
   */
  nextOnCircle(radius: number): { x: number; y: number } {
    const theta = this.next() * 2 * Math.PI;
    return {
      x: radius * Math.cos(theta),
      y: radius * Math.sin(theta)
    };
  }

  /**
   * Generate random vector in range
   */
  nextVector3(min: number, max: number): { x: number; y: number; z: number } {
    return {
      x: this.nextFloat(min, max),
      y: this.nextFloat(min, max),
      z: this.nextFloat(min, max)
    };
  }
}

/**
 * Generate daily challenge seed based on date
 */
export function getDailyChallengeSeed(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `maelstrom-daily-${year}-${month}-${day}`;
}

/**
 * Global RNG instance for non-seeded randomness
 */
export const globalRNG = new SeededRNG();

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
