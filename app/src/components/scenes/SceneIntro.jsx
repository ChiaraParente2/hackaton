import { useState } from 'react'
import DialogBox from '../ui/DialogBox'
import CharacterSprite from '../ui/CharacterSprite'

const DIALOGHI = [
  { speaker: null, text: 'Milano. Settembre. Hai appena firmato il contratto per il tuo primo appartamento.' },
  { speaker: null, text: 'Sul conto corrente: 1.400€. Il tuo primo stipendio netto.' },
  { speaker: null, text: 'Per la prima volta nella vita, nessuno ti dice come spenderli.' },
  { speaker: 'Sara', text: 'Ciao! Sono Sara. Abito al piano di sopra da tre anni. Ho fatto tutti gli errori possibili — posso risparmiarti qualche disastro?' },
]

export default function SceneIntro({ dispatch }) {
  const [step, setStep] = useState(0)
  const [saraVisible, setSaraVisible] = useState(false)
  const current = DIALOGHI[step]

  function handleNext() {
    if (step === 2) {
      setSaraVisible(true)
    }
    if (step < DIALOGHI.length - 1) {
      setStep(step + 1)
    }
  }

  function advance() {
    dispatch({ type: 'NEXT_SCENE' })
  }

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/30" />

      {saraVisible && (
        <CharacterSprite character="sara" state="sorridente" position="left" slideIn />
      )}

      {step < DIALOGHI.length - 1 ? (
        <DialogBox
          speaker={current.speaker}
          text={current.text}
          onNext={handleNext}
        />
      ) : (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 border border-slate-600 rounded-xl p-4 z-20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-lg shadow shrink-0">😊</div>
            <div>
              <div className="font-mono text-yellow-400 text-sm mb-1">Sara</div>
              <p className="text-slate-100 text-sm leading-relaxed font-mono">{current.text}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={advance}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-mono text-sm py-2 px-4 rounded-lg transition-colors"
            >
              Sì, grazie Sara!
            </button>
            <button
              onClick={advance}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-200 font-mono text-sm py-2 px-4 rounded-lg transition-colors"
            >
              Ce la faccio da solo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
