# Umeet Family

Shared moods, a pet or plant you raise together, and little notes of love for kids and parents who live apart.

**Live app:** https://umeet-family.higgsfield.app

## What's inside

- `app/` — the web app (React 19 + TanStack Start, server-rendered, served from a Cloudflare Worker)
  - `src/routes/` — the screens: landing page, the app, and the shared family space (`family.$key`)
  - `src/components/`, `src/layouts/` — the UI building blocks
  - `src/assets/`, `public/` — artwork, icons and the garden render pair
  - `src/app-meta.json` — title, description, favicon and social preview
  - `migrations/` — database schema
- `refs/` — the design boards and source artwork behind the UI

## Running it locally

Requires Bun and Node:

```
cd app
bun install
bun run dev
```

Note: this export contains the app's own source. The Higgsfield platform packages the app is built against are not included, so a fresh `bun install` will not resolve those three dependencies — read this repo as the source of record for the app rather than a standalone build.

## Deploys

The live app is built and deployed on the Higgsfield platform. This repository is a snapshot of its source.
