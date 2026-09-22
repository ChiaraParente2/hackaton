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
        <CharacterSprite character="sara" state="seria" position="right" />
        <div className="absolute bottom-4 left-4 right-4 bg-slate-800/95 border border-slate-600 rounded-xl p-4 z-20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-lg shadow shrink-0">
              😐
            </div>
            <div>
              <div className="font-mono text-yellow-400 text-sm mb-1">Sara</div>
              <p className="text-slate-100 text-sm leading-relaxed font-mono">
                Attenzione: <span className="text-blue-300">risparmiare</span> e{' '}
                <span className="text-green-300">investire</span> sono due cose diverse. Il fondo
                emergenza è una rete: deve stare fermo e disponibile subito. L'investimento serve a
                far crescere i soldi, ma può scendere proprio quando ti servono. Sono due
                salvadanai separati.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-2 rounded-lg"
          >
            Ho capito, dividiamoli →
          </button>
        </div>
      </div>
    )
  }

  // ── Nessun budget destinato al futuro ────────────────────────────────────
  if (budgetFuturo === 0) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="absolute inset-0 flex items-end pb-4 px-4 z-10">
          <div className="bg-slate-800/95 rounded-xl p-5 w-full border border-orange-500/40">
            <h3 className="font-mono text-orange-300 text-sm mb-2">
              🦗 Non hai destinato nulla al futuro
            </h3>
            <p className="text-slate-300 text-xs font-mono mb-4">
              Niente fondo emergenza, niente investimenti. Questo mese va tutto in spese: se
              succede qualcosa, non hai rete. Vediamo come va.
            </p>
            <button
              onClick={conferma}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg"
            >
              Continua →
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pctDi = (v) => (budgetFuturo > 0 ? (v / budgetFuturo) * 100 : 0)

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/75" />
      <div className="relative z-10 p-4 pb-8">
        <h2 className="font-mono text-yellow-400 text-lg mb-1 text-center">Due salvadanai diversi</h2>
        <p className="text-slate-400 text-xs text-center mb-3 font-mono">
          Hai <span className="text-green-400">{euro(budgetFuturo)}</span> destinati al futuro
        </p>

        {/* Come è diviso il budget futuro */}
        <div className="flex h-7 rounded-lg overflow-hidden border border-slate-600 mb-1">
          <div
            className="bg-blue-500/90 transition-all duration-200 flex items-center justify-center"
            style={{ width: `${pctDi(fondoEmergenza)}%` }}
          >
            {pctDi(fondoEmergenza) > 14 && <span className="text-[10px] font-mono text-white">🛡️</span>}
          </div>
          <div
            className="bg-green-500/90 transition-all duration-200 flex items-center justify-center"
            style={{ width: `${pctDi(investimentoOk)}%` }}
          >
            {pctDi(investimentoOk) > 14 && <span className="text-[10px] font-mono text-white">📈</span>}
          </div>
          <div
            className="bg-slate-600/80 transition-all duration-200 flex items-center justify-center"
            style={{ width: `${pctDi(restaSulConto)}%` }}
          >
            {pctDi(restaSulConto) > 14 && <span className="text-[10px] font-mono text-slate-300">👛</span>}
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-mono mb-4">
          <span className="text-blue-300">🛡️ {euro(fondoEmergenza)}</span>
          <span className="text-green-300">📈 {euro(investimentoOk)}</span>
          <span className="text-slate-400">👛 resta liquido {euro(restaSulConto)}</span>
        </div>

        {/* ── Salvadanaio 1: la rete di sicurezza ── */}
        <div className="bg-slate-800/85 rounded-xl p-4 mb-3 border-l-4 border-blue-500 border-y border-r border-slate-600">
          <div className="flex justify-between items-baseline mb-1">
            <h3 className="font-mono text-blue-300 text-sm">🛡️ Fondo emergenza</h3>
            <span className="font-mono text-blue-300 text-base font-bold">{euro(fondoEmergenza)}</span>
          </div>
          <p className="text-slate-500 text-[10px] font-mono mb-2">
            Liquido, sempre disponibile, non rende nulla. Serve a non andare in debito.
          </p>
          <input
            type="range"
            min={0}
            max={budgetFuturo}
            step={10}
            value={fondoEmergenza}
            onChange={(e) => setFondoEmergenza(Number(e.target.value))}
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
                  ? ' ✅ ottimo'
                  : mesiAllObiettivo <= 24
                    ? ' 🟡 discreto'
                    : ' ⚠️ lento'}
              </>
            )}
          </p>
        </div>

        {/* ── Salvadanaio 2: la crescita ── */}
        <div className="bg-slate-800/85 rounded-xl p-4 mb-3 border-l-4 border-green-500 border-y border-r border-slate-600">
          <div className="flex justify-between items-baseline mb-1">
            <h3 className="font-mono text-green-300 text-sm">📈 Investimento</h3>
            <span className="font-mono text-green-300 text-base font-bold">{euro(investimentoOk)}</span>
          </div>
          <p className="text-slate-500 text-[10px] font-mono mb-2">
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
            className="w-full h-2 accent-green-500 cursor-pointer mb-1 disabled:opacity-40"
          />
          <p className="text-slate-500 text-[10px] font-mono mb-3">
            massimo {euro(maxInvestimento)} — il resto è già nel fondo emergenza
          </p>

          {investeSenzaRete && (
            <div className="bg-orange-900/40 border border-orange-500/40 rounded-lg p-2 mb-3">
              <p className="text-orange-300 text-[11px] font-mono">
                ⚠️ Stai investendo senza fondo emergenza. Se il frigo si rompe dovrai disinvestire
                di corsa, magari in perdita.
              </p>
            </div>
          )}

          {investimentoOk > 0 && (
            <>
              <div className="space-y-2 mb-3">
                {INVESTIMENTI.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => setTipoInvestimento(inv.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
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
                <div className="bg-green-900/40 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-300 font-mono text-xs leading-relaxed">
                    Versando {euro(investimentoOk)}/mese, tra {ANNI_PROIEZIONE} anni avresti{' '}
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
            </>
          )}
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
