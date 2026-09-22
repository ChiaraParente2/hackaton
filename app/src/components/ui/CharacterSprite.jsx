const SPRITE = {
  sara: {
    sereno: '/assets/sara.png',
    pensieroso: '/assets/sara_dubbiosa.png',
  },
  protagonista: {
    sereno: '/assets/protagonista.png',
    pensieroso: '/assets/protagonista_dubbioso.png',
  },
}

// Gli sprite disponibili sono due per personaggio: sereno e pensieroso.
// Qui mappiamo tutti gli stati usati nelle scene su una delle due varianti,
// così una scena può chiedere 'preoccupato' senza sapere cosa esiste davvero.
const PENSIEROSI = new Set([
  'seria',
  'serio',
  'preoccupato',
  'preoccupata',
  'dubbioso',
  'dubbiosa',
  'sorpresa',
  'triste',
])

// Percentuali dell'altezza della scena, non rem: così il personaggio riempie
// sempre la stessa porzione di schermo su qualsiasi viewport.
//
// Le proporzioni sono tarate sugli sfondi, che sono interni di stanze: una
// persona in piedi occupa circa due terzi dell'inquadratura. Sopra il 75%
// sembra un gigante incollato davanti alla parete.
const ALTEZZE = {
  sm: 'h-[34%]',
  md: 'h-[46%]',
  lg: 'h-[58%]',
  xl: 'h-[70%]',
}

export default function CharacterSprite({
  character = 'sara',
  state = 'neutro',
  position = 'right',
  size = 'md',
  flip = false,
  className = '',
}) {
  const set = SPRITE[character] ?? SPRITE.sara
  const src = PENSIEROSI.has(state) ? set.pensieroso : set.sereno
  const lato = position === 'left' ? 'left-0 sm:left-2' : 'right-0 sm:right-2'

  return (
    <div
      className={`absolute bottom-0 ${lato} pointer-events-none select-none z-10 ${className}`}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* ombra a terra: aggancia il personaggio allo sfondo invece di
          lasciarlo "appiccicato" sopra */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-[50%] bg-black/45 blur-md" />
      <div className="animate-slide-in">
        {/* il bob sta su un wrapper separato: slide-in e respiro usano
            entrambi transform e si annullerebbero a vicenda */}
        <img
          src={src}
          alt=""
          className={`${ALTEZZE[size] ?? ALTEZZE.md} w-auto object-contain animate-bob relative`}
          style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.5))' }}
        />
      </div>
    </div>
  )
}
