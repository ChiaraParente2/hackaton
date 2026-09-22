# Workflow — sprint di 2 ore in due

Come è stato organizzato questo progetto: due persone, due sessioni AI in
parallelo, 2 ore di tempo. Riusabile per qualsiasi hackathon con lo stesso
vincolo.

---

## Il principio: ordina i task per latenza, non per importanza

L'errore istintivo è partire dal codice perché "è la cosa principale". Sbagliato:
va avviato per primo **ciò che ha la latenza più alta e zero dipendenze**.

| Task | Latenza | Dipende da |
|---|---|---|
| Generare gli asset grafici | **alta** (minuti per immagine) | niente |
| Scrivere le formule pure | bassa | niente |
| Scaffolding + motore | media | niente |
| Scrivere le scene | media | il motore |
| Integrazione | bassa | tutto |

Quindi: chi fa gli asset parte al minuto zero, non nel blocco 2.

---

## La tabella di marcia

### 0:00 → 0:25 — Fondamenta, in parallelo

**Persona A — scheletro navigabile**
`npm create vite@latest` (non lo scrive il modello), Tailwind, Recharts, il
motore con lo stato globale, **tutte** le scene come stub che rendono il
proprio nome e un bottone "Avanti", i componenti UI condivisi in versione
stupida ma funzionante. **Push entro 0:25, scadenza rigida.**

**Persona B — tutto ciò che non dipende da A**
Le formule pure (`finance.js`), i dialoghi come dati, i deliverable
dell'hackathon. Zero attese.

> Il valore dello scheletro con tutti gli stub non è il codice: è il
> **contratto**. Da quel momento due persone possono scrivere scene diverse
> senza parlarsi.

### 0:25 — Si congela il contratto

Forma dello stato, nomi delle action, prop dei componenti condivisi. Dopo non
si rinegozia, si aggira. Una rinegoziazione a metà sprint costa più del
difetto che vorrebbe correggere.

### 0:25 → 1:30 — Scene in parallelo

Dividete **per peso, non per numero**. Le scene con grafici vanno tutte alla
stessa persona: la curva di apprendimento della libreria si paga una volta
sola. Tipicamente 3 scene "pesanti" contro 6 "leggere".

### 1:30 → 1:50 — Integrazione insieme

Giro completo end-to-end, `verifica-economia`, disclaimer obbligatori,
leggibilità su mobile.

### 1:50 → 2:00 — Consegna

Build, deploy, README.

---

## Regole anti-conflitto

Con due persone che pushano su `main` qui si perdono 20 minuti se non ci si dà
una disciplina:

- **Un file per persona, mai lo stesso.** Le scene sono file separati apposta:
  i conflitti diventano quasi impossibili.
- **Il motore lo tocca solo A**, e solo nel primo blocco. Dopo è congelato.
- `git pull --rebase` prima di ogni push.
- **Push ogni ~10 minuti.** Lavoro tenuto in locale è lavoro a rischio.
- Se due persone devono toccare lo stesso file, una delle due aspetta. È più
  veloce che risolvere il conflitto.

---

## Cosa tagliare, deciso all'inizio

Il taglio va deciso al minuto zero, non a metà strada quando sei già in
ritardo e hai investito tempo nella cosa da tagliare.

Su questo progetto abbiamo tagliato, e rifaremmo:

| Tagliato | Perché | Sostituito con |
|---|---|---|
| Sfondi composti da tile 16×16 | serve un tilemap renderer: costa più del tempo totale | PNG interi generati |
| Spritesheet animati | misurare i frame, ciclo idle | immagine statica per mood |
| Scaricare nuovi pack di asset | ogni download è tempo tolto alle scene | riuso con filtro CSS |
| Una scena intera (il mutuo) | era già condizionale nel design | niente, il flusso regge |

E una regola: **designate in anticipo la scena sacrificabile**. Sapere già cosa
salta se alle 1:30 sei indietro evita la discussione nel momento peggiore.

---

## Cosa è andato storto davvero

Onestà utile per chi riusa questo workflow.

- **Il primo giro di codice AI era incoerente, non rotto.** Il build passava,
  la demo partiva, ma l'estratto conto non quadrava, il punteggio era una
  costante e il fondo emergenza non veniva mai scalato. *Compilare non è
  funzionare*: serviva una verifica numerica, ed è nata da lì la skill
  `verifica-economia`.
- **Il fork inutile.** Il push falliva per "permessi mancanti" e abbiamo
  aperto fork + PR. In realtà git si autenticava con **l'account sbagliato**:
  quello giusto aveva già accesso in scrittura. Prima di aggirare un errore di
  permessi, verifica con quale identità stai parlando al server.
- **Gli asset "trasparenti" non lo erano.** Vedi
  [`skills/sprite-pipeline`](../skills/sprite-pipeline/SKILL.md).
