import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { overLimit } from '@/lib/ratelimit';
import { sameSecret } from '@/lib/security';

export const runtime = 'nodejs';

// Shopify webhooks (products/collections create, update, delete) refresh the cached catalogue.
// Point them at /api/revalidate. A call is accepted when either:
//  - it carries Shopify's signature (X-Shopify-Hmac-Sha256) made with SHOPIFY_WEBHOOK_SECRET, the
//    signing secret shown under Settings → Notifications → Webhooks; or
//  - it carries SHOPIFY_REVALIDATE_SECRET (for manual refreshes), in the X-Revalidate-Secret header
//    or, as before, in ?secret=<…>.
// Signed calls older than an hour (by X-Shopify-Triggered-At) are refused as replays.

function signedByShopify(raw: string, header: string | null): boolean {
  const key = process.env.SHOPIFY_WEBHOOK_SECRET?.trim();
  if (!key || !header) return false;
  const expected = createHmac('sha256', key).update(raw, 'utf8').digest();
  const given = Buffer.from(header, 'base64');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** How long after Shopify triggers a webhook it is still accepted; older (replayed) calls are refused. */
const MAX_AGE_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.SHOPIFY_REVALIDATE_SECRET;
  // a manual refresh may send the secret in the X-Revalidate-Secret header (kept out of request logs)
  // or, as before, in ?secret=; either way it is compared in constant time
  const given = req.headers.get('x-revalidate-secret') ?? req.nextUrl.searchParams.get('secret');
  const byHand = !!secret && secret.length >= 16 && !!given && sameSecret(given, secret);
  const bySignature = !byHand && signedByShopify(raw, req.headers.get('x-shopify-hmac-sha256'));
  if (!byHand && !bySignature) return NextResponse.json({ ok: false }, { status: 401 });
  if (bySignature) {
    // a captured webhook replayed later is refused; Shopify's own retries within the hour still pass
    const at = Date.parse(req.headers.get('x-shopify-triggered-at') ?? '');
    if (!Number.isFinite(at) || Math.abs(Date.now() - at) > MAX_AGE_MS) return NextResponse.json({ ok: false, error: 'stale' }, { status: 401 });
  }
  if (await overLimit('revalidate', 120, 60)) return NextResponse.json({ ok: false, error: 'busy' }, { status: 429 });
  const topic = req.headers.get('x-shopify-topic') || '';
  let body: { handle?: string } = {};
  try { body = JSON.parse(raw || '{}'); } catch { /* an empty or non-JSON body still refreshes the lists */ }
  if (topic.startsWith('products')) { revalidateTag('products'); if (body.handle) revalidateTag(`product:${body.handle}`); }
  else if (topic.startsWith('collections')) { revalidateTag('collections'); if (body.handle) revalidateTag(`collection:${body.handle}`); }
  else revalidateTag('shopify');
  return NextResponse.json({ ok: true, topic });
}
