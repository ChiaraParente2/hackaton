import { useState, useEffect } from 'react'
import CharacterSprite from '../ui/CharacterSprite'
import Termine from '../ui/Termine'

export default function SceneEmergency({ gameState, dispatch }) {
  const [shaking, setShaking] = useState(false)
  const [repaired, setRepaired] = useState(false)
  const [showTaeg, setShowTaeg] = useState(false)
  const [started, setStarted] = useState(false)

  const fondo = gameState.fondoEmergenza

  useEffect(() => {
    if (started) {
      setShaking(true)
      const t = setTimeout(() => setShaking(false), 400)
      return () => clearTimeout(t)
    }
  }, [started])

  const bgSrc = repaired ? '/assets/cucina_riparata.png' : '/assets/cucina_rotta.png'

  /**
   * Paga l'imprevisto attingendo PRIMA al fondo emergenza: è esattamente il
   * motivo per cui il fondo esiste. Solo l'eccedenza tocca il conto corrente.
   * Prima l'intero importo veniva addebitato al conto e il fondo restava
   * intatto, quindi i totali non tornavano mai.
   */
  function paga(costo, soloConto = false) {
    const daFondo = soloConto ? 0 : Math.min(fondo, costo)
    dispatch({
      type: 'SET_EMERGENZA',
      payload: {
        imprevistoAffrontato: true,
        imprevistoDaFondo: daFondo,
        imprevistoDaConto: costo - daFondo,
      },
    })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'imprevisti' })
  }

  function usaFondo() {
    setRepaired(true)
    paga(180)
  }

  function nextScene() {
    dispatch({ type: 'NEXT_SCENE' })
  }

  if (!started) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/cucina_rotta.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/30" />
        <div className="absolute inset-0 flex items-end pb-4 px-4 z-10">
          <div className="bg-slate-800/95 rounded-xl p-5 w-full border border-red-500/40">
            <h2 className="font-mono text-red-400 text-base mb-2">⚠️ Imprevisto!</h2>
            <p className="text-slate-200 text-sm font-mono mb-4">Mentre stai cucinando senti uno schianto. Il frigo ha smesso di funzionare. L'idraulico dice che il compressore è andato.</p>
            <p className="text-slate-400 text-xs font-mono mb-4">Riparazione: <span className="text-red-400 font-bold">180€</span></p>
            <button onClick={() => setStarted(true)} className="w-full bg-red-700 hover:bg-red-600 text-white font-mono text-sm py-3 rounded-lg">
              Cosa faccio?
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Scenario A: fondo emergenza sufficiente
  if (fondo >= 180) {
    return (
      <div
        className={`relative w-full h-full bg-cover bg-center ${shaking ? 'animate-shake' : ''}`}
        style={{ backgroundImage: `url('${bgSrc}')` }}
      >
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute inset-0 flex items-end pb-4 px-4 z-10">
          <div className="bg-slate-800/95 rounded-xl p-5 w-full border border-green-500/40">
            {!repaired ? (
              <>
                <div className="bg-green-900/40 border border-green-500/30 rounded-lg p-3 mb-4">
                  <h3 className="font-mono text-green-300 text-sm mb-1">✅ Fondo emergenza: {fondo}€</h3>
                  <p className="text-slate-300 text-xs font-mono">Hai esattamente quello che serve. Il fondo emergenza esiste per questo momento.</p>
                </div>
                <button onClick={usaFondo} className="w-full bg-green-600 hover:bg-green-500 text-white font-mono text-sm py-3 rounded-lg">
                  Usa il fondo emergenza (180€)
                </button>
              </>
            ) : (
              <>
                <div className="bg-green-900/40 border border-green-500/30 rounded-lg p-3 mb-4">
                  <h3 className="font-mono text-green-300 text-sm mb-1">✅ Frigo riparato!</h3>
                  <p className="text-slate-300 text-xs font-mono">Nessun panico, nessun debito. Ora sai perché il fondo emergenza è sacro.</p>
                </div>
                <button onClick={nextScene} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg">
                  Continua →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Scenario B: fondo parziale (50-179)
  if (fondo >= 50) {
    const mancante = 180 - fondo
    return (
      <div className={`relative w-full h-full bg-[url('/assets/cucina_rotta.png')] bg-cover bg-center ${shaking ? 'animate-shake' : ''}`}>
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute inset-0 flex items-end pb-4 px-4 z-10">
          <div className="bg-slate-800/95 rounded-xl p-5 w-full border border-yellow-500/40">
            <div className="bg-yellow-900/40 border border-yellow-500/30 rounded-lg p-3 mb-3">
              <h3 className="font-mono text-yellow-300 text-sm mb-1">🟡 Fondo parziale: {fondo}€</h3>
              <p className="text-slate-300 text-xs font-mono">Ti mancano {mancante}€. Usi il fondo e attingi ai risparmi personali per il resto.</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 mb-4 font-mono text-xs text-slate-300">
              <div className="flex justify-between mb-1"><span>Fondo emergenza</span><span className="text-yellow-400">-{fondo}€</span></div>
              <div className="flex justify-between"><span>Da risparmi personali</span><span className="text-red-400">-{mancante}€</span></div>
            </div>
            {!gameState.imprevistoAffrontato ? (
              <button onClick={() => paga(180)} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-mono text-sm py-3 rounded-lg">
                Usa fondo + risparmi
              </button>
            ) : (
              <button onClick={nextScene} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg">
                Continua →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Scenario C: fondo quasi vuoto (<50)
  return (
    <div className={`relative w-full h-full bg-[url('/assets/cucina_rotta.png')] bg-cover bg-center ${shaking ? 'animate-shake' : ''}`}>
      <div className="absolute inset-0 bg-slate-900/40" />
      <div className="absolute inset-0 flex items-end pb-4 px-4 z-10 overflow-y-auto">
        <div className="bg-slate-800/95 rounded-xl p-5 w-full border border-red-500/40 mb-4">
          <div className="bg-red-900/40 border border-red-500/30 rounded-lg p-3 mb-4">
            <h3 className="font-mono text-red-300 text-sm mb-1">❌ Fondo emergenza: {fondo}€</h3>
            <p className="text-slate-300 text-xs font-mono">Non basta. Devi scegliere come coprire 180€.</p>
          </div>

          {showTaeg ? (
            <div className="bg-orange-900/40 border border-orange-500/30 rounded-lg p-3 mb-4">
              <h4 className="font-mono text-orange-300 text-xs mb-2">📊 Prestito personale rapido</h4>
              <div className="font-mono text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Importo richiesto</span>
                  <span>180€</span>
                </div>
                <div className="flex justify-between">
                  <span>Durata</span>
                  <span>1 mese</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>
                    <Termine id="tan" /> 60% → interessi
                  </span>
                  <span>9€</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Commissione di istruttoria</span>
                  <span>3€</span>
                </div>
                <div className="flex justify-between text-red-400 font-bold border-t border-orange-500/30 pt-1 mt-1">
                  <span>Rimborso totale</span>
                  <span>192€</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo extra</span>
                  <span className="text-red-300">12€ per niente</span>
                </div>
                <div className="flex justify-between bg-orange-950/60 -mx-1 px-1 py-1 rounded mt-1">
                  <span className="text-orange-200 font-bold">
                    <Termine id="taeg" /> reale
                  </span>
                  <span className="text-orange-300 font-bold">~117%</span>
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-mono mt-2 leading-snug">
                In pubblicità vedresti «<Termine id="tan">TAN 60%</Termine>». Ma con la
                commissione dentro, il costo vero è il doppio: è per questo che si confronta
                il <Termine id="taeg">TAEG</Termine>, non il TAN.
              </p>
              {!gameState.imprevistoAffrontato ? (
                <button onClick={() => paga(192, true)} className="w-full mt-3 bg-orange-700 hover:bg-orange-600 text-white font-mono text-xs py-2 rounded-lg">
                  Usa prestito rapido (192€)
                </button>
              ) : (
                <button onClick={nextScene} className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-2 rounded-lg">
                  Continua →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <button onClick={() => setShowTaeg(true)} className="w-full text-left p-3 rounded-lg bg-orange-800/50 border border-orange-600 hover:border-orange-400 text-white font-mono text-xs">
                💳 Prestito rapido online
              </button>
              {!gameState.imprevistoAffrontato ? (
                <button onClick={() => paga(60)} className="w-full text-left p-3 rounded-lg bg-slate-700 border border-slate-600 hover:border-slate-400 text-slate-200 font-mono text-xs">
                  🔧 Riparazione temporanea "fai da te" (60€)
                </button>
              ) : (
                <button onClick={nextScene} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg">
                  Continua →
                </button>
              )}
            </div>
          )}
          {gameState.imprevistoAffrontato && !showTaeg && (
            <button onClick={nextScene} className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-2 rounded-lg">
              Continua →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
