import { useReducer } from 'react'
import SceneIntro from '../scenes/SceneIntro'
import SceneBudget from '../scenes/SceneBudget'
import SceneSavings from '../scenes/SceneSavings'
import SceneSupermarket from '../scenes/SceneSupermarket'
import SceneBills from '../scenes/SceneBills'
import SceneEmergency from '../scenes/SceneEmergency'
import SceneSummary from '../scenes/SceneSummary'
import SceneEnd from '../scenes/SceneEnd'
import MoneyHUD from '../ui/MoneyHUD'
import { STIPENDIO, contoCorrente, salvadanaio, patrimonio } from '../../utils/finance'

// Conto, salvadanaio, patrimonio e punteggio NON stanno qui: sono tutti
// derivati da finance.js. Tenerli nello stato li faceva divergere dalle voci
// effettivamente mostrate nel riepilogo.
const initialState = {
  currentScene: 0,
  stipendio: STIPENDIO,
  alloggio: null, // scelto nella scena 1: determina le spese fisse
  allocazioni: { speseFisse: 0, spesePersonali: 0, risparmio: 0 },
  fondoEmergenza: 0,
  fondoInvestimento: 0,
  tipoInvestimento: null,
  spesaSupermercato: 0,
  // Tutte a zero. Con `internet: 29` la bolletta risultava già addebitata
  // all'avvio e il giocatore si trovava 1.371€ invece di 1.400€ prima ancora
  // di fare qualcosa: le bollette le sceglie lui nella scena 4.
  bollette: { luce: 0, gas: 0, internet: 0 },
  // L'imprevisto va tenuto separato: prima si attinge al fondo emergenza,
  // solo l'eccedenza tocca il conto corrente.
  imprevistoDaFondo: 0,
  imprevistoDaConto: 0,
  imprevistoAffrontato: false,
  concettiSbloccati: [],
  scelte: {},
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'NEXT_SCENE':
      return { ...state, currentScene: state.currentScene + 1 }
    case 'GO_TO_SCENE':
      return { ...state, currentScene: action.payload }
    case 'SET_BUDGET':
      return { ...state, alloggio: action.payload.alloggio, allocazioni: action.payload.allocazioni }
    case 'SET_SAVINGS':
      return { ...state, ...action.payload }
    case 'SET_SPESA':
      return { ...state, spesaSupermercato: action.payload }
    case 'SET_BOLLETTE':
      return { ...state, bollette: action.payload }
    case 'SET_EMERGENZA':
      return { ...state, ...action.payload }
    case 'UNLOCK_CONCEPT':
      return state.concettiSbloccati.includes(action.payload)
        ? state
        : { ...state, concettiSbloccati: [...state.concettiSbloccati, action.payload] }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

const SCENES = [
  SceneIntro,       // 0
  SceneBudget,      // 1
  SceneSavings,     // 2
  SceneSupermarket, // 3
  SceneBills,       // 4
  SceneEmergency,   // 5
  SceneSummary,     // 6
  SceneEnd,         // 7
]

const SCENE_LABELS = ['Intro', 'Budget', 'Risparmi', 'Supermercato', 'Bollette', 'Emergenza', 'Riepilogo', 'Fine']

export default function GameEngine() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState)
  const { currentScene } = gameState

  const SceneComponent = SCENES[Math.min(currentScene, SCENES.length - 1)]

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      {/* Progress bar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-900 border-b border-slate-800 shrink-0">
        {SCENE_LABELS.map((label, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < currentScene ? 'bg-blue-500' : i === currentScene ? 'bg-yellow-400' : 'bg-slate-700'
            }`}
            title={label}
          />
        ))}
        <span className="text-slate-400 text-xs ml-2 font-mono shrink-0">{SCENE_LABELS[currentScene]}</span>
      </div>

      <MoneyHUD
        patrimonio={patrimonio(gameState)}
        conto={contoCorrente(gameState)}
        salvadanaio={salvadanaio(gameState)}
      />

      {/* Scene area */}
      <div className="flex-1 relative overflow-hidden">
        <SceneComponent gameState={gameState} dispatch={dispatch} />
      </div>
    </div>
  )
}
