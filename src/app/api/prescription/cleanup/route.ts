import { del, list } from '@vercel/blob';
import { handleSchedule } from '@vercel/schedules';
import { PRESCRIPTION_KEEP_DAYS } from '@/lib/security';

/*
 * Deletes stored prescriptions once they are PRESCRIPTION_KEEP_DAYS old.
 *
 * This is a private Vercel Schedules function (see "functions" and "schedules" in vercel.json):
 * it has no public address and only Vercel's scheduler can run it, once a day at 03:00 India time.
 * There is therefore no secret to check. Running it twice is harmless: a second run finds nothing
 * old left to delete. A failed run is not retried; the next day's run picks up what was missed.
 * Only files under prescriptions/ are ever touched.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PREFIX = 'prescriptions/';

export const POST = handleSchedule(async (run) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log(`[prescription] cleanup ${run.executionId}: no prescription storage is connected, nothing to do`);
    return;
  }
  const cutoff = Date.now() - PRESCRIPTION_KEEP_DAYS * 86400 * 1000;
  let checked = 0;
  let deleted = 0;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 500 });
    checked += page.blobs.length;
    const old = page.blobs.filter((b) => b.pathname.startsWith(PREFIX) && new Date(b.uploadedAt).getTime() < cutoff).map((b) => b.url);
    if (old.length) { await del(old); deleted += old.length; }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  console.log(`[prescription] cleanup ${run.executionId}: ${deleted} of ${checked} files deleted (older than ${PRESCRIPTION_KEEP_DAYS} days)`);
});
