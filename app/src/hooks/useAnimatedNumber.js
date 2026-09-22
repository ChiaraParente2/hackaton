import { useEffect, useRef, useState } from 'react'

/**
 * Fa scorrere un numero verso il valore target invece di farlo saltare.
 * Riparte sempre dal valore attualmente mostrato, così due variazioni
 * ravvicinate non producono scatti.
 */
export default function useAnimatedNumber(target, durata = 700) {
  const [valore, setValore] = useState(target)
  const valoreRef = useRef(target)
  const rafRef = useRef(null)

  useEffect(() => {
    const da = valoreRef.current
    if (da === target) return

    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / durata)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      const v = Math.round(da + (target - da) * eased)
      valoreRef.current = v
      setValore(v)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, durata])

  return valore
}
