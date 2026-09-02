/* ------------------------------------------------------------------
   Satin colourways. Each entry is one satin colour; the full palette
   (night silk, day silk, inks, tints) is derived from it in
   paletteFor(). Dual-tone entries pair the satin with gold; `mono`
   entries stay in one colour family (accents are lighter shades of the
   same hue); `flat` entries drop the satin sheen for a matte finish;
   `brand` entries (brandThemes.js) bring their own canvas + accent.
   To keep only the chosen one later: delete the others from THEMES
   (and set SHOW_PICKER = false to hide the chooser).
------------------------------------------------------------------- */
import { BRAND_THEMES } from './brandThemes.js'

export const SHOW_PICKER = true

export const THEMES = [
  { id: 'dark-red', name: 'Dark Red', hex: '#6b0f1a' },
  { id: 'maroon', name: 'Maroon', hex: '#5a0d22' },
  { id: 'wine', name: 'Wine', hex: '#4a0a2c' },
  { id: 'rani', name: 'Rani Pink', hex: '#8c1454' },
  { id: 'burgundy', name: 'Burgundy', hex: '#5c1030' },
  { id: 'bottle-green', name: 'Bottle Green', hex: '#0f4a34' },
  { id: 'emerald', name: 'Emerald', hex: '#0b5e3d' },
  { id: 'teal', name: 'Teal', hex: '#0b4a4f' },
  { id: 'royal-purple', name: 'Royal Purple', hex: '#3b1466' },
  { id: 'aubergine', name: 'Aubergine', hex: '#3a0f3f' },
  { id: 'violet', name: 'Violet', hex: '#4b2a8a' },
  { id: 'midnight', name: 'Midnight Blue', hex: '#10163f' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#14357a' },
  { id: 'navy', name: 'Navy', hex: '#0b1f4a' },
  { id: 'peacock', name: 'Peacock', hex: '#0d3b5c' },
  { id: 'rust', name: 'Rust', hex: '#8a3a14' },
  { id: 'terracotta', name: 'Terracotta', hex: '#9a4a2a' },
  { id: 'chocolate', name: 'Chocolate', hex: '#4a2a1a' },
  { id: 'plum', name: 'Plum', hex: '#5a1d4a' },
  { id: 'charcoal', name: 'Charcoal', hex: '#1c1c22' },
  // single tone — no gold
  { id: 'onyx', name: 'Onyx', hex: '#141418', mono: true },
  { id: 'oxblood', name: 'Oxblood', hex: '#4a0f14', mono: true },
  { id: 'forest', name: 'Forest', hex: '#123524', mono: true },
  { id: 'slate', name: 'Slate Blue', hex: '#263a5a', mono: true },
  { id: 'indigo', name: 'Indigo', hex: '#2a2560', mono: true },
  { id: 'espresso', name: 'Espresso', hex: '#3b2418', mono: true },
  { id: 'olive', name: 'Olive', hex: '#3a3f1a', mono: true },
  { id: 'graphite', name: 'Graphite', hex: '#2a2a30', mono: true },
  { id: 'mulberry', name: 'Mulberry', hex: '#4a1a3a', mono: true },
  { id: 'steel', name: 'Steel Blue', hex: '#2f4a6a', mono: true },
  // matte — no satin sheen, gold accents
  { id: 'matte-black', name: 'Matte Black', hex: '#121214', flat: true },
  { id: 'matte-maroon', name: 'Matte Maroon', hex: '#5b1a24', flat: true },
  { id: 'deep-plum', name: 'Deep Plum', hex: '#3f1f3b', flat: true },
  { id: 'ink', name: 'Ink Blue', hex: '#1a2440', flat: true },
  { id: 'pine', name: 'Pine', hex: '#1f3a2a', flat: true },
  { id: 'clay', name: 'Clay', hex: '#8b4a3a', flat: true },
  { id: 'mocha', name: 'Mocha', hex: '#4b3a30', flat: true },
  { id: 'slate-grey', name: 'Slate Grey', hex: '#3a4048', flat: true },
  { id: 'dusty-rose', name: 'Dusty Rose', hex: '#8a4a5a', flat: true },
  { id: 'sage', name: 'Sage', hex: '#4d6a55', flat: true },
  // brand palettes from awesome-design-md (colour inspiration only) — matte, brand accent instead of gold
  ...BRAND_THEMES,
]

/** Human label for a colourway's finish/tone, used by the chooser. */
export function describe(t) {
  if (t.brand) return 'brand palette'
  const tone = t.mono ? 'single tone' : '+ gold'
  return t.flat ? `matte ${tone}` : tone
}

export const DEFAULT_THEME = THEMES[0].id

/* ---- colour helpers ---- */
function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, s * 100, l * 100]
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const hsl = (h, s, l, a) =>
  a == null
    ? `hsl(${((h % 360) + 360) % 360} ${clamp(s, 0, 100).toFixed(1)}% ${clamp(l, 0, 100).toFixed(1)}%)`
    : `hsl(${((h % 360) + 360) % 360} ${clamp(s, 0, 100).toFixed(1)}% ${clamp(l, 0, 100).toFixed(1)}% / ${a})`

/**
 * Derive every CSS token for a colourway in the given mode.
 * t: { hex (dark base), light (light base, optional), accent (optional
 *      hex that takes the gold role), mono, brand }.
 * Night: the base in its true dark shade, gold (or accent) highlights,
 * cream ink. Day: a pale base, antique gold (or a deepened accent),
 * hue-tinted dark ink.
 */
export function paletteFor(t, mode) {
  const mono = !!t.mono
  const baseHex = t.hex || t.light
  const [h, s, l] = hexToHsl(baseHex)
  const acc = t.accent ? hexToHsl(t.accent) : null

  if (mode === 'day') {
    // base: the theme's own light canvas if it has one, else a pale tint of the hue
    let bg, silk1, silk2, silk3, footer
    if (t.light) {
      const [lh, ls, ll] = hexToHsl(t.light)
      bg = hsl(lh, ls, ll)
      silk1 = hsl(lh, ls, Math.min(100, ll + 1.5))
      silk2 = hsl(lh, ls, ll - 7)
      silk3 = hsl(lh + 18, ls, ll - 2)
      footer = hsl(lh, ls, ll, 0.96)
    } else {
      const ps = s * 0.6
      bg = hsl(h, ps, 94)
      silk1 = hsl(h, ps, 97.5)
      silk2 = hsl(h, ps, 87)
      silk3 = hsl(h + 18, ps, 93)
      footer = hsl(h, ps * 0.5, 94, 0.96)
    }
    // the "gold" role: gold, a deep shade of the hue (mono), or the brand accent deepened for contrast
    let gold
    if (acc) {
      const [ah, as, al] = acc
      const dl = Math.min(al, 44)
      gold = { '--gold': hsl(ah, as, dl), '--gold-2': hsl(ah, as, dl - 8), '--gold-dim': hsl(ah, as, dl, 0.4) }
    } else if (mono) {
      gold = { '--gold': hsl(h, Math.max(s, 30), 34), '--gold-2': hsl(h, Math.max(s, 30), 26), '--gold-dim': hsl(h, Math.max(s, 30), 34, 0.4) }
    } else {
      gold = { '--gold': '#b08d3f', '--gold-2': '#8f6f2a', '--gold-dim': 'rgba(176, 141, 63, 0.42)' }
    }
    const ih = acc && t.brand ? acc[0] : h
    const is = acc && t.brand ? Math.min(acc[1], 40) : s
    return {
      ...gold,
      '--bg': bg,
      '--silk-1': silk1,
      '--silk-2': silk2,
      '--silk-3': silk3,
      '--silk-glow': 'rgba(255, 255, 255, 0.96)',
      '--rani': acc ? gold['--gold'] : hsl(h, Math.max(s, 55), 46),
      '--cream': hsl(ih, Math.min(is, 55), 16),
      '--cream-soft': hsl(ih, Math.min(is, 40), 27),
      '--mist': hsl(ih, Math.min(is, 25), 44),
      '--tint': 'rgba(255, 255, 255, 0.8)',
      '--tint-strong': 'rgba(255, 255, 255, 0.95)',
      '--accent': acc ? gold['--gold'] : hsl(h, Math.max(s, 50), 40),
      '--input-bg': 'rgba(255, 255, 255, 0.88)',
      '--btn-fg': '#ffffff',
      '--option-bg': '#ffffff',
      '--footer-fade': footer,
    }
  }

  // night base: the theme's dark canvas, else a deep shade of its (accent) hue
  let bh = h, bs = s, bl = l
  if (!t.hex) {
    const [ah, as] = acc || [h, s]
    bh = ah; bs = Math.min(as * 0.5, 40); bl = 12
  }
  let gold
  if (acc) {
    const [ah, as, al] = acc
    const nl = Math.max(al, 58)
    gold = { '--gold': hsl(ah, as, nl), '--gold-2': hsl(ah, as, Math.min(nl + 12, 92)), '--gold-dim': hsl(ah, as, nl, 0.35) }
  } else if (mono) {
    gold = { '--gold': hsl(h, Math.max(s * 0.6, 12), 78), '--gold-2': hsl(h, Math.max(s * 0.6, 12), 90), '--gold-dim': hsl(h, Math.max(s * 0.6, 12), 78, 0.35) }
  } else {
    gold = { '--gold': '#d4af37', '--gold-2': '#f0d98c', '--gold-dim': 'rgba(212, 175, 55, 0.35)' }
  }
  return {
    ...gold,
    '--bg': hsl(bh, bs, Math.max(2, bl - 6)),
    '--silk-1': hsl(bh, bs, bl + 9),
    '--silk-2': hsl(bh, bs, Math.max(4, bl - 10)),
    '--silk-3': hsl(bh + 18, bs, bl + 5),
    '--silk-glow': hsl(bh, bs, Math.max(2, bl - 4), 0.92),
    '--rani': acc ? gold['--gold-2'] : hsl(h, Math.max(s, 60), 84),
    '--cream': '#f4ead8',
    '--cream-soft': '#d6cdb9',
    '--mist': hsl(bh, 14, 70),
    '--tint': hsl(bh, bs, Math.max(2, bl - 4), 0.66),
    '--tint-strong': hsl(bh, bs, Math.max(2, bl - 8), 0.86),
    '--accent': acc ? gold['--gold'] : hsl(h, Math.max(s * 0.8, 40), 64),
    '--input-bg': hsl(bh, bs, bl + 2, 0.72),
    '--btn-fg': '#0a0d16',
    '--option-bg': hsl(bh, bs, Math.max(2, bl - 2)),
    '--footer-fade': hsl(bh, bs, Math.max(2, bl - 8), 0.96),
  }
}
