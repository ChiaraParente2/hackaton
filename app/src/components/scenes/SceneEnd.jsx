import ConceptBadge from '../ui/ConceptBadge'
import { CONCETTI } from '../../utils/finance'

export default function SceneEnd({ gameState, dispatch }) {
  const punteggio = gameState.fondoEmergenza + gameState.fondoInvestimento + gameState.rendimentoMese
  const sbloccati = gameState.concettiSbloccati.length
  const totale = CONCETTI.length

  const livello = punteggio > 400 ? 'Esperto' : punteggio > 200 ? 'Apprendista' : 'Novizio'
  const livelloColor = punteggio > 400 ? 'text-yellow-400' : punteggio > 200 ? 'text-blue-400' : 'text-slate-400'

  return (
    <div className="relative w-full h-full bg-[url('/assets/casa.png')] bg-cover bg-center overflow-y-auto">
      <div className="absolute inset-0 bg-green-900/60" />
      <div className="relative z-10 p-4 pb-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="font-mono text-yellow-400 text-xl mb-1">Fine del mese!</h1>
          <p className="text-slate-300 text-sm font-mono">Hai completato il tuo primo stipendio</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800/90 rounded-xl p-3 text-center border border-slate-600">
            <div className={`font-mono text-2xl font-bold ${livelloColor}`}>{livello}</div>
            <div className="text-slate-400 text-xs font-mono mt-1">Livello</div>
          </div>
          <div className="bg-slate-800/90 rounded-xl p-3 text-center border border-slate-600">
            <div className="font-mono text-2xl font-bold text-green-400">{punteggio}</div>
            <div className="text-slate-400 text-xs font-mono mt-1">Punti</div>
          </div>
          <div className="bg-slate-800/90 rounded-xl p-3 text-center border border-slate-600">
            <div className="font-mono text-2xl font-bold text-blue-400">{sbloccati}/{totale}</div>
            <div className="text-slate-400 text-xs font-mono mt-1">Concetti</div>
          </div>
        </div>

        <div className="bg-slate-800/90 rounded-xl p-4 mb-6 border border-slate-600">
          <h3 className="font-mono text-slate-300 text-sm mb-3">🎓 Concetti appresi</h3>
          <div className="grid grid-cols-3 gap-2">
            {CONCETTI.map(c => (
              <ConceptBadge
                key={c.id}
                concetto={c}
                unlocked={gameState.concettiSbloccati.includes(c.id)}
              />
            ))}
          </div>
        </div>

        <div className="bg-slate-800/90 rounded-xl p-4 mb-6 border border-yellow-500/30">
          <h3 className="font-mono text-yellow-400 text-sm mb-2">💡 La lezione più importante</h3>
          <p className="text-slate-300 text-xs font-mono leading-relaxed">
            {punteggio > 400
              ? 'Pianificare, risparmiare e investire con costanza è la vera differenza tra chi costruisce ricchezza e chi la rincorre. Continua così!'
              : punteggio > 200
              ? 'Hai le basi. Ora affina: aumenta il fondo emergenza, scegli investimenti diversificati, e tieni la spesa sotto controllo.'
              : 'Non esiste errore da cui non si impara. Il primo passo è consapevolezza — e oggi ce l\'hai. Riprova e migliora!'}
          </p>
        </div>

        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-mono text-sm font-bold py-3 rounded-lg transition-colors"
        >
          🔄 Rigioca dall'inizio
        </button>
      </div>
    </div>
  )
}
