/**
 * UI Manager
 * Handles all UI rendering and interactions
 */

import { Game } from '../core/Game';
import { GameState, ShipType, GameMode } from '../types/game';
import { UPGRADE_CARDS, STARTING_SHIPS } from '../types/upgrades';
import { SeededRNG, getDailyChallengeSeed } from '../utils/random';

export class UIManager {
  private game: Game;
  private uiLayer: HTMLElement;
  private currentScreen: HTMLElement | null = null;

  constructor(game: Game) {
    this.game = game;
    this.uiLayer = document.getElementById('ui-layer')!;
  }

  public onResize(): void {
    // Handle responsive layout adjustments
  }

  public showMainMenu(): void {
    this.clearScreen();

    const stats = this.game.saveSystem.getPlayerStats();

    const menu = document.createElement('div');
    menu.className = 'main-menu fade-in';
    menu.innerHTML = `
      <h1>⚓ MAELSTROM</h1>
      <p class="subtitle">Pirate Naval Survivor</p>
      <div class="menu-buttons">
        <button class="menu-btn primary" id="btn-play">Play</button>
        <button class="menu-btn" id="btn-ships">Ships (${stats.skulls} 💀)</button>
        <button class="menu-btn" id="btn-upgrades">Upgrades</button>
        <button class="menu-btn" id="btn-daily">Daily Challenge</button>
        <button class="menu-btn" id="btn-leaderboard">Leaderboard</button>
      </div>
      <p style="margin-top: 2rem; color: rgba(255,255,255,0.5); font-size: 0.8rem;">
        High Score: ${stats.highScore.toLocaleString()} | Total Runs: ${stats.totalRuns}
      </p>
    `;

    this.uiLayer.appendChild(menu);
    this.currentScreen = menu;

    // Bind events
    menu.querySelector('#btn-play')?.addEventListener('click', () => this.showShipSelect());
    menu.querySelector('#btn-ships')?.addEventListener('click', () => this.showShipUnlock());
    menu.querySelector('#btn-upgrades')?.addEventListener('click', () => this.showPermanentUpgrades());
    menu.querySelector('#btn-daily')?.addEventListener('click', () => this.startDailyChallenge());
    menu.querySelector('#btn-leaderboard')?.addEventListener('click', () => this.showLeaderboard());
  }

  private showShipSelect(): void {
    this.clearScreen();

    const availableShips = this.game.saveSystem.getAvailableShips();

    const select = document.createElement('div');
    select.className = 'main-menu fade-in';
    select.innerHTML = `
      <h2>Select Ship</h2>
      <div class="upgrade-cards" style="margin: 2rem 0;">
        ${availableShips.map(ship => `
          <div class="upgrade-card ${ship.unlocked ? 'rare' : 'common'}" 
               data-ship="${ship.type}" 
               style="${!ship.unlocked ? 'opacity: 0.5;' : 'cursor: pointer;'}">
            <div class="upgrade-card-icon">⚓</div>
            <div class="upgrade-card-name">${ship.name}</div>
            <div class="upgrade-card-description">
              ${ship.description}<br>
              HP: ${ship.stats.health} | Speed: ${ship.stats.speed} | Cannons: ${ship.stats.cannons}
            </div>
            ${!ship.unlocked ? `<div class="upgrade-card-rarity">${ship.cost} 💀 to unlock</div>` : ''}
          </div>
        `).join('')}
      </div>
      <button class="menu-btn" id="btn-back">Back</button>
    `;

    this.uiLayer.appendChild(select);

    // Bind ship selection
    select.querySelectorAll('.upgrade-card').forEach(card => {
      const shipType = card.getAttribute('data-ship') as ShipType;
      const ship = availableShips.find(s => s.type === shipType);
      if (ship?.unlocked) {
        card.addEventListener('click', () => this.showModeSelect(shipType));
      }
    });

    select.querySelector('#btn-back')?.addEventListener('click', () => this.showMainMenu());
  }

  private showModeSelect(shipType: ShipType): void {
    this.clearScreen();

    const select = document.createElement('div');
    select.className = 'main-menu fade-in';
    select.innerHTML = `
      <h2>Select Mode</h2>
      <div class="menu-buttons" style="margin-top: 2rem;">
        <button class="menu-btn primary" data-mode="open_ocean">Open Ocean (Survival)</button>
        <button class="menu-btn" data-mode="treasure_hunt">Treasure Hunt</button>
        <button class="menu-btn" data-mode="ghost_fleet">Ghost Fleet (Curse)</button>
        <button class="menu-btn" data-mode="island_fortress">Island Fortress</button>
        <button class="menu-btn" id="btn-back">Back</button>
      </div>
    `;

    this.uiLayer.appendChild(select);

    // Bind mode selection
    select.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = (e.target as HTMLElement).getAttribute('data-mode') as GameMode;
        this.startGame(shipType, mode);
      });
    });

    select.querySelector('#btn-back')?.addEventListener('click', () => this.showShipSelect());
  }

  private showShipUnlock(): void {
    this.clearScreen();

    const availableShips = this.game.saveSystem.getAvailableShips();
    const stats = this.game.saveSystem.getPlayerStats();

    const unlock = document.createElement('div');
    unlock.className = 'main-menu fade-in';
    unlock.innerHTML = `
      <h2>Unlock Ships</h2>
      <p style="color: var(--color-accent); margin-bottom: 2rem;">💀 ${stats.skulls} Skulls</p>
      <div class="upgrade-cards" style="margin: 2rem 0;">
        ${availableShips.map(ship => `
          <div class="upgrade-card ${ship.unlocked ? 'legendary' : ship.canAfford ? 'epic' : 'common'}">
            <div class="upgrade-card-icon">⚓</div>
            <div class="upgrade-card-name">${ship.name}</div>
            <div class="upgrade-card-description">${ship.description}</div>
            ${ship.unlocked 
              ? '<div class="upgrade-card-rarity legendary">UNLOCKED</div>'
              : `<button class="menu-btn ${ship.canAfford ? '' : 'disabled'}" 
                        data-unlock="${ship.type}" 
                        ${!ship.canAfford ? 'disabled' : ''}>
                   Unlock (${ship.cost} 💀)
                 </button>`
            }
          </div>
        `).join('')}
      </div>
      <button class="menu-btn" id="btn-back">Back</button>
    `;

    this.uiLayer.appendChild(unlock);

    // Bind unlock buttons
    unlock.querySelectorAll('[data-unlock]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const shipType = (e.target as HTMLElement).getAttribute('data-unlock') as ShipType;
        const ship = availableShips.find(s => s.type === shipType);
        if (ship && this.game.saveSystem.spendSkulls(ship.cost)) {
          this.game.saveSystem.unlockShip(shipType);
          this.showShipUnlock(); // Refresh
        }
      });
    });

    unlock.querySelector('#btn-back')?.addEventListener('click', () => this.showMainMenu());
  }

  private showPermanentUpgrades(): void {
    this.clearScreen();
    // Simplified - would show full upgrade tree
    const menu = document.createElement('div');
    menu.className = 'main-menu fade-in';
    menu.innerHTML = `
      <h2>Permanent Upgrades</h2>
      <p style="margin: 2rem; color: var(--color-text-muted);">Unlock permanent bonuses between runs</p>
      <button class="menu-btn" id="btn-back">Back</button>
    `;
    this.uiLayer.appendChild(menu);
    menu.querySelector('#btn-back')?.addEventListener('click', () => this.showMainMenu());
  }

  private startDailyChallenge(): void {
    const seed = getDailyChallengeSeed();
    this.startGame(ShipType.SLOOP, GameMode.DAILY_CHALLENGE);
  }

  private showLeaderboard(): void {
    this.clearScreen();
    const menu = document.createElement('div');
    menu.className = 'main-menu fade-in';
    menu.innerHTML = `
      <h2>Leaderboard</h2>
      <p style="margin: 2rem; color: var(--color-text-muted);">Top scores will appear here</p>
      <button class="menu-btn" id="btn-back">Back</button>
    `;
    this.uiLayer.appendChild(menu);
    menu.querySelector('#btn-back')?.addEventListener('click', () => this.showMainMenu());
  }

  private startGame(shipType: ShipType, mode: GameMode): void {
    this.clearScreen();
    this.game.startGame({ shipType, mode });
  }

  public showHUD(): void {
    this.clearScreen();

    const hud = document.createElement('div');
    hud.className = 'hud';
    hud.innerHTML = `
      <div class="hud-section hud-top-left">
        <div class="health-bar-container">
          <div class="health-bar">
            <div class="health-bar-fill" id="hp-fill" style="width: 100%;"></div>
          </div>
          <span class="health-text" id="hp-text">100/100</span>
        </div>
        <div class="xp-bar">
          <div class="xp-bar-fill" id="xp-fill" style="width: 0%;"></div>
        </div>
      </div>

      <div class="hud-section hud-top-center">
        <div class="hud-stat">
          <span class="hud-stat-label">Time</span>
          <span class="hud-stat-value timer" id="timer">00:00</span>
        </div>
      </div>

      <div class="hud-section hud-top-right">
        <div class="currency-display">
          <span class="currency-icon">🪙</span>
          <span class="currency-value" id="doubloons">0</span>
        </div>
        <div class="hud-stat" style="margin-top: 0.5rem;">
          <span class="hud-stat-label">Level</span>
          <span class="hud-stat-value" id="level">1</span>
        </div>
      </div>

      <div class="hud-section hud-bottom-left">
        <div class="hud-stat">
          <span class="hud-stat-label">Kills</span>
          <span class="hud-stat-value" id="kills">0</span>
        </div>
      </div>

      <div class="hud-section hud-bottom-center">
        <div class="hud-stat">
          <span class="hud-stat-label">Wave</span>
          <span class="hud-stat-value" id="wave">1</span>
        </div>
      </div>

      <div class="hud-section hud-bottom-right">
        <div class="hud-stat">
          <span class="hud-stat-label">Score</span>
          <span class="hud-stat-value" id="score">0</span>
        </div>
      </div>
    `;

    this.uiLayer.appendChild(hud);
    this.currentScreen = hud;
  }

  public updateHUD(): void {
    if (!this.currentScreen?.classList.contains('hud')) return;

    const state = this.game.runState;
    const player = this.game.player;

    // Update health
    if (player) {
      const hpFill = document.getElementById('hp-fill');
      const hpText = document.getElementById('hp-text');
      if (hpFill && hpText) {
        const hpPercent = (player.health / player.maxHealth) * 100;
        hpFill.style.width = `${hpPercent}%`;
        hpText.textContent = `${Math.ceil(player.health)}/${player.maxHealth}`;
      }
    }

    // Update XP
    const xpFill = document.getElementById('xp-fill');
    if (xpFill) {
      const xpPercent = (state.doubloons % 100) / 100 * 100;
      xpFill.style.width = `${xpPercent}%`;
    }

    // Update timer
    const timer = document.getElementById('timer');
    if (timer) {
      const mins = Math.floor(state.survivalTime / 60).toString().padStart(2, '0');
      const secs = Math.floor(state.survivalTime % 60).toString().padStart(2, '0');
      timer.textContent = `${mins}:${secs}`;
    }

    // Update stats
    this.updateElement('doubloons', state.doubloons.toString());
    this.updateElement('level', state.level.toString());
    this.updateElement('kills', state.kills.toString());
    this.updateElement('wave', state.wave.toString());
    this.updateElement('score', state.score.toLocaleString());
  }

  private updateElement(id: string, value: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  public showPauseMenu(): void {
    const pause = document.createElement('div');
    pause.className = 'pause-menu fade-in';
    pause.innerHTML = `
      <h2>Paused</h2>
      <div class="menu-buttons">
        <button class="menu-btn primary" id="btn-resume">Resume</button>
        <button class="menu-btn" id="btn-menu">Main Menu</button>
      </div>
    `;

    this.uiLayer.appendChild(pause);

    pause.querySelector('#btn-resume')?.addEventListener('click', () => {
      pause.remove();
      this.game.resume();
    });

    pause.querySelector('#btn-menu')?.addEventListener('click', () => {
      pause.remove();
      this.showMainMenu();
    });
  }

  public showUpgradeSelection(): void {
    const rng = new SeededRNG();
    const cards = rng.pickMany(UPGRADE_CARDS, 3);

    const overlay = document.createElement('div');
    overlay.className = 'upgrade-overlay fade-in';
    overlay.innerHTML = `
      <h2 class="upgrade-title">LEVEL UP! Choose an Upgrade</h2>
      <div class="upgrade-cards">
        ${cards.map((card, i) => `
          <div class="upgrade-card ${card.rarity}" data-card="${i}">
            <div class="upgrade-card-icon">⚓</div>
            <div class="upgrade-card-name">${card.name}</div>
            <div class="upgrade-card-description">${card.description}</div>
            <span class="upgrade-card-rarity ${card.rarity}">${card.rarity}</span>
            <div style="margin-top: 0.5rem; color: var(--color-text-muted); font-size: 0.8rem;">
              Press ${i + 1}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.uiLayer.appendChild(overlay);

    // Handle selection
    const selectUpgrade = (index: number) => {
      const card = cards[index];
      this.game.upgradeSystem.applyUpgrade(card);
      overlay.remove();
      this.game.onUpgradeSelected();
      this.showHUD();
    };

    overlay.querySelectorAll('.upgrade-card').forEach((card, i) => {
      card.addEventListener('click', () => selectUpgrade(i));
    });

    // Keyboard shortcuts
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === '1') selectUpgrade(0);
      if (e.key === '2') selectUpgrade(1);
      if (e.key === '3') selectUpgrade(2);
    };
    document.addEventListener('keydown', keyHandler, { once: true });
  }

  public showDeathScreen(): void {
    const state = this.game.runState;

    const death = document.createElement('div');
    death.className = 'death-screen fade-in';
    death.innerHTML = `
      <h2>☠️ Ship Sunk!</h2>
      <div class="death-stats">
        <div class="death-stat">
          <div class="death-stat-value">${state.score.toLocaleString()}</div>
          <div class="death-stat-label">Score</div>
        </div>
        <div class="death-stat">
          <div class="death-stat-value">${Math.floor(state.survivalTime / 60)}:${(state.survivalTime % 60).toString().padStart(2, '0')}</div>
          <div class="death-stat-label">Survival Time</div>
        </div>
        <div class="death-stat">
          <div class="death-stat-value">${state.kills}</div>
          <div class="death-stat-label">Kills</div>
        </div>
        <div class="death-stat">
          <div class="death-stat-value">${state.skullsEarned} 💀</div>
          <div class="death-stat-label">Skulls Earned</div>
        </div>
      </div>
      <div class="menu-buttons">
        <button class="menu-btn primary" id="btn-again">Play Again</button>
        <button class="menu-btn" id="btn-menu">Main Menu</button>
      </div>
    `;

    this.uiLayer.appendChild(death);

    death.querySelector('#btn-again')?.addEventListener('click', () => {
      this.startGame(this.game.config.shipType, this.game.config.mode);
    });

    death.querySelector('#btn-menu')?.addEventListener('click', () => this.showMainMenu());
  }

  public showError(message: string): void {
    const error = document.createElement('div');
    error.className = 'main-menu';
    error.innerHTML = `
      <h2 style="color: var(--color-danger);">Error</h2>
      <p style="margin: 2rem; color: var(--color-text);">${message}</p>
      <button class="menu-btn" onclick="location.reload()">Reload</button>
    `;
    this.uiLayer.appendChild(error);
  }

  private clearScreen(): void {
    this.uiLayer.innerHTML = '';
    this.currentScreen = null;
  }
}
