import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { connectDB, isDBConfigured } from "@/lib/db";
import Order from "@/models/Order";
import { formatPKR } from "@/lib/utils/currency";
import { bankTransferProvider } from "@/lib/payments/bank-transfer.provider";

export const metadata = { robots: { index: false } };

export default async function OrderSuccessPage({ params, searchParams }) {
  const { orderNumber } = await params;
  const sp = await searchParams;
  let order = null;
  let bankDetails = null;

  if (isDBConfigured()) {
    await connectDB();
    order = await Order.findOne({ orderNumber }).lean();
    if (order?.paymentMethod === "bank_transfer") {
      bankDetails = bankTransferProvider.getBankDetails();
    }
  }

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-2xl px-4 py-14 text-center">
        <div className="rounded-3xl border bg-card p-10">
          <h1 className="font-display text-3xl font-bold text-primary">Order Confirmed!</h1>
          <p className="text-urdu mt-2 text-secondary" dir="rtl" lang="ur">آپ کا آرڈر موصول ہو گیا</p>
          <p className="mt-4 text-2xl font-bold text-foreground">{orderNumber}</p>
          {order && <p className="mt-2 text-muted-foreground">Total: {formatPKR(order.total)}</p>}
          {sp?.payment === "bank_transfer" && bankDetails?.accountNumber && (
            <div className="mt-6 rounded-2xl bg-surface-low p-4 text-left text-sm">
              <p className="font-bold">Bank Transfer Instructions</p>
              <p className="mt-2">Account: {bankDetails.accountTitle}</p>
              <p>Number: {bankDetails.accountNumber}</p>
              <p>Bank: {bankDetails.bankName}</p>
              <p className="mt-2 font-semibold">Reference: {orderNumber}</p>
            </div>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/track-order" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Track Order</Link>
            <Link href="/shop" className="rounded-full border px-6 py-3 text-sm font-semibold">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
