# Admin Guide — Noor Nursery

## Creating the First Admin

### Option 1: Seed script (recommended)

```bash
# In .env.local
ADMIN_BOOTSTRAP_EMAIL=admin@noornursery.pk
ADMIN_BOOTSTRAP_PASSWORD=YourSecurePassword123

npm run seed
```

Log in at `/login`, then visit `/admin`.

### Option 2: Manual MongoDB

Create a user document with `role: "admin"` and a bcrypt-hashed password. Use the seed script instead to avoid errors.

## Admin Access

- URL: `/admin`
- Protected by middleware (redirects non-admins) and API-level `requireAdmin()` checks
- Customers attempting access are redirected to `/account?error=forbidden`

## Dashboard (`/admin`)

Metrics shown:

- Total orders
- Revenue from **paid** orders only (COD not counted until marked paid)
- Pending orders
- Orders awaiting payment
- Low-stock variant alerts
- Recent orders list

## Product Management

### List products (`/admin/products`)

View all products with stock totals, starting price, and active status.

### Create product (`/admin/products/new`)

Required fields:

- English and Urdu names
- Category
- At least one variant (Small, Medium, Large) with SKU, price, stock

Each variant supports:

- `size`: small | medium | large
- `sizeLabelEn` / `sizeLabelUr`
- `sku` (unique per product)
- `price` (PKR)
- `compareAtPrice` (optional sale display)
- `stock` and `lowStockThreshold`
- `isActive`

### Edit product (`/admin/products/[id]/edit`)

Update names, active/featured flags, descriptions, variants, and SEO fields.

### Archive product

Deleting a product sets `isActive: false` — it won't appear in the storefront but order history is preserved.

## Category Management (`/admin/categories`)

Create categories with:

- English and Urdu names
- Descriptions (both languages)
- Cover image URL
- Sort order
- SEO title/description

Inactive categories (`isActive: false`) are hidden from the storefront.

## Order Management

### List orders (`/admin/orders`)

Filter by search (order number, email, phone, name), payment method, payment status, order status.

### Order detail (`/admin/orders/[id]`)

View full customer info, shipping address, line items with variant snapshots, and payment references.

### Update statuses

**Order status workflow:**

```
pending → processing → packed → shipped → delivered
         ↘ cancelled
awaiting_payment → payment_review → paid → processing → ...
```

**Payment status:**

- `unpaid` — COD not yet collected
- `pending` — bank transfer or gateway pending
- `paid` — payment confirmed
- `failed` / `refunded` — as applicable

### Bank transfer verification

1. Customer places order → status `awaiting_payment`
2. Customer transfers with order number as reference
3. Admin verifies bank statement
4. Update `paymentStatus` to `paid` and `orderStatus` to `processing`
5. Payment received email sent automatically

### COD workflow

1. Order created as `unpaid` / `pending`
2. Process and ship normally
3. Mark `paymentStatus: paid` when courier collects payment (optional, for revenue tracking)

## Resending Emails

On order detail, use the status update with `resendEmail: true` in the API to resend status notification. Confirmation emails are sent once on order creation — avoid duplicate resends for the same status.

## Customer Management (`/admin/customers`)

View registered customers (name, email, phone, join date). Password hashes and reset tokens are never exposed.

## Low Stock Alerts

Dashboard shows variants where `stock <= lowStockThreshold` (default 5). Restock via product edit page.

## Best Practices

- Always verify bank transfers before marking paid
- Never mark gateway orders paid without verified callback
- Use internal notes for fulfillment team communication
- Keep product slugs stable — they're used in URLs and order snapshots
- Test new products on staging before publishing (`isActive: true`)
