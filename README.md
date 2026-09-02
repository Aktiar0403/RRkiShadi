# RRkiShadi — Ruchi Weds Rahul

A wedding-invitation website for the wedding of **Ruchi & Rahul**,
16–17 December 2026 at **Stardom Resort, Jaipur**.

- **Live:** https://rrkishadi.pages.dev (Cloudflare Pages)
- **Repo:** https://github.com/Aktiar0403/RRkiShadi
- Client reference (original site being replaced): https://ruchirahul.netlify.app

## Concept

The invitation is draped in a **Banarasi silk**, drawn entirely in CSS and
inline SVG: deep rani-pink silk with a woven sheen, a dense gold zari jaal
of flowering butas, zari *kinara* (borders) of smoothly looping creeper down
both edges, and the couple's names on the *pallu* with striped zari bands
beneath. The five chapters sit as glass panels down the page.

**Picking a celebration in "What to Wear" re-dyes the whole silk** — and the
choice is remembered:

| Look | Night silk | Day silk |
|---|---|---|
| (none yet) | rani pink | blush |
| Cocktail Dinner | bottle green | mint |
| Sundowner Wedding | sunset / terracotta | ivory-peach |
| Pyjama Party | midnight blue | pearl-violet |

A **day / night** toggle (top-right) swaps the silk between the deep and the
pale palettes.

> An earlier 3D "walk into the resort" edition was removed in September 2026;
> `/static` (its lite twin's old URL) now redirects here.

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
  App.jsx                 shell: hero (pallu), chapters, rail, progress bar,
                          day/night + look state (localStorage rr-mode / rr-look)
  Content.jsx             the 5 chapters + LOOKS (per-event palettes & notes)
  Music.jsx               background-music toggle (starts on first tap, remembered)
  Tilt.jsx                pointer/touch tilt wrapper for cards
  styles.css              tokens (silk palettes per mode × look), the silk,
                          zari SVG tiles, panel CSS
```

## Key systems

### The silk (`styles.css`, "The silk" section)
`.silk` is a fixed full-page layer: base gradient from `--silk-1/2/3`, a
broad diagonal sheen, a 3px weave, then `::after` tiles the zari jaal SVG
(`--zari-jaal`) and `::before` tiles the kinara SVG (`--zari-kinara`) down
both edges over two darker `<span>` bands of width `--kinara`. Content,
rail, buttons and chapter numerals are inset by `--kinara`.

The two SVG tiles are inline data URIs generated from small path
definitions (buta = stem + leaves + 8-petal blossom; kinara = a vine whose
Bézier tangents match at the tile's top and bottom so the loops are
seamless). Gold is `#d4af37` at night, antique `#b8933f` by day.

### Theming
`data-mode` (day/night) and `data-theme` (cocktail/wedding/pyjama) on
`<html>` select token blocks: `:root`, `:root[data-mode="day"]`,
`:root[data-theme="…"]`, `:root[data-mode="day"][data-theme="…"]`. Each
look overrides the silk colours, `--silk-glow` (the pool behind the hero
names), panel tints, `--accent` and the kicker colour `--rani`; the day
looks also re-ink `--gold`, `--cream`, `--mist`. Colour properties ease
over 0.8s.

### RSVP
`Content.jsx` `Rsvp` posts JSON to `/api/rsvp`; the Pages Function stores
it in D1. Admin listing: `/api/rsvp?key=<ADMIN_KEY>` (`&format=csv`). The
key lives in gitignored `.admin-key.local` and as a Pages secret.

### Music
`Music.jsx` fades in `/music/raabta.mp3` on the first tap unless the visitor
previously switched it off (`localStorage rr-music`).

## Tuning knobs

- Silk colours per look/mode: token blocks at the top of `styles.css`.
- Zari density: `.silk::after { opacity, background-size }`,
  `.hero-pallu { background-size }`.
- Border width: `--kinara`.
- Event copy, swatches, notes: `LOOKS` in `src/Content.jsx`.
