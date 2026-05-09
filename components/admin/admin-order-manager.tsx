"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/data";
import type { AdminOrderRecord } from "@/lib/server/admin-dashboard";

const orderStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

function formatDateTime(value?: string) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getStatusLabel(status: AdminOrderRecord["status"]) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PROCESSING":
      return "In Process";
    case "SHIPPED":
      return "In Transit";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function getStatusClassName(status: AdminOrderRecord["status"]) {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "PROCESSING":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "SHIPPED":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function AdminOrderManager(props: { order: AdminOrderRecord }) {
  const { order } = props;
  const router = useRouter();
  const [status, setStatus] = useState<AdminOrderRecord["status"]>(order.status);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status
        })
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to update order status.");
      }

      toast.success("Order updated", {
        description: `Order status was changed to ${getStatusLabel(status)}.`
      });

      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Order update failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Review payment, customer details, and move this sale through fulfilment.
            </p>
          </div>
          <Badge className={getStatusClassName(status)} variant="outline">
            {getStatusLabel(status)}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_20rem]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Order details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Detail label="Customer" value={order.customerName} />
              <Detail label="Email" value={order.customerEmail} />
              <Detail label="Phone" value={order.customerPhone ?? "N/A"} />
              <Detail label="Delivery state" value={order.deliveryStateName} />
              <Detail label="Gateway" value={order.paymentGateway ?? "N/A"} />
              <Detail label="Reference" value={order.paymentReference ?? "N/A"} />
              <Detail label="Placed" value={formatDateTime(order.createdAt)} />
              <Detail label="Updated" value={formatDateTime(order.updatedAt)} />
              <Detail label="Promo" value={order.promoCode ?? "None"} />
              <Detail label="Discount" value={order.discountAmount > 0 ? formatCurrency(order.discountAmount) : "₦0"} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Delivery address</p>
              <p className="mt-2 text-sm leading-7 text-slate-950">{order.deliveryAddress}</p>
              <p className="mt-1 text-sm text-slate-500">{order.deliveryStateName}, Nigeria</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SummaryCard label="Subtotal" value={formatCurrency(order.subtotalAmount)} />
              <SummaryCard label="Shipping" value={formatCurrency(order.shippingAmount)} />
              <SummaryCard label="Total" value={formatCurrency(order.totalAmount)} />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Items</h3>
              <div className="grid gap-3">
                {order.items.map((item) => (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={item.id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.productName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-950">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Fulfilment control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
              onChange={(event) => setStatus(event.target.value as AdminOrderRecord["status"])}
              value={status}
            >
              {orderStatuses.map((item) => (
                <option key={item} value={item}>
                  {getStatusLabel(item)}
                </option>
              ))}
            </select>

            <Button className="w-full justify-center" disabled={saving} onClick={handleSave} type="button">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              Save Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{props.label}</p>
      <p className="mt-2 text-sm font-medium text-slate-950">{props.value}</p>
    </div>
  );
}

function SummaryCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{props.label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{props.value}</p>
    </div>
  );
}
