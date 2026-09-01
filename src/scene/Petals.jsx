import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COLORS = ['#e89b3c', '#e0813f', '#d9c48c', '#f3efe1']

/** Instanced marigold petals drifting down through the scene. */
export default function Petals({ count = 240 }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const petals = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: THREE.MathUtils.randFloatSpread(20),
        z: THREE.MathUtils.randFloat(-8, 5),
        y: THREE.MathUtils.randFloat(0, 14),
        speed: THREE.MathUtils.randFloat(0.35, 0.9),
        sway: THREE.MathUtils.randFloat(0.4, 1.4),
        phase: Math.random() * Math.PI * 2,
        spinX: THREE.MathUtils.randFloat(0.5, 2),
        spinY: THREE.MathUtils.randFloat(0.5, 2),
        scale: THREE.MathUtils.randFloat(0.5, 1.1),
      })),
    [count],
  )

  useEffect(() => {
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      c.set(COLORS[Math.floor(Math.random() * COLORS.length)])
      mesh.current.setColorAt(i, c)
    }
    mesh.current.instanceColor.needsUpdate = true
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    petals.forEach((p, i) => {
      const y = 14 - ((p.y + t * p.speed) % 14)
      dummy.position.set(p.x + Math.sin(t * p.sway + p.phase) * 0.8, y, p.z)
      dummy.rotation.set(t * p.spinX + p.phase, t * p.spinY, p.phase)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <planeGeometry args={[0.13, 0.2]} />
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.9} />
    </instancedMesh>
  )
}
