# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bridge Trainer is a web-based tool for practicing bridge card game skills (point counting, opening bids, etc.). It uses a "Card Table Modernist" design theme with emerald green accents, cream backgrounds, and three font families: DM Sans (headings), Source Serif 4 (body), JetBrains Mono (numbers/scores).

## Commands

```bash
pnpm dev          # Start Vite dev server (client on :3000, auto-finds next port)
pnpm build        # Build client (Vite) + server (esbuild) into dist/
pnpm start        # Run production server (NODE_ENV=production node dist/index.js)
pnpm check        # TypeScript type checking (tsc --noEmit)
pnpm format       # Format with Prettier
```

No test runner is configured. Vitest is listed as a devDependency but no test files exist.

## Architecture

### Monorepo Structure

- **`client/`** — React SPA (Vite root). Entry: `client/src/main.tsx` → `App.tsx`
- **`server/`** — Minimal Express server (`server/index.ts`). Static file serving + client-side routing fallback. No API routes.
- **`shared/`** — Shared constants (`COOKIE_NAME`, `ONE_YEAR_MS`)
- **`dist/`** — Build output: `dist/public/` (client), `dist/index.js` (server bundle)

### Path Aliases (tsconfig + vite)

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### Game Module System

Games are self-contained modules that register themselves via side-effect imports. Each game lives in `client/src/games/<name>/` and exports three components:

1. **SetupComponent** — Configuration UI (difficulty, hand count, timer, etc.)
2. **PlayComponent** — The game session itself
3. **ResultsComponent** — Post-session results/stats display

Registration pattern (in each game's `index.tsx`):

```ts
registerGame({ config, SetupComponent, PlayComponent, ResultsComponent });
```

Game modules are imported in `App.tsx` for side effects:

```ts
import "./games/pointCounting/index";
import "./games/openingBid/index";
```

The flow is: `GamePage.tsx` → loads module by URL param → orchestrates setup → play → results phases.

**To add a new game**: Create directory in `client/src/games/`, implement the three components, register via `registerGame()`, and add the side-effect import in `App.tsx`.

### Convention System

Opening bid evaluation uses a priority-ordered rule system (`client/src/lib/conventions.ts`):

- **`conventionData.ts`** — Defines convention rules (SAYC, 2/1 Game Force, etc.). Each convention is a list of `BidRule` objects with typed conditions evaluated top-to-bottom; first match wins.
- **`conventionReferenceData.ts`** — Human-readable reference data for the `/reference` page and inline reference panels.

### Data Persistence

IndexedDB via `idb` library (`client/src/lib/db.ts`). Stores `GameSession` and `HandResult` records. No server-side database.

### Key Libraries

- **Routing**: `wouter` (lightweight React router) with a pnpm patch for custom behavior
- **UI Components**: shadcn/ui (new-york style, `client/src/components/ui/`)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite` plugin, CSS variables for theming
- **Animations**: `framer-motion`
- **Bridge Logic**: `client/src/lib/bridge.ts` (card types, HCP calculation, hand generation, suit analysis)
- **State**: React hooks only — no global state library

### Keyboard Shortcuts

The app has extensive keyboard shortcut support via `useKeyboardShortcuts.ts` and the `KeyboardShortcutsOverlay` component. Context-aware shortcuts per game type (press `?` to see overlay).

### Shared Game Components

- **`GameShell`** — Wrapper providing progress bar, timer, quit button for all games
- **`CardDisplay`** — Renders bridge hands in text or graphic mode
- **`Layout`** — Sidebar nav (desktop) / hamburger menu (mobile)
