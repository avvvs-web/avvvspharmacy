import 'server-only';
import sanitizeHtml from 'sanitize-html';

/*
 * Text written in Shopify (product descriptions, pages such as Shipping and FAQs) arrives as HTML.
 * Before it is shown, everything except plain formatting is removed: no scripts, no event
 * handlers, no styles, no frames, and links only to web, mail and phone addresses.
 */
export function cleanHtml(html: string | null | undefined): string {
  return sanitizeHtml(html ?? '', {
    allowedTags: ['p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'small', 'span', 'div', 'blockquote',
      'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'h5', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption'],
    allowedAttributes: {
      a: ['href', 'title', 'rel', 'target'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    transformTags: {
      // links open safely and cannot reach back into the store's window
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: 'noopener noreferrer nofollow' } }),
      // headings inside body text never outrank the page's own
      h1: 'h2',
    },
  });
}
