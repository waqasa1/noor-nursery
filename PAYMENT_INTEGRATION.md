# Payment Integration Guide — Noor Nursery

## Overview

Checkout offers two methods:

1. **Cash on Delivery (COD)** — always available
2. **JazzCash Send Money (manual)** — shown when a JazzCash wallet is configured in Admin → Settings

There is no merchant gateway redirect.

**Never trust client-side payment confirmation.** JazzCash orders stay unpaid until staff verify the TID in Admin.

## 1. Cash on Delivery

- Order created with `paymentStatus: unpaid`, `orderStatus: pending`
- Customer pays the courier on delivery

## 2. JazzCash (manual Send Money + TID)

**Configure the receiving wallet** (preferred):

Admin → Settings → JazzCash Account (account title + number)

**Env fallback** (used only if Settings are empty):

```env
JAZZCASH_ACCOUNT_TITLE=Noor Nursery
JAZZCASH_ACCOUNT_NUMBER=03XXXXXXXXX
```

**Flow:**

1. Customer chooses JazzCash at checkout
2. Order is created (`awaiting_payment`)
3. Order success page shows wallet details + amount
4. Customer Send Money’s from the JazzCash app and submits TID / TrxID
5. Admin verifies the TID and marks the order paid → packing / ship

**Disable JazzCash at checkout:**

```env
CHECKOUT_COD_ONLY=true
```

Or leave both JazzCash account fields empty in Admin Settings.

## Security notes

- TID submission is rate-limited
- Admin must verify transfers before marking paid
- Never ask customers for JazzCash PIN or OTP
