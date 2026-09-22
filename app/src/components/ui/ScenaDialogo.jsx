import CharacterSprite from './CharacterSprite'
import SpeechBubble from './SpeechBubble'

/**
 * Schermata di dialogo in stile visual novel.
 *
 * I personaggi occupano quasi tutta l'altezza e sono ancorati in basso; la
 * nuvoletta sta IN ALTO, dalla parte opposta a chi parla, così non finisce mai
 * sopra la faccia e non lascia il centro della scena vuoto.
 */
export default function ScenaDialogo({
  sfondo = '/assets/casa.png',
  sinistra = null,
  destra = null,
  chiParla,
  speaker,
  testo,
  onNext,
  ctaLabel,
  azioni = null,
  children = null,
}) {
  const parlaDestra = chiParla ? chiParla === 'destra' : Boolean(destra)
  const verso = parlaDestra ? 'right' : 'left'
  const dueInScena = Boolean(sinistra) && Boolean(destra)

  // La nuvoletta vive nella banda che resta libera fra i personaggi. Le soglie
  // corrispondono ai max-w di CharacterSprite (28% chi parla, 20% chi
  // ascolta): così non si sovrappone mai a uno sprite, su nessun viewport.
  const bandaParlante = 'calc(28% + 0.5rem)'
  const bandaAscolto = dueInScena ? 'calc(20% + 0.5rem)' : '0.75rem'
  const posizioneBolla = parlaDestra
    ? { right: bandaParlante, left: bandaAscolto }
    : { left: bandaParlante, right: bandaAscolto }

  // Chi parla è grande e in primo piano, chi ascolta è più piccolo e
  // arretrato: con due personaggi entrambi a piena altezza si toccherebbero,
  // e su schermi stretti finirebbero tagliati.
  const inPrimoPiano = { size: 'xl', className: 'z-20' }
  const inSecondoPiano = { size: 'md', className: 'z-10 opacity-60 saturate-50' }

  return (
    <div
      className="relative w-full h-full bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url('${sfondo}')` }}
    >
      {/* vignetta: scurisce i bordi e stacca i personaggi dallo sfondo */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/55" />

      {sinistra && (
        <CharacterSprite
          {...sinistra}
          position="left"
          {...(parlaDestra ? inSecondoPiano : inPrimoPiano)}
        />
      )}
      {destra && (
        <CharacterSprite
          {...destra}
          position="right"
          {...(parlaDestra ? inPrimoPiano : inSecondoPiano)}
        />
      )}

      {/* nuvoletta in alto, nella banda libera fra i personaggi */}
      <div className="absolute top-4 z-30" style={posizioneBolla}>
        <SpeechBubble
          speaker={speaker}
          verso={verso}
          text={testo}
          onNext={onNext}
          ctaLabel={ctaLabel}
        />
      </div>

      {children}

      {azioni && (
        <div className="absolute bottom-5 left-3 right-3 z-30 flex gap-3 max-w-2xl mx-auto">
          {azioni.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className={`flex-1 font-mono text-sm py-3 rounded-xl border-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg ${
                a.variante === 'primario'
                  ? 'bg-green-600 hover:bg-green-500 border-green-400 text-white'
                  : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-200'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
