import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import Mandap from './Mandap.jsx'
import Petals from './Petals.jsx'
import Lanterns from './Lanterns.jsx'
import Resort from './Resort.jsx'

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const v = (x, y, z) => new THREE.Vector3(x, y, z)

/** Gradient dusk sky behind the whole resort. */
function Sky({ colors }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, colors[0])
    g.addColorStop(0.62, colors[1])
    g.addColorStop(1, colors[2])
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 16, 256)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [colors])
  return (
    <mesh position={[0, 16, -58]}>
      <planeGeometry args={[240, 62]} />
      <meshBasicMaterial map={texture} fog={false} depthWrite={false} />
    </mesh>
  )
}

/* night: golden dusk like the reference photo · day: a blush-and-violet morning */
const PALETTES = {
  night: {
    bg: '#33395c',
    fog: '#4d4258',
    fogFar: 80,
    sky: ['#2b3154', '#7d6a86', '#eab377'],
    ambient: ['#c9b8c8', 0.45],
    key: ['#e0813f', 1.8],
    fill: ['#d9c48c', 0.5],
    point: 14,
    sparkle: '#d9c48c',
    ground: '#16281a',
    stars: true,
    vignette: 0.9,
    lantern: ['#ffb347', 2.4],
    petals: ['#e89b3c', '#e0813f', '#d9c48c', '#f3efe1'],
  },
  day: {
    bg: '#a8b8e8',
    fog: '#e8d4e4',
    fogFar: 90,
    sky: ['#a2b4e6', '#e8c8e0', '#ffe4ee'],
    ambient: ['#fff3f7', 0.95],
    key: ['#ffd9e8', 1.25],
    fill: ['#b9a3e0', 0.65],
    point: 6,
    sparkle: '#c3a6e8',
    ground: '#dbe5d4',
    stars: false,
    vignette: 0.4,
    lantern: ['#f2b6cf', 1.1],
    petals: ['#e8a7c3', '#c3a6e8', '#ffffff', '#f0d9e6'],
  },
}

/**
 * Scrolling walks you INTO the resort: arrive before the gates, pass
 * under the arch, drift along the lamp-lit walkway (a glance at the
 * pool), climb to the chhatri, and end standing inside it, gazing up
 * into the dome. Pointer hover (or the phone's physical tilt) sways
 * the camera on top of the path.
 */
function ScrollCamera({ scrollRef }) {
  const posCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          v(0, 2.9, 33), //   hero — straight on: the gate, the names in the arch
          v(0, 2.7, 22.5), // celebrations — passing under the arch
          v(-1.8, 2.3, 15), // stay — drifting toward the pool side
          v(1.6, 2.1, 9), //  what to wear — weaving back across the walkway
          v(0, 1.9, 4.8), // jaipur — at the foot of the steps
          v(0, 2.3, 0.8), // rsvp — stepping inside the chhatri
          v(0, 2.5, -0.3), // footer — beneath the dome
        ],
        false,
        'centripetal',
      ),
    [],
  )
  const lookCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          v(0, 3.9, 0), //  level gaze through the arch, drawn inward
          v(0, 2.8, 0),
          v(-5.5, 1.2, 10), // a glance across the pool
          v(0, 2.9, 0),
          v(0, 3.6, 0),
          v(0, 4.4, -0.6),
          v(0, 5.7, -0.2), // up into the dome
        ],
        false,
        'centripetal',
      ),
    [],
  )
  const smooth = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const orient = useRef({ x: 0, y: 0 })
  const p = useMemo(() => new THREE.Vector3(), [])
  const l = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    // the canvas never receives events (it sits behind the page), so
    // track the pointer on the window instead
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // Android device tilt; iOS needs a permission gesture — skip there
    let onOrient
    if (typeof DeviceOrientationEvent !== 'undefined' && !DeviceOrientationEvent.requestPermission) {
      onOrient = (e) => {
        if (e.gamma == null || e.beta == null) return
        orient.current.x = THREE.MathUtils.clamp(e.gamma / 28, -1, 1)
        orient.current.y = THREE.MathUtils.clamp((e.beta - 45) / 28, -1, 1)
      }
      window.addEventListener('deviceorientation', onOrient)
    }
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (onOrient) window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    smooth.current = THREE.MathUtils.damp(smooth.current, scrollRef.current, 2.2, delta)
    const s = THREE.MathUtils.clamp(smooth.current, 0, 1)
    posCurve.getPoint(s, p)
    lookCurve.getPoint(s, l)

    const hx = THREE.MathUtils.clamp(pointer.current.x + orient.current.x, -1.2, 1.2)
    const hy = THREE.MathUtils.clamp(pointer.current.y - orient.current.y, -1.2, 1.2)

    state.camera.position.set(
      p.x + hx * 1.7 + Math.sin(t * 0.14) * 0.35,
      p.y + hy * 1.0 + Math.sin(t * 0.19) * 0.2,
      p.z,
    )
    state.camera.lookAt(l)
  })
  return null
}

export default function Scene({ scrollRef, mode = 'night' }) {
  const pal = PALETTES[mode] || PALETTES.night
  return (
    <Canvas
      dpr={isTouch ? 1 : [1, 1.5]}
      camera={{ position: [0, 2.9, 33], fov: isTouch ? 58 : 46 }}
      gl={{ antialias: !isTouch, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={[pal.bg]} />
      <fog attach="fog" args={[pal.fog, 22, pal.fogFar]} />
      <Sky colors={pal.sky} />

      <ambientLight intensity={pal.ambient[1]} color={pal.ambient[0]} />
      <directionalLight position={[-8, 6, -4]} intensity={pal.key[1]} color={pal.key[0]} />
      <directionalLight position={[6, 8, 6]} intensity={pal.fill[1]} color={pal.fill[0]} />
      <pointLight position={[0, 3.2, 0]} intensity={pal.point} color="#ffb347" distance={12} decay={2} />

      <Mandap />
      <Resort mode={mode} />
      <Lanterns color={pal.lantern[0]} intensity={pal.lantern[1]} />
      <Petals count={isTouch ? 110 : 240} colors={pal.petals} xSpread={26} zMin={-6} zMax={24} />

      <Sparkles count={isTouch ? 50 : 90} scale={[18, 8, 26]} position={[0, 3.5, 7]} size={2.2} speed={0.35} color={pal.sparkle} />
      {pal.stars && <Stars radius={70} depth={40} count={isTouch ? 800 : 1500} factor={3} saturation={0} fade speed={0.6} />}

      {/* lawns */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.05}>
        <circleGeometry args={[70, 48]} />
        <meshStandardMaterial color={pal.ground} roughness={1} />
      </mesh>

      <ScrollCamera scrollRef={scrollRef} />
      <EffectComposer enabled={!isTouch}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1} />
        <Vignette eskil={false} offset={0.15} darkness={pal.vignette} />
      </EffectComposer>
    </Canvas>
  )
}
