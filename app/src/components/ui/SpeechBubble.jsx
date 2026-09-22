import { useState, useEffect } from 'react'
import { useTypewriter } from '../../hooks/useTypewriter'

/**
 * Nuvoletta da fumetto. Chiara su sfondo scuro, con la coda che punta verso
 * il personaggio che sta parlando.
 *
 * verso: da che lato sta il personaggio ('left' | 'right').
 */
export default function SpeechBubble({
  speaker,
  text,
  onNext,
  verso = 'right',
  ctaLabel = 'tocca per continuare',
}) {
  const [saltaAnimazione, setSaltaAnimazione] = useState(false)
  const mostrato = useTypewriter(text, saltaAnimazione ? 0 : 22)
  const completo = mostrato.length >= text.length

  useEffect(() => {
    setSaltaAnimazione(false)
  }, [text])

  function click() {
    if (!completo) setSaltaAnimazione(true)
    else if (onNext) onNext()
  }

  const codaLato = verso === 'left' ? 'left-10' : 'right-10'

  return (
    <div
      onClick={click}
      className="relative bg-amber-50 border-[3px] border-slate-900 rounded-3xl px-4 py-3 cursor-pointer select-none animate-bubble-pop"
      style={{ boxShadow: '0 6px 0 rgba(15,23,42,0.6), 0 12px 24px rgba(0,0,0,0.45)' }}
    >
      {speaker && (
        <div className="inline-block bg-slate-900 text-amber-50 font-mono text-[11px] px-2 py-0.5 rounded-full mb-2">
          {speaker}
        </div>
      )}

      <p className="text-slate-900 text-sm leading-relaxed font-mono">
        {mostrato}
        {!completo && <span className="animate-pulse">▌</span>}
      </p>

      {/* senza onNext la nuvoletta è un consiglio statico, non un dialogo */}
      {completo && onNext && (
        <div className="text-right text-slate-500 text-[11px] font-mono mt-2 animate-pulse">
          ▶ {ctaLabel}
        </div>
      )}

      {/* coda: triangolo scuro (bordo) con sopra quello chiaro (riempimento) */}
      <div
        className={`absolute -bottom-[18px] ${codaLato} w-0 h-0`}
        style={{
          borderLeft: '11px solid transparent',
          borderRight: '11px solid transparent',
          borderTop: '18px solid #0f172a',
        }}
      />
      <div
        className={`absolute -bottom-[12px] ${codaLato} w-0 h-0`}
        style={{
          marginLeft: verso === 'left' ? '3px' : undefined,
          marginRight: verso === 'right' ? '3px' : undefined,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '13px solid #fffbeb',
        }}
      />
    </div>
  )
}
