# Prompt — Modificare il modello economico

Il task più pericoloso del progetto. Ogni bug grave trovato finora nasceva da
qui: numeri che cambiavano tra uno step e l'altro, estratti conto che non
quadravano, punteggi che non dipendevano dalle scelte.

---

```
Modifica il modello economico di Primo Stipendio: <COSA DEVE CAMBIARE>.

CONTESTO DA CARICARE
1. app/src/utils/finance.js (per intero: è piccolo ed è la fonte di verità)
2. agents/skills/verifica-economia/SKILL.md
3. Solo i file che leggono davvero il campo che tocchi. Trovali così, non a memoria:
   grep -rn --include='*.jsx' --include='*.js' "<nomeCampo>" app/src

REGOLE DEL MODELLO
- Le grandezze derivabili NON stanno nello stato. conto corrente, salvadanaio,
  patrimonio e punteggio si calcolano da finance.js a ogni render.
  Motivo: quando stavano nello stato divergevano dalle voci mostrate a schermo.
- vociEstrattoConto() e patrimonio() devono restare coerenti PER COSTRUZIONE:
  la somma delle voci deve fare esattamente il patrimonio. Se aggiungi una voce
  di spesa la aggiungi in entrambi i posti, o meglio: fai derivare uno dall'altro.
- Mettere soldi da parte non deve abbassare il patrimonio. Solo spendere lo abbassa.
- Il fondo emergenza si misura in mesi di SPESE, mai in mesi di stipendio.
- Fondo emergenza e investimento sono decisioni INDIPENDENTI: alzare uno non
  deve abbassare l'altro.
- Ogni soglia usata per un giudizio ("ottimo", "scarso") deve essere
  RAGGIUNGIBILE dato il range dello slider che la alimenta. Verificalo.

DEFINITION OF DONE — nell'ordine
1. `node agents/skills/verifica-economia/verifica.mjs` passa su tutti i controlli
2. `npx vite build` passa
3. nessun riferimento orfano:
   grep -rn --include='*.jsx' --include='*.js' -E "<campiRimossi>" app/src
4. mi riporti la tabella prima/dopo dei valori che cambiano in una partita tipo

NON dichiarare finito il lavoro senza aver eseguito il punto 1 e incollato
l'output. "Sembra giusto" non è una verifica.
```

---

## Checklist dei modi in cui si rompe

Ognuno di questi è successo davvero su questo repo.

| Sintomo | Causa | Come lo trovi |
|---|---|---|
| Il totale parte da un numero strano | un costo è già valorizzato nello stato iniziale | stampa `patrimonio(initialState)` |
| Il punteggio non cambia mai | due termini sommano a una costante | fai variare un input e stampa il punteggio |
| L'estratto conto non torna | le voci mostrate non sono quelle che compongono il totale | somma le voci e confronta |
| "Usa il fondo" non scala il fondo | il dispatch addebita al posto sbagliato | traccia il campo con un grep |
| Una soglia non scatta mai | soglia fuori dal range dello slider | confronta soglia e `max` |
| Un valore appare come `0` | arrotondamento su una cifra troppo piccola | stampa il valore prima di `Math.round` |
| `Infinity` a schermo | divisione per un input a zero | testa sempre il caso 0 |

## Il caso `||` contro `??`

```js
const budget = gameState.allocazioni.risparmio || 280   // SBAGLIATO
const budget = gameState.allocazioni.risparmio ?? 280   // giusto
```

Zero è una scelta valida del giocatore (la "Cicala"), non un valore mancante da
rimpiazzare con un default. Con `||` chi decide di non risparmiare nulla si
ritrova magicamente 280 € da allocare.
