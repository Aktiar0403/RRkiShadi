import { useEffect, useState } from 'react'
import Music from './Music.jsx'
import { CONTENT } from './Content.jsx'

/* ------------------------------------------------------------------
   Static edition — the same invitation without the 3D walk. No
   camera, no canvas: a photo-and-gradient backdrop, the names in the
   hero, and the five chapters as glass panels down the page.
------------------------------------------------------------------- */
const CHAPTERS = [
  ['celebrations', 'Celebrations'],
  ['stay', 'Stay & Travel'],
  ['what-to-wear', 'What to Wear'],
  ['jaipur', 'Jaipur'],
  ['rsvp', 'RSVP'],
]

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
    <section className="hero static-hero" id="top">
      <div className="static-hero-photo" aria-hidden="true" />
      <div className="static-hero-body">
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

export default function StaticApp() {
  const [look, setLook] = useState('cocktail')
  const [inSection, setInSection] = useState(false)
  const [activeChapter, setActiveChapter] = useState('')
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('rr-mode') === 'day' ? 'day' : 'night'
    } catch {
      return 'night'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    try {
      localStorage.setItem('rr-mode', mode)
    } catch {
      /* private mode */
    }
  }, [mode])

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

  // While What-to-Wear is on screen, the page wears the chosen look.
  useEffect(() => {
    const el = document.getElementById('what-to-wear')
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInSection(entry.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (inSection) document.documentElement.dataset.theme = look
    else delete document.documentElement.dataset.theme
  }, [look, inSection])

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
      <div className="static-bg" aria-hidden="true" />
      <Rail active={activeChapter} />
      <main className="static-main">
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
        <a className="f-switch" href="/">Walk into the resort in 3D</a>
      </footer>
    </>
  )
}
