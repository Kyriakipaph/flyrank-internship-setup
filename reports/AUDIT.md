# Accessibility & Performance Audit

Audit run against the live deployment at **https://tierup-focus.vercel.app**
on 2026-09-27 using Lighthouse 12 (which uses axe-core for its accessibility
category).

## Scores

### Desktop (before fix)

| Category | Score | Threshold | Pass |
|---|---|---|---|
| Performance | **100** | ≥85 | ✅ |
| Accessibility | **95** | ≥85 (WCAG 2.1 AA) | ✅ but with 1 finding |
| Best practices | **100** | — | ✅ |
| SEO | **100** | — | ✅ |

### Mobile

| Category | Score | Threshold | Pass |
|---|---|---|---|
| Performance | **90** | ≥85 | ✅ |
| Accessibility | **100** | ≥85 | ✅ |
| Best practices | **100** | — | ✅ |
| SEO | **100** | — | ✅ |

Full HTML reports:
- `reports/lighthouse-desktop.html`
- `reports/lighthouse-mobile.html`

## Finding: color-contrast (WCAG 2.1 AA)

Lighthouse flagged two header nav links — `/playground` and `/health` — as
failing WCAG AA contrast:

- **Failing:** `text-stone-400` (`#a6a09b`) on the near-white body background
  (`#fdfcfc`)
- **Measured contrast:** 2.52 : 1
- **WCAG AA minimum for normal text:** 4.5 : 1

Only visible on desktop widths (`hidden sm:inline-block`), which is why the
mobile audit didn't hit the same finding.

## Fix

Changed both links from `text-stone-400 hover:text-stone-600` to
`text-stone-600 hover:text-stone-900` in `app/layout.tsx`.

- **New base color:** `#57534e` (stone-600)
- **New contrast:** 7.94 : 1 — well above the 4.5 : 1 WCAG AA bar and even
  clearing WCAG AAA (7 : 1)
- **Hover:** darkened to `#1c1917` (stone-900) so the affordance still reads
  correctly for keyboard users tabbing through

After the fix redeployed, the desktop accessibility score goes to **100** with
zero WCAG AA violations.

## Non-blocking recommendations (not fixed for this submission)

Lighthouse's performance category was already perfect on desktop but flagged
two low-severity items on mobile that don't affect scores enough to matter:

- `unused-javascript` — some framework chunks aren't fully tree-shaken. Next.js
  automatically code-splits and preloads, so leaving these alone is the right
  call for a small site.
- `legacy-javascript` — a small polyfill bundle Next.js ships for older
  browsers. Configurable via browserslist if it becomes an issue.

Neither is a WCAG or capstone-pass concern.
