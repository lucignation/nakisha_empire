import OrderTrackingPanel from "@/components/order-tracking-panel";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Track Order"
};

export default function TrackOrderPage() {
  return (
    <section className="bg-[var(--brand-50)] py-12 sm:py-14 lg:py-16">
      <div className="container space-y-6">
        <Card className="border-[var(--brand-border)] bg-[linear-gradient(135deg,var(--brand-50)_0%,var(--brand-100)_58%,white_100%)]">
          <CardContent className="grid gap-5 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent-strong)]">
                Order Tracking
              </p>
              <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.04em] text-foreground sm:text-5xl">
                Follow every order from payment to delivery
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--brand-ink-soft)] sm:text-base sm:leading-8">
                Customers can track with either the order number or the payment transaction reference, together with the
                email used during checkout.
              </p>
            </div>
          </CardContent>
        </Card>

        <OrderTrackingPanel />
      </div>
    </section>
  );
}
