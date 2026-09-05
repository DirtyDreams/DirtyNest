# DirtyNest frontend context

DirtyNest is a frontend-only cyberpunk command center built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, and client-side browser storage.

## Current architecture

- `src/app/page.tsx` is the single-page shell and deck router.
- `src/components/views/` contains the interactive workspaces.
- `src/stores/` contains client state for navigation, personas, and session behavior.
- `src/lib/hermes/` contains local simulated agent/session state used by the Chatbot and Control Room decks.
- `src/lib/theme.ts`, `src/lib/widgetLayout.ts`, `src/lib/cyberAudio.ts`, and `src/lib/cyberSpeech.ts` provide frontend utilities.
- Settings, API keys, logs, and simulated agent data use browser `localStorage` where persistence is needed.

## Frontend-only behavior

The former Next API routes, database layer, Python sidecar, Docker orchestration, vector services, auth server, social adapters, and Zbiornik backend have been removed.

Decks that previously contacted those services now use bundled demo fixtures or local in-memory/browser state. They remain useful for UI development and interaction testing, but they do not perform remote operations.

## Development

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```
