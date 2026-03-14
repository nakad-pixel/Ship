/**
 * MAELSTROM - Pirate Naval Survivor Game
 * Main entry point
 */

import { Game } from './core/Game';
import './ui/styles/main.css';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Game canvas not found');
    return;
  }

  // Create game instance
  const game = new Game(canvas);
  (window as any).game = game;

  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.pause();
    }
  });

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    });
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    game.dispose();
  });
});
