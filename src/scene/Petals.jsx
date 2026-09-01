import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COLORS = ['#e89b3c', '#e0813f', '#d9c48c', '#f3efe1']

/** Instanced petals drifting down through the scene. */
export default function Petals({ count = 240, colors = COLORS, xSpread = 20, zMin = -8, zMax = 5 }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const petals = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: THREE.MathUtils.randFloatSpread(xSpread),
        z: THREE.MathUtils.randFloat(zMin, zMax),
        y: THREE.MathUtils.randFloat(0, 14),
        speed: THREE.MathUtils.randFloat(0.35, 0.9),
        sway: THREE.MathUtils.randFloat(0.4, 1.4),
        phase: Math.random() * Math.PI * 2,
        spinX: THREE.MathUtils.randFloat(0.5, 2),
        spinY: THREE.MathUtils.randFloat(0.5, 2),
        scale: THREE.MathUtils.randFloat(0.5, 1.1),
      })),
    [count, xSpread, zMin, zMax],
  )

  useEffect(() => {
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      c.set(colors[i % colors.length])
      mesh.current.setColorAt(i, c)
    }
    mesh.current.instanceColor.needsUpdate = true
  }, [count, colors])

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

  // teardrop petal outline, not a rectangle
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, -0.1)
    shape.quadraticCurveTo(0.065, -0.03, 0.045, 0.05)
    shape.quadraticCurveTo(0.022, 0.11, 0, 0.12)
    shape.quadraticCurveTo(-0.022, 0.11, -0.045, 0.05)
    shape.quadraticCurveTo(-0.065, -0.03, 0, -0.1)
    return new THREE.ShapeGeometry(shape, 8)
  }, [])

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <primitive object={petalGeometry} attach="geometry" />
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.9} />
    </instancedMesh>
  )
}
