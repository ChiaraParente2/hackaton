import { useReducer } from 'react'
import SceneIntro from '../scenes/SceneIntro'
import SceneBudget from '../scenes/SceneBudget'
import SceneSavings from '../scenes/SceneSavings'
import SceneSupermarket from '../scenes/SceneSupermarket'
import SceneBills from '../scenes/SceneBills'
import SceneEmergency from '../scenes/SceneEmergency'
import SceneSummary from '../scenes/SceneSummary'
import SceneEnd from '../scenes/SceneEnd'

const initialState = {
  currentScene: 0,
  stipendio: 1400,
  saldo: 1400,
  allocazioni: { speseFisse: 0, spesePersonali: 0, risparmio: 0 },
  fondoEmergenza: 0,
  fondoInvestimento: 0,
  tipoInvestimento: null,
  rendimentoMese: 0,
  spesaSupermercato: 0,
  bollette: { luce: 0, gas: 0, internet: 29 },
  imprevistoAffrontato: false,
  concettiSbloccati: [],
  scelte: {},
  punteggioRisparmio: 0,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'NEXT_SCENE':
      return { ...state, currentScene: state.currentScene + 1 }
    case 'GO_TO_SCENE':
      return { ...state, currentScene: action.payload }
    case 'SET_ALLOCAZIONI':
      return { ...state, allocazioni: action.payload }
    case 'SET_SAVINGS':
      return { ...state, ...action.payload }
    case 'SET_SPESA':
      return { ...state, spesaSupermercato: action.payload, saldo: state.saldo - action.payload }
    case 'SET_BOLLETTE':
      return {
        ...state,
        bollette: action.payload,
        saldo: state.saldo - (action.payload.luce + action.payload.gas + action.payload.internet),
      }
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

      {/* Saldo indicatore */}
      <div className="flex justify-between items-center px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 shrink-0">
        <span className="text-slate-500 text-xs font-mono">💰 Saldo</span>
        <span className={`text-sm font-mono font-bold ${gameState.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {gameState.saldo}€
        </span>
      </div>

      {/* Scene area */}
      <div className="flex-1 relative overflow-hidden">
        <SceneComponent gameState={gameState} dispatch={dispatch} />
      </div>
    </div>
  )
}
