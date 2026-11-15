import { NextResponse, type NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { mailPharmacy } from '@/lib/mail';
import { getProduct } from '@/lib/shopify/catalog';
import { medicineName } from '@/content/medicines';
import { overLimit } from '@/lib/ratelimit';
import { clientIp, sameOrigin } from '@/lib/security';

// "Tell me when it's back": stores the request (Neon, if DATABASE_URL is set) and tells the pharmacy.
// Only a page of this store may call it, a visitor and an address are each limited, and the
// medicine's name comes from the catalogue, never from the request.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'This request did not come from the store.' }, { status: 403 });
  const body = await req.json().catch(() => ({})) as { email?: string; handle?: string; hp?: string };
  if (body.hp) return NextResponse.json({ ok: true }); // honeypot
  const email = String(body.email ?? '').trim().toLowerCase();
  const handle = String(body.handle ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  if (!/^[a-z0-9-]{1,120}$/.test(handle)) return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });

  if (await overLimit(`notify:ip:${clientIp(req)}`, 5, 3600) || await overLimit(`notify:email:${email}`, 5, 86400)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later, or call or WhatsApp us.' }, { status: 429 });
  }
  const product = await getProduct(handle).catch(() => null);
  if (!product) return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  const title = medicineName(product.handle, product.title);

  let stored = false;
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`CREATE TABLE IF NOT EXISTS stock_alerts (id serial PRIMARY KEY, email text NOT NULL, handle text NOT NULL, title text, created_at timestamptz DEFAULT now(), notified_at timestamptz, UNIQUE (email, handle))`;
      await sql`INSERT INTO stock_alerts (email, handle, title) VALUES (${email}, ${handle}, ${title}) ON CONFLICT (email, handle) DO NOTHING`;
      stored = true;
    } catch (e) { console.error('[notify] db', e instanceof Error ? e.message : e); }
  }
  const mailed = await mailPharmacy(`Back-in-stock request: ${title}`, `${email} would like to know when ${title} is back in stock.\nhttps://shop.avvvs.com/products/${handle}`).catch(() => false);
  if (!stored && !mailed) return NextResponse.json({ error: 'Alerts are not switched on yet. Please call or WhatsApp us.' }, { status: 503 });
  return NextResponse.json({ ok: true });
}
