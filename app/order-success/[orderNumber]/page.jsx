import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { connectDB, isDBConfigured } from "@/lib/db";
import Order from "@/models/Order";
import { formatPKR } from "@/lib/utils/currency";
import { getEasypaisaConfig } from "@/lib/settings";
import { EasyPaisaPaymentPanel } from "@/components/store/EasyPaisaPaymentPanel";
import { CheckCircle2, Truck, ShoppingBag, MessageCircle } from "lucide-react";
import { buildOrderWhatsAppUrl } from "@/lib/whatsapp";
import { getEnv } from "@/lib/env";

export const metadata = { robots: { index: false } };

export default async function OrderSuccessPage({ params, searchParams }) {
  const { orderNumber } = await params;
  const query = (await searchParams) || {};
  const paymentQuery = query.payment;
  let order = null;
  let easypaisa = null;

  if (isDBConfigured()) {
    await connectDB();
    order = await Order.findOne({ orderNumber }).lean();
    if (order?.paymentMethod === "easypaisa") {
      easypaisa = await getEasypaisaConfig();
    }
  }

  const awaitingManualPay =
    order?.paymentMethod === "easypaisa" && order?.paymentStatus !== "paid";
  const jazzcashFailed =
    order?.paymentMethod === "jazzcash" &&
    (paymentQuery === "failed" || order?.paymentStatus === "failed");
  const jazzcashPending =
    order?.paymentMethod === "jazzcash" &&
    order?.paymentStatus === "pending" &&
    paymentQuery !== "success";

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-3xl px-4 py-16 lg:py-24">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="bg-primary px-8 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-leaf text-leaf-foreground shadow-lg">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {awaitingManualPay || jazzcashPending
                ? "Order Received!"
                : jazzcashFailed
                  ? "Payment Incomplete"
                  : "Order Confirmed!"}
            </h1>
            <p className="text-urdu mt-3 text-xl text-primary-foreground/90" dir="rtl" lang="ur">آپ کا آرڈر موصول ہو گیا</p>
            <p className="mt-6 text-lg text-primary-foreground/80">
              {awaitingManualPay
                ? "Almost there — send the EasyPaisa payment below to confirm your order. Your order number is:"
                : jazzcashFailed
                  ? "JazzCash did not confirm payment. You can try again from checkout or contact us. Your order number is:"
                  : jazzcashPending
                    ? "We are waiting for JazzCash to confirm your payment. Your order number is:"
                    : "Thank you for your purchase. Your order number is:"}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-wider">{orderNumber}</p>
          </div>
          
          <div className="px-8 py-10 sm:px-12 sm:py-12">
            {order && (
              <div className="flex items-center justify-between border-b pb-6">
                <span className="text-lg text-muted-foreground">Total Amount</span>
                <span className="font-display text-2xl font-bold text-primary">{formatPKR(order.total)}</span>
              </div>
            )}

            {order?.paymentMethod === "easypaisa" && easypaisa && (
              <EasyPaisaPaymentPanel
                orderNumber={orderNumber}
                amount={order.total}
                accountTitle={easypaisa.accountTitle}
                accountNumber={easypaisa.accountNumber}
                paymentStatus={order.paymentStatus}
                paymentReference={order.paymentReference}
                orderStatus={order.orderStatus}
              />
            )}
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link href="/track-order" className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition hover:bg-forest hover:shadow-lg">
                <Truck className="h-4 w-4" /> Track Order
              </Link>
              <a
                href={buildOrderWhatsAppUrl({
                  orderNumber,
                  total: order?.total,
                  paymentMethod: order?.paymentMethod,
                  baseUrl: getEnv().NEXT_PUBLIC_APP_URL,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border-2 border-secondary px-8 py-4 text-sm font-bold text-secondary transition hover:bg-surface-low"
              >
                <MessageCircle className="h-4 w-4" /> Questions on WhatsApp
              </a>
              <Link href="/shop" className="flex items-center justify-center gap-2 rounded-full border px-8 py-4 text-sm font-bold text-foreground transition hover:border-secondary hover:text-secondary hover:shadow-md">
                <ShoppingBag className="h-4 w-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
