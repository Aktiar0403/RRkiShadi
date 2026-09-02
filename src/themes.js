/* ------------------------------------------------------------------
   Satin + gold colourways. Each entry is one satin colour; the full
   palette (night silk, day silk, inks, tints) is derived from it in
   paletteFor(). To keep only the chosen one later: delete the others
   from THEMES (and set SHOW_PICKER = false to hide the chooser).
------------------------------------------------------------------- */
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
]

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
 * Derive every CSS token for a satin colour in the given mode.
 * Night: the satin in its true dark shade, gold zari-tone accents,
 * cream ink. Day: the same hue as a pale satin, antique gold, hue-tinted
 * dark ink.
 */
export function paletteFor(hex, mode) {
  const [h, s, l] = hexToHsl(hex)
  if (mode === 'day') {
    const ps = s * 0.6
    return {
      '--bg': hsl(h, ps, 94),
      '--silk-1': hsl(h, ps, 97.5),
      '--silk-2': hsl(h, ps, 87),
      '--silk-3': hsl(h + 18, ps, 93),
      '--silk-glow': 'rgba(255, 255, 255, 0.96)',
      '--gold': '#b08d3f',
      '--gold-2': '#8f6f2a',
      '--gold-dim': 'rgba(176, 141, 63, 0.42)',
      '--rani': hsl(h, Math.max(s, 55), 46),
      '--cream': hsl(h, Math.min(s, 55), 16),
      '--cream-soft': hsl(h, Math.min(s, 40), 27),
      '--mist': hsl(h, Math.min(s, 25), 44),
      '--tint': hsl(h, ps * 0.5, 98.5, 0.8),
      '--tint-strong': hsl(h, ps * 0.5, 98.5, 0.95),
      '--accent': hsl(h, Math.max(s, 50), 40),
      '--input-bg': 'rgba(255, 255, 255, 0.88)',
      '--btn-fg': '#ffffff',
      '--option-bg': '#ffffff',
      '--footer-fade': hsl(h, ps * 0.5, 94, 0.96),
    }
  }
  return {
    '--bg': hsl(h, s, l - 6),
    '--silk-1': hsl(h, s, l + 9),
    '--silk-2': hsl(h, s, Math.max(4, l - 10)),
    '--silk-3': hsl(h + 18, s, l + 5),
    '--silk-glow': hsl(h, s, l - 4, 0.92),
    '--gold': '#d4af37',
    '--gold-2': '#f0d98c',
    '--gold-dim': 'rgba(212, 175, 55, 0.35)',
    '--rani': hsl(h, Math.max(s, 60), 84),
    '--cream': '#f4ead8',
    '--cream-soft': '#d6cdb9',
    '--mist': hsl(h, 14, 70),
    '--tint': hsl(h, s, l - 4, 0.66),
    '--tint-strong': hsl(h, s, l - 8, 0.86),
    '--accent': hsl(h, Math.max(s * 0.8, 40), 64),
    '--input-bg': hsl(h, s, l + 2, 0.72),
    '--btn-fg': '#0a0d16',
    '--option-bg': hsl(h, s, l - 2),
    '--footer-fade': hsl(h, s, l - 8, 0.96),
  }
}
