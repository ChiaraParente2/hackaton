import { useState } from 'react'
import DialogBox from '../ui/DialogBox'
import CharacterSprite from '../ui/CharacterSprite'
import BudgetPieChart from '../charts/BudgetPieChart'

export default function SceneBudget({ gameState, dispatch }) {
  const [step, setStep] = useState(0)
  const [speseFisse, setSpeseFisse] = useState(700)
  const [spesePersonali, setSpesePersonali] = useState(420)
  const [risparmio, setRisparmio] = useState(280)

  const total = speseFisse + spesePersonali + risparmio
  const totalOk = total === 1400

  const saraState = risparmio < 140 ? 'seria' : risparmio > 560 ? 'sorpresa' : 'sorridente'
  const saraMsg = risparmio < 140
    ? 'Hmm... risparmiare meno del 10% è rischioso. Basta un imprevisto e sei nei guai.'
    : risparmio > 560
    ? 'Wow, quasi il 40% al risparmio! Sei davvero motivato. Tieni conto anche della qualità della vita però.'
    : 'Ottimo equilibrio! Il 20% al risparmio è un punto di partenza solido.'

  function conferma() {
    dispatch({ type: 'SET_ALLOCAZIONI', payload: { speseFisse, spesePersonali, risparmio } })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'budget' })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'risparmio' })
    dispatch({ type: 'NEXT_SCENE' })
  }

  if (step === 0) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/30" />
        <CharacterSprite character="sara" state="sorridente" position="right" />
        <DialogBox
          speaker="Sara"
          text="Okay, prima regola: ogni stipendio va diviso PRIMA di spenderlo. Non aspettare la fine del mese. Il metodo classico è 50/30/20 — spese fisse, vita personale, risparmio."
          onNext={() => setStep(1)}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60" />
      <div className="relative z-10 p-4 pb-8">
        <h2 className="font-mono text-yellow-400 text-lg mb-3 text-center">Dividi il tuo stipendio</h2>
        <p className="text-slate-300 text-xs text-center mb-4 font-mono">Stipendio: <span className="text-green-400 font-bold">1.400€</span></p>

        <div className="mb-4">
          <BudgetPieChart speseFisse={speseFisse} spesePersonali={spesePersonali} risparmio={risparmio} />
        </div>

        <div className="space-y-4 bg-slate-800/80 rounded-xl p-4 mb-4">
          <SliderRow label="Spese fisse (affitto, bollette…)" value={speseFisse} min={500} max={900} color="red" onChange={setSpeseFisse} />
          <SliderRow label="Vita personale (cibo, svago…)" value={spesePersonali} min={200} max={600} color="yellow" onChange={setSpesePersonali} />
          <SliderRow label="Risparmio & investimenti" value={risparmio} min={100} max={500} color="green" onChange={setRisparmio} />
        </div>

        <div className={`text-center font-mono text-sm mb-3 ${totalOk ? 'text-green-400' : 'text-red-400'}`}>
          Totale: {total}€ / 1400€ {!totalOk && '— aggiusta i valori!'}
        </div>

        <div className="bg-slate-700/80 rounded-lg p-3 mb-4 flex gap-2 items-start">
          <span className="text-xl">{saraState === 'seria' ? '😐' : saraState === 'sorpresa' ? '😮' : '😊'}</span>
          <p className="text-slate-200 text-xs font-mono">{saraMsg}</p>
        </div>

        <button
          onClick={conferma}
          disabled={!totalOk}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-mono text-sm py-3 rounded-lg transition-colors"
        >
          Conferma budget →
        </button>
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, color, onChange }) {
  const colors = { red: 'accent-red-500', yellow: 'accent-yellow-400', green: 'accent-green-500' }
  const textColors = { red: 'text-red-400', yellow: 'text-yellow-400', green: 'text-green-400' }
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-slate-300 text-xs font-mono">{label}</span>
        <span className={`font-mono text-sm font-bold ${textColors[color]}`}>{value}€</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-2 ${colors[color]} cursor-pointer`}
      />
    </div>
  )
}
