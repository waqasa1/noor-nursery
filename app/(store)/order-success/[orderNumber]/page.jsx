import Link from "next/link";
import { connectDB, isDBConfigured } from "@/lib/db";
import Order from "@/models/Order";
import { formatPKR } from "@/lib/utils/currency";
import { getJazzCashWalletConfig } from "@/lib/settings";
import { JazzCashPaymentPanel } from "@/components/store/JazzCashPaymentPanel";
import { CheckCircle2, Truck, ShoppingBag, MessageCircle } from "lucide-react";
import { buildOrderWhatsAppUrl } from "@/lib/whatsapp";
import { getEnv } from "@/lib/env";
import { orderAccessAllowed } from "@/lib/orders/access";
import { isManualWalletPayment } from "@/lib/payments/methods";

export const metadata = { robots: { index: false } };

export default async function OrderSuccessPage({ params, searchParams }) {
  const { orderNumber } = await params;
  const query = (await searchParams) || {};
  const accessToken = typeof query.t === "string" ? query.t : "";
  let order = null;
  let wallet = null;
  let accessDenied = false;

  if (isDBConfigured()) {
    await connectDB();
    const found = await Order.findOne({ orderNumber }).lean();
    if (found && orderAccessAllowed(found, accessToken)) {
      order = found;
      if (isManualWalletPayment(order.paymentMethod)) {
        wallet = await getJazzCashWalletConfig();
      }
    } else if (found) {
      accessDenied = true;
    }
  }

  if (accessDenied || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-primary">Order link required</h1>
        <p className="mt-3 text-muted-foreground">
          Open this page from your checkout confirmation email/link, or track your order with your
          order number and email or phone.
        </p>
        <p className="mt-2 font-mono text-sm text-foreground">{orderNumber}</p>
        <Link
          href="/track-order"
          className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
        >
          Track Order
        </Link>
      </div>
    );
  }

  const awaitingManualPay =
    isManualWalletPayment(order.paymentMethod) && order.paymentStatus !== "paid";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:py-24">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-primary px-8 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-leaf text-leaf-foreground shadow-lg">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {awaitingManualPay ? "Order Received!" : "Order Confirmed!"}
          </h1>
          <p className="text-urdu mt-3 text-xl text-primary-foreground/90" dir="rtl" lang="ur">
            آپ کا آرڈر موصول ہو گیا
          </p>
          <p className="mt-6 text-lg text-primary-foreground/80">
            {awaitingManualPay
              ? "Almost there — send the JazzCash payment below to confirm your order. Your order number is:"
              : "Thank you for your purchase. Your order number is:"}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-wider">{orderNumber}</p>
        </div>

        <div className="px-8 py-10 sm:px-12 sm:py-12">
          <div className="flex items-center justify-between border-b pb-6">
            <span className="text-lg text-muted-foreground">Total Amount</span>
            <span className="font-display text-2xl font-bold text-primary">
              {formatPKR(order.total)}
            </span>
          </div>

          {isManualWalletPayment(order.paymentMethod) && wallet && (
            <JazzCashPaymentPanel
              orderNumber={orderNumber}
              accessToken={accessToken}
              amount={order.total}
              accountTitle={wallet.accountTitle}
              accountNumber={wallet.accountNumber}
              paymentStatus={order.paymentStatus}
              paymentReference={order.paymentReference}
              orderStatus={order.orderStatus}
            />
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/track-order"
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition hover:bg-forest hover:shadow-lg"
            >
              <Truck className="h-4 w-4" /> Track Order
            </Link>
            <a
              href={buildOrderWhatsAppUrl({
                orderNumber,
                total: order.total,
                paymentMethod: order.paymentMethod,
                baseUrl: getEnv().NEXT_PUBLIC_APP_URL,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-secondary px-8 py-4 text-sm font-bold text-secondary transition hover:bg-surface-low"
            >
              <MessageCircle className="h-4 w-4" /> Questions on WhatsApp
            </a>
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 rounded-full border px-8 py-4 text-sm font-bold text-foreground transition hover:border-secondary hover:text-secondary hover:shadow-md"
            >
              <ShoppingBag className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
