#!/usr/bin/env python3
"""
ALMAS Product Card Generator
Uses gpt-image-1 with reference image to generate product cards.
Each card matches the reference layout: bottle with ingredients on left,
NOTES panel on right, Inspired By at bottom.
"""

import os
import json
import time
import base64
import subprocess
from pathlib import Path
from openai import OpenAI

# ── Config ──
API_KEY = os.environ.get("OPENAI_API_KEY", "")
BASE_DIR = Path(__file__).parent
REFERENCE_IMG = BASE_DIR / "fd33ddf3-a153-4926-876a-69815e54dc89.png"
OUTPUT_DIR = BASE_DIR / "storefront" / "public" / "products"
PRODUCTS_FILE = BASE_DIR / "storefront" / "src" / "data" / "products.js"

client = OpenAI(api_key=API_KEY)

# ── Liquid color mapping ──
LIQUID_COLORS = {
    "Woody": "dark amber / brown",
    "Oriental": "deep rich amber with reddish tint",
    "Floral": "light golden / pale pink tint",
    "Fresh": "clear pale yellow / almost transparent",
    "Spicy": "rich warm dark amber",
    "Amber": "warm golden amber",
    "Oud": "very dark amber, almost brown-black",
    "Citrus": "clear bright yellow",
    "Aromatic": "light green-amber tint",
    "Gourmand": "warm caramel golden brown",
}

# ── Ingredient visual mapping ──
INGREDIENT_MAP = {
    "Pineapple": "pineapple slice", "Bergamot": "bergamot citrus", "Black Currant": "black currant berries",
    "Apple": "green apple slice", "Birch": "birch bark piece", "Jasmine": "white jasmine flowers",
    "Patchouli": "patchouli leaves", "Rose": "red rose bloom", "Musk": "musk amber stone",
    "Oakmoss": "green oakmoss", "Ambergris": "amber resin", "Vanilla": "vanilla bean pod",
    "Grapefruit": "pink grapefruit half", "Cinnamon": "cinnamon sticks", "Nutmeg": "whole nutmeg",
    "Lavender": "lavender sprig", "Sandalwood": "sandalwood chips", "Vetiver": "vetiver roots",
    "Amber": "golden amber resin", "Rosewood": "rosewood shavings", "Cardamom": "green cardamom pods",
    "Oud": "dark oud wood chips", "Tonka Bean": "tonka beans", "Lemon": "lemon slice",
    "Orange Blossom": "orange blossom", "Pink Pepper": "pink peppercorns", "Iris": "purple iris flower",
    "Saffron": "saffron threads", "Cedar": "cedarwood bark", "Tobacco": "tobacco leaf",
    "Leather": "leather piece", "Geranium": "geranium petals", "Mandarin": "mandarin orange",
    "Tuberose": "white tuberose", "Ylang-Ylang": "ylang-ylang flower", "Peony": "pink peony",
    "Coconut": "coconut half", "Fig": "fresh fig", "Honey": "honeycomb", "Coffee": "coffee beans",
    "Orchid": "white orchid", "Lily": "white lily", "Violet": "violet flowers",
    "Cherry": "dark cherries", "Raspberry": "raspberries", "Peach": "peach slice",
    "Mint": "mint leaves", "Incense": "incense stick", "Myrrh": "myrrh resin",
    "Frankincense": "frankincense tears", "Neroli": "neroli blossoms", "Lime": "lime slice",
    "Orange": "orange slice", "Clove": "whole cloves", "Black Pepper": "black peppercorns",
    "Mango": "mango slice", "Freesia": "freesia flowers", "Benzoin": "benzoin resin",
    "Guaiac Wood": "guaiac wood", "Plum": "ripe plum", "Pear": "pear slice",
    "Magnolia": "magnolia bloom", "Green Tea": "green tea leaves", "Chocolate": "dark chocolate",
    "Caramel": "caramel", "Praline": "praline", "Suede": "suede fabric",
    "Haitian Vetiver": "vetiver roots", "Sea Salt": "sea salt crystals",
    "Sichuan Pepper": "sichuan peppercorns", "Licorice": "licorice root",
}


def parse_products():
    result = subprocess.run(
        ["node", "-e",
         f"const {{ products }} = require('{PRODUCTS_FILE}'); console.log(JSON.stringify(products));"],
        capture_output=True, text=True, cwd=str(PRODUCTS_FILE.parent)
    )
    if result.returncode != 0:
        raise ValueError(f"Parse error: {result.stderr}")
    return json.loads(result.stdout)


def get_ingredient(note):
    return INGREDIENT_MAP.get(note, note.lower())


def strength_label(s):
    if s >= 85: return "Strong"
    if s >= 65: return "Medium"
    return "Light"


def build_prompt(product):
    liquid = LIQUID_COLORS.get(product.get("scentFamily", "Woody"), "light amber")

    # Get 4-5 ingredient visuals
    all_notes = (product.get("notes", {}).get("top", []) +
                 product.get("notes", {}).get("heart", []) +
                 product.get("notes", {}).get("base", []))
    ingredients = [get_ingredient(n) for n in all_notes[:5]]
    ingredients_str = ", ".join(ingredients)

    # Build notes section text
    accords = product.get("accords", [])[:5]
    notes_lines = []
    for a in accords:
        notes_lines.append(f'"{a["name"]}" labeled "{strength_label(a["strength"])}" with a rounded pill bar in color {a["color"]}')
    notes_desc = "; ".join(notes_lines)

    inspired = product.get("inspiredBy", "")

    prompt = (
        f"Generate a product card image that matches the reference image EXACTLY in layout and style. "
        f"The card must have:\n\n"
        f"LEFT SIDE (takes ~55% of width):\n"
        f"- A luxury rectangular glass perfume bottle with a black matte cap\n"
        f"- The bottle is labeled 'ALMAS' in serif font, Arabic text 'الماس' below, and 'EAU DE PARFUM' at the bottom\n"
        f"- The liquid inside is {liquid}\n"
        f"- At the bottom-left base of the bottle, arrange these REAL photorealistic ingredients: {ingredients_str}\n"
        f"- The ingredients sit naturally on the white surface around the bottle base\n\n"
        f"RIGHT SIDE (takes ~40% of width):\n"
        f"- Header text 'NOTES' in uppercase gray with an underline\n"
        f"- Below, list these notes vertically with spacing between each:\n"
        f"  {notes_desc}\n"
        f"- Each note shows the name in bold black, strength text in smaller gray below, and a thick rounded colored pill/bar to the right\n\n"
        f"BOTTOM SECTION (separated by a thin gray line):\n"
        f"- Left: italic text 'Inspired by:' followed by bold text '{inspired}' in large serif font\n"
        f"- Right: a small thumbnail image of the original {inspired} designer perfume bottle\n"
        f"- Next to it: 'Designer Scent' in bold and 'Similar vibe & DNA' in small gray text\n\n"
        f"STYLE: White/off-white background, clean editorial product photography, professional, magazine quality. "
        f"The layout, proportions, and typography must match the reference image exactly."
    )
    return prompt


def generate_card(product, ref_image_b64, retries=3):
    pid = product["id"]
    name = product["name"]
    slug = name.lower().replace(" ", "-").replace("'", "").replace("é", "e")
    output_path = OUTPUT_DIR / f"{slug}.png"

    if output_path.exists():
        print(f"  ⏭  #{pid} {name} — exists, skipping")
        return True

    prompt = build_prompt(product)

    for attempt in range(retries):
        try:
            print(f"  🎨 #{pid} {name} — generating (attempt {attempt + 1})...")

            result = client.images.edit(
                model="gpt-image-1",
                image=REFERENCE_IMG.open("rb"),
                prompt=prompt,
                size="1024x1536",
                quality="medium",
                n=1,
            )

            image_data = base64.b64decode(result.data[0].b64_json)
            output_path.write_bytes(image_data)
            print(f"  ✅ #{pid} {name} — saved")
            return True

        except Exception as e:
            err = str(e)
            print(f"  ❌ #{pid} {name} — error: {err[:120]}")
            if "rate_limit" in err.lower() or "429" in err:
                wait = 30 * (attempt + 1)
                print(f"     Rate limited, waiting {wait}s...")
                time.sleep(wait)
            elif "content_policy" in err.lower():
                print(f"     Content policy, skipping")
                return False
            elif attempt < retries - 1:
                time.sleep(5)
            else:
                return False
    return False


def main():
    if not API_KEY:
        print("❌ Set OPENAI_API_KEY")
        return

    if not REFERENCE_IMG.exists():
        print(f"❌ Reference image not found: {REFERENCE_IMG}")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load reference image
    print(f"📸 Reference: {REFERENCE_IMG.name}")
    ref_b64 = base64.b64encode(REFERENCE_IMG.read_bytes()).decode()

    # Parse products
    print("📦 Parsing products...")
    products = parse_products()
    print(f"   Found {len(products)} products\n")

    success = 0
    failed = 0
    failed_list = []

    for i, product in enumerate(products):
        print(f"\n[{i+1}/{len(products)}]")
        result = generate_card(product, ref_b64)
        if result:
            success += 1
        else:
            failed += 1
            failed_list.append(product["name"])

        # Delay between requests
        if result and i < len(products) - 1:
            time.sleep(2)

    print(f"\n{'='*50}")
    print(f"✅ Generated: {success}")
    print(f"❌ Failed: {failed}")
    if failed_list:
        print(f"   Failed: {', '.join(failed_list)}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
