import { Suspense, createContext, lazy, useContext, useEffect, useRef, useState } from 'react'
import Tilt from './Tilt.jsx'

const Scene = lazy(() => import('./scene/Scene.jsx'))

/* ------------------------------------------------------------------
   Event looks — selecting one in "What to Wear" re-dyes the whole
   page: satin base, embroidery visibility, surfaces, text.
------------------------------------------------------------------- */
const LOOKS = {
  cocktail: {
    label: 'Cocktail Dinner',
    sub: 'Wednesday 16 Dec · Indo-western',
    note: 'Jewel tones in satin and silk — sharp collars, flowing drapes, a glint of antique gold.',
    swatches: [
      ['Deep green', '#1b3a2a'],
      ['Dusk', '#4d4560'],
      ['Antique gold', '#b08d3f'],
    ],
  },
  wedding: {
    label: 'Sundowner Wedding',
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
    sub: 'Thursday 17 Dec · after the wedding, till late',
    note: 'Silk and satin pyjama sets in midnight blue, blush and pearl. Slippers very welcome.',
    swatches: [
      ['Midnight', '#1c2340'],
      ['Blush', '#e8b4c0'],
      ['Pearl', '#f0e6d2'],
    ],
  },
}

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

function Hero() {
  return (
    <header className="hero">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <div className="hero-overlay">
        <p className="hero-kicker">With love, we invite you to the wedding of</p>
        <h1 className="hero-names">
          Ruchi<span className="amp">&amp;</span>Rahul
        </h1>
        <p className="hero-meta">16–17 December 2026 · Stardom Resort, Jaipur</p>
      </div>
      <div className="hero-scroll">Scroll</div>
    </header>
  )
}

function Events() {
  const cards = [
    {
      date: 'Wednesday · 16 December 2026',
      name: 'Cocktail Dinner',
      time: '7:00 PM onwards · Stardom Resort, Jaipur',
      attire: 'Attire — Elegant cocktail · Indo-western',
    },
    {
      date: 'Thursday · 17 December 2026',
      name: 'Sundowner Wedding',
      time: '5:00 PM onwards · Stardom Resort, Jaipur',
      attire: 'Attire — Indian festive attire',
    },
    {
      date: 'Thursday · 17 December 2026 · night',
      name: 'Pyjama Party',
      time: 'After the wedding, till late · poolside lawns',
      attire: 'Attire — Silk & satin pyjamas · slippers welcome',
    },
  ]
  return (
    <section className="events" id="celebrations">
      <div className="wrap">
        <Reveal>
          <p className="kicker">The Celebrations</p>
          <h2 className="section-title">Two days, three parties</h2>
          <p className="lede">
            Join us under the Jaipur sky at Stardom Resort — a cocktail evening, a sundowner wedding, and once the
            pheras are done, pyjamas by the pool.
          </p>
        </Reveal>
        <div className="event-grid">
          {cards.map((c, i) => (
            <Reveal key={c.name} delay={i * 140}>
              <Tilt>
                <div className="event-card">
                  <p className="date">{c.date}</p>
                  <h3>{c.name}</h3>
                  <p className="time">{c.time}</p>
                  <p className="attire">{c.attire}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function StayAndTravel() {
  const cards = [
    ['Check-in & out', 'Arrive Wednesday 16 Dec from noon. Depart Friday 18 Dec by noon. Meals hosted throughout.'],
    ['From Delhi', 'About 3½–5 hours by road via the Delhi–Mumbai Expressway. Complimentary parking at the resort.'],
    ['Flying in', 'Roughly 30 minutes from Jaipur International Airport. Share your arrival details in the RSVP and we will help you plan.'],
  ]
  return (
    <section className="band" id="stay">
      <div className="wrap">
        <Reveal>
          <p className="kicker">Your Stay &amp; Getting There</p>
          <h2 className="section-title">Two days to simply be together</h2>
          <p className="lede">
            A calm resort off Ajmer Road — open lawns, a glittering pool and room to simply be together for two days.
            All meals are hosted throughout your stay.
          </p>
        </Reveal>
        <div className="info-grid">
          {cards.map(([title, text], i) => (
            <Reveal key={title} delay={i * 140}>
              <Tilt max={7}>
                <div className="info-card">
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhatToWear() {
  const { look, setLook, sectionRef } = useContext(ThemeContext)
  const active = LOOKS[look]
  return (
    <section className="dress" id="what-to-wear" ref={sectionRef}>
      <div className="wrap">
        <Reveal>
          <p className="kicker">What to Wear</p>
          <h2 className="section-title">Dress the evening</h2>
          <p className="lede">Pick a celebration — the whole page slips into its satin.</p>
        </Reveal>
        <Reveal delay={120}>
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
        </Reveal>
        <div className="dress-panel">
          <Reveal delay={200}>
            <Tilt max={6}>
              <div className="palette-card">
                <h3>{active.label}</h3>
                <p className="sub">{active.sub}</p>
                <div className="swatches">
                  {active.swatches.map(([name, hex]) => (
                    <div className="swatch" key={name}>
                      <div className="chip" style={{ background: hex }} />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Tilt>
          </Reveal>
          <Reveal delay={320}>
            <p className="dress-note">“{active.note}”</p>
          </Reveal>
        </div>
        <Reveal delay={380}>
          <p className="dress-hint">The colours follow you while you are here — scroll on and the page returns to ivory.</p>
        </Reveal>
      </div>
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
    <section id="explore">
      <div className="wrap">
        <Reveal>
          <p className="kicker">Explore Jaipur</p>
          <h2 className="section-title">Arriving early or staying on?</h2>
          <p className="lede">The pink city is worth a wander — a few favourites, all within an hour of the resort.</p>
        </Reveal>
        <div className="explore-grid">
          {spots.map(([name, blurb], i) => (
            <Reveal key={name} delay={i * 110}>
              <Tilt max={8}>
                <div className="explore-card">
                  <h4>{name}</h4>
                  <p>{blurb}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Rsvp() {
  const [status, setStatus] = useState('idle') // idle | done | error

  async function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    data.append('form-name', 'rsvp')
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="rsvp" id="rsvp">
      <div className="wrap">
        <Reveal>
          <p className="kicker">RSVP</p>
          <h2 className="section-title">Kindly respond by 1 November 2026</h2>
          <p className="lede">Tell us you are coming — and everything we need to host you well.</p>
        </Reveal>
        {status === 'done' ? (
          <p className="rsvp-done">Thank you — we can’t wait to celebrate with you. ✨</p>
        ) : (
          <Reveal delay={120}>
            <form className="rsvp-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" type="text" required autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" required autoComplete="tel" />
              </div>
              <div className="field">
                <label htmlFor="attending">Will you attend?</label>
                <select id="attending" name="attending" required defaultValue="">
                  <option value="" disabled>Choose…</option>
                  <option>Joyfully accept — both days</option>
                  <option>Cocktail Dinner only (16 Dec)</option>
                  <option>Wedding only (17 Dec)</option>
                  <option>Regretfully decline</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="partySize">Guests in your party</label>
                <input id="partySize" name="partySize" type="number" min="1" max="12" defaultValue="1" />
              </div>
              <div className="field">
                <label htmlFor="rooms">Rooms needed</label>
                <input id="rooms" name="rooms" type="text" placeholder="e.g. 1 double" />
              </div>
              <div className="field">
                <label htmlFor="travelMode">Travelling by</label>
                <select id="travelMode" name="travelMode" defaultValue="">
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
              <button className="btn" type="submit">Send RSVP</button>
              {status === 'error' && (
                <p className="field full" style={{ color: 'var(--sunset)' }}>
                  Could not submit just now — the form works on the live site, or reach us directly.
                </p>
              )}
            </form>
          </Reveal>
        )}
      </div>
    </section>
  )
}

export default function App() {
  const [look, setLook] = useState('cocktail')
  const [inSection, setInSection] = useState(false)
  const sectionRef = useRef(null)

  // While the What to Wear section is on screen, the page wears the
  // selected event's colours; elsewhere it returns to ivory.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInSection(entry.isIntersecting), { threshold: 0.22 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (inSection) document.documentElement.dataset.theme = look
    else delete document.documentElement.dataset.theme
  }, [look, inSection])

  return (
    <ThemeContext.Provider value={{ look, setLook, sectionRef }}>
      <Hero />
      <main>
        <Events />
        <StayAndTravel />
        <WhatToWear />
        <Explore />
        <Rsvp />
      </main>
      <footer>
        <p className="names">Ruchi &amp; Rahul</p>
        <p className="tag">#RRkiShadi · 16–17 December 2026 · Jaipur</p>
      </footer>
    </ThemeContext.Provider>
  )
}
