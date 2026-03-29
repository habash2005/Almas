#!/usr/bin/env python3
"""
ALMAS Product Image Generator
Generates product images for all 143 fragrances using OpenAI gpt-image-1.
"""

import os
import json
import time
import base64
from pathlib import Path
from openai import OpenAI

# ── Config ──
API_KEY = os.environ.get("OPENAI_API_KEY", "")
OUTPUT_DIR = Path(__file__).parent / "storefront" / "public" / "products"
PRODUCTS_FILE = Path(__file__).parent / "storefront" / "src" / "data" / "products.js"

client = OpenAI(api_key=API_KEY)

# ── Liquid color mapping based on scent family ──
LIQUID_COLORS = {
    "Woody": "dark amber",
    "Oriental": "deep rich amber",
    "Floral": "light golden",
    "Fresh": "clear pale yellow",
    "Spicy": "rich warm amber",
    "Amber": "warm golden amber",
    "Oud": "deep dark amber with brown tint",
    "Citrus": "clear light yellow",
    "Aromatic": "light amber",
    "Gourmand": "warm golden caramel amber",
}

# ── Note-to-ingredient visual mapping ──
INGREDIENT_MAP = {
    "Pineapple": "fresh pineapple slice",
    "Bergamot": "bergamot citrus fruit",
    "Black Currant": "black currant berries",
    "Apple": "green apple slice",
    "Birch": "birch bark piece",
    "Jasmine": "white jasmine flowers",
    "Patchouli": "patchouli leaves",
    "Rose": "red rose bloom",
    "Musk": "smooth musk stone",
    "Oakmoss": "green oakmoss",
    "Ambergris": "amber resin chunk",
    "Vanilla": "vanilla bean pod",
    "Grapefruit": "pink grapefruit half",
    "Cinnamon": "cinnamon sticks",
    "Nutmeg": "whole nutmeg",
    "Lavender": "lavender sprig",
    "Licorice": "licorice root",
    "Sandalwood": "sandalwood chips",
    "Vetiver": "vetiver grass roots",
    "Amber": "golden amber resin",
    "Rosewood": "rosewood shavings",
    "Cardamom": "green cardamom pods",
    "Sichuan Pepper": "sichuan peppercorns",
    "Oud": "dark oud wood chips",
    "Tonka Bean": "tonka beans",
    "Lemon": "lemon slice",
    "Orange Blossom": "orange blossom flowers",
    "Pink Pepper": "pink peppercorns",
    "Iris": "purple iris flower",
    "Saffron": "saffron threads",
    "Cedar": "cedarwood bark",
    "Cedarwood": "cedarwood bark",
    "Tobacco": "dried tobacco leaf",
    "Leather": "leather strip",
    "Geranium": "geranium petals",
    "Mandarin": "mandarin orange",
    "Tuberose": "white tuberose flower",
    "Ylang-Ylang": "ylang-ylang flower",
    "Peony": "pink peony bloom",
    "White Musk": "white musk stone",
    "Coconut": "coconut half",
    "Fig": "fresh fig halved",
    "Honey": "honeycomb piece",
    "Chocolate": "dark chocolate pieces",
    "Coffee": "roasted coffee beans",
    "Caramel": "caramel drizzle",
    "Orchid": "white orchid bloom",
    "Lily": "white lily flower",
    "Magnolia": "magnolia bloom",
    "Violet": "violet flowers",
    "Cherry": "dark cherries",
    "Raspberry": "fresh raspberries",
    "Peach": "peach slice",
    "Plum": "ripe plum",
    "Pear": "pear slice",
    "Mint": "fresh mint leaves",
    "Basil": "basil leaves",
    "Green Tea": "green tea leaves",
    "Incense": "incense smoke wisp",
    "Myrrh": "myrrh resin",
    "Frankincense": "frankincense resin tears",
    "Haitian Vetiver": "vetiver roots",
    "Sea Salt": "sea salt crystals",
    "Suede": "suede fabric",
    "Neroli": "neroli orange blossoms",
    "Lime": "lime slice",
    "Orange": "orange slice",
    "Clove": "whole cloves",
    "Black Pepper": "black peppercorns",
    "White Flowers": "white flower petals",
    "Mango": "mango slice",
    "Litchi": "lychee fruit",
    "Freesia": "freesia flowers",
    "Praline": "praline nuts",
    "Benzoin": "benzoin resin",
    "Labdanum": "labdanum resin",
    "Agarwood": "agarwood chips",
    "Elemi": "elemi resin",
    "Guaiac Wood": "guaiac wood chips",
    "Papyrus": "papyrus reed",
}


def get_ingredient_visual(note_name):
    return INGREDIENT_MAP.get(note_name, note_name.lower())


def parse_products():
    """Parse the products.js file and extract product data."""
    content = PRODUCTS_FILE.read_text()

    # Extract the array content between the first [ and the matching ]
    start = content.find("export const products = [")
    if start == -1:
        raise ValueError("Could not find products array")

    # Use a simple JS-to-JSON approach via node
    import subprocess
    result = subprocess.run(
        ["node", "-e", f"""
        const {{ products }} = require('{PRODUCTS_FILE}');
        console.log(JSON.stringify(products));
        """],
        capture_output=True, text=True, cwd=str(PRODUCTS_FILE.parent)
    )
    if result.returncode != 0:
        raise ValueError(f"Failed to parse products: {result.stderr}")

    return json.loads(result.stdout)


def build_prompt(product):
    """Build the image generation prompt for a single product."""
    liquid_color = LIQUID_COLORS.get(product.get("scentFamily", "Woody"), "light amber")

    # Get top 4 ingredient visuals from all notes
    all_notes = (
        product.get("notes", {}).get("top", []) +
        product.get("notes", {}).get("heart", []) +
        product.get("notes", {}).get("base", [])
    )
    ingredients = [get_ingredient_visual(n) for n in all_notes[:4]]
    ingredients_str = ", ".join(ingredients)

    prompt = (
        f'Professional product photography of a luxury glass perfume bottle on a clean white background. '
        f'The bottle is rectangular with a black matte cap, labeled "ALMAS" and Arabic text "الماس" with "EAU DE PARFUM" below. '
        f'The liquid inside the bottle is {liquid_color}. '
        f'At the bottom-left base of the bottle, arrange these real ingredients naturally: {ingredients_str}. '
        f'The ingredients should look fresh and photorealistic, sitting on the surface beside the bottle base. '
        f'Soft natural lighting from the upper left, subtle shadow on the right. '
        f'Clean editorial product photography style, high-end fragrance advertising. '
        f'White/cream background, no text overlay, no borders. Photorealistic, magazine quality.'
    )
    return prompt


def generate_image(product, retries=3):
    """Generate a single product image."""
    product_id = product["id"]
    product_name = product["name"]
    slug = product_name.lower().replace(" ", "-").replace("'", "")
    output_path = OUTPUT_DIR / f"{slug}.png"

    # Skip if already generated
    if output_path.exists():
        print(f"  ⏭  #{product_id} {product_name} — already exists, skipping")
        return True

    prompt = build_prompt(product)

    for attempt in range(retries):
        try:
            print(f"  🎨 #{product_id} {product_name} — generating (attempt {attempt + 1})...")
            result = client.images.generate(
                model="gpt-image-1",
                prompt=prompt,
                size="1024x1536",
                quality="medium",
                n=1,
            )

            # Save the image
            image_data = base64.b64decode(result.data[0].b64_json)
            output_path.write_bytes(image_data)
            print(f"  ✅ #{product_id} {product_name} — saved to {output_path.name}")
            return True

        except Exception as e:
            error_msg = str(e)
            print(f"  ❌ #{product_id} {product_name} — error: {error_msg}")
            if "rate_limit" in error_msg.lower() or "429" in error_msg:
                wait = 30 * (attempt + 1)
                print(f"     Rate limited, waiting {wait}s...")
                time.sleep(wait)
            elif "content_policy" in error_msg.lower():
                print(f"     Content policy issue, skipping.")
                return False
            elif attempt < retries - 1:
                time.sleep(5)
            else:
                return False

    return False


def main():
    if not API_KEY:
        print("❌ OPENAI_API_KEY not set!")
        return

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Parse products
    print("📦 Parsing products...")
    products = parse_products()
    print(f"   Found {len(products)} products\n")

    # Generate images
    success = 0
    failed = 0
    skipped = 0

    for i, product in enumerate(products):
        print(f"\n[{i + 1}/{len(products)}]")
        result = generate_image(product)
        if result:
            success += 1
        else:
            failed += 1

        # Small delay between requests to avoid rate limits
        if result and i < len(products) - 1:
            time.sleep(2)

    print(f"\n{'=' * 50}")
    print(f"✅ Generated: {success}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
