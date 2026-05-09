import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/data";
import { requireAdminSession } from "@/lib/server/admin-auth";
import { getAdminCustomerByEmail } from "@/lib/server/admin-dashboard";

export const dynamic = "force-dynamic";

function formatDateTime(value?: string) {
  if (!value) {
    return "No activity";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getStatusLabel(status?: string) {
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
      return status ?? "No status";
  }
}

function getStatusClassName(status?: string) {
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

export default async function AdminCustomerDetailPage(props: { params: { email: string } }) {
  requireAdminSession();
  const email = decodeURIComponent(props.params.email);
  const detail = await getAdminCustomerByEmail(email);

  if (!detail.customer) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b1020] p-5 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild className="border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800" variant="outline">
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </Link>
        </Button>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-2xl">{detail.customer.name}</CardTitle>
              <p className="mt-2 text-sm text-slate-500">{detail.customer.email}</p>
              {detail.customer.phone ? <p className="mt-1 text-sm text-slate-500">{detail.customer.phone}</p> : null}
            </div>
            <Badge className={getStatusClassName(detail.customer.latestStatus)} variant="outline">
              {getStatusLabel(detail.customer.latestStatus)}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Metric label="Orders" value={String(detail.customer.ordersCount)} />
            <Metric label="Total spent" value={formatCurrency(detail.customer.totalSpent)} />
            <Metric label="Last order" value={formatDateTime(detail.customer.lastOrderAt)} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Customer orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Placed</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-slate-950">{order.orderNumber}</TableCell>
                      <TableCell>
                        <Badge className={getStatusClassName(order.status)} variant="outline">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.paymentGateway ?? "N/A"}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/orders/${order.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{props.label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{props.value}</p>
    </div>
  );
}
