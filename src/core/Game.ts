/**
 * Main Game Controller
 * Orchestrates all game systems and manages the game loop
 */

import * as THREE from 'three';
import { GameState, GameMode, type GameConfig, type RunState, ShipType } from '../types/game';
import { SeededRNG, getDailyChallengeSeed } from '../utils/random';
import { GAME_SETTINGS, STARTING_SHIPS } from '../utils/constants';
import { AssetManager } from '../systems/AssetManager';
import { InputManager } from './Input';
import { UIManager } from '../systems/UIManager';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { OceanSystem } from '../systems/OceanSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { FleetSystem } from '../systems/FleetSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { PlayerShip } from '../entities/PlayerShip';

export class Game {
  // Three.js
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  // Systems
  public assetManager: AssetManager;
  public inputManager: InputManager;
  public uiManager: UIManager;
  public audioSystem: AudioSystem;
  public saveSystem: SaveSystem;
  public oceanSystem: OceanSystem;
  public physicsSystem: PhysicsSystem;
  public spawnSystem: SpawnSystem;
  public combatSystem: CombatSystem;
  public fleetSystem: FleetSystem;
  public upgradeSystem: UpgradeSystem;
  public particleSystem: ParticleSystem;

  // Game State
  public state: GameState = GameState.LOADING;
  public config: GameConfig;
  public runState: RunState;
  public rng: SeededRNG;
  public player: PlayerShip | null = null;

  // Timing
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private gameTime: number = 0;

  // Entities
  private entities: Map<string, any> = new Map();
  private entitiesToRemove: string[] = [];

  constructor(canvas: HTMLCanvasElement) {
    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, GAME_SETTINGS.CAMERA_HEIGHT, 30);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize systems
    this.assetManager = new AssetManager();
    this.inputManager = new InputManager();
    this.saveSystem = new SaveSystem();
    this.uiManager = new UIManager(this);
    this.audioSystem = new AudioSystem();
    this.oceanSystem = new OceanSystem(this);
    this.physicsSystem = new PhysicsSystem();
    this.spawnSystem = new SpawnSystem(this);
    this.combatSystem = new CombatSystem(this);
    this.fleetSystem = new FleetSystem(this);
    this.upgradeSystem = new UpgradeSystem(this);
    this.particleSystem = new ParticleSystem(this);

    // Setup default config
    this.config = {
      seed: '',
      mode: GameMode.OPEN_OCEAN,
      shipType: ShipType.SLOOP,
      difficulty: 1,
    };

    // Initialize run state
    this.runState = this.createInitialRunState();
    this.rng = new SeededRNG();

    // Setup window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start loading
    this.load();
  }

  private createInitialRunState(): RunState {
    return {
      score: 0,
      survivalTime: 0,
      doubloons: 0,
      skullsEarned: 0,
      level: 1,
      doubloonsToNextLevel: GAME_SETTINGS.DOUBLOONS_PER_LEVEL,
      kills: 0,
      wave: 1,
    };
  }

  private async load(): Promise<void> {
    try {
      // Load essential assets
      await this.assetManager.loadEssentialAssets();

      // Initialize ocean
      await this.oceanSystem.init();

      // Hide loading screen
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }

      // Setup lighting
      this.setupLighting();

      // Show main menu
      this.state = GameState.MENU;
      this.uiManager.showMainMenu();

      // Start game loop
      this.lastTime = performance.now();
      this.gameLoop();
    } catch (error) {
      console.error('Failed to load game:', error);
      this.uiManager.showError('Failed to load game assets. Please refresh.');
    }
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);
  }

  public startGame(config: Partial<GameConfig>): void {
    // Generate seed based on mode
    let seed = config.seed || '';
    if (!seed) {
      if (config.mode === GameMode.DAILY_CHALLENGE) {
        seed = getDailyChallengeSeed();
      } else {
        seed = Math.random().toString(36).substring(2);
      }
    }

    this.config = {
      ...this.config,
      ...config,
      seed,
    };

    this.rng = new SeededRNG(seed);
    this.runState = this.createInitialRunState();
    this.gameTime = 0;

    // Clear previous entities
    this.clearEntities();

    // Create player
    this.createPlayer();

    // Start systems
    this.spawnSystem.start();
    this.combatSystem.start();

    // Update state
    this.state = GameState.PLAYING;
    this.uiManager.showHUD();

    // Play start sound
    this.audioSystem.playSound('game_start');
    this.audioSystem.startMusic('battle');
  }

  private createPlayer(): void {
    const shipDef = STARTING_SHIPS.find((s: { type: string }) => s.type === this.config.shipType);
    if (!shipDef) return;

    this.player = new PlayerShip(this, shipDef);
    this.player.position.set(0, 0, 0);
    this.addEntity(this.player);

    // Add starting fleet ships based on permanent upgrades
    const permanentUpgrades = this.saveSystem.getPermanentUpgrades();
    const startingFleet = permanentUpgrades.startingFleet || 0;

    for (let i = 0; i < startingFleet; i++) {
      this.fleetSystem.addFleetShip('boat-row-small');
    }
  }

  public addEntity(entity: any): void {
    this.entities.set(entity.id, entity);
    if (entity.mesh) {
      this.scene.add(entity.mesh);
    }
  }

  public removeEntity(id: string): void {
    this.entitiesToRemove.push(id);
  }

  private clearEntities(): void {
    this.entities.forEach(entity => {
      if (entity.mesh) {
        this.scene.remove(entity.mesh);
      }
      if (entity.dispose) {
        entity.dispose();
      }
    });
    this.entities.clear();
    this.player = null;
  }

  private gameLoop(): void {
    requestAnimationFrame(() => this.gameLoop());

    const currentTime = performance.now();
    this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.state === GameState.PLAYING) {
      this.update(this.deltaTime);
    }

    this.render();
  }

  private update(deltaTime: number): void {
    this.gameTime += deltaTime;
    this.runState.survivalTime = this.gameTime;

    // Update systems
    this.inputManager.update();
    this.oceanSystem.update(deltaTime);
    this.physicsSystem.update(deltaTime);
    this.spawnSystem.update(deltaTime);
    this.combatSystem.update(deltaTime);
    this.fleetSystem.update(deltaTime);
    this.upgradeSystem.update(deltaTime);
    this.particleSystem.update(deltaTime);

    // Update entities
    this.entities.forEach(entity => {
      if (entity.update) {
        entity.update(deltaTime);
      }
    });

    // Remove dead entities
    this.processRemovals();

    // Update camera
    this.updateCamera();

    // Check game over
    if (this.player && this.player.health <= 0) {
      this.gameOver();
    }

    // Update UI
    this.uiManager.updateHUD();
  }

  private processRemovals(): void {
    for (const id of this.entitiesToRemove) {
      const entity = this.entities.get(id);
      if (entity) {
        if (entity.mesh) {
          this.scene.remove(entity.mesh);
        }
        if (entity.dispose) {
          entity.dispose();
        }
        this.entities.delete(id);
      }
    }
    this.entitiesToRemove = [];
  }

  private updateCamera(): void {
    if (!this.player) return;

    const targetPos = this.player.position.clone();
    const cameraOffset = new THREE.Vector3(0, GAME_SETTINGS.CAMERA_HEIGHT, 30);
    const targetCameraPos = targetPos.add(cameraOffset);

    this.camera.position.lerp(targetCameraPos, GAME_SETTINGS.CAMERA_SMOOTHING);
    this.camera.lookAt(this.player.position);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public pause(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.pausedTime = this.gameTime;
      this.uiManager.showPauseMenu();
      this.audioSystem.pauseMusic();
    }
  }

  public resume(): void {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.uiManager.showHUD();
      this.audioSystem.resumeMusic();
    }
  }

  public gameOver(): void {
    this.state = GameState.GAME_OVER;

    // Calculate final score and skulls
    const skulls = Math.floor(this.runState.doubloons / 100) + 
      (this.runState.wave >= 8 ? GAME_SETTINGS.BOSS_SKULL_BONUS : 0);
    this.runState.skullsEarned = skulls;

    // Save stats
    this.saveSystem.addSkulls(skulls);
    this.saveSystem.updateHighScore(this.runState.score);
    this.saveSystem.incrementTotalRuns();

    // Update longest survival
    if (this.runState.survivalTime > this.saveSystem.getLongestSurvival()) {
      this.saveSystem.setLongestSurvival(this.runState.survivalTime);
    }

    // Check unlocks
    this.checkUnlocks();

    // Show death screen
    this.uiManager.showDeathScreen();
    this.audioSystem.stopMusic();
    this.audioSystem.playSound('game_over');
  }

  private checkUnlocks(): void {
    const stats = this.saveSystem.getPlayerStats();

    // Unlock Rowboat Gang at 30 skulls
    if (stats.skulls >= 30) {
      this.saveSystem.unlockShip(ShipType.ROWBOAT_GANG);
    }

    // Unlock Wraith at 150 skulls
    if (stats.skulls >= 150) {
      this.saveSystem.unlockShip(ShipType.WRAITH);
    }

    // Unlock Armada Commander at 200 skulls
    if (stats.skulls >= 200) {
      this.saveSystem.unlockShip(ShipType.ARMADA_COMMANDER);
    }

    // Unlock Wraith through Ghost Fleet mode (20 min survival)
    if (this.config.mode === GameMode.GHOST_FLEET && this.runState.survivalTime >= 1200) {
      this.saveSystem.unlockShip(ShipType.WRAITH);
    }
  }

  public addDoubloons(amount: number): void {
    const multiplier = 1 + (this.saveSystem.getPermanentUpgrades().treasureMagnet || 0);
    const finalAmount = Math.floor(amount * multiplier);

    this.runState.doubloons += finalAmount;
    this.runState.score += finalAmount * 10;

    // Check for level up
    if (this.runState.doubloons >= this.runState.doubloonsToNextLevel) {
      this.levelUp();
    }
  }

  public addKill(): void {
    this.runState.kills++;
    this.runState.score += 50;
  }

  private levelUp(): void {
    this.runState.level++;
    this.runState.doubloonsToNextLevel += GAME_SETTINGS.DOUBLOONS_PER_LEVEL;

    this.state = GameState.UPGRADE_SELECT;
    this.upgradeSystem.showUpgradeSelection();
    this.audioSystem.playSound('level_up');
  }

  public onUpgradeSelected(): void {
    this.state = GameState.PLAYING;
  }

  public getNearbyEnemies(position: THREE.Vector3, radius: number): any[] {
    const nearby: any[] = [];
    this.entities.forEach(entity => {
      if (entity.type === 'enemy' && entity.active) {
        const dist = position.distanceTo(entity.position);
        if (dist <= radius) {
          nearby.push(entity);
        }
      }
    });
    return nearby.sort((a, b) => {
      return position.distanceTo(a.position) - position.distanceTo(b.position);
    });
  }

  public getPlayerPosition(): THREE.Vector3 {
    return this.player ? this.player.position.clone() : new THREE.Vector3();
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.uiManager.onResize();
  }

  public getDeltaTime(): number {
    return this.deltaTime;
  }

  public getGameTime(): number {
    return this.gameTime;
  }

  public getEntities(): Map<string, any> {
    return this.entities;
  }

  public dispose(): void {
    this.clearEntities();
    this.renderer.dispose();
    this.audioSystem.dispose();
  }
}
