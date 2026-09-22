---
name: verifica-economia
description: Verifica gli invarianti del modello economico di Primo Stipendio. Usala SEMPRE dopo aver toccato app/src/utils/finance.js, il reducer di GameEngine o una scena che muove soldi (budget, risparmi, supermercato, bollette, imprevisto). Trova estratti conto che non quadrano, punteggi che non dipendono dalle scelte, soglie irraggiungibili, NaN e Infinity.
---

# Verifica economia

## Quando usarla

Dopo **qualsiasi** modifica che tocchi:

- `app/src/utils/finance.js`
- `initialState` o il reducer in `app/src/components/engine/GameEngine.jsx`
- una scena che fa `dispatch` di un valore monetario

Non è opzionale: nel progetto **ogni** bug economico grave è passato inosservato
a una lettura del codice ed è stato trovato solo eseguendo i numeri.

## Come si usa

```bash
node agents/skills/verifica-economia/verifica.mjs
```

Esce `0` se tutto è a posto, `1` se un invariante è violato — quindi è
utilizzabile in CI o in un hook pre-commit.

## Cosa controlla

| # | Invariante | Bug che previene |
|---|---|---|
| 1 | Il gioco parte esattamente da 1.400 € | partiva da 1.371 €: `internet: 29` era già addebitato nello stato iniziale |
| 2 | Impossibile sforare il budget (309 combinazioni: 4 case × ogni posizione slider) | tre slider indipendenti permettevano totali diversi da 1.400 € |
| 3 | Spostare soldi nel salvadanaio non abbassa il patrimonio | risparmiare faceva scendere il contatore: il gioco puniva la scelta giusta |
| 4 | Somma delle voci del riepilogo = patrimonio, su 4 partite diverse | 4 voci su 7 non incidevano sul totale, e l'imprevisto incideva senza comparire |
| 5 | L'imprevisto attinge prima al fondo emergenza | "Usa il fondo" addebitava tutto al conto e lasciava il fondo intatto |
| 6 | Il punteggio cambia al variare della ripartizione | `fondoEmergenza + fondoInvestimento` è per costruzione uguale al budget: il punteggio era una costante |
| 7 | Le soglie di giudizio sono raggiungibili, niente NaN/Infinity | la soglia "ottimo" era a 420 ma lo slider arrivava a 280 |

## Come aggiungere un invariante

Il file è volutamente senza dipendenze: niente framework di test, solo `node`.

```js
check('descrizione leggibile', condizioneBooleana, 'dettaglio con i numeri')
```

Il terzo argomento è importante: un `❌` senza i valori coinvolti costringe a
rifare l'indagine da capo. Metti sempre atteso e ottenuto.

## Un avvertimento sul significato dei test

Il controllo 5 nella prima stesura affermava *"chi ha la rete chiude col conto
più alto"*. È **falso**, e il modello aveva ragione: 180 € spesi sono 180 €
spesi, che fossero etichettati "fondo emergenza" o lasciati liquidi sul conto.
La differenza vera la fa il prestito a 192 € a cui la scena 5 indirizza chi non
ha la rete.

Quando un invariante fallisce, prima di correggere il codice **verifica che
l'invariante sia giusto**.
