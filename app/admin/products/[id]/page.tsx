import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminProductManager from "@/components/admin/admin-product-manager";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/server/admin-auth";
import { getBackInStockSubscriptions } from "@/lib/server/back-in-stock";
import { getAdminProductById } from "@/lib/server/products";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage(props: { params: { id: string } }) {
  requireAdminSession();
  const [product, backInStockSubscribers] = await Promise.all([
    getAdminProductById(props.params.id),
    getBackInStockSubscriptions(props.params.id)
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b1020] p-5 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild className="border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800" variant="outline">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </Button>

        <AdminProductManager backInStockSubscribers={backInStockSubscribers} product={product} />
      </div>
    </div>
  );
}
