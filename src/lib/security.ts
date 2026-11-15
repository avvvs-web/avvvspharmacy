import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { SITE_URL } from './site';

/*
 * Small security helpers shared by the route handlers and server actions:
 * where a visitor may be sent after sign-in, whether a request came from the store itself,
 * signed links to private prescription files, and safe values for logs.
 */

/**
 * The page to return to after sign-in. Only a path on this store is accepted: one leading slash,
 * never "//host" or "/\host" (both of which a browser reads as another website).
 */
export function safeBack(next: string | null | undefined, fallback = '/account'): string {
  if (!next || !/^\/(?![/\\])[^\s\\]*$/.test(next) || /[\u0000-\u001f]/.test(next)) return fallback;
  try {
    const u = new URL(next, SITE_URL);
    if (u.origin !== new URL(SITE_URL).origin) return fallback;
    return `${u.pathname}${u.search}${u.hash}`;
  } catch { return fallback; }
}

/** True when a state-changing request was sent by a page of this store (not by another website). */
export function sameOrigin(req: NextRequest): boolean {
  const from = req.headers.get('origin') || req.headers.get('referer');
  if (!from) return false;
  try {
    const host = new URL(from).host;
    return host === req.nextUrl.host || host === req.headers.get('host') || host === new URL(SITE_URL).host;
  } catch { return false; }
}

/** Compares two secrets without leaking, through timing, how much of them matched. */
export function sameSecret(a: string, b: string): boolean {
  const x = createHash('sha256').update(a).digest();
  const y = createHash('sha256').update(b).digest();
  return timingSafeEqual(x, y);
}

/** A short, stable stand-in for a value that must not appear in logs (a cart ID is a key to that cart). */
export const logId = (v: string | undefined | null) => (v ? createHash('sha256').update(v).digest('hex').slice(0, 12) : undefined);

/** The visitor's address as the platform reports it (Vercel sets x-forwarded-for itself). */
export const clientIp = (req: NextRequest) =>
  req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';

/* ---------------- signed links to private prescription files ---------------- */

const PRESCRIPTION_PATH = /^prescriptions\/\d{4}-\d{2}\/[A-Za-z0-9._-]{8,200}$/;
/** How long a prescription link on an order keeps working. */
export const PRESCRIPTION_LINK_DAYS = 60;

function linkKey(): string | null {
  const s = process.env.PRESCRIPTION_LINK_SECRET || process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}
export const PRESCRIPTION_LINKS_READY = () => !!linkKey();

const sign = (pathname: string, exp: number, key: string) =>
  createHmac('sha256', key).update(`rx:${pathname}:${exp}`).digest('base64url');

/** A link to one stored prescription that stops working after PRESCRIPTION_LINK_DAYS. */
export function prescriptionLink(pathname: string): string {
  const key = linkKey();
  if (!key) throw new Error('No secret set for prescription links');
  const exp = Math.floor(Date.now() / 1000) + PRESCRIPTION_LINK_DAYS * 86400;
  return `${SITE_URL}/api/prescription/file?p=${encodeURIComponent(pathname)}&e=${exp}&s=${sign(pathname, exp, key)}`;
}

/** The stored file a link points at, or null if the link is not one of ours, was altered, or has expired. */
export function readPrescriptionLink(url: string | URL): string | null {
  const key = linkKey();
  if (!key) return null;
  let u: URL;
  try { u = typeof url === 'string' ? new URL(url) : url; } catch { return null; }
  if (u.pathname !== '/api/prescription/file') return null;
  const p = u.searchParams.get('p') ?? '';
  const exp = Number(u.searchParams.get('e'));
  const sig = u.searchParams.get('s') ?? '';
  if (!PRESCRIPTION_PATH.test(p) || !Number.isInteger(exp) || exp * 1000 < Date.now()) return null;
  return sameSecret(sig, sign(p, exp, key)) ? p : null;
}

/** True for a prescription link this store issued and that is still valid (used before saving it on a cart). */
export function isOwnPrescriptionLink(url: string): boolean {
  try {
    const u = new URL(url);
    return u.origin === new URL(SITE_URL).origin && readPrescriptionLink(u) !== null;
  } catch { return false; }
}
