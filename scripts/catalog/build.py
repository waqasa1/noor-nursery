#!/usr/bin/env python3
"""
Convert the source spreadsheets in scripts/catalog/source/ into scripts/catalog/catalog.json.

  python3 scripts/catalog/build.py

Requires:  pip install openpyxl pyxlsb

The source spreadsheets are the source of truth. This script only normalises
spelling, builds display names, and maps rows onto the Product/Category schema.
Urdu text lives separately in urdu.json (keyed by slug) so it can be edited
without re-running the conversion.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "source"
OUT = HERE / "catalog.json"

PLACEHOLDER = "/placeholder-plant.jpg"
DEFAULT_STOCK = 20

# --------------------------------------------------------------------------
# Categories
# --------------------------------------------------------------------------

# key -> (nameEn, slug, descriptionEn, image, sortOrder, defaults)
PLANT_CATEGORY_DEFAULTS = {
    "fruit": dict(sunlight="direct", watering="medium", difficulty="moderate", suitability="outdoor"),
    "flowering": dict(sunlight="direct", watering="medium", difficulty="easy", suitability="outdoor"),
    "indoor": dict(sunlight="medium", watering="medium", difficulty="easy", suitability="indoor"),
    "decorating": dict(sunlight="medium", watering="medium", difficulty="easy", suitability="indoor"),
    "vines": dict(sunlight="bright", watering="medium", difficulty="moderate", suitability="both"),
    "herbs": dict(sunlight="bright", watering="medium", difficulty="easy", suitability="both"),
    "trees": dict(sunlight="direct", watering="medium", difficulty="moderate", suitability="outdoor"),
    "accessory": dict(sunlight="medium", watering="low", difficulty="easy", suitability="both"),
}

PLANT_CATEGORIES = [
    dict(
        key="fruit",
        sheet="Fruit plants",
        nameEn="Fruit Plants",
        slug="fruit-plants",
        descriptionEn="Grafted and desi fruit plants — mango, guava, citrus, chikoo and more, ready to fruit.",
        image="https://lh3.googleusercontent.com/aida-public/AB6AXuCIJWq8qmlMGB60V7iIX5Muqh7EwZUHKftXQkymG7hc7OsRMYvhchAiqdB2PZCX1LgRwF_tYZT57ysv4xE5cu7dqFuiWUTl_SRfyAWaXQI0yQiv_YBGeizU88UBuY2WWfk-E_e3-N4nQkaotf_i0Tppfri7MWlRGrF_T_Mb-2vpnCOErTezztBlwMYzNmiCAFMZ3f6Efs_JW1qyRi1daDL7cyb79GapSMw8KK4XCSDshjEXwuy6URQe",
        sortOrder=1,
    ),
    dict(
        key="flowering",
        sheet="FLOWERING PLANT",
        nameEn="Flowering Plants",
        slug="flowering-plants",
        descriptionEn="Fragrant and colourful flowering plants for lawns, balconies and verandas.",
        image="https://lh3.googleusercontent.com/aida-public/AB6AXuD6OFVs1DDcnhMLyX6BMxEshCht4ZN5SjFDN5lmf1RCH8qjPW3EXY5-jF5WSmyEGC9AhXwZ4z7heb0eF6-CTxBrFgVzgqddBjHTPf8-7HcupiU-50buLqrIYf-fwpnqb1lkK2kIHrM--zyES9ltOC1kCVLyAmZXu89iQWm6tEsoSSqybCNgYazDs7UURfw6YkudNP2iilFBYIhCRzK8j4zsEn1hcP4Poku1T-XO3kzsRAlQVfIxwnfb",
        sortOrder=2,
    ),
    dict(
        key="indoor",
        sheet="indore plant",
        nameEn="Indoor Plants",
        slug="indoor-plants",
        descriptionEn="Low-light tolerant indoor plants for homes and offices.",
        image="https://lh3.googleusercontent.com/aida-public/AB6AXuByV_axm2KaqUDasUrNnKQT27cdhWVt_0rL5bxknk_EBOJ93u1KzHd-sLLYxiyhqyYXg35L4knA9SNDpCPYR7Cv5n4axw-l97B__86oRlcO3M-vpfum0-oL-3bb-oJFqfJ8QdU-ZYYKsU8A6l7pCPgvKO_2cvL8eySFJYnaZU_6qDcxORsDf-XuLlyzRswItrP9RhVeehhz51_YxcWifSX_VTpP2QM_jeJj2OhEqCEYGXUudXazylu3",
        sortOrder=3,
    ),
    dict(
        key="decorating",
        sheet="decorating plant",
        nameEn="Decorative Plants",
        slug="decorative-plants",
        descriptionEn="Statement foliage and sculptural plants chosen for shape, colour and texture.",
        image="",
        sortOrder=4,
    ),
    dict(
        key="vines",
        sheet="Bail's and wine",
        nameEn="Vines and Creepers",
        slug="vines-creepers",
        descriptionEn="Climbing and creeping plants for walls, arches, fences and hanging baskets.",
        image="https://lh3.googleusercontent.com/aida-public/AB6AXuDsOUq0WlDP3soMfAqGdd9ape2tZk8PP0UQHGsnZ_UlN2FG_mz5opn7jWspdrjcmEKZEQ0IpxnJAMhO0i_XcuUYrf79dQmwKXJFGbFgm9w7CWhtfvOJOQtTcY_y6AMI-OccItBhiTgOYRuzkrFS5YtOwVHaSy81ihnChv-6BfcVVKdj80hz7KROw-t3CPcZftXp76bZsMctVjLFCHBRui_55yOIbbng1MZ-OakmYe6wGKueVbqjLIlh",
        sortOrder=5,
    ),
    dict(
        key="herbs",
        sheet="herbs and Medicenal plant",
        nameEn="Herbs and Medicinal Plants",
        slug="herbs",
        descriptionEn="Kitchen herbs and medicinal plants — tulsi, lavender, aloe vera, ajwain and more.",
        image="https://lh3.googleusercontent.com/aida-public/AB6AXuDPa3ki2n4skgE_RET9vAysZ-XUNyIOikix1PnFfLKqWjplsCBA3-0oQfJr1-DeIs-ClM6PgtbNz43BkhSNqsvs4pXlboAjylpfj7a65PZgYxMeYCIgpTKuWSXzS1LtnvCmU3kOFasduazVDEkScVJLWH8KcBJnKHSy8UHF8IEQI23G4jU4WsBEbpQ1-u6gBvE6IJj3ywL1xuJhJyhEZsZSWTHaBl5jtgcEL0koW4HVqJsSm3B-3vj2",
        sortOrder=6,
    ),
    dict(
        key="trees",
        sheet="Trees",
        nameEn="Trees",
        slug="trees",
        descriptionEn="Shade, flowering and ornamental trees for gardens and open ground.",
        image="",
        sortOrder=7,
    ),
]

ACCESSORY_CATEGORIES = [
    dict(
        key="fertilizers",
        nameEn="Fertilizers and Soil",
        slug="fertilizers-soil",
        descriptionEn="Fertilizers, composts, potting media and soil conditioners.",
        image="https://lh3.googleusercontent.com/aida-public/AB6AXuBsoWRag7-EJ2-q8ZiL7SkvUbnRCNh4slS9nSzmuYxDNiFBtApyXXU8e2q-2uOuPgG7kflJLvO4h799ZKhhUIWM_iSNWxR7zmJnnJeX4NbeNAzZMZErLCJHARLhpW1uo9MAyF0L54Om7kVacC2xttjD64N6pxQ7n_ra0Sdwuaal8p9oQG3kaSxUV57LppxtDgbOuwAtSjXxcZtiwb-NVb6SV8hLIaGOxs_9M6n6wAAHW3jpVsN9OzJw",
        sortOrder=8,
    ),
    dict(
        key="pest",
        nameEn="Pest and Disease Control",
        slug="pest-control",
        descriptionEn="Insecticides, fungicides and organic protection for healthy plants.",
        image="",
        sortOrder=9,
    ),
    dict(
        key="pots",
        nameEn="Pots and Planters",
        slug="pots-planters",
        descriptionEn="Plastic, sand, fibre, hanging and self-watering pots in every size.",
        image="https://lh3.googleusercontent.com/aida-public/AB6AXuDrc6qhq4qy4QkuMgt5AKelCkvR11SqI61GzZ1cq_lyED27yST2LePUDZjY15Tw5ZlH2EQc0dUf8RDu76BqwlO5lqWoAOCsJFZUWe4CINxLIM8JqOJPQAfbi2F0hUfnu_-xGbSfghrFhG31WAyYvGx4T3A2tIGsDLUBKv1dVQx7DNVSlbjbrXAffCYRrNpShW20PS7d_iVTLf9ljdGAbpkBwsIWZjNOqveb9x7n3v-b5CI34qvZym9E",
        sortOrder=10,
    ),
    dict(
        key="tools",
        nameEn="Tools and Equipment",
        slug="tools-equipment",
        descriptionEn="Cutting tools, shears, spades and complete gardening kits.",
        image="",
        sortOrder=11,
    ),
    dict(
        key="watering",
        nameEn="Watering and Sprayers",
        slug="watering-sprayers",
        descriptionEn="Water cans, spray guns, showers and foggers for daily plant care.",
        image="",
        sortOrder=12,
    ),
]

# accessory name (lowercased, normalised) -> category key
ACCESSORY_GROUPS = {
    "fertilizers": [
        "roots and bloom", "cocopeat", "vermi compost", "organic compost", "leaf compost",
        "bone meal", "blood meal", "fish meal", "neem cake", "mustard cake", "coconut food",
        "mix potting soil", "dap", "npk", "urea", "grow more 20-20", "epsom salt",
        "plant booster", "color booster", "rooting cutting powder",
    ],
    "pest": ["soil insect killer", "fungicide", "neem oil"],
    "pots": [
        "self watering pot", "fiber pot", "fiber vase", "plastic pots", "sand pots",
        "hanging pots", "wall pot",
    ],
    "tools": ["cutter", "plant scissor", "tool kit", "spade / balcha", "axe"],
    "watering": ["spray", "water can", "2 in 1 spray gun", "spray gun", "pipe shower", "fog"],
}

SIZE_CYCLE = {1: ["small"], 2: ["small", "large"], 3: ["small", "medium", "large"],
              4: ["small", "medium", "large", "xlarge"],
              5: ["small", "medium", "large", "xlarge", "xxlarge"]}
SIZE_LABEL_UR = {"small": "چھوٹا", "medium": "درمیانہ", "large": "بڑا",
                 "xlarge": "بڑا زیادہ", "xxlarge": "سب سے بڑا"}

# --------------------------------------------------------------------------
# Spelling — curated, high-confidence corrections only
# --------------------------------------------------------------------------

# matched case-insensitively against the whole name string
NAME_FIXES = [
    (r"\bhybird\b", "Hybrid"),
    (r"\bchonsa\b", "Chaunsa"),
    (r"\banwarretol\b", "Anwar Ratol"),
    (r"\blargra\b", "Langra"),
    (r"\bsitresss\b", "Citrus"),
    (r"\bavocada\b", "Avocado"),
    (r"\bdragon friut\b", "Dragon Fruit"),
    (r"\bjack friut\b", "Jack Fruit"),
    (r"\bstrawbery\b", "Strawberry"),
    (r"\bseed less\b", "Seedless"),
    (r"\blechee\b", "Lychee"),
    (r"\bkamkat\b", "Kumquat"),
    (r"\bturkish injeer\b", "Turkish Anjeer"),
    (r"\bjumgle\b", "Jungle"),
    (r"\belichi\b", "Elaichi"),
    (r"\bhabiscus\b", "Hibiscus"),
    (r"\balobhukarah\b", "Aloo Bukhara"),
    (r"\beglonima\b", "Aglaonema"),
    (r"\bdiffene\b", "Dieffenbachia"),
    (r"\bmonestaria\b", "Monstera"),
    (r"\bphilorendildron\b", "Philodendron"),
    (r"\bfurn\b", "Fern"),
    (r"\bpara graas\b", "Para Grass"),
    (r"\bbhugain bhai\b", "Bougainvillea"),
    (r"\bbhugainbail\b", "Bougainvillea"),
    (r"\byelow\b", "Yellow"),
    (r"\byelllow\b", "Yellow"),
    (r"\bsirilankan\b", "Sri Lankan"),
    (r"\blevender\b", "Lavender"),
    (r"\bstivia\b", "Stevia"),
    (r"\bmargenata\b", "Marginata"),
    (r"\bspirial\b", "Spiral"),
    (r"\bjate plant\b", "Jade Plant"),
    (r"\bpattle\b", "Petal"),
    (r"\bfloowering\b", "Flowering"),
    (r"\bfragness\b", "Fragrance"),
    (r"\baviliable\b", "Available"),
    (r"\bwhie\b", "White"),
    (r"\bRose Marry\b", "Rosemary"),
    (r"\bpieace lili\b", "Peace Lily"),
    (r"\bsingonium\b", "Syngonium"),
    (r"\bmalasian palm\b", "Malaysian Palm"),
    (r"\bfoxtell palm\b", "Foxtail Palm"),
    (r"\bbonsia ficus\b", "Bonsai Ficus"),
    (r"\bgreel ficus\b", "Green Ficus"),
    (r"\bcolius\b", "Coleus"),
    (r"\barruceria\b", "Araucaria"),
    (r"\bcorton\b", "Croton"),
    (r"\bturmpet\b", "Trumpet"),
    (r"\balmanda\b", "Allamanda"),
    (r"\blagistonia\b", "Lagerstroemia"),
    (r"\bkannar\b", "Kaner"),
    (r"\bchamblali\b", "Chameli"),
    (r"\bmarwa\b", "Marwa"),
    (r"\bhabiscus\b", "Hibiscus"),
    (r"\bcrispy\b", "Crispy"),
    (r"\bcasinodossa\b", "Casinodossa"),
    (r"\bindinum jampa\b", "Indian Champa"),
    (r"\bjaccranda\b", "Jacaranda"),
    (r"\btabbobiya\b", "Tabebuia"),
    (r"\btabobia\b", "Tabebuia"),
    (r"\bpilkan\b", "Pilkhan"),
    (r"\bpepal\b", "Peepal"),
    (r"\bulta shock\b", "Ulta Shok"),
    (r"\bshareefa\b", "Shareefa"),
    (r"\bpapita\b", "Papita"),
    (r"\bfalsa\b", "Falsa"),
    (r"\bkaronda\b", "Karonda"),
    (r"\bnashpati\b", "Nashpati"),
    (r"\bkhubani\b", "Khubani"),
    (r"\banjeer\b", "Anjeer"),
    (r"\banar\b", "Anar"),
    (r"\belichi\b", "Elaichi"),
    (r"\bmulberry\b", "Mulberry"),
    (r"\bamrood\b", "Amrood"),
    (r"\bgola\b", "Gola"),
    (r"\bsuri\b", "Suri"),
    (r"\bthi\b", "Thai"),
    (r"\bcheko\b", "Cheko"),
    (r"\bbair\b", "Bair"),
    (r"\bjaman\b", "Jaman"),
    (r"\bnarangi\b", "Narangi"),
    (r"\bmosambi\b", "Mosambi"),
    (r"\bmalta\b", "Malta"),
    (r"\bkino\b", "Kino"),
    (r"\banwar\b", "Anwar"),
    (r"\bratatol\b", "Ratol"),
    (r"\bsindri\b", "Sindri"),
    (r"\bangore\b", "Angoor"),
    (r"\bzaitoon\b", "Zaitoon"),
    (r"\boliv\b", "Olive"),
    (r"\bnariyal\b", "Nariyal"),
    (r"\bshatoot\b", "Shatoot"),
    (r"\bmorpankh\b", "Morpankh"),
    (r"\bgul e duadi\b", "Gul-e-Duadi"),
    (r"\bratkirani\b", "Raat Ki Rani"),
    (r"\braatkirani\b", "Raat Ki Rani"),
    (r"\bjesmine\b", "Jasmine"),
    (r"\bmotiya\b", "Motiya"),
    (r"\balzohra\b", "Al-Zohra"),
    (r"\bamal tass\b", "Amaltas"),
    (r"\bcasinodossa\b", "Casinodossa"),
    (r"\bsada bahar\b", "Sada Bahar"),
    (r"\bdin ka raja\b", "Din Ka Raja"),
    (r"\bshahzadi\b", "Shahzadi"),
    (r"\bhuss\b", "Huss"),
    (r"\bfuerte\b", "Fuerte"),
    (r"\bsunder khani\b", "Sunder Khani"),
    (r"\bkhandari\b", "Khandari"),
    (r"\bred lady\b", "Red Lady"),
    (r"\bhibiscus\b", "Hibiscus"),
    (r"\bhbaniscus\b", "Hibiscus"),
    # accessories
    (r"\bmustrad cake\b", "Mustard Cake"),
    (r"\bmix poting soil\b", "Mix Potting Soil"),
    (r"\brooting cuting powder\b", "Rooting Cutting Powder"),
    (r"\bfungaside\b", "Fungicide"),
    (r"\bUria\b", "Urea"),
    (r"\bcuter\b", "Cutter"),
    (r"\bplant siser\b", "Plant Scissor"),
    (r"\bspead\s*/\s*balcha\b", "Spade / Balcha"),
    (r"\beax\b", "Axe"),
    (r"\bspary gun\b", "Spray Gun"),
    (r"\bfiber waz\b", "Fiber Vase"),
    (r"\bleave compost\b", "Leaf Compost"),
    (r"\bgrow more 20 20\b", "Grow More 20-20"),
    (r"\broots and bloom\b", "Roots and Bloom"),
    (r"\bvermi compost\b", "Vermi Compost"),
    (r"\bself watering pot\b", "Self Watering Pot"),
    (r"\b2 in 1 spray gun\b", "2 in 1 Spray Gun"),
]

# whole-word fixes applied to English descriptions (sheet typos)
DESC_FIXES = [
    (r"\bhieght\b", "height"), (r"\bhight\b", "height"), (r"\bhgiht\b", "height"),
    (r"\bhigth\b", "height"), (r"\bhght\b", "height"), (r"\bfhhight\b", "height"),
    (r"\bfthight\b", "ft"), (r"\bhieght3\b", "height 3"),
    (r"\bfriut\b", "fruit"), (r"\bfriuts\b", "fruits"),
    (r"\bfriuting\b", "fruiting"), (r"\bfriting\b", "fruiting"),
    (r"\bfrruiting\b", "fruiting"), (r"\bfhruting\b", "fruiting"),
    (r"\bfiuting\b", "fruiting"), (r"\bfruiying\b", "fruiting"),
    (r"\bfrist\b", "first"), (r"\bfruting\b", "fruiting"),
    (r"\bhelth\b", "health"), (r"\bhealty\b", "healthy"), (r"\bhelthy\b", "healthy"),
    (r"\bmeature\b", "mature"), (r"\bmeture\b", "mature"),
    (r"\boctuber\b", "October"), (r"\bpalnt\b", "plant"),
    (r"\bafetr\b", "after"), (r"\bafte\b", "after"), (r"\bfter\b", "after"),
    (r"\bfrangness\b", "fragrance"), (r"\bfregness\b", "fragrance"),
    (r"\bpregness\b", "fragrance"), (r"\bfrengness\b", "fragrance"),
    (r"\bperpose\b", "purpose"), (r"\bpurpase\b", "purpose"),
    (r"\bdesing\b", "design"), (r"\bavilable\b", "available"),
    (r"\baviliable\b", "available"), (r"\bclorfull\b", "colourful"),
    (r"\bcolourfull\b", "colourful"), (r"\bmultipul\b", "multiple"),
    (r"\bnovemeber\b", "November"), (r"\bmonthes\b", "months"),
    (r"\bhight\b", "height"), (r"\bthiree\b", "three"),
]

ACRONYMS = {"dap", "npk", "zz", "n joy", "pkr"}


# --------------------------------------------------------------------------

def squash(text: str) -> str:
    return re.sub(r"\s+", " ", str(text)).strip()


def fix_words(text: str) -> str:
    """Fix obvious typos in free text, preserving capitalisation of the first letter."""
    out = squash(text)
    for pattern, repl in DESC_FIXES:
        out = re.sub(pattern, repl, out, flags=re.IGNORECASE)
    out = re.sub(r"(\d)\s*to\s*(\d)", r"\1 to \2", out)
    out = re.sub(r"\bheight\s*(\d)", r"height \1", out)
    out = re.sub(r"(\d)\s*ft\b", r"\1 ft", out)
    out = re.sub(r"\s+([,.;:])", r"\1", out)
    out = re.sub(r",(?=\S)", ", ", out)
    out = re.sub(r"\s+", " ", out).strip()
    return out


def fix_name(text: str) -> str:
    out = squash(text)
    for pattern, repl in NAME_FIXES:
        out = re.sub(pattern, repl, out, flags=re.IGNORECASE)
    return out


def title_case(text: str) -> str:
    """Capitalise each word, preserving separators like '/' and known acronyms."""
    out = []
    for w in squash(text).split(" "):
        low = w.lower()
        if low in ACRONYMS or low.replace("-", "") in ACRONYMS:
            out.append(w.upper())
            continue
        if low in {"and", "of", "the", "in", "for", "a", "or"}:
            out.append(w)
            continue
        match = re.search(r"[A-Za-z]", w)
        if match:
            i = match.start()
            out.append(w[:i] + w[i].upper() + w[i + 1:])
        else:
            out.append(w)
    return " ".join(out)


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "item"


def slug_base_words(text: str) -> set[str]:
    GENERIC = {"plant", "plants", "bail", "vine", "vines", "flower", "flowers",
               "leaves", "leave", "tree", "trees", "colour", "color", "best", "for",
               "your", "and", "the", "of", "with", "a", "as", "at", "in", "on"}
    return {w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in GENERIC}


def extract_height(text: str | None) -> str | None:
    if not text:
        return None
    m = re.search(r"(\d+(?:\.\d+)?)\s*(?:to\s*(\d+(?:\.\d+)?))?\s*(?:ft|feet)\b", text, flags=re.IGNORECASE)
    if not m:
        return None
    if m.group(2):
        return f"{m.group(1)} to {m.group(2)} ft"
    return f"{m.group(1)} ft"


def parse_money(value) -> int | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    digits = re.sub(r"[^\d]", "", str(value))
    return int(digits) if digits else None


def longest_height(heights: list[str | None]) -> str | None:
    found = [h for h in heights if h]
    if not found:
        return None
    return max(found, key=lambda h: max(float(x) for x in re.findall(r"\d+(?:\.\d+)?", h)))


# --------------------------------------------------------------------------
# Plants
# --------------------------------------------------------------------------

def read_plants() -> list[dict]:
    try:
        from pyxlsb import open_workbook
    except ImportError:
        raise SystemExit("pyxlsb not installed — run: pip install pyxlsb")

    with open_workbook(str(SOURCE / "plants-details.xlsb")) as wb:
        with wb.get_sheet("Sheet4") as sheet:
            rows = [[c.v for c in row] for row in sheet.rows()]

    records = []
    category = None
    name = None
    for row in rows[2:]:
        row = (row + [None] * 9)[:9]
        c0, c1, c2 = row[0], row[1], row[2]
        label0 = squash(c0) if c0 else ""
        label1 = squash(c1) if c1 else ""
        label2 = squash(c2) if c2 else ""

        if label0 and not label1:            # section header row
            category = label0
            name = None
            continue
        if label0 and label1:                # first row of a section
            category = label0
        if label1:
            name = label1
        if not (label1 or label2):
            continue

        records.append(dict(
            category=category,
            name=name,
            variety=label2 or None,
            sizes={
                "small": (parse_money(row[3]), squash(row[4]) if row[4] else ""),
                "medium": (parse_money(row[5]), squash(row[6]) if row[6] else ""),
                "large": (parse_money(row[7]), squash(row[8]) if row[8] else ""),
            },
        ))
    return records


CATEGORY_BY_SHEET = {c["sheet"]: c for c in PLANT_CATEGORIES}


def build_plant_name(base: str, variety: str | None) -> tuple[str, str | None]:
    """Returns (displayName, descriptionDetail)."""
    if not variety:
        return base, None
    if variety.lower() == base.lower():
        return base, None
    if len(variety) > 40 or "," in variety:
        return base, variety
    if slug_base_words(base) & slug_base_words(variety):
        return variety, None

    low = variety.lower()
    descriptive = (
        re.search(r"\b(leaves?)\b", low)
        or low.endswith("plant")
        or low.startswith("best ")
        or low.startswith("used ")
        or re.search(r"\b(purpose|perpose|purpase)\b", low)
        or re.search(r"\bflowering (plant|treee|tree)\b", low)
        or ("flower" in low and len(low) > 20)
        or (re.search(r"colou?r", low) and len(low) > 25)
    )
    if descriptive:
        useful = re.search(r"\d", variety) or re.search(r"colou?r", variety, flags=re.IGNORECASE)
        return base, variety if useful else None

    # "pink flower bail" -> "Pink Hibiscus" rather than "Hibiscus Pink Flower Bail"
    tail = re.search(r"\s+(?:flowering\s+)?(?:flowers?|bail)$", variety, flags=re.IGNORECASE)
    if tail:
        head = variety[: tail.start()].strip()
        if head:
            return f"{head} {base}", None

    return f"{base} {variety}", None


def make_plants(records: list[dict]) -> list[dict]:
    used_slugs: Counter = Counter()
    products = []

    for rec in records:
        cat = CATEGORY_BY_SHEET.get(rec["category"])
        if not cat:
            raise SystemExit(f"Unknown plant section: {rec['category']!r}")

        base = title_case(fix_name(rec["name"]))
        variety_raw = title_case(fix_name(rec["variety"])) if rec["variety"] else None
        display, detail = build_plant_name(base, variety_raw)

        slug = slugify(display)
        used_slugs[slug] += 1
        if used_slugs[slug] > 1:
            slug = f"{slug}-{slugify(cat['nameEn'])}"

        variants = []
        size_details = []
        fallback_note = ""
        for size, (price, desc) in rec["sizes"].items():
            if price is None:
                continue
            desc = fix_words(desc)
            height = extract_height(desc)
            label = size.capitalize()
            if height:
                label = f"{size.capitalize()} · {height}"
            variants.append(dict(
                size=size,
                sizeLabelEn=label,
                sizeLabelUr=SIZE_LABEL_UR[size],
                price=int(price),
                stock=DEFAULT_STOCK,
                description=desc,
            ))
            if desc:
                size_details.append(f"{size.capitalize()}: {desc.rstrip(' ,;.')}")

        if not variants:  # no price anywhere — seed with a nominal price for the admin to fix
            variants = [dict(
                size="medium",
                sizeLabelEn="Standard",
                sizeLabelUr="معیاری",
                price=500,
                stock=DEFAULT_STOCK,
                description="",
            )]
            size_details = []
            fallback_note = "Size and availability to be confirmed — message us on WhatsApp for the latest."

        description_parts = []
        if detail:
            description_parts.append(detail.rstrip(".,") + ".")
        if fallback_note:
            description_parts.append(fallback_note)
        if size_details:
            prefix = "Size guide: " if len(size_details) > 1 else ""
            description_parts.append(prefix + "; ".join(size_details) + ".")
        description = fix_words(" ".join(description_parts)) if description_parts else ""

        if detail:
            short_description = detail
        elif size_details:
            short_description = size_details[0].split(":", 1)[-1].strip()
        elif fallback_note:
            short_description = fallback_note
        else:
            short_description = ""

        tags = [cat["nameEn"]]
        if detail and "," in detail:
            tags += [title_case(t) for t in detail.split(",") if len(t.strip()) > 2][:8]

        heights = [extract_height(v["description"]) for v in variants]
        height_info = longest_height(heights)

        product = dict(
            slug=slug,
            categoryKey=cat["key"],
            nameEn=display,
            shortDescriptionEn=short_description,
            descriptionEn=description,
            careInstructionsEn=care_line(cat["key"]),
            heightInfo=height_info or "",
            tags=tags,
            variants=variants,
            featured=False,
            isActive=True,
            image=PLACEHOLDER,
        )
        product.update(PLANT_CATEGORY_DEFAULTS[cat["key"]])
        products.append(product)

    return products


CARE = {
    "fruit": "Full sun for at least 6 hours. Water when the top 2 inches of soil are dry. Feed with organic compost every 6 weeks in the growing season.",
    "flowering": "Full sun keeps the blooms coming. Water regularly but never let the pot stand in water. Deadhead spent flowers and feed monthly.",
    "indoor": "Bright indirect light. Water when the top inch of soil is dry and dust the leaves occasionally.",
    "decorating": "Bright indirect light. Water when the top inch of soil is dry. Wipe leaves and rotate the pot for even growth.",
    "vines": "Give it a support to climb and bright light. Prune after flowering to keep it dense and bushy.",
    "herbs": "Keep in a sunny windowsill. Harvest regularly to encourage bushy growth and water when the surface feels dry.",
    "trees": "Plant in open ground or a large container with full sun. Water deeply and mulch to hold moisture.",
    "accessory": "",
}


def care_line(key: str) -> str:
    return CARE.get(key, "")


# --------------------------------------------------------------------------
# Accessories
# --------------------------------------------------------------------------

def read_accessories() -> list[dict]:
    try:
        import openpyxl
    except ImportError:
        raise SystemExit("openpyxl not installed — run: pip install openpyxl")

    wb = openpyxl.load_workbook(str(SOURCE / "accessories-detail.xlsx"), data_only=True)
    ws = wb["Sheet1"]
    rows = [r[:4] for r in ws.iter_rows(values_only=True)][1:]

    products = []
    current = None
    for name, desc, qty, price in rows:
        label = squash(name) if name else ""
        if label:
            current = dict(name=label, description=squash(desc) if desc else "", rows=[])
            products.append(current)
        if current is None:
            continue
        if qty or price is not None:
            current["rows"].append(dict(
                description=squash(desc) if desc else "",
                size=squash(qty) if qty else "",
                price=parse_money(price),
            ))
    return products


def accessory_category(name: str) -> str:
    key = name.lower().strip()
    for cat_key, names in ACCESSORY_GROUPS.items():
        if key in names:
            return cat_key
    raise SystemExit(f"Accessory not assigned to a category: {name!r}")


def make_accessories(rows: list[dict]) -> list[dict]:
    products = []
    used = Counter()

    for row in rows:
        name = title_case(fix_name(row["name"]))
        slug = slugify(name)
        used[slug] += 1
        if used[slug] > 1:
            slug = f"{slug}-{used[slug]}"

        rows_ = row["rows"]
        sizes = [r for r in rows_ if r["price"] is not None]
        cycle = SIZE_CYCLE[min(len(sizes), 5)]

        variants = []
        labels = []
        for idx, item in enumerate(sizes):
            size_value = cycle[idx]
            raw_size = normalise_size(item["size"])
            bits = []
            if item["description"] and item["description"] != row["description"]:
                bits.append(title_case(item["description"]))
            if raw_size:
                bits.append(raw_size)
            label = " ".join(bits) or name
            labels.append(label)

            variant = dict(
                size=size_value,
                sizeLabelEn=label,
                sizeLabelUr="",
                price=int(item["price"]),
                stock=DEFAULT_STOCK,
                description="",
            )
            weight = parse_weight(raw_size)
            if weight is not None:
                variant["weight"] = weight
            if is_dimension(raw_size):
                variant["dimensions"] = raw_size
            variants.append(variant)

        cat_key = accessory_category(name.lower())
        if len(labels) > 1:
            description = f"{name} — available in {len(labels)} sizes: " + ", ".join(labels) + "."
        elif labels and labels[0] != name:
            description = f"{name} — {labels[0]}."
        else:
            description = f"{name}."
        if name.lower() == "hanging pots":
            description += " Also available in fibre and cone-shape designs."

        product = dict(
            slug=slug,
            categoryKey=cat_key,
            nameEn=name,
            shortDescriptionEn=description,
            descriptionEn=description,
            careInstructionsEn="",
            heightInfo="",
            tags=["Accessories", dict((c["key"], c["nameEn"]) for c in ACCESSORY_CATEGORIES)[cat_key]],
            variants=variants,
            featured=False,
            isActive=True,
            image=PLACEHOLDER,
        )
        product.update(PLANT_CATEGORY_DEFAULTS["accessory"])
        products.append(product)

    return products


def parse_weight(size: str) -> float | None:
    m = re.search(r"(\d+(?:\.\d+)?)\s*(kg|kilo|gram|g)\b", size or "", flags=re.IGNORECASE)
    if not m:
        return None
    value = float(m.group(1))
    return round(value / 1000, 3) if m.group(2).lower() in {"gram", "g"} else value


def normalise_size(size: str) -> str:
    return squash(size).replace("inshes", "inches").replace("litter", "litre")


def is_dimension(size: str) -> bool:
    return bool(re.search(r"\d\s*(inch|insh)", size or "", flags=re.IGNORECASE))


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main() -> None:
    plant_records = read_plants()
    products = make_plants(plant_records)
    products += make_accessories(read_accessories())

    categories = [
        dict(key=c["key"], slug=c["slug"], nameEn=c["nameEn"], descriptionEn=c["descriptionEn"],
             image=c["image"], sortOrder=c["sortOrder"], kind="plant")
        for c in PLANT_CATEGORIES
    ] + [
        dict(key=c["key"], slug=c["slug"], nameEn=c["nameEn"], descriptionEn=c["descriptionEn"],
             image=c["image"], sortOrder=c["sortOrder"], kind="accessory")
        for c in ACCESSORY_CATEGORIES
    ]

    slugs = [p["slug"] for p in products]
    dupes = [s for s, n in Counter(slugs).items() if n > 1]
    if dupes:
        raise SystemExit(f"Duplicate product slugs: {dupes}")

    # one featured product per category so the homepage and ?featured=true are never empty
    seen_featured: set[str] = set()
    for product in products:
        key = product["categoryKey"]
        if key not in seen_featured:
            seen_featured.add(key)
            product["featured"] = True

    payload = dict(
        generatedAt=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        source=dict(plants="source/plants-details.xlsb", accessories="source/accessories-detail.xlsx"),
        categories=categories,
        products=products,
    )
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    per_cat = Counter(p["categoryKey"] for p in products)
    print(f"Wrote {OUT.relative_to(HERE.parent.parent)}")
    print(f"  categories: {len(categories)}")
    print(f"  products:   {len(products)} ({sum(len(p['variants']) for p in products)} variants)")
    for key, count in sorted(per_cat.items(), key=lambda kv: -kv[1]):
        print(f"    {key:14} {count}")


if __name__ == "__main__":
    main()
