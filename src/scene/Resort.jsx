import { useMemo } from 'react'
import * as THREE from 'three'

const SAND = { color: '#d8c5a3', roughness: 0.8 }
const BRASS = { color: '#b89355', metalness: 0.5, roughness: 0.4 }

/** Stylized palm — tapered trunk, drooping fronds. */
function Palm({ position, scale = 1, lean = 0.08 }) {
  const frondGeometry = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.quadraticCurveTo(0.5, 0.28, 1.6, 0.02)
    s.quadraticCurveTo(0.5, -0.18, 0, 0)
    return new THREE.ShapeGeometry(s, 6)
  }, [])
  const fronds = 7
  return (
    <group position={position} scale={scale} rotation-z={lean}>
      <mesh position-y={1.5}>
        <cylinderGeometry args={[0.06, 0.12, 3, 8]} />
        <meshStandardMaterial color="#6b5233" roughness={0.9} />
      </mesh>
      {Array.from({ length: fronds }, (_, i) => (
        <group key={i} position-y={3} rotation-y={(i / fronds) * Math.PI * 2}>
          <mesh geometry={frondGeometry} rotation={[-1.15 - (i % 2) * 0.25, 0, -0.12]}>
            <meshStandardMaterial color="#2e5c3e" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
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
        <boxGeometry args={[8.3, 0.5, 0.9]} />
        <meshStandardMaterial {...SAND} />
      </mesh>
      <mesh position-y={5.42}>
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
function Building({ windowGlow }) {
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
      <Pathway />
      <PathLamps />
      <Pool glow={night ? 0.55 : 0.15} />
      <Building windowGlow={night ? 1.7 : 0.12} />
      {PALMS.map(([p, s, l], i) => (
        <Palm key={i} position={p} scale={s} lean={l} />
      ))}
    </group>
  )
}
