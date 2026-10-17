import { createFileRoute } from '@tanstack/react-router'

import { bindings } from '../lib/bindings.server'
import { BUILD_INFO } from '../lib/build-info'

type CheckState = 'ok' | 'error' | 'unconfigured'

async function checkDatabase(): Promise<{ state: CheckState; latency_ms: number | null }> {
  const db = bindings().DB
  if (!db) return { state: 'unconfigured', latency_ms: null }

  const started = Date.now()
  try {
    await db.prepare('SELECT 1').first()
    return { state: 'ok', latency_ms: Date.now() - started }
  } catch (error) {
    console.error('status: database check failed', error)
    return { state: 'error', latency_ms: Date.now() - started }
  }
}

/**
 * Machine-readable status for monitoring dashboards.
 *
 * 200 with `status: "ok"` when every check passes, 503 with `status: "degraded"`
 * otherwise. Reports only non-secret release facts — no env values, no tokens.
 */
export const Route = createFileRoute('/api/status')({
  server: {
    handlers: {
      GET: async () => {
        const database = await checkDatabase()
        const healthy = database.state === 'ok' || database.state === 'unconfigured'

        const payload = {
          ...BUILD_INFO,
          status: healthy ? 'ok' : 'degraded',
          checked_at: new Date().toISOString(),
          checks: { http: 'ok', database: database.state },
          latency_ms: { database: database.latency_ms },
        }

        return new Response(`${JSON.stringify(payload, null, 2)}\n`, {
          status: healthy ? 200 : 503,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-App-Version': BUILD_INFO.version,
            'X-App-Build': BUILD_INFO.deployed_at,
          },
        })
      },
    },
  },
})
