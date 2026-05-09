"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminProductRecord } from "@/lib/server/products";

export default function AdminInventoryManager(props: { product: AdminProductRecord }) {
  const { product } = props;
  const router = useRouter();
  const [stockQuantity, setStockQuantity] = useState(product.stockQuantity ?? 0);
  const [trackInventory, setTrackInventory] = useState(product.trackInventory ?? true);
  const [isOutOfStock, setIsOutOfStock] = useState(product.isOutOfStock ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("shortDescription", product.shortDescription);
      formData.append("description", product.description);
      formData.append("category", product.category);
      formData.append("brand", product.brand);
      formData.append("size", product.size);
      formData.append("price", String(product.price));
      formData.append("salePrice", product.salePrice ? String(product.salePrice) : "");
      formData.append("promoStartsAt", product.promoStartsAt ?? "");
      formData.append("promoEndsAt", product.promoEndsAt ?? "");
      formData.append("badge", product.badge);
      formData.append("collection", product.collection);
      formData.append("skinGoal", product.skinGoal);
      formData.append("highlights", product.highlights.join("\n"));
      formData.append("ingredients", product.ingredients.join("\n"));
      formData.append("howToUse", product.howToUse);
      formData.append("sku", product.sku ?? "");
      formData.append("isPublished", String(product.isPublished ?? false));
      formData.append("trackInventory", String(trackInventory));
      formData.append("stockQuantity", String(stockQuantity));
      formData.append("isOutOfStock", String(isOutOfStock));

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: formData
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Inventory update failed.");
      }

      toast.success("Inventory updated", {
        description: "Stock levels and availability were saved."
      });

      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Unable to update inventory", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">Adjust stock levels, stock tracking, and live availability.</p>
          </div>
          <Badge className={isOutOfStock ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"} variant="outline">
            {isOutOfStock ? "Out of stock" : `${stockQuantity} available`}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Product name</Label>
              <Input disabled value={product.name} />
            </div>
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input disabled value={product.sku ?? "No SKU"} />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Input disabled value={product.category} />
            </div>
            <div className="grid gap-2">
              <Label>Unit price</Label>
              <Input disabled value={String(product.price)} />
            </div>
            <div className="grid gap-2">
              <Label>Stock quantity</Label>
              <Input onChange={(event) => setStockQuantity(Number(event.target.value))} type="number" value={stockQuantity} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Availability rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                checked={trackInventory}
                className="h-4 w-4 accent-blue-600"
                onChange={(event) => setTrackInventory(event.target.checked)}
                type="checkbox"
              />
              Track inventory automatically
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                checked={isOutOfStock}
                className="h-4 w-4 accent-blue-600"
                onChange={(event) => setIsOutOfStock(event.target.checked)}
                type="checkbox"
              />
              Mark as out of stock
            </label>

            <Button className="w-full justify-center" disabled={saving} onClick={handleSave} type="button">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
