# Prompt — Review di una scena

Da usare su codice scritto da un'altra sessione AI. In uno sprint parallelo
nessuno rilegge davvero il codice dell'altro: questa review è l'unico
controllo che resta.

---

```
Fai la review di app/src/components/scenes/Scene<NOME>.jsx.

CONTESTO
1. il file da revisionare
2. app/src/utils/finance.js
3. la sezione "<TITOLO>" di agents/GAME_INFO.md — solo quella

CERCA IN QUEST'ORDINE (dal piu' grave al meno)

1. INCOERENZE NUMERICHE
   - un valore mostrato a schermo che non corrisponde a quello che il dispatch salva
   - formule riscritte a mano invece di importate da finance.js
   - soglie di giudizio irraggiungibili dato il range degli input
   - arrotondamenti che producono 0, NaN o Infinity
   - importi formattati a mano invece che con euro()

2. CODICE MORTO
   - stato dichiarato e mai letto
   - rami condizionali irraggiungibili
   - prop passate e mai usate dal componente figlio

3. LOGICA DI GIOCO
   - e' possibile sforare il budget?
   - il caso "il giocatore sceglie zero" e' gestito?
   - il bottone di conferma puo' restare bloccato senza che sia chiaro perche'?

4. COERENZA CON LE CONVENZIONI
   - personaggi con <CharacterSprite>, dialoghi con <SpeechBubble>
   - un solo file toccato, GameEngine a parte
   - testi in italiano e senza gergo non spiegato

FORMATO DELLA RISPOSTA
Per ogni problema: file:riga, cosa succede, come si manifesta per il giocatore.
Ordinati per gravita'. Se una cosa non e' un problema vero non elencarla:
preferisco 3 segnalazioni solide a 15 generiche.

Non correggere nulla finche' non te lo dico.
```

---

## Perché "non correggere nulla finché non te lo dico"

Durante lo sprint la review serve a **decidere cosa vale la pena sistemare**,
non a sistemare tutto. Metà delle segnalazioni tipiche sono difetti veri ma
irrilevanti per una demo di 5 minuti; correggerle costa token e rischia
conflitti con chi sta lavorando sullo stesso file.

## Esempio di output utile

> `SceneSavings.jsx:69` — la soglia `fondoEmergenza >= 420` etichetta il
> risultato come "ottimo", ma lo slider alla riga 63 ha `max={maxRisparmio}`
> che vale ~280. **Il ramo non è raggiungibile**: il giocatore non vedrà mai
> quel messaggio.

Non così:

> Il codice potrebbe beneficiare di una migliore gestione delle costanti.
