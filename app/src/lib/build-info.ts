/**
 * Release stamp for this app.
 *
 * Bumped with every shipped change so the public `/api/status` endpoint and the
 * `X-App-Version` / `X-App-Build` response headers can report what is live.
 *
 * `deployed_at` is written when the change is pushed; the platform deploy
 * follows within a minute or two. A monitor can detect "live is behind the
 * repo" by comparing this stamp with the head commit time of the repo.
 */
export const BUILD_INFO = {
  app: 'umeet-family',
  kind: 'worker',
  environment: 'production',
  version: '2026.10.17.1',
  deployed_at: '2026-10-17T20:40:00Z',
  homepage: 'https://umeet-family.higgsfield.app',
  repo: 'https://github.com/zheke01/umeet-family',
} as const
