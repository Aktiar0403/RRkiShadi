import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import Music from './Music.jsx'

const Scene = lazy(() => import('./scene/Scene.jsx'))

/* The chapter content lives INSIDE the 3D world (src/scene/Panels.jsx);
   these sections are scroll spacers that pace the camera's walk. */
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
    <section className="hero" id="top">
      {/* the gate in the 3D scene carries the names — this stays for screen readers */}
      <h1 className="sr-only">With love, we invite you to the wedding of Ruchi and Rahul — 16–17 December 2026, Stardom Resort, Jaipur</h1>
      <div className="hero-bottom">
        <div className="hero-rule" aria-hidden="true" />
        <p className="hero-meta">16 · 17 December 2026 — Stardom Resort, Jaipur</p>
        <div className="hero-scroll" aria-hidden="true" />
      </div>
    </section>
  )
}

export default function App() {
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
  const scrollRef = useRef(0)

  // day / night skin — page and 3D scene together
  useEffect(() => {
    document.documentElement.dataset.mode = mode
    try {
      localStorage.setItem('rr-mode', mode)
    } catch {
      /* private mode */
    }
  }, [mode])

  // scroll progress: drives the top bar and the camera's walk
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      scrollRef.current = p
      document.documentElement.style.setProperty('--progress', p.toFixed(4))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // rail highlight
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveChapter(e.target.id)
      },
      { threshold: 0.4 },
    )
    for (const [id] of CHAPTERS) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  // While the What-to-Wear stop is on screen, the night wears the look.
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
      <div className="stage">
        <Suspense fallback={null}>
          <Scene scrollRef={scrollRef} mode={mode} look={look} setLook={setLook} />
        </Suspense>
      </div>
      <Rail active={activeChapter} />
      <main>
        <Hero />
        {CHAPTERS.map(([id], i) => (
          <section key={id} className="chapter" id={id}>
            <span className="ch-num" aria-hidden="true">{`0${i + 1}`}</span>
          </section>
        ))}
      </main>
      <footer>
        <span className="f-script">see you in Jaipur</span>
        <p className="f-names">Ruchi &amp; Rahul</p>
        <p className="tag">#RRkiShadi · 16–17 December 2026</p>
        <a className="f-switch" href="/static">Lite version · no 3D</a>
      </footer>
    </>
  )
}
