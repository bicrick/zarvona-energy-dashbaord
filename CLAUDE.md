# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Oil Well Dashboard for Zarvona Energy - tracks oil well production, battery performance, and equipment metrics. Vanilla JavaScript (ES6), Vite, Firebase.

## Development Workflow

Create worktrees from `firebase` branch (main development branch):
```bash
git worktree add ../oil-well-app-feature firebase -b feature/name
cd ../oil-well-app-feature && npm install
# Make changes, then after verification:
cd /path/to/oil-well-app && git checkout firebase
git merge feature/name && git worktree remove ../oil-well-app-feature
```

## Commands

```bash
npm run dev              # Dev server (localhost:5173)
npm run build            # Production build
npm run deploy           # Firebase deploy (hosting + rules)
npm run deploy:hosting   # Hosting only
```

No test suite or linting.

## Architecture

**Data Flow:** Excel Upload → Parser → Firestore → UI (cached in `appState`)

**Key Files:**
- `src/main.js` - Entry point
- `src/config.js` - Global `appState` object & gauge sheet definitions
- `src/auth.js` / `firebase.js` - Firebase auth (email + Microsoft OAuth)
- `src/firestore-storage.js` - Firestore CRUD
- `src/views.js` / `dashboard.js` - UI rendering & navigation
- `src/upload.js` - Excel parsing orchestration
- `src/parsers/` - 9 site-specific Excel parsers
- `src/charts/` - Chart.js visualizations
- `src/data-aggregation.js` - Cross-well statistics

**State:** Global `appState` object in `src/config.js` (no Redux/Vuex)

**Firestore:** `/gaugeSheets/{id}/wells/{id}/production|wellTests`, `/batteryProduction`, `/runTickets`

## Adding New Gauge Sheet Site

1. Create `src/parsers/newsite.js`
2. Register in `src/parsers/index.js`
3. Add to `GAUGE_SHEETS` in `src/config.js`
4. Add sample to `/sheets/`

## Tech Stack

Vite, Firebase (Auth/Firestore/Hosting), Chart.js (CDN), SheetJS/XLSX (CDN), CSS (`styles.css` with `[data-theme]` selectors)
