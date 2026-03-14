/**
 * Asset Manager
 * Handles loading and caching of GLB models and textures
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ASSET_PATHS } from '../utils/constants';

export class AssetManager {
  private models: Map<string, THREE.Group> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;

  // Essential models to load first
  private essentialModels = [
    'ship-pirate-small',
    'boat-row-small',
    'cannon',
    'cannon-ball',
    'chest',
    'ship-ghost',
  ];

  // All available models
  private allModels = [
    'barrel',
    'boat-row-large',
    'boat-row-small',
    'bottle-large',
    'bottle',
    'cannon-ball',
    'cannon-mobile',
    'cannon',
    'castle-door',
    'castle-gate',
    'castle-wall',
    'castle-window',
    'chest',
    'crate-bottles',
    'crate',
    'flag-high-pennant',
    'flag-high',
    'flag-pennant',
    'flag-pirate-high-pennant',
    'flag-pirate-high',
    'flag-pirate-pennant',
    'flag-pirate',
    'flag',
    'grass-patch',
    'grass-plant',
    'grass',
    'hole',
    'mast-ropes',
    'mast',
    'palm-bend',
    'palm-detailed-bend',
    'palm-detailed-straight',
    'palm-straight',
    'patch-grass-foliage',
    'patch-grass',
    'patch-sand-foliage',
    'patch-sand',
    'platform-planks',
    'platform',
    'rocks-a',
    'rocks-b',
    'rocks-c',
    'rocks-sand-a',
    'rocks-sand-b',
    'rocks-sand-c',
    'ship-ghost',
    'ship-large',
    'ship-medium',
    'ship-pirate-large',
    'ship-pirate-medium',
    'ship-pirate-small',
    'ship-small',
    'ship-wreck',
    'structure-fence-sides',
    'structure-fence',
    'platform-dock-small',
    'platform-dock',
    'platform-small',
    'structure',
    'structure-roof',
    'tool-paddle',
    'tool-shovel',
    'tower-base-door',
    'tower-base',
    'tower-complete-large',
    'tower-complete-small',
    'tower-middle-windows',
    'tower-middle',
    'tower-roof',
    'tower-top',
    'tower-watch',
  ];

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Load essential assets for game start
   */
  public async loadEssentialAssets(): Promise<void> {
    const promises = this.essentialModels.map(name => this.loadModel(name));
    await Promise.all(promises);
    console.log('Essential assets loaded');
  }

  /**
   * Load all assets in background
   */
  public async loadAllAssets(): Promise<void> {
    const remainingModels = this.allModels.filter(
      name => !this.essentialModels.includes(name)
    );

    const promises = remainingModels.map(name => this.loadModel(name));
    await Promise.all(promises);
    console.log('All assets loaded');
  }

  /**
   * Load a single model
   */
  public loadModel(name: string): Promise<void> {
    // Return cached promise if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    // Return resolved promise if already loaded
    if (this.models.has(name)) {
      return Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      const path = `${ASSET_PATHS.models}${name}.glb`;

      this.gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene;

          // Enable shadows for all meshes
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.models.set(name, model);
          resolve();
        },
        undefined,
        (error) => {
          console.error(`Failed to load model ${name}:`, error);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  /**
   * Get a loaded model (clones it)
   */
  public getModel(name: string): THREE.Group | null {
    const model = this.models.get(name);
    if (!model) {
      console.warn(`Model ${name} not loaded`);
      return null;
    }
    return model.clone();
  }

  /**
   * Check if a model is loaded
   */
  public isModelLoaded(name: string): boolean {
    return this.models.has(name);
  }

  /**
   * Load a texture
   */
  public loadTexture(name: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      if (this.textures.has(name)) {
        resolve(this.textures.get(name)!);
        return;
      }

      const path = `${ASSET_PATHS.textures}${name}`;
      this.textureLoader.load(
        path,
        (texture) => {
          this.textures.set(name, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Get loaded texture
   */
  public getTexture(name: string): THREE.Texture | null {
    return this.textures.get(name) || null;
  }

  /**
   * Create a material for a ship with ghost effect
   */
  public createGhostMaterial(baseMaterial: THREE.Material): THREE.Material {
    const ghostMaterial = (baseMaterial as THREE.MeshStandardMaterial).clone();
    ghostMaterial.color.setHex(0x2ecc71);
    ghostMaterial.emissive.setHex(0x00ff00);
    ghostMaterial.emissiveIntensity = 0.3;
    ghostMaterial.transparent = true;
    ghostMaterial.opacity = 0.8;
    return ghostMaterial;
  }

  /**
   * Create a material for curse mode
   */
  public createCurseMaterial(baseMaterial: THREE.Material): THREE.Material {
    const curseMaterial = (baseMaterial as THREE.MeshStandardMaterial).clone();
    curseMaterial.color.setHex(0x1a4a3e);
    curseMaterial.emissive.setHex(0x0d3a2e);
    curseMaterial.emissiveIntensity = 0.1;
    return curseMaterial;
  }

  /**
   * Get loading progress
   */
  public getLoadingProgress(): { loaded: number; total: number } {
    return {
      loaded: this.models.size,
      total: this.allModels.length
    };
  }

  /**
   * Preload models for a specific game mode
   */
  public preloadForMode(mode: string): void {
    const modeModels: Record<string, string[]> = {
      open_ocean: ['ship-small', 'ship-medium', 'ship-large', 'ship-wreck'],
      treasure_hunt: ['castle-wall', 'tower-complete-large', 'patch-sand', 'palm-straight'],
      ghost_fleet: ['ship-ghost', 'boat-row-small'],
      island_fortress: ['castle-wall', 'tower-base', 'cannon', 'platform'],
    };

    const models = modeModels[mode] || [];
    models.forEach(name => this.loadModel(name));
  }

  /**
   * Dispose of all assets
   */
  public dispose(): void {
    this.models.forEach(model => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.models.clear();

    this.textures.forEach(texture => texture.dispose());
    this.textures.clear();

    this.loadingPromises.clear();
  }
}
