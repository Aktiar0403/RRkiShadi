import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/* ------------------------------------------------------------------
   The real Stardom wedding mandap, from the resort's gallery:
   square gold-framed structure, flat lit fabric canopy ringed with
   flowers, sheer corner drapes, strands of hanging lights, a crystal
   chandelier, terracotta-print carpet with white mattresses, low
   havan table and red benches, black uplights around the edge.
------------------------------------------------------------------- */

const GOLD = { color: '#c9a45f', metalness: 0.7, roughness: 0.3 }
const HALF = 2.8 // post square half-width
const TOP = 4.5 // canopy height

function useTexture(w, h, draw) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    draw(canvas.getContext('2d'), w, h)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Terracotta patterned carpet under everything. */
function Carpet() {
  const tex = useTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#c2502e'
    ctx.fillRect(0, 0, w, h)
    // diagonal lattice with quatrefoil motifs
    ctx.strokeStyle = 'rgba(138, 53, 32, 0.9)'
    ctx.lineWidth = 3
    for (let i = -h; i < w + h; i += 64) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(i + h, 0); ctx.lineTo(i, h); ctx.stroke()
    }
    ctx.fillStyle = '#e07a50'
    for (let y = 32; y < h; y += 64) {
      for (let x = 32; x < w; x += 64) {
        for (const [dx, dy] of [[-7, 0], [7, 0], [0, -7], [0, 7]]) {
          ctx.beginPath()
          ctx.arc(x + dx, y + dy, 6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 6)
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.015}>
      <planeGeometry args={[11, 11]} />
      <meshStandardMaterial map={tex} roughness={0.9} />
    </mesh>
  )
}

/** Slim gold pole clusters at the four corners. */
function Posts() {
  const corners = [
    [HALF, HALF], [-HALF, HALF], [HALF, -HALF], [-HALF, -HALF],
  ]
  return corners.map(([x, z], i) => {
    const sx = Math.sign(x) * -0.24
    const sz = Math.sign(z) * -0.24
    return (
      <group key={i} position={[x, 0, z]}>
        {[[0, 0], [sx, 0], [0, sz]].map(([ox, oz], k) => (
          <mesh key={k} position={[ox, TOP / 2, oz]}>
            <cylinderGeometry args={[0.045, 0.045, TOP, 10]} />
            <meshStandardMaterial {...GOLD} />
          </mesh>
        ))}
        <mesh position-y={0.06}>
          <boxGeometry args={[0.55, 0.12, 0.55]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      </group>
    )
  })
}

/** Flat fabric canopy, softly lit from within, gold-edged. */
function Canopy({ night }) {
  return (
    <group position-y={TOP}>
      <mesh>
        <boxGeometry args={[HALF * 2 + 0.9, 0.1, HALF * 2 + 0.9]} />
        <meshStandardMaterial color="#f7eedd" emissive="#ffdfae" emissiveIntensity={night ? 0.55 : 0.12} roughness={0.8} />
      </mesh>
      {/* gold frame edges */}
      {[[0, HALF + 0.45], [0, -HALF - 0.45]].map(([x, z], i) => (
        <mesh key={`a${i}`} position={[x, -0.02, z]}>
          <boxGeometry args={[HALF * 2 + 0.98, 0.14, 0.08]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      ))}
      {[[HALF + 0.45, 0], [-HALF - 0.45, 0]].map(([x, z], i) => (
        <mesh key={`b${i}`} position={[x, -0.02, z]}>
          <boxGeometry args={[0.08, 0.14, HALF * 2 + 0.98]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      ))}
    </group>
  )
}

/** Ring of flowers around the canopy top, denser at the corners. */
function FlowerRing() {
  const mesh = useRef()
  const items = useMemo(() => {
    const COLORS = ['#e75480', '#f4c430', '#e34234', '#f8f4ea', '#ff8da1', '#ffa432', '#d94f8e']
    const arr = []
    const edge = HALF + 0.45
    const push = (x, z, big = false) =>
      arr.push({
        x: x + THREE.MathUtils.randFloatSpread(0.2),
        z: z + THREE.MathUtils.randFloatSpread(0.2),
        y: TOP + 0.12 + Math.random() * 0.12,
        r: (big ? 0.13 : 0.08) + Math.random() * 0.05,
        color: COLORS[(Math.random() * COLORS.length) | 0],
      })
    for (let t = -edge; t <= edge; t += 0.28) {
      push(t, edge)
      push(t, -edge)
      push(edge, t)
      push(-edge, t)
    }
    for (const cx of [edge, -edge]) {
      for (const cz of [edge, -edge]) {
        for (let k = 0; k < 10; k++) push(cx, cz, true)
      }
    }
    return arr
  }, [])
  useEffect(() => {
    const dummy = new THREE.Object3D()
    const c = new THREE.Color()
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y, it.z)
      dummy.scale.setScalar(it.r)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, c.set(it.color))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.instanceColor.needsUpdate = true
  }, [items])
  return (
    <instancedMesh ref={mesh} args={[null, null, items.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  )
}

/** Strands of tiny warm lights hanging from the canopy edges. */
function LightStrands({ night }) {
  const mesh = useRef()
  const items = useMemo(() => {
    const arr = []
    const edge = HALF + 0.42
    const strand = (x, z) => {
      const len = 7 + ((Math.random() * 8) | 0)
      for (let k = 0; k < len; k++) arr.push({ x, z, y: TOP - 0.08 - k * 0.17 })
    }
    for (let t = -edge + 0.3; t <= edge - 0.3; t += 0.4) {
      strand(t, edge)
      strand(t, -edge)
      strand(edge, t)
      strand(-edge, t)
    }
    // a few interior strands behind the chandelier, like the photo
    for (let t = -1.8; t <= 1.8; t += 0.45) strand(t, -1.6)
    return arr
  }, [])
  useEffect(() => {
    const dummy = new THREE.Object3D()
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y, it.z)
      dummy.scale.setScalar(0.028)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  }, [items])
  return (
    <instancedMesh ref={mesh} args={[null, null, items.length]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#ffe6b8" emissive="#ffc46a" emissiveIntensity={night ? 2.2 : 0.7} />
    </instancedMesh>
  )
}

/** Sheer curved drapes at the corners. */
function Drapes() {
  const corners = [
    [HALF, HALF, Math.PI * 0.25],
    [-HALF, HALF, Math.PI * 0.75],
    [-HALF, -HALF, Math.PI * 1.25],
    [HALF, -HALF, Math.PI * 1.75],
  ]
  return corners.map(([x, z, ry], i) => (
    <mesh key={i} position={[x * 0.94, TOP / 2 - 0.05, z * 0.94]} rotation-y={ry}>
      <cylinderGeometry args={[0.5, 0.65, TOP - 0.15, 10, 1, true, 0, Math.PI * 0.9]} />
      <meshStandardMaterial color="#f6e8da" roughness={0.9} transparent opacity={0.92} side={THREE.DoubleSide} />
    </mesh>
  ))
}

/** Crystal chandelier at the centre. */
function Chandelier({ night }) {
  return (
    <group position={[0, TOP, 0]}>
      <mesh position-y={-0.5}>
        <cylinderGeometry args={[0.015, 0.015, 1.0, 6]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position-y={-1.06}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#fff2d0" emissive="#ffd98a" emissiveIntensity={night ? 3 : 1} />
      </mesh>
      {[0.3, 0.2].map((r, i) => (
        <mesh key={i} position-y={-1.02 - i * 0.14} rotation-x={Math.PI / 2}>
          <torusGeometry args={[r, 0.018, 8, 24]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={`c${i}`} position={[Math.cos(a) * 0.3, -1.14, Math.sin(a) * 0.3]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#fff2d0" emissive="#ffd98a" emissiveIntensity={night ? 2.4 : 0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Mattresses, havan table and red benches, like the ceremony setup. */
function Seating() {
  return (
    <group>
      {/* white mattresses around the centre */}
      {[
        [0, 1.35, 1.7, 0.9, 0],
        [-1.25, -0.1, 0.9, 1.6, 0],
        [1.25, -0.1, 0.9, 1.6, 0],
      ].map(([x, z, w, d], i) => (
        <mesh key={`m${i}`} position={[x, 0.07, z]}>
          <boxGeometry args={[w, 0.1, d]} />
          <meshStandardMaterial color="#f2ede2" roughness={0.95} />
        </mesh>
      ))}
      {/* low havan table */}
      <mesh position={[0, 0.14, -0.1]}>
        <boxGeometry args={[0.8, 0.2, 0.55]} />
        <meshStandardMaterial color="#6b4a2e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.28, -0.1]}>
        <cylinderGeometry args={[0.1, 0.13, 0.09, 10]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {/* red benches at the corners */}
      {[
        [1.9, 1.6], [-1.9, 1.6], [1.9, -1.7], [-1.9, -1.7],
      ].map(([x, z], i) => (
        <group key={`b${i}`} position={[x, 0, z]}>
          <mesh position-y={0.16}>
            <boxGeometry args={[1.3, 0.14, 0.55]} />
            <meshStandardMaterial color="#8a5a34" roughness={0.85} />
          </mesh>
          <mesh position-y={0.3}>
            <boxGeometry args={[1.3, 0.16, 0.55]} />
            <meshStandardMaterial color="#b03030" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Black cylindrical uplights around the carpet edge. */
function Uplights({ night }) {
  const spots = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3
        return [Math.cos(a) * 4.6, Math.sin(a) * 4.6]
      }),
    [],
  )
  return spots.map(([x, z], i) => (
    <group key={i} position={[x, 0, z]}>
      <mesh position-y={0.16}>
        <cylinderGeometry args={[0.07, 0.08, 0.32, 10]} />
        <meshStandardMaterial color="#1c1c20" roughness={0.6} />
      </mesh>
      <mesh position-y={0.33}>
        <cylinderGeometry args={[0.055, 0.055, 0.02, 10]} />
        <meshStandardMaterial color="#fff0c8" emissive="#ffca6a" emissiveIntensity={night ? 2.6 : 0.5} />
      </mesh>
    </group>
  ))
}

/** Small diya flames dotting the carpet edge. */
function Diyas({ radius = 5.1, count = 12 }) {
  const positions = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        return [Math.cos(a) * radius, 0.03, Math.sin(a) * radius]
      }),
    [radius, count],
  )
  return positions.map((p, i) => (
    <group key={i} position={p}>
      <mesh>
        <cylinderGeometry args={[0.08, 0.05, 0.06, 10]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
      </mesh>
      <mesh position-y={0.07}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ffcf7d" emissive="#ff9d2e" emissiveIntensity={3} />
      </mesh>
    </group>
  ))
}

export default function Mandap({ night = true }) {
  return (
    <group>
      <Carpet />
      <Posts />
      <Canopy night={night} />
      <FlowerRing />
      <LightStrands night={night} />
      <Drapes />
      <Chandelier night={night} />
      <Seating />
      <Uplights night={night} />
      <Diyas />
    </group>
  )
}
