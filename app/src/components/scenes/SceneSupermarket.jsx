import { useState } from 'react'
import SpeechBubble from '../ui/SpeechBubble'

const shelfItems = [
  {
    label: 'Tonno 3×2 in offerta',
    tooltip: 'Offerta 3x2! Tanto prima o poi lo uso...',
    price: 12,
    img: '/assets/tonno.png',
  },
  {
    label: 'Biscotti premium',
    tooltip: 'Me lo merito, dopo una settimana così.',
    price: 8,
    img: '/assets/biscotti.png',
  },
  {
    label: 'Succo bio fancy',
    tooltip: 'Costa solo 4€, praticamente niente.',
    price: 4,
    img: '/assets/succo.png',
  },
  {
    label: 'Snack assortiti',
    tooltip: 'Ne prendo due così ho scorta.',
    price: 15,
    emoji: '🍿',
  },
]

const listaB = [
  { label: 'Pasta (1kg)', price: 2 },
  { label: 'Pomodori pelati (3x)', price: 3 },
  { label: 'Pollo (1kg)', price: 6 },
  { label: 'Verdure miste', price: 5 },
  { label: 'Yogurt (6 pack)', price: 4 },
  { label: 'Pane integrale', price: 2 },
  { label: 'Latte (1L x3)', price: 4 },
  { label: 'Uova (12)', price: 4 },
  { label: 'Frutta stagionale', price: 5 },
  { label: 'Legumi (3 scatole)', price: 3 },
  { label: 'Olio oliva (750ml)', price: 6 },
  { label: 'Farina 00 (1kg)', price: 2 },
  { label: 'Prosciutto cotto (200g)', price: 4 },
  { label: 'Formaggi misti (200g)', price: 5 },
  { label: 'Caffè (250g)', price: 4 },
  { label: 'Detersivo piatti', price: 3 },
  { label: 'Carta igienica (12)', price: 4 },
  { label: 'Sapone mani', price: 2 },
  { label: 'Tonno (2 scatole)', price: 3 },
  { label: 'Sale, pepe, spezie', price: 4 },
  { label: 'Succo arancia (1L)', price: 2 },
  { label: 'Crackers', price: 3 },
]

const extrasBOptions = [
  { label: 'Cioccolato fondente (sfizio)', price: 4 },
  { label: 'Vino da tavola', price: 7 },
  { label: 'Gelato (500ml)', price: 4 },
  { label: 'Patatine (2 buste)', price: 5 },
]

export default function SceneSupermarket({ gameState, dispatch }) {
  const [path, setPath] = useState(null)
  const [stepA, setStepA] = useState(0)
  const [extrasA, setExtrasA] = useState([])
  const [extrasB, setExtrasB] = useState([])
  const [showCompare, setShowCompare] = useState(false)

  const baseB = listaB.reduce((s, i) => s + i.price, 0)
  const totalA = 190 + extrasA.reduce((s, i) => s + i.price, 0)
  const totalB = baseB + extrasB.reduce((s, i) => s + i.price, 0)

  function addItemA(item) {
    setExtrasA(prev => [...prev, item])
    if (stepA < shelfItems.length - 1) setStepA(stepA + 1)
    else setShowCompare(true)
  }

  function skipItemA() {
    if (stepA < shelfItems.length - 1) setStepA(stepA + 1)
    else setShowCompare(true)
  }

  function toggleExtraB(item) {
    setExtrasB(prev =>
      prev.find(e => e.label === item.label)
        ? prev.filter(e => e.label !== item.label)
        : prev.length < 2 ? [...prev, item] : prev
    )
  }

  function conferma(total) {
    dispatch({ type: 'SET_SPESA', payload: total })
    dispatch({ type: 'UNLOCK_CONCEPT', payload: 'spesa_consapevole' })
    dispatch({ type: 'NEXT_SCENE' })
  }

  if (!path) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/supermercato.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/45" />
        <div className="absolute inset-x-0 bottom-0 p-3 z-20">
          <div className="flex items-end gap-1 mb-2">
            <img
              src="/assets/protagonista_dubbioso.png"
              alt=""
              className="h-44 w-auto shrink-0 drop-shadow-xl animate-bob"
            />
            <div className="flex-1 min-w-0 mb-5">
              <SpeechBubble
                speaker="Tu"
                verso="left"
                text="Eccomi al supermercato. Faccio un giro e vedo cosa mi serve, o seguo la lista che ho preparato a casa?"
              />
            </div>
          </div>
          <div className="bg-slate-800/95 rounded-xl p-4 border border-slate-600">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPath('A')}
                className="bg-orange-600/80 hover:bg-orange-500 border-2 border-orange-500 text-white font-mono text-sm py-4 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-1">🚶</div>
                Giro libero
                <div className="text-[10px] text-orange-200 mt-0.5">vado a sensazione</div>
              </button>
              <button
                onClick={() => setPath('B')}
                className="bg-green-700/80 hover:bg-green-600 border-2 border-green-500 text-white font-mono text-sm py-4 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-1">📋</div>
                Segui la lista
                <div className="text-[10px] text-green-200 mt-0.5">preparata a casa</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (path === 'A' && !showCompare) {
    const item = shelfItems[stepA]
    return (
      <div className="relative w-full h-full bg-[url('/assets/supermercato.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/45" />

        <div className="absolute top-3 right-3 bg-slate-900/85 border border-slate-600 rounded-lg px-3 py-1.5 z-20">
          <span className="font-mono text-[10px] text-slate-400 block leading-none">carrello</span>
          <span
            className={`font-mono text-base font-bold ${totalA > 180 ? 'text-red-400' : 'text-green-400'}`}
          >
            {totalA}€
          </span>
        </div>
        <div className="absolute top-3 left-3 bg-slate-900/85 border border-slate-600 rounded-lg px-3 py-1.5 z-20">
          <span className="font-mono text-[10px] text-slate-400 block leading-none">scaffale</span>
          <span className="font-mono text-base font-bold text-slate-200">
            {stepA + 1}/{shelfItems.length}
          </span>
        </div>

        {/* Il prodotto in evidenza */}
        <div className="absolute left-1/2 -translate-x-1/2 top-16 z-10 flex flex-col items-center">
          {item.img ? (
            <img
              key={item.label}
              src={item.img}
              alt=""
              className="h-32 sm:h-40 w-auto object-contain drop-shadow-2xl animate-pop-in"
            />
          ) : (
            <div key={item.label} className="text-7xl animate-pop-in">
              {item.emoji}
            </div>
          )}
          <div className="mt-2 bg-orange-500 text-white font-mono text-sm font-bold px-3 py-1 rounded-full border-2 border-slate-900 shadow-lg">
            {item.price}€
          </div>
        </div>

        {/* Il protagonista che si autoconvince */}
        <div className="absolute inset-x-0 bottom-0 p-3 z-20">
          <div className="flex items-end gap-1 mb-2">
            <img
              src="/assets/protagonista_dubbioso.png"
              alt=""
              className="h-40 w-auto shrink-0 drop-shadow-xl animate-bob"
            />
            <div className="flex-1 min-w-0 mb-5">
              <SpeechBubble key={item.label} speaker="Tu" verso="left" text={item.tooltip} />
            </div>
          </div>

          <div className="bg-slate-800/95 rounded-xl p-4 border border-slate-600">
            <h3 className="font-mono text-white text-sm mb-3 text-center">{item.label}</h3>
            <div className="flex gap-3">
              <button
                onClick={() => addItemA(item)}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-mono text-sm py-3 rounded-lg transition-all hover:-translate-y-0.5"
              >
                🛒 Nel carrello
              </button>
              <button
                onClick={skipItemA}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-200 font-mono text-sm py-3 rounded-lg transition-all hover:-translate-y-0.5"
              >
                🙅 Lascia stare
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (path === 'B' && !showCompare) {
    return (
      <div className="relative w-full h-full bg-[url('/assets/supermercato.png')] bg-cover bg-center overflow-y-auto">
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="relative z-10 p-4 pb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-mono text-yellow-400 text-base">📋 Lista della spesa</h2>
            <span className={`font-mono text-sm font-bold ${totalB > 180 ? 'text-red-400' : 'text-green-400'}`}>{totalB}€</span>
          </div>
          <div className="bg-slate-800/90 rounded-xl p-3 mb-4 max-h-48 overflow-y-auto">
            {listaB.map((item, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-slate-700 last:border-0">
                <span className="text-slate-300 text-xs font-mono">✓ {item.label}</span>
                <span className="text-slate-400 text-xs font-mono">{item.price}€</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 mt-1">
              <span className="text-slate-200 text-xs font-mono font-bold">Subtotale</span>
              <span className="text-green-400 text-xs font-mono font-bold">{baseB}€</span>
            </div>
          </div>
          <div className="bg-slate-800/90 rounded-xl p-3 mb-4">
            <p className="text-slate-300 text-xs font-mono mb-2">Aggiungi max 2 sfizietti (hai ancora budget):</p>
            <div className="space-y-2">
              {extrasBOptions.map((item, i) => {
                const sel = extrasB.find(e => e.label === item.label)
                return (
                  <button
                    key={i}
                    onClick={() => toggleExtraB(item)}
                    disabled={!sel && extrasB.length >= 2}
                    className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                      sel ? 'bg-green-700/50 border-green-500 text-green-200' : 'bg-slate-700 border-slate-600 text-slate-300 disabled:opacity-40'
                    }`}
                  >
                    {sel ? '✓ ' : '+ '}{item.label} ({item.price}€)
                  </button>
                )
              })}
            </div>
          </div>
          <button onClick={() => setShowCompare(true)} className="w-full bg-green-600 hover:bg-green-500 text-white font-mono text-sm py-3 rounded-lg">
            Vai alla cassa ({totalB}€) →
          </button>
        </div>
      </div>
    )
  }

  // Compare finale
  const diff = totalA - totalB
  return (
    <div className="relative w-full h-full bg-[url('/assets/supermercato.png')] bg-cover bg-center overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60" />
      <div className="relative z-10 p-4 pb-8">
        <h2 className="font-mono text-yellow-400 text-lg mb-4 text-center">🧾 Alla cassa</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`bg-slate-800/90 rounded-xl p-3 border ${path === 'A' ? 'border-orange-400' : 'border-slate-600'}`}>
            <div className="font-mono text-xs text-slate-400 mb-1">🚶 Giro libero</div>
            <div className="font-mono text-2xl font-bold text-orange-400">{totalA}€</div>
            <div className="text-slate-400 text-xs mt-1 font-mono">190€ base + extra</div>
          </div>
          <div className={`bg-slate-800/90 rounded-xl p-3 border ${path === 'B' ? 'border-green-400' : 'border-slate-600'}`}>
            <div className="font-mono text-xs text-slate-400 mb-1">📋 Con lista</div>
            <div className="font-mono text-2xl font-bold text-green-400">{totalB}€</div>
            <div className="text-slate-400 text-xs mt-1 font-mono">pianificato</div>
          </div>
        </div>
        {diff > 0 && (
          <div className="bg-orange-900/40 border border-orange-500/40 rounded-lg p-3 mb-4">
            <p className="text-orange-300 font-mono text-xs text-center">
              Senza lista avresti speso <span className="font-bold text-orange-200">{diff}€ in più</span> questo mese — {diff * 12}€ in un anno!
            </p>
          </div>
        )}
        <button
          onClick={() => conferma(path === 'A' ? totalA : totalB)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm py-3 rounded-lg"
        >
          Continua →
        </button>
      </div>
    </div>
  )
}
