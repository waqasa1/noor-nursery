#!/usr/bin/env python3
"""
Catalog data-quality report — spreadsheet level.

Reads the source spreadsheets with the SAME parsing as build.py, then reports
every cell/column that is missing, empty or unparseable, plus every gap that
catalog.json still carries (fake prices, placeholder images, empty Urdu…).

  <venv>/bin/python scripts/catalog/report.py

Writes scripts/catalog/report.json and prints a summary.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import build  # same directory — reuses the exact seed-pipeline parsing

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "source"
OUT = HERE / "report.json"

PLACEHOLDER = "/placeholder-plant.jpg"
SIZES = ["small", "medium", "large"]


def cell_price(value):
    """-> (price:int|None, status:'ok'|'empty'|'unparseable'|'zero')"""
    if value is None or (isinstance(value, str) and not value.strip()):
        return None, "empty"
    price = build.parse_money(value)
    if price is None:
        return None, "unparseable"
    if price == 0:
        return 0, "zero"
    return price, "ok"


# --------------------------------------------------------------------------
# Plants sheet (plants-details.xlsb / Sheet4)
# --------------------------------------------------------------------------
PLANT_COLS = [
    "A: section/category", "B: plant name", "C: variety/detail",
    "D: Small price", "E: Small description",
    "F: Medium price", "G: Medium description",
    "H: Large price", "I: Large description",
]


def read_plant_rows():
    from pyxlsb import open_workbook

    with open_workbook(str(SOURCE / "plants-details.xlsb")) as wb:
        with wb.get_sheet("Sheet4") as sheet:
            return [[c.v for c in row] for row in sheet.rows()]


def analyse_plants():
    rows = read_plant_rows()
    header = rows[:2]
    sections = []
    dropped_rows = []          # rows with price data but no name/variety -> build.py skips them
    unparseable = []           # price cells that hold text without digits
    zero_prices = []           # price cells that are literally 0
    no_price_anywhere = []     # products where EVERY size price is missing -> fake 500 PKR
    partial_price = []         # products missing 1-2 size prices
    price_without_desc = []    # variant priced but the size description cell is empty
    products_seen = 0

    category = None
    name = None
    for idx, raw in enumerate(rows[2:], start=3):   # 1-based sheet row number
        row = (raw + [None] * 9)[:9]
        c0, c1, c2 = row[0], row[1], row[2]
        label0 = build.squash(c0) if c0 else ""
        label1 = build.squash(c1) if c1 else ""
        label2 = build.squash(c2) if c2 else ""

        if label0 and not label1:
            category = label0
            name = None
            sections.append(label0)
            continue
        if label0 and label1:
            category = label0
        if label1:
            name = label1
        if not (label1 or label2):
            # blank name/variety: fine UNLESS the row carries price data
            prices = [cell_price(row[i]) for i in (3, 5, 7)]
            if any(p is not None for p, _ in prices):
                dropped_rows.append(dict(
                    sheetRow=idx, section=category, name=name,
                    cells={PLANT_COLS[i]: str(row[i]) for i in (3, 5, 7) if row[i] not in (None, "")},
                ))
            continue

        products_seen += 1
        identity = dict(sheetRow=idx, section=category, name=name, variety=label2 or None)

        found, missing, priced = 0, [], 0
        for offset, size in zip((3, 5, 7), SIZES):
            price, status = cell_price(row[offset])
            desc = build.squash(row[offset + 1]) if row[offset + 1] else ""
            if status == "ok" or status == "zero":
                priced += 1
                found += 1
                if status == "zero":
                    zero_prices.append(dict(**identity, size=size))
                if not desc:
                    price_without_desc.append(dict(**identity, size=size, price=price))
            else:
                missing.append(size)
                if status == "unparseable":
                    unparseable.append(dict(**identity, size=size, cell=str(row[offset])))
        if priced == 0:
            no_price_anywhere.append(dict(**identity, cells={
                PLANT_COLS[i]: (str(row[i]) if row[i] not in (None, "") else None) for i in (3, 5, 7)
            }))
        elif missing:
            partial_price.append(dict(**identity, missingSizes=missing))

    return dict(
        file="source/plants-details.xlsb",
        sheet="Sheet4",
        totalSheetRows=len(rows),
        headerRows=[[" | ".join(str(c) for c in r if c not in (None, "")) for r in header]],
        columns=PLANT_COLS,
        productsParsed=products_seen,
        sections=sections,
        issues=dict(
            droppedRows=dropped_rows,
            productsWithNoPriceAtAll=no_price_anywhere,   # -> fake PKR 500 "Standard"
            productsWithPartialPrice=partial_price,
            priceCellUnparseable=unparseable,
            priceCellZero=zero_prices,
            priceWithoutSizeDescription=price_without_desc,
        ),
        absentColumns=[
            "image/photo", "Urdu name", "Urdu description", "stock", "SKU",
            "light/watering/difficulty (taken from category defaults)",
        ],
    )


# --------------------------------------------------------------------------
# Accessories sheet (accessories-detail.xlsx / Sheet1)
# --------------------------------------------------------------------------
ACC_COLS = ["A: product name", "B: description", "C: qty/size", "D: price"]


def analyse_accessories():
    import openpyxl

    wb = openpyxl.load_workbook(str(SOURCE / "accessories-detail.xlsx"), data_only=True)
    ws = wb["Sheet1"]
    raw_rows = [list(r[:4]) for r in ws.iter_rows(values_only=True)]
    header, rows = raw_rows[0], raw_rows[1:]

    products = []           # dict(name, sheetRow, variants=[...], issues=[...])
    orphan_rows = []        # qty/price rows before any product name -> skipped
    current = None
    for idx, (nm, desc, qty, price) in enumerate(rows, start=2):  # 1-based sheet row
        label = build.squash(nm) if nm else ""
        if label:
            current = dict(name=label, sheetRow=idx, description=build.squash(desc) if desc else "",
                           variants=[], noDescription=not (desc and build.squash(desc)),
                           qtyNoPrice=[], priceNoQty=[], priceUnparseable=[], priceZero=[])
            products.append(current)
        if current is None:
            if qty or price is not None:
                orphan_rows.append(dict(sheetRow=idx, qty=str(qty), price=str(price)))
            continue

        if qty or price is not None:
            p, status = cell_price(price)
            size = build.squash(qty) if qty else ""
            if status == "empty":
                current["qtyNoPrice"].append(dict(sheetRow=idx, size=size, description=build.squash(desc) if desc else ""))
            elif status == "unparseable":
                current["priceUnparseable"].append(dict(sheetRow=idx, cell=str(price)))
            elif status == "zero":
                current["priceZero"].append(dict(sheetRow=idx, size=size))
            else:
                if not size:
                    current["priceNoQty"].append(dict(sheetRow=idx, description=build.squash(desc) if desc else "", price=p))
                current["variants"].append(dict(sheetRow=idx, size=size, price=p,
                                                description=build.squash(desc) if desc else ""))

    zero_variant_products = [p for p in products if not p["variants"]]
    no_desc = [p["name"] for p in products if p["noDescription"]]
    qty_no_price = [dict(product=p["name"], **r) for p in products for r in p["qtyNoPrice"]]
    price_no_qty = [dict(product=p["name"], **r) for p in products for r in p["priceNoQty"]]
    unparseable = [dict(product=p["name"], **r) for p in products for r in p["priceUnparseable"]]

    return dict(
        file="source/accessories-detail.xlsx",
        sheet="Sheet1",
        totalSheetRows=len(rows) + 1,
        headerRows=[[str(c) for c in header]],
        columns=ACC_COLS,
        productsParsed=len(products),
        issues=dict(
            orphanRowsSkipped=orphan_rows,
            productsWithNoPricedVariant=zero_variant_products,   # -> variants: [] in store
            variantRowsQtyWithoutPrice=qty_no_price,             # -> row silently dropped
            variantRowsPriceWithoutQty=price_no_qty,             # -> size label falls back to name
            priceCellUnparseable=unparseable,
            productsWithoutDescription=no_desc,
        ),
        absentColumns=["image/photo", "Urdu name/description", "stock", "SKU"],
    )


# --------------------------------------------------------------------------
# catalog.json — what actually survived into the seed file
# --------------------------------------------------------------------------
def analyse_catalog():
    cat = json.loads((HERE / "catalog.json").read_text(encoding="utf-8"))
    urdu = json.loads((HERE / "urdu.json").read_text(encoding="utf-8"))

    products = cat["products"]
    by_key = Counter(p["categoryKey"] for p in products)

    def is_fake_price(p):
        v = p["variants"]
        return len(v) == 1 and v[0].get("price") == 500 and v[0].get("sizeLabelEn") == "Standard"

    fake_price = [p["slug"] for p in products if is_fake_price(p)]
    no_variants = [p["slug"] for p in products if not p["variants"]]
    zero_price_variants = [f'{p["slug"]}::{v["size"]}' for p in products for v in p["variants"] if not v.get("price")]
    empty_desc = [p["slug"] for p in products if not (p.get("descriptionEn") or "").strip()]
    empty_short = [p["slug"] for p in products if not (p.get("shortDescriptionEn") or "").strip()]
    acc_keys = {c["key"] for c in cat["categories"] if c.get("kind") == "accessory"}
    accessories = [p for p in products if p["categoryKey"] in acc_keys]
    plants = [p for p in products if p["categoryKey"] not in acc_keys]
    no_height = [p["slug"] for p in plants if not (p.get("heightInfo") or "").strip()]
    acc_no_urdu_label = [p["slug"] for p in accessories
                         if all(not (v.get("sizeLabelUr") or "").strip() for v in p["variants"])]
    placeholder = [p["slug"] for p in products if (p.get("image") or "") == PLACEHOLDER]
    no_image_field = [p["slug"] for p in products if not p.get("image")]

    missing_urdu_name = [p["slug"] for p in products if not (urdu["products"].get(p["slug"]) or "").strip()]
    cat_missing_urdu = [c["slug"] for c in cat["categories"]
                        if not (urdu["categories"].get(c["slug"], {}).get("nameUr") or "").strip()]
    cat_missing_urdu_desc = [c["slug"] for c in cat["categories"]
                             if not (urdu["categories"].get(c["slug"], {}).get("descriptionUr") or "").strip()]

    variant_sizes = Counter(v["size"] for p in products for v in p["variants"])

    return dict(
        generatedAt=cat.get("generatedAt"),
        totals=dict(products=len(products), plants=len(plants), accessories=len(accessories),
                    categories=len(cat["categories"]),
                    variants=sum(len(p["variants"]) for p in products)),
        byCategory=dict(by_key),
        issues=dict(
            fakeNominalPrice500=fake_price,          # spreadsheet had NO price at all
            productsWithNoVariants=no_variants,      # spreadsheet had no priced variant row
            zeroPriceVariants=zero_price_variants,
            emptyDescriptionEn=empty_desc,
            emptyShortDescriptionEn=empty_short,
            plantsWithoutHeightInfo=len(no_height),
            accessoriesWithoutUrduSizeLabels=len(acc_no_urdu_label),
            imageIsPlaceholder=len(placeholder),
            imageFieldMissing=len(no_image_field),
            missingUrduNameInUrduJson=missing_urdu_name,
            categoriesMissingUrduName=cat_missing_urdu,
            categoriesMissingUrduDescription=cat_missing_urdu_desc,
        ),
        variantSizeDistribution=dict(variant_sizes),
        notes=[
            "seed.mjs hardcodes shortDescriptionUr='' and careInstructionsUr='' for every product.",
            "seed.mjs writes descriptionUr as a template sentence, not a translated description.",
            "seed.mjs sets seoTitle=nameEn and seoDescription=shortDescription/description (auto, unique per product).",
            "plants get stock=20 and accessories get stock=20 regardless of reality (DEFAULT_STOCK).",
            "accessory variants get sizeLabelUr='' and variant description='' by design in build.py.",
        ],
    )


def main():
    report = dict(
        generatedBy="scripts/catalog/report.py",
        spreadsheetPlants=analyse_plants(),
        spreadsheetAccessories=analyse_accessories(),
        catalog=analyse_catalog(),
    )
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    p, a, c = report["spreadsheetPlants"], report["spreadsheetAccessories"], report["catalog"]
    print("=== SPREADSHEETS ===")
    print(f"plants  : {p['productsParsed']} rows -> products")
    print(f"  no price in ANY size (fake PKR 500) : {len(p['issues']['productsWithNoPriceAtAll'])}")
    print(f"  missing 1-2 size prices             : {len(p['issues']['productsWithPartialPrice'])}")
    print(f"  price present, size description empty: {len(p['issues']['priceWithoutSizeDescription'])}")
    print(f"  price cells unparseable / zero       : {len(p['issues']['priceCellUnparseable'])} / {len(p['issues']['priceCellZero'])}")
    print(f"  rows dropped (price but no name)     : {len(p['issues']['droppedRows'])}")
    print(f"accessories: {a['productsParsed']} products")
    print(f"  products with NO priced variant      : {len(a['issues']['productsWithNoPricedVariant'])}")
    print(f"  variant rows qty-but-no-price (dropped): {len(a['issues']['variantRowsQtyWithoutPrice'])}")
    print(f"  variant rows price-but-no-qty        : {len(a['issues']['variantRowsPriceWithoutQty'])}")
    print(f"  products without description         : {len(a['issues']['productsWithoutDescription'])}")
    print("=== catalog.json ===")
    for k, v in c["issues"].items():
        print(f"  {k:36} {len(v) if isinstance(v, list) else v}")
    print(f"written -> {OUT}")


if __name__ == "__main__":
    main()
