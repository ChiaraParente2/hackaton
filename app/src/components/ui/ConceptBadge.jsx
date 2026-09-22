import { useState, useEffect } from 'react'

export default function ConceptBadge({ concetto, unlocked }) {
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (unlocked) {
      setShowPopup(true)
      const t = setTimeout(() => setShowPopup(false), 3000)
      return () => clearTimeout(t)
    }
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
