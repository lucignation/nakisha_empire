"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, LogOut, PackagePlus, RefreshCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, type Product } from "@/lib/data";
import type { InventoryActivityRecord } from "@/lib/server/products";

interface AdminProductsManagerProps {
  initialProducts: Product[];
  sessionEmail: string;
  databaseConnected: boolean;
  cloudinaryConfigured: boolean;
  directDatabaseConfigured: boolean;
  recentInventoryLogs: InventoryActivityRecord[];
}

interface ProductDraft {
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  brand: string;
  size: string;
  price: number;
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

function createDraft(product: Product): ProductDraft {
  return {
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    category: product.category,
    brand: product.brand,
    size: product.size,
    price: product.price,
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

function formatDateTime(value?: string) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function ProductImagePreview(props: {
  alt: string;
  fallbackSrc: string;
  selectedFile: File | null;
  sizeClassName?: string;
}) {
  const { alt, fallbackSrc, selectedFile, sizeClassName = "h-24 w-24" } = props;
  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={`overflow-hidden rounded-[18px] border border-[#eadfce] bg-[#faf6f1] ${sizeClassName}`}>
      <img alt={alt} className="h-full w-full object-cover" src={previewUrl ?? fallbackSrc} />
    </div>
  );
}

export default function AdminProductsManager(props: AdminProductsManagerProps) {
  const {
    initialProducts,
    sessionEmail,
    databaseConnected,
    cloudinaryConfigured,
    directDatabaseConfigured,
    recentInventoryLogs
  } = props;
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [replacementImages, setReplacementImages] = useState<Record<string, File | null>>({});
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    category: "",
    brand: "",
    size: "",
    price: "",
    badge: "New",
    collection: "",
    skinGoal: "",
    howToUse: "",
    sku: "",
    highlights: "",
    ingredients: "",
    trackInventory: true,
    stockQuantity: "0",
    isOutOfStock: false,
    isPublished: false
  });
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>(() =>
    Object.fromEntries(
      initialProducts
        .filter((product) => product.id)
        .map((product) => [product.id as string, createDraft(product)])
    )
  );

  const managedProducts = useMemo(
    () => initialProducts.filter((product) => !String(product.id).startsWith("fallback-")),
    [initialProducts]
  );

  function updateCreateField<Key extends keyof typeof createForm>(key: Key, value: (typeof createForm)[Key]) {
    setCreateForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updateDraftField(productId: string, key: keyof ProductDraft, value: string | number | boolean) {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [key]: value
      }
    }));
  }

  function setReplacementImage(productId: string, file: File | null) {
    setReplacementImages((current) => ({
      ...current,
      [productId]: file
    }));
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST"
      });

      startTransition(() => {
        router.push("/admin/login");
        router.refresh();
      });
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!databaseConnected) {
      toast.error("Database is not connected", {
        description: "Add DATABASE_URL before creating products."
      });
      return;
    }

    if (!cloudinaryConfigured) {
      toast.error("Cloudinary is not configured", {
        description: "Add your Cloudinary credentials before uploading products."
      });
      return;
    }

    if (!productImage) {
      toast.error("Choose a product image before uploading.");
      return;
    }

    setCreating(true);

    try {
      const formData = new FormData();
      formData.append("name", createForm.name);
      formData.append("slug", createForm.slug);
      formData.append("shortDescription", createForm.shortDescription);
      formData.append("description", createForm.description);
      formData.append("category", createForm.category);
      formData.append("brand", createForm.brand);
      formData.append("size", createForm.size);
      formData.append("price", createForm.price);
      formData.append("badge", createForm.badge);
      formData.append("collection", createForm.collection);
      formData.append("skinGoal", createForm.skinGoal);
      formData.append("howToUse", createForm.howToUse);
      formData.append("sku", createForm.sku);
      formData.append("highlights", createForm.highlights);
      formData.append("ingredients", createForm.ingredients);
      formData.append("trackInventory", String(createForm.trackInventory));
      formData.append("stockQuantity", createForm.stockQuantity);
      formData.append("isOutOfStock", String(createForm.isOutOfStock));
      formData.append("isPublished", String(createForm.isPublished));
      formData.append("image", productImage);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Product upload failed.");
      }

      toast.success("Product uploaded", {
        description: "The new product has been saved and is ready to publish."
      });

      setCreateForm({
        name: "",
        slug: "",
        shortDescription: "",
        description: "",
        category: "",
        brand: "",
        size: "",
        price: "",
        badge: "New",
        collection: "",
        skinGoal: "",
        howToUse: "",
        sku: "",
        highlights: "",
        ingredients: "",
        trackInventory: true,
        stockQuantity: "0",
        isOutOfStock: false,
        isPublished: false
      });
      setProductImage(null);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Product upload failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveProduct(productId: string) {
    const draft = drafts[productId];

    if (!draft) {
      return;
    }

    setSavingId(productId);

    try {
      const formData = new FormData();
      formData.append("name", draft.name);
      formData.append("shortDescription", draft.shortDescription);
      formData.append("description", draft.description);
      formData.append("category", draft.category);
      formData.append("brand", draft.brand);
      formData.append("size", draft.size);
      formData.append("price", String(draft.price));
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

      const replacementImage = replacementImages[productId];

      if (replacementImage) {
        formData.append("image", replacementImage);
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        body: formData
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Product update failed.");
      }

      toast.success("Product updated", {
        description: replacementImage
          ? "Product details and Cloudinary image were updated."
          : "Product details and stock levels were saved successfully."
      });

      setReplacementImage(productId, null);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Unable to update product", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSavingId(null);
    }
  }

  const environmentCards = [
    {
      title: "Neon runtime",
      value: databaseConnected ? "Connected" : "Missing DATABASE_URL"
    },
    {
      title: "Prisma direct sync",
      value: directDatabaseConfigured ? "DIRECT_URL ready" : "Add DIRECT_URL for db push"
    },
    {
      title: "Cloudinary upload",
      value: cloudinaryConfigured ? "Connected" : "Missing Cloudinary keys"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-[#eadfce] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9c7530]">Signed in as</p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">{sessionEmail}</h1>
          <p className="mt-2 text-sm text-[#8f7767]">
            Upload products, replace images, publish items, and control live stock from one dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.refresh()} type="button" variant="outline">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button disabled={loggingOut} onClick={handleLogout} type="button" variant="outline">
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <Card className="border-[#eadfce] bg-white">
          <CardHeader>
            <CardTitle>Upload a new product</CardTitle>
            <CardDescription>
              Create a real product record in Neon and upload the product image to Cloudinary in one flow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleCreateProduct}>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
                <div className="space-y-3">
                  <Label htmlFor="product-image">Product image</Label>
                  <ProductImagePreview
                    alt={createForm.name || "New product"}
                    fallbackSrc="https://placehold.co/800x800/f7efe2/8f7767?text=Nakisha+Empire"
                    selectedFile={productImage}
                    sizeClassName="aspect-square h-auto w-full"
                  />
                  <Input
                    accept="image/*"
                    id="product-image"
                    onChange={(event) => setProductImage(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                  <p className="text-xs leading-6 text-[#8f7767]">
                    Upload a sharp square or portrait image. Cloudinary stores the file and the product record keeps the
                    CDN URL and public ID.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="product-name">Product name</Label>
                      <Input id="product-name" onChange={(event) => updateCreateField("name", event.target.value)} value={createForm.name} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product-slug">Slug (optional)</Label>
                      <Input
                        id="product-slug"
                        onChange={(event) => updateCreateField("slug", event.target.value)}
                        placeholder="auto-generated-from-name"
                        value={createForm.slug}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="product-brand">Brand</Label>
                      <Input id="product-brand" onChange={(event) => updateCreateField("brand", event.target.value)} value={createForm.brand} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product-category">Category</Label>
                      <Input
                        id="product-category"
                        onChange={(event) => updateCreateField("category", event.target.value)}
                        value={createForm.category}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="product-price">Price (NGN)</Label>
                      <Input
                        id="product-price"
                        min="0"
                        onChange={(event) => updateCreateField("price", event.target.value)}
                        type="number"
                        value={createForm.price}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product-size">Size</Label>
                      <Input id="product-size" onChange={(event) => updateCreateField("size", event.target.value)} value={createForm.size} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product-badge">Badge</Label>
                      <Input id="product-badge" onChange={(event) => updateCreateField("badge", event.target.value)} value={createForm.badge} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="product-collection">Collection</Label>
                      <Input
                        id="product-collection"
                        onChange={(event) => updateCreateField("collection", event.target.value)}
                        value={createForm.collection}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product-skin-goal">Skin goal</Label>
                      <Input
                        id="product-skin-goal"
                        onChange={(event) => updateCreateField("skinGoal", event.target.value)}
                        value={createForm.skinGoal}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product-short-description">Short description</Label>
                <Textarea
                  id="product-short-description"
                  onChange={(event) => updateCreateField("shortDescription", event.target.value)}
                  value={createForm.shortDescription}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product-description">Full description</Label>
                <Textarea
                  id="product-description"
                  onChange={(event) => updateCreateField("description", event.target.value)}
                  value={createForm.description}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-highlights">Highlights</Label>
                  <Textarea
                    id="product-highlights"
                    onChange={(event) => updateCreateField("highlights", event.target.value)}
                    placeholder="One highlight per line"
                    value={createForm.highlights}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="product-ingredients">Ingredients</Label>
                  <Textarea
                    id="product-ingredients"
                    onChange={(event) => updateCreateField("ingredients", event.target.value)}
                    placeholder="One ingredient per line"
                    value={createForm.ingredients}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product-how-to-use">How to use</Label>
                <Textarea
                  id="product-how-to-use"
                  onChange={(event) => updateCreateField("howToUse", event.target.value)}
                  value={createForm.howToUse}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-sku">SKU (optional)</Label>
                  <Input id="product-sku" onChange={(event) => updateCreateField("sku", event.target.value)} value={createForm.sku} />
                </div>
                <div className="grid gap-2 sm:max-w-[12rem]">
                  <Label htmlFor="product-stock">Stock quantity</Label>
                  <Input
                    id="product-stock"
                    min="0"
                    onChange={(event) => updateCreateField("stockQuantity", event.target.value)}
                    type="number"
                    value={createForm.stockQuantity}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex items-center gap-3 rounded-[16px] border border-[#eadfce] bg-[#faf6f1] px-4 py-3 text-sm text-[#6b4f3a]">
                  <input
                    checked={createForm.trackInventory}
                    className="h-4 w-4 accent-[#b8924a]"
                    onChange={(event) => updateCreateField("trackInventory", event.target.checked)}
                    type="checkbox"
                  />
                  Track inventory
                </label>

                <label className="flex items-center gap-3 rounded-[16px] border border-[#eadfce] bg-[#faf6f1] px-4 py-3 text-sm text-[#6b4f3a]">
                  <input
                    checked={createForm.isOutOfStock}
                    className="h-4 w-4 accent-[#b8924a]"
                    onChange={(event) => updateCreateField("isOutOfStock", event.target.checked)}
                    type="checkbox"
                  />
                  Mark out of stock
                </label>

                <label className="flex items-center gap-3 rounded-[16px] border border-[#eadfce] bg-[#faf6f1] px-4 py-3 text-sm text-[#6b4f3a]">
                  <input
                    checked={createForm.isPublished}
                    className="h-4 w-4 accent-[#b8924a]"
                    onChange={(event) => updateCreateField("isPublished", event.target.checked)}
                    type="checkbox"
                  />
                  Publish now
                </label>
              </div>

              <Button className="w-full justify-center" disabled={creating || !databaseConnected || !cloudinaryConfigured} size="lg" type="submit">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {creating ? "Uploading product..." : "Create Product"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-[#eadfce] bg-white">
            <CardHeader>
              <CardTitle>Environment status</CardTitle>
              <CardDescription>These checks tell you whether the backend product flow is fully connected.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {environmentCards.map((item) => (
                <div className="rounded-[18px] border border-[#eadfce] bg-[#faf6f1] p-4" key={item.title}>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">{item.title}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[#eadfce] bg-white">
            <CardHeader>
              <CardTitle>Recent inventory activity</CardTitle>
              <CardDescription>Each stock adjustment is logged so product movement stays auditable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentInventoryLogs.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-[#eadfce] bg-[#faf6f1] p-5 text-sm leading-6 text-[#6b4f3a]">
                  Inventory activity will show up here after the first stock update or new product upload.
                </div>
              ) : (
                recentInventoryLogs.map((log) => (
                  <div className="rounded-[18px] border border-[#eadfce] bg-[#fffdf9] p-4" key={log.id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{log.productName}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#9c7f6e]">{log.reason}</p>
                      </div>
                      <p className="text-xs text-[#8f7767]">{formatDateTime(log.createdAt)}</p>
                    </div>
                    <p className="mt-3 text-sm text-[#6b4f3a]">
                      {log.quantityBefore} → {log.quantityAfter}
                      <span className={`ml-2 font-semibold ${log.changeAmount >= 0 ? "text-[#2f7a4f]" : "text-[#a44b3a]"}`}>
                        {log.changeAmount >= 0 ? `+${log.changeAmount}` : log.changeAmount}
                      </span>
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-[#eadfce] bg-white">
        <CardHeader>
          <CardTitle>Existing products</CardTitle>
          <CardDescription>
            Edit the live catalogue, replace product photos, publish or hide products, and manage stock in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {managedProducts.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#eadfce] bg-[#faf6f1] p-5 text-sm leading-6 text-[#6b4f3a]">
              No database-backed products yet. Use the upload form to create the first product in Neon.
            </div>
          ) : (
            managedProducts.map((product) => {
              const productId = product.id as string;
              const draft = drafts[productId] ?? createDraft(product);
              const isSaving = savingId === productId;
              const replacementImage = replacementImages[productId] ?? null;

              return (
                <Card className="border-[#eadfce] bg-[#fffdf9] shadow-none" key={productId}>
                  <CardContent className="space-y-5 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
                        <div className="space-y-3">
                          <ProductImagePreview
                            alt={product.name}
                            fallbackSrc={product.image}
                            selectedFile={replacementImage}
                            sizeClassName="aspect-square h-auto w-full"
                          />
                          <div className="space-y-2">
                            <Label htmlFor={`replace-image-${productId}`}>Replace image</Label>
                            <Input
                              accept="image/*"
                              id={`replace-image-${productId}`}
                              onChange={(event) => setReplacementImage(productId, event.target.files?.[0] ?? null)}
                              type="file"
                            />
                            <p className="text-xs leading-6 text-[#8f7767]">
                              Uploading a new file replaces the current Cloudinary asset on save.
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[#e2d4bf] bg-[#faf6f1] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7530]">
                              {draft.badge}
                            </span>
                            <span className="rounded-full border border-[#e2d4bf] bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#8f7767]">
                              {draft.isPublished ? "Published" : "Draft"}
                            </span>
                            <span className="rounded-full border border-[#e2d4bf] bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#8f7767]">
                              {draft.trackInventory ? `${draft.stockQuantity} in stock` : "Manual stock mode"}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-semibold text-foreground">{product.name}</h3>
                          <p className="mt-1 text-sm text-[#8f7767]">
                            {product.category} · {product.brand} · {formatCurrency(product.price)}
                          </p>
                          <div className="mt-3 grid gap-2 text-xs uppercase tracking-[0.14em] text-[#9c7f6e] sm:grid-cols-2">
                            <p>Slug: {product.slug}</p>
                            <p>Last updated: {formatDateTime(product.updatedAt)}</p>
                          </div>
                        </div>
                      </div>

                      <Button disabled={isSaving} onClick={() => handleSaveProduct(productId)} size="sm" type="button">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input onChange={(event) => updateDraftField(productId, "name", event.target.value)} value={draft.name} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Short description</Label>
                        <Input
                          onChange={(event) => updateDraftField(productId, "shortDescription", event.target.value)}
                          value={draft.shortDescription}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="grid gap-2">
                        <Label>Price (NGN)</Label>
                        <Input
                          min="0"
                          onChange={(event) => updateDraftField(productId, "price", Number(event.target.value))}
                          type="number"
                          value={draft.price}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Size</Label>
                        <Input onChange={(event) => updateDraftField(productId, "size", event.target.value)} value={draft.size} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Badge</Label>
                        <Input onChange={(event) => updateDraftField(productId, "badge", event.target.value)} value={draft.badge} />
                      </div>
                      <div className="grid gap-2">
                        <Label>SKU</Label>
                        <Input onChange={(event) => updateDraftField(productId, "sku", event.target.value)} value={draft.sku} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="grid gap-2">
                        <Label>Category</Label>
                        <Input onChange={(event) => updateDraftField(productId, "category", event.target.value)} value={draft.category} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Brand</Label>
                        <Input onChange={(event) => updateDraftField(productId, "brand", event.target.value)} value={draft.brand} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Collection</Label>
                        <Input onChange={(event) => updateDraftField(productId, "collection", event.target.value)} value={draft.collection} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Skin goal</Label>
                        <Input onChange={(event) => updateDraftField(productId, "skinGoal", event.target.value)} value={draft.skinGoal} />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Full description</Label>
                      <Textarea onChange={(event) => updateDraftField(productId, "description", event.target.value)} value={draft.description} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Highlights</Label>
                        <Textarea
                          onChange={(event) => updateDraftField(productId, "highlights", event.target.value)}
                          placeholder="One highlight per line"
                          value={draft.highlights}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Ingredients</Label>
                        <Textarea
                          onChange={(event) => updateDraftField(productId, "ingredients", event.target.value)}
                          placeholder="One ingredient per line"
                          value={draft.ingredients}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>How to use</Label>
                      <Textarea onChange={(event) => updateDraftField(productId, "howToUse", event.target.value)} value={draft.howToUse} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="grid gap-2">
                        <Label>Stock quantity</Label>
                        <Input
                          min="0"
                          onChange={(event) => updateDraftField(productId, "stockQuantity", Number(event.target.value))}
                          type="number"
                          value={draft.stockQuantity}
                        />
                      </div>

                      <label className="flex items-center gap-3 rounded-[16px] border border-[#eadfce] bg-white px-4 py-3 text-sm text-[#6b4f3a]">
                        <input
                          checked={draft.trackInventory}
                          className="h-4 w-4 accent-[#b8924a]"
                          onChange={(event) => updateDraftField(productId, "trackInventory", event.target.checked)}
                          type="checkbox"
                        />
                        Track inventory
                      </label>

                      <label className="flex items-center gap-3 rounded-[16px] border border-[#eadfce] bg-white px-4 py-3 text-sm text-[#6b4f3a]">
                        <input
                          checked={draft.isOutOfStock}
                          className="h-4 w-4 accent-[#b8924a]"
                          onChange={(event) => updateDraftField(productId, "isOutOfStock", event.target.checked)}
                          type="checkbox"
                        />
                        Out of stock
                      </label>

                      <label className="flex items-center gap-3 rounded-[16px] border border-[#eadfce] bg-white px-4 py-3 text-sm text-[#6b4f3a]">
                        <input
                          checked={draft.isPublished}
                          className="h-4 w-4 accent-[#b8924a]"
                          onChange={(event) => updateDraftField(productId, "isPublished", event.target.checked)}
                          type="checkbox"
                        />
                        Published
                      </label>
                    </div>

                    {replacementImage ? (
                      <div className="flex items-center gap-2 rounded-[16px] border border-[#eadfce] bg-[#faf6f1] px-4 py-3 text-sm text-[#6b4f3a]">
                        <ImagePlus className="h-4 w-4 text-[#9c7530]" />
                        Replacement image queued. Save this product to upload the new file to Cloudinary.
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
