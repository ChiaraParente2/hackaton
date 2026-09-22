---
name: sprite-pipeline
description: Rende davvero trasparenti gli sprite generati da modelli immagine (Copilot, DALL-E, Midjourney) che consegnano PNG RGB con la scacchiera dipinta nei pixel invece del canale alpha. Ritaglia i margini vuoti e ridimensiona. Usala prima di integrare qualsiasi nuovo personaggio od oggetto in app/public/assets.
---

# Sprite pipeline

## Il problema che risolve

I modelli immagine, se chiedi "sfondo trasparente", spesso consegnano un PNG
**RGB senza canale alpha con la scacchiera disegnata dentro**. A occhio sembra
trasparente perché la scacchiera è la convenzione grafica della trasparenza.
Non lo è: sovrapposto allo sfondo diventa un rettangolo grigio a quadretti.

È successo su **tutti e cinque** gli sprite del progetto.

## Diagnosi in un secondo

```bash
od -An -tu1 -j25 -N1 app/public/assets/sprite.png
```

Il byte 25 dell'header PNG è il color type: **6 = RGBA** (ok), **2 = RGB**
(trasparenza finta). `sips -g hasAlpha` dice la stessa cosa ma è più lento.

Non fidarti dell'anteprima: nei visualizzatori la scacchiera dipinta e la
trasparenza vera sono indistinguibili.

## Uso

```bash
# un singolo file
python3 agents/skills/sprite-pipeline/sprites.py sara.png

# specificando l'altezza finale
python3 agents/skills/sprite-pipeline/sprites.py tonno.png 420

# tutti gli sprite noti (salta quelli gia' a posto)
python3 agents/skills/sprite-pipeline/sprites.py --tutti
```

Dipendenza: `python3 -m pip install --user pillow`

**Modifica i file sul posto.** Gli originali restano nella storia git.

## Come funziona

1. **Flood fill dai bordi** con soglia 42: parte da otto punti del perimetro e
   si espande. I contorni scuri del disegno cartoon fanno da argine, quindi il
   riempimento non entra nel personaggio. Otto semi e non quattro perché se la
   sagoma tocca un angolo partire solo dagli angoli lascia isole di sfondo.
2. **Alpha a zero** dove ha riempito.
3. **Sfumatura del bordo** (blur 0.7 sul solo canale alpha): senza, la sagoma
   risulta seghettata sullo sfondo.
4. **Crop al bounding box**: toglie i margini vuoti, così l'altezza CSS
   corrisponde all'altezza reale del personaggio.
5. **Resize** all'altezza target.

## Risultati misurati su questo repo

| File | Prima | Dopo | Peso |
|---|---|---|---|
| protagonista.png | 1024×1536 | 310×900 | 1319 KB → 314 KB |
| sara.png | 1024×1536 | 290×900 | 1144 KB → 317 KB |
| tonno.png | 1254×1254 | 649×420 | 1107 KB → 221 KB |
| phone.png | 1024×1536 | 211×420 | 889 KB → 63 KB |

Totale: **da ~9,8 MB a ~2,5 MB**, senza differenze visibili a schermo.

## Limiti — leggi prima di usarla

**Non usarla sugli sfondi.** `casa.png`, `supermercato.png`, `cucina_*.png` sono
immagini piene: il flood fill mangerebbe il cielo o le pareti. Lo script ha una
whitelist apposta.

**Controlla la percentuale riportata.** Se è sotto il 15% non ha rimosso quasi
nulla (soglia troppo bassa, o sfondo non uniforme); se è sopra il 92% ha
probabilmente mangiato il soggetto. Lo script segnala `SOSPETTO` in quei casi,
ma il giudizio finale è visivo: apri il file.

**Soggetti senza contorno scuro** (sfumature che sfociano nello sfondo) possono
perdere pezzi. In quel caso abbassa la soglia da 42 a ~25 e riprova
sull'originale recuperato da git.
