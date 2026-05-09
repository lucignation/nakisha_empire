import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminPromoManager from "@/components/admin/admin-promo-manager";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/server/admin-auth";
import { getAdminPromoCodeById } from "@/lib/server/promos";

export const dynamic = "force-dynamic";

export default async function AdminPromoDetailPage(props: { params: { id: string } }) {
  requireAdminSession();
  const promo = await getAdminPromoCodeById(props.params.id);

  if (!promo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b1020] p-5 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild className="border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800" variant="outline">
          <Link href="/admin/promotions">
            <ArrowLeft className="h-4 w-4" />
            Back to promotions
          </Link>
        </Button>

        <AdminPromoManager promo={promo} />
      </div>
    </div>
  );
}
