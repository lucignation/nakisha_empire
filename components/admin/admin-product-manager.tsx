"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProductCategoryOptions, getProductCollectionOptions } from "@/lib/product-taxonomy";
import type { BackInStockSubscriptionRecord } from "@/lib/server/back-in-stock";
import type { AdminProductRecord } from "@/lib/server/products";

interface ProductDraft {
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  brand: string;
  size: string;
  price: number;
  salePrice: number | null;
  promoStartsAt: string;
  promoEndsAt: string;
  badge: string;
  collection: string;
  skinGoal: string;
  howToUse: string;
  highlights: string;
  ingredients: string;
  sku: string;
  trackInventory: boolean;
  stockQuantity: number;
  isOutOfStock: boolean;
  isPublished: boolean;
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function createDraft(product: AdminProductRecord): ProductDraft {
  return {
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    category: product.category,
    brand: product.brand,
    size: product.size,
    price: product.price,
    salePrice: product.salePrice ?? null,
    promoStartsAt: toDateTimeLocalValue(product.promoStartsAt),
    promoEndsAt: toDateTimeLocalValue(product.promoEndsAt),
    badge: product.badge || "Featured",
    collection: product.collection,
    skinGoal: product.skinGoal,
    howToUse: product.howToUse,
    highlights: product.highlights.join("\n"),
    ingredients: product.ingredients.join("\n"),
    sku: product.sku || "",
    trackInventory: product.trackInventory ?? true,
    stockQuantity: product.stockQuantity ?? 0,
    isOutOfStock: product.isOutOfStock ?? false,
    isPublished: product.isPublished ?? false
  };
}

function ProductImagePreview(props: {
  alt: string;
  fallbackSrc: string;
  selectedFile: File | null;
}) {
  const { alt, fallbackSrc, selectedFile } = props;
  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
      <img alt={alt} className="h-full w-full object-cover" src={previewUrl ?? fallbackSrc} />
    </div>
  );
}

export default function AdminProductManager(props: {
  product: AdminProductRecord;
  backInStockSubscribers: BackInStockSubscriptionRecord[];
}) {
  const { product, backInStockSubscribers } = props;
  const router = useRouter();
  const [draft, setDraft] = useState<ProductDraft>(() => createDraft(product));
  const [replacementImage, setReplacementImage] = useState<File | null>(null);
  const [galleryMedia, setGalleryMedia] = useState(() => product.galleryMedia ?? []);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [sendingBackInStock, setSendingBackInStock] = useState(false);
  const canNotifyWaitlist = draft.trackInventory ? !draft.isOutOfStock && draft.stockQuantity > 0 : !draft.isOutOfStock;
  const categoryOptions = useMemo(() => getProductCategoryOptions([product.category]), [product.category]);
  const collectionOptions = useMemo(() => getProductCollectionOptions([product.collection]), [product.collection]);

  function updateField<Key extends keyof ProductDraft>(key: Key, value: ProductDraft[Key]) {
    setDraft((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSave() {
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", draft.name);
      formData.append("shortDescription", draft.shortDescription);
      formData.append("description", draft.description);
      formData.append("category", draft.category);
      formData.append("brand", draft.brand);
      formData.append("size", draft.size);
      formData.append("price", String(draft.price));
      formData.append("salePrice", draft.salePrice ? String(draft.salePrice) : "");
      formData.append("promoStartsAt", draft.promoStartsAt);
      formData.append("promoEndsAt", draft.promoEndsAt);
      formData.append("badge", draft.badge);
      formData.append("collection", draft.collection);
      formData.append("skinGoal", draft.skinGoal);
      formData.append("highlights", draft.highlights);
      formData.append("ingredients", draft.ingredients);
      formData.append("howToUse", draft.howToUse);
      formData.append("sku", draft.sku);
      formData.append("trackInventory", String(draft.trackInventory));
      formData.append("stockQuantity", String(draft.stockQuantity));
      formData.append("isOutOfStock", String(draft.isOutOfStock));
      formData.append("isPublished", String(draft.isPublished));
      formData.append("galleryMedia", JSON.stringify(galleryMedia));

      if (replacementImage) {
        formData.append("image", replacementImage);
      }

      newGalleryImages.forEach((image) => formData.append("galleryImages", image));

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: formData
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Product update failed.");
      }

      toast.success("Product updated", {
        description: replacementImage ? "Details and product media were saved." : "Product details were saved."
      });

      setReplacementImage(null);
      setNewGalleryImages([]);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Unable to update product", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendBackInStockEmails() {
    setSendingBackInStock(true);

    try {
      const response = await fetch(`/api/admin/back-in-stock/${product.id}`, {
        method: "POST"
      });

      const payload = (await response.json()) as { success?: boolean; message?: string; sentCount?: number };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to send back-in-stock emails.");
      }

      toast.success("Back-in-stock emails sent", {
        description: `${payload.sentCount ?? 0} subscriber(s) were notified.`
      });

      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Unable to send back-in-stock emails", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSendingBackInStock(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Update catalogue copy, promo pricing, publishing state, and merchandising details.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={draft.isPublished ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-700"} variant="outline">
              {draft.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge className={draft.isOutOfStock ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"} variant="outline">
              {draft.isOutOfStock ? "Out of stock" : `${draft.stockQuantity} in stock`}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-5">
              <ProductImagePreview alt={product.name} fallbackSrc={product.image} selectedFile={replacementImage} />
              <div className="space-y-2">
                <Label htmlFor="replace-image">Replace cover image</Label>
                <Input
                  accept="image/*"
                  id="replace-image"
                  onChange={(event) => setReplacementImage(event.target.files?.[0] ?? null)}
                  type="file"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-sm font-semibold text-slate-950">Gallery images</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Customers will be able to click through every image on the product page.</p>
              </div>

              {galleryMedia.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No extra gallery images yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {galleryMedia.map((image) => (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3" key={image.publicId ?? image.url}>
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <img alt={product.name} className="h-full w-full object-cover" src={image.url} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs leading-5 text-slate-500">{image.url}</p>
                          <Button
                            className="mt-3"
                            onClick={() =>
                              setGalleryMedia((current) => current.filter((item) => (item.publicId ?? item.url) !== (image.publicId ?? image.url)))
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="gallery-images">Add gallery images</Label>
                <Input
                  accept="image/*"
                  id="gallery-images"
                  multiple
                  onChange={(event) => setNewGalleryImages(Array.from(event.target.files ?? []))}
                  type="file"
                />
                {newGalleryImages.length > 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    {newGalleryImages.length} new image(s) selected:
                    <ul className="mt-2 list-disc pl-5">
                      {newGalleryImages.map((file) => (
                        <li key={`${file.name}-${file.size}`}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input onChange={(event) => updateField("name", event.target.value)} value={draft.name} />
              </div>
              <div className="grid gap-2">
                <Label>Short description</Label>
                <Input onChange={(event) => updateField("shortDescription", event.target.value)} value={draft.shortDescription} />
              </div>
              <div className="grid gap-2">
                <Label>Regular price</Label>
                <Input onChange={(event) => updateField("price", Number(event.target.value))} type="number" value={draft.price} />
              </div>
              <div className="grid gap-2">
                <Label>Promo price</Label>
                <Input
                  onChange={(event) => updateField("salePrice", event.target.value ? Number(event.target.value) : null)}
                  placeholder="Optional"
                  type="number"
                  value={draft.salePrice ?? ""}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="grid gap-2">
                <Label>Promo start</Label>
                <Input onChange={(event) => updateField("promoStartsAt", event.target.value)} type="datetime-local" value={draft.promoStartsAt} />
              </div>
              <div className="grid gap-2">
                <Label>Promo end</Label>
                <Input onChange={(event) => updateField("promoEndsAt", event.target.value)} type="datetime-local" value={draft.promoEndsAt} />
              </div>
              <div className="grid gap-2">
                <Label>Stock quantity</Label>
                <Input onChange={(event) => updateField("stockQuantity", Number(event.target.value))} type="number" value={draft.stockQuantity} />
              </div>
              <div className="grid gap-2">
                <Label>SKU</Label>
                <Input onChange={(event) => updateField("sku", event.target.value)} value={draft.sku} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="grid gap-2">
                <Label>Brand</Label>
                <Input onChange={(event) => updateField("brand", event.target.value)} value={draft.brand} />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <select
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                  onChange={(event) => updateField("category", event.target.value)}
                  value={draft.category}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Collection</Label>
                <select
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                  onChange={(event) => updateField("collection", event.target.value)}
                  value={draft.collection}
                >
                  {collectionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Skin goal</Label>
                <Input onChange={(event) => updateField("skinGoal", event.target.value)} value={draft.skinGoal} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea onChange={(event) => updateField("description", event.target.value)} value={draft.description} />
              </div>
              <div className="grid gap-2">
                <Label>How to use</Label>
                <Textarea onChange={(event) => updateField("howToUse", event.target.value)} value={draft.howToUse} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-2">
                <Label>Highlights</Label>
                <Textarea onChange={(event) => updateField("highlights", event.target.value)} value={draft.highlights} />
              </div>
              <div className="grid gap-2">
                <Label>Ingredients</Label>
                <Textarea onChange={(event) => updateField("ingredients", event.target.value)} value={draft.ingredients} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {[
                { key: "trackInventory", label: "Track inventory" },
                { key: "isOutOfStock", label: "Out of stock" },
                { key: "isPublished", label: "Published" }
              ].map((item) => (
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700" key={item.key}>
                  <input
                    checked={draft[item.key as keyof ProductDraft] as boolean}
                    className="h-4 w-4 accent-blue-600"
                    onChange={(event) =>
                      updateField(item.key as "trackInventory" | "isOutOfStock" | "isPublished", event.target.checked)
                    }
                    type="checkbox"
                  />
                  {item.label}
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <Button className="bg-slate-950 hover:bg-slate-800" disabled={saving} onClick={handleSave} type="button">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Back-in-stock waitlist</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Customers who requested an email when this product becomes available again.
            </p>
          </div>
          <Button
            className="bg-slate-950 hover:bg-slate-800"
            disabled={sendingBackInStock || backInStockSubscribers.length === 0 || !canNotifyWaitlist}
            onClick={handleSendBackInStockEmails}
            type="button"
          >
            {sendingBackInStock ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Send Restock Email
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {backInStockSubscribers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Nobody has requested a restock email for this product yet.
            </div>
          ) : (
            backInStockSubscribers.map((subscriber) => (
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between" key={subscriber.id}>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{subscriber.email}</p>
                  <p className="mt-1 text-xs text-slate-500">Requested {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(subscriber.createdAt))}</p>
                </div>
                <Badge variant="outline">
                  {subscriber.notifiedAt
                    ? `Notified ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(subscriber.notifiedAt))}`
                    : "Awaiting notification"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
