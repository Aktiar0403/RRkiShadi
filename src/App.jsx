import { useEffect, useState } from 'react'
import Music from './Music.jsx'
import { CONTENT, LOOKS } from './Content.jsx'

/* ------------------------------------------------------------------
   The invitation is draped in a Banarasi silk (CSS + inline SVG
   zari). The names sit on the pallu; the five chapters are glass
   panels down the page. Picking a celebration in "What to Wear"
   re-dyes the whole silk in that evening's colours.
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
      <div className="hero-pallu" aria-hidden="true" />
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

export default function App() {
  const [look, setLook] = useState(() => readPref('rr-look', Object.keys(LOOKS), null))
  const [mode, setMode] = useState(() => readPref('rr-mode', ['day', 'night'], 'night'))
  const [activeChapter, setActiveChapter] = useState('')

  // day / night skin
  useEffect(() => {
    document.documentElement.dataset.mode = mode
    writePref('rr-mode', mode)
  }, [mode])

  // the chosen celebration dyes the whole site, and is remembered
  useEffect(() => {
    if (look) document.documentElement.dataset.theme = look
    else delete document.documentElement.dataset.theme
    writePref('rr-look', look)
  }, [look])

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
      <div className="silk" aria-hidden="true">
        <span />
        <span />
      </div>
      <Rail active={activeChapter} />
      <main>
        <Hero />
        {CHAPTERS.map(([id], i) => {
          const Content = CONTENT[id]
          return (
            <section key={id} className={`chapter ${i % 2 ? 'flip' : ''}`} id={id}>
              <span className="ch-num" aria-hidden="true">{`0${i + 1}`}</span>
              <div className={`panel reveal ${id === 'rsvp' ? 'wide' : ''}`}>
                <div className="stitch" aria-hidden="true" />
                <Content look={look} setLook={setLook} />
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
