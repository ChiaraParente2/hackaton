# Prompt — Creare una nuova scena

Uso: sostituisci i `<segnaposto>` e incolla. Pensato per essere autosufficiente:
non richiede che l'agente abbia letto la conversazione precedente.

---

```
Aggiungi la scena <NOME> al gioco Primo Stipendio.

CONTESTO DA CARICARE (in quest'ordine, niente altro):
1. agents/AGENTS.md
2. la sezione "<TITOLO SEZIONE>" di agents/GAME_INFO.md — SOLO quella
3. app/src/utils/finance.js
4. app/src/components/scenes/SceneSupermarket.jsx come modello di struttura

COSA DEVE FARE LA SCENA
<2-4 righe: cosa sceglie il giocatore e cosa impara>

VINCOLI NON NEGOZIABILI
- Il file nuovo è app/src/components/scenes/Scene<Nome>.jsx e non ne tocchi altri,
  tranne la registrazione in GameEngine.jsx (array SCENES + SCENE_LABELS).
- Riceve (gameState, dispatch) come props. Nessun context, nessuno store.
- Ogni numero monetario passa da finance.js. Se serve una formula nuova la
  aggiungi LÌ e la importi: non la scrivi nella scena.
- Ogni importo a schermo passa da euro(). Mai `{valore}€` a mano.
- Se il giocatore alloca dei soldi, deve essere IMPOSSIBILE sforare il budget:
  una sola leva libera, il resto derivato. Niente bottoni disabilitati finché
  non azzecchi il totale.
- Personaggi con <CharacterSprite> e dialoghi con <SpeechBubble>, non box grigi.
- Testi in italiano, tono diretto, niente gergo finanziario non spiegato.

DEFINITION OF DONE
- `npx vite build` passa
- la scena è raggiungibile giocando dall'inizio
- se tocca i soldi: `node agents/skills/verifica-economia/verifica.mjs` passa
- nessun `console.log` lasciato indietro

Prima di scrivere codice dimmi in 3 righe come intendi strutturare gli step
interni della scena, così ti confermo.
```

---

## Perché il prompt è fatto così

**Elenca il contesto da caricare** invece di lasciarlo decidere: senza questa
lista l'agente tende a leggere `GAME_INFO.md` per intero (+7k token) e a
esplorare file che non gli servono.

**Indica una scena esistente come modello.** Costa ~2k token e fa risparmiare
un giro di correzioni sulle convenzioni.

**Mette il vincolo anti-sforamento in chiaro.** La prima versione della scena
budget aveva tre slider indipendenti e il bottone di conferma restava
disabilitato finché la somma non faceva esattamente 1.400 €: frustrante e
inutile. Il vincolo esiste per non ripetere quell'errore.

**Chiede un piano di 3 righe prima del codice.** Un giro di conferma da 200
token evita una riscrittura da 3.000.
