# Repository Guidelines

## Project Overview

Bridge Trainer is a web application for learning and practicing contract bridge conventions. It features interactive training games (opening bids, point counting), a convention reference library, and game history tracking. The frontend is a React SPA; the backend is a minimal Express server that serves the built client and handles client-side routing.

## Project Structure & Module Organization

```
bridge-trainer/
  client/                   # Frontend (Vite + React)
    index.html              # HTML entry point
    public/                 # Static assets
    src/
      App.tsx               # Root component with routing
      main.tsx              # React DOM entry
      index.css             # Global styles (Tailwind)
      components/           # Shared UI components
        ui/                 # shadcn/ui primitives (new-york style)
      pages/                # Route-level page components (Home, GamePage, History, ConventionReference, NotFound)
      games/                # Game modules, each in its own subdirectory
        openingBid/         # Opening bid training game
        pointCounting/      # Point counting training game
      hooks/                # Custom React hooks (useKeyboardShortcuts, useMobile, etc.)
      lib/                  # Core logic & utilities
        bridge.ts           # Bridge domain types and helpers
        conventionData.ts   # Convention definitions
        conventions.ts      # Convention logic
        db.ts               # IndexedDB persistence (via idb)
        gameRegistry.ts     # Game registration system
        utils.ts            # Utility functions (cn, etc.)
      contexts/             # React contexts (ThemeContext)
  server/
    index.ts                # Express server (serves static build + SPA fallback)
  shared/
    const.ts                # Constants shared between client and server
```

- Path aliases: `@/*` maps to `client/src/*`, `@shared/*` maps to `shared/*`.
- UI components use shadcn/ui (new-york style) — add new ones via the shadcn CLI, not manually.

## Build, Test, and Development Commands

| Command        | Description                                       |
| -------------- | ------------------------------------------------- |
| `pnpm dev`     | Start Vite dev server on port 3000 with HMR       |
| `pnpm build`   | Build client (Vite) + server (esbuild) to `dist/` |
| `pnpm start`   | Run production server from `dist/`                |
| `pnpm preview` | Preview production build locally                  |
| `pnpm check`   | TypeScript type checking (`tsc --noEmit`)         |
| `pnpm format`  | Format all files with Prettier                    |

Package manager is **pnpm** (not npm or yarn).

## Coding Style & Naming Conventions

- **Formatting**: Prettier with double quotes, semicolons, 2-space indent, 80 char width, trailing commas (es5), arrow parens avoided.
- **Language**: TypeScript in strict mode. No `any` types.
- **Components**: Function components with default exports for pages, named exports for reusable components.
- **Styling**: Tailwind CSS v4 with `clsx` and `tailwind-merge` (`cn` utility from `@/lib/utils`).
- **State**: React hooks and context. IndexedDB via `idb` for persistence.
- **Routing**: wouter (file-based not used — routes defined in `App.tsx`).
- **Naming**: PascalCase for components and files (`GameSetup.tsx`), camelCase for hooks and utilities (`useMobile.tsx`, `bridge.ts`).

## Testing Guidelines

- Test runner: **Vitest** (configured in `vite.config.ts`).
- Run tests: `pnpm vitest` or `pnpm vitest run`.
- Test files use the `.test.ts` / `.test.tsx` suffix pattern.
- Place test files adjacent to the source they test.

## Architecture Notes

- **Game modules** are self-contained: each game lives in `client/src/games/<name>/` and registers itself via `gameRegistry.ts`. To add a new game, create a subdirectory with an `index.ts` that registers the game definition and a component.
- **Convention data** is centralized in `lib/conventionData.ts` and `lib/conventionReferenceData.ts`.
- The server is intentionally minimal — no API routes, no database. All game state is persisted client-side via IndexedDB.
- The app uses IndexedDB (`lib/db.ts`) for storing game history and progress.
