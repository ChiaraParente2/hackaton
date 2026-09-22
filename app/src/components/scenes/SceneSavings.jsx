import { useState } from 'react'
import CharacterSprite from '../ui/CharacterSprite'
import SpeechBubble from '../ui/SpeechBubble'
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
  // Quanto hai destinato al futuro nella scena 1. `??` e non `||`: zero è una
  // scelta valida del giocatore, non un valore mancante.
  const budgetFuturo = gameState.allocazioni.risparmio ?? 0

  const [step, setStep] = useState(0)
  const [fondoEmergenza, setFondoEmergenza] = useState(Math.min(180, budgetFuturo))
  const [investimento, setInvestimento] = useState(0)
  const [tipoInvestimento, setTipoInvestimento] = useState(null)
  const [showChart, setShowChart] = useState(false)

  // Fondo e investimento sono due leve INDIPENDENTI: alzare una non abbassa
  // l'altra. L'unico vincolo è non superare il budget destinato al futuro;
  // quello che non assegni resta liquido sul conto.
  const maxInvestimento = Math.max(0, budgetFuturo - fondoEmergenza)
  const investimentoOk = Math.min(investimento, maxInvestimento)
  const restaSulConto = budgetFuturo - fondoEmergenza - investimentoOk

  const speseMensili = speseMensiliStimate(gameState)
  const obiettivo = obiettivoFondo(gameState)
  const mesiAllObiettivo = mesiPerObiettivo(fondoEmergenza, obiettivo)

  const investScelto = INVESTIMENTI.find((i) => i.id === tipoInvestimento)
  const proiezione10 =
    investScelto && investimentoOk > 0
      ? proiezione(0, investimentoOk, ANNI_PROIEZIONE, investScelto.rendimento)
      : 0
  const versato10 = investimentoOk * 12 * ANNI_PROIEZIONE

  const serveStrumento = investimentoOk > 0 && !tipoInvestimento
  const investeSenzaRete = investimentoOk > 0 && fondoEmergenza === 0

  function conferma() {
    dispatch({
      type: 'SET_SAVINGS',
      payload: {
        fondoEmergenza,
        fondoInvestimento: investimentoOk,
        tipoInvestimento: investimentoOk > 0 ? tipoInvestimento : null,
      },
    })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'emergenza' })
    if (investimentoOk > 0) {
      dispatch({ type: 'UNLOCK_CONCEPT', payload: 'interesse_composto' })
      dispatch({ type: 'UNLOCK_CONCEPT', payload: 'investimento' })
    }
    dispatch({ type: 'NEXT_SCENE' })
  }

  // ── Step 0 — Sara spiega la differenza ───────────────────────────────────
  if (step === 0) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/40" />
        <CharacterSprite character="sara" state="seria" position="right" size="xl" />
        <div className="absolute bottom-6 left-4 right-4 sm:right-64 z-20">
          <SpeechBubble
            speaker="Sara"
            verso="right"
            onNext={() => setStep(1)}
            text="Attenzione: risparmiare e investire sono due cose diverse. Il fondo emergenza è una rete, deve stare fermo e disponibile subito. L'investimento fa crescere i soldi, ma può scendere proprio quando ti servono. Due salvadanai separati — partiamo dalla rete."
          />
        </div>
      </div>
    )
  }

  // ── Nessun budget destinato al futuro ────────────────────────────────────
  if (budgetFuturo === 0) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/60" />
        <CharacterSprite character="sara" state="seria" position="right" size="lg" />
        <div className="absolute bottom-6 left-4 right-4 sm:right-56 z-20">
          <SpeechBubble
            speaker="Sara"
            verso="right"
            onNext={conferma}
            ctaLabel="vediamo come va"
            text="Non hai destinato niente al futuro: né rete né investimenti. Questo mese va tutto in spese. Se succede qualcosa, non hai paracadute."
          />
        </div>
      </div>
    )
  }

  // ── Step 1 — Solo il fondo emergenza ─────────────────────────────────────
  if (step === 1) {
    const tip = !Number.isFinite(mesiAllObiettivo)
      ? 'Senza mettere niente nella rete, il primo imprevisto diventa un debito. Anche 50€ al mese cambiano le cose.'
      : mesiAllObiettivo <= 12
        ? 'Ottimo ritmo: in meno di un anno hai tre mesi di spese coperti. Da lì in poi puoi spingere sugli investimenti.'
        : mesiAllObiettivo <= 24
          ? 'Ci arrivi, ma con calma. La regola pratica: prima completa la rete, poi pensa a far crescere il resto.'
          : 'A questo ritmo ci metti anni. Il fondo emergenza è la prima cosa da costruire: senza, tutto il resto è fragile.'

    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
        <div className="absolute inset-0 bg-slate-900/75" />
        <div className="relative z-10 p-4 pb-8">
          <div className="text-center mb-3">
            <div className="text-4xl mb-1">🛡️</div>
            <h2 className="font-mono text-blue-300 text-lg">La rete di sicurezza</h2>
            <p className="text-slate-400 text-xs font-mono mt-1">
              Passo 1 di 2 · hai <span className="text-green-400">{euro(budgetFuturo)}</span> per il
              futuro
            </p>
          </div>

          <div className="bg-slate-800/85 rounded-xl p-4 mb-3 border-2 border-blue-500/50">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-slate-300 text-sm">Quanto nella rete?</span>
              <span className="font-mono text-blue-300 text-2xl font-bold">
                {euro(fondoEmergenza)}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-mono mb-3">
              Liquido, sempre disponibile, non rende nulla. Serve a non andare in debito.
            </p>
            <input
              type="range"
              min={0}
              max={budgetFuturo}
              step={10}
              value={fondoEmergenza}
              onChange={(e) => setFondoEmergenza(Number(e.target.value))}
              className="w-full h-3 accent-blue-500 cursor-pointer mb-3"
            />

            {/* avanzamento verso i 3 mesi di spese */}
            <div className="bg-slate-900/60 rounded-lg p-3">
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400">
                  Obiettivo: {MESI_OBIETTIVO} mesi di spese
                </span>
                <span className="text-white">{euro(obiettivo)}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (fondoEmergenza / obiettivo) * 100)}%` }}
                />
              </div>
              <p className="text-slate-400 text-xs font-mono">
                {!Number.isFinite(mesiAllObiettivo) ? (
                  <span className="text-orange-300">Senza versamenti non lo raggiungi mai ⚠️</span>
                ) : (
                  <>
                    Lo completi in{' '}
                    <span className="text-white font-bold">{mesiAllObiettivo} mesi</span>
                    {mesiAllObiettivo <= 12 ? ' ✅' : mesiAllObiettivo <= 24 ? ' 🟡' : ' ⚠️'}
                  </>
                )}
                <span className="text-slate-600"> · spese stimate {euro(speseMensili)}/mese</span>
              </p>
            </div>
          </div>

          <div className="flex items-end gap-1 mb-4">
            <img
              src={
                !Number.isFinite(mesiAllObiettivo) || mesiAllObiettivo > 24
                  ? '/assets/sara_dubbiosa.png'
                  : '/assets/sara.png'
              }
              alt=""
              className="h-28 w-auto shrink-0 drop-shadow-xl"
            />
            <div className="flex-1 min-w-0 mb-5">
              <SpeechBubble speaker="Sara" text={tip} verso="left" />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg transition-colors"
          >
            Avanti: far crescere il resto →
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2 — Solo l'investimento ─────────────────────────────────────────
  const tipInv = investeSenzaRete
    ? 'Stai investendo senza rete. Se il frigo si rompe dovrai disinvestire di corsa, magari in perdita: è il modo più caro di usare i propri soldi.'
    : investimentoOk === 0
      ? 'Puoi anche non investire nulla: i soldi restano liquidi sul conto. Sicuri, ma l\'inflazione se li mangia piano piano.'
      : 'Il tempo fa più della cifra: sono gli anni a moltiplicare, non l\'importo mensile. Iniziare presto con poco batte iniziare tardi con tanto.'

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/75" />
      <div className="relative z-10 p-4 pb-8">
        <div className="text-center mb-3">
          <div className="text-4xl mb-1">📈</div>
          <h2 className="font-mono text-green-300 text-lg">Far crescere il resto</h2>
          <button
            onClick={() => setStep(1)}
            className="text-slate-400 hover:text-slate-200 text-xs font-mono mt-1 underline"
          >
            Passo 2 di 2 · 🛡️ rete {euro(fondoEmergenza)} — modifica
          </button>
        </div>

        <div className="bg-slate-800/85 rounded-xl p-4 mb-3 border-2 border-green-500/50">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-mono text-slate-300 text-sm">Quanto investi?</span>
            <span className="font-mono text-green-300 text-2xl font-bold">
              {euro(investimentoOk)}
            </span>
          </div>
          <p className="text-slate-500 text-[11px] font-mono mb-3">
            Cresce nel tempo, ma può scendere. Non contarci per le emergenze.
          </p>
          <input
            type="range"
            min={0}
            max={maxInvestimento}
            step={10}
            value={investimentoOk}
            onChange={(e) => setInvestimento(Number(e.target.value))}
            disabled={maxInvestimento === 0}
            className="w-full h-3 accent-green-500 cursor-pointer mb-1 disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0€</span>
            <span>massimo {euro(maxInvestimento)}</span>
          </div>

          <div className="flex justify-between text-[11px] font-mono mt-3 pt-3 border-t border-slate-700">
            <span className="text-slate-400">👛 resta liquido sul conto</span>
            <span className="text-slate-200">{euro(restaSulConto)}</span>
          </div>
        </div>

        {investimentoOk > 0 && (
          <div className="bg-slate-800/85 rounded-xl p-4 mb-3 border border-slate-600">
            <h3 className="font-mono text-slate-300 text-sm mb-2">Dove li metti?</h3>
            <div className="space-y-2">
              {INVESTIMENTI.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => setTipoInvestimento(inv.id)}
                  className={`w-full text-left p-2.5 rounded-lg border-2 transition-all hover:-translate-y-0.5 ${
                    tipoInvestimento === inv.id
                      ? 'bg-green-500/20 border-green-400'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-slate-100 text-xs">{inv.nome}</span>
                    <span className="font-mono text-green-400 text-xs">
                      +{Math.round(inv.rendimento * 100)}%/anno
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-snug">{inv.descrizione}</p>
                  <div className="flex gap-1 mt-1 items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-5 rounded-full ${
                          i < inv.rischio ? 'bg-orange-400' : 'bg-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-slate-500 text-[10px] ml-1">rischio</span>
                  </div>
                </button>
              ))}
            </div>

            {investScelto && (
              <div className="bg-green-900/40 border border-green-500/30 rounded-lg p-3 mt-3">
                <p className="text-green-300 font-mono text-xs leading-relaxed">
                  Versando {euro(investimentoOk)}/mese, tra {ANNI_PROIEZIONE} anni avresti{' '}
                  <span className="font-bold text-green-200 text-sm">{euro(proiezione10)}</span>
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
              onClick={() => setShowChart(!showChart)}
              className="w-full flex justify-between items-center font-mono text-green-300 text-xs mt-3"
            >
              <span>📊 Confronta le tre opzioni nel tempo</span>
              <span>{showChart ? '▲' : '▼'}</span>
            </button>
            {showChart && (
              <div className="mt-2">
                <CompoundInterestChart
                  versamentoMensile={investimentoOk}
                  evidenzia={tipoInvestimento}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-end gap-1 mb-4">
          <img
            src={investeSenzaRete ? '/assets/sara_dubbiosa.png' : '/assets/sara.png'}
            alt=""
            className="h-28 w-auto shrink-0 drop-shadow-xl"
          />
          <div className="flex-1 min-w-0 mb-5">
            <SpeechBubble speaker="Sara" text={tipInv} verso="left" />
          </div>
        </div>

        <button
          onClick={conferma}
          disabled={serveStrumento}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-mono text-sm py-3 rounded-lg transition-colors"
        >
          {serveStrumento ? 'Scegli dove investire ↑' : 'Conferma strategia →'}
        </button>
      </div>
    </div>
  )
}
