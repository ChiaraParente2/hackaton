import { useEffect, useRef, useState } from 'react'
import useAnimatedNumber from '../../hooks/useAnimatedNumber'
import { euro } from '../../utils/finance'

/**
 * Il contatore dei soldi, trattato come il punteggio del gioco.
 * Il numero grande è il PATRIMONIO: spostare soldi nel salvadanaio non lo
 * muove, perché non hai perso nulla — scende solo quando spendi davvero.
 */
export default function MoneyHUD({ patrimonio, conto, salvadanaio, scena, passo, totaleScene }) {
  const patrimonioAnim = useAnimatedNumber(patrimonio)
  const contoAnim = useAnimatedNumber(conto)
  const salvadanaioAnim = useAnimatedNumber(salvadanaio)

  const precedente = useRef(patrimonio)
  const [bolle, setBolle] = useState([])
  const [pulsa, setPulsa] = useState(false)

  useEffect(() => {
    const delta = patrimonio - precedente.current
    precedente.current = patrimonio
    if (delta === 0) return

    const id = `${Date.now()}-${Math.random()}`
    setBolle((b) => [...b, { id, delta }])
    setPulsa(true)
    const t1 = setTimeout(() => setPulsa(false), 600)
    const t2 = setTimeout(() => setBolle((b) => b.filter((x) => x.id !== id)), 1400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [patrimonio])

  const inRosso = patrimonio < 0

  return (
    <div className="shrink-0 bg-gradient-to-b from-slate-800 to-slate-900 border-b-2 border-slate-700 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        {/* Patrimonio — il punteggio */}
        <div className="relative flex items-center gap-2">
          <span className="text-2xl leading-none">{inRosso ? '💸' : '💰'}</span>
          <div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider leading-none mb-0.5">
              I tuoi soldi
            </div>
            <div
              className={`font-mono font-bold text-xl leading-none origin-left ${
                pulsa ? 'animate-pulse-money' : ''
              } ${inRosso ? 'text-red-400' : 'text-green-400'}`}
            >
              {euro(patrimonioAnim)}
            </div>
          </div>

          {/* bolle "-220 €" che salgono */}
          <div className="absolute left-9 -top-1 pointer-events-none">
            {bolle.map((b) => (
              <div
                key={b.id}
                className={`absolute whitespace-nowrap font-mono text-sm font-bold animate-float-up ${
                  b.delta > 0 ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {b.delta > 0 ? '+' : ''}
                {euro(b.delta)}
              </div>
            ))}
          </div>
        </div>

        {/* Come sono ripartiti */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Pill
            icona="👛"
            label="Conto"
            valore={contoAnim}
            colore={conto < 0 ? 'text-red-400' : 'text-slate-200'}
          />
          <Pill icona="🏦" label="Da parte" valore={salvadanaioAnim} colore="text-blue-300" />
          {scena && (
            <div className="bg-slate-900/70 border border-slate-700 rounded-lg px-2 py-1 text-center">
              <div className="text-[9px] font-mono text-slate-500 leading-none">
                {passo}/{totaleScene}
              </div>
              <div className="font-mono text-[11px] text-slate-300 leading-tight mt-0.5">{scena}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Pill({ icona, label, valore, colore }) {
  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-lg px-2 py-1 text-right min-w-[76px]">
      <div className="text-[9px] font-mono text-slate-500 leading-none">
        {icona} {label}
      </div>
      <div className={`font-mono text-xs font-bold leading-tight mt-0.5 ${colore}`}>
        {euro(valore)}
      </div>
    </div>
  )
}
