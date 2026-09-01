import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Sparkles, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import Mandap from './Mandap.jsx'
import Petals from './Petals.jsx'
import Lanterns from './Lanterns.jsx'
import Rings from './Rings.jsx'

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/**
 * Eases the camera toward a pointer-driven orbit target — the "camera
 * hover". On phones the device's physical tilt steers the camera too.
 */
function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(0, 2.1, 0), [])
  const orient = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // iOS needs a permission gesture for motion events; skip there and
    // fall back to touch-drag, which R3F already maps to the pointer.
    if (typeof DeviceOrientationEvent === 'undefined' || DeviceOrientationEvent.requestPermission) return
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return
      orient.current.x = THREE.MathUtils.clamp(e.gamma / 28, -1, 1)
      orient.current.y = THREE.MathUtils.clamp((e.beta - 45) / 28, -1, 1)
    }
    window.addEventListener('deviceorientation', onOrient)
    return () => window.removeEventListener('deviceorientation', onOrient)
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const x = THREE.MathUtils.clamp(state.pointer.x + orient.current.x, -1.2, 1.2)
    const y = THREE.MathUtils.clamp(state.pointer.y - orient.current.y, -1.2, 1.2)
    // idle drift + pointer/tilt offset
    target.set(
      Math.sin(t * 0.1) * 0.9 + x * 2.4,
      2.7 + Math.sin(t * 0.16) * 0.2 + y * 1.2,
      10.6 + Math.cos(t * 0.1) * 0.5,
    )
    const d = 1 - Math.pow(0.02, delta) // frame-rate independent damping
    state.camera.position.lerp(target, d)
    state.camera.lookAt(look)
  })
  return null
}

export default function Scene() {
  return (
    <Canvas
      dpr={isTouch ? 1 : [1, 1.5]}
      camera={{ position: [0, 2.7, 10.6], fov: isTouch ? 55 : 45 }}
      gl={{ antialias: !isTouch, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#0c1d16']} />
      <fog attach="fog" args={['#0c1d16', 15, 36]} />

      {/* dusk lighting — warm sunset key, cool green fill */}
      <ambientLight intensity={0.35} color="#b8c7b0" />
      <directionalLight position={[-8, 6, -4]} intensity={1.6} color="#e0813f" />
      <directionalLight position={[6, 8, 6]} intensity={0.5} color="#d9c48c" />
      <pointLight position={[0, 3.2, 0]} intensity={14} color="#ffb347" distance={12} decay={2} />

      <Mandap />
      <Lanterns />
      <Petals count={isTouch ? 120 : 240} />
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
        <Rings position={[0, 6.4, 0.4]} />
      </Float>

      <Sparkles count={isTouch ? 50 : 90} scale={[16, 8, 12]} position={[0, 3.5, 0]} size={2.2} speed={0.35} color="#d9c48c" />
      <Stars radius={70} depth={40} count={isTouch ? 800 : 1400} factor={3} saturation={0} fade speed={0.6} />

      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.05}>
        <circleGeometry args={[40, 48]} />
        <meshStandardMaterial color="#0e2119" roughness={1} />
      </mesh>

      <CameraRig />
      <EffectComposer enabled={!isTouch}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1} />
        <Vignette eskil={false} offset={0.15} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  )
}
