import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Sparkles, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Mandap from './Mandap.jsx'
import Petals from './Petals.jsx'
import Lanterns from './Lanterns.jsx'
import Resort from './Resort.jsx'
import Panels, { PANELS, panelWorld } from './Panels.jsx'

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const v = (x, y, z) => new THREE.Vector3(x, y, z)

/**
 * Jaipur on the horizon — hazy hills with fort walls, then rows of
 * pink-city facades (domes, chhatris, a honeycomb Hawa-Mahal-like
 * centrepiece) in the old city's true terracotta pinks.
 */
function Cityscape({ tint }) {
  const texture = useMemo(() => {
    const W = 2048
    const H = 300
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // far Aravalli hills with fort wall
    ctx.fillStyle = 'rgba(150, 122, 130, 0.8)'
    ctx.beginPath()
    ctx.moveTo(0, H)
    for (let x = 0; x <= W; x += 64) {
      ctx.lineTo(x, H - 120 - Math.sin(x * 0.004) * 46 - Math.sin(x * 0.013) * 22)
    }
    ctx.lineTo(W, H)
    ctx.fill()
    // crenellated wall + watchtowers along the ridge
    ctx.fillStyle = 'rgba(128, 100, 104, 0.9)'
    for (let x = 40; x < W; x += 26) {
      const ridge = H - 128 - Math.sin(x * 0.004) * 46 - Math.sin(x * 0.013) * 22
      ctx.fillRect(x, ridge - 7, 13, 9)
      if (x % 338 < 26) ctx.fillRect(x - 4, ridge - 26, 22, 28)
    }

    // pink city rows
    const pinks = ['#d98e7a', '#e0987f', '#c97f66', '#d4876f', '#e2a084']
    let x = 0
    while (x < W) {
      const bw = 46 + Math.random() * 80
      const bh = 46 + Math.random() * 82
      const col = pinks[(Math.random() * pinks.length) | 0]
      ctx.fillStyle = col
      ctx.fillRect(x, H - bh, bw, bh)
      // windows
      ctx.fillStyle = 'rgba(90, 56, 50, 0.55)'
      for (let wx = x + 8; wx < x + bw - 8; wx += 14) {
        for (let wy = H - bh + 10; wy < H - 10; wy += 18) {
          ctx.fillRect(wx, wy, 5, 9)
        }
      }
      // occasional dome or chhatri on the roofline
      if (Math.random() < 0.35) {
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(x + bw / 2, H - bh, bw * 0.22, Math.PI, 0)
        ctx.fill()
      } else if (Math.random() < 0.3) {
        ctx.fillStyle = col
        ctx.fillRect(x + bw / 2 - 2, H - bh - 14, 4, 14)
        ctx.fillRect(x + bw / 2 - 10, H - bh - 16, 20, 4)
      }
      x += bw + 6
    }

    // honeycomb centrepiece, Hawa Mahal style
    const cx = W * 0.52
    ctx.fillStyle = '#d4876f'
    for (let tier = 0; tier < 5; tier++) {
      const tw = 300 - tier * 52
      const th = 34
      const ty = H - 90 - tier * th
      ctx.fillRect(cx - tw / 2, ty, tw, th)
      ctx.fillStyle = 'rgba(90, 56, 50, 0.5)'
      for (let wx = cx - tw / 2 + 8; wx < cx + tw / 2 - 8; wx += 16) {
        ctx.beginPath()
        ctx.arc(wx + 4, ty + 16, 4.5, Math.PI, 0)
        ctx.fill()
        ctx.fillRect(wx, ty + 16, 9, 12)
      }
      ctx.fillStyle = '#d4876f'
    }

    // atmospheric haze rising from the horizon
    const haze = ctx.createLinearGradient(0, H - 130, 0, H)
    haze.addColorStop(0, 'rgba(240, 205, 175, 0)')
    haze.addColorStop(1, 'rgba(240, 205, 175, 0.45)')
    ctx.fillStyle = haze
    ctx.fillRect(0, 0, W, H)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  return (
    <mesh position={[0, 7.2, -52]}>
      <planeGeometry args={[260, 36]} />
      <meshBasicMaterial map={texture} transparent fog={false} depthWrite={false} color={tint} />
    </mesh>
  )
}

/** Soft clouds drifting across the sky. */
function Clouds({ tint }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    for (let i = 0; i < 26; i++) {
      const x = 40 + Math.random() * 176
      const y = 45 + Math.random() * 40
      const r = 14 + Math.random() * 26
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, 'rgba(255,255,255,0.16)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])
  const group = useRef()
  const clouds = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: THREE.MathUtils.randFloatSpread(180),
        y: THREE.MathUtils.randFloat(18, 34),
        z: THREE.MathUtils.randFloat(-50, -34),
        w: THREE.MathUtils.randFloat(22, 44),
        speed: THREE.MathUtils.randFloat(0.25, 0.7),
        o: THREE.MathUtils.randFloat(0.4, 0.8),
        key: i,
      })),
    [],
  )
  useFrame((_, delta) => {
    group.current.children.forEach((m, i) => {
      m.position.x += clouds[i].speed * delta
      if (m.position.x > 110) m.position.x = -110
    })
  })
  return (
    <group ref={group}>
      {clouds.map((c) => (
        <mesh key={c.key} position={[c.x, c.y, c.z]}>
          <planeGeometry args={[c.w, c.w * 0.5]} />
          <meshBasicMaterial map={texture} transparent opacity={c.o} fog={false} depthWrite={false} color={tint} />
        </mesh>
      ))}
    </group>
  )
}

/** A few birds crossing the sky, wings beating. */
function Birds({ color = '#2a2530' }) {
  const birds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        y: THREE.MathUtils.randFloat(11, 20),
        z: THREE.MathUtils.randFloat(-42, -26),
        x: THREE.MathUtils.randFloatSpread(120),
        speed: THREE.MathUtils.randFloat(2.2, 4),
        flap: THREE.MathUtils.randFloat(6, 10),
        phase: Math.random() * Math.PI * 2,
        s: THREE.MathUtils.randFloat(0.5, 1),
        key: i,
      })),
    [],
  )
  const group = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.children.forEach((b, i) => {
      const cfg = birds[i]
      b.position.x += cfg.speed * 0.016
      if (b.position.x > 90) b.position.x = -90
      b.position.y = cfg.y + Math.sin(t * 0.7 + cfg.phase) * 0.6
      const wing = Math.sin(t * cfg.flap + cfg.phase) * 0.75
      b.children[0].rotation.z = wing
      b.children[1].rotation.z = Math.PI - wing
    })
  })
  return (
    <group ref={group}>
      {birds.map((b) => (
        <group key={b.key} position={[b.x, b.y, b.z]} scale={b.s}>
          <mesh position-x={-0.28}>
            <planeGeometry args={[0.62, 0.13]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} fog={false} />
          </mesh>
          <mesh position-x={0.28}>
            <planeGeometry args={[0.62, 0.13]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} fog={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

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
    // light dither so the stretched gradient doesn't band
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.03).toFixed(3)})`
      ctx.fillRect((Math.random() * 16) | 0, (Math.random() * 256) | 0, 1, 1)
    }
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
    cloud: '#e8c2a8',
    city: '#c9a3a6',
    bird: '#241f28',
    lantern: ['#ffb347', 2.4],
    petals: ['#c73a55', '#e05575', '#d64d6b', '#f0a8b8'],
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
    cloud: '#ffffff',
    city: '#ffffff',
    bird: '#4a4258',
    lantern: ['#f2b6cf', 1.1],
    petals: ['#e87a93', '#f0a8b8', '#ffffff', '#d64d6b'],
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
  // hero at the gates, then a stop framing each board, then the dome.
  // Each stop distance comes from the board's measured size: the
  // camera stands exactly where the card fills ~92% of the viewport.
  const buildCurves = (camera) => {
    const vHalf = Math.tan((camera.fov * Math.PI) / 360)
    const pos = [v(0, 2.1, isTouch ? 40 : 33)] // eye level at the gates
    const look = [v(0, 3.8, 0)] // tilted up enough to keep the gate's name in frame
    PANELS.forEach((p, i) => {
      const m = panelWorld[i]
      let d = p.dist * (isTouch ? 1.15 : 1)
      if (m) {
        const dh = m.h / (0.92 * 2 * vHalf)
        const dw = m.w / (0.92 * 2 * vHalf * camera.aspect)
        d = Math.max(2.0, dh, dw)
      }
      pos.push(v(p.pos[0] + Math.sin(p.ry) * d, p.pos[1], p.pos[2] + Math.cos(p.ry) * d))
      look.push(v(...p.pos))
    })
    pos.push(v(0, 2.1, isTouch ? 2.6 : 1.6)) // footer — beneath the dome
    look.push(v(0, 4.2, -2.2)) //               dome rim, garlands, the night beyond
    return {
      posCurve: new THREE.CatmullRomCurve3(pos, false, 'centripetal'),
      lookCurve: new THREE.CatmullRomCurve3(look, false, 'centripetal'),
    }
  }
  const curves = useRef(null)
  const lastAspect = useRef(0)
  const fitted = useRef(false)
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
    const cam = state.camera
    // (re)build the path when measurements arrive or the aspect changes
    const ready = panelWorld.filter(Boolean).length === PANELS.length
    if (!curves.current || Math.abs(cam.aspect - lastAspect.current) > 0.01 || (ready && !fitted.current)) {
      curves.current = buildCurves(cam)
      lastAspect.current = cam.aspect
      if (ready) fitted.current = true
    }

    const t = state.clock.elapsedTime
    smooth.current = THREE.MathUtils.damp(smooth.current, scrollRef.current, 2.2, delta)
    const s = THREE.MathUtils.clamp(smooth.current, 0, 1)
    curves.current.posCurve.getPoint(s, p)
    curves.current.lookCurve.getPoint(s, l)

    const hx = THREE.MathUtils.clamp(pointer.current.x + orient.current.x, -1.2, 1.2)
    const hy = THREE.MathUtils.clamp(pointer.current.y - orient.current.y, -1.2, 1.2)

    // gentle parallax only — big sway would crop the tightly framed cards
    cam.position.set(
      p.x + hx * 0.15 + Math.sin(t * 0.14) * 0.05,
      p.y + hy * 0.1 + Math.sin(t * 0.19) * 0.03,
      p.z,
    )
    cam.lookAt(l)
  })
  return null
}

export default function Scene({ scrollRef, mode = 'night', look, setLook }) {
  const pal = PALETTES[mode] || PALETTES.night
  // adaptive quality: drop resolution on struggling devices, restore on strong ones
  const [dpr, setDpr] = useState(isTouch ? 1.7 : 1.25)
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 2.1, isTouch ? 40 : 33], fov: isTouch ? 58 : 46 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(isTouch ? 1.1 : 1)}
        onIncline={() => setDpr(isTouch ? 2 : 1.5)}
      />
      <color attach="background" args={[pal.bg]} />
      <fog attach="fog" args={[pal.fog, 22, pal.fogFar]} />
      <Sky colors={pal.sky} />
      <Cityscape tint={pal.city} />
      <Clouds tint={pal.cloud} />
      <Birds color={pal.bird} />

      <ambientLight intensity={pal.ambient[1]} color={pal.ambient[0]} />
      <directionalLight position={[-8, 6, -4]} intensity={pal.key[1]} color={pal.key[0]} />
      <directionalLight position={[6, 8, 6]} intensity={pal.fill[1]} color={pal.fill[0]} />
      <pointLight position={[0, 3.2, 0]} intensity={pal.point} color="#ffb347" distance={12} decay={2} />

      <Mandap />
      <Resort mode={mode} />
      <Panels look={look} setLook={setLook} scrollRef={scrollRef} />
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
