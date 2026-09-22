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

const ALTEZZE = {
  sm: 'h-28',
  md: 'h-44',
  lg: 'h-60',
  xl: 'h-72',
}

export default function CharacterSprite({
  character = 'sara',
  state = 'neutro',
  position = 'right',
  size = 'md',
  flip = false,
}) {
  const set = SPRITE[character] ?? SPRITE.sara
  const src = PENSIEROSI.has(state) ? set.pensieroso : set.sereno
  const lato = position === 'left' ? 'left-1 sm:left-4' : 'right-1 sm:right-4'

  return (
    <div className={`absolute bottom-0 ${lato} pointer-events-none select-none z-10`}>
      {/* ombra a terra: aggancia il personaggio allo sfondo invece di
          lasciarlo "appiccicato" sopra */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-[50%] bg-black/45 blur-md" />
      <img
        src={src}
        alt=""
        className={`${ALTEZZE[size] ?? ALTEZZE.md} w-auto object-contain animate-slide-in relative`}
        style={{
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
          transform: flip ? 'scaleX(-1)' : undefined,
        }}
      />
    </div>
  )
}
