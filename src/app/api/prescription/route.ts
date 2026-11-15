import { NextResponse, type NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { CART_COOKIE } from '@/lib/session';
import { overLimit } from '@/lib/ratelimit';
import { PRESCRIPTION_LINKS_READY, clientIp, prescriptionLink, sameOrigin } from '@/lib/security';

/*
 * Receives an optional prescription for the cart.
 *  - Only a page of this store, with a cart, may upload (no anonymous file hosting).
 *  - Type is read from the file's own first bytes, and size is capped.
 *  - The file is stored PRIVATELY in Vercel Blob. What goes on the order is a signed link through
 *    this store (/api/prescription/file) that stops working after 30 days; the storage address
 *    itself is never shown to anyone.
 *  - The file itself is deleted after 30 days by /api/prescription/cleanup (a daily Vercel Cron job).
 */
export const runtime = 'nodejs';

const TYPES: Record<string, string> = {
  'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic',
};
// Vercel refuses request bodies above about 4.5 MB, so the limit stays safely under that.
const MAX = 4 * 1024 * 1024;

function sniff(b: Uint8Array): string | null {
  const s = (i: number, ...x: number[]) => x.every((v, k) => b[i + k] === v);
  if (s(0, 0x25, 0x50, 0x44, 0x46)) return 'application/pdf';
  if (s(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (s(0, 0x89, 0x50, 0x4e, 0x47)) return 'image/png';
  if (s(0, 0x52, 0x49, 0x46, 0x46) && s(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  // ISO media: accept only the HEIC/HEIF brands, not video
  if (s(4, 0x66, 0x74, 0x79, 0x70)) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (['heic', 'heix', 'hevc', 'mif1', 'msf1', 'heif'].includes(brand)) return 'image/heic';
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'This upload did not come from the store.' }, { status: 403 });
  const cart = req.cookies.get(CART_COOKIE)?.value;
  if (!cart) return NextResponse.json({ error: 'Add a medicine to your cart first, then attach the prescription.' }, { status: 400 });
  if (await overLimit(`rx:ip:${clientIp(req)}`, 10, 3600) || await overLimit(`rx:cart:${cart}`, 6, 3600)) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN || !PRESCRIPTION_LINKS_READY()) {
    return NextResponse.json({ error: 'Prescription upload is not switched on yet. Please email it to mail@avvvs.com with your order number.' }, { status: 503 });
  }
  if (Number(req.headers.get('content-length') ?? 0) > MAX + 64 * 1024) return NextResponse.json({ error: 'That file is larger than 4 MB.' }, { status: 413 });
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'That file is larger than 4 MB.' }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type || !TYPES[type]) return NextResponse.json({ error: 'Please upload a PDF or a photo (JPG, PNG or HEIC).' }, { status: 415 });

  const name = `prescriptions/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${TYPES[type]}`;
  try {
    const blob = await put(name, Buffer.from(bytes), { access: 'private', contentType: type, addRandomSuffix: true });
    return NextResponse.json({ url: prescriptionLink(blob.pathname) });
  } catch (e) {
    console.error('[prescription] upload failed', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
