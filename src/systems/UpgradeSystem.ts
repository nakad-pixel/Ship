/**
 * Upgrade System
 * Manages upgrade card selection and application
 */

import { Game } from '../core/Game';
import { UpgradeCard, EffectType } from '../types/upgrades';

export class UpgradeSystem {
  private game: Game;
  private selectedUpgrades: Map<string, number> = new Map();

  constructor(game: Game) {
    this.game = game;
  }

  public update(deltaTime: number): void {
    // Passive update if needed
  }

  public showUpgradeSelection(): void {
    // UI Manager handles the display
  }

  public applyUpgrade(card: UpgradeCard): void {
    const currentStacks = this.selectedUpgrades.get(card.id) || 0;
    if (currentStacks >= card.maxStacks) return;

    this.selectedUpgrades.set(card.id, currentStacks + 1);

    // Apply effect
    this.applyEffect(card.effect);
  }

  private applyEffect(effect: { type: EffectType; value: number; target?: string }): void {
    const player = this.game.player;
    if (!player) return;

    switch (effect.type) {
      case EffectType.ADD_FLEET_SHIP:
        if (effect.target) {
          this.game.fleetSystem.addFleetShip(effect.target);
        }
        break;

      case EffectType.INCREASE_DAMAGE:
        player.damage *= (1 + effect.value);
        break;

      case EffectType.INCREASE_FIRE_RATE:
        player.fireRate *= (1 - effect.value);
        break;

      case EffectType.INCREASE_RANGE:
        player.range *= (1 + effect.value);
        break;

      case EffectType.INCREASE_HEALTH:
        const healthIncrease = player.maxHealth * effect.value;
        player.maxHealth += healthIncrease;
        player.health += healthIncrease;
        break;

      case EffectType.INCREASE_SPEED:
        player.speed *= (1 + effect.value);
        break;

      case EffectType.ADD_CANNON:
        player.cannons += effect.value;
        break;

      case EffectType.SPREAD_SHOT:
        player.cannons = Math.max(player.cannons, 3);
        break;

      case EffectType.RAM_PROW:
        // Ram damage handled in player collision
        break;

      case EffectType.GHOST_HULL:
        player.armor = Math.max(player.armor, effect.value);
        break;

      case EffectType.TREASURE_MAGNET:
        // Magnet range increase
        break;

      case EffectType.CRIT_CHANCE:
        // Crit chance applied in combat
        break;

      case EffectType.LIFESTEAL:
        // Lifesteal handled in damage dealt
        break;

      case EffectType.BARREL_BOMB:
      case EffectType.CANNON_TOWER:
      case EffectType.VORTEX:
        // Ability unlocks
        break;
    }
  }
}
