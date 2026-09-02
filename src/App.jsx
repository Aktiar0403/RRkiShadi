import { useEffect, useState } from 'react'
import Music from './Music.jsx'
import { CONTENT } from './Content.jsx'
import { THEMES, DEFAULT_THEME, SHOW_PICKER, paletteFor } from './themes.js'

/* ------------------------------------------------------------------
   The invitation is set on dark satin with gold: the names pooled in
   light at the top, the five chapters as glass panels down the page.
   A chooser strip at the bottom cycles the satin through the
   colourways in themes.js (for picking the final one).
------------------------------------------------------------------- */
const CHAPTERS = [
  ['celebrations', 'Celebrations'],
  ['stay', 'Stay & Travel'],
  ['what-to-wear', 'What to Wear'],
  ['jaipur', 'Jaipur'],
  ['rsvp', 'RSVP'],
]

function readPref(key, allowed, fallback) {
  try {
    const v = localStorage.getItem(key)
    return allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}
function writePref(key, value) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* private mode */
  }
}

function Rail({ active }) {
  return (
    <nav className="rail" aria-label="Chapters">
      {CHAPTERS.map(([id, label]) => (
        <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>
          <span className="dot" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-body">
        <p className="hero-script">with love, we invite you to the wedding of</p>
        <h1 className="hero-names">
          Ruchi
          <em>weds</em>
          Rahul
        </h1>
        <div className="hero-rule" aria-hidden="true" />
        <p className="hero-meta">16 · 17 December 2026 — Stardom Resort, Jaipur</p>
      </div>
      <div className="hero-scroll" aria-hidden="true" />
    </section>
  )
}

function ThemePicker({ theme, setTheme }) {
  const i = THEMES.findIndex((t) => t.id === theme)
  const active = THEMES[i] || THEMES[0]
  return (
    <div className="picker" role="radiogroup" aria-label="Satin colour">
      <div className="picker-label">
        <b>{active.name}</b> + gold <span>{i + 1} / {THEMES.length}</span>
      </div>
      <div className="picker-row">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={t.id === theme}
            aria-label={`${t.name} + gold`}
            title={`${t.name} + gold`}
            className={`chip ${t.id === theme ? 'active' : ''}`}
            style={{ '--c': t.hex }}
            onClick={() => setTheme(t.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => readPref('rr-theme', THEMES.map((t) => t.id), DEFAULT_THEME))
  const [mode, setMode] = useState(() => readPref('rr-mode', ['day', 'night'], 'night'))
  const [activeChapter, setActiveChapter] = useState('')

  // day / night skin
  useEffect(() => {
    document.documentElement.dataset.mode = mode
    writePref('rr-mode', mode)
  }, [mode])

  // the satin colourway (× day/night) becomes the page's tokens
  useEffect(() => {
    const t = THEMES.find((x) => x.id === theme) || THEMES[0]
    const vars = paletteFor(t.hex, mode)
    const root = document.documentElement.style
    for (const [k, v] of Object.entries(vars)) root.setProperty(k, v)
    document.documentElement.dataset.theme = t.id
    writePref('rr-theme', theme)
  }, [theme, mode])

  // top progress bar
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      document.documentElement.style.setProperty('--progress', p.toFixed(4))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // rail highlight + panel reveal
  useEffect(() => {
    const rail = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveChapter(e.target.id)
      },
      { threshold: 0.4 },
    )
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            reveal.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15 },
    )
    for (const [id] of CHAPTERS) {
      const el = document.getElementById(id)
      if (el) rail.observe(el)
    }
    document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el))
    return () => {
      rail.disconnect()
      reveal.disconnect()
    }
  }, [])

  return (
    <>
      <div className="progressbar" aria-hidden="true" />
      <Music />
      <button
        className="mode-btn"
        onClick={() => setMode(mode === 'night' ? 'day' : 'night')}
        aria-label={mode === 'night' ? 'Switch to day theme' : 'Switch to night theme'}
        title={mode === 'night' ? 'Day theme' : 'Night theme'}
      >
        {mode === 'night' ? '☀' : '☾'}
      </button>
      <div className="silk" aria-hidden="true" />
      <Rail active={activeChapter} />
      {SHOW_PICKER && <ThemePicker theme={theme} setTheme={setTheme} />}
      <main>
        <Hero />
        {CHAPTERS.map(([id], i) => {
          const Content = CONTENT[id]
          return (
            <section key={id} className={`chapter ${i % 2 ? 'flip' : ''}`} id={id}>
              <span className="ch-num" aria-hidden="true">{`0${i + 1}`}</span>
              <div className={`panel reveal ${id === 'rsvp' ? 'wide' : ''}`}>
                <div className="stitch" aria-hidden="true" />
                <Content />
              </div>
            </section>
          )
        })}
      </main>
      <footer>
        <span className="f-script">see you in Jaipur</span>
        <p className="f-names">Ruchi &amp; Rahul</p>
        <p className="tag">#RRkiShadi · 16–17 December 2026</p>
      </footer>
    </>
  )
}
