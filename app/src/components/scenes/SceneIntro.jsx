import { useState } from 'react'
import CharacterSprite from '../ui/CharacterSprite'
import SpeechBubble from '../ui/SpeechBubble'
import { useTypewriter } from '../../hooks/useTypewriter'

const NARRAZIONE = [
  'Milano. Settembre. Hai appena firmato il contratto per il tuo primo appartamento.',
  'Sul conto corrente: 1.400€. Il tuo primo stipendio netto.',
  'Per la prima volta nella vita, nessuno ti dice come spenderli.',
]

const SARA =
  'Ciao! Sono Sara, abito al piano di sopra da tre anni. Ho fatto tutti gli errori possibili — posso risparmiarti qualche disastro?'

export default function SceneIntro({ dispatch }) {
  const [step, setStep] = useState(0)
  const narrazioneFinita = step >= NARRAZIONE.length

  function avanti() {
    setStep((s) => s + 1)
  }

  function inizia() {
    dispatch({ type: 'NEXT_SCENE' })
  }

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40" />

      <CharacterSprite character="protagonista" state="neutro" position="left" size="lg" />
      {narrazioneFinita && (
        <CharacterSprite character="sara" state="sorridente" position="right" size="lg" />
      )}

      {!narrazioneFinita ? (
        <Didascalia testo={NARRAZIONE[step]} onNext={avanti} />
      ) : (
        <div className="absolute bottom-5 left-4 right-4 sm:left-44 sm:right-44 z-20">
          <SpeechBubble speaker="Sara" verso="right" text={SARA} />
          <div className="flex gap-3 mt-7">
            <button
              onClick={inizia}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-mono text-sm py-3 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Sì, grazie Sara!
            </button>
            <button
              onClick={inizia}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-sm py-3 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Ce la faccio da solo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Narrazione: didascalia da film, non nuvoletta — nessuno la sta dicendo. */
function Didascalia({ testo, onNext }) {
  const mostrato = useTypewriter(testo, 26)
  const completo = mostrato.length >= testo.length

  return (
    <div
      onClick={onNext}
      className="absolute bottom-6 left-4 right-4 z-20 cursor-pointer select-none"
    >
      <div className="bg-slate-950/85 border border-slate-600 rounded-xl px-5 py-4 max-w-xl mx-auto backdrop-blur-sm">
        <p className="text-slate-100 text-sm font-mono leading-relaxed text-center">
          {mostrato}
          {!completo && <span className="animate-pulse">▌</span>}
        </p>
        {completo && (
          <div className="text-center text-slate-500 text-[11px] font-mono mt-2 animate-pulse">
            ▶ tocca per continuare
          </div>
        )}
      </div>
    </div>
  )
}
