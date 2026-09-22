import { useState, useEffect, useRef } from 'react'

export default function ConceptBadge({ concetto, unlocked }) {
  const [showPopup, setShowPopup] = useState(false)
  // Parte dal valore iniziale: un badge già sbloccato al mount non è una
  // novità. Prima il popup scattava a ogni mount, quindi in SceneSummary
  // tutti i concetti già acquisiti sparavano "+1 concetto!" insieme.
  const eraSbloccato = useRef(unlocked)

  useEffect(() => {
    if (unlocked && !eraSbloccato.current) {
      eraSbloccato.current = true
      setShowPopup(true)
      const t = setTimeout(() => setShowPopup(false), 3000)
      return () => clearTimeout(t)
    }
    eraSbloccato.current = unlocked
  }, [unlocked])

  return (
    <div className="relative">
      <div
        className={`rounded-lg border p-2 text-center transition-all duration-300 ${
          unlocked
            ? 'bg-slate-700 border-yellow-400/50 text-slate-100'
            : 'bg-slate-800/50 border-slate-700 text-slate-600'
        }`}
      >
        <div className="text-xl mb-1">
          {unlocked ? concetto.icona : '🔒'}
        </div>
        <div className="text-xs font-mono leading-tight">{concetto.nome}</div>
      </div>
      {showPopup && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-xs font-mono px-2 py-1 rounded whitespace-nowrap z-30 animate-fade-in">
          +1 concetto!
        </div>
      )}
    </div>
  )
}
