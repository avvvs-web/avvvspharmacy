import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getPage, getPolicy } from '@/lib/shopify/catalog';
import { safe } from '@/lib/shopify/client';
import { breadcrumbLd } from '@/lib/site';
import { dateIN, stripHtml } from '@/lib/format';
import { Crumbs } from '@/components/Crumbs';
import { JsonLd } from '@/components/JsonLd';
import { cleanHtml } from '@/lib/html';
import { LEGAL_CONTENT } from '@/content/legal';

// The store's own legal and help pages first (src/content/legal.tsx), then Shopify Pages, then Shopify's policies.
type Props = { params: Promise<{ handle: string }> };
export const revalidate = 3600;

type Loaded = { title: string; updatedAt: string | null; description?: string; body: ReactNode };

async function load(handle: string): Promise<Loaded | null> {
  const own = Object.hasOwn(LEGAL_CONTENT, handle) ? LEGAL_CONTENT[handle] : null;
  if (own) return own;
  const html = (body: string) => <div className="rte" dangerouslySetInnerHTML={{ __html: cleanHtml(body) }} />;
  const page = await safe(getPage(handle), null);
  if (page) return { title: page.title, body: html(page.body), updatedAt: page.updatedAt, description: page.seo.description || page.bodySummary };
  const policy = await safe(getPolicy(handle), null);
  if (policy) return { title: policy.title, body: html(policy.body), updatedAt: null, description: stripHtml(policy.body).slice(0, 155) };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const p = await load(handle);
  if (!p) return { title: 'Not found' };
  return { title: p.title, description: p.description?.slice(0, 160), alternates: { canonical: `/pages/${handle}` } };
}

export default async function ContentPage({ params }: Props) {
  const { handle } = await params;
  const p = await load(handle);
  if (!p) notFound();
  const own = Object.hasOwn(LEGAL_CONTENT, handle);
  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: p.title }]} />
        <h1>{p.title}</h1>
        {p.updatedAt && <p className="fine">Last updated {dateIN(p.updatedAt)}</p>}
      </header>
      <article className="prose">{own ? <div className="rte legal">{p.body}</div> : p.body}</article>
      <JsonLd data={breadcrumbLd([{ name: p.title, path: `/pages/${handle}` }])} />
    </div>
  );
}
