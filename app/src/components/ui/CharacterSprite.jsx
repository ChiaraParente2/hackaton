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

// Vincolo su ENTRAMBE le dimensioni, in percentuale della scena.
//
// Con il solo vincolo di altezza il personaggio diventava enorme sugli schermi
// stretti: gli sprite hanno rapporto ~0,34, quindi uno alto il 70% della scena
// è largo il 40% di un viewport verticale, e due si mangiavano tutta la
// larghezza. Con max-w il limite che scatta è quello più stretto dei due, così
// resta proporzionato ovunque e non viene mai tagliato.
const MISURE = {
  sm: 'max-h-[30%] max-w-[15%]',
  md: 'max-h-[40%] max-w-[20%]',
  lg: 'max-h-[50%] max-w-[25%]',
  xl: 'max-h-[58%] max-w-[28%]',
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
          className={`${MISURE[size] ?? MISURE.md} w-auto h-auto object-contain animate-bob relative`}
          style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.5))' }}
        />
      </div>
    </div>
  )
}
