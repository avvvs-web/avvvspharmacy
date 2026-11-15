import { NextResponse, type NextRequest } from 'next/server';
import { CLIENT_ID, exchangeCode } from '@/lib/shopify/customer';
import { FLAG_COOKIE, OAUTH_COOKIE, SESSION_COOKIE, seal, unseal } from '@/lib/session';
import { safeBack } from '@/lib/security';

/**
 * The claims inside the identity token. The token arrives straight from Shopify's token endpoint
 * over TLS in exchange for our one-time code and PKCE verifier, which is what vouches for it
 * (OpenID Connect Core 3.1.3.7); here we check it was issued for this sign-in and this store.
 */
function claims(idToken?: string): { nonce?: string; aud?: string | string[]; exp?: number } | null {
  try { return idToken ? JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8')) : null; } catch { return null; }
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const saved = await unseal<{ state: string; nonce?: string; verifier: string; back: string }>(req.cookies.get(OAUTH_COOKIE)?.value);
  // the account page shows a fixed message for each code; no text from the address is ever displayed
  const fail = (code: 'cancelled' | 'expired' | 'failed') => NextResponse.redirect(new URL(`/account?error=${code}`, req.url));
  if (p.get('error')) return fail('cancelled');
  if (!saved || !p.get('code') || p.get('state') !== saved.state) return fail('expired');
  try {
    const session = await exchangeCode(p.get('code')!, saved.verifier);
    const c = claims(session.idToken);
    if (c) {
      const aud = c.aud === undefined ? null : Array.isArray(c.aud) ? c.aud : [c.aud];
      if ((c.nonce !== undefined && c.nonce !== saved.nonce) || (aud && !aud.includes(CLIENT_ID)) || (c.exp !== undefined && c.exp * 1000 < Date.now())) {
        console.error('[account] identity token did not match this sign-in');
        return fail('failed');
      }
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
