import 'server-only';
import { neon } from '@neondatabase/serverless';

/*
 * A small rate limit. With DATABASE_URL set, the count lives in Postgres, so every server instance
 * shares it. Without a database it falls back to a per-instance count, which is weaker (each
 * instance counts on its own) but still stops a simple loop.
 */

const memory = new Map<string, number[]>();
let tableReady: Promise<unknown> | null = null;

function limitInMemory(key: string, max: number, windowSec: number): boolean {
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowSec * 1000);
  hits.push(now);
  memory.set(key, hits);
  // keep the map from growing without bound
  if (memory.size > 5000) for (const k of [...memory.keys()].slice(0, 1000)) memory.delete(k);
  return hits.length > max;
}

/** Records one use of `key` and says whether it is now over `max` uses in the last `windowSec` seconds. */
export async function overLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return limitInMemory(key, max, windowSec);
  try {
    const sql = neon(url);
    tableReady ??= sql`CREATE TABLE IF NOT EXISTS rate_hits (key text NOT NULL, at timestamptz NOT NULL DEFAULT now())`
      .then(() => sql`CREATE INDEX IF NOT EXISTS rate_hits_key_at ON rate_hits (key, at)`);
    await tableReady;
    await sql`INSERT INTO rate_hits (key) VALUES (${key})`;
    const rows = await sql`SELECT count(*)::int AS n FROM rate_hits WHERE key = ${key} AND at > now() - make_interval(secs => ${windowSec})` as { n: number }[];
    // tidy up old rows now and then
    if (Math.random() < 0.02) await sql`DELETE FROM rate_hits WHERE at < now() - interval '2 days'`;
    return (rows[0]?.n ?? 0) > max;
  } catch (e) {
    tableReady = null;
    console.error('[ratelimit] falling back to memory', e instanceof Error ? e.message : e);
    return limitInMemory(key, max, windowSec);
  }
}
