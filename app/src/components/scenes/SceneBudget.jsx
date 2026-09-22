import { useState } from 'react'
import ScenaDialogo from '../ui/ScenaDialogo'
import SpeechBubble from '../ui/SpeechBubble'
import Termine from '../ui/Termine'
import BudgetPieChart from '../charts/BudgetPieChart'
import {
  ALLOGGI,
  ALTRE_SPESE_FISSE,
  STIPENDIO,
  alloggioDi,
  speseFisseDi,
  euro,
  pct,
} from '../../utils/finance'

// Obiettivo della regola 50/30/20, in euro.
const TARGET_RISPARMIO = Math.round(STIPENDIO * 0.2)

// Le tre strategie, ognuna col suo consiglio. Non sono scorciatoie estetiche:
// servono a far capire in un tap cosa comporta ciascun estremo.
const PRESETS = [
  {
    id: 'cicala',
    emoji: '🦗',
    nome: 'Cicala',
    valore: () => 0,
    stileAttivo: 'border-red-400 bg-red-500/20',
    testoAttivo: 'text-red-300',
    tip: 'Zero da parte: ogni euro se ne va subito. Funziona finché non succede niente — e prima o poi qualcosa succede sempre.',
  },
  {
    id: 'regola',
    emoji: '🎯',
    nome: 'Regola 20%',
    valore: (disponibile) => Math.min(TARGET_RISPARMIO, disponibile),
    stileAttivo: 'border-green-400 bg-green-500/20',
    testoAttivo: 'text-green-300',
    tip: 'Un quinto dello stipendio al futuro: abbastanza per costruire qualcosa, abbastanza poco da vivere lo stesso. È lo standard consigliato.',
  },
  {
    id: 'formica',
    emoji: '🐜',
    nome: 'Formica',
    valore: (disponibile) => disponibile,
    stileAttivo: 'border-blue-400 bg-blue-500/20',
    testoAttivo: 'text-blue-300',
    tip: 'Massimo risparmio. Costruisci in fretta, ma lasciarti zero per vivere rende il mese insostenibile: la maggior parte molla dopo poche settimane.',
  },
]

export default function SceneBudget({ gameState, dispatch }) {
  const [step, setStep] = useState(0)
  const [alloggio, setAlloggio] = useState(null)
  const [risparmio, setRisparmio] = useState(TARGET_RISPARMIO)

  const casa = alloggioDi(alloggio)
  const speseFisse = speseFisseDi(alloggio)
  const disponibile = STIPENDIO - speseFisse

  // Il risparmio è l'unica leva. Le spese personali sono ciò che resta, quindi
  // la somma fa sempre esattamente 1.400€: sforare è impossibile per costruzione.
  const risparmioOk = Math.min(Math.max(risparmio, 0), disponibile)
  const spesePersonali = disponibile - risparmioOk

  function scegliCasa(id) {
    setAlloggio(id)
    setRisparmio(Math.min(TARGET_RISPARMIO, STIPENDIO - speseFisseDi(id)))
    setStep(2)
  }

  function conferma() {
    dispatch({
      type: 'SET_BUDGET',
      payload: {
        alloggio,
        allocazioni: { speseFisse, spesePersonali, risparmio: risparmioOk },
      },
    })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'budget' })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'risparmio' })
    dispatch({ type: 'NEXT_SCENE' })
  }

  // ── Step 0 — Sara introduce la regola ────────────────────────────────────
  if (step === 0) {
    return (
      <ScenaDialogo
        sfondo="/assets/casa.png"
        destra={{ character: 'sara', state: 'sorridente' }}
        sinistra={{ character: 'protagonista', state: 'neutro' }}
        chiParla="destra"
        speaker="Sara"
        onNext={() => setStep(1)}
        testo="Prima regola: lo stipendio si divide PRIMA di spenderlo. Il metodo classico è 50/30/20 — metà alle spese necessarie, un terzo alla tua vita, un quinto al futuro. Ma prima devi decidere dove vivi: è la voce che pesa di più."
      />
    )
  }

  // ── Step 1 — Scelta della casa, come annunci immobiliari ─────────────────
  if (step === 1) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="relative z-10 p-3 pb-6">
          <div className="text-center mb-3">
            <h2 className="font-mono text-yellow-400 text-xl">🔑 Dove vai a vivere?</h2>
            <p className="text-slate-400 text-xs font-mono mt-1">
              Scelta definitiva · l'affitto diventa una spesa fissa per tutto il mese
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
            {ALLOGGI.map((a, i) => {
              const fisse = a.affitto + ALTRE_SPESE_FISSE
              const resta = STIPENDIO - fisse
              const quota = pct(fisse)
              const pesante = quota > 50
              return (
                <button
                  key={a.id}
                  onClick={() => scegliCasa(a.id)}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="animate-pop-in group relative overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-900/90 text-left shadow-xl transition-all duration-200 hover:border-yellow-400 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
                >
                  {/* copertina */}
                  <div
                    className={`relative h-24 flex items-center justify-center bg-gradient-to-br ${a.gradiente}`}
                  >
                    <span className="text-6xl drop-shadow-lg transition-transform duration-200 group-hover:scale-110">
                      {a.emoji}
                    </span>
                    <span className="absolute top-2 right-2 bg-slate-950/85 text-white font-mono text-sm font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {euro(a.affitto)}
                    </span>
                    <span className="absolute bottom-2 left-2 bg-slate-950/70 text-[10px] font-mono text-slate-200 px-2 py-0.5 rounded-full">
                      {a.tag}
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-slate-100">{a.nome}</span>
                      <span className="flex gap-0.5 items-center shrink-0">
                        {[1, 2, 3, 4].map((n) => (
                          <span
                            key={n}
                            className={`w-1.5 h-1.5 rounded-full ${
                              n <= a.privacy ? 'bg-purple-400' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-snug mt-1 h-8">
                      {a.descrizione}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full animate-grow-in ${pesante ? 'bg-red-500' : 'bg-orange-400'}`}
                          style={{ width: `${quota}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono text-[10px] shrink-0 ${pesante ? 'text-red-400' : 'text-slate-400'}`}
                      >
                        {quota}% fisse
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-baseline justify-between">
                      <span className="text-[10px] font-mono text-slate-500">ti restano</span>
                      <span className="font-mono text-lg font-bold text-green-400">
                        {euro(resta)}
                      </span>
                    </div>
                    {pesante && (
                      <p className="text-red-400 text-[10px] font-mono mt-1">
                        ⚠️ oltre metà stipendio solo di fisse
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-slate-500 text-[11px] font-mono text-center mt-3">
            Ogni prezzo include {euro(ALTRE_SPESE_FISSE)} di trasporti, telefono e assicurazione
          </p>
        </div>
      </div>
    )
  }

  // ── Step 2 — Allocazione: una sola leva, tre scorciatoie ─────────────────
  const pctRisparmio = pct(risparmioOk)
  const presetAttivo = PRESETS.find((p) => p.valore(disponibile) === risparmioOk)
  const consiglio = presetAttivo
    ? presetAttivo.tip
    : pctRisparmio < 10
      ? `Solo il ${pctRisparmio}% da parte: il fondo emergenza cresce pianissimo.`
      : pctRisparmio <= 35
        ? `${pctRisparmio}% da parte: sei nella fascia giusta.`
        : `${pctRisparmio}% è tantissimo. Occhio a lasciarti abbastanza per vivere.`

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
      <div className="absolute inset-0 bg-slate-950/80" />
      <div className="relative z-10 p-3 pb-6 max-w-2xl mx-auto">
        <div className="text-center mb-2">
          <h2 className="font-mono text-yellow-400 text-xl">Dividi i tuoi {euro(STIPENDIO)}</h2>
          <button
            onClick={() => setStep(1)}
            className="text-slate-400 hover:text-yellow-300 text-xs font-mono mt-0.5 underline"
          >
            {casa.emoji} {casa.nome} · {euro(casa.affitto)} — cambia
          </button>
        </div>

        {/* Unico grafico: torta + legenda con gli importi */}
        <div className="bg-slate-900/80 rounded-2xl p-3 mb-3 border border-slate-700">
          <BudgetPieChart
            speseFisse={speseFisse}
            spesePersonali={spesePersonali}
            risparmio={risparmioOk}
          />
          <div className="flex justify-center items-center gap-2 mt-2 pt-2 border-t border-slate-800 font-mono text-xs">
            <span className="text-slate-500">il tuo mix</span>
            <span className="text-red-400">{pct(speseFisse)}</span>
            <span className="text-slate-700">/</span>
            <span className="text-yellow-400">{pct(spesePersonali)}</span>
            <span className="text-slate-700">/</span>
            <span className="text-green-400">{pctRisparmio}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">
              <Termine id="regola503020">obiettivo 50/30/20</Termine>
            </span>
          </div>
        </div>

        {/* Tre scorciatoie: sono l'interazione principale */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PRESETS.map((p, i) => {
            const valore = p.valore(disponibile)
            const attivo = risparmioOk === valore
            return (
              <button
                key={p.id}
                onClick={() => setRisparmio(valore)}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`animate-pop-in rounded-2xl border-2 p-3 text-center transition-all duration-150 hover:-translate-y-1 active:translate-y-0 ${
                  attivo
                    ? `${p.stileAttivo} shadow-lg`
                    : 'border-slate-700 bg-slate-900/80 hover:border-slate-500'
                }`}
              >
                <div
                  className={`text-5xl mb-1 transition-transform duration-200 ${attivo ? 'scale-110' : ''}`}
                >
                  {p.emoji}
                </div>
                <div className="font-mono text-xs text-slate-100">{p.nome}</div>
                <div
                  className={`font-mono text-base font-bold mt-1 ${attivo ? p.testoAttivo : 'text-slate-500'}`}
                >
                  {euro(valore)}
                </div>
              </button>
            )
          })}
        </div>

        {/* Regolazione fine, secondaria */}
        <div className="bg-slate-900/80 rounded-2xl p-3 mb-3 border border-slate-700">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-mono text-slate-400 text-xs">o scegli tu quanto risparmiare</span>
            <span className="font-mono text-green-400 text-lg font-bold">{euro(risparmioOk)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={disponibile}
            step={10}
            value={risparmioOk}
            onChange={(e) => setRisparmio(Number(e.target.value))}
            className="w-full h-3 accent-green-500 cursor-pointer"
          />
        </div>

        {/* Consiglio di Sara */}
        <div className="flex items-end gap-1 mb-3">
          <img
            src={pctRisparmio < 10 ? '/assets/sara_dubbiosa.png' : '/assets/sara.png'}
            alt=""
            className="h-40 w-auto shrink-0 drop-shadow-2xl animate-bob"
          />
          <div className="flex-1 min-w-0 mb-6">
            <SpeechBubble speaker="Sara" text={consiglio} verso="left" />
          </div>
        </div>

        {/* Sempre abilitato: il totale non può che fare 1.400€ */}
        <button
          onClick={conferma}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-base py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg"
        >
          Conferma budget →
        </button>
      </div>
    </div>
  )
}
