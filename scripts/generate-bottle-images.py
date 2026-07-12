#!/usr/bin/env python3
"""Generate product images matching the storefront's tinted-bottle aesthetic.

The site renders every product as bottle-transparent.png with the CSS filter
`sepia(0.4) hue-rotate(Xdeg) saturate(0.8)`, where X derives from the hue of
the product's strongest accord color (see ProductCard.jsx). This script bakes
the identical transform into real PNGs so Shopify admin/channels show the
same artwork customers see on the site.

Usage: python3 scripts/generate-bottle-images.py
Writes storefront/public/products/<handle>.png (skips files that exist).
"""

import json
import re
import subprocess
import unicodedata
from pathlib import Path

import numpy as np
from PIL import Image

BASE = Path(__file__).resolve().parent.parent
BOTTLE = BASE / "storefront/public/images/bottle-transparent.png"
OUT = BASE / "storefront/public/products"
CANVAS = 1200
BG = (250, 250, 250)  # site warm white #FAFAFA


def slugify(name: str) -> str:
    s = unicodedata.normalize("NFD", name)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9]+", "-", s.lower())
    return s.strip("-")


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


def sepia_matrix(a: float) -> np.ndarray:
    s = np.array(
        [
            [0.393, 0.769, 0.189],
            [0.349, 0.686, 0.168],
            [0.272, 0.534, 0.131],
        ]
    )
    return (1 - a) * np.eye(3) + a * s


def saturate_matrix(s: float) -> np.ndarray:
    lr, lg, lb = 0.2126, 0.7152, 0.0722
    return np.array(
        [
            [lr + (1 - lr) * s, lg * (1 - s), lb * (1 - s)],
            [lr * (1 - s), lg + (1 - lg) * s, lb * (1 - s)],
            [lr * (1 - s), lg * (1 - s), lb + (1 - lb) * s],
        ]
    )


def hue_rotate_matrix(deg: float) -> np.ndarray:
    c, s = np.cos(np.radians(deg)), np.sin(np.radians(deg))
    return np.array(
        [
            [0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928],
            [0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.140, 0.072 - c * 0.072 - s * 0.283],
            [0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072],
        ]
    )


def load_products() -> list[dict]:
    node = subprocess.run(
        [
            "node",
            "-e",
            "import('./storefront/src/data/products.js').then(m => "
            "console.log(JSON.stringify(m.products.map(p => ({name: p.name, accords: p.accords || []})))))",
        ],
        capture_output=True,
        text=True,
        cwd=BASE,
        check=True,
    )
    return json.loads(node.stdout)


def main() -> None:
    bottle = Image.open(BOTTLE).convert("RGBA")
    rgba = np.asarray(bottle, dtype=np.float64) / 255.0
    rgb, alpha = rgba[..., :3], rgba[..., 3:]

    generated = skipped = 0
    for p in load_products():
        out = OUT / f"{slugify(p['name'])}.png"
        if out.exists():
            skipped += 1
            continue
        accords = p["accords"]
        dominant = max(accords, key=lambda a: a["strength"])["color"] if accords else "#C4A882"
        hue = hex_to_hue(dominant)
        # CSS filter order: sepia(0.4) -> hue-rotate(hue) -> saturate(0.8)
        m = saturate_matrix(0.8) @ hue_rotate_matrix(hue) @ sepia_matrix(0.4)
        tinted = np.clip(rgb @ m.T, 0, 1)
        img = Image.fromarray((np.concatenate([tinted, alpha], axis=-1) * 255).astype(np.uint8), "RGBA")

        # compose on square canvas, bottle at ~72% of canvas height
        target_h = int(CANVAS * 0.72)
        scale = target_h / img.height
        img = img.resize((int(img.width * scale), target_h), Image.LANCZOS)
        canvas = Image.new("RGBA", (CANVAS, CANVAS), BG + (255,))
        canvas.alpha_composite(img, ((CANVAS - img.width) // 2, (CANVAS - img.height) // 2))
        canvas.convert("RGB").save(out, "PNG")
        generated += 1

    print(f"generated {generated}, skipped {skipped} existing")


if __name__ == "__main__":
    main()
