/**
 * Ocean System
 * Creates and animates the ocean surface with custom shader
 */

import * as THREE from 'three';
import { Game } from '../core/Game';
import { PerlinNoise } from '../utils/math';
import { COLORS } from '../utils/constants';

export class OceanSystem {
  private game: Game;
  private oceanMesh: THREE.Mesh | null = null;
  private noise: PerlinNoise;
  private time: number = 0;
  private waveHeight: number = 1.5;
  private waveSpeed: number = 0.5;
  private isCurseMode: boolean = false;

  // Shader uniforms
  private uniforms: {
    uTime: { value: number };
    uColor: { value: THREE.Color };
    uCurseColor: { value: THREE.Color };
    uWaveHeight: { value: number };
    uIsCurse: { value: number };
  };

  constructor(game: Game) {
    this.game = game;
    this.noise = new PerlinNoise();
    this.uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(COLORS.ocean) },
      uCurseColor: { value: new THREE.Color(COLORS.oceanCurse) },
      uWaveHeight: { value: this.waveHeight },
      uIsCurse: { value: 0 },
    };
  }

  public async init(): Promise<void> {
    this.createOcean();
  }

  private createOcean(): void {
    // Create large plane for ocean
    const geometry = new THREE.PlaneGeometry(1000, 1000, 256, 256);
    geometry.rotateX(-Math.PI / 2);

    // Create custom shader material
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      side: THREE.DoubleSide,
      transparent: true,
    });

    this.oceanMesh = new THREE.Mesh(geometry, material);
    this.oceanMesh.position.y = -0.5;
    this.oceanMesh.receiveShadow = true;
    this.game.scene.add(this.oceanMesh);
  }

  private getVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uWaveHeight;
      
      varying vec2 vUv;
      varying float vElevation;
      varying vec3 vPosition;
      
      // Simplex noise function
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Create multiple wave layers
        float elevation = 0.0;
        
        // Large waves
        elevation += snoise(vec2(pos.x * 0.01 + uTime * 0.1, pos.z * 0.01 + uTime * 0.05)) * uWaveHeight;
        
        // Medium waves
        elevation += snoise(vec2(pos.x * 0.02 - uTime * 0.08, pos.z * 0.02)) * uWaveHeight * 0.5;
        
        // Small detail waves
        elevation += snoise(vec2(pos.x * 0.05 + uTime * 0.1, pos.z * 0.05 + uTime * 0.1)) * uWaveHeight * 0.25;
        
        pos.y += elevation;
        vElevation = elevation;
        vPosition = pos;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  private getFragmentShader(): string {
    return `
      uniform vec3 uColor;
      uniform vec3 uCurseColor;
      uniform float uIsCurse;
      
      varying vec2 vUv;
      varying float vElevation;
      varying vec3 vPosition;
      
      void main() {
        // Mix between normal and curse colors
        vec3 finalColor = mix(uColor, uCurseColor, uIsCurse);
        
        // Add foam at wave peaks
        float foam = smoothstep(0.8, 1.2, vElevation);
        finalColor = mix(finalColor, vec3(1.0), foam * 0.5);
        
        // Add depth variation
        float depth = smoothstep(-2.0, 2.0, vElevation);
        finalColor = mix(finalColor * 0.8, finalColor * 1.2, depth);
        
        gl_FragColor = vec4(finalColor, 0.9);
      }
    `;
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
    this.uniforms.uTime.value = this.time;

    // Update ocean position to follow player (infinite ocean effect)
    if (this.oceanMesh && this.game.player) {
      const playerPos = this.game.player.position;
      this.oceanMesh.position.x = Math.floor(playerPos.x / 100) * 100;
      this.oceanMesh.position.z = Math.floor(playerPos.z / 100) * 100;
    }
  }

  /**
   * Enable curse mode visual effect
   */
  public setCurseMode(enabled: boolean): void {
    this.isCurseMode = enabled;
    this.uniforms.uIsCurse.value = enabled ? 1 : 0;
  }

  /**
   * Get wave height at a specific position
   */
  public getWaveHeight(x: number, z: number): number {
    const time = this.time;
    let height = 0;

    // Approximate the shader calculation
    height += this.noise.noise(x * 0.01 + time * 0.1, z * 0.01 + time * 0.05) * this.waveHeight;
    height += this.noise.noise(x * 0.02 - time * 0.08, z * 0.02) * this.waveHeight * 0.5;
    height += this.noise.noise(x * 0.05 + time * 0.1, z * 0.05 + time * 0.1) * this.waveHeight * 0.25;

    return height - 0.5; // Account for ocean base position
  }

  /**
   * Get the normal at a position for buoyancy calculations
   */
  public getWaveNormal(x: number, z: number): THREE.Vector3 {
    const sampleDist = 0.5;
    const hL = this.getWaveHeight(x - sampleDist, z);
    const hR = this.getWaveHeight(x + sampleDist, z);
    const hD = this.getWaveHeight(x, z - sampleDist);
    const hU = this.getWaveHeight(x, z + sampleDist);

    const normal = new THREE.Vector3(hL - hR, 2.0, hD - hU);
    normal.normalize();

    return normal;
  }

  public dispose(): void {
    if (this.oceanMesh) {
      this.oceanMesh.geometry.dispose();
      (this.oceanMesh.material as THREE.Material).dispose();
      this.game.scene.remove(this.oceanMesh);
    }
  }
}
