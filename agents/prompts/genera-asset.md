# Prompt — Generare e integrare un asset

Gli sfondi e i personaggi sono generati con Copilot / modelli immagine. È il
task con la **latenza più alta e zero dipendenze dal codice**: va avviato per
primo in uno sprint, mentre qualcun altro scrive la logica.

---

## 1. Prompt di generazione

```
Crea un'illustrazione per un gioco educativo 2D.

Soggetto: <SOGGETTO>
Formato: <1536x1024 orizzontale per gli sfondi | 1024x1536 verticale per i personaggi>
Stile: cartoon 2D pulito, contorni scuri marcati, colori piatti e saturi,
       palette calda, niente fotorealismo, niente testo nell'immagine
Sfondo: <ambientazione, per gli sfondi | trasparente, per i personaggi>
Coerenza: stesso stile di app/public/assets/casa.png e sara.png
```

### Se serve un personaggio: chiedi esplicitamente il PNG con alpha

I modelli immagine dicono "sfondo trasparente" e consegnano un PNG **RGB con
la scacchiera dipinta nei pixel**. È successo con tutti e quattro i nostri
personaggi: `hasAlpha: no`, quindi sovrapporli allo sfondo mostrava un
rettangolo grigio a quadretti.

Verifica in un secondo, senza aprire l'immagine:

```bash
od -An -tu1 -j25 -N1 immagine.png   # 6 = RGBA (ok), 2 = RGB (trasparenza finta)
```

Se esce `2`, non buttare l'immagine: passala alla pipeline.

---

## 2. Integrazione

```
Integra <FILE>.png nel gioco.

1. Mettilo in app/public/assets/ — è l'unica cartella che Vite serve.
   NON creare app/assets/: esisteva ed era un duplicato morto.

2. Se è un personaggio o un oggetto, passalo prima dalla pipeline:
   agents/skills/sprite-pipeline/ (rende trasparente, ritaglia, ridimensiona)

3. Referenzialo con path assoluto dalla root pubblica: /assets/<file>.png
   (non ../../assets, non import)

4. Personaggi: aggiungilo alla mappa SPRITE in
   app/src/components/ui/CharacterSprite.jsx, non con un <img> sparso.

5. Controlla l'orientamento. phone.png era verticale (1024x1536) mentre tutti
   gli altri erano orizzontali: con bg-cover veniva ingrandito e tagliato.
```

---

## 3. Regole di peso

| Tipo | Dimensione massima | Peso obiettivo |
|---|---|---|
| Sfondo scena | 1536×1024 | < 400 KB |
| Personaggio | altezza 900 px | < 320 KB |
| Oggetto / icona | lato 420 px | < 250 KB |

Gli sprite generati arrivano a 1-1,5 MB l'uno. Otto file così sono 10 MB sulla
prima schermata: in locale non si nota, su Vercel sì. La pipeline li porta a
~2,5 MB complessivi senza differenze visibili a schermo.
