import { useEffect, useMemo, useState } from 'react'
import { THEMES, paletteFor, styleFor, describe, fontsFor } from './themes.js'

/* ------------------------------------------------------------------
   The look gallery. A floating pill shows the current look and opens
   a full-screen picker: grouped tabs, search, a day/night preview
   switch, and one card per colourway rendered in that colourway's
   own colours and typeface. Picking applies live behind the gallery.
------------------------------------------------------------------- */
const GROUPS = [
  ['all', 'All'],
  ['gold', 'Satin + gold'],
  ['mono', 'Single tone'],
  ['matte', 'Matte'],
  ['brand', 'Brands'],
]
export const groupOf = (t) => (t.brand ? 'brand' : t.flat ? 'matte' : t.mono ? 'mono' : 'gold')

/** One combined Google Fonts sheet for every brand face, loaded only when the Brands cards show. */
function brandFontsUrl() {
  const fams = new Map()
  for (const t of THEMES) {
    const u = fontsFor(t)
    if (!u) continue
    for (const part of new URL(u).searchParams.getAll('family')) fams.set(part.split(':')[0], part)
  }
  return `https://fonts.googleapis.com/css2?${[...fams.values()].map((f) => `family=${f}`).join('&')}&display=swap`
}

function Card({ t, mode, active, onPick }) {
  const p = useMemo(() => paletteFor(t, mode), [t, mode])
  const st = styleFor(t)
  const satin = !t.flat
  return (
    <button
      type="button"
      className={`tp-card ${active ? 'active' : ''}`}
      onClick={() => onPick(t.id)}
      aria-pressed={active}
      style={{
        '--p1': p['--silk-1'],
        '--p2': p['--silk-2'],
        '--pacc': p['--gold'],
        '--pink': p['--cream'],
        '--pmist': p['--mist'],
        '--pr': st ? st['--r-card'] : '0px',
      }}
    >
      <span className={`tp-swatch ${satin ? 'satin' : 'matte'}`}>
        <span
          className="tp-names"
          style={st ? { fontFamily: st['--display'], fontWeight: st['--names-weight'], letterSpacing: st['--names-tracking'], textTransform: st['--names-transform'] } : undefined}
        >
          Ruchi <i>&amp;</i> Rahul
        </span>
        <span className="tp-date">16 · 17 Dec 2026</span>
      </span>
      <span className="tp-meta">
        <b>{t.name}</b>
        <small>{t.style ? t.style.display : describe(t)}</small>
      </span>
    </button>
  )
}

export function ThemeTrigger({ theme, onOpen, onStep }) {
  const i = THEMES.findIndex((t) => t.id === theme)
  const t = THEMES[i] || THEMES[0]
  return (
    <div className="tp-trigger" role="group" aria-label="Current look">
      <button type="button" className="tp-step" aria-label="Previous look" onClick={() => onStep(-1)}>‹</button>
      <button type="button" className="tp-open" onClick={onOpen}>
        <span className="tp-dot" style={{ '--c': t.hex || t.light, '--a': t.accent || '#d4af37' }} />
        <span className="tp-name">{t.name}</span>
        <span className="tp-cta">Change look</span>
      </button>
      <button type="button" className="tp-step" aria-label="Next look" onClick={() => onStep(1)}>›</button>
    </div>
  )
}

export default function ThemePicker({ theme, setTheme, mode, setMode, onClose }) {
  const [group, setGroup] = useState(() => groupOf(THEMES.find((t) => t.id === theme) || THEMES[0]))
  const [q, setQ] = useState('')
  const [copied, setCopied] = useState(false)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return THEMES.filter((t) => (group === 'all' || groupOf(t) === group) && (!needle || `${t.name} ${describe(t)} ${t.style?.display || ''}`.toLowerCase().includes(needle)))
  }, [group, q])

  // load every brand face once the brand cards are on screen
  const brandsShown = list.some((t) => t.brand)
  useEffect(() => {
    if (!brandsShown || document.getElementById('brand-fonts-all')) return
    const link = document.createElement('link')
    link.id = 'brand-fonts-all'
    link.rel = 'stylesheet'
    link.href = brandFontsUrl()
    document.head.appendChild(link)
  }, [brandsShown])

  // escape closes; lock page scroll behind the gallery
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const active = THEMES.find((t) => t.id === theme) || THEMES[0]
  const share = async () => {
    const url = `${location.origin}${location.pathname}?theme=${active.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      prompt('Copy this link', url)
    }
  }

  return (
    <div className="tp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tp" role="dialog" aria-modal="true" aria-label="Choose a look">
        <header className="tp-head">
          <div>
            <p className="tp-kicker">Choose a look</p>
            <h2>
              {active.name} <small>{describe(active)}{active.style ? ` · ${active.style.display}` : ''}</small>
            </h2>
          </div>
          <div className="tp-tools">
            <input
              type="search"
              className="tp-search"
              placeholder="Search looks…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search looks"
            />
            <button type="button" className="tp-mode" onClick={() => setMode(mode === 'night' ? 'day' : 'night')} aria-label="Preview day or night">
              {mode === 'night' ? '☀ Day' : '☾ Night'}
            </button>
            <button type="button" className="tp-share" onClick={share}>
              {copied ? 'Link copied' : 'Copy link'}
            </button>
            <button type="button" className="tp-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </header>
        <nav className="tp-tabs" aria-label="Groups">
          {GROUPS.map(([id, label]) => {
            const n = id === 'all' ? THEMES.length : THEMES.filter((t) => groupOf(t) === id).length
            return (
              <button key={id} type="button" className={`tp-tab ${group === id ? 'active' : ''}`} onClick={() => setGroup(id)}>
                {label} <span>{n}</span>
              </button>
            )
          })}
        </nav>
        <div className="tp-grid">
          {list.map((t) => (
            <Card key={t.id} t={t} mode={mode} active={t.id === theme} onPick={setTheme} />
          ))}
          {!list.length && <p className="tp-empty">Nothing matches “{q}”.</p>}
        </div>
        <footer className="tp-foot">
          <span>{list.length} of {THEMES.length} looks · tap a card to try it, the page behind changes live</span>
          <button type="button" className="btn tp-done" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
