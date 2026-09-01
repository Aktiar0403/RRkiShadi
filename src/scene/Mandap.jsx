import { useMemo } from 'react'
import * as THREE from 'three'

const GOLD = { color: '#c8a44d', metalness: 0.85, roughness: 0.3 }
const IVORY = { color: '#efe7d2', metalness: 0.05, roughness: 0.8 }

/** A sagging garland strung between two points. */
function Garland({ from, to, sag = 0.75, color = '#e89b3c' }) {
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const mid = a.clone().add(b).multiplyScalar(0.5)
    mid.y -= sag
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
    return new THREE.TubeGeometry(curve, 24, 0.055, 8, false)
  }, [from, to, sag])
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.7} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  )
}

function Pillar({ position }) {
  return (
    <group position={position}>
      <mesh position-y={1.7}>
        <cylinderGeometry args={[0.13, 0.17, 3.4, 16]} />
        <meshStandardMaterial {...IVORY} />
      </mesh>
      {/* base and capital */}
      <mesh position-y={0.08}>
        <cylinderGeometry args={[0.26, 0.3, 0.16, 16]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position-y={3.42}>
        <torusGeometry args={[0.17, 0.05, 10, 24]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position-y={3.52}>
        <cylinderGeometry args={[0.24, 0.16, 0.18, 16]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
    </group>
  )
}

/** Small glowing diya flames around the platform edge. */
function Diyas({ radius = 4.1, count = 14 }) {
  const positions = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        return [Math.cos(a) * radius, 0.62, Math.sin(a) * radius]
      }),
    [radius, count],
  )
  return positions.map((p, i) => (
    <group key={i} position={p}>
      <mesh>
        <cylinderGeometry args={[0.09, 0.05, 0.07, 10]} />
        <meshStandardMaterial color="#7a4a21" roughness={0.9} />
      </mesh>
      <mesh position-y={0.08}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#ffcf7d" emissive="#ff9d2e" emissiveIntensity={3.2} />
      </mesh>
    </group>
  ))
}

export default function Mandap() {
  const P = 2.55 // pillar offset
  const topY = 3.55
  return (
    <group>
      {/* stepped platform */}
      <mesh position-y={0.1}>
        <cylinderGeometry args={[4.7, 4.9, 0.2, 48]} />
        <meshStandardMaterial {...IVORY} />
      </mesh>
      <mesh position-y={0.3}>
        <cylinderGeometry args={[4.1, 4.3, 0.2, 48]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position-y={0.5}>
        <cylinderGeometry args={[3.5, 3.7, 0.2, 48]} />
        <meshStandardMaterial {...IVORY} />
      </mesh>

      <Pillar position={[P, 0.6, P]} />
      <Pillar position={[-P, 0.6, P]} />
      <Pillar position={[P, 0.6, -P]} />
      <Pillar position={[-P, 0.6, -P]} />

      {/* canopy — four-sided cone reads as draped fabric */}
      <mesh position-y={4.95} rotation-y={Math.PI / 4}>
        <coneGeometry args={[3.9, 1.5, 4]} />
        <meshStandardMaterial color="#1d4634" roughness={0.85} flatShading />
      </mesh>
      <mesh position-y={4.28} rotation-y={Math.PI / 4} rotation-x={Math.PI / 2}>
        <torusGeometry args={[3.86, 0.06, 8, 4]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {/* kalash finial */}
      <mesh position-y={5.78}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial {...GOLD} emissive="#c8a44d" emissiveIntensity={0.6} />
      </mesh>
      <mesh position-y={6.02}>
        <coneGeometry args={[0.1, 0.24, 12]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* marigold garlands strung between pillar tops, two swags per side */}
      {[
        [[P, topY, P], [-P, topY, P]],
        [[-P, topY, P], [-P, topY, -P]],
        [[-P, topY, -P], [P, topY, -P]],
        [[P, topY, -P], [P, topY, P]],
      ].map(([a, b], i) => (
        <group key={i}>
          <Garland from={a} to={b} sag={0.7} color="#e89b3c" />
          <Garland from={a} to={b} sag={1.05} color="#d9c48c" />
        </group>
      ))}

      <Diyas />
    </group>
  )
}
