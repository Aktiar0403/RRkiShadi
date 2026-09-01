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
]

function Lantern({ x, y, z, phase }) {
  const group = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.position.y = y + Math.sin(t * 0.7 + phase) * 0.25
    group.current.rotation.z = Math.sin(t * 0.5 + phase) * 0.06
  })
  return (
    <group ref={group} position={[x, y, z]}>
      {/* string */}
      <mesh position-y={3}>
        <cylinderGeometry args={[0.008, 0.008, 6, 4]} />
        <meshBasicMaterial color="#3a4a3e" />
      </mesh>
      {/* body */}
      <mesh>
        <cylinderGeometry args={[0.14, 0.18, 0.34, 10]} />
        <meshStandardMaterial color="#ffcf7d" emissive="#ff9d2e" emissiveIntensity={2.6} />
      </mesh>
      <mesh position-y={0.22}>
        <coneGeometry args={[0.16, 0.12, 10]} />
        <meshStandardMaterial color="#8f6f2a" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  )
}

export default function Lanterns() {
  return SPOTS.map(([x, y, z, phase], i) => <Lantern key={i} x={x} y={y} z={z} phase={phase} />)
}
