<div align="center">
  <img src="./static/android-chrome-192x192.png" width="100" height="100" alt="Plinko Deluxe Logo">
  <h1>Plinko Deluxe</h1>
  <p>A free-to-play Plinko web game inspired by The Price Is Right.</p>

  <h3>🎮 <a href="https://free-plinko-web-game.netlify.app/">Play Now - 100% Free!</a></h3>

  <p><em>Built with <a href="https://claude.ai/claude-code">Claude Code</a> — a great example of what you can create when AI and human creativity work together.</em></p>
</div>

## About

Plinko Deluxe is a **100% free** web-based Plinko game where you drop balls through a pyramid of pins and watch them bounce into payout bins at the bottom. No real money, no sign-up, no ads — just drop and play.

**🎯 [Play the live game here!](https://free-plinko-web-game.netlify.app/)**

## Features

- 100% free to play with unlimited balance top-ups
- Manual and auto-bet modes
- Real-time live stats and charts
- Leaderboard
- Sound effects and audio controls
- Responsive design for desktop and mobile

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) (Svelte 5) — UI framework
- [Tailwind CSS](https://tailwindcss.com/) v4 — styling
- [Matter.js](https://github.com/liabru/matter-js) — 2D physics engine for ball simulation
- [PixiJS](https://pixijs.com/) — rendering
- [Chart.js](https://www.chartjs.org/) — live stats charts
- [Howler.js](https://howlerjs.com/) — audio
- [Bits UI](https://www.bits-ui.com/) — headless UI components
- [Netlify](https://www.netlify.com/) — hosting and serverless functions
- [Playwright](https://playwright.dev/) — end-to-end testing
- [Vitest](https://vitest.dev/) — unit testing

## Development

### Getting Started

> [!NOTE]
> Requires Node.js 20 or later.

1. Install [pnpm](https://pnpm.io/installation) (v9+)
2. Clone this repository

   ```bash
   git clone https://github.com/growsontrees/plinko-deluxe.git
   cd plinko-deluxe
   ```

3. Install dependencies

   ```bash
   pnpm install
   ```

4. Start the development server

   ```bash
   pnpm dev
   ```

### Building for Production

The site is statically generated using [@sveltejs/adapter-static](https://github.com/sveltejs/kit/tree/main/packages/adapter-static).

```bash
pnpm build
pnpm preview
```

### Testing

Unit tests:

```bash
pnpm test:unit
```

End-to-end tests (Playwright):

```bash
pnpm build
pnpm test:e2e
```

### Linting and Formatting

```bash
pnpm lint
pnpm format
```

## Deployment

This project deploys to [Netlify](https://www.netlify.com/) with static site generation and serverless functions (leaderboard via Netlify Blobs).

## License

This project is open source. See the repository for details.
