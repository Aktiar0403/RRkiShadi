import { useMemo } from 'react'
import * as THREE from 'three'

const GOLD = { color: '#b89355', metalness: 0.55, roughness: 0.38 }
const IVORY = { color: '#f0e8d6', metalness: 0.05, roughness: 0.75 }

/** A string of marigold beads sagging between two points. */
function GarlandBeads({ from, to, sag = 0.6, count = 26, color = '#e8a33c' }) {
  const positions = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const mid = a.clone().add(b).multiplyScalar(0.5)
    mid.y -= sag
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
    return curve.getPoints(count - 1)
  }, [from, to, sag, count])
  return positions.map((p, i) => (
    <mesh key={i} position={[p.x, p.y, p.z]}>
      <sphereGeometry args={[0.052, 8, 8]} />
      <meshStandardMaterial color={color} roughness={0.65} emissive={color} emissiveIntensity={0.18} />
    </mesh>
  ))
}

/** Short vertical string of gold beads hanging from the dome rim. */
function BeadDrop({ position }) {
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position-y={-0.08 * i}>
          <sphereGeometry args={[i === 3 ? 0.045 : 0.03, 8, 8]} />
          <meshStandardMaterial {...GOLD} emissive="#b89355" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function Pillar({ position }) {
  return (
    <group position={position}>
      <mesh position-y={1.7}>
        <cylinderGeometry args={[0.09, 0.12, 3.4, 14]} />
        <meshStandardMaterial {...IVORY} />
      </mesh>
      <mesh position-y={0.08}>
        <cylinderGeometry args={[0.2, 0.24, 0.16, 14]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position-y={3.34}>
        <cylinderGeometry args={[0.13, 0.09, 0.14, 14]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
    </group>
  )
}

/** Small glowing diya flames around the platform edge. */
function Diyas({ radius = 4.0, count = 16 }) {
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

/**
 * A Rajasthani chhatri — six slender pillars, a ring beam, a fluted
 * ivory dome with a gold band and kalash finial, marigold bead
 * garlands swagged between the pillars.
 */
export default function Mandap() {
  const R = 2.6 // pillar circle radius
  const N = 6
  const topY = 3.42

  const pillarPositions = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2 + Math.PI / N
        return [Math.cos(a) * R, 0.6, Math.sin(a) * R]
      }),
    [],
  )

  // graceful onion-dome profile
  const domeGeometry = useMemo(() => {
    const pts = [
      new THREE.Vector2(3.05, 0),
      new THREE.Vector2(2.95, 0.12),
      new THREE.Vector2(2.6, 0.45),
      new THREE.Vector2(2.05, 0.95),
      new THREE.Vector2(1.35, 1.4),
      new THREE.Vector2(0.65, 1.72),
      new THREE.Vector2(0.18, 1.9),
      new THREE.Vector2(0, 1.95),
    ]
    return new THREE.LatheGeometry(pts, 40)
  }, [])

  const rimDrops = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return [Math.cos(a) * 2.98, 3.95, Math.sin(a) * 2.98]
      }),
    [],
  )

  return (
    <group>
      {/* stepped platform */}
      <mesh position-y={0.1}>
        <cylinderGeometry args={[4.6, 4.8, 0.2, 48]} />
        <meshStandardMaterial {...IVORY} />
      </mesh>
      <mesh position-y={0.3}>
        <cylinderGeometry args={[4.0, 4.2, 0.2, 48]} />
        <meshStandardMaterial color="#e2d3b4" metalness={0.25} roughness={0.6} />
      </mesh>
      <mesh position-y={0.5}>
        <cylinderGeometry args={[3.4, 3.6, 0.2, 48]} />
        <meshStandardMaterial {...IVORY} />
      </mesh>

      {pillarPositions.map((p, i) => (
        <Pillar key={i} position={p} />
      ))}

      {/* ring beam the pillars carry */}
      <mesh position-y={4.02} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.85, 0.09, 12, 48]} />
        <meshStandardMaterial {...IVORY} />
      </mesh>
      <mesh position-y={4.14} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.98, 0.05, 10, 48]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* fluted ivory dome — double-sided so the interior reads when you stand beneath it */}
      <mesh position-y={4.18} geometry={domeGeometry}>
        <meshStandardMaterial color="#ede2ca" metalness={0.1} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* kalash finial */}
      <mesh position-y={6.2}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial {...GOLD} emissive="#b89355" emissiveIntensity={0.5} />
      </mesh>
      <mesh position-y={6.42}>
        <coneGeometry args={[0.07, 0.2, 12]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* gold bead drops around the dome rim */}
      {rimDrops.map((p, i) => (
        <BeadDrop key={i} position={p} />
      ))}

      {/* marigold garlands swagged pillar to pillar */}
      {pillarPositions.map((p, i) => {
        const q = pillarPositions[(i + 1) % N]
        const a = [p[0], topY, p[2]]
        const b = [q[0], topY, q[2]]
        return (
          <group key={`g${i}`}>
            <GarlandBeads from={a} to={b} sag={0.55} color={i % 2 ? '#e8a33c' : '#e07b35'} />
            <GarlandBeads from={a} to={b} sag={0.85} count={22} color="#f0d9a0" />
          </group>
        )
      })}

      <Diyas />
    </group>
  )
}
