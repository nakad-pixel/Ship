# ⚓ MAELSTROM - Pirate Naval Survivor

A browser-based WebGL pirate naval survivor game built with Three.js, TypeScript, and Vite.

## 🎮 Features

### Core Gameplay
- **Vampire Survivors-style auto-combat** - Move with WASD, cannons auto-fire
- **Fleet System** - Recruit ships that orbit your flagship in formation
- **Wave-based Enemies** - Rowboat raiders, sloops, frigates, galleons, and ghost ships
- **Boss Encounters** - Ghost ship boss every 8 waves
- **Upgrade Cards** - 16+ upgrades across 4 categories (Fleet, Weapon, Ship, Abilities)
- **Meta-Progression** - Earn Skulls to unlock permanent upgrades and new ships

### Game Modes
- **Open Ocean** - Endless survival mode
- **Treasure Hunt** - Capture an island within 10 minutes
- **Ghost Fleet** - All enemies are ghost ships with curse effects
- **Island Fortress** - Build defenses and survive 10 waves
- **Daily Challenge** - Same seed for all players worldwide

### Technical Features
- **Three.js WebGL Rendering** - 3D graphics with shadows and effects
- **Custom Ocean Shader** - Animated waves with Perlin noise
- **Physics Integration** - Cannonball arcs with Cannon.js
- **Particle System** - Explosions, splashes, muzzle flashes
- **Audio System** - Howler.js for music and SFX
- **PWA Support** - Works offline with Service Worker
- **Save System** - localStorage + optional Supabase cloud sync

### Assets
- **72 Kenney Pirate Kit GLB Models** - Ships, cannons, buildings, props
- **Shared Texture Atlas** - Optimized for performance
- **Procedural Animations** - Ocean bobbing, formations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move forward |
| S / ↓ | Move backward |
| A / ← | Turn left |
| D / → | Turn right |
| 1, 2, 3 | Select upgrade card |
| ESC / P | Pause |
| Space | Interact |

## 🏗️ Project Structure

```
maelstrom-game/
├── public/
│   ├── assets/
│   │   ├── models/        # 72 GLB files
│   │   ├── textures/      # Texture atlases
│   │   └── audio/         # Music and SFX
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service Worker
├── src/
│   ├── core/             # Game.ts, Input.ts
│   ├── entities/         # PlayerShip.ts, etc.
│   ├── systems/          # All game systems
│   ├── types/            # TypeScript definitions
│   ├── ui/               # UI components and styles
│   ├── utils/            # Math, random, constants
│   └── main.ts           # Entry point
└── index.html
```

## 🌊 Game Systems

### OceanSystem
- Custom vertex shader with Perlin noise
- Infinite tiling following player
- Dynamic wave height for buoyancy
- Curse mode visual effect

### CombatSystem
- Object-pooled projectiles
- Physics-based cannonball arcs
- Collision detection
- Damage and hit effects

### SpawnSystem
- Wave-based enemy spawning
- Difficulty scaling
- Boss spawning
- Multiple enemy types

### FleetSystem
- Formation-based ship positioning
- Orbiting behavior
- Auto-targeting for fleet ships

### UpgradeSystem
- Card-based upgrades
- Stackable effects
- Rarity tiers (Common, Rare, Epic, Legendary)

### ParticleSystem
- Explosion effects
- Water splashes
- Muzzle flashes
- Damage indicators

### UIManager
- Main menu
- Ship selection
- Upgrade selection
- HUD (Health, XP, Timer, Score)
- Death screen

### SaveSystem
- localStorage persistence
- Permanent upgrades
- Ship unlocks
- Leaderboard (local + Supabase)

## 🎨 Credits

- **3D Models**: Kenney Pirate Kit (CC0)
- **Engine**: Three.js, Cannon.js, Howler.js
- **Build Tool**: Vite
- **Cloud**: Supabase

## 📜 License

MIT License - See LICENSE file for details

## 🔮 Roadmap

- [ ] Additional ship types
- [ ] More boss encounters
- [ ] Multiplayer support
- [ ] Mobile controls optimization
- [ ] Additional game modes
- [ ] Seasonal events
