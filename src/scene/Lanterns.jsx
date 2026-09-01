import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const SPOTS = [
  [-5.6, 5.2, -2.5, 0.9],
  [5.8, 4.6, -1.8, 1.3],
  [-4.4, 6.1, 1.6, 0.7],
  [4.6, 6.4, 2.2, 1.1],
  [-6.8, 4.2, 0.8, 1.6],
  [6.9, 5.5, -0.6, 0.5],
  [-3.2, 7.2, -3.4, 1.9],
  [3.4, 7.0, -3.8, 0.3],
  [0.8, 7.6, -4.6, 1.4],
  [-1.6, 8.0, 3.2, 2.2],
]

/** A soft glowing orb drifting on a near-invisible thread. */
function Orb({ x, y, z, phase, color, intensity }) {
  const group = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.position.y = y + Math.sin(t * 0.6 + phase) * 0.3
    group.current.position.x = x + Math.sin(t * 0.4 + phase * 2) * 0.15
  })
  return (
    <group ref={group} position={[x, y, z]}>
      <mesh position-y={4}>
        <cylinderGeometry args={[0.004, 0.004, 8, 3]} />
        <meshBasicMaterial color="#4a4a52" transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
      </mesh>
    </group>
  )
}

export default function Lanterns({ color = '#ffb347', intensity = 2.4 }) {
  return SPOTS.map(([x, y, z, phase], i) => (
    <Orb key={i} x={x} y={y} z={z} phase={phase} color={color} intensity={intensity} />
  ))
}
