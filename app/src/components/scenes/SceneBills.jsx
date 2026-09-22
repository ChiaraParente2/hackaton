import { useState } from 'react'
import CharacterSprite from '../ui/CharacterSprite'

const DOMANDE = [
  {
    id: 'luce',
    domanda: 'Quante ore al giorno tieni le luci accese?',
    opzioni: [
      { label: '4-6 ore (LED, attenzione)', costo: 28 },
      { label: '8-10 ore (uso normale)', costo: 45 },
      { label: '12+ ore (sempre acceso)', costo: 68 },
    ],
  },
  {
    id: 'gas',
    domanda: 'Come usi il riscaldamento?',
    opzioni: [
      { label: 'Solo quando serve, temperatura bassa', costo: 35 },
      { label: 'Quotidiano, temperatura media', costo: 65 },
      { label: 'Sempre al massimo', costo: 95 },
    ],
  },
  {
    id: 'internet',
    domanda: 'Internet: quale piano hai scelto?',
    opzioni: [
      { label: 'Fibra base (29€/mese)', costo: 29 },
      { label: 'Fibra premium (45€/mese)', costo: 45 },
      { label: 'Fibra + TV (65€/mese)', costo: 65 },
    ],
  },
]

export default function SceneBills({ gameState, dispatch }) {
  const [step, setStep] = useState(0)
  const [bollette, setBollette] = useState({ luce: 0, gas: 0, internet: 29 })
  const [revealed, setRevealed] = useState([])
  const [done, setDone] = useState(false)

  function scegliOpzione(id, costo) {
    const updated = { ...bollette, [id]: costo }
    setBollette(updated)
    setRevealed(prev => [...new Set([...prev, id])])
    if (step < DOMANDE.length - 1) {
      setStep(step + 1)
    } else {
      setDone(true)
    }
  }

  function conferma() {
    dispatch({ type: 'SET_BOLLETTE', payload: bollette })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'bollette' })
    dispatch({ type: 'NEXT_SCENE' })
  }

  const total = bollette.luce + bollette.gas + bollette.internet
  const saraState = total > 150 ? 'seria' : total > 100 ? 'neutro' : 'sorridente'
  const saraMsg = total > 150
    ? `${total}€ di bollette sono tante! Considera di ridurre i consumi energetici.`
    : total > 100
    ? `${total}€ di bollette — nella media. Qualche piccola abitudine può migliorarle.`
    : `Ottimo! ${total}€ di bollette è un risultato eccellente.`

  if (!done) {
    const domanda = DOMANDE[step]
    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/50" />
        <img src="/assets/phone.png" className="absolute top-4 right-4 w-24 opacity-80 z-10" alt="" />

        {/* Bollette rivelate finora */}
        <div className="absolute top-4 left-4 space-y-1 z-10">
          {revealed.map(id => (
            <div key={id} className="bg-slate-800/80 rounded px-2 py-1 animate-fade-in">
              <span className="text-xs font-mono text-slate-300 capitalize">{id}: </span>
              <span className="text-xs font-mono text-yellow-400">{bollette[id]}€</span>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-end pb-4 px-4 z-10">
          <div className="bg-slate-800/95 rounded-xl p-5 w-full border border-slate-600">
            <div className="text-slate-400 text-xs font-mono mb-1">Domanda {step + 1}/{DOMANDE.length}</div>
            <h3 className="font-mono text-white text-sm mb-4">{domanda.domanda}</h3>
            <div className="space-y-2">
              {domanda.opzioni.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => scegliOpzione(domanda.id, opt.costo)}
                  className="w-full text-left p-3 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-400 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 text-xs font-mono">{opt.label}</span>
                    <span className="text-yellow-400 font-mono text-sm font-bold">{opt.costo}€</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/50" />
      <img src="/assets/phone.png" className="absolute top-4 right-4 w-24 opacity-80 z-10" alt="" />
      <CharacterSprite character="sara" state={saraState} position="left" />

      <div className="absolute inset-0 flex items-end pb-4 px-4 z-10">
        <div className="bg-slate-800/95 rounded-xl p-5 w-full border border-slate-600">
          <h3 className="font-mono text-yellow-400 text-sm mb-3">📋 Riepilogo bollette mensili</h3>
          <div className="space-y-2 mb-3">
            {[['luce', '💡 Luce'], ['gas', '🔥 Gas'], ['internet', '📡 Internet']].map(([k, label]) => (
              <div key={k} className="flex justify-between animate-fade-in">
                <span className="text-slate-300 text-xs font-mono">{label}</span>
                <span className="text-yellow-400 font-mono text-sm">{bollette[k]}€</span>
              </div>
            ))}
            <div className="border-t border-slate-600 pt-2 flex justify-between">
              <span className="text-slate-200 text-xs font-mono font-bold">Totale</span>
              <span className={`font-mono text-base font-bold ${total > 150 ? 'text-red-400' : 'text-green-400'}`}>{total}€</span>
            </div>
          </div>
          <div className="flex gap-2 items-start mb-4">
            <span className="text-xl">{saraState === 'seria' ? '😐' : '😊'}</span>
            <p className="text-slate-300 text-xs font-mono">{saraMsg}</p>
          </div>
          <button onClick={conferma} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg">
            Avanti →
          </button>
        </div>
      </div>
    </div>
  )
}
