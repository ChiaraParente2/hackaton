# Tokenomics

Budget e regole per non bruciare token. Tutti i numeri qui sotto sono
**misurati su questo repo**, non stimati a sentimento.

Il contesto è uno sprint da 2 ore con due persone che guidano due sessioni AI
in parallelo. Il collo di bottiglia non è la velocità di scrittura del modello:
è quanto contesto inutile gli fai caricare prima che inizi a lavorare.

---

## 1. Il costo fisso per task

Ogni task paga un "pedaggio" prima di scrivere una riga di codice.

| Cosa | Righe | Token stimati | Quando si paga |
|---|---:|---:|---|
| `AGENTS.md` | 367 | ~4.000 | ogni task |
| `GAME_INFO.md` intero | 678 | ~7.000 | **mai** (vedi regola 1) |
| Sezione di una singola scena | 40-90 | ~500-1.000 | ogni task su una scena |
| File di scena tipico | 100-215 | ~1.200-2.500 | solo il file che tocchi |

**Costo fisso corretto: ~5k token.** Con la lettura integrale del design
document sarebbe ~11k, cioè più del doppio, per informazione che nel 90% dei
casi non serve.

---

## 2. Gli sprechi che abbiamo eliminato, misurati

### Le 1.036 tile ridondanti — il caso più grave

Il repo conteneva 1.036 PNG di tile individuali (`Tiles/tile_0000.png`…) su
1.057 file tracciati totali. Pesavano **166 KB in tutto**, quindi su disco
erano irrilevanti — ma ogni `ls`, glob, `git status` o ricerca file ne
enumerava i percorsi.

| | Prima | Dopo |
|---|---:|---:|
| File tracciati | 1.057 | **13** |
| Token per un listing della cartella | ~15-20k | ~200 |

Ed erano **ridondanti**: i tilesheet impacchettati c'erano già.

> **Lezione generalizzabile:** il costo in token di un file non è il suo peso
> su disco, è la lunghezza del suo percorso moltiplicata per quante volte
> compare in un listing. Mille file da 100 byte costano molto più di un file
> da 100 KB.

### L'istruzione più cara del repo

`AGENTS.md` diceva:

> ~~"Leggi GAME_INFO.md per il design document completo prima di toccare
> qualsiasi scena."~~

Una riga che imponeva 7k token a **ogni** task, anche per cambiare un colore.
Sostituita con *"leggi solo la sezione della scena che stai toccando"*: **-90%
sul costo fisso**, modifica di una riga.

### Duplicazioni che costano due volte

La forma di `gameState` era definita sia in `AGENTS.md` sia in `GAME_INFO.md`.
Paghi i token due volte, ma il danno vero è che **appena divergono l'agente
riceve istruzioni contraddittorie** e ci perdi molto più di quanto risparmi.
Fonte unica: il codice.

### Asset (non token, ma stesso principio)

Gli sprite dei personaggi avevano la scacchiera di trasparenza **dipinta nei
pixel** ed erano da 1-1,5 MB l'uno.

| | Prima | Dopo |
|---|---:|---:|
| Sprite personaggi + oggetti | ~9,8 MB | ~2,5 MB |
| Trasparenza reale | no (RGB) | sì (RGBA) |

Pipeline riusabile: [`skills/sprite-pipeline`](skills/sprite-pipeline/SKILL.md).

---

## 3. Le regole

### R1 — Leggi solo la sezione che ti serve
`GAME_INFO.md` è diviso per scena. Leggi la tua, non il file.

### R2 — `grep` prima di `read`
Per trovare *dove* succede una cosa, una ricerca mirata costa ~600 token; aprire
sei file di scena ne costa ~8.000. Esempio reale: tutta la matematica dei soldi
del progetto si trova con

```bash
grep -rn --include='*.jsx' --include='*.js' -E "saldo|rendimento|Math.pow" app/src
```

Nota le virgolette attorno a `*.jsx`: senza, zsh espande il glob nella cartella
corrente e la ricerca fallisce silenziosamente.

### R3 — Modifica mirata, non riscrittura
Riscrivere un file di 200 righe per cambiarne 5 costa 10× e cancella le
modifiche che il tuo collega ha pushato nel frattempo.

### R4 — Lo scaffolding non lo scrive il modello
`npm create vite@latest` genera `package.json`, `vite.config.js` e `index.html`
gratis e senza errori. Farli produrre token per token è puro spreco.

### R5 — Tieni `node_modules/` ignorato
È in `.gitignore` dal primo giorno. Senza, ogni glob restituirebbe migliaia di
percorsi: lo stesso problema delle tile, moltiplicato per cento.

### R6 — Non incollare output di build
Filtra. `npx vite build 2>&1 | grep -E "built in|error"` sono 2 righe invece di 40.

---

## 4. Budget indicativo per tipo di task

| Task | Budget | Cosa caricare |
|---|---:|---|
| Cambio testuale / colore | < 3k | solo il file |
| Nuova scena | 15-25k | `AGENTS.md` + sezione design + una scena simile come modello |
| Modifica all'economia | 10-15k | `finance.js` + skill di verifica + le scene che leggono il campo |
| Debug "il numero è sbagliato" | 5-10k | `grep` mirato, poi il solo file colpevole |
| Review completa del repo | 40-60k | inventario prima, lettura dopo |

---

## 5. Come misurare invece di indovinare

```bash
# righe e byte dei file che un agente caricherebbe
wc -lc agents/AGENTS.md agents/GAME_INFO.md

# quanti file vedrebbe un listing
git ls-files | wc -l

# i 10 file piu' lunghi del sorgente
git ls-files 'app/src/**' | xargs wc -l | sort -rn | head -10
```

Regola pratica per l'italiano tecnico misto a codice: **~1 token ogni 3,5
caratteri**. `GAME_INFO.md` sono 25.242 byte, quindi ~7.200 token: il conto
torna.
