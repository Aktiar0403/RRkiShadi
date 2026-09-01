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

const v = (x, y, z) => new THREE.Vector3(x, y, z)

/**
 * The camera flies a path through the scene as the page scrolls —
 * front of the mandap, orbit right, aerial, in close through the
 * garlands, then a long pull-back for the RSVP. Pointer hover (or
 * the phone's physical tilt) sways the camera on top of the path.
 */
function ScrollCamera({ scrollRef }) {
  const posCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          v(0, 2.6, 11), //   hero — face the mandap
          v(7.5, 3.2, 7.5), // celebrations — orbit right
          v(2, 9.5, 12), //   stay — rise to an aerial view
          v(-7, 2.6, 6.5), // what to wear — swing left, in close
          v(-3, 1.6, 5.2), // jaipur — low through the garlands
          v(0, 5, 14.5), //   rsvp — long pull-back
          v(0, 6.5, 17), //   footer
        ],
        false,
        'centripetal',
      ),
    [],
  )
  const lookCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [v(0, 2.2, 0), v(0, 2.4, 0), v(0, 1.2, 0), v(0, 2.6, 0), v(0, 3.8, 0), v(0, 3.2, 0), v(0, 4.2, 0)],
        false,
        'centripetal',
      ),
    [],
  )
  const smooth = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const orient = useRef({ x: 0, y: 0 })
  const p = useMemo(() => new THREE.Vector3(), [])
  const l = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    // the canvas never receives events (it sits behind the page), so
    // track the pointer on the window instead
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // Android device tilt; iOS needs a permission gesture — skip there
    let onOrient
    if (typeof DeviceOrientationEvent !== 'undefined' && !DeviceOrientationEvent.requestPermission) {
      onOrient = (e) => {
        if (e.gamma == null || e.beta == null) return
        orient.current.x = THREE.MathUtils.clamp(e.gamma / 28, -1, 1)
        orient.current.y = THREE.MathUtils.clamp((e.beta - 45) / 28, -1, 1)
      }
      window.addEventListener('deviceorientation', onOrient)
    }
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (onOrient) window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    smooth.current = THREE.MathUtils.damp(smooth.current, scrollRef.current, 2.2, delta)
    const s = THREE.MathUtils.clamp(smooth.current, 0, 1)
    posCurve.getPoint(s, p)
    lookCurve.getPoint(s, l)

    const hx = THREE.MathUtils.clamp(pointer.current.x + orient.current.x, -1.2, 1.2)
    const hy = THREE.MathUtils.clamp(pointer.current.y - orient.current.y, -1.2, 1.2)

    state.camera.position.set(
      p.x + hx * 1.7 + Math.sin(t * 0.14) * 0.35,
      p.y + hy * 1.0 + Math.sin(t * 0.19) * 0.2,
      p.z,
    )
    state.camera.lookAt(l)
  })
  return null
}

export default function Scene({ scrollRef }) {
  return (
    <Canvas
      dpr={isTouch ? 1 : [1, 1.5]}
      camera={{ position: [0, 2.6, 11], fov: isTouch ? 58 : 46 }}
      gl={{ antialias: !isTouch, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#0a0d16']} />
      <fog attach="fog" args={['#0a0d16', 16, 42]} />

      {/* night lighting — warm sunset key, cool indigo fill */}
      <ambientLight intensity={0.32} color="#a9b4cd" />
      <directionalLight position={[-8, 6, -4]} intensity={1.5} color="#e0813f" />
      <directionalLight position={[6, 8, 6]} intensity={0.45} color="#d9c48c" />
      <pointLight position={[0, 3.2, 0]} intensity={14} color="#ffb347" distance={12} decay={2} />

      <Mandap />
      <Lanterns />
      <Petals count={isTouch ? 110 : 240} />
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
        <Rings position={[0, 6.4, 0.4]} />
      </Float>

      <Sparkles count={isTouch ? 50 : 90} scale={[16, 8, 12]} position={[0, 3.5, 0]} size={2.2} speed={0.35} color="#d9c48c" />
      <Stars radius={70} depth={40} count={isTouch ? 800 : 1500} factor={3} saturation={0} fade speed={0.6} />

      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.05}>
        <circleGeometry args={[45, 48]} />
        <meshStandardMaterial color="#0b1220" roughness={1} />
      </mesh>

      <ScrollCamera scrollRef={scrollRef} />
      <EffectComposer enabled={!isTouch}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1} />
        <Vignette eskil={false} offset={0.15} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  )
}
