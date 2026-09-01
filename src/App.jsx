import { Suspense, createContext, lazy, useContext, useEffect, useRef, useState } from 'react'
import Tilt from './Tilt.jsx'
import Music from './Music.jsx'

const Scene = lazy(() => import('./scene/Scene.jsx'))

/* ------------------------------------------------------------------
   Event looks — selecting one in "What to Wear" re-tints the night.
------------------------------------------------------------------- */
const LOOKS = {
  cocktail: {
    label: 'Cocktail',
    title: 'Cocktail Dinner',
    sub: 'Wednesday 16 Dec · Indo-western',
    note: 'Jewel tones in satin and silk — sharp collars, flowing drapes, a glint of antique gold.',
    swatches: [
      ['Deep green', '#1b3a2a'],
      ['Dusk', '#4d4560'],
      ['Antique gold', '#b08d3f'],
    ],
  },
  wedding: {
    label: 'Wedding',
    title: 'Sundowner Wedding',
    sub: 'Thursday 17 Dec · Indian festive',
    note: 'Tea green, ivory and a stroke of sunset — soft festive colours for the golden hour.',
    swatches: [
      ['Tea green', '#cfdcc3'],
      ['Ivory', '#f3efe1'],
      ['Sunset', '#e0813f'],
    ],
  },
  pyjama: {
    label: 'Pyjama Party',
    title: 'Pyjama Party',
    sub: 'Thursday 17 Dec · after the wedding, till late',
    note: 'Silk and satin pyjama sets in midnight blue, blush and pearl. Slippers very welcome.',
    swatches: [
      ['Midnight', '#1c2340'],
      ['Blush', '#e8b4c0'],
      ['Pearl', '#f0e6d2'],
    ],
  },
}

const CHAPTERS = [
  ['celebrations', 'Celebrations'],
  ['stay', 'Stay & Travel'],
  ['what-to-wear', 'What to Wear'],
  ['jaipur', 'Jaipur'],
  ['rsvp', 'RSVP'],
]

const ThemeContext = createContext(null)

/** Adds .visible when the block scrolls into view; optional stagger delay. */
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
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

function Marquee() {
  const text = (
    <>
      {'RUCHI '}<b>✦</b>{' RAHUL '}<b>✦</b>{' 16 · 17 DECEMBER 2026 '}<b>✦</b>{' STARDOM RESORT · JAIPUR '}<b>✦</b>{' #RRKISHADI '}<b>✦</b>{' '}
    </>
  )
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {text}{text}{text}{text}
      </div>
    </div>
  )
}

function Celebrations() {
  const rows = [
    ['16', 'Dec · Wed', 'Cocktail Dinner', '7:00 PM onwards · Stardom Resort, Jaipur', 'Elegant cocktail · Indo-western'],
    ['17', 'Dec · Thu', 'Sundowner Wedding', '5:00 PM onwards · Stardom Resort, Jaipur', 'Indian festive attire'],
    ['17', 'Dec · Night', 'Pyjama Party', 'After the wedding, till late · poolside lawns', 'Silk & satin pyjamas · slippers welcome'],
  ]
  return (
    <section className="chapter" id="celebrations">
      <span className="ch-num" aria-hidden="true">01</span>
      <Reveal className="panel-holder" >
        <div className="panel wide">
          <div className="stitch" aria-hidden="true" />
          <p className="kicker">the celebrations</p>
          <h2 className="section-title">Two Days · Three Parties</h2>
          <p className="lede">
            Under the Jaipur sky at Stardom Resort — a cocktail evening, a sundowner wedding, and once the pheras are
            done, pyjamas by the pool.
          </p>
          <div className="event-list">
            {rows.map(([day, mon, name, time, attire], i) => (
              <div className="event-row" key={name + i}>
                <div className="when">
                  <b>{day}</b>
                  {mon}
                </div>
                <div>
                  <h3>{name}</h3>
                  <p className="time">{time}</p>
                  <p className="attire">{attire}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function StayAndTravel() {
  const cards = [
    ['Check-in · out', 'Arrive Wednesday 16 Dec from noon. Depart Friday 18 Dec by noon. All meals hosted throughout.'],
    ['From Delhi', 'About 3½–5 hours by road via the Delhi–Mumbai Expressway. Complimentary parking at the resort.'],
    ['Flying in', 'Roughly 30 minutes from Jaipur International Airport. Share arrival details in the RSVP and we will help you plan.'],
  ]
  return (
    <section className="chapter flip" id="stay">
      <span className="ch-num" aria-hidden="true">02</span>
      <Reveal>
        <div className="panel wide">
          <div className="stitch" aria-hidden="true" />
          <p className="kicker">your stay &amp; getting there</p>
          <h2 className="section-title">Room to Be Together</h2>
          <p className="lede">
            A calm resort off Ajmer Road — open lawns, a glittering pool and room to simply be together for two days.
          </p>
          <div className="info-grid">
            {cards.map(([title, text], i) => (
              <Tilt key={title} max={7}>
                <div className="info-card">
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function WhatToWear() {
  const { look, setLook, sectionRef } = useContext(ThemeContext)
  const active = LOOKS[look]
  return (
    <section className="chapter" id="what-to-wear" ref={sectionRef}>
      <span className="ch-num" aria-hidden="true">03</span>
      <Reveal>
        <div className="panel">
          <div className="stitch" aria-hidden="true" />
          <p className="kicker">what to wear</p>
          <h2 className="section-title">Dress the Evening</h2>
          <p className="lede">Pick a celebration — the whole night re-tints itself around you.</p>
          <div className="tabs" role="tablist" aria-label="Choose an event look">
            {Object.entries(LOOKS).map(([key, l]) => (
              <button
                key={key}
                role="tab"
                aria-selected={look === key}
                className={`tab ${look === key ? 'active' : ''}`}
                onClick={() => setLook(key)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="swatches">
            {active.swatches.map(([name, hex]) => (
              <div className="swatch" key={name}>
                <div className="chip" style={{ background: hex }} />
                <span>{name}</span>
              </div>
            ))}
          </div>
          <p className="dress-note">“{active.note}”</p>
          <p className="dress-sub">{active.title} — {active.sub}</p>
          <p className="dress-hint">The colours follow you while you are here — scroll on and the night returns to midnight and gold.</p>
        </div>
      </Reveal>
    </section>
  )
}

function Explore() {
  const spots = [
    ['Amber Fort', 'Hilltop ramparts and mirror-work halls — go early for golden light.'],
    ['Hawa Mahal', 'The pink honeycomb facade of the old city, best seen from the cafés across.'],
    ['City Palace', 'Courtyards, peacock gates and the royal collection in the heart of Jaipur.'],
    ['Johri Bazaar', 'Jewellery, block prints and lac bangles — leave room in your suitcase.'],
  ]
  return (
    <section className="chapter flip" id="jaipur">
      <span className="ch-num" aria-hidden="true">04</span>
      <Reveal>
        <div className="panel">
          <div className="stitch" aria-hidden="true" />
          <p className="kicker">explore jaipur</p>
          <h2 className="section-title">The Pink City Waits</h2>
          <p className="lede">Arriving early or staying on? A few favourites, all within an hour of the resort.</p>
          <div className="explore-grid">
            {spots.map(([name, blurb]) => (
              <Tilt key={name} max={8}>
                <div className="explore-card">
                  <h4>{name}</h4>
                  <p>{blurb}</p>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Rsvp() {
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const form = new FormData(e.target)
    const events = form.getAll('events').join(', ')
    const payload = Object.fromEntries(form.entries())
    delete payload.events
    payload.events = events
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="chapter" id="rsvp">
      <span className="ch-num" aria-hidden="true">05</span>
      <Reveal>
        <div className="panel wide">
          <div className="stitch" aria-hidden="true" />
          <p className="kicker">rsvp</p>
          <h2 className="section-title">Respond by 1 November 2026</h2>
          <p className="lede">Tell us you are coming — and everything we need to host you well.</p>
          {status === 'done' ? (
            <p className="rsvp-done">Thank you — we can’t wait to celebrate with you.</p>
          ) : (
            <form className="rsvp-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="full_name">Full name</label>
                <input id="full_name" name="full_name" type="text" required autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" required autoComplete="tel" />
              </div>
              <div className="field">
                <label htmlFor="attending">Will you attend?</label>
                <select id="attending" name="attending" required defaultValue="">
                  <option value="" disabled>Choose…</option>
                  <option>Joyfully accept</option>
                  <option>Regretfully decline</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="party_size">Guests in your party</label>
                <input id="party_size" name="party_size" type="number" min="1" max="12" defaultValue="1" />
              </div>
              <div className="field full">
                <label>Which celebrations?</label>
                <div className="checks">
                  <label className="check"><input type="checkbox" name="events" value="Cocktail Dinner" defaultChecked /> Cocktail Dinner</label>
                  <label className="check"><input type="checkbox" name="events" value="Sundowner Wedding" defaultChecked /> Sundowner Wedding</label>
                  <label className="check"><input type="checkbox" name="events" value="Pyjama Party" defaultChecked /> Pyjama Party</label>
                </div>
              </div>
              <div className="field">
                <label htmlFor="rooms">Rooms needed</label>
                <input id="rooms" name="rooms" type="text" placeholder="e.g. 1 double" />
              </div>
              <div className="field">
                <label htmlFor="travel_mode">Travelling by</label>
                <select id="travel_mode" name="travel_mode" defaultValue="">
                  <option value="" disabled>Choose…</option>
                  <option>Car</option>
                  <option>Flight</option>
                  <option>Train</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="arrival">Arrival (date &amp; time)</label>
                <input id="arrival" name="arrival" type="text" placeholder="16 Dec, 2 PM" />
              </div>
              <div className="field">
                <label htmlFor="departure">Departure</label>
                <input id="departure" name="departure" type="text" placeholder="18 Dec, 11 AM" />
              </div>
              <div className="field">
                <label htmlFor="dietary">Dietary preference</label>
                <select id="dietary" name="dietary" defaultValue="">
                  <option value="" disabled>Choose…</option>
                  <option>Vegetarian</option>
                  <option>Non-vegetarian</option>
                  <option>Jain</option>
                  <option>Vegan</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="song">A song that gets you dancing</label>
                <input id="song" name="song" type="text" placeholder="Optional" />
              </div>
              <div className="field full">
                <label htmlFor="notes">Anything else we should know?</label>
                <textarea id="notes" name="notes" rows="3" />
              </div>
              <button className="btn" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send RSVP'}
              </button>
              {status === 'error' && (
                <p className="rsvp-error">Could not submit just now — please try again, or reach us directly.</p>
              )}
            </form>
          )}
        </div>
      </Reveal>
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
  const sectionRef = useRef(null)
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

  // scroll progress: drives the top bar and the 3D camera path
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

  // While What to Wear is on screen, the night wears the selected look.
  useEffect(() => {
    const el = sectionRef.current
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
    <ThemeContext.Provider value={{ look, setLook, sectionRef }}>
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
          <Scene scrollRef={scrollRef} mode={mode} />
        </Suspense>
      </div>
      <Rail active={activeChapter} />
      <main>
        <Hero />
        <Marquee />
        <Celebrations />
        <StayAndTravel />
        <WhatToWear />
        <Explore />
        <Rsvp />
      </main>
      <footer>
        <span className="f-script">see you in Jaipur</span>
        <p className="f-names">Ruchi &amp; Rahul</p>
        <p className="tag">#RRkiShadi · 16–17 December 2026</p>
      </footer>
    </ThemeContext.Provider>
  )
}
