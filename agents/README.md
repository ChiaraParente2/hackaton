# Setup agentico — Primo Stipendio

Questa cartella è il **sistema operativo del progetto per gli agenti AI**. Non è
documentazione descrittiva: è l'insieme di contratti, prompt riusabili, skill
eseguibili e budget di token con cui il gioco è stato effettivamente costruito
durante l'hackathon.

Il progetto è nato come esperimento di **sviluppo interamente AI-assistito** con
due persone che lavorano in parallelo, ciascuna con la propria sessione. Le
regole qui dentro esistono perché sono state pagate: ognuna nasce da un errore
concreto che ci è costato tempo o token.

---

## Mappa

| File | A cosa serve | Quando leggerlo |
|---|---|---|
| [`AGENTS.md`](AGENTS.md) | **Il contratto.** Stack, struttura, convenzioni, checklist di consegna | Sempre, per primo |
| [`GAME_INFO.md`](GAME_INFO.md) | Design document, scena per scena | **Solo la sezione della scena che tocchi** |
| [`TOKENOMICS.md`](TOKENOMICS.md) | Budget token misurato e regole per non bruciarlo | Prima di un task lungo |
| [`prompts/`](prompts/) | Prompt pronti per i task ricorrenti | Quando inizi quel tipo di task |
| [`skills/`](skills/) | Skill con tooling eseguibile | Quando la skill copre il tuo task |
| [`workflows/`](workflows/) | Come ci si organizza in due in parallelo | A inizio sprint |

---

## Ordine di lettura per un agente che arriva ora

1. `AGENTS.md` — contratto e convenzioni (367 righe, ~4k token)
2. La sezione di `GAME_INFO.md` **della sola scena su cui lavori** (40-90 righe)
3. Il prompt in `prompts/` che corrisponde al tuo task
4. Il codice del file che devi cambiare

**Non leggere `GAME_INFO.md` per intero.** Sono 678 righe: caricarlo tutto per
sistemare un colore costa ~7k token per niente. Vedi `TOKENOMICS.md`.

---

## Le quattro regole non negoziabili

### 1. I numeri escono tutti da `app/src/utils/finance.js`

Nessuna scena ricalcola una formula a mano. È la regola più costosa che abbiamo
imparato: la stessa formula viveva in tre posti (`finance.js`,
`SceneSavings.jsx`, `CompoundInterestChart.jsx`) e le tre copie erano già
divergenti. Due funzioni di `finance.js` non erano importate da nessuno.

Conseguenza pratica: **saldo, patrimonio e punteggio non stanno nello stato**,
sono derivati. Quando erano nello stato divergevano dalle voci mostrate a
schermo e l'estratto conto non quadrava.

### 2. Ogni modifica all'economia si verifica con numeri, non a occhio

Esiste una skill che lo fa: [`skills/verifica-economia`](skills/verifica-economia/SKILL.md).
Va eseguita **prima** di dichiarare finito un cambiamento ai soldi.

Bug trovati solo perché li abbiamo misurati invece di guardarli:

- il gioco partiva da **1.371 €** invece di 1.400 € (`internet: 29` già
  addebitato nello stato iniziale)
- il punteggio era **identico** qualunque scelta facessi, perché
  `fondoEmergenza + fondoInvestimento` è per costruzione uguale al budget
- il bottone "Usa il fondo emergenza" **non scalava il fondo**: addebitava
  tutto al conto corrente
- la soglia `>= 420` per "ottimo" era **irraggiungibile**: lo slider arrivava a 280
- il prestito dichiarava TAEG 80% ma le cifre corrispondevano al **117%**

### 3. Un file per persona, mai lo stesso

Le scene sono file separati apposta. `GameEngine.jsx` lo tocca una sola
persona. Chi lavora in parallelo fa `git pull --rebase` prima di ogni push e
pusha ogni ~10 minuti.

### 4. Gli asset stanno solo in `app/public/assets/`

Vite serve solo quella cartella. Esisteva un duplicato in `app/assets/` che
raddoppiava il conteggio file senza che nulla lo usasse.

---

## Stato del progetto

Gioco a 8 scene, React 19 + Tailwind v4 + Recharts + Vite, zero backend.
`SceneMortgage` (scena 7 del design originale) è stata **tagliata
consapevolmente** per stare nelle 2 ore: il design in `GAME_INFO.md` la
descrive ancora, il codice no.
