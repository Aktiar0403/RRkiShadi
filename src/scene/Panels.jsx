import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CONTENT } from '../Content.jsx'

/* ------------------------------------------------------------------
   The chapters live INSIDE the 3D resort as boards along the walk:
   celebrations just past the gate, stay by the pool, what-to-wear on
   the path, Jaipur near the steps, RSVP inside the chhatri. The
   camera stops in front of each. Order must match the page sections.
------------------------------------------------------------------- */
export const PANELS = [
  { id: 'celebrations', pos: [2.8, 2.4, 16.8], ry: -0.35, scale: 0.0053, dist: 6.2 },
  { id: 'stay', pos: [-3.3, 2.4, 11.4], ry: 0.42, scale: 0.0053, dist: 6.2 },
  { id: 'what-to-wear', pos: [2.9, 2.4, 6.6], ry: -0.42, scale: 0.0053, dist: 6.2 },
  { id: 'jaipur', pos: [-3.2, 2.45, 2.2], ry: 0.45, scale: 0.005, dist: 6.4 },
  { id: 'rsvp', pos: [0, 2.6, -0.9], ry: 0, scale: 0.0038, mScale: 0.0053, dist: 7.0 },
]

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/* Measured world-space size of each board (px × scale × transform
   factor) — the camera uses this to stand exactly close enough that
   the card fills the view. */
export const panelWorld = []
const SCALE_K = 1.0 // CSS3D convention: 1px × object scale = world units

/**
 * Renders the five boards into the world and fades each in as the
 * camera arrives at its stop (and out as it walks on).
 */
export default function Panels({ look, setLook, scrollRef }) {
  const refs = useRef([])

  // measure each board once rendered (and again after fonts / resize)
  useEffect(() => {
    const measure = () => {
      PANELS.forEach((cfg, i) => {
        const el = refs.current[i]
        if (!el || !el.offsetWidth) return
        const s = isTouch && cfg.mScale ? cfg.mScale : cfg.scale
        panelWorld[i] = { w: el.offsetWidth * s * SCALE_K, h: el.offsetHeight * s * SCALE_K }
      })
    }
    const t = setTimeout(measure, 400)
    document.fonts?.ready?.then(() => setTimeout(measure, 150))
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [])


  useFrame(() => {
    const p = (scrollRef.current || 0) * 6
    PANELS.forEach((cfg, i) => {
      const el = refs.current[i]
      if (!el) return
      const d = Math.abs(p - (i + 1))
      // appear only once the camera has essentially arrived at the stop
      const op = THREE.MathUtils.clamp(1 - (d - 0.3) / 0.2, 0, 1)
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
