# AGENTS.md — Primo Stipendio · Hackathon Build Guide

> Guida operativa per agenti AI che lavorano su questo progetto.
> In GAME_INFO.md leggi **solo la sezione della scena che stai toccando**, non il documento intero.

---

## PANORAMICA PROGETTO

**Nome:** Primo Stipendio
**Tipo:** Web game educativo single-page (React)
**Target:** 13-18 anni, primo contatto con gestione denaro
**Tema hackathon:** Inclusione Finanziaria
**Stile visivo:** 2D pixel art, palette anni 90, colori vivaci e saturi

L'app simula un mese di vita con il primo stipendio (1.400€). Il giocatore prende decisioni reali — budget, risparmio, spesa, bollette, imprevisti — e ne vede le conseguenze numeriche immediate. Zero backend, tutto client-side.

---

## STACK TECNICO

```
React 19 (latest)
Tailwind CSS v4 (latest)
Recharts — grafici BudgetPieChart, CompoundInterestChart, MortgageChart
Vite — build tool
```

**Nessun router esterno.** La navigazione tra scene è gestita tramite `currentScene` nello stato globale. Nessun `react-router-dom`.

**Nessun backend, nessun database.** Tutto vive in `useState`/`useReducer` in `GameEngine`.

---

## STRUTTURA DIRECTORY

```
app/
├── src/
│   ├── components/
│   │   ├── engine/
│   │   │   └── GameEngine.jsx          # root: gameState + navigazione scene
│   │   ├── ui/
│   │   │   ├── DialogBox.jsx           # typewriter effect, nome personaggio, avatar
│   │   │   ├── CharacterSprite.jsx     # spritesheet PNG via background-position
│   │   │   ├── ConceptBadge.jsx        # card concetto sbloccato
│   │   │   └── ProgressBar.jsx         # barra generica riutilizzabile
│   │   ├── charts/
│   │   │   ├── BudgetPieChart.jsx      # Recharts PieChart animato
│   │   │   ├── CompoundInterestChart.jsx # Recharts LineChart 3 linee
│   │   │   └── MortgageChart.jsx       # Recharts LineChart fisso vs variabile
│   │   └── scenes/
│   │       ├── SceneIntro.jsx          # Scena 0
│   │       ├── SceneBudget.jsx         # Scena 1 — slider + torta
│   │       ├── SceneSavings.jsx        # Scena 2 — fondo + investimento
│   │       ├── SceneSupermarket.jsx    # Scena 3 — percorso A/B
│   │       ├── SceneBills.jsx          # Scena 4 — questionario bollette
│   │       ├── SceneEmergency.jsx      # Scena 5 — frigo rotto, 3 scenari
│   │       ├── SceneSummary.jsx        # Scena 6 — estratto conto + badge
│   │       ├── SceneMortgage.jsx       # Scena 7 — mutuo (condizionale)
│   │       └── SceneEnd.jsx            # Schermata finale
│   ├── hooks/
│   │   └── useTypewriter.js            # hook per typewriter effect
│   ├── utils/
│   │   └── finance.js                  # calcoli finanziari (rata mutuo, ecc.)
│   └── assets/                         # → vedi sezione ASSET
├── public/
│   └── assets/                         # asset statici copiati da app/assets/
└── index.html
```

---

## STATO GLOBALE (`gameState`)

Gestito in `GameEngine` con `useReducer`. Forma iniziale:

```js
{
  currentScene: 0,
  stipendio: 1400,
  saldo: 1400,
  allocazioni: {
    speseFisse: 0,
    spesePersonali: 0,
    risparmio: 0,
  },
  fondoEmergenza: 0,
  fondoInvestimento: 0,
  tipoInvestimento: null,        // 'breve' | 'medio' | 'lungo'
  rendimentoMese: 0,
  spesaSupermercato: 0,
  bollette: { luce: 0, gas: 0, internet: 29 },
  imprevistoAffrontato: false,
  concettiSbloccati: [],
  scelte: {},
  punteggioRisparmio: 0,
}
```

Ogni scena riceve `gameState` e `dispatch` come props. Non usare context o store esterni — `useReducer` in `GameEngine` è sufficiente.

---

## NAVIGAZIONE TRA SCENE

```js
// In GameEngine, switch su currentScene per rendere il componente
const scenes = [
  SceneIntro,       // 0
  SceneBudget,      // 1
  SceneSavings,     // 2
  SceneSupermarket, // 3
  SceneBills,       // 4
  SceneEmergency,   // 5
  SceneSummary,     // 6
  SceneMortgage,    // 7 — solo se punteggioRisparmio >= 200
  SceneEnd,         // 8
]
```

La Scena 7 si attiva solo da Scena 6 tramite pulsante condizionale. Il pulsante "Riprova" in Scena 6/8 fa `dispatch({ type: 'RESET' })`.

---

## TYPEWRITER EFFECT

Hook `useTypewriter(text, speed = 30)` — ritorna stringa parziale che cresce nel tempo. Usato in `DialogBox`. Speed = ms per carattere. Non usare librerie esterne per questo.

---

## ANIMAZIONI CSS (no librerie)

- **Slide-in personaggio:** `translateX(-100%) → translateX(0)` in 400ms ease-out
- **Fade-in righe estratto conto:** `opacity 0 → 1`, delay incrementale 100ms per riga
- **Shake imprevisto (Scena 5):** keyframe `@keyframes shake` applicato a root scena, 0.3s
- **Fill torta:** le sezioni Recharts si animano via `isAnimationActive={true}` (default Recharts)
- **Draw linee grafici:** `isAnimationActive={true}`, `animationDuration={1500}`

---

## COMPONENTI RIUTILIZZABILI

### `CharacterSprite`
```jsx
<CharacterSprite
  character="protagonist"   // 'protagonist' | 'sara'
  state="neutro"            // 'neutro' | 'preoccupato' | 'sorridente' | 'seria' | 'sorpresa'
  animate={true}            // true = cicla i frame idle, false = frame statico
  position="right"          // 'left' | 'right' | 'center'
  flipped={false}           // true = mirror orizzontale (per slide-in da destra)
/>
```
**Spritesheet protagonist:** `assets/AnimationSheet.png` — griglia 6×5.
**Spritesheet Sara:** `assets/sara-sheet.png` (da aggiungere, stile coerente).
Usa `background-position` calcolato da `(col * frameWidth, row * frameHeight)`.
Anima con `setInterval` che incrementa `col` ciclicamente quando `animate={true}`.

### `DialogBox`
```jsx
<DialogBox
  speaker="Sara"            // stringa nome, o null per Narratore
  text="Testo del dialogo"  // testo completo, typewriter lo anima
  onComplete={() => {}}     // callback fine typewriter
/>
```

### `ConceptBadge`
```jsx
<ConceptBadge
  concept="Budget: la regola 50/30/20"
  unlocked={true}           // false = badge grigio con lucchetto
/>
```

### `ProgressBar`
```jsx
<ProgressBar
  value={120}
  max={180}
  label="Fondo emergenza"
  color="green"             // 'green' | 'yellow' | 'red'
/>
```

---

## CALCOLI FINANZIARI (utils/finance.js)

```js
export const tassiMensili = { breve: 0.002, medio: 0.005, lungo: 0.008 }

export function calcolaRendimento(fondoInvestimento, tipoInvestimento) {
  return Math.round(fondoInvestimento * tassiMensili[tipoInvestimento])
}

export function calcolaMesiPerAnticipo(risparmioMensile, anticipo = 50000) {
  return Math.ceil(anticipo / (risparmioMensile * 12))
}

// Formula rata mutuo (semplificata, uso educativo)
export function calcolaRata(prezzoFinal, anticipo, anni, tassoAnnuo = 0.035) {
  const tassoMensile = tassoAnnuo / 12
  const nRate = anni * 12
  const capitale = prezzoFinal - anticipo
  return capitale * (tassoMensile * Math.pow(1 + tassoMensile, nRate)) /
         (Math.pow(1 + tassoMensile, nRate) - 1)
}
```

---

## STILE — TAILWIND v4

**Palette colori di gioco:**

| Ruolo | Classe Tailwind suggerita |
|---|---|
| Spese necessarie (50%) | `bg-red-500` / `text-red-400` |
| Stile di vita (30%) | `bg-yellow-400` / `text-yellow-300` |
| Futuro/risparmio (20%) | `bg-green-500` / `text-green-400` |
| Sfondo scene | `bg-slate-900` |
| Card / dialog box | `bg-slate-800` border `border-slate-600` |
| Pulsanti primari | `bg-yellow-400 text-slate-900 hover:bg-yellow-300` |
| Testo principale | `text-slate-100` |
| Testo secondario | `text-slate-400` |

**Font:** usa `font-mono` per numeri finanziari (estratto conto, importi). Il titolo del gioco in `font-press-start-2p` (Google Fonts, opzionale — caricato via index.html).

**Layout scene:** ogni scena occupa il viewport intero (`min-h-screen`). Il personaggio è posizionato in `absolute` sul fondo della scena, il dialog box in basso o overlay centrale.

---

## ASSET — INVENTARIO COMPLETO

### ASSET DISPONIBILI (già in `app/assets/`)

Tutti i Kenney asset sono **CC0** — uso libero, commerciale, senza attribuzione obbligatoria.

| File | Percorso | Contenuto | Uso in gioco |
|---|---|---|---|
| `AnimationSheet.png` | `assets/AnimationSheet.png` | Spritesheet protagonista — griglia 6 colonne × 5 righe, sprite stile pixel art minimal (teardrop shape), diversi stati e frame animazione | Personaggio protagonista in tutte le scene |
| Kenney Roguelike Indoors | `assets/kenney_roguelike-indoors/` | Tilesheet 16×16 (mobili, pareti, pavimenti interni) | Sfondi interni appartamento, cucina |
| Kenney Roguelike Modern City | `assets/kenney_roguelike-modern-city/` | Tiles città moderna (strade, edifici, marciapiedi) | Sfondo esterno banca (Scena 7) |

I tilesheet indoor contengono: pavimenti in parquet/cemento, pareti, porte, finestre, mobili (divano, tavolo, frigorifero, letto, scaffali). Usali per comporre le scene di appartamento e cucina tramite CSS grid o canvas.

#### `AnimationSheet.png` — Struttura spritesheet protagonista

Il file contiene una griglia di sprite del protagonista. Prima di implementare `CharacterSprite`, misura le dimensioni esatte del PNG (larghezza ÷ 6 colonne = larghezza frame, altezza ÷ 5 righe = altezza frame).

Struttura visiva osservata (da confermare con dimensioni reali):

```
Riga 0  → animazione idle / neutro (6 frame)
Riga 1  → variante idle / movimento
Riga 2  → stato emotivo alternativo
Riga 3  → stato preoccupato / azione
Riga 4  → frame extra / transizione (riga parziale, ~2-3 frame usabili)
```

Implementazione in `CharacterSprite`:

```js
// Calcola frameWidth e frameHeight leggendo l'immagine al load
// oppure hardcoda dopo aver misurato il PNG
const PROTAGONIST_FRAMES = {
  neutro:       { row: 0, col: 0 },  // frame statico idle
  preoccupato:  { row: 3, col: 0 },  // da verificare sul PNG
  idle_anim:    { row: 0, frames: 6 }, // animazione ciclica 6 frame
}

// background-position per frame (col, row):
// x = -col * frameWidth, y = -row * frameHeight
```

**Nota:** la riga 4 sembra incompleta (ultimi slot vuoti). Non usare frame oltre il 2° della riga 4.

---

### ASSET MANCANTI — Lista e Fonti Gratuite (CC0 / CC-BY)

#### SFONDI — tutti generati con Copilot in `app/assets/bg/`

Un PNG per scena, 800×450, pixel art coerente con `AnimationSheet.png`.

| File | Scena | Contenuto |
|---|---|---|
| `bg-appartamento-vuoto.png` | 0 | Appartamento vuoto, luce calda serale |
| `bg-appartamento-tavolo.png` | 1 | Appartamento con tavolo e foglio di carta |
| `bg-appartamento-divano.png` | 2 | Appartamento, personaggio sul divano |
| `bg-supermercato.png` | 3 | Interno supermercato con scaffali |
| `bg-appartamento-telefono.png` | 4 | Appartamento, notifiche telefono in primo piano |
| `bg-cucina-frigo-rotto.png` | 5 | Cucina con frigo danneggiato (vapore via CSS) |
| `bg-appartamento-sera.png` | 6 | Appartamento di sera, luce soffusa |
| `bg-banca-esterno.png` | 7 | Esterno banca / palazzo urbano |
| `bg-casa-obiettivo.png` | 8 | Casa con lucchetto, versione bloccata e sbloccata |

#### PERSONAGGI

- **Protagonista:** `AnimationSheet.png`, già presente.
- **Sara:** stesso file con `filter: hue-rotate(140deg)`. Nessuno spritesheet nuovo, nessun download.

#### ICONE — priorità bassa, tagliabili

`icon-frigo-rotto.png` e le icone dei badge si ritagliano dai tilesheet rimasti via `background-position`. Se il tempo stringe, usa emoji: costano zero.

---

### STRATEGIA ASSET — DECISIONE PRESA (sprint 2h)

**Non comporre gli sfondi dai tile 16×16 e non scrivere un tilemap renderer.** Le 1036 tile singole sono state rimosse dal repo: quel percorso costerebbe più del tempo totale disponibile.

I due tilesheet rimasti (`roguelikeIndoor_transparent.png`, `tilemap_packed.png`) servono **solo** per ritagliare singole icone, mai per gli sfondi.

**Nessun pack nuovo da scaricare.** Ogni download è tempo tolto alle scene.

---

## NOTE IMPLEMENTATIVE

### Scena 3 — Supermercato
Il percorso A e B sono mutuamente esclusivi. Non mostrare entrambi. La scelta tra "vado a occhio" e "faccio lista" determina quale percorso renderizzare.

### Scena 5 — Imprevisto
Leggi `gameState.fondoEmergenza` e presenta **un solo** scenario tra A, B, C. Non mostrare le opzioni di scenari che non si applicano.

### Scena 7 — Mutuo (condizionale)
Renderizza solo se `punteggioRisparmio >= 200`. Se l'utente arriva qui da Scena 6, il punteggio è già calcolato. Non ricalcolare.

### Disclaimer in-game (obbligatorio per hackathon)
Ogni scena di investimento e la scena mutuo devono mostrare in piccolo:
> *"I rendimenti mostrati sono stime storiche medie, non garanzie future."*

### Performance
Le scene sono componenti pesanti. Usa lazy loading (`React.lazy` + `Suspense`) per le scene non ancora visitate.

---

## CONCETTI DA SBLOCCARE (trigger e scena)

| Concetto | Scena |
|---|---|
| `"Budget: la regola 50/30/20"` | Scena 1 (sempre) |
| `"Fondo emergenza: il tuo scudo"` | Scena 2 (sempre) |
| `"Interesse composto: i soldi che lavorano"` | Scena 2 (sempre) |
| `"Investimento: breve, medio, lungo termine"` | Scena 2 (sempre) |
| `"Spesa pianificata vs impulsiva"` | Scena 3 (sempre) |
| `"Spese fisse vs variabili: i consumi dipendono da te"` | Scena 4 (sempre) |
| `"Fondo emergenza: perché esiste"` | Scena 5 (sempre) |
| `"TAEG: il costo reale del credito"` | Scena 5 (solo Scenario C) |
| `"Mutuo: i prerequisiti per comprare casa"` | Scena 7 (condizionale) |

I popup concetti durano 3 secondi e sono dismissable con click. Non bloccare il gameplay — appare in overlay sopra la scena corrente.

---

## CHECKLIST PRIMA DI CONSEGNARE

- [ ] Nessuna chiamata API esterna
- [ ] Nessun dato utente salvato (no localStorage, no cookie)
- [ ] Disclaimer rendimenti visibile in Scena 2 e Scena 7
- [ ] Calcoli mutuo con nota "semplificazione educativa"
- [ ] Funziona offline (tutti gli asset locali)
- [ ] Testo leggibile su mobile (min `text-sm`, touch target `min-h-[44px]`)
- [ ] Pulsante "Riprova" in Scena 6 e Scena 8 resetta `gameState` completamente
- [ ] Scena 7 non accessibile se `punteggioRisparmio < 200`
