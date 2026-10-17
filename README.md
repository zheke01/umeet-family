# Umeet Family

Shared moods, a pet or plant you raise together, and little notes of love for kids and parents who live apart.

**Live app:** https://umeet-family.higgsfield.app

## What's inside

- `app/` — the web app (React 19 + TanStack Start, server-rendered, served from a Cloudflare Worker)
  - `src/routes/` — the screens: landing page, the app, the shared family space (`family.$key`), plus the status endpoint
  - `src/components/`, `src/layouts/` — the UI building blocks
  - `src/assets/`, `public/` — artwork, icons and the garden render pair
  - `src/app-meta.json` — title, description, favicon and social preview
  - `src/lib/build-info.ts` — the release stamp (version + deployment timestamp)
  - `migrations/` — database schema
- `refs/` — the design boards and source artwork behind the UI
- `project-status.json` — static project facts for monitoring dashboards

## Status endpoint

`GET /api/status` returns the machine-readable state of the deployment:

```json
{
  "app": "umeet-family",
  "kind": "worker",
  "environment": "production",
  "version": "2026.10.17.1",
  "deployed_at": "2026-10-17T20:40:00Z",
  "homepage": "https://umeet-family.higgsfield.app",
  "repo": "https://github.com/zheke01/umeet-family",
  "status": "ok",
  "checked_at": "2026-10-17T20:45:12.000Z",
  "checks": { "http": "ok", "database": "ok" },
  "latency_ms": { "database": 3 }
}
```

- `200` with `status: "ok"` when every check passes, `503` with `status: "degraded"` otherwise.
- Every response also carries `X-App-Version` and `X-App-Build` headers, so a plain `HEAD /` identifies the live release.
- `version` and `deployed_at` come from `app/src/lib/build-info.ts` and are stamped at push time.
- A monitor can detect "live is behind the repo" by comparing `deployed_at` with the head commit time of `main`.

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
