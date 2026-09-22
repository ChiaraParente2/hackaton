import { useState } from 'react'
import CharacterSprite from '../ui/CharacterSprite'
import ScenaDialogo from '../ui/ScenaDialogo'
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

  const inizia = () => dispatch({ type: 'NEXT_SCENE' })

  // Sara entra in scena solo alla fine della narrazione.
  if (narrazioneFinita) {
    return (
      <ScenaDialogo
        sfondo="/assets/casa.png"
        sinistra={{ character: 'protagonista', state: 'neutro' }}
        destra={{ character: 'sara', state: 'sorridente' }}
        chiParla="destra"
        speaker="Sara"
        testo={SARA}
        azioni={[
          { label: 'Sì, grazie Sara!', onClick: inizia, variante: 'primario' },
          { label: 'Ce la faccio da solo', onClick: inizia },
        ]}
      />
    )
  }

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60" />
      <CharacterSprite character="protagonista" state="neutro" position="left" size="lg" />
      <Didascalia testo={NARRAZIONE[step]} onNext={() => setStep((s) => s + 1)} />
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
      className="absolute bottom-6 left-4 right-4 z-30 cursor-pointer select-none"
    >
      <div className="bg-slate-950/85 border border-slate-600 rounded-2xl px-5 py-4 max-w-xl mx-auto backdrop-blur-sm">
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
