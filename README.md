# Noor Nursery — E-Commerce Platform

Plant nursery e-commerce for Pakistan. Next.js 15 App Router, MongoDB, bilingual (English + Urdu) storefront, COD + manual JazzCash checkout.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, JavaScript
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB + Mongoose
- **Auth:** JWT sessions in httpOnly cookies (`jose`)
- **Email:** Resend (transactional)
- **Validation:** Zod
- **Cart:** Zustand (client) + server validation at checkout
- **Payments:** Cash on Delivery + JazzCash Send Money (manual TID)
- **Images:** Cloudinary (admin uploads)
- **Tests:** Vitest

## Local Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Production / full-stack env (required)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | 32+ character random secret for sessions |
| `NEXT_PUBLIC_APP_URL` | Public site URL (no trailing slash) |
| `RESEND_API_KEY` | Order / contact / reset emails |
| `EMAIL_FROM` | Verified Resend sender (e.g. `Noor Nursery <noreply@yourdomain.com>`) |
| `CLOUDINARY_*` | Admin image uploads |

See [`.env.example`](./.env.example) for store phone/email, delivery defaults, JazzCash wallet fallbacks, and optional `HEALTH_CHECK_SECRET`.

### 3. Seed (optional)

```bash
ADMIN_BOOTSTRAP_EMAIL=admin@noornursery.pk
ADMIN_BOOTSTRAP_PASSWORD=change-me-before-seeding
npm run seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: `/admin` after login.

```bash
npm run build && npm start
npm test
```

## Payments

Checkout methods:

- **COD** — always available
- **JazzCash** — manual Send Money + TID; configure wallet in **Admin → Settings** (or `JAZZCASH_ACCOUNT_*` env)

Details: [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md)

## Admin

After login as admin:

- Products, categories, accessories, orders, customers
- **Testimonials** — homepage reviews (hidden when empty)
- **Settings** — banner/promo, free-ship threshold, site images (Cloudinary), JazzCash wallet, delivery fees

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) when present.

## Go-live checklist

1. Set production `MONGODB_URI`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, Resend, Cloudinary
2. Admin → Settings: JazzCash wallet, free delivery threshold, banner promo, upload site images
3. Upload product / category photos (replace placeholders)
4. Add real testimonials (or leave empty)
5. Smoke-test: shop → checkout COD, JazzCash TID flow, contact form, password reset email
6. Change any bootstrap admin password used in seed

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Reset tokens stored as SHA-256 hashes only
- Admin routes protected by middleware + `requireAdmin()`
- Prices, stock, and totals recalculated server-side at checkout
- Rate limiting on auth, checkout, contact, track, and payment-proof
- Public `/api/health` returns minimal status; detailed checks need `x-health-secret`

## Project Structure

```
app/                  # Pages and API routes
components/           # Storefront + admin UI
lib/                  # Auth, payments, email, settings, SEO
models/               # Mongoose schemas
store/                # Zustand cart
scripts/              # Seed / catalog helpers
tests/                # Vitest
```
