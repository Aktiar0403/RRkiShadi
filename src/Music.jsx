import { useEffect, useRef, useState } from 'react'

const SRC = '/music/raabta.mp3'
const TARGET_VOLUME = 0.32
const PREF_KEY = 'rr-music'

function getPref() {
  try {
    return localStorage.getItem(PREF_KEY)
  } catch {
    return null
  }
}
function setPref(v) {
  try {
    localStorage.setItem(PREF_KEY, v)
  } catch {
    /* private mode etc. */
  }
}

/**
 * Background music — Raabta instrumental, looping softly.
 * Browsers block autoplay with sound, so playback begins on the
 * visitor's first tap/click (unless they previously switched it off).
 * If /music/raabta.mp3 is absent, the toggle stays hidden.
 */
export default function Music() {
  const audioRef = useRef(null)
  const fadeRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [state, setState] = useState('loading') // loading | ready | missing

  function fadeTo(target, then) {
    const audio = audioRef.current
    if (!audio) return
    cancelAnimationFrame(fadeRef.current)
    const from = audio.volume
    const start = performance.now()
    const dur = 1200
    const step = (now) => {
      const k = Math.min((now - start) / dur, 1)
      audio.volume = from + (target - from) * k
      if (k < 1) fadeRef.current = requestAnimationFrame(step)
      else if (then) then()
    }
    fadeRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    const audio = new Audio(SRC)
    audio.loop = true
    audio.volume = 0
    audio.preload = 'auto'
    audioRef.current = audio
    const onReady = () => setState('ready')
    const onError = () => setState('missing')
    audio.addEventListener('canplaythrough', onReady, { once: true })
    audio.addEventListener('error', onError, { once: true })
    return () => {
      cancelAnimationFrame(fadeRef.current)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  function play() {
    const audio = audioRef.current
    if (!audio) return
    audio
      .play()
      .then(() => {
        setPlaying(true)
        fadeTo(TARGET_VOLUME)
      })
      .catch(() => {
        /* blocked — the toggle still works on direct tap */
      })
  }

  function stop() {
    const audio = audioRef.current
    if (!audio) return
    fadeTo(0, () => audio.pause())
    setPlaying(false)
  }

  // begin on the visitor's first interaction, unless they opted out before
  useEffect(() => {
    if (state !== 'ready' || getPref() === 'off') return
    const start = () => play()
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [state])

  if (state !== 'ready') return null

  function toggle(e) {
    e.stopPropagation()
    if (playing) {
      setPref('off')
      stop()
    } else {
      setPref('on')
      play()
    }
  }

  return (
    <button
      className={`music-btn ${playing ? 'on' : ''}`}
      onClick={toggle}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={playing ? 'Pause background music' : 'Play background music'}
      title="Raabta (instrumental)"
    >
      <span className="eq" aria-hidden="true">
        <i /><i /><i />
      </span>
    </button>
  )
}
