---
title: 'Plinko Deluxe — Price Is Right Edition'
slug: 'free-plinko-web-game-deluxe'
created: '2026-03-12'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['SvelteKit 2.5', 'Svelte 5', 'Tailwind CSS v4', 'matter-js 0.19', 'TypeScript 5.5', 'Vite 5.4', 'bits-ui 1.2', 'phosphor-svelte', '@neodrag/svelte', 'chart.js', 'svelte-persisted-store', 'PixiJS (new)', 'Howler.js (new)']
files_to_modify: ['src/lib/components/Plinko/PlinkoEngine.ts', 'src/lib/components/Plinko/Plinko.svelte', 'src/lib/components/Plinko/BinsRow.svelte', 'src/lib/components/Sidebar/Sidebar.svelte', 'src/lib/components/SettingsWindow/SettingsWindow.svelte', 'src/lib/stores/game.ts', 'src/lib/stores/settings.ts', 'src/lib/stores/layout.ts', 'src/lib/constants/game.ts', 'src/lib/types/game.ts', 'src/lib/utils/colors.ts', 'src/routes/+page.svelte', 'src/app.css', 'src/app.html', 'package.json']
code_patterns: ['Svelte 5 runes ($state, $derived, $effect, $bindable)', 'Svelte stores (writable/derived) for global state', 'svelte-persisted-store for localStorage persistence', 'Class-based engine pattern (PlinkoEngine)', 'Svelte actions for canvas lifecycle', 'bits-ui compound components (Popover, Tooltip, Select, Switch)', 'Web Animations API for bin bounce effects', 'Tailwind + tailwind-merge for styling', 'DraggableWindow pattern for floating UI panels']
test_patterns: ['Vitest with describe/it/expect for unit tests in src/lib/utils/__tests__/', 'Playwright E2E in tests/game.spec.ts covering balance, manual bet, auto bet', 'vi.spyOn for mocking Math.random', 'Playwright: 3 browsers (Chromium, Firefox, WebKit), retries on CI', 'E2E requires pnpm build first, runs against preview server on :4173']
---

# Tech-Spec: Plinko Deluxe — Price Is Right Edition

**Created:** 2026-03-12

## Overview

### Problem Statement

The current Plinko game has minimal visual polish (flat white circles on a dark background, plain red balls, basic UI controls), no progression or social features, and documented physics limitations around outcome predictability and house edge. Players lack engagement hooks beyond basic betting mechanics, resulting in limited replay value.

### Solution

Rebuild/upgrade the Plinko game with a Price Is Right-inspired visual theme (bright colors, celebratory animations, polished UI), sound design (SFX + lo-fi background music, off by default), optional toggleable power-ups and progression system, and a persistent serverless leaderboard — all deployed as a static-friendly web app on Netlify.

### Scope

**In Scope:**
- Price Is Right visual theme: bright colors, celebratory animations, polished professional UI
- Sound effects (pin bounces, win celebrations) + lo-fi background music — both off by default with independent toggle controls
- Milestone-based unlock system: power-ups (walls, magnets, special pegs) are earned through gameplay milestones (total profit, drop count, hitting edge bins), then toggleable once unlocked
- Progression system with visible locked power-ups showing unlock requirements to create desire
- Persistent serverless leaderboard (name entry, scores persist across all visitors)
- Retain existing features: manual/auto bet modes, live stats, responsive mobile design
- Technology: PixiJS for WebGL rendering + matter-js for physics (recommended by architect), SvelteKit retained for page shell/UI, must be Netlify static-deployable
- Celebration moments: full-screen effects (confetti, screen shake, big number animations) on high-multiplier wins; near-miss agonizing feedback
- Color palette shift from dark casino (#0f1728) to Price Is Right brights, with careful contrast/readability for payout bins
- SEO-optimized slug and metadata for "free plinko web game"

**Out of Scope:**
- Real-money gambling / payment integration
- User accounts / authentication (leaderboard is name-entry only)
- Server-side outcome determination (keeping client-side physics)
- Mobile native apps
- Fixing the house-edge limitation (this remains a free fun game)

## Context for Development

### Codebase Patterns

- **Stack:** SvelteKit 2.5 + Svelte 5 (runes), Tailwind CSS v4, matter-js 0.19, Vite 5.4, TypeScript 5.5
- **State:** Svelte writable/derived stores in `$lib/stores/`. Balance persisted to localStorage on `beforeunload`. Settings via `svelte-persisted-store`.
- **Physics:** `PlinkoEngine` class (monolithic) — owns matter-js Engine, Render, and Runner. Renders to Canvas 2D. Handles ball creation, pin/wall layout, collision detection via category/mask system, and bin payout resolution via bottom sensor.
- **Rendering:** Currently matter-js Canvas 2D renderer. Pins are white circles, balls are red circles. No particle effects, glow, or advanced visuals.
- **UI:** Svelte components with bits-ui (Popover, Tooltip, Select, Switch), phosphor-svelte icons, @neodrag/svelte for draggable windows. DraggableWindow is the base for floating panels.
- **Animations:** Web Animations API in BinsRow.svelte (bounce on win). Custom `flyAndScale` transition for popovers/tooltips.
- **Styling:** Tailwind CSS + tailwind-merge. Dark slate/gray palette (#0f1728 canvas bg). Responsive via clamp() and breakpoint classes.
- **Testing:** Vitest (unit: math utils, color interpolation) + Playwright (E2E: balance, betting, auto-bet). 3 browsers. Requires build before E2E.
- **Deployment:** @sveltejs/adapter-static → Netlify via GitHub Actions. CI runs test.yml + deploy.yml. No netlify.toml currently.
- **Benchmark:** Dev-only page at `/benchmark` for tuning physics friction params against expected binomial distribution.

### Files to Reference

| File | Purpose | Lines | Modification Scope |
| ---- | ------- | ----- | ------------------ |
| `src/lib/components/Plinko/PlinkoEngine.ts` | Monolithic physics+rendering engine — matter-js wrapper | 383 | **Major rewrite**: Split rendering to PixiJS, keep matter-js for physics, add event emitter for celebration/sound hooks |
| `src/lib/components/Plinko/Plinko.svelte` | Canvas init via Svelte action, mounts PlinkoEngine | ~40 | **Moderate**: Initialize PixiJS renderer alongside matter-js |
| `src/lib/components/Plinko/BinsRow.svelte` | Payout bins with bounce animation (Web Animations API) | ~80 | **Moderate**: Restyle for Price Is Right theme, enhanced celebration animations |
| `src/lib/components/Plinko/LastWins.svelte` | Recent 4-win history display | ~30 | **Minor**: Restyle for new theme |
| `src/lib/components/Sidebar/Sidebar.svelte` | Bet controls, mode toggle, auto-bet, bottom action bar | 329 | **Moderate**: Add Power-Ups section, Leaderboard button, audio toggle icon |
| `src/lib/components/SettingsWindow/SettingsWindow.svelte` | Settings panel (animations toggle, reset balance) | 43 | **Minor**: Add SFX/Music toggle switches |
| `src/lib/components/LiveStatsWindow/` | Profit display + Chart.js profit history chart | ~220 | **Minor**: Restyle for new theme |
| `src/lib/components/ui/DraggableWindow.svelte` | Base draggable floating window | 67 | **Minor**: Theme update |
| `src/lib/stores/game.ts` | 9 stores: plinkoEngine, betAmount, balance, winRecords, etc. | 82 | **Moderate**: Add celebration event store, power-up stores, milestone stores |
| `src/lib/stores/settings.ts` | Persisted animation toggle | 4 | **Moderate**: Add audio SFX/music toggle stores |
| `src/lib/stores/layout.ts` | Window visibility toggles | 6 | **Minor**: Add isLeaderboardOpen |
| `src/lib/constants/game.ts` | Payout tables (9 rows × 3 risk × bins), localStorage keys, options | 100+ | **Minor**: Add audio/power-up localStorage keys, milestone thresholds |
| `src/lib/types/game.ts` | Enums (BetMode, RiskLevel), RowCount, WinRecord types | 60 | **Moderate**: Add PowerUp, Milestone, LeaderboardEntry types |
| `src/lib/utils/colors.ts` | RGB interpolation for bin gradients (red→yellow) | ~60 | **Moderate**: New Price Is Right color palette |
| `src/routes/+page.svelte` | Main page layout — nav, sidebar, canvas, windows, footer | 78 | **Moderate**: Add LeaderboardWindow, CelebrationOverlay, theme styling |
| `src/app.css` | Global CSS — Tailwind import, Inter font, cursor styles | 15 | **Moderate**: New theme variables, Price Is Right palette |
| `src/app.html` | HTML shell with meta tags | 20 | **Minor**: SEO meta tags update for "free plinko web game" |
| `package.json` | Dependencies and scripts | 59 | **Minor**: Add pixi.js, howler, @netlify/functions |

### New Files to Create

| File | Purpose |
| ---- | ------- |
| `src/lib/components/Plinko/PixiRenderer.ts` | PixiJS WebGL rendering layer — sprites for pins/balls, particle effects, glow, confetti |
| `src/lib/components/CelebrationOverlay.svelte` | Full-screen win celebration (confetti, screen shake, big multiplier animation) |
| `src/lib/components/PowerUpsSection.svelte` | Collapsible power-ups panel with milestone unlock states |
| `src/lib/components/LeaderboardWindow/LeaderboardWindow.svelte` | Draggable leaderboard showing top scores with name entry |
| `src/lib/components/AudioControls.svelte` | Speaker icon with SFX/music state (corner placement) |
| `src/lib/audio/AudioManager.ts` | Howler.js wrapper — SFX (pin bounce, win, near-miss) + background lo-fi music |
| `src/lib/stores/powerups.ts` | Power-up inventory, active power-ups, milestone progress |
| `src/lib/stores/leaderboard.ts` | Leaderboard data, submission state |
| `netlify/functions/get-leaderboard.ts` | Netlify Function: GET top scores |
| `netlify/functions/submit-score.ts` | Netlify Function: POST score with rate limiting + validation |
| `netlify.toml` | Netlify build config with functions directory |

### Technical Decisions

- **Rendering:** PixiJS for WebGL rendering layer (particles, glow, blend modes, sprite animations) + matter-js retained for physics simulation. SvelteKit remains the page shell. Phaser rejected as overkill for a single-screen game.
- **Leaderboard backend:** Netlify Functions + Netlify Blobs for zero-infrastructure persistence. Includes server-side rate limiting, name sanitization, and plausibility checks (score vs totalDrops) to prevent casual abuse. Not designed to stop determined cheaters — acceptable for a free game.
- **Audio:** Howler.js or Web Audio API for SFX and lo-fi background music. Both OFF by default with independent toggle controls. Pin bounce SFX should escalate in pitch as ball descends. Discovery: small speaker icon in corner, not an intrusive prompt.
- **Power-ups:** Milestone-unlocked, then user-toggleable. Locked power-ups visible but grayed out with unlock hints. Collapsible "Power-Ups" section in sidebar below bet controls, separated from core betting UI.
- **Leaderboard score:** Auto-captured peak balance (highest balance ever reached). Players cannot manually enter scores. Opt-in required — player enters name to join, then score updates are automatic. Leaderboard UI accessible via tab/button near live stats.
- **Celebration system:** High-multiplier bin hits (110x, 41x) trigger full-screen confetti, screen shake, big number animation. Near-misses get tension feedback. Power-up unlocks also trigger a full-screen "NEW POWER-UP UNLOCKED!" celebration.
- **WebGL fallback:** PixiJS auto-detects and falls back to Canvas 2D if WebGL unavailable. Particle effects degrade gracefully (reduced trail, no confetti particles).
- **PlinkoEngine refactor strategy:** Two-phase approach — Phase 1 (Task 4a): swap rendering only, verify physics unchanged. Phase 2 (Task 4b): add event system for audio/celebrations. This isolates risk.

## Implementation Plan

### Tasks

#### Epic 1: Foundation — Theme & Rendering Upgrade

- [ ] Task 1: Install new dependencies and configure build
  - File: `package.json`
  - Action: Add `pixi.js`, `howler`, `@netlify/functions`, `@netlify/blobs` as runtime dependencies.
  - File: `netlify.toml` (new)
  - Action: Create with build command (`pnpm build`), publish dir (`build`), and functions dir (`netlify/functions`).
  - Notes: Run `pnpm install` to verify no conflicts with existing deps.

- [ ] Task 2: Define Price Is Right color palette and theme variables
  - File: `src/app.css`
  - Action: Add CSS custom properties for the new theme palette. Primary: bold red (#E31837), gold (#FFD700), royal blue (#1E3A8A), bright green (#22C55E), white (#FFFFFF). Background: warm cream (#FFF8E7) or light gradient. Accent: hot pink (#EC4899) for big wins. Keep dark variant values for contrast panels (sidebar, stats windows).
  - File: `src/lib/utils/colors.ts`
  - Action: Update `interpolateRgbColors` defaults — bin gradient shifts from red→gold (Price Is Right style) instead of red→yellow. Export new theme color constants.
  - Notes: Ensure WCAG AA contrast for all text on new backgrounds. Bin multiplier numbers must remain readable.

- [ ] Task 3: Create PixiJS rendering layer
  - File: `src/lib/components/Plinko/PixiRenderer.ts` (new)
  - Action: Create class `PixiRenderer` that:
    - Accepts a canvas element and initializes a PixiJS Application with WebGL renderer
    - Exposes methods: `drawPins(positions, radius)`, `drawBall(id, x, y, radius)`, `updateBall(id, x, y)`, `removeBall(id)`, `drawWalls(positions)`, `clear()`
    - Renders pins as glowing circles with subtle radial gradient (white center, gold edge)
    - Renders balls as bright colored spheres with glow filter and motion trail (3-4 fading circles behind)
    - Uses PixiJS Graphics for shapes, filters for glow, ParticleContainer for trail particles
    - Handles resize/responsive scaling
  - Notes: PixiJS renders visuals only — physics positions come from matter-js. The renderer reads body positions each frame and updates sprite positions. Use dynamic `import('pixi.js')` in `Plinko.svelte` so PixiJS is code-split from the main bundle and loaded after initial page render. Target: PixiJS chunk <300KB gzipped.

- [ ] Task 4a: Refactor PlinkoEngine — replace Matter.Render with PixiJS (rendering only)
  - File: `src/lib/components/Plinko/PlinkoEngine.ts`
  - Action: Phase 1 refactor (rendering swap only, no new features):
    - Remove `Matter.Render` usage entirely (no more matter-js rendering)
    - Accept a `PixiRenderer` instance in constructor
    - On each physics tick (`Matter.Events.on(engine, 'afterUpdate')`), read all ball positions and call `renderer.updateBall(id, x, y)` for each
    - On `dropBall()`, call `renderer.drawBall()` after creating physics body
    - On `handleBallEnterBin()`, call `renderer.removeBall()`
    - On `placePinsAndWalls()`, call `renderer.drawPins()` and `renderer.drawWalls()`
    - Keep all physics params (friction, restitution, frictionAir) unchanged
    - **DO NOT** add event emitter or power-up integration yet — that's Task 4b
  - Notes: Isolate the rendering swap from all other changes. Verify ball physics + payout logic works identically before layering features. The physics simulation loop is now decoupled from rendering. matter-js `Runner` ticks physics; PixiJS renders on `requestAnimationFrame`. Use position interpolation between physics ticks to prevent visual stutter.

- [ ] Task 4b: Add event emitter system to PlinkoEngine
  - File: `src/lib/components/Plinko/PlinkoEngine.ts`
  - Action: Phase 2 (event system only, after Task 4a is verified working):
    - Add `EventTarget` mixin or custom event emitter
    - Emit `ball-bounced` event on ball→pin collision (with row index for sound pitch)
    - Emit `ball-binned` event on `handleBallEnterBin()` (with multiplier, binIndex, payoutValue)
    - Dispatch `CelebrationEvent` to the celebration event store
    - These events are consumed by AudioManager and CelebrationOverlay
  - Notes: This is separate from Task 4a so rendering can be verified independently before adding event plumbing.

- [ ] Task 4c: Add WebGL fallback handling
  - File: `src/lib/components/Plinko/PixiRenderer.ts`
  - Action: Ensure PixiJS falls back to Canvas 2D renderer if WebGL is unavailable. Add `isWebGL` getter. If Canvas 2D fallback is active, reduce particle count (trail length 1-2 instead of 3-4, skip confetti particles in CelebrationOverlay). Log fallback to console for debugging.
  - Notes: PixiJS handles this natively via `autoDetectRenderer`, but particle effects should degrade gracefully.

- [ ] Task 5: Update Plinko.svelte to mount PixiJS
  - File: `src/lib/components/Plinko/Plinko.svelte`
  - Action: Update the `initPlinko` Svelte action to:
    - Create a PixiJS canvas element (or use the existing one)
    - Instantiate `PixiRenderer` with the canvas
    - Pass renderer to `PlinkoEngine` constructor
    - Handle cleanup on unmount (destroy PixiJS application + stop physics)
  - Notes: The canvas sizing should remain 760×570 logical pixels but render at device pixel ratio for crisp WebGL output.

- [ ] Task 6: Restyle all UI components for Price Is Right theme
  - File: `src/lib/components/Plinko/BinsRow.svelte`
  - Action: Update bin colors to use new gold/red gradient. Add glow/shadow effects on bins. Enhance bounce animation — bigger scale, add a flash of light on win.
  - File: `src/lib/components/Plinko/LastWins.svelte`
  - Action: Restyle for bright theme. Add color-coded multiplier badges.
  - File: `src/lib/components/Sidebar/Sidebar.svelte`
  - Action: Update background from slate-700 to themed panel color. Update button colors (Drop Ball → bright red/gold). Update all text colors for new contrast.
  - File: `src/lib/components/ui/DraggableWindow.svelte`
  - Action: Update window chrome — brighter header bar, themed border.
  - File: `src/lib/components/LiveStatsWindow/LiveStatsWindow.svelte`
  - Action: Restyle stat cards and chart colors to match new palette.
  - File: `src/lib/components/LiveStatsWindow/Profit.svelte`
  - Action: Update color scheme for profit/loss indicators.
  - File: `src/lib/components/LiveStatsWindow/ProfitHistoryChart.svelte`
  - Action: Update chart colors (WIN_COLOR, LOSS_COLOR) to match theme.
  - File: `src/lib/components/Balance.svelte`
  - Action: Restyle balance display — gold text, themed background.
  - File: `src/routes/+page.svelte`
  - Action: Update page background, nav bar, and footer styling. Add Price Is Right-inspired header/branding.
  - File: `src/app.html`
  - Action: Update meta description, og:title, og:description for SEO. Include "free plinko web game" keywords.
  - Notes: All color changes should reference CSS custom properties from Task 2 for consistency. Verify responsive breakpoints still work with new padding/sizing. Add `@media (prefers-reduced-motion: reduce)` query in `src/app.css` that disables CSS animations/transitions globally. PixiRenderer should check `window.matchMedia('(prefers-reduced-motion: reduce)')` and skip particle trails, screen shake, and confetti when true (use simple opacity flash instead). Add ARIA labels to all interactive controls: power-up Switch toggles (`aria-label="Toggle [power-up name]"`), audio controls, leaderboard form inputs. Verify all bin multiplier text achieves WCAG AA contrast (4.5:1) against new theme background colors.

- [ ] Task 7: Update existing tests for theme changes
  - File: `src/lib/utils/__tests__/colors.test.ts`
  - Action: Update expected color values to match new bin gradient (red→gold instead of red→yellow).
  - File: `tests/game.spec.ts`
  - Action: Verify E2E tests still pass with new rendering. Update any color/text assertions if selectors changed. Core gameplay tests (balance, betting, auto-bet) should be unaffected.
  - Notes: Run `pnpm test:unit run && pnpm build && pnpm test:e2e` to verify.

#### Epic 2: Audio System

- [ ] Task 8: Create AudioManager
  - File: `src/lib/audio/AudioManager.ts` (new)
  - Action: Create singleton `AudioManager` class using Howler.js:
    - `initSfx()`: Load SFX sprites — pin_bounce (5 pitch variants, ascending), bin_land_low, bin_land_medium, bin_land_high, bin_land_jackpot, near_miss
    - `initMusic()`: Load lo-fi background track as looping Howl
    - `playSfx(name, options?)`: Play named SFX with optional pitch/volume override
    - `playPinBounce(rowIndex, totalRows)`: Calculate pitch from row position (higher pitch as ball descends)
    - `setMusicEnabled(on)`: Start/stop background music
    - `setSfxEnabled(on)`: Enable/disable SFX
    - `setMusicVolume(vol)`, `setSfxVolume(vol)`: Volume controls
    - `destroy()`: Cleanup all Howl instances
  - Notes: Audio files (mp3/ogg) should be placed in `static/audio/`. Use free/CC0 sound assets. Background music should be a single lo-fi track, loopable.

- [ ] Task 9: Add audio stores and settings
  - File: `src/lib/stores/settings.ts`
  - Action: Add persisted stores: `isSfxOn` (default false), `isMusicOn` (default false).
  - File: `src/lib/constants/game.ts`
  - Action: Add localStorage keys: `SETTINGS.SFX` = `'plinko_settings_sfx'`, `SETTINGS.MUSIC` = `'plinko_settings_music'`.

- [ ] Task 10: Integrate audio with game events
  - File: `src/lib/components/Plinko/PlinkoEngine.ts`
  - Action: In collision handler for ball→pin collisions, emit `ball-bounced` event with row index. In `handleBallEnterBin()`, emit event with multiplier for celebration sound selection.
  - File: `src/lib/components/AudioControls.svelte` (new)
  - Action: Create small speaker icon component (bottom-right corner). Click toggles all audio (SFX + Music) as a quick-mute. Visual state: muted/unmuted icon. Full audio controls (independent SFX toggle, Music toggle, volume sliders) live in SettingsWindow — this is just a quick-access mute button.
  - File: `src/lib/components/SettingsWindow/SettingsWindow.svelte`
  - Action: Add two Switch toggles: "Sound Effects" and "Background Music" below the Animations toggle, bound to `isSfxOn` and `isMusicOn` stores.
  - File: `src/routes/+page.svelte`
  - Action: Mount AudioControls component. Initialize AudioManager in `$effect`, subscribe to settings stores for enable/disable.
  - Notes: Audio context requires user interaction to start (browser autoplay policy). First click/tap anywhere should resume AudioContext if music is enabled.

#### Epic 3: Celebration System

- [ ] Task 11: Create celebration event store
  - File: `src/lib/stores/game.ts`
  - Action: Add `celebrationEvent` writable store of type `CelebrationEvent | null`. Type includes: `multiplier`, `payoutValue`, `binIndex`, `tier`, `rowCount`. Tier is calculated RELATIVE to the current row count's maximum multiplier: 'jackpot' for payout >= 80% of max multiplier, 'big_win' for >= 30% of max, 'win' for >= 10% of max, 'near_miss' for ball landing in a bin adjacent to the highest-multiplier bin. Add helper `calculateCelebrationTier(multiplier: number, rowCount: RowCount, riskLevel: RiskLevel): CelebrationTier` that looks up the max multiplier from the payout table for the given row/risk and computes the percentage thresholds.
  - File: `src/lib/types/game.ts`
  - Action: Add `CelebrationEvent` type (with `rowCount` field) and `CelebrationTier` enum.

- [ ] Task 12: Create CelebrationOverlay component
  - File: `src/lib/components/CelebrationOverlay.svelte` (new)
  - Action: Create full-screen overlay that subscribes to `celebrationEvent` store:
    - **Jackpot (>=80% of max multiplier for current row/risk):** Full confetti explosion (PixiJS particle burst or CSS confetti), screen shake (CSS transform animation on game container), giant animated multiplier number that scales up and pulses, gold flash overlay, 2-3 second duration
    - **Big Win (>=30% of max multiplier):** Confetti burst (smaller), multiplier popup with glow, 1.5 second duration
    - **Win (>=10% of max multiplier):** Quick sparkle effect, brief multiplier flash, 0.5 second duration
    - **Near Miss (ball lands in bin adjacent to the highest-multiplier edge bin):** Brief red flash on the jackpot bin, tension sound, 0.3 second duration. Detection: check if `binIndex === 1` or `binIndex === totalBins - 2` (one position away from edge bins which have the max multiplier)
    - **Unlock (power-up milestone reached):** Full-screen "NEW POWER-UP UNLOCKED!" banner, fanfare SFX, gold flash, 2s duration
    - All celebrations auto-dismiss after duration. Overlay is pointer-events:none so gameplay isn't blocked.
  - File: `src/routes/+page.svelte`
  - Action: Mount CelebrationOverlay component at page level (above game canvas, below nav).
  - Notes: Celebration effects should integrate with AudioManager — each tier triggers corresponding SFX.

#### Epic 4: Power-Ups & Progression System

- [ ] Task 13: Define power-up types and milestone system
  - File: `src/lib/types/game.ts`
  - Action: Add types:
    - `PowerUpType` enum: `WALL_GUIDE` (invisible walls that funnel toward center), `MAGNET` (slight pull toward nearest high-multiplier bin), `GOLDEN_PEG` (random pins glow gold, 2x multiplier if ball touches one), `MULTI_BALL` (drop 3 balls for price of 1)
    - `PowerUpState`: `{ type: PowerUpType, unlocked: boolean, active: boolean, unlockRequirement: MilestoneRequirement }`
    - `MilestoneRequirement`: `{ type: 'drops' | 'profit' | 'jackpot_hits' | 'edge_bins', threshold: number, description: string }`
    - `MilestoneProgress`: `{ totalDrops: number, totalProfit: number, jackpotHits: number, edgeBinHits: number }`
  - File: `src/lib/constants/game.ts`
  - Action: Add `POWER_UP_MILESTONES` config:
    - WALL_GUIDE: unlocks at 100 total drops (~5 min play, warm-up milestone)
    - MULTI_BALL: unlocks at 300 total drops (committed player milestone)
    - MAGNET: unlocks at $1,000 total profit (requires luck + volume)
    - GOLDEN_PEG: unlocks at 3 jackpot hits >=41x (aspirational but achievable)

- [ ] Task 14: Create power-up stores
  - File: `src/lib/stores/powerups.ts` (new)
  - Action: Create stores:
    - `milestoneProgress`: persisted store tracking `MilestoneProgress`
    - `powerUpStates`: derived store computing unlock status from milestoneProgress + POWER_UP_MILESTONES
    - `activePowerUps`: writable store of `Set<PowerUpType>` for currently enabled power-ups
    - Subscribe to `winRecords` to auto-update milestoneProgress (increment drops, track profit, count jackpots/edge hits)
  - Notes: Use svelte-persisted-store so milestone progress persists across sessions.

- [ ] Task 15: Create PowerUpsSection UI
  - File: `src/lib/components/PowerUpsSection.svelte` (new)
  - Action: Create collapsible panel component:
    - Header: "Power-Ups" with collapse/expand chevron
    - For each power-up: icon, name, Switch toggle (disabled+grayed if locked), progress bar showing unlock progress (e.g., "23/50 drops")
    - Locked items show lock icon + requirement text
    - Unlocked items show enabled/disabled Switch
    - Celebrate unlock with FULL SCREEN moment: "NEW POWER-UP UNLOCKED!" banner with fanfare SFX, gold flash, then the item highlights in the sidebar. Reuse CelebrationOverlay with a new `unlock` tier.
  - File: `src/lib/components/Sidebar/Sidebar.svelte`
  - Action: Insert `<PowerUpsSection />` below the Rows selector, above the auto-bet section. Add visual separator.

- [ ] Task 16: Implement power-up physics effects
  - File: `src/lib/components/Plinko/PlinkoEngine.ts`
  - Action: Read `activePowerUps` store and apply effects:
    - **WALL_GUIDE:** On `dropBall()`, add temporary invisible guide walls (narrower funnel) that disappear after ball passes row 3
    - **MAGNET:** On each physics tick, apply tiny force vector (magnitude `MAGNET_FORCE = 0.00002`, tuned to nudge ~1 bin width over 3 rows) toward nearest high-value bin if ball is in bottom 3 rows. Magnet is a passive effect (always active when toggled on, no per-use cost or cooldown) — this keeps it simple and consistent with the other toggle-style power-ups.
    - **GOLDEN_PEG:** On `placePinsAndWalls()`, randomly mark 3-5 pins as "golden" (re-randomized each time rows/risk changes). Track ball→golden-pin collisions. If a ball hits ANY golden pin, store a single 2x multiplier flag on that ball (does NOT stack — hitting multiple golden pins still yields exactly 2x, not 4x/8x). In `handleBallEnterBin()`, apply the 2x bonus to the final payout.
    - **MULTI_BALL:** On `dropBall()`, create 3 balls with slight x-offset spread instead of 1. Deduct balance once. Each ball resolves independently — all 3 payouts are added to balance, all 3 count toward stats (winRecords, totalDrops, milestoneProgress). Celebrations trigger for the BEST outcome among the 3 balls (only one celebration per multi-ball drop). Max concurrent balls across ALL active drops capped at `MAX_CONCURRENT_BALLS = 30` — if dropping 3 would exceed the cap, reject the drop with a toast message.
  - File: `src/lib/components/Plinko/PixiRenderer.ts`
  - Action: Add visual indicators for active power-ups:
    - Golden pegs: Render marked pins with gold glow + sparkle particle
    - Wall guide: Render faint translucent guide lines
    - Magnet: Subtle pull-line particle effect in bottom rows
    - Multi-ball: Each ball gets a slightly different hue
  - Notes: Power-up effects must not break the existing payout balance significantly. WALL_GUIDE and MAGNET should be subtle nudges, not guaranteed outcomes. After implementation, run benchmark with each power-up active individually and verify payout deviation stays within 10% of baseline (power-ups are meant to help, but not break the game). Add constant `MAX_CONCURRENT_BALLS = 30` to `src/lib/constants/game.ts`.

#### Epic 5: Leaderboard System

- [ ] Task 17: Create leaderboard Netlify Functions
  - File: `netlify/functions/get-leaderboard.ts` (new)
  - Action: GET endpoint that:
    - Reads top 50 scores from Netlify Blobs (key: `leaderboard`)
    - Returns sorted JSON array: `[{ name, score, date, totalDrops }]`
    - Adds CORS headers for the site domain
  - File: `netlify/functions/submit-score.ts` (new)
  - Action: POST endpoint that:
    - Validates body: `{ name: string (3-20 chars, alphanumeric+spaces), score: number (peak balance, >0, <10000000), totalDrops: number }`
    - Rate limits: max 1 submission per IP per 60 seconds (use Netlify Blobs with TTL for rate limit tracking)
    - Sanitizes name (trim, strip HTML)
    - Reads current leaderboard from Blobs, inserts new entry, keeps top 50, writes back. Use optimistic locking: read blob with ETag, write with `If-Match` ETag header. If write fails (409 Conflict), retry up to 3 times with 200ms delay between retries (read-modify-write loop).
    - Server-side plausibility check: reject scores where `score > 1000 * (100 + totalDrops)` (i.e., score must be plausible given the number of drops played — a generous upper bound that won't reject legitimate play)
    - Returns updated leaderboard position
  - File: `netlify/functions/utils/validation.ts` (new)
  - Action: Extract pure validation functions (validateName, validateScore, sanitizeName, isScorePlausible) into testable module. Export for unit testing.
  - Notes: Netlify Blobs has eventual consistency — acceptable for a casual game leaderboard. No auth needed. The optimistic locking pattern handles concurrent writes gracefully.

- [ ] Task 18: Create leaderboard store and API client with auto-captured score
  - File: `src/lib/stores/leaderboard.ts` (new)
  - Action: Create stores:
    - `leaderboardEntries`: writable store of `LeaderboardEntry[]`
    - `leaderboardLoading`: writable boolean
    - `leaderboardError`: writable string | null
    - `playerName`: persisted store (remember last used name)
    - `peakBalance`: persisted derived store — tracks the highest balance ever reached in any session. Updated via subscription to `balance` store: `if (currentBalance > peakBalance) peakBalance = currentBalance`. This is the auto-captured "score".
    - `leaderboardOptIn`: persisted store (default false) — whether the player has opted in to leaderboard participation
    - Functions: `fetchLeaderboard()`, `submitScore()` — score is always `peakBalance` (auto-captured, NOT user-editable). Only `playerName` is user-provided. Both functions include network error handling: retry up to 2 times with exponential backoff (1s, 2s), 8s request timeout (accounts for Netlify cold starts ~3-5s), AbortController for cancellation. On failure, set `leaderboardError` with user-friendly message ("Leaderboard unavailable — playing offline") and allow gameplay to continue unaffected.
  - File: `src/lib/types/game.ts`
  - Action: Add `LeaderboardEntry` type: `{ name: string, score: number, date: string, totalDrops: number, rank: number }`
  - Notes: Score is auto-captured from peak balance — players cannot manually enter a score. This prevents fabrication while keeping it simple. The `peakBalance` store persists across sessions via localStorage.

- [ ] Task 19: Create LeaderboardWindow UI with opt-in flow
  - File: `src/lib/components/LeaderboardWindow/LeaderboardWindow.svelte` (new)
  - Action: Create DraggableWindow-based component:
    - Title: "Leaderboard" with Trophy icon
    - Title bar action: Refresh button
    - Content: Scrollable list of top 50 entries — rank, name, score (peak balance), date
    - Current player's best score highlighted if on board
    - **Opt-in section (shown if not opted in):** "Join the leaderboard?" prompt with name input + "Join" button. Toggle for `leaderboardOptIn`. Clear explanation: "Your highest balance will be automatically submitted."
    - **Opted-in section:** Shows player name (editable), current peak balance as "Your Score: $X", "Update Score" button (submits current peakBalance, disabled if score hasn't improved since last submission). Option to opt out.
    - Score display is read-only — no manual score entry field
    - Loading spinner while fetching
    - Error state with retry button
  - File: `src/lib/components/LeaderboardWindow/index.ts` (new)
  - Action: Barrel export.
  - File: `src/lib/stores/layout.ts`
  - Action: Add `isLeaderboardOpen` writable store (default false).
  - File: `src/lib/components/Sidebar/Sidebar.svelte`
  - Action: Add Trophy icon button to bottom action bar (next to Settings and Live Stats), toggling `isLeaderboardOpen`.
  - File: `src/routes/+page.svelte`
  - Action: Mount LeaderboardWindow conditionally on `$isLeaderboardOpen`.

#### Epic 6: Polish & SEO

- [ ] Task 20: Add sound assets
  - File: `static/audio/` (new directory)
  - Action: Source and add CC0/royalty-free audio files:
    - `pin-bounce.mp3` — Short metallic ping
    - `bin-land.mp3` — Satisfying thud/chime
    - `jackpot.mp3` — Celebratory fanfare (2-3 seconds)
    - `big-win.mp3` — Brief celebration sound
    - `near-miss.mp3` — Tension/suspense sting
    - `background-lofi.mp3` — Lo-fi chill loop (60-90 seconds, seamless loop)
  - Notes: Keep file sizes small (<200KB each for SFX, <1MB for music). Use MP3 for broad compatibility. Recommended CC0 sources: freesound.org (SFX — search "metallic ping", "chime", "fanfare", "suspense sting"), pixabay.com/music (lo-fi background loops). Alternative: generate simple SFX procedurally with Web Audio API oscillators as a fallback if sourcing proves difficult (pin bounce = short sine wave with decay, bin land = filtered noise burst).

- [ ] Task 21: SEO and meta tags
  - File: `src/app.html`
  - Action: Update `<title>` to "Free Plinko Web Game — Plinko Deluxe". Update meta description: "Play Plinko Deluxe for free! Drop balls, win big, unlock power-ups, and compete on the leaderboard. Inspired by The Price Is Right." Add og:image, og:type=website, twitter:card=summary_large_image.
  - File: `static/` — Add new og:image screenshot of the upgraded game (create after visual theme is complete).
  - Notes: Slug `free-plinko-web-game-deluxe` should appear in canonical URL path if routing changes are made.

- [ ] Task 22: Update GitHub Actions for Netlify Functions
  - File: `.github/workflows/deploy.yml`
  - Action: Ensure build step includes Netlify Functions. The `netlify deploy` command should automatically detect the `netlify/functions` directory from `netlify.toml`. Verify preview deployments include functions.
  - Notes: Test locally with `netlify dev` before pushing to CI.

- [ ] Task 23: Final integration testing and benchmark verification
  - Action: Run full test suite: `pnpm test:unit run && pnpm build && pnpm test:e2e`
  - Action: Load `/benchmark` page and run 1000+ ball drops to verify payout distribution hasn't shifted significantly with rendering changes
  - Action: Test on mobile (responsive) and verify all new features work on touch
  - Action: Test leaderboard submit/fetch cycle with `netlify dev`
  - Action: Verify audio plays correctly on Chrome, Firefox, Safari (mobile and desktop)
  - Action: Lighthouse audit for performance (target >90) and SEO (target >95)

### Acceptance Criteria

#### Epic 1: Foundation
- [ ] AC 1: Given the game loads, when viewing the canvas, then pins render as glowing circles with radial gradient on a bright themed background (not flat white on dark)
- [ ] AC 2: Given a ball is dropped, when it bounces through pins, then it renders with a glow effect and visible motion trail of 3-4 fading circles
- [ ] AC 3: Given a ball lands in a bin, when the bin bounce animation plays, then the animation includes a light flash and the bin colors use the new red→gold gradient
- [ ] AC 4: Given the page loads, when inspecting the UI, then all panels (sidebar, stats, settings) use the Price Is Right bright theme palette with readable text (WCAG AA)
- [ ] AC 5: Given all existing E2E tests, when running `pnpm test:e2e`, then all tests pass without modification to core gameplay assertions
- [ ] AC 5a: Given a device without WebGL support, when the game loads, then PixiJS falls back to Canvas 2D rendering with reduced particle effects (no visual errors or crashes)
- [ ] AC 5b: Given PlinkoEngine unit tests, when running `pnpm test:unit`, then tests verify: ball creation dispatches to renderer, bin collision triggers celebration event, power-up modifiers apply correctly
- [ ] AC 5c: Given the PixiJS renderer is active with up to 30 concurrent balls and particle effects, when measuring frame rate, then rendering maintains >=55fps on mid-range hardware (use `requestAnimationFrame` timing or PixiJS ticker stats)
- [ ] AC 5d: Given a user with `prefers-reduced-motion` OS setting enabled, when celebrations trigger, then screen shake is disabled, confetti particles are replaced with a simple flash overlay, and motion trails are removed. ARIA labels are present on interactive controls (power-up toggles, leaderboard inputs, audio controls). Bin multiplier text maintains WCAG AA contrast ratio (4.5:1) against new theme backgrounds.

#### Epic 2: Audio
- [ ] AC 6: Given SFX is toggled on in settings, when a ball bounces off a pin, then a pin-bounce sound plays with ascending pitch based on row depth
- [ ] AC 7: Given Music is toggled on in settings, when the game is active, then lo-fi background music loops continuously
- [ ] AC 8: Given a fresh page load, when checking audio state, then both SFX and Music are OFF by default
- [ ] AC 9: Given audio settings are changed, when the page is refreshed, then the settings persist from localStorage

#### Epic 3: Celebrations
- [ ] AC 10: Given a ball lands in a bin with payout >=80% of the current row/risk max multiplier, when the celebration triggers, then a full-screen confetti explosion, screen shake, and giant multiplier animation play for 2-3 seconds
- [ ] AC 11: Given a ball lands in a bin with payout >=30% of the current row/risk max multiplier, when the celebration triggers, then a confetti burst and multiplier popup with glow play for 1.5 seconds
- [ ] AC 12: Given a ball lands in a bin adjacent to the highest-multiplier edge bin (binIndex 1 or totalBins-2), when the near-miss triggers, then a brief red flash and tension sound play
- [ ] AC 13: Given a celebration is playing, when the user clicks Drop Ball, then the game remains fully interactive (overlay is pointer-events:none)

#### Epic 4: Power-Ups
- [ ] AC 14: Given a new player with 0 drops, when viewing the Power-Ups section, then all 4 power-ups show as locked with progress bars at 0 and unlock requirement text
- [ ] AC 15: Given a player has made 100 drops, when the 100th drop completes, then WALL_GUIDE unlocks with a full-screen "NEW POWER-UP UNLOCKED!" celebration (banner, fanfare SFX, gold flash) and the Switch becomes enabled
- [ ] AC 15a: Given a player has made 300 drops, when the 300th drop completes, then MULTI_BALL unlocks with full-screen unlock celebration
- [ ] AC 16: Given GOLDEN_PEG is active (unlocked at 3 jackpot hits), when pins are rendered, then 3-5 random pins glow gold, and if a ball touches one, the payout receives a 2x bonus
- [ ] AC 17: Given MULTI_BALL is active, when Drop Ball is clicked, then 3 balls drop simultaneously for the price of 1 bet
- [ ] AC 18: Given milestone progress, when the page is refreshed, then progress persists from localStorage

#### Epic 5: Leaderboard
- [ ] AC 19: Given the leaderboard button is clicked, when the window opens, then it fetches and displays top 50 scores (peak balances) sorted by score descending
- [ ] AC 20: Given a player has opted in with a valid name (3-20 chars) and their peak balance exceeds their last submitted score, when "Update Score" is clicked, then the auto-captured peak balance is submitted and the leaderboard refreshes
- [ ] AC 21: Given a player submits a score, when they submit again within 60 seconds, then the request is rejected with a rate-limit message
- [ ] AC 22: Given an invalid name (<3 chars or >20 chars or contains HTML), when opt-in is attempted, then it is rejected with a validation error
- [ ] AC 22a: Given a player has NOT opted in to the leaderboard, when viewing the leaderboard window, then they see an opt-in prompt with name input and explanation that peak balance is auto-tracked
- [ ] AC 22b: Given a player has opted in, when they reach a new peak balance during gameplay, then the `peakBalance` store updates automatically (no manual score entry exists)
- [ ] AC 22c: Given the Netlify Functions validation module, when running unit tests, then name validation, score validation, and sanitization functions pass all cases

#### Epic 6: Polish
- [ ] AC 23: Given the page source, when checking meta tags, then title contains "Free Plinko Web Game", description mentions free-to-play and Price Is Right
- [ ] AC 24: Given a Lighthouse audit, when checking Performance score, then it is >90
- [ ] AC 25: Given the benchmark page with 1000+ drops, when comparing actual vs expected payout distribution, then the deviation is within 5% of the PRE-REFACTOR baseline (captured in Task 7 before any rendering changes)
- [ ] AC 25a: Given a benchmark baseline snapshot, when Task 7 begins, then the dev captures current benchmark results (1000+ drops, all row counts, medium risk) as the reference baseline file

## Additional Context

### Dependencies

**New Runtime Dependencies:**
- `pixi.js` — WebGL 2D rendering (particles, sprites, blend modes, filters)
- `howler` — Cross-browser audio (SFX + music with independent volume/mute)
- `@netlify/functions` — Serverless function helpers for leaderboard API
- `@netlify/blobs` — Key-value persistence for leaderboard data (MUST be a runtime dependency — used by Netlify Functions at runtime, not just build time)

**Existing Dependencies Retained:**
- `matter-js` — Physics simulation (balls, pins, collisions, gravity)
- `chart.js` — Profit history chart in Live Stats
- `bits-ui` — UI primitives (Select, Switch, Popover, Tooltip)
- `@neodrag/svelte` — Draggable windows
- `phosphor-svelte` — Icon library (add Trophy icon for leaderboard)
- `svelte-persisted-store` — Settings persistence
- `tailwind-merge` — Class merging utility

**Infrastructure:**
- Netlify Functions (included with Netlify hosting)
- Netlify Blobs (included with Netlify hosting) for leaderboard persistence

### Testing Strategy

**Unit Tests (Vitest):**
- `colors.test.ts`: Update expected gradient values for new red→gold palette
- New test: `PlinkoEngine.test.ts` — verify ball creation dispatches to renderer, bin collision triggers celebration event, power-up modifier application (mock PixiRenderer interface)
- New test: `powerups.test.ts` — milestone progress calculations, unlock logic at correct thresholds (100 drops / 300 drops / $1,000 profit / 3 jackpot hits), persisted state
- New test: `audio.test.ts` — AudioManager initialization, mute/unmute state, SFX name resolution
- New test: `leaderboard.test.ts` — peakBalance auto-tracking, opt-in state management, API response parsing
- New test: `netlify-validation.test.ts` — pure function tests for validateName, validateScore, sanitizeName from `netlify/functions/utils/validation.ts`

**E2E Tests (Playwright):**
- Existing tests (balance, manual bet, auto bet) must continue passing — core gameplay unchanged
- New test: `celebrations.spec.ts` — drop ball, verify celebration overlay appears on big wins (use mock payout or force high-multiplier scenario)
- New test: `powerups.spec.ts` — verify power-up section renders, locked state, toggle interaction
- New test: `leaderboard.spec.ts` — open leaderboard window, submit score flow, verify display
- New test: `settings.spec.ts` — toggle SFX/Music, verify persistence on reload

**Integration Tests:**
- Netlify Functions: Test `submit-score` and `get-leaderboard` locally with `netlify dev`
- PixiJS rendering: Visual regression testing (screenshot comparison) for pin/ball rendering

**Manual Testing Checklist:**
- [ ] Audio plays on Chrome, Firefox, Safari (desktop + mobile)
- [ ] Responsive layout on mobile (320px-768px widths)
- [ ] Power-up physics effects feel subtle, not game-breaking
- [ ] Celebrations don't block gameplay interaction
- [ ] Leaderboard handles network errors gracefully
- [ ] Benchmark page: 1000+ drops, payout deviation <5%

### Notes

**High-Risk Items:**
- PixiJS + matter-js integration: The rendering loop synchronization is the most complex piece. If PixiJS frame rate and matter-js tick rate diverge, balls may appear to stutter. Mitigation: Use `requestAnimationFrame` for PixiJS and interpolate ball positions between physics ticks.
- Netlify Blobs eventual consistency: Rapid leaderboard submissions may briefly show stale data. Acceptable for a casual game.
- Audio autoplay policy: Browsers block audio until user interaction. Must handle this gracefully — first click/tap resumes AudioContext.
- Power-up balance: MAGNET and WALL_GUIDE could shift payout distribution. Verify with benchmark page after implementation.
- Bundle size: PixiJS adds ~200-300KB gzipped. Target total JS bundle <500KB gzipped. Use dynamic `import()` for PixiJS (`PixiRenderer.ts`) so the module is code-split and loaded after initial page render. Howler.js (~10KB gzipped) and audio files are lazy-loaded on first audio enable. Netlify Functions are naturally separate bundles. Monitor with `pnpm build` output and Lighthouse performance score.

**Known Limitations:**
- Client-side physics remains — outcomes are not pre-determined (inherited limitation, out of scope)
- Leaderboard scores are auto-captured peak balance from client — still spoofable via devtools/localStorage manipulation (this is inherent to any client-side game without server-authoritative physics). Server-side plausibility check rejects scores that are impossible given totalDrops, but determined cheaters can still manipulate values. Acceptable tradeoff for a free fun game — the goal is to prevent casual abuse, not build an anti-cheat system.
- Lo-fi background music adds ~500KB-1MB to initial page load. Use lazy loading / streaming.

**Future Considerations (Out of Scope):**
- Multiplayer real-time Plinko (WebSocket-based)
- Achievement badges and player profiles
- Custom board themes (seasonal, holiday)
- Tournament mode with time-limited competitive rounds
- Replay system (record and share specific ball paths)

**References:**
- Competitor: Arkadium's Price Is Right Plinko (https://www.arkadium.com/games/price-is-right-plinko/) — power-ups, progression, leaderboard
- Original repo: https://github.com/AnsonH/plinko-game — fork with Svelte 5 + Tailwind v4 upgrades
- This game is explicitly non-profit and free-to-play
