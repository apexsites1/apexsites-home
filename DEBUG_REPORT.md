# ApexSites — Build & QA Report (compiled static package)

## Automated verification (headless Chromium, served over HTTP)

All 13 public pages + custom 404 rendered with:
- **0 JavaScript errors**
- **0 failed network requests** (nothing hits an external CDN)
- Exactly **one `<h1>`** per page
- `<title>`, meta description, and canonical present on every public page
- JSON-LD structured data intact and valid (parsed successfully)
- All 16 homepage internal links resolve to real files
- Login link resolves to `https://apexsites.online/login`

Interactivity verified by simulating real user actions:
- Mobile nav: hidden → opens on tap ✓
- FAQ accordions: first open by default; clicking another toggles it ✓
- Filters (Examples/Community/Resources): e.g. "Dental" narrows 9 → 1 ✓
- Example preview modal: opens on card click, closes via ✕ / overlay / Esc ✓
- Forms: submit reveals success state, hides form ✓

## Issues found & fixed

1. **Pages were blank to crawlers/LLMs.** Original `.dc.html` pages rendered
   client-side via React fetched from `unpkg.com`; content sat in hidden
   templates. → Compiled all components to static HTML. No CDN, no React.
2. **Sub-directory routes 404'd on assets.** Nav/footer used relative
   `assets/…` paths that broke under `/features/`, `/pricing/`, etc.
   → Rewrote all asset/upload references to root-absolute paths.
3. **Login link.** Pointed at `https://app.apexsites.ai/login`.
   → Now `https://apexsites.online/login` (nav + footer, desktop + mobile).
4. **Broken standalone example.** `Brightline Dental Studio` depended on an
   external `support.js`. → Recompiled to a self-contained static page.
5. **Broken image icons.** Some example images referenced files not shipped.
   → Added `onerror` fallback so they degrade to a brand-colored block.
6. **Duplicate/inconsistent SEO tags.** Duplicate `charset`/`viewport`;
   canonicals used extensionless URLs not matching served paths.
   → Deduplicated; normalized canonical + `og:url` + `sitemap.xml` to the
   exact directory-style routes.

## Performance

- No render-blocking JS (all `defer`); interactivity is one ~6 KB vanilla file.
- No web fonts (system stack). No JS frameworks.
- Nav logo reduced to 6.5 KB and `preload`ed with `fetchpriority="high"`.
- Removed unused 1.1 MB `logo-source.png`; recompressed remaining PNGs.
- `loading="lazy"` + `decoding="async"` on non-critical images.
- Long-cache headers for `/assets/*` (Vercel/Apache configs included).

## SEO / AI search

- Content present in initial HTML (indexable + AI-crawlable without JS).
- Unique title/description/canonical/OG/Twitter per page.
- JSON-LD: Organization, SoftwareApplication, FAQPage, Product/Offer, etc.
- `robots.txt` (allows crawlers, disallows app routes, references sitemap).
- `sitemap.xml` regenerated to match served URLs with `lastmod`.
- `llms.txt` retained; URLs aligned to live routes.
- Custom 404 set to `noindex`.

## Host compatibility

Directory-style URLs work on any static host with zero config. Included:
`_redirects` (Netlify), `vercel.json` (Vercel), `.htaccess` (Apache).

## Still requires real values before launch (business config, not bugs)

- Replace `__PLACEHOLDER__` tracking IDs in `assets/js/tracking.js`; add a
  consent banner calling `ApexTrack.grantConsent()/denyConsent()`.
- Point `https://app.apexsites.ai/signup` at the live app.
- Wire Community/Resources forms to a real backend.
- Adjust `https://apexsites.ai` OG/canonical domain if hosting elsewhere.
