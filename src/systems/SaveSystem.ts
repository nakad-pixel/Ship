/**
 * Save System
 * Handles local storage persistence and Supabase cloud sync
 */

import { PlayerStats, ShipType, PermanentUpgradeState, GameMode, LeaderboardEntry } from '../types/game';
import { STORAGE_KEYS, STARTING_SHIPS } from '../utils/constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SaveSystem {
  private playerStats: PlayerStats;
  private supabase: SupabaseClient | null = null;
  private syncEnabled: boolean = false;

  constructor() {
    this.playerStats = this.loadPlayerStats();
    this.initSupabase();
  }

  private initSupabase(): void {
    // Initialize Supabase client (would use actual credentials in production)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.syncEnabled = true;
    }
  }

  /**
   * Load player stats from localStorage
   */
  private loadPlayerStats(): PlayerStats {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...this.getDefaultStats(),
          ...parsed,
          unlockedShips: parsed.unlockedShips || [ShipType.SLOOP],
          permanentUpgrades: {
            ...this.getDefaultPermanentUpgrades(),
            ...parsed.permanentUpgrades,
          },
        };
      } catch {
        return this.getDefaultStats();
      }
    }
    return this.getDefaultStats();
  }

  private getDefaultStats(): PlayerStats {
    return {
      doubloons: 0,
      skulls: 0,
      highScore: 0,
      longestSurvival: 0,
      totalRuns: 0,
      unlockedShips: [ShipType.SLOOP],
      permanentUpgrades: this.getDefaultPermanentUpgrades(),
    };
  }

  private getDefaultPermanentUpgrades(): PermanentUpgradeState {
    return {
      hullReinforcement: 0,
      startingFleet: 0,
      treasureMagnet: 0,
      cannonMaster: 0,
      ghostWard: 0,
      islandAnchor: 0,
      flagBearer: 0,
      ghostHullMastery: 0,
    };
  }

  /**
   * Save player stats to localStorage
   */
  private save(): void {
    localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(this.playerStats));

    // Sync to cloud if enabled
    if (this.syncEnabled && this.supabase) {
      this.syncToCloud();
    }
  }

  /**
   * Sync stats to Supabase cloud
   */
  private async syncToCloud(): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('player_stats')
        .upsert({
          player_id: this.getPlayerId(),
          stats: this.playerStats,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to sync to cloud:', error);
      }
    } catch (error) {
      console.error('Cloud sync error:', error);
    }
  }

  /**
   * Get or create a unique player ID
   */
  private getPlayerId(): string {
    let playerId = localStorage.getItem('maelstrom_player_id');
    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem('maelstrom_player_id', playerId);
    }
    return playerId;
  }

  /**
   * Get player stats
   */
  public getPlayerStats(): PlayerStats {
    return { ...this.playerStats };
  }

  /**
   * Get permanent upgrade levels
   */
  public getPermanentUpgrades(): PermanentUpgradeState {
    return { ...this.playerStats.permanentUpgrades };
  }

  /**
   * Add skulls to player's total
   */
  public addSkulls(amount: number): void {
    this.playerStats.skulls += amount;
    this.save();
  }

  /**
   * Spend skulls (returns true if successful)
   */
  public spendSkulls(amount: number): boolean {
    if (this.playerStats.skulls >= amount) {
      this.playerStats.skulls -= amount;
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Update high score
   */
  public updateHighScore(score: number): void {
    if (score > this.playerStats.highScore) {
      this.playerStats.highScore = score;
      this.save();
    }
  }

  /**
   * Get high score
   */
  public getHighScore(): number {
    return this.playerStats.highScore;
  }

  /**
   * Update longest survival time
   */
  public setLongestSurvival(time: number): void {
    if (time > this.playerStats.longestSurvival) {
      this.playerStats.longestSurvival = time;
      this.save();
    }
  }

  /**
   * Get longest survival
   */
  public getLongestSurvival(): number {
    return this.playerStats.longestSurvival;
  }

  /**
   * Increment total runs
   */
  public incrementTotalRuns(): void {
    this.playerStats.totalRuns++;
    this.save();
  }

  /**
   * Get total runs
   */
  public getTotalRuns(): number {
    return this.playerStats.totalRuns;
  }

  /**
   * Unlock a ship
   */
  public unlockShip(shipType: ShipType): void {
    if (!this.playerStats.unlockedShips.includes(shipType)) {
      this.playerStats.unlockedShips.push(shipType);
      this.save();
    }
  }

  /**
   * Check if a ship is unlocked
   */
  public isShipUnlocked(shipType: ShipType): boolean {
    return this.playerStats.unlockedShips.includes(shipType);
  }

  /**
   * Get unlocked ships
   */
  public getUnlockedShips(): ShipType[] {
    return [...this.playerStats.unlockedShips];
  }

  /**
   * Upgrade a permanent upgrade
   */
  public upgradePermanent(upgradeId: keyof PermanentUpgradeState, cost: number): boolean {
    if (!this.spendSkulls(cost)) {
      return false;
    }

    const currentLevel = this.playerStats.permanentUpgrades[upgradeId] || 0;
    this.playerStats.permanentUpgrades[upgradeId] = currentLevel + 1;
    this.save();
    return true;
  }

  /**
   * Get upgrade level
   */
  public getUpgradeLevel(upgradeId: keyof PermanentUpgradeState): number {
    return this.playerStats.permanentUpgrades[upgradeId] || 0;
  }

  /**
   * Get available starting ships with unlock status
   */
  public getAvailableShips() {
    return STARTING_SHIPS.map(ship => ({
      ...ship,
      unlocked: this.playerStats.unlockedShips.includes(ship.type),
      canAfford: this.playerStats.skulls >= ship.cost,
    }));
  }

  /**
   * Submit score to leaderboard
   */
  public async submitLeaderboard(
    playerName: string,
    shipUsed: ShipType,
    survivalTime: number,
    score: number,
    mode: GameMode
  ): Promise<boolean> {
    const entry: LeaderboardEntry = {
      playerName,
      shipUsed,
      survivalTime,
      score,
      mode,
      date: new Date().toISOString(),
    };

    // Save locally
    const localLeaderboard = this.getLocalLeaderboard();
    localLeaderboard.push(entry);
    localLeaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(localLeaderboard.slice(0, 100)));

    // Submit to cloud if enabled
    if (this.syncEnabled && this.supabase) {
      try {
        const { error } = await this.supabase.from('leaderboard').insert(entry);
        if (error) {
          console.error('Failed to submit to leaderboard:', error);
          return false;
        }
      } catch (error) {
        console.error('Leaderboard submission error:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Get local leaderboard
   */
  public getLocalLeaderboard(): LeaderboardEntry[] {
    const saved = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Get global leaderboard from Supabase
   */
  public async getGlobalLeaderboard(mode?: GameMode, limit: number = 10): Promise<LeaderboardEntry[]> {
    if (!this.syncEnabled || !this.supabase) {
      return this.getLocalLeaderboard().slice(0, limit);
    }

    try {
      let query = this.supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (mode) {
        query = query.eq('mode', mode);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch leaderboard:', error);
        return this.getLocalLeaderboard().slice(0, limit);
      }

      return data || [];
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      return this.getLocalLeaderboard().slice(0, limit);
    }
  }

  /**
   * Save settings
   */
  public saveSettings(settings: Record<string, any>): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Load settings
   */
  public loadSettings(): Record<string, any> {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  }

  /**
   * Export save data
   */
  public exportSaveData(): string {
    const data = {
      stats: this.playerStats,
      settings: this.loadSettings(),
      leaderboard: this.getLocalLeaderboard(),
    };
    return btoa(JSON.stringify(data));
  }

  /**
   * Import save data
   */
  public importSaveData(data: string): boolean {
    try {
      const parsed = JSON.parse(atob(data));
      if (parsed.stats) {
        this.playerStats = { ...this.getDefaultStats(), ...parsed.stats };
        this.save();
      }
      if (parsed.settings) {
        this.saveSettings(parsed.settings);
      }
      if (parsed.leaderboard) {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(parsed.leaderboard));
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all save data
   */
  public clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PLAYER_STATS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.HIGH_SCORES);
    localStorage.removeItem(STORAGE_KEYS.UNLOCKS);
    localStorage.removeItem('maelstrom_player_id');
    this.playerStats = this.getDefaultStats();
  }
}
