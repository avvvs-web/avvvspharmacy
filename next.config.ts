import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

/*
 * Content Security Policy: what a page of the store may load and where it may send data.
 *  - Scripts: the store's own, plus Google Analytics and the Meta pixel (both run only after consent).
 *    'unsafe-inline' is needed because Next.js writes small inline scripts into every page; a
 *    stricter per-request nonce would stop pages being served from cache.
 *  - Nothing may be embedded from elsewhere, plugins are off, and the store cannot be framed by
 *    another site.
 * It is not sent by the dev server, which needs looser rules for hot reload.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.shopify.com https://www.googletagmanager.com https://*.google-analytics.com https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  // forms post to the store; sign-out then hands over to Shopify's sign-in service
  "form-action 'self' https://shopify.com https://*.shopify.com https://*.myshopify.com https://*.avvvs.com",
  "frame-ancestors 'self'",
].join('; ');

// Same split as web/: the dev server writes to .next-dev so a build can't swap its chunks.
export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    reactStrictMode: true,
    poweredByHeader: false,
    images: {
      // photographs load straight from Shopify's image service at the size each slot needs
      loader: 'custom',
      loaderFile: './src/lib/shopify/imageLoader.ts',
      remotePatterns: [
        { protocol: 'https', hostname: 'cdn.shopify.com' },
      ],
    },
    // server actions carry small JSON; the prescription upload has its own route and its own limit
    experimental: { serverActions: { bodySizeLimit: '1mb' } },
    distDir: dev ? '.next-dev' : '.next',
    async headers() {
      if (dev) return [];
      return [{ source: '/((?!api/prescription/file).*)', headers: [{ key: 'Content-Security-Policy', value: CSP }] }];
    },
  };
}
