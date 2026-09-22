#!/usr/bin/env python3
"""
Rende davvero trasparenti gli sprite generati dai modelli immagine.

    python3 agents/skills/sprite-pipeline/sprites.py <file.png> [altezza_max]
    python3 agents/skills/sprite-pipeline/sprites.py --tutti

I modelli dicono "sfondo trasparente" e consegnano un PNG RGB con la
scacchiera DIPINTA nei pixel. Questo script la rimuove con un flood fill dai
bordi (i contorni scuri del disegno fanno da argine), ritaglia i margini vuoti
e ridimensiona.

Richiede Pillow:  python3 -m pip install --user pillow
"""
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    sys.exit("Serve Pillow:  python3 -m pip install --user pillow")

ASSETS = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "app", "public", "assets"
)
SENTINELLA = (255, 0, 255)

# Altezze consigliate per tipo. Gli sfondi NON vanno processati: sono immagini
# piene, il flood fill mangerebbe il cielo o le pareti.
ALTEZZE = {
    "protagonista.png": 900,
    "protagonista_dubbioso.png": 900,
    "sara.png": 900,
    "sara_dubbiosa.png": 900,
    "tonno.png": 420,
    "biscotti.png": 420,
    "succo.png": 420,
    "wow.png": 420,
    "phone.png": 420,
}


def ha_alpha(percorso):
    """Legge il color type dall'header PNG: 6 = RGBA, 2 = RGB."""
    with open(percorso, "rb") as f:
        return f.read(26)[25] == 6


def elabora(percorso, altezza_max, soglia=42):
    nome = os.path.basename(percorso)
    prima = os.path.getsize(percorso)
    im = Image.open(percorso).convert("RGB")
    w, h = im.size

    # Semi lungo tutto il perimetro: se il personaggio tocca un angolo,
    # partire solo dagli angoli lascerebbe pezzi di sfondo.
    semi = [
        (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
        (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
    ]
    for seme in semi:
        if im.getpixel(seme) != SENTINELLA:
            ImageDraw.floodfill(im, seme, SENTINELLA, thresh=soglia)

    rgba = im.convert("RGBA")
    px = rgba.load()
    trasparenti = 0
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            if (r, g, b) == SENTINELLA:
                px[x, y] = (0, 0, 0, 0)
                trasparenti += 1

    # Sfuma il bordo: senza, la sagoma risulta seghettata sullo sfondo.
    r, g, b, a = rgba.split()
    rgba = Image.merge("RGBA", (r, g, b, a.filter(ImageFilter.GaussianBlur(0.7))))

    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)

    if altezza_max and rgba.height > altezza_max:
        scala = altezza_max / rgba.height
        rgba = rgba.resize((max(1, round(rgba.width * scala)), altezza_max), Image.LANCZOS)

    rgba.save(percorso, "PNG", optimize=True)
    dopo = os.path.getsize(percorso)
    pct = 100 * trasparenti / (w * h)

    esito = "ok" if 15 < pct < 92 else "SOSPETTO: controlla a occhio"
    print(
        f"  {nome:<28} {w}x{h} -> {rgba.width}x{rgba.height}  "
        f"trasparente {pct:5.1f}%  {prima // 1024:>5} KB -> {dopo // 1024:>4} KB  [{esito}]"
    )
    return pct


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)

    if args[0] == "--tutti":
        lavori = [(os.path.join(ASSETS, n), h) for n, h in ALTEZZE.items()]
        lavori = [(p, h) for p, h in lavori if os.path.exists(p)]
    else:
        percorso = args[0] if os.path.isabs(args[0]) else os.path.join(ASSETS, args[0])
        altezza = int(args[1]) if len(args) > 1 else ALTEZZE.get(os.path.basename(percorso), 900)
        lavori = [(percorso, altezza)]

    print("Rimozione scacchiera, ritaglio e ridimensionamento:")
    for percorso, altezza in lavori:
        if ha_alpha(percorso):
            print(f"  {os.path.basename(percorso):<28} ha gia' il canale alpha, salto")
            continue
        elabora(percorso, altezza)


if __name__ == "__main__":
    main()
