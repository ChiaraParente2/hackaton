import { useState } from 'react'
import CharacterSprite from '../ui/CharacterSprite'
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
    stileAttivo: 'border-red-400 bg-red-500/15',
    testoAttivo: 'text-red-300',
    tip: 'Zero da parte: ogni euro se ne va subito. Funziona finché non succede niente — e prima o poi qualcosa succede sempre.',
  },
  {
    id: 'regola',
    emoji: '🎯',
    nome: 'Regola 20%',
    valore: (disponibile) => Math.min(TARGET_RISPARMIO, disponibile),
    stileAttivo: 'border-green-400 bg-green-500/15',
    testoAttivo: 'text-green-300',
    tip: 'Un quinto dello stipendio al futuro: abbastanza per costruire qualcosa, abbastanza poco da vivere lo stesso. È lo standard consigliato.',
  },
  {
    id: 'formica',
    emoji: '🐜',
    nome: 'Formica',
    valore: (disponibile) => disponibile,
    stileAttivo: 'border-blue-400 bg-blue-500/15',
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
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/35" />
        <CharacterSprite character="sara" state="sorridente" position="right" size="xl" />
        <div className="absolute bottom-6 left-4 right-4 sm:right-64 z-20">
          <SpeechBubble
            speaker="Sara"
            verso="right"
            text="Prima regola: lo stipendio si divide PRIMA di spenderlo. Il metodo classico è 50/30/20 — metà per le spese necessarie, un terzo per la tua vita, un quinto per il futuro. Ma prima devi decidere dove vivi: è la voce che pesa di più."
            onNext={() => setStep(1)}
          />
        </div>
      </div>
    )
  }

  // ── Step 1 — Scelta della casa ───────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative z-10 p-4 pb-8">
          <h2 className="font-mono text-yellow-400 text-lg mb-1 text-center">🔑 Dove vai a vivere?</h2>
          <p className="text-slate-400 text-xs text-center mb-4 font-mono">
            Scelta definitiva: diventa una spesa fissa per tutto il mese
          </p>

          <div className="space-y-2">
            {ALLOGGI.map((a) => {
              const fisse = a.affitto + ALTRE_SPESE_FISSE
              const resta = STIPENDIO - fisse
              const quota = pct(fisse)
              const pesante = quota > 50
              return (
                <button
                  key={a.id}
                  onClick={() => scegliCasa(a.id)}
                  className="group w-full text-left p-3 rounded-xl border-2 bg-slate-800/90 border-slate-700 shadow-lg hover:border-yellow-400 hover:bg-slate-700/90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-150"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl border-2 transition-transform group-hover:scale-110 ${
                        pesante
                          ? 'bg-red-500/10 border-red-500/40'
                          : 'bg-green-500/10 border-green-500/30'
                      }`}
                    >
                      {a.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-mono text-slate-100 text-sm">{a.nome}</span>
                        <span className="font-mono text-red-400 text-base font-bold shrink-0">
                          {euro(a.affitto)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                          {a.tag}
                        </span>
                        <span className="flex gap-0.5 items-center">
                          {[1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i <= a.privacy ? 'bg-purple-400' : 'bg-slate-600'
                              }`}
                            />
                          ))}
                          <span className="text-[9px] font-mono text-slate-500 ml-1">privacy</span>
                        </span>
                      </div>

                      <p className="text-slate-400 text-xs mt-1.5 leading-snug">{a.descrizione}</p>

                      {/* quanto dello stipendio se ne va in spese fisse */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pesante ? 'bg-red-500' : 'bg-orange-400'}`}
                            style={{ width: `${quota}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-[10px] shrink-0 ${pesante ? 'text-red-400' : 'text-slate-400'}`}
                        >
                          {quota}% fisse
                        </span>
                      </div>

                      <p className="text-xs font-mono mt-1.5 text-slate-500">
                        ti restano{' '}
                        <span className="text-green-400 font-bold text-sm">{euro(resta)}</span>
                        {pesante && <span className="text-red-400"> · oltre metà stipendio ⚠️</span>}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-slate-500 text-xs font-mono text-center mt-3">
            Affitto + {euro(ALTRE_SPESE_FISSE)} di trasporti, telefono e assicurazione
          </p>
        </div>
      </div>
    )
  }

  // ── Step 2 — Ripartizione (una sola leva) ────────────────────────────────
  const pctFisse = pct(speseFisse)
  const pctPersonali = pct(spesePersonali)
  const pctRisparmio = pct(risparmioOk)

  const verdetto =
    pctRisparmio === 0
      ? { emoji: '😟', testo: 'Zero da parte. Al primo imprevisto vai in rosso.', colore: 'text-red-300' }
      : pctRisparmio < 10
        ? { emoji: '😐', testo: `Solo il ${pctRisparmio}%: meglio di niente, ma il fondo emergenza cresce pianissimo.`, colore: 'text-orange-300' }
        : pctRisparmio < 20
          ? { emoji: '🙂', testo: `${pctRisparmio}% da parte: sei sulla strada giusta, l'obiettivo è 20%.`, colore: 'text-yellow-300' }
          : pctRisparmio <= 35
            ? { emoji: '😄', testo: `${pctRisparmio}% da parte: centrato l'obiettivo della regola 50/30/20!`, colore: 'text-green-300' }
            : { emoji: '😮', testo: `${pctRisparmio}% è tantissimo. Occhio a lasciarti abbastanza per vivere.`, colore: 'text-blue-300' }

  // Se lo slider è fermo su una delle tre strategie Sara dà il consiglio
  // dedicato, altrimenti commenta la posizione libera.
  const presetAttivo = PRESETS.find((p) => p.valore(disponibile) === risparmioOk)
  const consiglio = presetAttivo ? presetAttivo.tip : verdetto.testo

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/70" />
      <div className="relative z-10 p-4 pb-8">
        <h2 className="font-mono text-yellow-400 text-lg mb-1 text-center">Dividi i tuoi {euro(STIPENDIO)}</h2>
        <button
          onClick={() => setStep(1)}
          className="block mx-auto text-slate-400 hover:text-slate-200 text-xs font-mono mb-3 underline"
        >
          {casa.emoji} {casa.nome} · {euro(casa.affitto)} — cambia casa
        </button>

        {/* Barra 100% dello stipendio: i tre blocchi si muovono insieme */}
        <div className="mb-1 flex h-9 rounded-lg overflow-hidden border border-slate-600">
          <div
            className="bg-red-500/90 flex items-center justify-center transition-all duration-200"
            style={{ width: `${pctFisse}%` }}
          >
            <span className="font-mono text-xs text-white font-bold">{pctFisse}%</span>
          </div>
          <div
            className="bg-yellow-400/90 flex items-center justify-center transition-all duration-200"
            style={{ width: `${pctPersonali}%` }}
          >
            {pctPersonali >= 8 && (
              <span className="font-mono text-xs text-slate-900 font-bold">{pctPersonali}%</span>
            )}
          </div>
          <div
            className="bg-green-500/90 flex items-center justify-center transition-all duration-200"
            style={{ width: `${pctRisparmio}%` }}
          >
            {pctRisparmio >= 8 && (
              <span className="font-mono text-xs text-white font-bold">{pctRisparmio}%</span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-red-400">🏠 Fisse {euro(speseFisse)}</span>
          <span className="text-yellow-400">🍕 Vita {euro(spesePersonali)}</span>
          <span className="text-green-400">🌱 Futuro {euro(risparmioOk)}</span>
        </div>
        <p className="text-slate-500 text-[10px] font-mono text-center mt-1 mb-4">
          spesa e bollette escono dalla <span className="text-yellow-500">vita quotidiana</span>
        </p>

        {/* L'unica leva */}
        <div className="bg-slate-800/85 rounded-xl p-4 mb-3 border border-slate-600">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-slate-200 text-sm font-mono">💚 Quanto metti da parte?</span>
            <span className="font-mono text-green-400 text-base font-bold">{euro(risparmioOk)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={disponibile}
            step={10}
            value={risparmioOk}
            onChange={(e) => setRisparmio(Number(e.target.value))}
            className="w-full h-2 accent-green-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs font-mono text-slate-500 mt-1">
            <span>0€</span>
            <span>tutto il disponibile · {euro(disponibile)}</span>
          </div>

        </div>

        {/* Le tre strategie, in grande: un tap per capire cosa comporta ognuna */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PRESETS.map((p, i) => {
            const valore = p.valore(disponibile)
            const attivo = risparmioOk === valore
            return (
              <button
                key={p.id}
                onClick={() => setRisparmio(valore)}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`animate-pop-in rounded-xl border-2 p-3 text-center transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 ${
                  attivo ? p.stileAttivo : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
                }`}
              >
                <div className={`text-4xl mb-1 transition-transform ${attivo ? 'scale-110' : ''}`}>
                  {p.emoji}
                </div>
                <div className="font-mono text-xs text-slate-100">{p.nome}</div>
                <div
                  className={`font-mono text-sm font-bold mt-1 ${attivo ? p.testoAttivo : 'text-slate-500'}`}
                >
                  {euro(valore)}
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                  {pct(valore)}% stipendio
                </div>
              </button>
            )
          })}
        </div>

        {/* Confronto con l'obiettivo */}
        <div className="bg-slate-800/60 rounded-lg p-2.5 mb-3 flex justify-between items-center">
          <span className="text-slate-400 text-xs font-mono">Il tuo mix</span>
          <span className="font-mono text-sm">
            <span className="text-red-400">{pctFisse}</span>
            <span className="text-slate-600"> / </span>
            <span className="text-yellow-400">{pctPersonali}</span>
            <span className="text-slate-600"> / </span>
            <span className="text-green-400">{pctRisparmio}</span>
          </span>
          <span className="text-slate-500 text-xs font-mono">
            <Termine id="regola503020">obiettivo 50 / 30 / 20</Termine>
          </span>
        </div>

        <div className="mb-3">
          <BudgetPieChart
            speseFisse={speseFisse}
            spesePersonali={spesePersonali}
            risparmio={risparmioOk}
          />
        </div>

        {/* Il consiglio di Sara: cambia con la strategia scelta */}
        <div className="flex items-end gap-1 mb-4">
          <img
            src={pctRisparmio < 10 ? '/assets/sara_dubbiosa.png' : '/assets/sara.png'}
            alt=""
            className="h-40 w-auto shrink-0 drop-shadow-xl animate-bob"
          />
          <div className="flex-1 min-w-0 mb-5">
            <SpeechBubble speaker="Sara" text={consiglio} verso="left" />
          </div>
        </div>

        {/* Sempre abilitato: il totale non può che fare 1.400€ */}
        <button
          onClick={conferma}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg transition-colors"
        >
          Conferma budget →
        </button>
      </div>
    </div>
  )
}

