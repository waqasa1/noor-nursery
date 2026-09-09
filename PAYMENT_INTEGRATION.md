# Payment Integration Guide — Noor Nursery

## Overview

Payments use a provider abstraction in `lib/payments/`. Each method implements:

- `initiate({ order })` — start payment flow
- `handleCallback(payload)` — verify and process gateway response
- `verifyPayment(payload)` — confirm payment authenticity

**Never trust client-side payment confirmation.** Orders are marked paid only after server-verified callbacks.

## Payment Methods

### 1. Cash on Delivery (COD)

**Status:** Works without credentials.

- Order created with `paymentStatus: unpaid`, `orderStatus: pending`
- Confirmation email sent immediately
- Admin marks payment received on delivery

### 2. Bank Transfer

**Status:** Works when bank details are configured.

**Environment variables:**

```env
BANK_ACCOUNT_TITLE=Noor Nursery
BANK_ACCOUNT_NUMBER=your-account-number
BANK_NAME=HBL
BANK_BRANCH=Lahore Main
```

- Order created with `paymentStatus: pending`, `orderStatus: awaiting_payment`
- Customer receives bank instructions email with order number as reference
- Admin manually updates payment status to `paid` after verifying transfer

### 3. JazzCash

**Status:** Requires merchant credentials.

**Environment variables:**

```env
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_RETURN_URL=https://yourdomain.com/api/payments/jazzcash/return
```

**Flow:**

1. Checkout calls `jazzcashProvider.initiate()` — returns form POST to JazzCash sandbox/production URL
2. Customer completes payment on JazzCash
3. JazzCash POSTs to `/api/payments/jazzcash/return`
4. Server verifies `pp_SecureHash` before updating order

**Callback URL:** Configure in JazzCash merchant portal to match `JAZZCASH_RETURN_URL`.

**Disable until configured:** Method hidden from checkout when credentials missing (`isPaymentConfigured('jazzcash')` returns false).

### 4. EasyPaisa

**Environment variables:**

```env
EASYPAISA_STORE_ID=
EASYPAISA_HASH_KEY=
EASYPAISA_RETURN_URL=https://yourdomain.com/api/payments/easypaisa/return
```

**Flow:** Similar redirect + hash verification on return.

**Callback:** `/api/payments/easypaisa/return`

### 5. PayFast

**Environment variables:**

```env
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_SECRET=
PAYFAST_RETURN_URL=https://yourdomain.com/api/payments/payfast/return
PAYFAST_CANCEL_URL=https://yourdomain.com/api/payments/payfast/cancel
PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payments/payfast/notify
```

**Flow:**

1. Server generates signed form parameters
2. Customer redirected to PayFast
3. PayFast sends ITN (notification) to `/api/payments/payfast/notify`
4. Signature verified before marking order paid

**Important:** The success/return page alone does NOT mark orders paid — only verified ITN/callback does.

## Status Mapping

| Gateway Status | Internal paymentStatus | Internal orderStatus |
|----------------|------------------------|----------------------|
| Success | `paid` | `paid` or `processing` |
| Pending | `pending` | `awaiting_payment` |
| Failed | `failed` | `awaiting_payment` |
| Cancelled | `failed` | `cancelled` |
| COD | `unpaid` | `pending` |
| Bank Transfer | `pending` | `awaiting_payment` |

## Idempotency

Payment callbacks use idempotency keys stored in `PaymentTransaction` collection:

```
{provider}-{externalReference}-{orderNumber}
```

Duplicate callbacks with the same key are ignored if already processed as success.

## Security Constraints

- Merchant keys, passwords, and secrets are **server-only** environment variables
- Never log raw payment payloads containing sensitive data in production
- Verify cryptographic signatures/checksums per provider documentation
- Do not expose secrets in client JavaScript, error messages, or git
- Use HTTPS in production for all callback URLs

## Sandbox Testing

- **JazzCash:** Use sandbox URL in provider (currently points to sandbox — update for production)
- **EasyPaisa:** Request sandbox credentials from EasyPaisa merchant support
- **PayFast:** Use sandbox at `sandbox.payfast.co.za` (update `formAction` in provider for production)

## Disabling a Payment Method

Remove or leave empty the required environment variables for that method. The checkout API rejects unavailable methods, and `getAvailablePaymentMethods()` excludes unconfigured providers.

## Audit Trail

All payment events are logged in `PaymentTransaction` with:

- Order reference
- Provider
- Amount
- Status
- Sanitized gateway response (no secrets)
- Processed timestamp
