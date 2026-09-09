# Noor Nursery — E-Commerce Platform

Production-ready plant nursery e-commerce website for Pakistan. Built on Next.js 15 App Router with MongoDB, secure authentication, bilingual (English + Urdu) content, and multiple payment methods.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, JavaScript
- **Styling:** Tailwind CSS v4 (existing Noor Nursery design system)
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT sessions in httpOnly cookies (jose)
- **Email:** Resend (transactional)
- **Validation:** Zod
- **Cart:** Zustand (persisted client-side) + server-side validation at checkout
- **Payments:** COD, Bank Transfer, JazzCash, EasyPaisa, PayFast (provider abstraction)
- **Tests:** Vitest

## Local Setup

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env.local
```

**Required for full functionality:**

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | 32+ character random secret for sessions |
| `NEXT_PUBLIC_APP_URL` | Public URL (e.g. `http://localhost:3000`) |
| `RESEND_API_KEY` | Resend API key for emails |
| `EMAIL_FROM` | Verified sender address |

See `.env.example` for payment gateway and store configuration.

### 3. MongoDB

Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas), get your connection string, and set `MONGODB_URI`.

### 4. Seed database

Seeds categories, products (from landing page mock data), and an admin user (safe to rerun — skips if categories exist):

```bash
# Set bootstrap credentials in .env.local (optional)
ADMIN_BOOTSTRAP_EMAIL=admin@noornursery.pk
ADMIN_BOOTSTRAP_PASSWORD=Admin123!Secure

npm run seed
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Build and production

```bash
npm run build
npm start
```

### 7. Tests

```bash
npm test
```

## Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain (or use `onboarding@resend.dev` for testing)
3. Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env.local`

Emails are sent asynchronously — order flow never fails if email delivery fails.

## Admin Bootstrap

After seeding, log in at `/login` with your bootstrap admin credentials. Access the dashboard at `/admin`.

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for full admin workflows.

## Payment Setup

See [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) for gateway credentials, callback URLs, and security notes.

COD and Bank Transfer work out of the box. JazzCash, EasyPaisa, and PayFast require merchant credentials.

## Project Structure

```
app/                  # Pages and API routes
components/nursery/   # Original landing page components (preserved)
components/catalog/   # E-commerce product cards
components/help/      # Floating help panel
lib/                  # Auth, payments, email, cart validation, SEO
models/               # Mongoose schemas
store/                # Zustand cart store
config/               # Help FAQ presets
scripts/seed.mjs      # Database seeder
tests/                # Vitest unit tests
```

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Reset tokens stored as SHA-256 hashes only
- Admin routes protected by middleware + server-side `requireAdmin()`
- Prices, stock, and totals recalculated server-side at checkout
- Rate limiting on auth and checkout endpoints
- Payment callbacks verified cryptographically where supported
- Idempotent payment webhook handling

## Deployment

1. Set all production environment variables on your host (Vercel, Railway, etc.)
2. Set `NODE_ENV=production` and `AUTH_SECRET` to a strong random value
3. Configure payment gateway return/notify URLs to your production domain
4. Verify Resend sender domain
5. Run seed once on production MongoDB (or migrate data separately)
6. Test checkout with COD before enabling live payment gateways

## Features

- Bilingual English + Urdu content displayed together (not a language switcher)
- Product variants: Small, Medium, Large with independent SKU, price, stock
- Guest and authenticated checkout
- Order tracking by order number + email
- Admin dashboard: products, categories, orders, customers
- SEO: sitemap, robots.txt, JSON-LD structured data
- Accessible floating help panel (preset FAQ, not AI chat)
- Mobile-first responsive design preserving original landing page aesthetic
