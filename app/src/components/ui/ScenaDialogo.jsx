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
  // La coda punta verso chi parla, quindi la nuvoletta sta dall'altro lato.
  const latoBolla = parlaDestra ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
  const verso = parlaDestra ? 'right' : 'left'

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

      {/* nuvoletta in alto dal lato opposto a chi parla: non copre mai la
          faccia e riempie lo spazio che altrimenti resterebbe vuoto */}
      <div className={`absolute top-4 ${latoBolla} z-30 w-[min(28rem,56%)]`}>
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
