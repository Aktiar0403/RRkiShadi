import { useEffect, useRef, useState } from 'react'
import Tilt from './Tilt.jsx'
import Figures from './Figures.jsx'

/* ------------------------------------------------------------------
   The five chapters of the invitation (rendered by App.jsx).
------------------------------------------------------------------- */

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
    sub: 'Thursday 17 Dec · after the pheras, till the sun comes up',
    note: 'Pyjamas, or whatever you wore to the wedding — nobody is checking. Slippers very welcome.',
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
    ['17', 'Dec · Night', 'Pyjama Party', 'After the pheras · till the sun comes up', 'Pyjamas, or whatever you wore to the wedding'],
  ]
  return (
    <>
      <p className="kicker">the celebrations</p>
      <h2 className="section-title">Two Days · Three Parties</h2>
      <p className="lede">
        A cocktail evening, a sundowner wedding — and once the pheras are done, a pyjama party that
        carries on until the sun is up again.
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
      <div className="venue-strip">
        {[
          ['/venue/pool.jpg', 'The resort pool'],
          ['/venue/lawn.jpg', 'The lawns'],
          ['/venue/room.jpg', 'A guest room'],
        ].map(([src, alt]) => (
          <img key={src} src={src} alt={alt} loading="lazy" />
        ))}
      </div>
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

function WhatToWear() {
  const [look, setLookState] = useState('cocktail')
  const [shade, setShade] = useState(0)
  const active = LOOKS[look]
  const setLook = (key) => {
    setLookState(key)
    setShade(0)
  }
  const color = active.swatches[Math.min(shade, active.swatches.length - 1)][1]
  return (
    <>
      <p className="kicker">what to wear</p>
      <h2 className="section-title">Dress the Evening</h2>
      <p className="lede">Three evenings, three palettes — pick an evening, then tap a colour to dress them.</p>
      <div className="wear">
        <div className="wear-stage">
          <Figures look={look} color={color} />
        </div>
        <div className="wear-controls">
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
          <div className="swatches" role="radiogroup" aria-label="Dress them in">
            {active.swatches.map(([name, hex], i) => (
              <button
                type="button"
                role="radio"
                aria-checked={i === shade}
                className={`swatch ${i === shade ? 'active' : ''}`}
                key={name}
                onClick={() => setShade(i)}
              >
                <span className="chip" style={{ background: hex }} />
                <span>{name}</span>
              </button>
            ))}
          </div>
          <p className="dress-note">“{active.note}”</p>
          <p className="dress-sub">{active.title} — {active.sub}</p>
        </div>
      </div>
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
    const payload = Object.fromEntries(form.entries())
    payload.events = 'All celebrations'
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
          <div className="field">
            <label htmlFor="rooms">Rooms needed</label>
            <input id="rooms" name="rooms" type="text" placeholder="e.g. 1 double" />
          </div>
          <Dropdown
            id="travel_mode"
            name="travel_mode"
            label="Travelling by"
            options={['Car', 'Flight', 'Train', 'I need help arranging transport', 'Other']}
          />
          <div className="field">
            <label htmlFor="arrival">Arrival</label>
            <input id="arrival" name="arrival" type="text" placeholder="16 Dec, 2 PM" />
          </div>
          <div className="field">
            <label htmlFor="departure">Departure</label>
            <input id="departure" name="departure" type="text" placeholder="18 Dec, 11 AM" />
          </div>
          <Dropdown id="dietary" name="dietary" label="Dietary preference" options={['Vegetarian', 'Non-vegetarian']} />
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

export const CONTENT = {
  celebrations: Celebrations,
  stay: Stay,
  'what-to-wear': WhatToWear,
  jaipur: Explore,
  rsvp: Rsvp,
}
