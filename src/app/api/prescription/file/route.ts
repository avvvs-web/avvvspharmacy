import { NextResponse, type NextRequest } from 'next/server';
import { get } from '@vercel/blob';
import { readPrescriptionLink } from '@/lib/security';

/*
 * Opens one stored prescription. The file is private in Vercel Blob; this route is the only way
 * to it, and it answers only to a link this store signed that has not expired or been altered.
 * The pharmacy opens that link from the order in Shopify.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const gone = () => new NextResponse('This prescription link is not valid or has expired.', { status: 404, headers: { 'Cache-Control': 'no-store' } });

export async function GET(req: NextRequest) {
  const pathname = readPrescriptionLink(req.nextUrl);
  if (!pathname || !process.env.BLOB_READ_WRITE_TOKEN) return gone();
  try {
    const r = await get(pathname, { access: 'private' });
    if (!r || r.statusCode !== 200) return gone();
    return new NextResponse(r.stream, {
      headers: {
        'Content-Type': r.blob.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="prescription.${pathname.split('.').pop()}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex',
        // the file is shown, never run: no scripts, no access to the store's cookies
        'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch (e) {
    console.error('[prescription] read failed', e instanceof Error ? e.message : e);
    return gone();
  }
}
