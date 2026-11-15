import { NextResponse } from 'next/server';
import { storefront } from '@/lib/shopify/client';

// For uptime monitors: is the store up, and can it reach Shopify? Answers only yes or no and a
// time; the shop's name, token status and any error detail stay in the server log.
export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  try {
    await storefront<{ shop: { name: string } }>('query Health { shop { name } }', {}, { revalidate: false });
    return NextResponse.json({ ok: true, ms: Date.now() - started }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[health]', e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, ms: Date.now() - started }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
