import { useState } from 'react'
import CharacterSprite from '../ui/CharacterSprite'
import CompoundInterestChart from '../charts/CompoundInterestChart'
import {
  INVESTIMENTI,
  MESI_OBIETTIVO,
  mesiPerObiettivo,
  obiettivoFondo,
  speseMensiliStimate,
  proiezione,
  euro,
} from '../../utils/finance'

const ANNI_PROIEZIONE = 10

export default function SceneSavings({ gameState, dispatch }) {
  // `?? ` e non `|| `: un risparmio di 0 è una scelta valida del giocatore,
  // non un valore mancante da rimpiazzare col default.
  const maxRisparmio = gameState.allocazioni.risparmio ?? 280
  const [fondoEmergenza, setFondoEmergenza] = useState(Math.min(180, maxRisparmio))
  const [showChart, setShowChart] = useState(false)
  const [tipoInvestimento, setTipoInvestimento] = useState(null)
  const [step, setStep] = useState(0)

  const fondoInvestimento = maxRisparmio - fondoEmergenza

  // Lo slider è un VERSAMENTO MENSILE, non un fondo già accumulato: la domanda
  // sensata è "in quanti mesi arrivo a coprire 3 mesi di spese", non "quanti
  // mesi copro adesso" — che con un tetto di ~280€ darebbe sempre 0,2.
  const speseMensili = speseMensiliStimate(gameState)
  const obiettivo = obiettivoFondo(gameState)
  const mesiAllObiettivo = mesiPerObiettivo(fondoEmergenza, obiettivo)

  const investScelto = INVESTIMENTI.find(i => i.id === tipoInvestimento)
  const proiezione10 = investScelto
    ? proiezione(0, fondoInvestimento, ANNI_PROIEZIONE, investScelto.rendimento)
    : 0
  const versato10 = fondoInvestimento * 12 * ANNI_PROIEZIONE

  function conferma() {
    dispatch({ type: 'SET_SAVINGS', payload: { fondoEmergenza, fondoInvestimento, tipoInvestimento } })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'emergenza' })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'interesse_composto' })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'investimento' })
    dispatch({ type: 'NEXT_SCENE' })
  }

  if (step === 0) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center" style={{ filter: 'brightness(0.9)' }}>
        <div className="absolute inset-0 bg-slate-900/40" />
        <CharacterSprite character="sara" state="seria" position="right" />
        <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 border border-slate-600 rounded-xl p-4 z-20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-lg shadow shrink-0">😐</div>
            <div>
              <div className="font-mono text-yellow-400 text-sm mb-1">Sara</div>
              <p className="text-slate-100 text-sm leading-relaxed font-mono">Prima di investire: hai bisogno di un fondo emergenza. Un cuscinetto che ti salva quando il frigo si rompe, l'auto ha un guasto, o perdi il lavoro per un mese.</p>
            </div>
          </div>
          <button onClick={() => setStep(1)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-2 rounded-lg">
            Capito, quanti mesi? →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto" style={{ filter: 'brightness(0.9)' }}>
      <div className="absolute inset-0 bg-slate-900/60" />
      <div className="relative z-10 p-4 pb-8">
        <h2 className="font-mono text-yellow-400 text-lg mb-2 text-center">Gestisci i risparmi</h2>
        <p className="text-slate-400 text-xs text-center mb-4 font-mono">Hai {euro(maxRisparmio)}/mese da allocare</p>

        {/* Step 1: Fondo emergenza */}
        <div className="bg-slate-800/80 rounded-xl p-4 mb-4">
          <h3 className="font-mono text-blue-300 text-sm mb-2">🛡️ Fondo emergenza</h3>
          <div className="flex justify-between mb-1">
            <span className="text-slate-300 text-xs font-mono">Obiettivo mensile</span>
            <span className="text-blue-400 font-mono text-sm font-bold">{euro(fondoEmergenza)}</span>
          </div>
          <input
            type="range" min={0} max={maxRisparmio} step={10} value={fondoEmergenza}
            onChange={e => setFondoEmergenza(Number(e.target.value))}
            className="w-full h-2 accent-blue-500 cursor-pointer mb-2"
          />
          <p className="text-slate-400 text-xs font-mono leading-relaxed">
            Obiettivo: <span className="text-white">{MESI_OBIETTIVO} mesi delle tue spese</span> ={' '}
            <span className="text-white">{euro(obiettivo)}</span>
            <span className="text-slate-500"> ({euro(speseMensili)}/mese)</span>
            <br />
            {!Number.isFinite(mesiAllObiettivo) ? (
              <span className="text-orange-300">Senza versamenti non lo raggiungi mai ⚠️</span>
            ) : (
              <>
                A questo ritmo lo raggiungi in{' '}
                <span className="text-white">{mesiAllObiettivo} mesi</span>
                {mesiAllObiettivo <= 12
                  ? ' ✅ ottimo, meno di un anno'
                  : mesiAllObiettivo <= 24
                    ? ' 🟡 discreto, entro due anni'
                    : ' ⚠️ lento, oltre due anni'}
              </>
            )}
          </p>
        </div>

        {/* Step 2: Interesse composto */}
        <div className="bg-slate-800/80 rounded-xl p-4 mb-4">
          <button
            onClick={() => setShowChart(!showChart)}
            className="w-full flex justify-between items-center font-mono text-green-300 text-sm"
          >
            <span>📈 Il potere dell'interesse composto</span>
            <span>{showChart ? '▲' : '▼'}</span>
          </button>
          {showChart && (
            <div className="mt-3">
              <CompoundInterestChart
                versamentoMensile={fondoInvestimento}
                evidenzia={tipoInvestimento}
              />
            </div>
          )}
        </div>

        {/* Step 3: Tipo investimento */}
        <div className="bg-slate-800/80 rounded-xl p-4 mb-4">
          <h3 className="font-mono text-yellow-300 text-sm mb-3">💹 Investi {euro(fondoInvestimento)}/mese</h3>
          <div className="space-y-2">
            {INVESTIMENTI.map(inv => (
              <button
                key={inv.id}
                onClick={() => setTipoInvestimento(inv.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  tipoInvestimento === inv.id
                    ? 'bg-yellow-500/20 border-yellow-400'
                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-slate-100 text-sm">{inv.nome}</span>
                  <span className="font-mono text-green-400 text-xs">+{(inv.rendimento * 100).toFixed(0)}%/anno</span>
                </div>
                <p className="text-slate-400 text-xs">{inv.descrizione}</p>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full ${i < inv.rischio ? 'bg-orange-400' : 'bg-slate-600'}`} />
                  ))}
                  <span className="text-slate-500 text-xs ml-1">rischio</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {investScelto && (
          <div className="bg-green-900/40 border border-green-500/30 rounded-lg p-3 mb-4">
            <p className="text-green-300 font-mono text-xs leading-relaxed">
              📊 Con {investScelto.nome}, versando {euro(fondoInvestimento)}/mese, tra{' '}
              {ANNI_PROIEZIONE} anni avresti{' '}
              <span className="font-bold text-green-200">{euro(proiezione10)}</span>
              <br />
              <span className="text-green-400/70">
                {euro(versato10)} versati da te + {euro(proiezione10 - versato10)} di interessi
              </span>
            </p>
            <p className="text-slate-400 text-[10px] italic mt-2">
              Stime storiche medie, non garanzie future.
            </p>
          </div>
        )}

        <button
          onClick={conferma}
          disabled={!tipoInvestimento}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-mono text-sm py-3 rounded-lg transition-colors"
        >
          Conferma strategia →
        </button>
      </div>
    </div>
  )
}
