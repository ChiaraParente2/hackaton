# PRIMO STIPENDIO — Game Design Document
> Hackathon Tema 02: Inclusione Finanziaria · Target: 13-18 anni · Piattaforma: Web (React)

---

## OVERVIEW TECNICA

- **Framework:** React (single page application)
- **Stile:** 2D pixel art, palette anni 90, colori vivaci e saturi
- **Asset personaggi:** spritesheet PNG con animazioni frame-by-frame via CSS `background-position`
- **Stato globale:** gestito con `useState` / `useReducer` in React, nessun backend
- **Struttura:** un singolo mese simulato diviso in 7 scene sequenziali
- **Requisiti hackathon soddisfatti:**
  - Scenario educativo preciso: gestione del budget personale del primo mese
  - Miglioramento tangibile misurabile: punteggio finale con concetti sbloccati
  - Nessun consiglio finanziario personalizzato — solo educazione
  - Capability software concreta: simulatore interattivo con logica applicativa reale
  - Deliverable: User Difficulty Statement, Before/After Simplicity Evidence, Risk & Clarity Note

---

## STATO GLOBALE DEL GIOCO (`gameState`)

```js
{
  stipendio: 1400,
  saldo: 1400,
  allocazioni: {
    speseFisse: 0,      // affitto + bollette stimate
    spesePersonali: 0,  // cibo + svago
    risparmio: 0,       // fondo emergenza + investimento
  },
  fondoEmergenza: 0,
  fondoInvestimento: 0,
  tipoInvestimento: null,       // 'breve' | 'medio' | 'lungo'
  rendimentoMese: 0,
  spesaSupermercato: 0,
  bollette: { luce: 0, gas: 0, internet: 29 },
  imprevistoAffrontato: false,  // frigo rotto
  concettiSbloccati: [],        // array di stringhe
  scelte: {},                   // log di ogni scelta per il riepilogo finale
  punteggioRisparmio: 0,        // usato per sbloccare la scena mutuo
}
```

---

## STRUTTURA SCENE

```
SCENA 0 — Intro narrativa
SCENA 1 — Divisione del budget (regola 50/30/20)
SCENA 2 — Fondo emergenza + investimento
SCENA 3 — Al supermercato
SCENA 4 — Le bollette
SCENA 5 — L'imprevisto: il frigo si rompe
SCENA 6 — Riepilogo del mese
SCENA 7 — Il mutuo (condizionale: solo se risparmio >= 200€)
```

Navigazione: sempre lineare, nessun backtrack. Il pulsante "Continua" avanza alla scena successiva. Ogni scena aggiorna `gameState`.

---

## SCENA 0 — INTRO NARRATIVA

**Componente:** `SceneIntro`
**Sfondo:** appartamento vuoto, luce calda serale (asset: `bg-appartamento-vuoto.png`)
**Personaggio a schermo:** Protagonista, stato `neutro`, centrato a destra

### Sequenza dialoghi

Il testo appare carattere per carattere (typewriter effect, 30ms/char).

1. **Narratore** (testo centrato, nessun personaggio):
   > "Milano. Settembre. Hai appena firmato il contratto per il tuo primo appartamento."

2. **Narratore:**
   > "Sul conto corrente: 1.400€. Il tuo primo stipendio netto."

3. **Narratore:**
   > "Per la prima volta nella vita, nessuno ti dice come spenderli."

4. Entra **Sara** da sinistra (slide-in animation), stato `sorridente`:
   > "Ciao! Sono Sara. Abito al piano di sopra da tre anni. Ho fatto tutti gli errori possibili — posso risparmiarti qualche disastro?"

5. **Scelta binaria** (due pulsanti):
   - `"Sì, grazie"` → stato Sara diventa `seria`, lei risponde: *"Bene. Prima regola: prima di spendere un euro, decidi dove vanno."* → avanza a Scena 1
   - `"Ce la faccio da solo"` → Sara stato `sorpresa`, risponde: *"Okay. Torno quando hai bisogno."* — pausa 1.5s — poi lei rientra: *"...sai cosa, resto lo stesso."* → avanza a Scena 1

**Nessun effetto su `gameState` in questa scena.**

---

## SCENA 1 — DIVISIONE DEL BUDGET

**Componente:** `SceneBudget`
**Sfondo:** appartamento, tavolo con foglio (asset: `bg-appartamento-tavolo.png`)
**Personaggio:** Sara, stato `seria`, lato sinistro

### Step 1 — Sara spiega la regola

Sara parla (dialogo con typewriter):
> "Hai 1.400€. Devi dividerli in tre categorie prima di toccarli."

Appare a schermo una **infografica animata** (componente React separato `BudgetPieChart`):
- Torta divisa in 3 sezioni colorate con label:
  - 🔴 **50% — Spese necessarie** (affitto, bollette, trasporti)
  - 🟡 **30% — Stile di vita** (cibo, svago, abbigliamento)
  - 🟢 **20% — Futuro** (risparmio, investimento)
- Le sezioni si animano in sequenza (fill da 0% al valore finale, 600ms each)

Sara:
> "Questa si chiama regola 50/30/20. Non è legge — è un punto di partenza."

### Step 2 — Il giocatore alloca il budget

**UI:** tre slider o input numerici, uno per categoria. Il totale deve fare 1.400€. Mentre il giocatore muove gli slider, la torta si aggiorna in tempo reale.

| Campo | Valore suggerito | Range valido |
|---|---|---|
| Spese necessarie | 700€ (50%) | 500€ – 900€ |
| Stile di vita | 420€ (30%) | 200€ – 600€ |
| Futuro | 280€ (20%) | 100€ – 500€ |

**Validazione:**
- Se totale ≠ 1.400€ → mostra errore inline rosso: *"Il totale deve essere esattamente 1.400€"*
- Non è possibile procedere finché il totale non è corretto

**Feedback di Sara in base alle scelte:**

- Se "Futuro" < 10% (< 140€):
  > "Tecnicamente puoi. Ma tra sei mesi piangerai. Metti almeno il 10%."
  - Sara stato: `seria`

- Se "Futuro" > 40% (> 560€):
  > "Risparmiare è bene. Vivere è meglio. Lasciati qualcosa per lo stile di vita."
  - Sara stato: `sorpresa`

- Se la divisione è nella norma (10%-35% al futuro):
  > "Ottimo. Ora sai dove va ogni euro prima ancora di spenderlo."
  - Sara stato: `sorridente`

**Pulsante "Conferma allocazione"** → salva in `gameState.allocazioni`, avanza a Scena 2.

**Concetto sbloccato:** `"Budget: la regola 50/30/20"`
- Popup breve (3 sec, dismissable): card con titolo, spiegazione in 2 righe, icona

---

## SCENA 2 — FONDO EMERGENZA + INVESTIMENTO

**Componente:** `SceneSavings`
**Sfondo:** appartamento, Sara mostra il telefono (asset: `bg-appartamento-divano.png`)
**Personaggio:** Sara, stato `seria`

Questa scena divide i soldi allocati alla categoria "Futuro" (es. 280€) in due parti.

### Step 1 — Il fondo emergenza

Sara:
> "Quei 280€ che hai messo 'al futuro' non sono tutti uguali. Servono per cose diverse."
> "Prima cosa: il fondo emergenza. Questi soldi non li tocchi. Mai. Tranne se succede qualcosa di brutto."

**UI:** slider per scegliere quanti euro mettere nel fondo emergenza (min: 50€, max: tutto l'importo futuro).

Sotto lo slider, testo dinamico:
> "Obiettivo finale: 3 stipendi interi = 4.200€. Oggi stai mettendo [X]€. Ci vorranno circa [N] mesi a questo ritmo."

(N calcolato in JS: `Math.ceil(4200 / X)`)

**Feedback:**
- Se < 100€: Sara `seria` → *"Meglio di niente, ma l'obiettivo è avere un cuscinetto vero."*
- Se >= 150€: Sara `sorridente` → *"Bene. Questo è il tuo scudo."*

### Step 2 — Il fondo investimento

Sara:
> "Il resto lo fai lavorare. Lo investi."

**Popup animato — Interesse composto** (componente `CompoundInterestPopup`):
- Grafico lineare (Recharts `LineChart`) che mostra la crescita di 100€/mese nel tempo
- Tre linee colorate: 3% (conto deposito), 7% (ETF), 10% (azionario)
- Asse X: anni (0-20), Asse Y: euro totali
- Animazione: le linee si disegnano da sinistra a destra in 1.5s

Sara:
> "Se investi 100€ al mese al 7% annuo, dopo 10 anni hai quasi 17.000€. Non perché sei bravo — perché i soldi generano altri soldi. Si chiama interesse composto."

### Step 3 — Scelta del tipo di investimento

**UI:** tre card selezionabili

| Card | Label | Dettaglio | Rischio | Rendimento atteso |
|---|---|---|---|---|
| A | Breve termine | Conto deposito, BOT | Basso | ~2-3% annuo |
| B | Medio termine | ETF, fondi bilanciati | Medio | ~5-7% annuo |
| C | Lungo termine | Azionario globale | Alto | ~8-10% annuo |

Ogni card mostra una barra visiva rischio/rendimento.

Quando il giocatore seleziona una card, Sara commenta:
- Breve: *"Sicuro. Guadagni poco, ma i soldi ci sono sempre."*
- Medio: *"Buona scelta per iniziare. Bilanciato."*
- Lungo: *"Coraggioso. Sul lungo periodo storicamente paga — ma ci vuole nervi saldi."*

**Nessuna risposta è sbagliata.** Il rendimento viene calcolato a fine mese nella Scena 6.

Calcolo rendimento mensile:
```js
const tassiMensili = { breve: 0.002, medio: 0.005, lungo: 0.008 }
rendimentoMese = Math.round(fondoInvestimento * tassiMensili[tipoInvestimento])
```

**Pulsante "Conferma"** → salva `fondoEmergenza`, `fondoInvestimento`, `tipoInvestimento`, `rendimentoMese` in `gameState`. Avanza a Scena 3.

**Concetti sbloccati:**
- `"Fondo emergenza: il tuo scudo"`
- `"Interesse composto: i soldi che lavorano"`
- `"Investimento: breve, medio, lungo termine"`

---

## SCENA 3 — AL SUPERMERCATO

**Componente:** `SceneSupermarket`
**Sfondo:** interno supermercato (asset: `bg-supermercato.png`)
**Personaggio:** Protagonista, lato sinistro. Sara assente in questa scena.

Budget disponibile per la spesa: preso da `gameState.allocazioni.spesePersonali` (es. 420€ totali per il mese, di cui ~180€ stimati per la spesa).

Sara (voce fuori campo, testo in alto):
> "Hai circa 180€ per la spesa del mese. Come vai?"

### Step 1 — Scelta del metodo

**Due pulsanti grandi:**
- `"Vado a occhio"` → percorso A
- `"Faccio una lista prima"` → percorso B

---

### PERCORSO A — Spesa improvvisata

**UI:** animazione in 4 step. Ogni step mostra un "oggetto tentatore" che appare sullo scaffale con un tooltip.

**Step A1:**
Scaffale con tonno in offerta 3x2. Tooltip: *"Offerta 3x2! Tanto lo uso..."*
- Pulsante: `"Lo prendo"` (+12€) / `"Lascio perdere"` (+0€)

**Step A2:**
Scaffale con biscotti premium. Tooltip: *"Me lo merito dopo una settimana dura."*
- Pulsante: `"Lo prendo"` (+8€) / `"Lascio perdere"` (+0€)

**Step A3:**
Scaffale con succo di frutta bio fancy. Tooltip: *"Costa solo 4€, quasi niente."*
- Pulsante: `"Lo prendo"` (+4€) / `"Lascio perdere"` (+0€)

**Step A4:**
Scaffale con snack assortiti. Tooltip: *"Ne prendo due così ho scorta."*
- Pulsante: `"Lo prendo"` (+15€) / `"Lascio perdere"` (+0€)

**Risultato percorso A:**
- Spesa base necessaria: 190€ (calcolata automaticamente, non modificabile — rappresenta il minimo senza lista)
- Extra acquistati: somma delle scelte
- **Totale a cassa: 190€ + extra (tipicamente 210€-239€)**

Schermata cassa: totale in grande, rosso se > 180€.
Sara riappare, stato `seria`:
> "Visto? Non hai comprato cose inutili. Hai comprato cose che non avevi pianificato. Senza lista, il cervello non ragiona in budget — ragiona in voglie."

---

### PERCORSO B — Spesa pianificata

**UI:** schermata lista della spesa. Mostra una lista precompilata di 8 necessità:

```
✓ Pasta (500g x4)         — 4€
✓ Riso                    — 2€
✓ Verdure miste           — 15€
✓ Proteine (pollo/legumi) — 20€
✓ Colazione               — 12€
✓ Detersivi               — 10€
✓ Igiene personale        — 15€
✓ Condimenti base         — 8€
─────────────────────────
  Subtotale necessario:     86€
```

Poi: *"Puoi aggiungere fino a 2 extra dalla lista qui sotto"* (dropdown con 6 opzioni da 4€-15€ ciascuna).

**Totale a cassa: 86€ + max 2 extra (tipicamente 100€-116€)**

Schermata cassa: totale in verde se < 180€.
Sara, stato `sorridente`:
> "Esatto. La lista non ti impedisce di vivere. Ti dà un limite dentro cui scegliere."

---

### Confronto finale (mostrato in entrambi i casi)

Card comparativa:

| | Senza lista | Con lista |
|---|---|---|
| Spesa totale | ~220€ | ~110€ |
| Risparmio | — | ~110€ in più |
| Stress alla cassa | Alto | Basso |

Sara:
> "La differenza non è disciplina. È avere un piano prima di entrare."

**Salva in `gameState.spesaSupermercato`** il totale effettivo. Aggiorna `saldo`.

**Concetto sbloccato:** `"Spesa pianificata vs impulsiva"`

**Pulsante "Torna a casa"** → Scena 4.

---

## SCENA 4 — LE BOLLETTE

**Componente:** `SceneBills`
**Sfondo:** appartamento, notifiche sul telefono (asset: `bg-appartamento-telefono.png`)
**Personaggio:** Protagonista, stato `preoccupato`. Sara entra dopo le domande.

Sara (voce fuori campo):
> "Benvenuto nel club degli adulti. Arrivano le bollette."

### Step 1 — Questionario comportamenti

**Tre domande a scelta multipla**, una alla volta. Rispondono a schermate separate con transizione slide.

**Domanda 1:**
> "Quando esci di casa, le luci rimangono accese?"
- `"Sì, spesso"` → +20€ alla bolletta luce
- `"No, spengo tutto"` → +0€

**Domanda 2:**
> "Quanto durano le tue docce?"
- `"Meno di 5 minuti"` → +0€
- `"Circa 10-15 minuti"` → +18€ alla bolletta gas/acqua

**Domanda 3:**
> "Lasci TV, PC e caricatori in standby?"
- `"Sì, sempre"` → +12€ alla bolletta luce
- `"No, stacco tutto"` → +0€

### Step 2 — Rivelazione bollette

Le tre bollette "arrivano" una alla volta con animazione slide-down:

```
LUCE     — [40€ base + eventuali extra]    → da 40€ a 72€
GAS      — [30€ base + eventuali extra]    → da 30€ a 48€
INTERNET — 29€ (fisso, non modificabile)
```

Ogni bolletta è una card con: logo stilizzato, importo in grande, descrizione voce di consumo.

**Totale bollette mostrato in basso.** Aggiornato automaticamente.

### Step 3 — Sara commenta

Sara entra, stato `seria`:
> "Queste si chiamano spese fisse variabili. Ci sono sempre, ma l'importo dipende da te."

Poi, in base al totale bollette:
- Se totale > 120€ (molti sprechi):
  > "Hai pagato [X]€ in più del necessario per abitudini che puoi cambiare facilmente."
- Se totale < 100€ (pochi sprechi):
  > "Ottima gestione dei consumi. Piccole abitudini, grande differenza."

Sara, sempre:
> "E no — spegnere tutto e soffrire al freddo non è la soluzione. Risparmiare non significa privarsi. Significa essere consapevoli."

**Salva in `gameState.bollette`** i valori. Aggiorna `saldo`.

**Concetto sbloccato:** `"Spese fisse vs variabili: i consumi dipendono da te"`

**Pulsante "Capito"** → Scena 5.

---

## SCENA 5 — L'IMPREVISTO: IL FRIGO SI ROMPE

**Componente:** `SceneEmergency`
**Sfondo:** cucina con frigo rotto (asset: `bg-cucina-frigo-rotto.png` — sprite frigo con grafica danneggiata, vapore animato CSS)
**Personaggio:** Protagonista, stato `preoccupato`

### Step 1 — L'evento

Animazione: schermo vibra leggermente (CSS shake, 0.3s). Appare notifica:

```
⚠️ IMPREVISTO
Il tuo frigo ha smesso di funzionare.
Costo riparazione: 180€
```

Sara entra, stato `sorpresa`:
> "Ecco. È successo."

### Step 2 — Tre scenari in base al fondo emergenza

Il gioco legge `gameState.fondoEmergenza` e presenta lo scenario corretto.

---

**SCENARIO A — Fondo emergenza ≥ 180€ (sufficiente)**

Sara, stato `sorridente`:
> "Eccolo. Il momento esatto per cui esiste il fondo emergenza."
> "180€. Prendi dal fondo, chiami il tecnico, risolvi. Nessun debito. Nessun panico."

UI: animazione del fondo emergenza che si svuota di 180€ (barra che decresce).

Sara:
> "Visto come funziona? Senza quel fondo, oggi saresti nei guai."

`gameState.fondoEmergenza -= 180`
`gameState.imprevistoAffrontato = true`

---

**SCENARIO B — Fondo emergenza tra 50€ e 179€ (parzialmente sufficiente)**

Sara, stato `seria`:
> "Hai un po' nel fondo, ma non basta a coprire tutto. Devi prendere [X]€ dai risparmi."

UI: barra fondo emergenza si azzera, poi barra risparmi decresce della differenza.

Sara:
> "Te la cavi. Ma hai capito ora perché si dice: obiettivo tre stipendi di scorta?"
> "Con 50€ nel fondo emergenza, ogni imprevisto diventa un problema vero."

`gameState.fondoEmergenza = 0`
`gameState.fondoInvestimento -= (180 - fondoEmergenzaOriginale)`

---

**SCENARIO C — Fondo emergenza < 50€ (vuoto o quasi)**

Sara, stato `seria`:
> "Non hai abbastanza nel fondo emergenza. Hai due opzioni."

**UI:** due card selezionabili:

**Opzione C1 — Prestito personale**
> Importo: 180€ · Tasso: 12% annuo (TAEG) · Rata mensile: ~16€ per 12 mesi · Costo totale: ~192€

**Opzione C2 — Il frigo resta rotto**
> "Mangi fuori o dal vicino per un po'. Costi imprevisti: ~60€ di cibo da fuori."

Se sceglie C1, **popup educativo automatico** (componente `TaegPopup`):
- Mostra: importo prestato vs totale restituito
- Formula visiva: `180€ + 12€ di interessi = 192€`
- Sara: *"Questo è il costo reale del non avere un fondo emergenza. 12€ in più per niente."*

**Concetto sbloccato (solo scenario C):** `"TAEG: il costo reale del credito"`

Sara, in tutti gli scenari, alla fine:
> "Il fondo emergenza non è opzionale. È la differenza tra un imprevisto e una crisi."

**Concetto sbloccato (tutti gli scenari):** `"Fondo emergenza: perché esiste"`

**Pulsante "Vai al riepilogo"** → Scena 6.

---

## SCENA 6 — RIEPILOGO DEL MESE

**Componente:** `SceneSummary`
**Sfondo:** appartamento, sera, luce soffusa (asset: `bg-appartamento-sera.png`)
**Personaggio:** Protagonista, stato dipendente dal risultato. Sara, stato `sorridente`.

### Layout

Schermata divisa in due colonne:

**Colonna sinistra — Estratto conto del mese**

```
ENTRATE
────────────────────────
Stipendio                +1.400€

USCITE
────────────────────────
Spese necessarie (affitto ecc.)   -[X]€
Spesa supermercato                -[X]€
Bollette                          -[X]€
Imprevisto (frigo)                -180€  ← solo se occorso

RISPARMI
────────────────────────
Fondo emergenza          +[X]€
Fondo investimento       +[X]€
Rendimento investimento  +[X]€  ← piccolo ma visibile

SALDO FINALE             [X]€
```

Ogni riga appare con animazione fade-in sequenziale (100ms di delay tra una e l'altra).

**Colonna destra — Concetti imparati**

Grid di badge (card piccole) per ogni concetto sbloccato durante il gioco:

```
[ Budget 50/30/20 ]       [ Fondo emergenza ]
[ Interesse composto ]    [ Spesa pianificata ]
[ Spese fisse/variabili ] [ TAEG ]  ← se sbloccato
```

I badge bloccati (non raggiunti) appaiono in grigio con lucchetto.

### Calcolo `punteggioRisparmio`

```js
punteggioRisparmio = fondoEmergenza + fondoInvestimento + rendimentoMese
```

### Messaggio finale personalizzato

- Se `punteggioRisparmio >= 200`:
  Sara `sorridente`: *"Hai risparmiato bene. A questo ritmo, tra qualche anno potresti permetterti qualcosa di importante. Come... una casa."*
  → Appare pulsante **"Scopri come funziona un mutuo →"** (porta a Scena 7)

- Se `punteggioRisparmio` tra 50 e 199:
  Sara `seria`: *"Hai tenuto i conti. Il prossimo mese puoi fare di meglio — ora sai dove perdi soldi."*
  → Pulsante **"Riprova il mese"** + **"Fine"**

- Se `punteggioRisparmio` < 50:
  Sara `sorpresa`: *"Mese difficile. Ma hai imparato più di quanto pensi. Riprova sapendo quello che sai ora."*
  → Pulsante **"Riprova il mese"**

---

## SCENA 7 — IL MUTUO (condizionale)

**Componente:** `SceneMortgage`
**Sfondo:** esterno banca / palazzo (asset: `bg-banca-esterno.png`)
**Personaggio:** Sara, stato `seria`. Protagonista, stato `neutro`.

Questa scena appare **solo se `punteggioRisparmio >= 200`**.

Sara:
> "Se continui così ogni mese, tra qualche anno potresti comprare casa. Ti spiego come funziona un mutuo — non per fartelo prendere adesso, ma perché devi sapere a cosa stai lavorando."

### Step 1 — I tre prerequisiti (presentati uno alla volta, card animate)

**Card 1 — L'anticipo**
> "Per comprare una casa, la banca non ti presta tutto. Vuole che tu abbia già il 20-30% del prezzo."
> "Casa da 200.000€ → ti servono 40.000-60.000€ tuoi, subito."

UI interattiva: slider prezzo casa (100k-400k€) → mostra anticipo richiesto in tempo reale.

**Card 2 — La rata massima**
> "La banca non ti dà un mutuo se la rata supera il 30-35% del tuo stipendio netto."
> "Con 1.400€/mese, la tua rata massima è circa 420-490€."

UI: calcolatore interattivo. Input: prezzo casa + anni di mutuo → output: rata mensile stimata.

Formula:
```js
// Approssimazione semplificata per scopo educativo
const tassoAnnuo = 0.035
const tassoMensile = tassoAnnuo / 12
const nRate = anni * 12
const capitale = prezzoFinal - anticipo
const rata = capitale * (tassoMensile * Math.pow(1+tassoMensile, nRate)) / (Math.pow(1+tassoMensile, nRate) - 1)
```

**Card 3 — Tasso fisso vs variabile**
> "Fisso: sai sempre quanto paghi per tutta la durata. Non cambia mai."
> "Variabile: parti con una rata più bassa, ma può salire se i tassi di mercato salgono."

UI: grafico lineare (Recharts) con due linee su 20 anni:
- Linea blu piatta = tasso fisso (3.5%)
- Linea arancione ondulata = tasso variabile (parte da 2.8%, oscilla)

Sara: *"Per chi inizia, il fisso è più prevedibile. Sai esattamente a cosa stai andando incontro."*

### Step 2 — Proiezione personalizzata

Il gioco calcola: con i risparmi mensili attuali del giocatore, quanti anni ci vogliono per accumulare l'anticipo?

```js
const risparmioMensile = punteggioRisparmio
const anticipo = 50000  // default: casa da 200k con 25% anticipo
const anniNecessari = Math.ceil(anticipo / (risparmioMensile * 12))
```

UI: barra progresso verso la casa con label *"A questo ritmo: casa tra [N] anni"*.

Sara:
> "Non è domani. Ma ogni mese che risparmi è un mese in meno."

### Step 3 — Concetto finale sbloccato

**Popup:** `"Mutuo: i prerequisiti per comprare casa"`

---

## SCENA FINALE — SCHERMATA DI FINE GIOCO

**Componente:** `SceneEnd`
**Sfondo:** casa (sbloccata se score alto, con lucchetto se score basso)

Mostra:
- Riepilogo tutti i concetti sbloccati (badge)
- Messaggio personalizzato in base alle scelte
- **Pulsante "Rigioca e ottimizza"** → reset `gameState` completo, torna a Scena 0

---

## COMPONENTI REACT DA CREARE

| Componente | Descrizione |
|---|---|
| `GameEngine` | Root component, gestisce `gameState` e navigazione tra scene |
| `DialogBox` | Box dialogo con typewriter effect, nome personaggio, avatar |
| `CharacterSprite` | Renderizza il personaggio dal spritesheet PNG con `background-position` |
| `BudgetPieChart` | Torta animata allocazione budget (usa Recharts `PieChart`) |
| `BudgetSliders` | Tre slider per allocare i 1.400€ con validazione in tempo reale |
| `CompoundInterestChart` | Grafico crescita interesse composto (Recharts `LineChart`) |
| `InvestmentCards` | Tre card selezionabili breve/medio/lungo termine |
| `SupermarketScene` | Logica percorso A (oggetti tentatori) e percorso B (lista) |
| `BillsQuiz` | Tre domande comportamentali sequenziali |
| `EmergencyScene` | Gestisce i 3 scenari imprevisto in base al fondo |
| `TaegPopup` | Popup educativo su TAEG con formula visiva |
| `MonthlySummary` | Estratto conto animato + badge concetti |
| `MortgageCalculator` | Calcolatore rata con slider prezzo casa e anni |
| `ConceptBadge` | Card piccola per ogni concetto sbloccato |
| `ProgressBar` | Barra generica riutilizzabile (fondo emergenza, casa) |

---

## ASSET NECESSARI

### Sfondi (PNG, stile pixel art 2D)
- `bg-appartamento-vuoto.png` — appartamento vuoto, luce serale
- `bg-appartamento-tavolo.png` — appartamento con tavolo e foglio
- `bg-appartamento-divano.png` — appartamento, personaggio sul divano con telefono
- `bg-appartamento-telefono.png` — appartamento, notifiche sul telefono
- `bg-appartamento-sera.png` — appartamento di sera, luce soffusa
- `bg-supermercato.png` — interno supermercato con scaffali
- `bg-cucina-frigo-rotto.png` — cucina con frigo danneggiato
- `bg-banca-esterno.png` — esterno banca / palazzo urbano
- `bg-casa-obiettivo.png` — casa con lucchetto (versione bloccata e sbloccata)

### Personaggi (spritesheet PNG)
- `protagonist-sheet.png` — protagonista, tutti gli stati e frame animazioni
- `sara-sheet.png` — Sara, tutti gli stati: sorridente, seria, sorpresa

### UI / Oggetti
- `icon-bolletta.png` — icona bolletta
- `icon-frigo-rotto.png` — sprite frigo rotto
- `badge-icons.png` — spritesheet icone per i badge concetti

---

## REQUISITI HACKATHON — DELIVERABLE

### 01 — User Difficulty Statement
> L'utente target è un ragazzo di 13-18 anni che riceve il primo stipendio o gestisce per la prima volta del denaro proprio. Non sa come allocare le entrate, tende a spendere in modo impulsivo e non conosce concetti come budget, fondo emergenza, interesse composto o mutuo. Il gioco lo guida attraverso un mese simulato realistico, rendendo tangibile il costo delle scelte finanziarie quotidiane.

### 02 — Before / After Simplicity Evidence
Esempio concreto in-game: **Scena supermercato**
- BEFORE: definizione testuale di "spesa pianificata vs impulsiva"
- AFTER: il giocatore vive la differenza in prima persona — percorso A (spendo 220€ a occhio) vs percorso B (spendo 110€ con lista). Il confronto numerico finale rende il concetto immediato e memorabile.

### 03 — Risk & Clarity Note
- Nessun consiglio finanziario personalizzato: il gioco insegna principi generali, non dice mai "investi in X" o "compra questa casa"
- I calcoli del mutuo sono semplificati e dichiarati tali con disclaimer in-game
- Il concetto di investimento è presentato come educativo con disclaimer: *"I rendimenti mostrati sono stime storiche medie, non garanzie future"*
- Nessuna raccolta di dati personali reali