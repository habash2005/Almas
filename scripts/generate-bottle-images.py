#!/usr/bin/env python3
"""Generate product-card images matching the two original AI-made cards.

Layout (1024x1536, white): tinted bottle scene top-left, NOTES column on the
right (accord name, strength label, rounded color pill), divider, then
"Inspired by: <original>" in serif, with the "Designer Scent" footnote.
The bottle is storefront/public/images/bottle-transparent.png run through the
site's CSS tint (sepia 0.4 -> hue-rotate(dominant accord hue) -> saturate 0.8).

Usage: python3 scripts/generate-bottle-images.py [--force]
Writes storefront/public/products/<handle>.png. Skips existing files unless
--force; never overwrites the two original AI images (midnight-aventus,
sauvage-noir).
"""

import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE = Path(__file__).resolve().parent.parent
BOTTLE = BASE / "storefront/public/images/bottle-transparent.png"
OUT = BASE / "storefront/public/products"
W, H = 1024, 1536
PRESERVE = {"midnight-aventus", "sauvage-noir"}  # original AI artwork

FONTS = "/System/Library/Fonts/Supplemental"
f_notes_hdr = ImageFont.truetype(f"{FONTS}/Arial.ttf", 26)
f_accord = ImageFont.truetype(f"{FONTS}/Arial Bold.ttf", 34)
f_strength = ImageFont.truetype(f"{FONTS}/Arial.ttf", 22)
f_inspired_lbl = ImageFont.truetype(f"{FONTS}/Georgia Italic.ttf", 40)
f_inspired = ImageFont.truetype(f"{FONTS}/Georgia Bold.ttf", 46)
f_foot_b = ImageFont.truetype(f"{FONTS}/Arial Bold.ttf", 22)
f_foot = ImageFont.truetype(f"{FONTS}/Arial.ttf", 19)

GRAY = (154, 148, 141)
BLACK = (17, 17, 17)
LIGHT = (222, 219, 214)


def slugify(name: str) -> str:
    s = unicodedata.normalize("NFD", name)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def hex_to_hue(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b)
    if mx == mn:
        return 0.0
    d = mx - mn
    if mx == r:
        hue = ((g - b) / d + (6 if g < b else 0)) * 60
    elif mx == g:
        hue = ((b - r) / d + 2) * 60
    else:
        hue = ((r - g) / d + 4) * 60
    return round(hue)


def sepia_m(a):
    s = np.array([[0.393, 0.769, 0.189], [0.349, 0.686, 0.168], [0.272, 0.534, 0.131]])
    return (1 - a) * np.eye(3) + a * s


def sat_m(s):
    lr, lg, lb = 0.2126, 0.7152, 0.0722
    return np.array(
        [
            [lr + (1 - lr) * s, lg * (1 - s), lb * (1 - s)],
            [lr * (1 - s), lg + (1 - lg) * s, lb * (1 - s)],
            [lr * (1 - s), lg * (1 - s), lb + (1 - lb) * s],
        ]
    )


def hue_m(deg):
    c, s = np.cos(np.radians(deg)), np.sin(np.radians(deg))
    return np.array(
        [
            [0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928],
            [0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.140, 0.072 - c * 0.072 - s * 0.283],
            [0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072],
        ]
    )


def strength_label(v: float) -> str:
    return "Strong" if v >= 85 else "Medium" if v >= 60 else "Soft"


def hex_rgb(hex_color: str):
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def tinted_bottle(rgb, alpha, hue):
    m = sat_m(0.8) @ hue_m(hue) @ sepia_m(0.4)
    tinted = np.clip(rgb @ m.T, 0, 1)
    return Image.fromarray(
        (np.concatenate([tinted, alpha], axis=-1) * 255).astype(np.uint8), "RGBA"
    )


def load_products():
    node = subprocess.run(
        [
            "node",
            "-e",
            "import('./storefront/src/data/products.js').then(m => console.log(JSON.stringify("
            "m.products.map(p => ({name: p.name, inspiredBy: p.inspiredBy || '', accords: p.accords || []})))))",
        ],
        capture_output=True,
        text=True,
        cwd=BASE,
        check=True,
    )
    return json.loads(node.stdout)


def render_card(p, rgb, alpha) -> Image.Image:
    img = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)
    accords = sorted(p["accords"], key=lambda a: -a["strength"])[:5]
    dominant = accords[0]["color"] if accords else "#C4A882"

    # ── photo block: tinted bottle on the site's light-gray panel ──
    px0, py0, px1, py1 = 30, 50, 550, 480
    d.rectangle([px0, py0, px1, py1], fill=(245, 243, 240))
    bottle = tinted_bottle(rgb, alpha, hex_to_hue(dominant))
    bh = int((py1 - py0) * 0.86)
    bw = int(bottle.width * bh / bottle.height)
    bottle = bottle.resize((bw, bh), Image.LANCZOS)
    img.paste(bottle, (px0 + ((px1 - px0) - bw) // 2, py0 + ((py1 - py0) - bh) // 2), bottle)

    # ── NOTES column ──
    nx = 580
    d.text((nx, 160), "N O T E S", font=f_notes_hdr, fill=GRAY)
    d.line([nx, 200, nx + 68, 200], fill=LIGHT, width=2)
    y = 225
    for a in accords:
        d.text((nx, y), a["name"], font=f_accord, fill=BLACK)
        d.text((nx, y + 42), strength_label(a["strength"]), font=f_strength, fill=GRAY)
        d.rounded_rectangle([865, y + 8, 965, y + 40], radius=16, fill=hex_rgb(a["color"]))
        y += 100

    # ── divider + inspired by ──
    d.line([40, 1275, 985, 1275], fill=(232, 230, 227), width=2)
    lbl = "Inspired by: "
    d.text((50, 1310), lbl, font=f_inspired_lbl, fill=GRAY)
    lw = d.textlength(lbl, font=f_inspired_lbl)
    d.text((50 + lw + 8, 1306), p["inspiredBy"], font=f_inspired, fill=BLACK)

    d.text((985, 1380), "Designer Scent", font=f_foot_b, fill=BLACK, anchor="ra")
    d.text((985, 1408), "Similar vibe & DNA", font=f_foot, fill=GRAY, anchor="ra")
    return img


def main():
    force = "--force" in sys.argv
    bottle = Image.open(BOTTLE).convert("RGBA")
    rgba = np.asarray(bottle, dtype=np.float64) / 255.0
    rgb, alpha = rgba[..., :3], rgba[..., 3:]

    generated = skipped = 0
    for p in load_products():
        handle = slugify(p["name"])
        out = OUT / f"{handle}.png"
        if handle in PRESERVE or (out.exists() and not force):
            skipped += 1
            continue
        render_card(p, rgb, alpha).save(out, "PNG")
        generated += 1
    print(f"generated {generated}, skipped {skipped}")


if __name__ == "__main__":
    main()
