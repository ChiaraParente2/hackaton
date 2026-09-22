const FRAME_W = 24
const FRAME_H = 24

const SARA_EMOJI = {
  sorridente: '😊',
  seria: '😐',
  sorpresa: '😮',
  neutro: '😐',
  felice: '😄',
}

export default function CharacterSprite({ character, state = 'neutro', position = 'right', slideIn = false }) {
  const posClass = position === 'left' ? 'left-8' : 'right-8'

  if (character === 'sara') {
    return (
      <div
        className={`absolute bottom-36 ${posClass} flex flex-col items-center gap-1 transition-transform duration-500 ${slideIn ? 'translate-x-0' : ''}`}
      >
        <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-2xl shadow-lg border-2 border-amber-300">
          {SARA_EMOJI[state] ?? '😐'}
        </div>
        <span className="text-amber-300 text-xs font-mono">Sara</span>
      </div>
    )
  }

  // protagonist — static frame row 0, col 0
  const col = 0
  const row = 0
  const scale = 3
  return (
    <div
      className={`absolute bottom-36 ${posClass}`}
      style={{
        width: FRAME_W * scale,
        height: FRAME_H * scale,
        backgroundImage: `url('/assets/AnimationSheet.png')`,
        backgroundPosition: `-${col * FRAME_W * scale}px -${row * FRAME_H * scale}px`,
        backgroundSize: `${192 * scale}px ${144 * scale}px`,
        imageRendering: 'pixelated',
      }}
    />
  )
}
