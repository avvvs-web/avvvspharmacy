import { NextResponse, type NextRequest } from 'next/server';
import { exchangeCode, verifyIdToken } from '@/lib/shopify/customer';
import { FLAG_COOKIE, OAUTH_COOKIE, SESSION_COOKIE, seal, unseal } from '@/lib/session';
import { safeBack } from '@/lib/security';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const saved = await unseal<{ state: string; nonce?: string; verifier: string; back: string }>(req.cookies.get(OAUTH_COOKIE)?.value);
  // the account page shows a fixed message for each code; no text from the address is ever displayed
  const fail = (code: 'cancelled' | 'expired' | 'failed') => NextResponse.redirect(new URL(`/account?error=${code}`, req.url));
  if (p.get('error')) return fail('cancelled');
  if (!saved || !p.get('code') || p.get('state') !== saved.state) return fail('expired');
  try {
    const session = await exchangeCode(p.get('code')!, saved.verifier);
    // Shopify's signature, issuer, audience, expiry and nonce on the identity token
    try { await verifyIdToken(session.idToken, saved.nonce); } catch (e) {
      console.error('[account] identity token refused:', e instanceof Error ? e.message : e);
      return fail('failed');
    }
    const res = NextResponse.redirect(new URL(safeBack(saved.back), req.url));
    res.cookies.set(SESSION_COOKIE, await seal(session), { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
    res.cookies.set(FLAG_COOKIE, '1', { sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
    res.cookies.delete({ name: OAUTH_COOKIE, path: '/account' });
    return res;
  } catch (e) {
    console.error('[account] code exchange failed', e instanceof Error ? e.message : e);
    return fail('failed');
  }
}
