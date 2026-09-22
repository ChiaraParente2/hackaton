import { useState } from 'react'
import CharacterSprite from '../ui/CharacterSprite'
import ConceptBadge from '../ui/ConceptBadge'
import {
  CONCETTI,
  contoCorrente,
  salvadanaio,
  patrimonio,
  calcolaPunteggio,
  vociEstrattoConto,
  euro,
} from '../../utils/finance'

export default function SceneSummary({ gameState, dispatch }) {
  // Voci e totale escono dalla stessa funzione: il riepilogo quadra per
  // costruzione, non per coincidenza.
  const voci = vociEstrattoConto(gameState)
  const conto = contoCorrente(gameState)
  const daParte = salvadanaio(gameState)
  const totale = patrimonio(gameState)
  const punteggio = calcolaPunteggio(gameState)

  const saraState = punteggio >= 70 ? 'felice' : punteggio >= 40 ? 'sorridente' : 'seria'
  const saraMsg = punteggio >= 70
    ? 'Ottimo lavoro! Hai gestito il tuo primo stipendio in modo esemplare. Il tuo futuro te ringrazierà.'
    : punteggio >= 40
    ? 'Buon inizio! Qualche aggiustamento e sarai sulla strada giusta per la libertà finanziaria.'
    : 'Questo mese è stato difficile. La buona notizia: hai imparato lezioni preziose. Il prossimo sarà meglio.'

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto" style={{ filter: 'brightness(0.75)' }}>
      <div className="absolute inset-0 bg-slate-900/60" />
      <div className="relative z-10 p-4 pb-8">
        <CharacterSprite character="sara" state={saraState} position="right" />

        <h2 className="font-mono text-yellow-400 text-lg mb-4 text-center">📊 Fine mese</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Estratto conto */}
          <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-600">
            <h3 className="font-mono text-slate-300 text-xs mb-2">💳 Estratto conto</h3>
            <div className="space-y-1.5">
              {voci.map((r, i) => (
                <div
                  key={r.label}
                  className="flex justify-between animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-slate-400 text-xs font-mono">{r.label}</span>
                  <span className={`text-xs font-mono font-bold ${
                    r.tipo === 'entrata' ? 'text-green-400' : r.tipo === 'risparmio' ? 'text-blue-400' : 'text-red-400'
                  }`}>{r.valore > 0 ? '+' : ''}{euro(r.valore)}</span>
                </div>
              ))}
              <div className="border-t border-slate-600 pt-1 flex justify-between">
                <span className="text-slate-200 text-xs font-mono font-bold">Ti resta in tutto</span>
                <span className={`text-xs font-mono font-bold ${totale >= 0 ? 'text-green-300' : 'text-red-300'}`}>{euro(totale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-[10px] font-mono pl-2">👛 sul conto</span>
                <span className={`text-[10px] font-mono ${conto >= 0 ? 'text-slate-300' : 'text-red-400'}`}>{euro(conto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-[10px] font-mono pl-2">🏦 messi da parte</span>
                <span className="text-[10px] font-mono text-blue-300">{euro(daParte)}</span>
              </div>
            </div>
          </div>

          {/* Concetti */}
          <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-600">
            <h3 className="font-mono text-slate-300 text-xs mb-2">🎓 Concetti appresi</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {CONCETTI.map(c => (
                <ConceptBadge
                  key={c.id}
                  concetto={c}
                  unlocked={gameState.concettiSbloccati.includes(c.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/90 rounded-xl p-4 mb-4 border border-slate-600">
          <div className="flex gap-3 items-start mb-3">
            <span className="text-2xl">{saraState === 'seria' ? '😐' : saraState === 'felice' ? '😄' : '😊'}</span>
            <p className="text-slate-200 text-sm font-mono">{saraMsg}</p>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-400 text-xs font-mono">Punteggio mese:</span>
            <span className="text-yellow-400 font-mono text-xs font-bold">{punteggio}/100</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => dispatch({ type: 'NEXT_SCENE' })}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg"
          >
            Vedi il tuo futuro →
          </button>
        </div>
      </div>
    </div>
  )
}
