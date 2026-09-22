import { useState } from 'react'
import SpeechBubble from '../ui/SpeechBubble'
import { euro, totaleBollette } from '../../utils/finance'

const DOMANDE = [
  {
    id: 'luce',
    icona: '⚡',
    mittente: 'Enel Energia',
    domanda: 'Quante ore al giorno tieni le luci accese?',
    opzioni: [
      { label: '4-6 ore, LED e attenzione', costo: 28 },
      { label: '8-10 ore, uso normale', costo: 45 },
      { label: '12+ ore, sempre accese', costo: 68 },
    ],
  },
  {
    id: 'gas',
    icona: '🔥',
    mittente: 'Eni Plenitude',
    domanda: 'Come usi il riscaldamento?',
    opzioni: [
      { label: 'Solo quando serve, a bassa temperatura', costo: 35 },
      { label: 'Quotidiano, temperatura media', costo: 65 },
      { label: 'Sempre al massimo', costo: 95 },
    ],
  },
  {
    id: 'internet',
    icona: '📡',
    mittente: 'TIM',
    domanda: 'Internet: quale piano hai scelto?',
    opzioni: [
      { label: 'Fibra base', costo: 29 },
      { label: 'Fibra premium', costo: 45 },
      { label: 'Fibra + pacchetto TV', costo: 65 },
    ],
  },
]

const ORE = ['09:14', '11:02', '17:38']

export default function SceneBills({ gameState, dispatch }) {
  const [step, setStep] = useState(0)
  const [bollette, setBollette] = useState({ luce: 0, gas: 0, internet: 0 })
  const [arrivate, setArrivate] = useState([])
  const [done, setDone] = useState(false)

  function scegliOpzione(id, costo) {
    setBollette((b) => ({ ...b, [id]: costo }))
    setArrivate((prev) => [...prev, id])
    if (step < DOMANDE.length - 1) setStep(step + 1)
    else setDone(true)
  }

  function conferma() {
    dispatch({ type: 'SET_BOLLETTE', payload: bollette })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'bollette' })
    dispatch({ type: 'NEXT_SCENE' })
  }

  const totale = totaleBollette(bollette)
  const caro = totale > 150
  const commento = caro
    ? `${euro(totale)} di bollette sono tante. La buona notizia: quasi tutto dipende da abitudini che puoi cambiare domani.`
    : totale > 100
      ? `${euro(totale)} è nella media. Qualche accorgimento e scendi ancora.`
      : `${euro(totale)} è un ottimo risultato: hai capito che le bollette non sono un destino, sono consumi.`

  const domanda = DOMANDE[step]

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/75" />

      {/* Il telefono: è lo schermo su cui arrivano le bollette */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 h-[52%] z-10">
        <div className="relative h-full">
          <img src="/assets/phone.png" alt="" className="h-full w-auto drop-shadow-2xl" />

          {/* lo schermo: riquadro interno alla cornice */}
          <div className="absolute inset-0 px-[8%] py-[4.5%]">
            <div className="h-full w-full rounded-[7%] overflow-hidden flex flex-col px-[5%] pt-[13%]">
              <div className="text-center mb-1.5">
                <div className="font-mono text-[9px] text-slate-600/80 leading-none">
                  martedì 22
                </div>
                <div className="font-mono text-xl font-bold text-slate-700 leading-tight">
                  {ORE[Math.min(arrivate.length, ORE.length - 1)]}
                </div>
              </div>

              <div className="flex-1 space-y-1 overflow-hidden">
                {arrivate.length === 0 && (
                  <p className="text-center font-mono text-[8px] text-slate-500/80 mt-3">
                    nessuna notifica
                  </p>
                )}
                {arrivate.map((id, i) => {
                  const d = DOMANDE.find((q) => q.id === id)
                  return (
                    <div
                      key={id}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="animate-fade-in bg-white/85 rounded-lg px-1.5 py-1 shadow-sm flex items-start gap-1"
                    >
                      <span className="text-[11px] leading-none mt-0.5">{d.icona}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline gap-1">
                          <span className="font-mono text-[8px] font-bold text-slate-800 truncate">
                            {d.mittente}
                          </span>
                          <span className="font-mono text-[7px] text-slate-400 shrink-0">
                            {ORE[i]}
                          </span>
                        </div>
                        <div className="font-mono text-[8px] text-slate-600 leading-tight">
                          Bolletta di {euro(bollette[id])}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {done && (
                  <div className="animate-fade-in bg-slate-900/90 rounded-lg px-1.5 py-1 mt-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-[8px] text-slate-300">Totale mese</span>
                      <span
                        className={`font-mono text-[11px] font-bold ${caro ? 'text-red-400' : 'text-green-400'}`}
                      >
                        {euro(totale)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* pallino rosso col numero di notifiche */}
          {arrivate.length > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-slate-950 flex items-center justify-center animate-pulse-money">
              <span className="font-mono text-[11px] font-bold text-white">{arrivate.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Domanda o riepilogo */}
      <div className="absolute inset-x-0 bottom-0 p-3 z-20">
        {!done ? (
          <div className="bg-slate-800/95 rounded-2xl p-4 border border-slate-600 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{domanda.icona}</span>
              <div>
                <div className="text-slate-500 text-[10px] font-mono">
                  {domanda.mittente} · domanda {step + 1}/{DOMANDE.length}
                </div>
                <h3 className="font-mono text-white text-sm">{domanda.domanda}</h3>
              </div>
            </div>
            <div className="space-y-2">
              {domanda.opzioni.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => scegliOpzione(domanda.id, opt.costo)}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-700/70 hover:bg-slate-600 border-2 border-slate-600 hover:border-yellow-400 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-200 text-xs font-mono">{opt.label}</span>
                    <span className="text-yellow-400 font-mono text-sm font-bold shrink-0">
                      {euro(opt.costo)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-1 mb-2">
              <img
                src={caro ? '/assets/sara_dubbiosa.png' : '/assets/sara.png'}
                alt=""
                className="h-40 w-auto shrink-0 drop-shadow-2xl animate-bob"
              />
              <div className="flex-1 min-w-0 mb-6">
                <SpeechBubble speaker="Sara" text={commento} verso="left" />
              </div>
            </div>
            <button
              onClick={conferma}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-base py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg"
            >
              Avanti →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
