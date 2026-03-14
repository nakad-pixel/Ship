/**
 * Input Manager
 * Handles keyboard and touch input
 */

import { INPUT_KEYS } from '../utils/constants';

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private keysPressed: Map<string, boolean> = new Map();
  private keysReleased: Map<string, boolean> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private mouseButtons: Map<number, boolean> = new Map();
  private touchStart: { x: number; y: number } | null = null;
  private touchCurrent: { x: number; y: number } | null = null;
  private isTouch: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mouse events
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));

    // Touch events
    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    window.addEventListener('touchend', (e) => this.onTouchEnd(e));

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (!this.keys.get(key)) {
      this.keysPressed.set(key, true);
    }
    this.keys.set(key, true);
  }

  private onKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.keys.set(key, false);
    this.keysReleased.set(key, true);
    this.keysPressed.set(key, false);
  }

  private onMouseMove(event: MouseEvent): void {
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseDown(event: MouseEvent): void {
    this.mouseButtons.set(event.button, true);
  }

  private onMouseUp(event: MouseEvent): void {
    this.mouseButtons.set(event.button, false);
  }

  private onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.isTouch = true;
    const touch = event.touches[0];
    this.touchStart = { x: touch.clientX, y: touch.clientY };
    this.touchCurrent = { x: touch.clientX, y: touch.clientY };
  }

  private onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    this.touchCurrent = { x: touch.clientX, y: touch.clientY };
  }

  private onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.touchStart = null;
    this.touchCurrent = null;
  }

  public update(): void {
    // Clear single-frame states
    this.keysPressed.clear();
    this.keysReleased.clear();
  }

  /**
   * Check if a key is currently held down
   */
  public isKeyDown(key: string): boolean {
    return this.keys.get(key.toLowerCase()) || false;
  }

  /**
   * Check if a key was pressed this frame
   */
  public isKeyPressed(key: string): boolean {
    return this.keysPressed.get(key.toLowerCase()) || false;
  }

  /**
   * Check if a key was released this frame
   */
  public isKeyReleased(key: string): boolean {
    return this.keysReleased.get(key.toLowerCase()) || false;
  }

  /**
   * Check if any of the given keys are down
   */
  public isAnyKeyDown(keys: string[]): boolean {
    return keys.some(key => this.isKeyDown(key));
  }

  /**
   * Get movement input as a normalized vector
   */
  public getMovement(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    // Check movement keys
    if (this.isAnyKeyDown(INPUT_KEYS.UP)) y -= 1;
    if (this.isAnyKeyDown(INPUT_KEYS.DOWN)) y += 1;
    if (this.isAnyKeyDown(INPUT_KEYS.LEFT)) x -= 1;
    if (this.isAnyKeyDown(INPUT_KEYS.RIGHT)) x += 1;

    // Touch virtual joystick
    if (this.isTouch && this.touchStart && this.touchCurrent) {
      const dx = this.touchCurrent.x - this.touchStart.x;
      const dy = this.touchCurrent.y - this.touchStart.y;
      const maxDist = 50;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        x = dx / Math.max(dist, maxDist);
        y = dy / Math.max(dist, maxDist);
      }
    }

    // Normalize if moving diagonally
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  /**
   * Check if pause key was pressed
   */
  public isPausePressed(): boolean {
    return this.isAnyKeyDown(INPUT_KEYS.PAUSE);
  }

  /**
   * Check if interact key was pressed
   */
  public isInteractPressed(): boolean {
    return this.isAnyKeyDown(INPUT_KEYS.INTERACT);
  }

  /**
   * Get card selection input (1, 2, 3)
   */
  public getCardSelection(): number | null {
    if (this.isKeyDown('1')) return 0;
    if (this.isKeyDown('2')) return 1;
    if (this.isKeyDown('3')) return 2;
    return null;
  }

  /**
   * Get mouse position
   */
  public getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  /**
   * Check if mouse button is down
   */
  public isMouseDown(button: number = 0): boolean {
    return this.mouseButtons.get(button) || false;
  }

  /**
   * Check if using touch controls
   */
  public isTouchActive(): boolean {
    return this.isTouch;
  }

  /**
   * Get touch input for virtual joystick
   */
  public getTouchJoystick(): { x: number; y: number; active: boolean } {
    if (!this.touchStart || !this.touchCurrent) {
      return { x: 0, y: 0, active: false };
    }

    const dx = this.touchCurrent.x - this.touchStart.x;
    const dy = this.touchCurrent.y - this.touchStart.y;
    const maxDist = 50;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) {
      return { x: 0, y: 0, active: true };
    }

    return {
      x: (dx / dist) * Math.min(dist / maxDist, 1),
      y: (dy / dist) * Math.min(dist / maxDist, 1),
      active: true
    };
  }

  /**
   * Reset all input states
   */
  public reset(): void {
    this.keys.clear();
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouseButtons.clear();
    this.touchStart = null;
    this.touchCurrent = null;
  }
}
