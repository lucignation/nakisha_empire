import Link from "next/link";
import { ArrowRight, CalendarDays, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Account"
};

const accountActions = [
  {
    title: "Book Consultation",
    description: "Choose a date and time for your skincare consultation from the live booking calendar.",
    href: "/consultation",
    label: "Open Consultation",
    icon: CalendarDays
  },
  {
    title: "View Cart",
    description: "Return to your bag, review products, and continue to payment with your preferred gateway.",
    href: "/cart",
    label: "Open Cart",
    icon: ShoppingBag
  },
  {
    title: "Track Order",
    description: "Use your order number or transaction reference together with your checkout email to follow delivery status.",
    href: "/track",
    label: "Track Items",
    icon: Truck
  }
];

export default function AccountPage() {
  return (
    <section className="bg-[var(--brand-50)] py-12 sm:py-14 lg:py-16">
      <div className="container space-y-6">
        <Card className="border-[var(--brand-border)] bg-white shadow-[0_18px_45px_rgba(77,53,53,0.06)]">
          <CardContent className="grid gap-6 px-6 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent-strong)]">
                Customer Hub
              </p>
              <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.04em] text-foreground sm:text-[3.2rem]">
                Manage your orders, bag, and skincare bookings in one place
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--brand-ink-soft)] sm:text-base sm:leading-8">
                The profile icon now opens a proper customer dashboard with fast access to consultation booking,
                checkout, and delivery tracking.
              </p>
            </div>

            <Button
              asChild
              className="min-w-[12rem] border-[var(--brand-border)] bg-[var(--brand-100)] text-[var(--brand-ink)] hover:bg-[var(--brand-200)]"
              size="lg"
              variant="secondary"
            >
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-3">
          {accountActions.map((action) => {
            const Icon = action.icon;

            return (
              <Card className="border-[var(--brand-border)] bg-white shadow-[0_12px_30px_rgba(77,53,53,0.05)]" key={action.href}>
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-accent-strong)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-7 text-[var(--brand-ink-soft)]">
                      {action.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    className="w-full justify-center border-[var(--brand-border)] bg-[var(--brand-50)] text-[var(--brand-ink)] hover:bg-[var(--brand-100)]"
                    variant="outline"
                  >
                    <Link href={action.href}>
                      {action.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
