import { useState } from 'react'
import { GLOSSARIO } from '../../utils/finance'

/**
 * Termine finanziario spiegato al tocco.
 *
 *   <Termine id="taeg" />            -> mostra "TAEG ⓘ"
 *   <Termine id="taeg">il costo</Termine> -> mostra "il costo ⓘ"
 *
 * Un gioco di educazione finanziaria non può scrivere "TAEG" e andare avanti:
 * chi ha 16 anni non sa cosa sia, ed è esattamente il termine che serve
 * capire per non farsi fregare.
 */
export default function Termine({ id, children, sopra = true }) {
  const [aperto, setAperto] = useState(false)
  const t = GLOSSARIO[id]

  if (!t) return <>{children ?? id}</>

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setAperto((v) => !v)
        }}
        className={`inline-flex items-center gap-0.5 border-b border-dotted transition-colors ${
          aperto
            ? 'border-yellow-300 text-yellow-300'
            : 'border-current text-inherit hover:text-yellow-300 hover:border-yellow-300'
        }`}
      >
        {children ?? t.sigla}
        <span className="text-[9px] opacity-70 leading-none">ⓘ</span>
      </button>

      {aperto && (
        <>
          {/* click fuori per chiudere */}
          <span
            className="fixed inset-0 z-40 cursor-default"
            onClick={(e) => {
              e.stopPropagation()
              setAperto(false)
            }}
          />
          <span
            className={`absolute z-50 left-0 w-60 max-w-[78vw] ${
              sopra ? 'bottom-full mb-2' : 'top-full mt-2'
            } block bg-amber-50 border-2 border-slate-900 rounded-xl p-3 text-left animate-bubble-pop`}
            style={{ boxShadow: '0 5px 0 rgba(15,23,42,0.6), 0 10px 20px rgba(0,0,0,0.4)' }}
          >
            <span className="block font-mono text-[11px] font-bold text-slate-900">
              {t.sigla}
            </span>
            {t.nome && (
              <span className="block font-mono text-[10px] text-slate-500 mb-1">{t.nome}</span>
            )}
            <span className="block font-mono text-[11px] text-slate-700 leading-snug mt-1">
              {t.testo}
            </span>
          </span>
        </>
      )}
    </span>
  )
}
