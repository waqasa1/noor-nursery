# Noor Nursery — Next.js

Next.js (App Router) + Tailwind CSS v4, plain JavaScript (no TypeScript).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Structure

- `app/layout.jsx` — HTML shell, fonts, site metadata (SEO)
- `app/page.jsx` — home page, cart count + toast state
- `app/globals.css` — Tailwind v4 theme tokens (nursery palette)
- `components/nursery/*` — Header, Hero, Products, Sections, Footer, data

Product images are hotlinked from the original design.
