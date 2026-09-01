import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Tilt from '../Tilt.jsx'

/* ------------------------------------------------------------------
   The chapters live INSIDE the 3D resort as boards along the walk:
   celebrations just past the gate, stay by the pool, what-to-wear on
   the path, Jaipur near the steps, RSVP inside the chhatri. The
   camera stops in front of each. Order must match the page sections.
------------------------------------------------------------------- */
export const PANELS = [
  { id: 'celebrations', pos: [2.8, 2.55, 16.8], ry: -0.35, scale: 0.0053, dist: 6.2 },
  { id: 'stay', pos: [-3.3, 2.5, 11.4], ry: 0.42, scale: 0.0053, dist: 6.2 },
  { id: 'what-to-wear', pos: [2.9, 2.5, 6.6], ry: -0.42, scale: 0.0053, dist: 6.2 },
  { id: 'jaipur', pos: [-3.2, 2.6, 2.2], ry: 0.45, scale: 0.005, dist: 6.4 },
  { id: 'rsvp', pos: [0, 2.8, -0.9], ry: 0, scale: 0.0038, mScale: 0.0053, dist: 7.0 },
]

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export const LOOKS = {
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

function Celebrations() {
  const rows = [
    ['16', 'Dec · Wed', 'Cocktail Dinner', '7:00 PM onwards · Stardom Resort, Jaipur', 'Elegant cocktail · Indo-western'],
    ['17', 'Dec · Thu', 'Sundowner Wedding', '5:00 PM onwards · Stardom Resort, Jaipur', 'Indian festive attire'],
    ['17', 'Dec · Night', 'Pyjama Party', 'After the wedding, till late · poolside lawns', 'Silk & satin pyjamas · slippers welcome'],
  ]
  return (
    <>
      <p className="kicker">the celebrations</p>
      <h2 className="section-title">Two Days · Three Parties</h2>
      <p className="lede">
        A cocktail evening, a sundowner wedding, and once the pheras are done, pyjamas by the pool.
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
    </>
  )
}

function Stay() {
  const cards = [
    ['Check-in · out', 'Arrive Wednesday 16 Dec from noon. Depart Friday 18 Dec by noon. All meals hosted throughout.'],
    ['From Delhi', 'About 3½–5 hours by road via the Delhi–Mumbai Expressway. Complimentary parking at the resort.'],
    ['Flying in', 'Roughly 30 minutes from Jaipur International Airport. Share arrival details in the RSVP and we will help you plan.'],
  ]
  return (
    <>
      <p className="kicker">your stay &amp; getting there</p>
      <h2 className="section-title">Room to Be Together</h2>
      <p className="lede">A calm resort off Ajmer Road — open lawns, a glittering pool and room to simply be together.</p>
      <div className="info-grid">
        {cards.map(([title, text]) => (
          <Tilt key={title} max={7}>
            <div className="info-card">
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          </Tilt>
        ))}
      </div>
    </>
  )
}

function WhatToWear({ look, setLook }) {
  const active = LOOKS[look]
  return (
    <>
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
    </>
  )
}

function Explore() {
  const spots = [
    {
      img: '/jaipur/amber.jpg',
      name: 'Amber Fort',
      blurb: 'Hilltop ramparts and mirror-work halls.',
      maps: 'https://www.google.com/maps/search/?api=1&query=Amber+Fort+Jaipur',
    },
    {
      img: '/jaipur/hawa.jpg',
      name: 'Hawa Mahal',
      blurb: 'The pink honeycomb facade of the old city.',
      maps: 'https://www.google.com/maps/search/?api=1&query=Hawa+Mahal+Jaipur',
    },
    {
      img: '/jaipur/city.jpg',
      name: 'City Palace',
      blurb: 'Courtyards, peacock gates, royal collection.',
      maps: 'https://www.google.com/maps/search/?api=1&query=City+Palace+Jaipur',
    },
    {
      img: '/jaipur/johari.jpg',
      name: 'Johri Bazaar',
      blurb: 'Jewellery, block prints and lac bangles.',
      maps: 'https://www.google.com/maps/search/?api=1&query=Johari+Bazaar+Jaipur',
    },
  ]
  return (
    <>
      <p className="kicker">explore jaipur</p>
      <h2 className="section-title">The Pink City Waits</h2>
      <p className="lede">All within an hour of the resort — tap one to walk around it on the map.</p>
      <div className="explore-grid">
        {spots.map((s) => (
          <a className="explore-card photo" key={s.name} href={s.maps} target="_blank" rel="noreferrer">
            <img src={s.img} alt={s.name} loading="lazy" />
            <div className="ex-overlay">
              <h4>{s.name}</h4>
              <p>{s.blurb}</p>
              <span className="ex-walk">Walk around →</span>
            </div>
          </a>
        ))}
      </div>
      <p className="ex-credit">Photographs · Wikimedia Commons</p>
    </>
  )
}

/** Custom dropdown — reliable and styled inside the 3D-transformed panel. */
function Dropdown({ id, name, label, options, placeholder = 'Choose…' }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  return (
    <div className="field dd-field" ref={ref}>
      <label htmlFor={id}>{label}</label>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        className={`dd-btn ${open ? 'open' : ''} ${value ? '' : 'empty'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {value || placeholder}
        <span className="dd-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="dd-list" role="listbox" aria-labelledby={id}>
          {options.map((o) => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              className={o === value ? 'sel' : ''}
              onClick={() => {
                setValue(o)
                setOpen(false)
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Rsvp() {
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const form = new FormData(e.target)
    const events = form.getAll('events').join(', ')
    const payload = Object.fromEntries(form.entries())
    delete payload.events
    payload.events = events
    if (!payload.attending) {
      setStatus('incomplete')
      return
    }
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
    <>
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
          <Dropdown
            id="attending"
            name="attending"
            label="Will you attend?"
            options={['Joyfully accept', 'Regretfully decline']}
          />
          <div className="field">
            <label htmlFor="party_size">Guests in your party</label>
            <input id="party_size" name="party_size" type="number" min="1" max="12" defaultValue="1" />
          </div>
          <div className="field full">
            <label>Which celebrations?</label>
            <div className="checks">
              <label className="check"><input type="checkbox" name="events" value="Cocktail Dinner" defaultChecked /> Cocktail</label>
              <label className="check"><input type="checkbox" name="events" value="Sundowner Wedding" defaultChecked /> Wedding</label>
              <label className="check"><input type="checkbox" name="events" value="Pyjama Party" defaultChecked /> Pyjama Party</label>
            </div>
          </div>
          <div className="field">
            <label htmlFor="rooms">Rooms needed</label>
            <input id="rooms" name="rooms" type="text" placeholder="e.g. 1 double" />
          </div>
          <Dropdown id="travel_mode" name="travel_mode" label="Travelling by" options={['Car', 'Flight', 'Train', 'Other']} />
          <div className="field">
            <label htmlFor="arrival">Arrival</label>
            <input id="arrival" name="arrival" type="text" placeholder="16 Dec, 2 PM" />
          </div>
          <div className="field">
            <label htmlFor="departure">Departure</label>
            <input id="departure" name="departure" type="text" placeholder="18 Dec, 11 AM" />
          </div>
          <Dropdown id="dietary" name="dietary" label="Dietary preference" options={['Vegetarian', 'Non-vegetarian', 'Jain', 'Vegan']} />
          <div className="field">
            <label htmlFor="song">A song that gets you dancing</label>
            <input id="song" name="song" type="text" placeholder="Optional" />
          </div>
          <div className="field full">
            <label htmlFor="notes">Anything else we should know?</label>
            <textarea id="notes" name="notes" rows="2" />
          </div>
          <button className="btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send RSVP'}
          </button>
          {status === 'error' && (
            <p className="rsvp-error">Could not submit just now — please try again, or reach us directly.</p>
          )}
          {status === 'incomplete' && (
            <p className="rsvp-error">Please choose whether you will attend.</p>
          )}
        </form>
      )}
    </>
  )
}

const CONTENT = {
  celebrations: Celebrations,
  stay: Stay,
  'what-to-wear': WhatToWear,
  jaipur: Explore,
  rsvp: Rsvp,
}

/**
 * Renders the five boards into the world and fades each in as the
 * camera arrives at its stop (and out as it walks on).
 */
export default function Panels({ look, setLook, scrollRef }) {
  const refs = useRef([])


  useFrame(() => {
    const p = (scrollRef.current || 0) * 6
    PANELS.forEach((cfg, i) => {
      const el = refs.current[i]
      if (!el) return
      const d = Math.abs(p - (i + 1))
      const op = THREE.MathUtils.clamp(1 - (d - 0.5) / 0.4, 0, 1)
      el.style.opacity = op.toFixed(2)
      el.style.pointerEvents = op > 0.5 ? 'auto' : 'none'
    })
  })

  return PANELS.map((cfg, i) => {
    const Content = CONTENT[cfg.id]
    return (
      <Html
        key={cfg.id}
        transform
        position={cfg.pos}
        rotation-y={cfg.ry}
        scale={isTouch && cfg.mScale ? cfg.mScale : cfg.scale}
        distanceFactor={400}
        zIndexRange={[20, 0]}
      >
        <div className="p3d-holder" ref={(el) => (refs.current[i] = el)}>
          <div className={`panel panel3d ${cfg.id === 'rsvp' ? 'wide3d' : ''}`}>
            <div className="stitch" aria-hidden="true" />
            <Content look={look} setLook={setLook} />
          </div>
        </div>
      </Html>
    )
  })
}
