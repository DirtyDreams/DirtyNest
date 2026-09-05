# DirtyNest

Frontend-only cyberpunk command center UI built with Next.js 16, React 19, TypeScript, and Tailwind v4.

## What remains in this repo

- SPA shell in `src/app/page.tsx`
- deck views in `src/components/views/`
- client-side Zustand stores in `src/stores/`
- frontend utilities in `src/lib/`
- local browser persistence for settings, API keys, logs, and simulated agent state

Backend code, API routes, database layers, sidecar services, and backend infrastructure files have been removed.

## Development

### Tryb deweloperski (bez Dockera)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Notes

- Some decks still contain mock/demo datasets by design.
- Agent, Docker, knowledge, social, and Zbiornik flows now run in frontend-only fallback mode.
- API-key settings are stored locally in browser storage.
