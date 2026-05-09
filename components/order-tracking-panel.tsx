"use client";

import { useState } from "react";
import { Loader2, PackageCheck, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/data";

type TrackableStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface TrackedOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  status: TrackableStatus;
  paymentGateway?: string | null;
  paymentReference?: string | null;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  promoCode?: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const statusSteps: Array<{
  key: Exclude<TrackableStatus, "PAID" | "CANCELLED">;
  label: string;
}> = [
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "In Process" },
  { key: "SHIPPED", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered" }
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getStepState(currentStatus: TrackableStatus, step: (typeof statusSteps)[number]["key"]) {
  const order = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const normalizedStatus = currentStatus === "PAID" ? "PENDING" : currentStatus;

  if (normalizedStatus === "CANCELLED") {
    return "inactive";
  }

  const activeIndex = order.indexOf(normalizedStatus);
  const stepIndex = order.indexOf(step);

  if (stepIndex < activeIndex) {
    return "complete";
  }

  if (stepIndex === activeIndex) {
    return "active";
  }

  return "inactive";
}

export default function OrderTrackingPanel() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference,
          email
        })
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        order?: TrackedOrder;
      };

      if (!response.ok || !payload.success || !payload.order) {
        throw new Error(payload.message ?? "We could not find that order.");
      }

      setOrder(payload.order);
    } catch (error) {
      setOrder(null);
      toast.error("Order lookup failed", {
        description: error instanceof Error ? error.message : "Please check the details and try again."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
      <Card className="border-[var(--brand-border)] bg-white/90 shadow-soft">
        <CardHeader>
          <CardTitle>Track an order</CardTitle>
          <CardDescription>
            Enter the short order number or payment transaction reference together with the email used during checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLookup}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Order number or transaction ID</label>
              <Input
                onChange={(event) => setReference(event.target.value)}
                placeholder="NKE-A1B2C3 or PS-..."
                value={reference}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Email address</label>
              <Input onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
            </div>
            <Button className="w-full justify-center" disabled={loading} size="lg" type="submit">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Checking order..." : "Track Order"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[var(--brand-border)] bg-white/90 shadow-soft">
        <CardHeader>
          <CardTitle>{order ? order.orderNumber : "Tracking results"}</CardTitle>
          <CardDescription>
            {order
              ? `Last updated ${formatDateTime(order.updatedAt)}`
              : "Your order status, items, and payment summary will appear here once a match is found."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!order ? (
            <div className="rounded-[20px] border border-dashed border-[var(--brand-border)] bg-[var(--brand-50)] p-5 text-sm leading-7 text-muted-foreground">
              Use the order number returned after checkout, or the payment reference from Paystack or Flutterwave.
            </div>
          ) : (
            <>
              {order.status === "CANCELLED" ? (
                <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  This order is currently cancelled. Reach support if you need a replacement or manual review.
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-[var(--brand-border)] bg-[var(--brand-50)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Customer</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{order.customerName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{order.customerEmail}</p>
                </div>
                <div className="rounded-[18px] border border-[var(--brand-border)] bg-[var(--brand-50)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Payment</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{order.paymentGateway ?? "Gateway unavailable"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{order.paymentReference ?? "No payment reference"}</p>
                </div>
              </div>

              <div className="grid gap-3">
                {statusSteps.map((step) => {
                  const state = getStepState(order.status, step.key);

                  return (
                    <div
                      className={`flex items-center gap-3 rounded-[18px] border px-4 py-3 ${
                        state === "complete"
                          ? "border-emerald-200 bg-emerald-50"
                          : state === "active"
                            ? "border-[var(--brand-400)] bg-[var(--brand-100)]"
                            : "border-[var(--brand-border)] bg-[var(--brand-50)]"
                      }`}
                      key={step.key}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          state === "complete"
                            ? "bg-emerald-600 text-white"
                            : state === "active"
                              ? "bg-[var(--brand-400)] text-[var(--brand-ink)]"
                              : "bg-white text-muted-foreground"
                        }`}
                      >
                        {step.key === "DELIVERED" ? <PackageCheck className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{step.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {state === "complete" ? "Completed" : state === "active" ? "Current stage" : "Upcoming"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div className="flex items-center justify-between rounded-[18px] border border-[var(--brand-border)] px-4 py-3" key={item.id}>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[20px] border border-[var(--brand-border)] bg-[var(--brand-50)] p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(order.subtotalAmount)}</strong>
                </div>
                {order.discountAmount > 0 ? (
                  <div className="mt-2 flex items-center justify-between text-[#b46b6b]">
                    <span>Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
                    <strong>- {formatCurrency(order.discountAmount)}</strong>
                  </div>
                ) : null}
                <div className="mt-2 flex items-center justify-between">
                  <span>Delivery</span>
                  <strong>{formatCurrency(order.shippingAmount)}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--brand-border)] pt-3">
                  <span className="font-medium">Total</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
