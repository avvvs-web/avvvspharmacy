/*
 * How next/image fetches pictures on this store (next.config.ts → images.loaderFile).
 *
 * Product photographs come straight from Shopify's image service, already cut to the product
 * (see ./image.ts) and scaled to the size the slot needs. Shopify picks WebP or AVIF for the
 * browser and caches each size worldwide for a year. Going through the store's own /_next/image
 * route instead meant a second hop and a slow first view of every size.
 *
 * Anything that is not a Shopify photograph (the logo, local files) is returned unchanged.
 */
type Args = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width }: Args): string {
  if (!src.startsWith('https://cdn.shopify.com/')) return src;
  let u: URL;
  try { u = new URL(src); } catch { return src; }
  // A tall product (a bottle) in a square slot is limited by its height, not its width: asking for
  // the slot's full width would fetch a picture about twice as large as is ever shown. So a tall
  // crop is asked for at the width that makes its HEIGHT match the slot. (Shopify applies `width`
  // to the cropped region; `height` it applies to the whole photograph, so it is not used.)
  const cw = Number(u.searchParams.get('crop_width'));
  const ch = Number(u.searchParams.get('crop_height'));
  const w = cw > 0 && ch > cw ? Math.max(16, Math.round((width * cw) / ch)) : width;
  u.searchParams.delete('height');
  u.searchParams.set('width', String(w));
  return u.toString();
}
