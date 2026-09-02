# RRkiShadi — Ruchi Weds Rahul

A wedding-invitation website for the wedding of **Ruchi & Rahul**,
16–17 December 2026 at **Stardom Resort, Jaipur**.

- **Live:** https://rrkishadi.pages.dev (Cloudflare Pages)
- **Repo:** https://github.com/Aktiar0403/RRkiShadi
- Client reference (original site being replaced): https://ruchirahul.netlify.app

## Concept

The invitation sits on **dark satin with gold**: a smooth CSS sheen with
soft folds, a thin double gold rule framing the page, the couple's names
pooled in light at the top, and the five chapters as glass panels down the
page.

### Choosing the colour
`src/themes.js` holds **20 satin colourways** (Dark Red, Maroon, Wine, Rani
Pink, Burgundy, Bottle Green, Emerald, Teal, Royal Purple, Aubergine,
Violet, Midnight Blue, Royal Blue, Navy, Peacock, Rust, Terracotta,
Chocolate, Plum, Charcoal — each "+ gold"). A **chooser strip at the bottom
of the page** cycles through them so the couple can pick; the choice is
remembered per browser (`localStorage rr-theme`).

Every token (satin shades, panel tints, inks, accent, kicker colour) is
derived from the colourway's hex in `paletteFor()` for both **night** and
**day** (the day/night toggle top-right gives a pale satin twin of the same
hue with antique-gold accents).

**To finalise:** delete the unwanted entries from `THEMES`, set
`SHOW_PICKER = false`, rebuild and deploy. The first entry is the default.

> Earlier editions (a 3D "walk into the resort", then a Banarasi brocade)
> were retired in September 2026; `/static` redirects here.

## Stack

| Layer | Tech |
|---|---|
| Build | Vite 5 + React 18 — ~51 kB JS gzipped, no runtime deps beyond React |
| Hosting | Cloudflare Pages (`wrangler pages deploy dist`) |
| RSVP backend | Cloudflare Pages Function + D1 (SQLite) |
| Fonts | Cinzel (display) · Great Vibes (script) · Jost (body) — Google Fonts |

## Commands

```bash
npm install
npm run dev        # local dev (RSVP API needs the deployed site or `wrangler pages dev`)
npm run build      # outputs dist/
npx wrangler pages deploy dist --project-name rrkishadi --branch master
```

## Project structure

```
functions/api/rsvp.js     RSVP API (POST store, GET list/CSV with admin key)
wrangler.toml             Pages config + D1 binding (DB → rrkishadi-rsvp)
public/
  _redirects              /static → /
  music/raabta.mp3        background track (128kbps; toggle hides if absent)
  jaipur/*.jpg            Explore-Jaipur photos (Wikimedia Commons)
  venue/*.jpg             real resort photos (stardomresortjaipur.in)
  og.png                  share card
src/
  App.jsx                 shell: hero, chapters, rail, progress bar, theme picker,
                          day/night + colourway state (localStorage rr-mode / rr-theme)
  themes.js               THEMES (20 satin colourways), paletteFor(), SHOW_PICKER
  Content.jsx             the 5 chapters + LOOKS (What-to-Wear palettes & notes)
  Music.jsx               background-music toggle (starts on first tap, remembered)
  Tilt.jsx                pointer/touch tilt wrapper for cards
  styles.css              fallback tokens, the satin, gold frame, picker, panel CSS
```

## Key systems

### The satin (`styles.css`, "The satin" section)
`.silk` is a fixed full-page layer: base gradient from `--silk-1/2/3`, broad
diagonal fold bands, a 4px sheen, and `::after` adds large slanted soft
highlights. `::before` draws the double gold frame inset by `--kinara`;
content, rail and buttons are inset by the same token.

### Theming
`App.jsx` computes `paletteFor(hex, mode)` for the active colourway and
writes every `--token` as an inline custom property on `<html>`, so the
CSS `:root` block is only the pre-JS fallback. `data-mode` (day/night) and
`data-theme` (colourway id) are also set on `<html>`. Colour properties
ease over 0.8s.

### RSVP
`Content.jsx` `Rsvp` posts JSON to `/api/rsvp`; the Pages Function stores
it in D1. Admin listing: `/api/rsvp?key=<ADMIN_KEY>` (`&format=csv`). The
key lives in gitignored `.admin-key.local` and as a Pages secret.

### Music
`Music.jsx` fades in `/music/raabta.mp3` on the first tap unless the visitor
previously switched it off (`localStorage rr-music`).

## Tuning knobs

- Colourways: `THEMES` in `src/themes.js`; how shades/inks derive from the
  hex: `paletteFor()`.
- Satin sheen and folds: `.silk` / `.silk::after` in `styles.css`.
- Frame inset: `--kinara`; picker height: `--picker-h`.
- Event copy, swatches, notes: `LOOKS` in `src/Content.jsx`.
