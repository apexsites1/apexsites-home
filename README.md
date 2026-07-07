# ApexSites.ai — Production Static Website (deploy-ready)

This package is the **compiled, deploy-ready** version of the ApexSites marketing
site. Every page is now **static, server-rendered HTML** — no client-side React,
no third-party CDN, no build step. Just upload the folder to any static host.

## What changed vs. the original source

The original `.dc.html` files rendered entirely **client-side**: the real page
content lived inside hidden `<x-dc>` templates and was only injected after the
browser downloaded React from `unpkg.com` and hydrated the page. That approach
broke SEO and AI crawlers (they saw an empty page), hurt performance (render was
blocked on external CDN downloads), and added a hard third-party dependency.

This build **compiles those components to plain HTML** so the content is present
in the initial response. Concretely:

- **Debugged / fixed**
  - Removed the client-side React runtime + `unpkg.com` CDN dependency (SEO/LLM/speed blocker).
  - Fixed relative asset paths (`assets/…`) that 404'd on sub-directory routes — now root-absolute.
  - **Login link now points to `https://apexsites.online/login`** everywhere (nav + footer, desktop + mobile).
  - Compiled the `Brightline Dental Studio` example (it referenced an external `support.js`) to a standalone static page.
  - Added graceful `onerror` fallback for any missing image so nothing shows a broken-image icon.
- **Optimized for speed**
  - No render-blocking scripts; all JS is `defer`. Interactivity is a single tiny vanilla file (`assets/js/apex.js`).
  - System-font stack (no web-font downloads). Long-cache headers for `/assets/*` (see host configs).
  - Nav logo trimmed to a 6.5 KB image and `preload`ed; larger logo kept only for favicon/PWA.
  - `loading="lazy"` + `decoding="async"` on non-critical images.
- **Optimized for SEO**
  - Content is in the HTML (crawlable without JS). One `<h1>` per page, logical headings.
  - Per-page `<title>`, meta description, Open Graph, Twitter card.
  - Canonicals + `og:url` normalized to the exact served URLs; `sitemap.xml` regenerated to match.
  - JSON-LD preserved (Organization, SoftwareApplication, FAQPage, Product/Offer, etc.).
  - Custom 404 marked `noindex`.
- **Optimized for LLMs / AI search**
  - Full text content is present in the raw HTML (AI crawlers no longer see an empty shell).
  - `llms.txt` retained and its URLs aligned to the live routes.

## Routes (clean, directory-style URLs)

| URL | File |
|---|---|
| `/` | `index.html` |
| `/features/` | `features/index.html` |
| `/pricing/` | `pricing/index.html` |
| `/examples/` | `examples/index.html` |
| `/community/` | `community/index.html` |
| `/resources/` | `resources/index.html` |
| `/solutions/agencies/` | `solutions/agencies/index.html` |
| `/industries/roofers/` | `industries/roofers/index.html` |
| `/compare/wix-studio/` | `compare/wix-studio/index.html` |
| `/privacy-policy/`, `/cookie-policy/`, `/terms-of-service/`, `/opt-out/` | legal pages |
| `404.html` | custom not-found |

Directory-style URLs work on **any** static host with no configuration.

## Deploy

Upload the whole folder to your host's web root. No build step.

- **Cloudflare Pages / GitHub Pages / S3+CloudFront / any static host** — works as-is.
- **Netlify** — `_redirects` included (custom 404).
- **Vercel** — `vercel.json` included (clean URLs, asset caching).
- **Apache** — `.htaccess` included (pretty URLs, 404, asset caching).

Confirm `robots.txt`, `sitemap.xml`, `llms.txt`, `manifest.webmanifest` serve from the domain root.

## Before launch (unchanged from original)

- Insert real tracking IDs in `assets/js/tracking.js` (replace every `__PLACEHOLDER__`) or manage via one GTM container, and add a cookie-consent banner that calls `ApexTrack.grantConsent()` / `denyConsent()`.
- Point `https://app.apexsites.ai/signup` links at your live app (login already points to `https://apexsites.online/login`).
- The Community "Submit your story" and Resources newsletter forms show a success state client-side; wire them to a real backend.
- `og:image` / canonical use the `https://apexsites.ai` domain — change if deploying elsewhere.

## Interactivity

`assets/js/apex.js` (deferred, ~6 KB) progressively enhances the static HTML:
mobile nav, FAQ accordions, example/community/resource filters, the example
preview modal, and demo form success states. If it fails to load, all content
remains visible and readable.

## Example sites (`/uploads/`)

The example client sites shown in the Examples modal are self-contained demo
files and are included as-is (Brightline was recompiled to static HTML). All
businesses shown are **fictional demonstrations**.
