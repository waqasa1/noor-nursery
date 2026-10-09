# Catalog Data Report — what's missing

**Date:** 4 Oct 2026 · **Scope:** 12 categories · 213 products (172 plants / 41 accessories) · 391 size variants

**Sources checked (in order):**

| Layer | File | Result |
|---|---|---|
| Spreadsheets (source of truth) | `scripts/catalog/source/plants-details.xlsb`, `accessories-detail.xlsx` | gaps listed below |
| Seed file | `scripts/catalog/catalog.json` | identical to DB |
| Live store (MongoDB = noor-nursery.vercel.app) | products collection | **0 drift, 0 price differences vs catalog.json** |

Because the DB matches `catalog.json` exactly, **every gap below is live on the store right now** — no admin edit has fixed any of them yet.

> **Regenerate:** `<venv>/bin/python scripts/catalog/report.py` and `node --env-file=.env.local scripts/catalog/report-db.mjs`
> (full machine-readable detail → `scripts/catalog/report.json`, `scripts/catalog/report-db.json`)

---

## TL;DR — worst first

| # | Gap | Count | Impact |
|---|---|---|---|
| 1 | **No product photos** — every product shows the generic placeholder | **213 / 213** | Biggest visual problem: the whole catalog looks unfinished |
| 2 | **No real Urdu descriptions** — only Urdu *names* exist | 213 / 213 | Urdu-facing shoppers read a generated one-liner or nothing |
| 3 | **Missing size prices** — spreadsheet never had 1–2 of the 3 sizes | **124 / 172 plants** | Products offer fewer size options than they should |
| 4 | **Products selling a single size only** | **94 / 213** | Size dropdown has just one choice (64 plants + 30 accessories) |
| 5 | **4 products have no price at all** → seeded with a fake PKR 500 "Standard" | 4 | Wrong price shown to customers |
| 6 | **Urdu size labels missing on all accessory variants** | 67 variants | Size chips render English-only on accessories |
| 7 | **Stock is invented** (no stock column in the sheets) | 389 / 391 variants = 20 | Every product claims "20 in stock" regardless of reality |
| 8 | **Accessory variant rows priced with a blank size/qty cell** → size label falls back to the product name | 11 rows | Confusing options like size "Neem Oil" |
| 9 | **Accessory descriptions are synthesized**, not written | 40 / 41 | Copy is "X — available in N sizes" boilerplate |
| 10 | **Height missing** (no "N ft" in the sheet text) | 11 plants | Height filter/detail line is blank |
| 11 | **SEO fields auto-generated** (`seoTitle` = name, `seoDescription` = short description) | all 213 | Not optimized per product, but never empty |

---

## 1. Prices

### Plants (172 rows in `Sheet4`)

| State | Products | Meaning |
|---|---:|---|
| All 3 sizes priced (Small/Medium/Large) | 44 | ✅ complete |
| **1–2 sizes priced** | **124** | other size(s) blank in the spreadsheet → variant never created |
| **No price at all** | **4** | → fake **PKR 500** "Standard" variant |

**What's missing, per product with partial prices:**

| Available sizes | Products |
|---|---:|
| Small + Medium (no Large) | 42 |
| Small only (no Medium/Large) | 34 |
| Medium only (no Small/Large) | 24 |
| Small + Large (no Medium) | 11 |
| Medium + Large (no Small) | 11 |
| Large only (no Small/Medium) | 2 |

**By section (124 partial-price products):** Fruit 33 · Indoor 23 · Flowering 20 · Trees 16 · Herbs 14 · Decorating 9 · Vines 9

### The 4 products with NO price (show a fake PKR 500 today)

| Section | Sheet name | Slug | What the store shows |
|---|---|---|---|
| Fruit plants | strawbery | `strawberry` | "Standard — PKR 500" + "Size and availability to be confirmed — message us on WhatsApp…" |
| Decorating | 3 step ficus | `3-step-ficus` | same |
| Bail's and wine | tazbi bail | `tazbi-bail` | same |
| Herbs and Medicinal | stivia | `stevia` | same |

### Price data hygiene ✅
- 0 price cells unparseable (e.g. "on request") · 0 zero prices · 0 rows dropped (price with no product name) · 0 duplicate slugs · 0 products without variants · **0 price differences between spreadsheet, seed file and live DB**

### Accessories (41 products)
- Every accessory has ≥1 priced variant ✅ — 0 products without price
- 67 variants total: 30 products have 1 size, 2 have 2 sizes, 5 have 3 sizes, 2 have 4, 2 have 5

---

## 2. Sizes

- **94 of 213 products sell exactly one size** (64 plants + 30 accessories) — the dropdown has a single choice, which makes the "choose your size" UX pointless for those cards.
- Plant sizes are limited by the sheet layout to Small/Medium/Large only — no weight/pot-size column exists.
- **11 accessory rows have a price but a blank qty/size cell** — the size label falls back to the product name, so the dropdown reads e.g. "Neem Oil" instead of a size:

  | Product | Sheet row | Price |
  |---|---:|---:|
  | soil insect killer | 30 | 600 |
  | Plant booster | 37 | 800 |
  | neem oil | 38 | 500 |
  | color booster | 39 | 500 |
  | cuter | 40 | 1000 |
  | plant siser | 41 | 3000 |
  | tool kit | 42 | 2000 |
  | spead/ balcha | 43 | 2000 |
  | eax | 44 | 2500 |
  | Fog | 45 | 2500 |
  | pipe shower | 50 | 600 |

- **Accessory Urdu size labels: 0 / 67 present** (`build.py` writes `sizeLabelUr=""` for every accessory). Plant sizes *do* have Urdu (چھوٹا/درمیانہ/بڑا).

---

## 3. Descriptions

| Field | Missing | Notes |
|---|---:|---|
| Plant size descriptions (Small/Medium/Large cells) | **0** | ✅ every priced size has its sheet description |
| `descriptionEn` (products) | 0 ✅ | built from sheet text + size guide |
| **Accessory description column (B)** | **40 / 41 blank** | `build.py` synthesizes *"X — available in N sizes: …"* — boilerplate, not real copy |
| **`shortDescriptionUr`** | **213 / 213** | seed hardcodes `""` — no Urdu short description exists |
| **`descriptionUr`** | **213 / 213 real** | seed writes a fixed template: *"<name> — <category>. سائز اور قیمت کی تفصیل ذیل میں موجود ہے۔"* |
| **`careInstructionsUr`** | **213 / 213** | seed hardcodes `""` |
| `careInstructionsEn` (plants) | 0 ✅ | category-default text (same wording for all plants in a category — not per-plant) |
| `careInstructionsEn` (accessories) | 41 | empty by design (care doesn't apply) |

---

## 4. Images — the biggest gap

| Item | Count |
|---|---:|
| Products with a real photo | **0** |
| Products with `/placeholder-plant.jpg` (generic 50 KB stock image) | **213** |
| Categories with a real image | 12 / 12 ✅ |

**Root cause:** neither spreadsheet has an image column — `build.py` assigns `image = "/placeholder-plant.jpg"` to every product, and no photo has been uploaded through the admin since.

---

## 5. Urdu coverage

| Field | Missing | Status |
|---|---:|---|
| Product `nameUr` | 0 / 213 | ✅ complete via `urdu.json` |
| Category `nameUr` + `descriptionUr` | 0 / 12 | ✅ |
| Product `shortDescriptionUr` | 213 / 213 | ❌ hardcoded empty |
| Product `descriptionUr` (real translation) | 213 / 213 | ❌ template sentence only |
| Product `careInstructionsUr` | 213 / 213 | ❌ hardcoded empty |
| Accessory variant `sizeLabelUr` | 67 / 67 variants | ❌ |

---

## 6. Stock & inventory

- **No stock column exists in either spreadsheet** → `build.py` sets `stock = 20` on all 391 variants. Today **389 of 391 are still exactly 20** and only 2 were ever touched (`fogi-rubber-plant` Small = 19, `wall-pot` Small = 19); **0 variants are out of stock** — every product on the store claims ~20 in stock, which is invented.
- SKUs are auto-generated (`SLUG-SIZE`, e.g. `STRAWBERRY-MEDIUM`) — not supplier SKUs.
- `compareAtPrice` (strikethrough "was" price) is never set anywhere — no product shows a discount.

---

## 7. Height, filters, SEO

- **11 plants have no height** (no "N ft" pattern in the sheet text): `nashpati`, `huss-avocado`, `reed-avocado`, `fuerte-avocado`, `strawberry`, `3-step-ficus`, `spider-plant-green-and-white`, `green-rubber-plant`, `tazbi-bail`, `stevia`, `gul-mohar`.
- Filter fields `sunlight` / `watering` / `difficulty` / `suitability` are **category defaults**, not per-product data (the sheets have no such columns).
- `featured` = 12 (exactly one auto-picked product per category so Featured pages are never empty).
- `seoTitle` = product name, `seoDescription` = short/long description — auto-filled, never blank, but not hand-optimized.

---

## 8. What the spreadsheets simply don't contain (no column at all)

| Column missing from both sheets | Consequence today |
|---|---|
| Image / photo | 213 placeholder images |
| Urdu name, Urdu description, Urdu size labels | only product names have Urdu (separate `urdu.json`) |
| Stock quantity | everything claims 20 |
| Supplier SKU | auto-generated SKUs |
| Compare-at / old price | no discounts possible |
| Care / light / watering per plant | generic per-category text |
| SEO title / description | auto-generated |

---

## Recommended fix order

1. **Upload real photos** for the 213 products (admin → product → images). Nothing else moves the needle this much.
2. **Fix the 4 fake PKR 500 prices** — `strawberry`, `3-step-ficus`, `tazbi-bail`, `stevia`.
3. **Get the missing size prices** for the 124 partial products from the supplier — exact products, sizes and sheet row numbers are in `scripts/catalog/report.json` → `spreadsheetPlants.issues.productsWithPartialPrice`.
4. **Fill the 11 blank qty cells** in the accessories sheet so size labels stop showing product names.
5. **Write real Urdu** short/long descriptions (at least for the best sellers) — today it's one template line for all 213.
6. **Reconcile stock** (or add a "pre-order" flag) instead of the invented 20.
7. Add real accessory descriptions (40 products are boilerplate) and the 11 missing heights.

**Full machine-readable detail:** `scripts/catalog/report.json` (spreadsheet level) · `scripts/catalog/report-db.json` (live DB level).
