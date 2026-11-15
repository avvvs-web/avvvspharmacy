# Security assessment: AVVVS Ayur Store

**Date:** 15 November 2026
**Commit assessed:** `5f62a11` (local `main`)
**Result:** no critical or high-severity weakness found. Five medium and eleven low findings, listed below. Nothing was changed in the code.

## Fix status (15 November 2026)

Code fixes for every finding below are in the commit after this assessment. The store's 13 automated tests pass and `npm audit` reports no advisories.

**Still to do:** retest each finding the way it was found. In particular, sign-in has not been tried end to end since the token checks were added, and prescription upload has not been tried against a private Blob store.

**L4** was fixed separately: the webhook now accepts Shopify's signature (`SHOPIFY_WEBHOOK_SECRET`).

### Remaining low items (15 November 2026, later the same day)

| Item | Now |
|---|---|
| L4 manual-refresh secret | Compared in constant time, must be 16+ characters, and can be sent in an `X-Revalidate-Secret` header so it stays out of request logs (`?secret=` still works). Signed webhooks older than an hour by `X-Shopify-Triggered-At` are refused as replays, and the endpoint is rate-limited. |
| L7 identity token | Verified properly: Shopify's signature against the store's published keys (RS256 or Ed25519; `none` and other algorithms refused), the issuer from the discovery document, the audience, expiry and the nonce. A token that fails any check ends the sign-in with the fixed "failed" message. Tested with tokens signed locally (valid, tampered, unsigned, wrong key) and by loading Shopify's real keys; **not yet tried with a real sign-in**. |
| L8 `/api/health` | Answers only `ok` and a time; the shop's name and token status are no longer shown. |
| GitHub settings | **Still to do, by an admin of the `avvvs-web` organisation** (the account used here can push but not change settings). See below. |

**GitHub, for an organisation admin** (repository `avvvs-web/avvvspharmacy` → Settings):
1. *Code security*: turn on Dependabot alerts, Dependabot security updates, secret scanning and push protection.
2. *Branches* → add a rule for `main`: block force pushes and block deletion. Don't require pull requests or status checks unless you want every change to go through a pull request, because that would stop direct pushes to `main`.
3. Consider making the repository private. Check first that the Vercel plan can deploy a private repository owned by an organisation; on the free Hobby plan it can't, and deploys would stop.

## Scope and method

| | |
|---|---|
| **In scope** | The store's own code in this repository, tested white-box (reading the source) and against the local development server. |
| **Live site** | `shop.avvvs.com` was checked passively only: response headers, the HTTPS redirect and a few well-known file paths. About ten plain requests. |
| **Out of scope** | Shopify itself (admin, checkout, the customer sign-in service), Vercel and GitHub account settings, DNS, and any load or denial-of-service testing. |
| **Standards used** | OWASP Web Security Testing Guide, OWASP API Security Top 10. |

Each result is marked one of four ways:
- **Confirmed**: demonstrated with a request or a small script.
- **Confirmed by review**: clear from the source code, not exercised.
- **Not vulnerable**: tested or reviewed and the control held.
- **Not tested**: outside what could be checked here. This is not the same as "safe".

No real secret is reproduced in this document.

---

## Findings

### Medium

#### M1. Open redirect after sign-in
- **Where:** `src/app/account/login/route.ts` (the `next` parameter), used by `src/app/account/callback/route.ts`.
- **What happens:** the sign-in link accepts a return address if it starts with `/`. An address such as `//example.com/x` passes that check, and after a successful sign-in the customer is sent to `https://example.com/x`.
- **Evidence (confirmed):** `new URL('//example.com/x', 'https://shop.avvvs.com/account/callback')` resolves to `https://example.com/x`. A request to `/account/login?next=//example.com/x` on the local server was accepted and the sign-in cookie was set.
- **Impact:** a phishing link that starts on the real store, goes through the real Shopify sign-in, and lands on a look-alike page asking for payment details.
- **Fix:** accept only a single leading slash: reject anything starting with `//` or `/\`, or check that the resolved address has the store's own origin.

#### M2. Prescriptions are stored at public links, and anyone can upload
- **Where:** `src/app/api/prescription/route.ts`.
- **What happens:**
  - Files are saved to Vercel Blob with `access: 'public'`. The link is random, but anyone who holds it can open the file, and it never expires.
  - The upload needs no cart, sign-in or check of where the request came from.
  - The limit of 20 uploads an hour is kept in the memory of one server instance. On Vercel each instance has its own count, so the real limit is much higher.
- **Evidence (confirmed by review):** not exercised, because the upload token is not set on this machine.
- **Impact:** prescriptions are health records. A link that leaks (an order export, an email, a staff member's browser history) exposes the document. Separately, the endpoint can be used as free file hosting under your storage account, at your cost.
- **Fix:** store prescriptions privately and let pharmacy staff open them through a signed, expiring link. Require a cart cookie for upload. Move the rate limit to something shared (Vercel Firewall rule, or a counter in the database). Delete files after the order is fulfilled.

#### M3. Text written in Shopify is shown as raw HTML, with no Content Security Policy
- **Where:** `src/app/products/[handle]/page.tsx` (the Shopify description, shown when a medicine has no reviewed content) and `src/app/pages/[handle]/page.tsx` (Shopify pages such as Shipping and FAQs).
- **What happens:** the HTML from Shopify is placed in the page unfiltered. The store sends no Content Security Policy, so a `<script>` in that HTML would run.
- **Evidence (confirmed by review).**
- **Impact:** anyone who can edit a product description or a page in Shopify (a staff account, a compromised staff account, or a third-party app with product access) can run script on the store for every visitor: change what the page shows, add items to carts, or redirect to a fake checkout. The sign-in cookie itself cannot be read by script.
- **Fix:** pass Shopify HTML through an allow-list sanitiser before showing it, and add a Content Security Policy.

#### M4. The back-in-stock form can be used to flood the pharmacy's inbox
- **Where:** `src/app/api/notify/route.ts`.
- **What happens:** the form has a hidden-field bot trap but no rate limit. Each request sends an email to the pharmacy and writes a database row. The medicine name in that email comes from the request, not from the catalogue.
- **Evidence:** input checks **confirmed** working (a bad email and a bad product handle were both refused). The missing rate limit and the caller-chosen name are **confirmed by review**; I did not send repeated requests.
- **Impact:** a script can send thousands of emails to the pharmacy mailbox, use up the mail quota, and fill the alerts table. The caller can also put their own wording (up to 160 characters) in the subject and body of an email your staff will read.
- **Fix:** rate-limit by address and by IP, look the medicine name up from the handle on the server, and send one daily summary instead of one email per request.

#### M5. Dependencies with published advisories
- **Where:** `package.json`. `npm audit --omit=dev` reports 6 advisories (5 high, 1 moderate).
- **What they are:**
  - `postcss` (bundled inside Next.js 15.5): four advisories about crafted CSS and source maps. PostCSS runs when the site is built, on your own stylesheets, so the practical risk here is low.
  - `zod` (pulled in by `@vercel/blob`): memory exhaustion on very large inputs.
- **Evidence (confirmed):** audit output on 15 November 2026.
- **Impact:** low in practice today, but both fixes need a major upgrade (Next.js 16, `@vercel/blob` 2.4), which should be planned instead of left to drift.
- **Fix:** schedule the Next.js 16 upgrade and re-run the tests; add `npm audit` to CI so new advisories show up.

### Low

| # | Finding | Where | Status | Fix |
|---|---|---|---|---|
| L1 | The "attach prescription" action accepts any web address, not only your storage. The address appears on the Shopify order, where staff may click it. | `attachPrescription` in `src/app/actions.ts` | Confirmed by review | Accept only addresses on your Blob store under `prescriptions/`. |
| L2 | Another website can sign a customer out. The sign-out route clears the cookies for any POST, with no check of where it came from. | `src/app/account/logout/route.ts` | Confirmed: a POST with `Origin: https://evil.example` returned the cookie-clearing headers | Check the `Origin` header matches the store. |
| L3 | Any text placed in `/account?error=…` is shown on the account page as an error message. Script does not run; the text is escaped. | `src/app/account/page.tsx` | Confirmed: "Your account is locked. Call 000" was displayed | Pass a short code and show a fixed message for each code. |
| L4 | The cache-refresh webhook is protected by a secret in the URL, which ends up in request logs. Shopify's own signature on the webhook is not checked. | `src/app/api/revalidate/route.ts` | Wrong and missing secrets are refused (confirmed); the rest by review | Verify the `X-Shopify-Hmac-Sha256` signature with the webhook signing secret. |
| L5 | No Content Security Policy. The `X-Powered-By: Next.js` header is sent. | `vercel.json`, `next.config.ts` | Confirmed on the live site | Add a CSP; set `poweredByHeader: false`. |
| L6 | Some server actions trust sizes sent by the browser: page size in "Show more", the length of a synced wishlist. Server actions also accept bodies up to 12 MB. | `loadMore`, `syncWishlist` in `src/app/actions.ts`; `next.config.ts` | Confirmed by review | Cap page size (48) and list length (200); lower the body limit to 1 MB. |
| L7 | After sign-in, the identity token from Shopify is stored but not verified, and the `nonce` that was sent is never compared. The code exchange itself is protected by PKCE and the `state` check. | `src/app/account/callback/route.ts` | Confirmed by review | Verify the token's signature, issuer, audience and nonce. |
| L8 | Raw error text from Shopify is returned to the browser in a few places. | `saveProfile`, `saveAddress`, `prepareCheckout`, `/api/health` | Confirmed by review | Log the detail; show a fixed message. |
| L9 | CI uses third-party actions by version tag, and the workflow does not restrict its token. No secrets are exposed to pull requests. | `.github/workflows/ci.yml` | Confirmed by review | Pin actions to commit hashes; add `permissions: contents: read`. |
| L10 | The cart ID is written to error logs. A cart ID is enough to read and change that cart. | `run` in `src/app/actions.ts` | Confirmed by review | Log a short hash of the ID. |
| L11 | Not a security issue, but found on the way: uploads are allowed up to 10 MB, while Vercel refuses request bodies above about 4.5 MB. Larger prescriptions will fail in production. | `src/app/api/prescription/route.ts` | Not tested in production | Upload straight from the browser to Blob with a short-lived token. |

---

## What held up

| Area | Result |
|---|---|
| Secrets in the repository | **Not vulnerable.** No token, password or connection string in tracked files or in the git history. `.env.local` is ignored. |
| Secrets in the browser | **Not vulnerable.** Shopify tokens are read only in server-only files; the browser gets only `NEXT_PUBLIC_` values. |
| Exposed files on the live site | **Not vulnerable.** `/.env`, `/.env.local` and `/.git/config` return 404. |
| HTTPS | **Not vulnerable.** HTTP redirects to HTTPS; `Strict-Transport-Security` is set for two years. |
| Sign-in handshake | **Not vulnerable.** PKCE and a random `state` are used and checked; the handshake cookie is encrypted, HTTP-only and expires in ten minutes. |
| Session cookie | **Not vulnerable.** Encrypted with AES-GCM, HTTP-only, `Secure`, `SameSite=Lax`. |
| Cross-site requests to server actions | **Not vulnerable.** Next.js checks the request origin on server actions. |
| Prices, discounts and stock | **Not vulnerable.** All are computed by Shopify; the store sends only variant IDs and quantities. |
| Injection into Shopify queries | **Not vulnerable.** Every query uses variables; handles are checked against a strict pattern. |
| SQL injection (stock alerts) | **Not vulnerable.** Queries are parameterised. |
| Script in structured data | **Not vulnerable.** `<` is escaped in JSON-LD output. |
| Cross-origin reads (CORS) | **Not vulnerable.** The API grants no cross-origin access. |
| Clickjacking | **Not vulnerable.** `X-Frame-Options: SAMEORIGIN` is set. |
| One customer reading another's orders | **Reviewed, not tested.** Orders and addresses are fetched with the signed-in customer's own Shopify token, so Shopify enforces ownership. I could not test this with two real accounts. |

## Not tested

- Sign-in from start to finish, and anything behind it, on the live site (it needs a real account and a one-time code).
- Uploading a prescription in production.
- Shopify admin, checkout and customer-account settings, including who has staff and app access.
- Vercel project settings: whether preview deployments share production secrets, and firewall rules.
- GitHub settings: branch protection and who can push to `main`.
- DNS records for `avvvs.com`, including leftovers pointing at retired services.
- Behaviour under load. No stress or volume testing was done.

The live site began answering with Vercel's bot challenge (HTTP 403) after about eight requests in a few seconds. That is its protection working, and I stopped there. The checks for `sitemap.xml`, `robots.txt` and source maps on the live site are therefore **inconclusive**.

## Suggested order of work

1. **M1** open redirect. Small change, removes a phishing route.
2. **M2** private prescription storage. The most sensitive data the store handles.
3. **M4** rate limit and server-side name on the stock-alert form.
4. **M3 and L5** sanitise Shopify HTML and add a Content Security Policy.
5. **L1 to L4** in one pass: all are a few lines each.
6. **M5** plan the Next.js 16 upgrade.
7. The remaining low items.

After the fixes, each finding should be retested the same way it was found, along with the neighbouring paths.
