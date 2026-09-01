import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const SAND = { color: '#d8c5a3', roughness: 0.8 }
const BRASS = { color: '#b89355', metalness: 0.5, roughness: 0.4 }

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/* ------------------------------------------------------------------
   Canvas-drawn signage (self-contained — no font files to load).
   Redraws once the page's webfonts (Cinzel / Great Vibes) are ready.
------------------------------------------------------------------- */
function useCanvasTexture(w, h, draw) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    draw(canvas.getContext('2d'), w, h)
    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 8
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    let alive = true
    document.fonts?.ready?.then(() => {
      if (!alive) return
      const canvas = texture.image
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      draw(ctx, canvas.width, canvas.height)
      texture.needsUpdate = true
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture])
  return texture
}

/** Gold venue name on a transparent strip. */
function VenueNameTexture() {
  return useCanvasTexture(1024, 128, (ctx, w, h) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 74px Cinzel, serif'
    ctx.fillStyle = '#f0d98c'
    ctx.shadowColor = 'rgba(240, 217, 140, 0.6)'
    ctx.shadowBlur = 18
    ctx.fillText('STARDOM RESORT', w / 2, h / 2 + 4)
  })
}

/** Nameplate on the gate lintel. */
function GateName() {
  const tex = VenueNameTexture()
  return (
    <mesh position={[0, 5.06, 21.47]}>
      <planeGeometry args={[6.4, 0.8]} />
      <meshBasicMaterial map={tex} transparent color="#ffe9b0" />
    </mesh>
  )
}

/** Glowing name high on the building tower. */
function BuildingName({ night }) {
  const tex = VenueNameTexture()
  return (
    <mesh position={[0, 8.1, -8.76]}>
      <planeGeometry args={[4.2, 0.55]} />
      <meshBasicMaterial map={tex} transparent color={night ? '#ffe9b0' : '#8a6f3a'} />
    </mesh>
  )
}

/** Welcome board on posts, anchored beside the entrance. */
function WelcomeBoard() {
  const tex = useCanvasTexture(640, 400, (ctx, w, h) => {
    // deep green panel with gold double border
    ctx.fillStyle = '#12281c'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 6
    ctx.strokeRect(14, 14, w - 28, h - 28)
    ctx.lineWidth = 2
    ctx.strokeRect(28, 28, w - 56, h - 56)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#d9c48c'
    ctx.font = '500 34px Cinzel, serif'
    ctx.fillText('WELCOME TO THE WEDDING OF', w / 2, 105)
    ctx.fillStyle = '#f4ead8'
    ctx.font = '110px "Great Vibes", cursive'
    ctx.fillText('Ruchi & Rahul', w / 2, 225)
    ctx.fillStyle = '#d9c48c'
    ctx.font = '500 30px Cinzel, serif'
    ctx.fillText('16 · 17 DECEMBER 2026', w / 2, 330)
  })
  return (
    <group position={[4.4, 0, 19.2]} rotation-y={-0.25}>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0.95, -0.06]}>
          <cylinderGeometry args={[0.05, 0.06, 1.9, 8]} />
          <meshStandardMaterial color="#5d4426" roughness={0.9} />
        </mesh>
      ))}
      <mesh position-y={1.55}>
        <boxGeometry args={[2.7, 1.7, 0.08]} />
        <meshStandardMaterial color="#4a3620" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.55, 0.045]}>
        <planeGeometry args={[2.56, 1.6]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------
   Palms — curved trunk of stacked segments, drooping ribbon fronds
   built along a real arc, coconut cluster at the crown.
------------------------------------------------------------------- */
function frondGeometry(len = 1.9, droop = 1.0, width = 0.2, segs = 9) {
  const positions = []
  const indices = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const x = t * len
    const y = t * 0.25 - droop * t * t // rises slightly, then droops
    const w = width * (1 - t * 0.85) * (0.35 + Math.sin(Math.min(t * 2.4, 1) * Math.PI * 0.5) * 0.65)
    positions.push(x, y, -w, x, y, w)
    if (i < segs) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setIndex(indices)
  g.computeVertexNormals()
  return g
}

function Palm({ position, scale = 1, lean = 0.08, seed = 0 }) {
  const frond = useMemo(() => frondGeometry(), [])
  const segments = 6
  const height = 3.1
  const crown = useMemo(() => {
    // crown position follows the trunk's curve
    const bend = lean * 2.2
    return [Math.sin(bend) * height * 0.45, 0.5 + height, 0]
  }, [lean])
  const fronds = 11
  const greens = ['#2f6040', '#3a7050', '#28543a']
  return (
    <group position={position} scale={scale}>
      {/* curved trunk */}
      {Array.from({ length: segments }, (_, i) => {
        const t = i / (segments - 1)
        const bend = lean * 2.2
        return (
          <mesh
            key={i}
            position={[Math.sin(bend) * height * 0.45 * t * t, 0.5 + t * height * 0.94, 0]}
            rotation-z={-bend * t}
          >
            <cylinderGeometry args={[0.1 - t * 0.055, 0.12 - t * 0.055, height / segments + 0.16, 8]} />
            <meshStandardMaterial color={i % 2 ? '#77603c' : '#6a5434'} roughness={0.95} />
          </mesh>
        )
      })}
      {/* coconuts */}
      <group position={crown}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.1 + seed) * 0.12, -0.08, Math.sin(i * 2.1 + seed) * 0.12]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#5b452a" roughness={0.9} />
          </mesh>
        ))}
        {/* fronds */}
        {Array.from({ length: fronds }, (_, i) => {
          const a = (i / fronds) * Math.PI * 2 + seed
          const pitch = -0.15 - ((i * 7919 + seed * 13) % 10) / 22 // varied droop
          return (
            <group key={i} rotation-y={a}>
              <mesh geometry={frond} rotation-z={pitch} scale={[0.9 + ((i * 31) % 5) / 12, 1, 1]}>
                <meshStandardMaterial color={greens[i % 3]} roughness={0.85} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------
   Grass — instanced blades scattered over the lawns, kept off the
   walkway, pool, and chhatri platform.
------------------------------------------------------------------- */
function Grass({ count = 2600 }) {
  const mesh = useRef()
  const blades = useMemo(() => {
    const arr = []
    let guard = 0
    while (arr.length < count && guard++ < count * 30) {
      const x = THREE.MathUtils.randFloatSpread(52)
      const z = THREE.MathUtils.randFloat(-16, 26)
      if (Math.abs(x) < 2.1 && z > 2 && z < 25) continue // walkway
      if (Math.hypot(x, z) < 5.2) continue // chhatri platform
      if (Math.hypot((x + 7) / 1.45, z - 10) < 3.9) continue // pool
      if (z < -8 && Math.abs(x) < 11) continue // building footprint
      arr.push({
        x,
        z,
        ry: Math.random() * Math.PI,
        tilt: THREE.MathUtils.randFloatSpread(0.5),
        s: THREE.MathUtils.randFloat(0.6, 1.4),
        shade: Math.random(),
      })
    }
    return arr
  }, [count])

  useEffect(() => {
    const dummy = new THREE.Object3D()
    const c = new THREE.Color()
    const greens = [new THREE.Color('#2c5638'), new THREE.Color('#3a6b47'), new THREE.Color('#24462e')]
    blades.forEach((b, i) => {
      dummy.position.set(b.x, 0.14 * b.s, b.z)
      dummy.rotation.set(b.tilt, b.ry, 0)
      dummy.scale.setScalar(b.s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      c.copy(greens[i % 3]).lerp(greens[(i + 1) % 3], b.shade)
      mesh.current.setColorAt(i, c)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.instanceColor.needsUpdate = true
  }, [blades])

  return (
    <instancedMesh ref={mesh} args={[null, null, blades.length]}>
      <planeGeometry args={[0.05, 0.3]} />
      <meshStandardMaterial roughness={0.95} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

/** Entrance gateway the camera passes through. */
function Gate() {
  return (
    <group position={[0, 0, 21]}>
      {[-3.6, 3.6].map((x) => (
        <group key={x} position-x={x}>
          <mesh position-y={2.6}>
            <boxGeometry args={[1.1, 5.2, 1.1]} />
            <meshStandardMaterial {...SAND} />
          </mesh>
          <mesh position-y={5.5}>
            <sphereGeometry args={[0.55, 14, 14]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
        </group>
      ))}
      <mesh position-y={5.05}>
        <boxGeometry args={[8.3, 1.0, 0.9]} />
        <meshStandardMaterial {...SAND} />
      </mesh>
      <mesh position-y={5.68}>
        <boxGeometry args={[8.7, 0.18, 1.0]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </group>
  )
}

/** The glittering pool, off the walkway. */
function Pool({ glow }) {
  return (
    <group position={[-7, 0.02, 10]}>
      <mesh rotation-x={-Math.PI / 2} scale={[1.4, 1, 1]}>
        <circleGeometry args={[3.4, 36]} />
        <meshStandardMaterial color="#e2d7bd" roughness={0.75} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02} scale={[1.4, 1, 1]}>
        <circleGeometry args={[2.7, 36]} />
        <meshStandardMaterial color="#1c5c6e" metalness={0.4} roughness={0.12} emissive="#1c5c6e" emissiveIntensity={glow} />
      </mesh>
    </group>
  )
}

/** Resort block behind the lawns, windows lit at night. */
function Building({ windowGlow, night }) {
  const windows = useMemo(() => {
    const arr = []
    for (let fx = -5; fx <= 5; fx++) {
      if (fx === 0) continue // tower stands here
      for (let fy = 0; fy < 3; fy++) arr.push([fx * 1.7, 1.5 + fy * 1.9])
    }
    return arr
  }, [])
  return (
    <group position={[0, 0, -11]}>
      <mesh position-y={3.4}>
        <boxGeometry args={[20, 6.8, 4]} />
        <meshStandardMaterial color="#c9b696" roughness={0.8} />
      </mesh>
      {/* central tower with gold dome */}
      <mesh position-y={4.6}>
        <boxGeometry args={[4.2, 9.2, 4.4]} />
        <meshStandardMaterial color="#d3c0a0" roughness={0.8} />
      </mesh>
      <mesh position-y={9.5}>
        <sphereGeometry args={[1.5, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position-y={11.1}>
        <coneGeometry args={[0.12, 0.5, 10]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      {/* lit windows */}
      {windows.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 2.02]}>
          <planeGeometry args={[0.7, 1.15]} />
          <meshStandardMaterial color="#3a2f22" emissive="#ffd9a0" emissiveIntensity={windowGlow} />
        </mesh>
      ))}
      <BuildingName night={night} />
    </group>
  )
}

/** Sandstone walkway from the gate to the chhatri, gold-edged. */
function Pathway() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 13]}>
        <planeGeometry args={[3.2, 22]} />
        <meshStandardMaterial color="#d9c9a8" roughness={0.85} />
      </mesh>
      {[-1.72, 1.72].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.016, 13]}>
          <planeGeometry args={[0.12, 22]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
      ))}
    </group>
  )
}

/** Little glowing lamps guiding you in along the path. */
function PathLamps() {
  const spots = useMemo(() => {
    const arr = []
    for (let z = 5; z <= 19; z += 2) arr.push([-2.25, z], [2.25, z])
    return arr
  }, [])
  return spots.map(([x, z], i) => (
    <group key={i} position={[x, 0, z]}>
      <mesh position-y={0.35}>
        <cylinderGeometry args={[0.03, 0.05, 0.7, 6]} />
        <meshStandardMaterial color="#6d5638" roughness={0.9} />
      </mesh>
      <mesh position-y={0.78}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffcf7d" emissive="#ff9d2e" emissiveIntensity={2.4} />
      </mesh>
    </group>
  ))
}

const PALMS = [
  [[-3.4, 0, 6.5], 1.05, 0.06],
  [[3.5, 0, 8.5], 0.95, -0.08],
  [[-3.6, 0, 12.5], 1.1, 0.1],
  [[3.4, 0, 15.5], 1.0, -0.05],
  [[-3.2, 0, 18.5], 0.9, 0.07],
  [[-10.5, 0, 7.5], 1.15, -0.1],
  [[-4.6, 0, 14.5], 0.85, 0.12],
  [[8.5, 0, 5], 1.1, 0.09],
  [[7.5, 0, 12], 0.9, -0.07],
  [[-8.5, 0, -5], 1.2, 0.05],
  [[8.5, 0, -5.5], 1.15, -0.06],
]

/** Stylized Stardom Resort grounds: gate, walkway, pool, palms, block. */
export default function Resort({ mode = 'night' }) {
  const night = mode === 'night'
  return (
    <group>
      <Gate />
      <GateName />
      <WelcomeBoard />
      <Pathway />
      <PathLamps />
      <Pool glow={night ? 0.55 : 0.15} />
      <Building windowGlow={night ? 1.7 : 0.12} night={night} />
      <Grass count={isTouch ? 1100 : 2600} />
      {PALMS.map(([p, s, l], i) => (
        <Palm key={i} position={p} scale={s} lean={l} seed={i * 1.7} />
      ))}
    </group>
  )
}
