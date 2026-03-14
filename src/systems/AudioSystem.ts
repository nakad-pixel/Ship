/**
 * Audio System
 * Manages music and sound effects using Howler.js
 */

import { Howl, Howler } from 'howler';
import { GAME_SETTINGS } from '../utils/constants';

type SoundType = 'cannon_fire' | 'cannon_hit' | 'ship_sink' | 'coin_collect' | 'level_up' | 'game_start' | 'game_over' | 'boss_spawn' | 'damage';
type MusicType = 'menu' | 'battle' | 'curse' | 'victory' | 'defeat';

export class AudioSystem {
  private sounds: Map<SoundType, Howl> = new Map();
  private music: Map<MusicType, Howl> = new Map();
  private currentMusic: Howl | null = null;
  private currentMusicType: MusicType | null = null;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private muted: boolean = false;
  private audioContext: AudioContext | null = null;

  // Sound effect pool for rapid-fire sounds
  private soundPools: Map<SoundType, Howl[]> = new Map();
  private poolIndices: Map<SoundType, number> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    // Initialize Howler
    Howler.volume(1.0);

    // Create placeholder sounds (in production, load actual audio files)
    this.createPlaceholderSounds();

    // Try to unlock audio context on first user interaction
    const unlockAudio = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
  }

  private createPlaceholderSounds(): void {
    // In production, these would be loaded from actual audio files
    // For now, we'll create silent/howler placeholders
    const soundConfigs: { type: SoundType; src: string }[] = [
      { type: 'cannon_fire', src: 'assets/audio/cannon_fire.mp3' },
      { type: 'cannon_hit', src: 'assets/audio/cannon_hit.mp3' },
      { type: 'ship_sink', src: 'assets/audio/ship_sink.mp3' },
      { type: 'coin_collect', src: 'assets/audio/coin_collect.mp3' },
      { type: 'level_up', src: 'assets/audio/level_up.mp3' },
      { type: 'game_start', src: 'assets/audio/game_start.mp3' },
      { type: 'game_over', src: 'assets/audio/game_over.mp3' },
      { type: 'boss_spawn', src: 'assets/audio/boss_spawn.mp3' },
      { type: 'damage', src: 'assets/audio/damage.mp3' },
    ];

    // Create sound pools for frequently played sounds
    soundConfigs.forEach(({ type }) => {
      this.createSoundPool(type, 5);
    });

    // Music tracks
    const musicConfigs: { type: MusicType; src: string }[] = [
      { type: 'menu', src: 'assets/audio/music_menu.mp3' },
      { type: 'battle', src: 'assets/audio/music_battle.mp3' },
      { type: 'curse', src: 'assets/audio/music_curse.mp3' },
      { type: 'victory', src: 'assets/audio/music_victory.mp3' },
      { type: 'defeat', src: 'assets/audio/music_defeat.mp3' },
    ];

    musicConfigs.forEach(({ type, src }) => {
      const howl = new Howl({
        src: [src],
        loop: true,
        volume: this.musicVolume,
        html5: true, // Use HTML5 Audio for large files
        onloaderror: () => {
          // Silently handle missing audio files
        },
      });
      this.music.set(type, howl);
    });
  }

  private createSoundPool(type: SoundType, size: number): void {
    const pool: Howl[] = [];
    for (let i = 0; i < size; i++) {
      const howl = new Howl({
        src: [`assets/audio/${type}.mp3`],
        volume: this.sfxVolume,
        onloaderror: () => {
          // Silently handle missing audio files
        },
      });
      pool.push(howl);
    }
    this.soundPools.set(type, pool);
    this.poolIndices.set(type, 0);
  }

  /**
   * Play a sound effect
   */
  public playSound(type: SoundType, volume: number = 1.0): void {
    if (this.muted) return;

    const pool = this.soundPools.get(type);
    if (!pool || pool.length === 0) return;

    // Get next sound from pool
    const index = this.poolIndices.get(type) || 0;
    const sound = pool[index];

    // Play sound
    sound.volume(this.sfxVolume * volume);
    sound.play();

    // Update pool index
    this.poolIndices.set(type, (index + 1) % pool.length);
  }

  /**
   * Play sound with 3D positioning
   */
  public playSound3D(
    type: SoundType,
    x: number,
    y: number,
    z: number,
    refDistance: number = 10
  ): void {
    if (this.muted) return;

    // Howler 3D audio support
    const id = this.playSound(type);
    // Note: For full 3D audio, you'd need to configure Howler.pos() and Howler.orientation()
  }

  /**
   * Start playing music
   */
  public startMusic(type: MusicType, fadeIn: boolean = true): void {
    if (this.currentMusicType === type) return;

    // Fade out current music
    if (this.currentMusic) {
      this.currentMusic.fade(this.musicVolume, 0, fadeIn ? GAME_SETTINGS.MUSIC_FADE_TIME * 1000 : 0);
      this.currentMusic.stop();
    }

    // Start new music
    const music = this.music.get(type);
    if (music) {
      music.volume(0);
      music.play();
      if (fadeIn) {
        music.fade(0, this.musicVolume, GAME_SETTINGS.MUSIC_FADE_TIME * 1000);
      } else {
        music.volume(this.musicVolume);
      }
      this.currentMusic = music;
      this.currentMusicType = type;
    }
  }

  /**
   * Stop music
   */
  public stopMusic(fadeOut: boolean = true): void {
    if (this.currentMusic) {
      if (fadeOut) {
        this.currentMusic.fade(this.musicVolume, 0, GAME_SETTINGS.MUSIC_FADE_TIME * 1000);
        setTimeout(() => {
          this.currentMusic?.stop();
        }, GAME_SETTINGS.MUSIC_FADE_TIME * 1000);
      } else {
        this.currentMusic.stop();
      }
      this.currentMusic = null;
      this.currentMusicType = null;
    }
  }

  /**
   * Pause music
   */
  public pauseMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume music
   */
  public resumeMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.play();
    }
  }

  /**
   * Set music volume (0-1)
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.muted ? 0 : 1);
  }

  /**
   * Set SFX volume (0-1)
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.soundPools.forEach(pool => {
      pool.forEach(sound => sound.volume(this.sfxVolume));
    });
  }

  /**
   * Toggle mute
   */
  public toggleMute(): boolean {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  }

  /**
   * Check if muted
   */
  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Preload audio assets
   */
  public preload(): void {
    // Preload all sounds
    this.soundPools.forEach(pool => {
      pool.forEach(sound => sound.load());
    });
    this.music.forEach(music => music.load());
  }

  /**
   * Update 3D listener position (for positional audio)
   */
  public updateListenerPosition(x: number, y: number, z: number): void {
    // Update Howler's global position
    Howler.pos(x, y, z);
  }

  /**
   * Update 3D listener orientation
   */
  public updateListenerOrientation(
    forwardX: number,
    forwardY: number,
    forwardZ: number,
    upX: number,
    upY: number,
    upZ: number
  ): void {
    Howler.orientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
  }

  public dispose(): void {
    this.stopMusic(false);
    this.soundPools.forEach(pool => {
      pool.forEach(sound => sound.unload());
    });
    this.music.forEach(music => music.unload());
    this.soundPools.clear();
    this.music.clear();
  }
}
