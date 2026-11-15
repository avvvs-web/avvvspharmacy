import { NextResponse, type NextRequest } from 'next/server';
import { del, list } from '@vercel/blob';
import { PRESCRIPTION_KEEP_DAYS, sameSecret } from '@/lib/security';

/*
 * Deletes stored prescriptions once they are PRESCRIPTION_KEEP_DAYS old. Vercel Cron calls this
 * once a day (see "crons" in vercel.json) and sends "Authorization: Bearer <CRON_SECRET>".
 * Without CRON_SECRET set, or with the wrong one, nothing is listed or deleted.
 * Only files under prescriptions/ are ever touched.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PREFIX = 'prescriptions/';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const sent = req.headers.get('authorization') ?? '';
  if (!secret || secret.length < 16 || !sameSecret(sent, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ ok: true, deleted: 0, note: 'No prescription storage is connected.' });

  const cutoff = Date.now() - PRESCRIPTION_KEEP_DAYS * 86400 * 1000;
  let checked = 0;
  let deleted = 0;
  let cursor: string | undefined;
  try {
    do {
      const page = await list({ prefix: PREFIX, cursor, limit: 500 });
      checked += page.blobs.length;
      const old = page.blobs.filter((b) => b.pathname.startsWith(PREFIX) && new Date(b.uploadedAt).getTime() < cutoff).map((b) => b.url);
      if (old.length) { await del(old); deleted += old.length; }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } catch (e) {
    console.error('[prescription] cleanup failed', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Cleanup failed part way.', checked, deleted }, { status: 500 });
  }
  console.log(`[prescription] cleanup: ${deleted} of ${checked} files deleted (older than ${PRESCRIPTION_KEEP_DAYS} days)`);
  return NextResponse.json({ ok: true, checked, deleted, keepDays: PRESCRIPTION_KEEP_DAYS }, { headers: { 'Cache-Control': 'no-store' } });
}
