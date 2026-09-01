import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/** Two interlocked wedding rings, slowly turning above the mandap. */
export default function Rings(props) {
  const group = useRef()
  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.35
  })
  return (
    <group ref={group} {...props}>
      <mesh position-x={-0.3} rotation-y={0.5}>
        <torusGeometry args={[0.42, 0.06, 16, 48]} />
        <meshStandardMaterial color="#e8c56a" metalness={0.95} roughness={0.18} emissive="#c8a44d" emissiveIntensity={0.7} />
      </mesh>
      <mesh position-x={0.3} rotation-y={-0.5}>
        <torusGeometry args={[0.42, 0.06, 16, 48]} />
        <meshStandardMaterial color="#f0ead8" metalness={0.95} roughness={0.15} emissive="#d9c48c" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
