# Sky Rush 3D

## Current State
New project - no existing code.

## Requested Changes (Diff)

### Add
- A 3D endless runner game where the player controls a spaceship/character flying through space
- Player moves left/right/up/down to dodge obstacles (asteroids, space debris)
- Collectible gems/stars for score
- Progressive speed increase for difficulty
- High score tracking (localStorage)
- Daily challenge mode (seed-based random generation per day)
- Particle effects for explosions, gem collection
- Shield power-up, speed boost power-ups
- Combo multiplier system
- Game over + restart screen
- Mobile touch controls + keyboard/mouse controls

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Install @react-three/fiber, @react-three/drei, three, zustand
2. Create game store (zustand) for score, lives, state, highscore
3. Build main Game canvas with starfield background
4. Player spaceship mesh with trail particles
5. Procedural obstacle spawner (asteroids)
6. Collectible gems with glow effect
7. Power-ups (shield, score multiplier)
8. HUD overlay (score, lives, multiplier)
9. Start screen, Game Over screen
10. Keyboard + touch controls
11. LocalStorage high score persistence
