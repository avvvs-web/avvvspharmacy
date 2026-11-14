'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export type ShowcaseItem = { handle: string; name: string; form: string; price: string; image: string };

/**
 * The hero's showcase of AVVVS's proprietary medicines: one medicine stands large in the arched
 * niche, and the list beside it picks which. Every item is a real link to its product page, so it
 * works without JavaScript; with it, pointing at or focusing a row brings that medicine forward.
 */
export function HeroShowcase({ items }: { items: ShowcaseItem[] }) {
  const [sel, setSel] = useState(0);
  const lead = items[sel] ?? items[0];
  if (!lead) return null;
  return (
    <figure className="showcase" data-anim>
      <Link className="showcase-lead" href={`/products/${lead.handle}`} aria-label={`${lead.name}, ${lead.price}`}>
        <span className="niche">
          <Image key={lead.handle} src={lead.image} alt="" fill sizes="(max-width: 960px) 70vw, 380px" priority={sel === 0} />
        </span>
      </Link>
      <div className="showcase-side">
        <ul className="showcase-list">
          {items.map((it, i) => (
            <li key={it.handle}>
              <Link href={`/products/${it.handle}`} aria-current={i === sel ? 'true' : undefined}
                onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)}>
                <span className="showcase-thumb"><Image src={it.image} alt="" width={64} height={64} /></span>
                <span className="showcase-text"><b>{it.name}</b><small>{it.form}</small></span>
                <span className="showcase-price">{it.price}</span>
              </Link>
            </li>
          ))}
        </ul>
        <figcaption>Proprietary medicines, developed by AVVVS. <Link href="/collections/proprietary">See all proprietary</Link></figcaption>
      </div>
    </figure>
  );
}
