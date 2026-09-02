# RRkiShadi — Ruchi Weds Rahul

An immersive 3D wedding-invitation website for the wedding of **Ruchi & Rahul**,
16–17 December 2026 at **Stardom Resort, Jaipur**.

- **Live:** https://rrkishadi.pages.dev (Cloudflare Pages)
- **Repo:** https://github.com/Aktiar0403/RRkiShadi
- Client reference (original site being replaced): https://ruchirahul.netlify.app

## Concept

The whole site is one 3D walk into the resort. Scrolling dollies the camera
through the grounds — arrive at the entrance gates (with *RUCHI WEDS RAHUL*
floating in the arch), pass under it, follow the lantern-lined tiled walkway
past the pool, and end standing beneath the wedding mandap's chandelier.
The content chapters are interactive boards standing **inside** the 3D world;
the camera stops in front of each and auto-frames it to fill ~92% of the
viewport (measured per device, rebuilt on rotate/resize).

## Static edition

A no-3D twin of the site lives at **https://rrkishadi.pages.dev/static** —
no canvas, no camera walk. The hero shows the names over a veiled photo of
the resort and the five chapters sit as glass panels down the page. It is a
second Vite entry (`static.html` → `src/static.jsx` → `src/StaticApp.jsx`)
and reuses the exact same chapter content (`src/Content.jsx`), styles,
day/night toggle, event looks, music and RSVP API. Loads ~160 kB gzipped vs
~430 kB for the 3D walk. To make it the main site, swap the two `input`
entries in `vite.config.js` (or rename the html files).

## Stack

| Layer | Tech |
|---|---|
| Build | Vite 5 + React 18 |
| 3D | three.js + @react-three/fiber + drei + postprocessing (bloom, vignette) |
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
  music/raabta.mp3        background track (128kbps; toggle hides if absent)
  jaipur/*.jpg            Explore-Jaipur photos (Wikimedia Commons)
  venue/*.jpg             real resort photos (stardomresortjaipur.in)
  models/                 DROP stardom.glb HERE to swap in a photogrammetry scan
src/
  App.jsx                 shell: hero, scroll spacers, rail, progress bar, day/night
  StaticApp.jsx           static edition shell (no 3D) — served at /static
  Content.jsx             the 5 chapters' content + LOOKS, shared by both editions
  Music.jsx               background-music toggle (starts on first tap, remembered)
  Tilt.jsx                pointer/touch 3D-tilt wrapper for cards
  styles.css              design tokens, day/night + per-event themes, panel CSS
  scene/
    Scene.jsx             Canvas, palettes, sky/clouds/birds/cityscape, ScrollCamera
    Panels.jsx            the 5 chapter boards (drei Html) + camera-stop data
    Mandap.jsx            the real Stardom mandap (gold frame, canopy, chandelier…)
    Resort.jsx            gate, walkway, jaali screens, pool, buildings, palms,
                          grass/turf, signage, photogrammetry slot
    Petals.jsx            instanced falling rose petals
    Lanterns.jsx          floating glow orbs
```

## Key systems

### Scroll → camera walk (`Scene.jsx` ScrollCamera)
Page scroll progress (0–1) drives a Catmull-Rom path: gates → one stop per
board → under the mandap. Stops are computed from each board's **measured**
size (`panelWorld` in Panels.jsx) so the card fills the screen at any aspect.
Pointer hover and Android device-tilt add gentle parallax.

### In-world boards (`Panels.jsx`)
Chapter content itself comes from `src/Content.jsx`; Panels.jsx only wraps
it in drei `Html` boards.
drei `<Html transform distanceFactor={400}>` — `distanceFactor={400}`
neutralises drei's internal divisor so **1 CSS px × scale = 1 world unit**.
Boards fade in only on arrival; on phones they cap at 820px height with
internal scrolling and larger scales (`mScale`).

### Theming (`styles.css` + App state)
- **Day/night** toggle (top-right, localStorage): swaps CSS tokens AND the 3D
  palette (sky, lighting, petals, lantern glow, stars).
- **What to Wear** re-tints the whole page per event (cocktail / wedding /
  pyjama) while that chapter is on screen.

### RSVP (`functions/api/rsvp.js` + D1)
- `POST /api/rsvp` — stores to D1 table `rsvps` (validated, length-capped).
- `GET /api/rsvp?key=ADMIN_KEY` — JSON list; `&format=csv` downloads a CSV.
- `ADMIN_KEY` is a Pages secret; a local copy lives in `.admin-key.local`
  (gitignored — keep private).
- D1 database: `rrkishadi-rsvp` (id in wrangler.toml).

### Photogrammetry slot (`Resort.jsx` SCAN)
If `public/models/stardom.glb` exists (HEAD-checked, html-fallback aware),
it replaces the stylized building — auto-scaled to 26 units, grounded,
centred. Capture with Polycam/Luma AI; tune `SCAN.rotationY` if needed.

### Performance
- Instanced everything heavy: grass (~6.5k), petals, garland beads, flower
  ring, light strands, road petals.
- `PerformanceMonitor` adapts DPR (1.0–2.0) to the device's frame rate.
- The 3D bundle is a lazy chunk; music preloads metadata only.
- Mobile: fewer particles, no bloom, wider FOV.

## Tuning knobs

| What | Where |
|---|---|
| Camera stops / card fill (0.92) | `Scene.jsx` → buildCurves |
| Board positions/angles/scales | `Panels.jsx` → `PANELS` |
| Day/night 3D palettes | `Scene.jsx` → `PALETTES` |
| Page colours & event themes | `styles.css` → `:root` blocks |
| Mandap details | `Mandap.jsx` (HALF, TOP, per-component) |
| Resort layout | `Resort.jsx` (Gate at z21, building at z-16, pool at [-7.5,10]) |
| RSVP deadline / copy | `Panels.jsx` |

## Content facts

- Events: Cocktail Dinner (Wed 16 Dec, 7 PM) · Sundowner Wedding (Thu 17 Dec,
  5 PM) · Pyjama Party (Thu 17 Dec night, poolside).
- RSVP deadline: 1 November 2026. Hashtag: **#RRkiShadi**.
- Dress palettes: deep green/dusk/antique gold · tea green/ivory/sunset ·
  midnight/blush/pearl.

## Asset licences

- Jaipur landmark photos: Wikimedia Commons (credited in the Explore board).
- Venue photos & building likeness: from stardomresortjaipur.in — confirm
  with the resort (standard courtesy; it promotes their venue).
- Raabta instrumental: client-provided; ensure the client holds usage rights.

## Ideas not yet built

Loading fade-in monogram · guest-name personalization via `?guest=` ·
iOS motion-permission prompt for tilt · WEBP conversion of photos ·
reduced-motion stop-jump navigation · real photogrammetry scan.
