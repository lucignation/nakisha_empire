import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminOrderManager from "@/components/admin/admin-order-manager";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/server/admin-auth";
import { getAdminOrderById } from "@/lib/server/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage(props: { params: { id: string } }) {
  requireAdminSession();
  const order = await getAdminOrderById(props.params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b1020] p-5 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild className="border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800" variant="outline">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </Button>

        <AdminOrderManager order={order} />
      </div>
    </div>
  );
}
