import { useRef } from 'react'

/**
 * 3D tilt that follows the pointer or a finger — works on hover (desktop)
 * and on touch-drag (mobile).
 */
export default function Tilt({ children, max = 9, className = '' }) {
  const ref = useRef(null)

  function move(clientX, clientY) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (clientX - r.left) / r.width - 0.5
    const y = (clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-4px)`
  }

  function reset() {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={(e) => move(e.clientX, e.clientY)}
      onPointerLeave={reset}
      onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={reset}
      onTouchCancel={reset}
    >
      {children}
    </div>
  )
}
