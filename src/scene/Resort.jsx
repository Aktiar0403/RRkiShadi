import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
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

/* ------------------------------------------------------------------
   The grand gateway — straight-on, framing the walkway. Carries
   "STARDOM RESORT", the welcome script, and RUCHI WEDS RAHUL
   floating in the arch, like the reference photograph.
------------------------------------------------------------------- */
function Gate({ night }) {
  const headerTex = useCanvasTexture(1400, 300, (ctx, w) => {
    ctx.textAlign = 'center'
    ctx.font = '600 104px Cinzel, serif'
    ctx.fillStyle = '#f0d98c'
    ctx.shadowColor = 'rgba(20, 14, 8, 0.7)'
    ctx.shadowBlur = 10
    ctx.fillText('STARDOM RESORT', w / 2, 118)
    ctx.font = '84px "Great Vibes", cursive'
    ctx.fillStyle = '#f2c9a0'
    ctx.fillText('welcome, we invite you to the wedding of', w / 2, 238)
    ctx.shadowBlur = 0
  })

  const letterFill = (ctx, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#8a7c64')
    g.addColorStop(0.45, '#4a4236')
    g.addColorStop(1, '#2c261e')
    return g
  }
  const drawName = (text, size) => (ctx, w, h) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${size}px Cinzel, serif`
    ctx.fillStyle = letterFill(ctx, h)
    ctx.fillText(text, w / 2, h / 2 + 8)
    // gold rim so the letters read against the dark palace behind
    ctx.strokeStyle = 'rgba(240, 217, 140, 0.75)'
    ctx.lineWidth = 3
    ctx.strokeText(text, w / 2, h / 2 + 8)
  }
  const ruchiTex = useCanvasTexture(1200, 300, drawName('RUCHI', 224))
  const wedsTex = useCanvasTexture(600, 170, drawName('WEDS', 112))
  const rahulTex = useCanvasTexture(1200, 300, drawName('RAHUL', 224))

  // the floating names bow out as you pass under the arch
  const nameMats = useRef([])
  useFrame((state) => {
    const o = THREE.MathUtils.clamp((state.camera.position.z - 23.5) / 4.5, 0, 1)
    nameMats.current.forEach((m) => {
      if (m) m.opacity = o
    })
  })

  return (
    <group position={[0, 0, 21]}>
      {/* massive square pylons with cornice caps */}
      {[-4.2, 4.2].map((x) => (
        <group key={x} position-x={x}>
          <mesh position-y={3.4}>
            <boxGeometry args={[1.6, 6.8, 1.6]} />
            <meshStandardMaterial {...SAND} />
          </mesh>
          <mesh position-y={6.94}>
            <boxGeometry args={[2.0, 0.28, 2.0]} />
            <meshStandardMaterial {...SAND} />
          </mesh>
          <mesh position-y={7.2}>
            <boxGeometry args={[2.2, 0.24, 2.2]} />
            <meshStandardMaterial {...SAND} />
          </mesh>
          <mesh position-y={7.48}>
            <boxGeometry args={[1.7, 0.32, 1.7]} />
            <meshStandardMaterial {...SAND} />
          </mesh>
        </group>
      ))}

      {/* entablature */}
      <mesh position-y={7.0}>
        <boxGeometry args={[8.4, 1.5, 1.1]} />
        <meshStandardMaterial {...SAND} />
      </mesh>
      <mesh position-y={7.82}>
        <boxGeometry args={[8.8, 0.16, 1.2]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position-y={6.2}>
        <boxGeometry args={[8.6, 0.12, 1.15]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>

      {/* venue name + welcome script on the entablature */}
      <mesh position={[0, 7.02, 0.58]}>
        <planeGeometry args={[7.4, 1.55]} />
        <meshBasicMaterial map={headerTex} transparent />
      </mesh>

      {/* RUCHI WEDS RAHUL floating in the arch */}
      <mesh position={[0, 5.25, -0.3]}>
        <planeGeometry args={[5.4, 1.35]} />
        <meshBasicMaterial ref={(m) => (nameMats.current[0] = m)} map={ruchiTex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 4.3, -0.3]}>
        <planeGeometry args={[2.2, 0.62]} />
        <meshBasicMaterial ref={(m) => (nameMats.current[1] = m)} map={wedsTex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 3.35, -0.3]}>
        <planeGeometry args={[5.4, 1.35]} />
        <meshBasicMaterial ref={(m) => (nameMats.current[2] = m)} map={rahulTex} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* warm uplights washing the pylons */}
      {night && (
        <>
          <pointLight position={[-4.2, 0.6, 1.4]} intensity={7} color="#ffb066" distance={9} decay={2} />
          <pointLight position={[4.2, 0.6, 1.4]} intensity={7} color="#ffb066" distance={9} decay={2} />
        </>
      )}
    </group>
  )
}

/** Welcome board on posts, anchored beside the entrance. */
function WelcomeBoard() {
  const tex = useCanvasTexture(640, 400, (ctx, w) => {
    ctx.fillStyle = '#12351f'
    ctx.fillRect(0, 0, w, 400)
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 6
    ctx.strokeRect(14, 14, w - 28, 400 - 28)
    ctx.lineWidth = 2
    ctx.strokeRect(28, 28, w - 56, 400 - 56)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#d9c48c'
    ctx.font = '500 52px Cinzel, serif'
    ctx.fillText('✦  Welcome  ✦', w / 2, 130)
    ctx.fillStyle = '#f4ead8'
    // shrink-to-fit so the script name never clips the border
    let size = 92
    ctx.font = `${size}px "Great Vibes", cursive`
    while (size > 40 && ctx.measureText('Ruchi Weds Rahul').width > w - 90) {
      size -= 4
      ctx.font = `${size}px "Great Vibes", cursive`
    }
    ctx.fillText('Ruchi Weds Rahul', w / 2, 268)
    ctx.fillStyle = '#d9c48c'
    ctx.font = '500 26px Cinzel, serif'
    ctx.fillText('16 · 17 DECEMBER 2026', w / 2, 348)
  })
  return (
    <group position={[3.4, 0, 25]} rotation-y={-0.35} scale={0.9}>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0.95, -0.06]}>
          <cylinderGeometry args={[0.05, 0.06, 1.9, 8]} />
          <meshStandardMaterial color="#4a3620" roughness={0.9} />
        </mesh>
      ))}
      <mesh position-y={1.62}>
        <boxGeometry args={[2.7, 1.7, 0.08]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.62, 0.045]}>
        <planeGeometry args={[2.56, 1.6]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------
   Palms — curved trunk of stacked segments, drooping ribbon fronds.
------------------------------------------------------------------- */
function frondGeometry(len = 1.9, droop = 1.0, width = 0.2, segs = 9) {
  const positions = []
  const indices = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const x = t * len
    const y = t * 0.25 - droop * t * t
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
    const bend = lean * 2.2
    return [Math.sin(bend) * height * 0.45, 0.5 + height, 0]
  }, [lean])
  const fronds = 11
  const greens = ['#2f6040', '#3a7050', '#28543a']
  return (
    <group position={position} scale={scale}>
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
      <group position={crown}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.1 + seed) * 0.12, -0.08, Math.sin(i * 2.1 + seed) * 0.12]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#5b452a" roughness={0.9} />
          </mesh>
        ))}
        {Array.from({ length: fronds }, (_, i) => {
          const a = (i / fronds) * Math.PI * 2 + seed
          const pitch = -0.15 - ((i * 7919 + seed * 13) % 10) / 22
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
   Lawn — a dense mown-turf carpet (tiled canvas texture, like a golf
   fairway) with short instanced blades scattered over it for depth.
------------------------------------------------------------------- */
function Turf() {
  const texture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#3d7a4a'
    ctx.fillRect(0, 0, size, size)
    // mow stripes
    for (let s = 0; s < size; s += 32) {
      ctx.fillStyle = (s / 32) % 2 ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.05)'
      ctx.fillRect(s, 0, 32, size)
    }
    // dense short-blade speckle
    const greens = ['#356e41', '#468a55', '#2c5c36', '#4f9660', '#3a7546']
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = greens[(Math.random() * greens.length) | 0]
      const x = Math.random() * size
      const y = Math.random() * size
      ctx.fillRect(x, y, 1, 1 + Math.random() * 2)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(46, 46)
    tex.anisotropy = 8
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.004}>
      <circleGeometry args={[68, 48]} />
      <meshStandardMaterial map={texture} roughness={0.95} />
    </mesh>
  )
}

function Grass({ count = 4200 }) {
  const mesh = useRef()
  const blades = useMemo(() => {
    const arr = []
    let guard = 0
    while (arr.length < count && guard++ < count * 30) {
      const x = THREE.MathUtils.randFloatSpread(66)
      const z = THREE.MathUtils.randFloat(-18, 32)
      if (Math.abs(x) < 2.4 && z > 2 && z < 32) continue // walkway
      if (Math.abs(x) < 6 && Math.abs(z) < 6) continue // mandap carpet
      if (Math.hypot((x + 7) / 1.45, z - 10) < 4.0) continue // pool
      if (z < -9 && Math.abs(x) < 14) continue // building footprint
      arr.push({
        x,
        z,
        ry: Math.random() * Math.PI,
        tilt: THREE.MathUtils.randFloatSpread(0.4),
        s: THREE.MathUtils.randFloat(0.45, 0.95), // short, mown height
        shade: Math.random(),
      })
    }
    return arr
  }, [count])

  useEffect(() => {
    const dummy = new THREE.Object3D()
    const c = new THREE.Color()
    const greens = [new THREE.Color('#356e41'), new THREE.Color('#468a55'), new THREE.Color('#2c5c36')]
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
      <planeGeometry args={[0.032, 0.22]} />
      <meshStandardMaterial roughness={0.95} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

/** The figure-8 pool with grey tile deck, like the real one. */
function Pool({ glow }) {
  return (
    <group position={[-7.5, 0.02, 10]}>
      {/* deck */}
      <mesh rotation-x={-Math.PI / 2} scale={[1.1, 1.5, 1]}>
        <circleGeometry args={[3.3, 40]} />
        <meshStandardMaterial color="#c2c6ca" roughness={0.8} />
      </mesh>
      {/* figure-8 water: two overlapping circles */}
      {[-1.25, 1.25].map((oz, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0.022, oz]}>
          <circleGeometry args={[i ? 2.0 : 1.8, 36]} />
          <meshStandardMaterial color="#2b83c4" metalness={0.35} roughness={0.12} emissive="#1c5f94" emissiveIntensity={glow} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------
   Photogrammetry slot: put a real scan of the resort at
   public/models/stardom.glb and it replaces the stylized block —
   auto-scaled to targetWidth, grounded, facing the walkway.
------------------------------------------------------------------- */
const SCAN = {
  url: '/models/stardom.glb',
  targetWidth: 26, // world units across the front
  position: [0, 0, -16],
  rotationY: 0, // adjust if the scan faces the wrong way
}

function ScannedBuilding() {
  const { scene } = useGLTF(SCAN.url)
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = SCAN.targetWidth / Math.max(size.x, size.z, 0.001)
    return {
      scale,
      // center on x/z, sit the lowest point on the lawn
      offset: [-center.x * scale, -box.min.y * scale, -center.z * scale],
    }
  }, [scene])
  return (
    <group position={SCAN.position} rotation-y={SCAN.rotationY}>
      <group position={fit.offset} scale={fit.scale}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

/** Uses the real scan when the file exists; stylized block otherwise. */
function ResortBuilding({ windowGlow, night }) {
  const [hasScan, setHasScan] = useState(false)
  useEffect(() => {
    fetch(SCAN.url, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') || ''
        // Pages serves index.html for missing assets — treat that as absent
        setHasScan(r.ok && !type.includes('text/html'))
      })
      .catch(() => setHasScan(false))
  }, [])
  if (!hasScan) return <Building windowGlow={windowGlow} night={night} />
  return (
    <Suspense fallback={<Building windowGlow={windowGlow} night={night} />}>
      <ScannedBuilding />
      <ScanName night={night} />
    </Suspense>
  )
}

/** Glowing venue name floating above the scanned building. */
function ScanName({ night }) {
  const tex = useCanvasTexture(1024, 128, (ctx, w, h) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 74px Cinzel, serif'
    ctx.fillStyle = '#f0d98c'
    ctx.shadowColor = 'rgba(240, 217, 140, 0.6)'
    ctx.shadowBlur = 18
    ctx.fillText('STARDOM RESORT', w / 2, h / 2 + 4)
  })
  return (
    <mesh position={[0, 11.5, -15.8]}>
      <planeGeometry args={[6, 0.75]} />
      <meshBasicMaterial map={tex} transparent color={night ? '#ffe9b0' : '#8a6f3a'} />
    </mesh>
  )
}

/** Palace block at the end of the walkway, windows lit at night. */
function Building({ windowGlow, night }) {
  // golden glass curtain wall, like the real banquet hall
  const glassTex = useCanvasTexture(512, 256, (ctx, w, h) => {
    for (let x = 0; x < w; x += 32) {
      const g = ctx.createLinearGradient(x, 0, x + 32, h)
      g.addColorStop(0, '#d8a84e')
      g.addColorStop(0.5, '#a87838')
      g.addColorStop(1, '#c9973f')
      ctx.fillStyle = g
      ctx.fillRect(x, 0, 32, h)
      ctx.fillStyle = 'rgba(56, 38, 20, 0.85)'
      ctx.fillRect(x, 0, 3, h) // vertical mullions
    }
    ctx.fillStyle = 'rgba(56, 38, 20, 0.5)'
    for (let y = 0; y < h; y += 64) ctx.fillRect(0, y, w, 2)
  })
  // red STARDOM lettering + gold mandala disc, like the roofline sign
  const signTex = useCanvasTexture(1200, 200, (ctx, w, h) => {
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 6
    ctx.beginPath(); ctx.arc(90, h / 2, 55, 0, Math.PI * 2); ctx.stroke()
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(90, h / 2, 38, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(90, h / 2, 20, 0, Math.PI * 2); ctx.stroke()
    ctx.textBaseline = 'middle'
    ctx.font = '700 96px Cinzel, serif'
    ctx.fillStyle = '#c0392b'
    ctx.fillText('STARDOM', 175, h / 2)
    ctx.font = '600 44px Cinzel, serif'
    ctx.fillStyle = '#d4af37'
    ctx.fillText('RESORT', 740, h / 2 + 10)
  })
  const hotelWindows = useMemo(() => {
    const arr = []
    for (let fx = -1.5; fx <= 1.5; fx++) for (let fy = 0; fy < 4; fy++) arr.push([fx * 2.2, 1.6 + fy * 2.3])
    return arr
  }, [])
  return (
    <group position={[0, 0, -16]}>
      {/* main banquet hall — wide bronze box, flat roof band */}
      <mesh position-y={4}>
        <boxGeometry args={[26, 8, 6]} />
        <meshStandardMaterial color="#7a5a3e" roughness={0.7} />
      </mesh>
      <mesh position-y={8.25}>
        <boxGeometry args={[26.6, 0.5, 6.6]} />
        <meshStandardMaterial color="#5f4530" roughness={0.7} />
      </mesh>
      {/* golden glass facade */}
      <mesh position={[-1.5, 4, 3.03]}>
        <planeGeometry args={[17, 7.2]} />
        <meshStandardMaterial
          map={glassTex}
          emissiveMap={glassTex}
          emissive="#ffca6a"
          emissiveIntensity={night ? 0.85 : 0.12}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      {/* entrance canopy */}
      <mesh position={[0, 2.6, 3.7]}>
        <boxGeometry args={[6, 0.28, 1.5]} />
        <meshStandardMaterial color="#5f4530" roughness={0.7} />
      </mesh>
      {/* roofline sign */}
      <mesh position={[0.5, 9.15, 2.4]}>
        <planeGeometry args={[10, 1.66]} />
        <meshBasicMaterial map={signTex} transparent />
      </mesh>
      {/* white hotel block, set back to the right like the real grounds */}
      <group position={[17.5, 0, -5]}>
        <mesh position-y={5.5}>
          <boxGeometry args={[10, 11, 9]} />
          <meshStandardMaterial color="#e8e4dc" roughness={0.85} />
        </mesh>
        <mesh position-y={11.2}>
          <boxGeometry args={[10.5, 0.4, 9.5]} />
          <meshStandardMaterial color="#d5d0c6" roughness={0.85} />
        </mesh>
        {hotelWindows.map(([x, y], i) => (
          <mesh key={i} position={[x, y, 4.52]}>
            <planeGeometry args={[0.9, 1.3]} />
            <meshStandardMaterial color="#4a4438" emissive="#f5c987" emissiveIntensity={windowGlow * 0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** White jaali lattice screens lining the walkway, like the real resort. */
function JaaliScreens() {
  const tex = useCanvasTexture(256, 320, (ctx, w, h) => {
    ctx.fillStyle = '#f2efe8'
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'destination-out'
    for (let y = 20; y < h - 30; y += 26) {
      for (let x = 20; x < w - 30; x += 26) {
        const o = (((x + y) / 26) | 0) % 2 ? 7 : 0
        ctx.fillRect(x + o, y, 15, 15)
      }
    }
    ctx.globalCompositeOperation = 'source-over'
  })
  const spots = useMemo(() => {
    const arr = []
    for (let z = 4.5; z <= 19.5; z += 5) arr.push([-3.05, z], [3.05, z])
    return arr
  }, [])
  return spots.map(([x, z], i) => (
    <group key={i} position={[x, 0, z]} rotation-y={Math.PI / 2}>
      <mesh position-y={0.3}>
        <boxGeometry args={[1.7, 0.6, 0.22]} />
        <meshStandardMaterial color="#eeeae2" roughness={0.9} />
      </mesh>
      <mesh position-y={1.55}>
        <planeGeometry args={[1.5, 1.95]} />
        <meshStandardMaterial map={tex} transparent side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      <mesh position-y={2.6}>
        <boxGeometry args={[1.7, 0.14, 0.22]} />
        <meshStandardMaterial color="#eeeae2" roughness={0.9} />
      </mesh>
    </group>
  ))
}

/** Rose petals strewn along the walkway and around the chhatri. */
function RoadPetals({ count = 420 }) {
  const mesh = useRef()
  const geometry = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, -0.09)
    s.quadraticCurveTo(0.06, -0.025, 0.04, 0.045)
    s.quadraticCurveTo(0.02, 0.1, 0, 0.11)
    s.quadraticCurveTo(-0.02, 0.1, -0.04, 0.045)
    s.quadraticCurveTo(-0.06, -0.025, 0, -0.09)
    return new THREE.ShapeGeometry(s, 6)
  }, [])
  const items = useMemo(() => {
    const arr = []
    const ROSES = ['#c73a55', '#e05575', '#d64d6b', '#f0a8b8', '#b32d47']
    for (let i = 0; i < count; i++) {
      let x, z
      if (i % 3 === 0) {
        // around and on the chhatri platform
        const a = Math.random() * Math.PI * 2
        const r = Math.random() * 4.4
        x = Math.cos(a) * r
        z = Math.sin(a) * r
      } else {
        x = THREE.MathUtils.randFloatSpread(4.6)
        z = THREE.MathUtils.randFloat(2, 27)
      }
      arr.push({
        x,
        z,
        y: 0.03 + Math.random() * 0.03,
        rz: Math.random() * Math.PI * 2,
        s: THREE.MathUtils.randFloat(0.6, 1.25),
        color: ROSES[(Math.random() * ROSES.length) | 0],
      })
    }
    return arr
  }, [count])
  useEffect(() => {
    const dummy = new THREE.Object3D()
    const c = new THREE.Color()
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y, it.z)
      dummy.rotation.set(-Math.PI / 2, 0, it.rz)
      dummy.scale.setScalar(it.s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, c.set(it.color))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.instanceColor.needsUpdate = true
  }, [items])
  return (
    <instancedMesh ref={mesh} args={[null, null, items.length]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial roughness={0.85} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

/** Blue-grey tiled walkway from the gate to the chhatri, like the real paths. */
function Pathway() {
  const tileTex = useCanvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#aebfc2'
    ctx.fillRect(0, 0, w, h)
    const shades = ['#9db0b4', '#a8bcc4', '#b6c6c9', '#9fb6c4']
    for (let y = 0; y < h; y += 32) {
      for (let x = 0; x < w; x += 32) {
        if (Math.random() < 0.5) {
          ctx.fillStyle = shades[(Math.random() * shades.length) | 0]
          ctx.fillRect(x, y, 32, 32)
        }
      }
    }
    ctx.strokeStyle = 'rgba(90, 104, 108, 0.6)'
    ctx.lineWidth = 2
    for (let i = 0; i <= w; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke()
    }
  })
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping
  tileTex.repeat.set(3, 22)
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 16]}>
        <planeGeometry args={[4.2, 30]} />
        <meshStandardMaterial map={tileTex} roughness={0.4} metalness={0.05} />
      </mesh>
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.026, 16]}>
          <planeGeometry args={[0.14, 30]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
      ))}
    </group>
  )
}

/** Rows of caged lanterns lining the walkway, like the reference. */
function LanternPosts({ glow = 2.4 }) {
  const spots = useMemo(() => {
    const arr = []
    for (let z = 3.5; z <= 20; z += 1.5) arr.push([-2.6, z], [2.6, z])
    return arr
  }, [])
  return spots.map(([x, z], i) => (
    <group key={i} position={[x, 0, z]}>
      <mesh position-y={0.45}>
        <cylinderGeometry args={[0.035, 0.05, 0.9, 6]} />
        <meshStandardMaterial color="#26221c" roughness={0.8} />
      </mesh>
      <mesh position-y={1.0}>
        <boxGeometry args={[0.17, 0.24, 0.17]} />
        <meshStandardMaterial color="#ffcf7d" emissive="#ff9d2e" emissiveIntensity={glow} />
      </mesh>
      <mesh position-y={1.16}>
        <coneGeometry args={[0.13, 0.1, 4]} />
        <meshStandardMaterial color="#26221c" roughness={0.8} />
      </mesh>
    </group>
  ))
}

const PALMS = [
  // rows flanking the walkway
  [[-3.9, 0, 5.5], 1.0, 0.06],
  [[3.9, 0, 5.5], 0.95, -0.07],
  [[-3.9, 0, 9.5], 1.1, 0.09],
  [[3.9, 0, 9.5], 1.0, -0.05],
  [[-3.9, 0, 13.5], 0.95, 0.08],
  [[3.9, 0, 13.5], 1.05, -0.09],
  [[-3.9, 0, 17.5], 1.05, 0.05],
  [[3.9, 0, 17.5], 0.9, -0.06],
  // scattered beyond
  [[-11, 0, 6.5], 1.15, -0.1],
  [[9.5, 0, 11], 0.9, -0.07],
  [[-9, 0, -6], 1.2, 0.05],
  [[9, 0, -6.5], 1.15, -0.06],
]

/** Stylized Stardom Resort grounds: gate, walkway, pool, palms, block. */
export default function Resort({ mode = 'night' }) {
  const night = mode === 'night'
  return (
    <group>
      <Gate night={night} />
      <WelcomeBoard />
      <Pathway />
      <JaaliScreens />
      <RoadPetals count={isTouch ? 280 : 420} />
      <LanternPosts glow={night ? 2.4 : 0.6} />
      <Pool glow={night ? 0.55 : 0.15} />
      <ResortBuilding windowGlow={night ? 1.7 : 0.12} night={night} />
      <Turf />
      <Grass count={isTouch ? 2400 : 6500} />
      {PALMS.map(([p, s, l], i) => (
        <Palm key={i} position={p} scale={s} lean={l} seed={i * 1.7} />
      ))}
    </group>
  )
}
