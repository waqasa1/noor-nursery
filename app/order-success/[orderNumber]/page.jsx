import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { connectDB, isDBConfigured } from "@/lib/db";
import Order from "@/models/Order";
import { formatPKR } from "@/lib/utils/currency";
import { bankTransferProvider } from "@/lib/payments/bank-transfer.provider";
import { CheckCircle2, Truck, ShoppingBag } from "lucide-react";

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
      <div className="mx-auto max-w-3xl px-4 py-16 lg:py-24">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="bg-primary px-8 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-leaf text-leaf-foreground shadow-lg">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">Order Confirmed!</h1>
            <p className="text-urdu mt-3 text-xl text-primary-foreground/90" dir="rtl" lang="ur">آپ کا آرڈر موصول ہو گیا</p>
            <p className="mt-6 text-lg text-primary-foreground/80">Thank you for your purchase. Your order number is:</p>
            <p className="mt-2 text-3xl font-bold tracking-wider">{orderNumber}</p>
          </div>
          
          <div className="px-8 py-10 sm:px-12 sm:py-12">
            {order && (
              <div className="flex items-center justify-between border-b pb-6">
                <span className="text-lg text-muted-foreground">Total Amount</span>
                <span className="font-display text-2xl font-bold text-primary">{formatPKR(order.total)}</span>
              </div>
            )}
            
            {sp?.payment === "bank_transfer" && bankDetails?.accountNumber && (
              <div className="mt-8 rounded-2xl bg-surface-low p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-foreground">Bank Transfer Instructions</h3>
                <p className="mt-2 text-sm text-muted-foreground">Please transfer the total amount to the following account to process your order.</p>
                <div className="mt-6 space-y-4 rounded-xl border bg-card p-5">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account Title</span>
                    <span className="font-medium text-foreground">{bankDetails.accountTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account Number</span>
                    <span className="font-mono font-medium text-foreground">{bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Bank Name</span>
                    <span className="font-medium text-foreground">{bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-sm font-bold text-foreground">Reference</span>
                    <span className="font-bold text-primary">{orderNumber}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/track-order" className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition hover:bg-forest hover:shadow-lg">
                <Truck className="h-4 w-4" /> Track Order
              </Link>
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
