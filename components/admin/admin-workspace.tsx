"use client";

import { startTransition, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgePercent,
  Boxes,
  Calculator,
  DollarSign,
  KeyRound,
  Loader2,
  LogOut,
  Package2,
  RefreshCcw,
  ReceiptText,
  Save,
  Settings2,
  Shield,
  TrendingUp,
  Truck,
  Upload,
  Users,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, type Product } from "@/lib/data";
import type {
  AdminCustomerRecord,
  AdminDashboardMetric,
  AdminInventoryRecord,
  AdminOrderRecord
} from "@/lib/server/admin-dashboard";
import type { AdminPromoCodeRecord } from "@/lib/server/promos";
import type { InventoryActivityRecord } from "@/lib/server/products";

type AdminSection = "overview" | "orders" | "inventory" | "products" | "promotions" | "customers" | "profit" | "settings";

interface AdminWorkspaceProps {
  initialProducts: Product[];
  sessionEmail: string;
  databaseConnected: boolean;
  cloudinaryConfigured: boolean;
  directDatabaseConfigured: boolean;
  metrics: AdminDashboardMetric[];
  orders: AdminOrderRecord[];
  promoCodes: AdminPromoCodeRecord[];
  customers: AdminCustomerRecord[];
  inventory: AdminInventoryRecord[];
  lowStockProducts: AdminInventoryRecord[];
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

const orderStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

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

function createDraft(product: Product): ProductDraft {
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
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "PROCESSING":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "SHIPPED":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getMetricToneClasses(tone: AdminDashboardMetric["tone"]) {
  switch (tone) {
    case "blue":
      return "bg-blue-600 text-white";
    case "emerald":
      return "bg-emerald-600 text-white";
    case "amber":
      return "bg-amber-500 text-slate-950";
    case "violet":
      return "bg-violet-600 text-white";
    default:
      return "bg-slate-900 text-white";
  }
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
    <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 ${sizeClassName}`}>
      <img alt={alt} className="h-full w-full object-cover" src={previewUrl ?? fallbackSrc} />
    </div>
  );
}

export default function AdminWorkspace(props: AdminWorkspaceProps) {
  const {
    initialProducts,
    sessionEmail,
    databaseConnected,
    cloudinaryConfigured,
    directDatabaseConfigured,
    metrics,
    orders,
    promoCodes,
    customers,
    inventory,
    lowStockProducts,
    recentInventoryLogs
  } = props;
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [creating, setCreating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [togglingPromoId, setTogglingPromoId] = useState<string | null>(null);
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
    salePrice: "",
    promoStartsAt: "",
    promoEndsAt: "",
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
  const [orderDrafts, setOrderDrafts] = useState<Record<string, AdminOrderRecord["status"]>>(() =>
    Object.fromEntries(orders.map((order) => [order.id, order.status]))
  );
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    nextPassword: "",
    confirmPassword: ""
  });
  const [promoForm, setPromoForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    amount: "10",
    minOrderAmount: "",
    startsAt: "",
    endsAt: "",
    usageLimit: "",
    isActive: true
  });
  const [profitForm, setProfitForm] = useState({
    sellingPrice: 28500,
    unitsSold: 100,
    productCost: 11000,
    packagingCost: 1200,
    deliveryCost: 2500,
    marketingCost: 1500,
    gatewayFeeRate: 1.5,
    gatewayFeeFlat: 100,
    otherVariableCost: 800,
    fixedOperatingCost: 250000
  });

  const profitMetrics = useMemo(() => {
    const revenue = profitForm.sellingPrice * profitForm.unitsSold;
    const variableCostPerUnit =
      profitForm.productCost +
      profitForm.packagingCost +
      profitForm.deliveryCost +
      profitForm.marketingCost +
      profitForm.otherVariableCost +
      profitForm.gatewayFeeFlat +
      (profitForm.sellingPrice * profitForm.gatewayFeeRate) / 100;
    const totalVariableCost = variableCostPerUnit * profitForm.unitsSold;
    const grossProfit = revenue - totalVariableCost;
    const netProfit = grossProfit - profitForm.fixedOperatingCost;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const contributionPerUnit = profitForm.sellingPrice - variableCostPerUnit;
    const contributionMargin = profitForm.sellingPrice > 0 ? (contributionPerUnit / profitForm.sellingPrice) * 100 : 0;
    const breakEvenUnits = contributionPerUnit > 0 ? Math.ceil(profitForm.fixedOperatingCost / contributionPerUnit) : null;
    const roi = totalVariableCost + profitForm.fixedOperatingCost > 0 ? (netProfit / (totalVariableCost + profitForm.fixedOperatingCost)) * 100 : 0;

    return {
      revenue,
      variableCostPerUnit,
      totalVariableCost,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      contributionPerUnit,
      contributionMargin,
      breakEvenUnits,
      roi
    };
  }, [profitForm]);

  const managedProducts = useMemo(
    () => initialProducts.filter((product) => !String(product.id).startsWith("fallback-")),
    [initialProducts]
  );

  const navItems: Array<{
    id: AdminSection;
    label: string;
    icon: ComponentType<{ className?: string }>;
    helper: string;
  }> = [
    { id: "overview", label: "Overview", icon: Shield, helper: "Revenue, stock, and fulfilment health" },
    { id: "orders", label: "Orders", icon: ReceiptText, helper: "Track pending and delivered sales" },
    { id: "inventory", label: "Inventory", icon: Boxes, helper: "Low stock, quantity, and movement" },
    { id: "products", label: "Products", icon: Package2, helper: "Upload, edit, and publish catalogue" },
    { id: "promotions", label: "Promotions", icon: BadgePercent, helper: "Timed promo codes and discount campaigns" },
    { id: "customers", label: "Customers", icon: Users, helper: "Best buyers and repeat activity" },
    { id: "profit", label: "Profit Lab", icon: Calculator, helper: "Unit economics and MBA-style margin checks" },
    { id: "settings", label: "Settings", icon: Settings2, helper: "Security and environment controls" }
  ];

  function updateCreateField<Key extends keyof typeof createForm>(key: Key, value: (typeof createForm)[Key]) {
    setCreateForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updateDraftField(productId: string, key: keyof ProductDraft, value: string | number | boolean | null) {
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
      await fetch("/api/admin/logout", { method: "POST" });
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
        description: "Connect Neon before creating products."
      });
      return;
    }

    if (!cloudinaryConfigured) {
      toast.error("Cloudinary is not configured", {
        description: "Add Cloudinary credentials before uploading products."
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
      formData.append("salePrice", createForm.salePrice);
      formData.append("promoStartsAt", createForm.promoStartsAt);
      formData.append("promoEndsAt", createForm.promoEndsAt);
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
        description: "The catalogue has been updated successfully."
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
        salePrice: "",
        promoStartsAt: "",
        promoEndsAt: "",
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
          ? "Product details and media were updated."
          : "Product details and stock levels were saved."
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

  async function handleCreatePromo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingPromo(true);

    try {
      const response = await fetch("/api/admin/promos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: promoForm.code,
          description: promoForm.description,
          discountType: promoForm.discountType,
          amount: Number(promoForm.amount),
          minOrderAmount: promoForm.minOrderAmount ? Number(promoForm.minOrderAmount) : undefined,
          startsAt: promoForm.startsAt || undefined,
          endsAt: promoForm.endsAt || undefined,
          usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : undefined,
          isActive: promoForm.isActive
        })
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to create promo code.");
      }

      toast.success("Promo code created", {
        description: "The new discount campaign is now available in the store."
      });

      setPromoForm({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        amount: "10",
        minOrderAmount: "",
        startsAt: "",
        endsAt: "",
        usageLimit: "",
        isActive: true
      });

      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Promo code creation failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setCreatingPromo(false);
    }
  }

  async function handleTogglePromo(promoId: string, nextState: boolean) {
    setTogglingPromoId(promoId);

    try {
      const response = await fetch(`/api/admin/promos/${promoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isActive: nextState
        })
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to update promo code.");
      }

      toast.success("Promo updated", {
        description: `Promo code was ${nextState ? "activated" : "paused"}.`
      });

      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Promo update failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setTogglingPromoId(null);
    }
  }

  async function handleSaveOrderStatus(orderId: string) {
    const nextStatus = orderDrafts[orderId];

    if (!nextStatus) {
      return;
    }

    setSavingOrderId(orderId);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus
        })
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to update order status.");
      }

      toast.success("Order updated", {
        description: `Order status was changed to ${getStatusLabel(nextStatus)}.`
      });

      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Order update failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSavingOrderId(null);
    }
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChangingPassword(true);

    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(passwordForm)
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Password update failed.");
      }

      toast.success("Password updated", {
        description: "Your admin password has been changed successfully."
      });

      setPasswordForm({
        currentPassword: "",
        nextPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast.error("Unable to update password", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setChangingPassword(false);
    }
  }

  function renderOverview() {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card className="border-slate-200 bg-white shadow-sm" key={metric.label}>
              <CardContent className="space-y-4 p-5">
                <div className={`inline-flex rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${getMetricToneClasses(metric.tone)}`}>
                  {metric.label}
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{metric.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Fulfilment pipeline</CardTitle>
              <CardDescription>Monitor what has been paid, what is being processed, and what is already delivered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                  Orders will appear here after the first verified payment is converted into a sale.
                </div>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div className="rounded-3xl border border-slate-200 p-4" key={order.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{order.orderNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {order.customerName} · {order.customerEmail}
                        </p>
                      </div>
                      <Badge className={getStatusClassName(order.status)} variant="outline">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
                      <p>Total: <span className="font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</span></p>
                      <p>Gateway: <span className="font-semibold text-slate-900">{order.paymentGateway ?? "N/A"}</span></p>
                      <p>Placed: <span className="font-semibold text-slate-900">{formatDateTime(order.createdAt)}</span></p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Low stock risk</CardTitle>
                <CardDescription>Products that need attention before customers start hitting out-of-stock walls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowStockProducts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    No low-stock products right now.
                  </div>
                ) : (
                  lowStockProducts.slice(0, 6).map((product) => (
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4" key={product.id}>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{product.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-950">{product.stockQuantity}</p>
                        <p className="text-xs text-slate-500">{product.isOutOfStock ? "Out of stock" : "Units left"}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recent inventory activity</CardTitle>
                <CardDescription>Every stock movement is logged so the team can audit what changed and when.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentInventoryLogs.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Inventory activity will appear here as soon as products are created or adjusted.
                  </div>
                ) : (
                  recentInventoryLogs.map((log) => (
                    <div className="rounded-2xl border border-slate-200 p-4" key={log.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{log.productName}</p>
                          <p className="mt-1 text-sm text-slate-500">{log.reason}</p>
                        </div>
                        <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {log.quantityBefore} → {log.quantityAfter}
                        <span className={`ml-2 font-semibold ${log.changeAmount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
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
      </div>
    );
  }

  function renderOrders() {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Sales and fulfilment</CardTitle>
          <CardDescription>
            Move each order from pending to in process, in transit, delivered, or cancelled from one queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
              No orders yet. Once a buyer completes payment, the sale will land here automatically with its reference,
              items, totals, and fulfilment status.
            </div>
          ) : (
            orders.map((order) => (
              <div className="rounded-[28px] border border-slate-200 p-5" key={order.id}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-950">{order.orderNumber}</h3>
                      <Badge className={getStatusClassName(order.status)} variant="outline">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                      <p><span className="font-semibold text-slate-900">Customer:</span> {order.customerName}</p>
                      <p><span className="font-semibold text-slate-900">Email:</span> {order.customerEmail}</p>
                      <p><span className="font-semibold text-slate-900">Gateway:</span> {order.paymentGateway ?? "N/A"}</p>
                      <p><span className="font-semibold text-slate-900">Paid:</span> {formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2 xl:grid-cols-3">
                      <p><span className="font-semibold text-slate-900">Reference:</span> {order.paymentReference ?? "N/A"}</p>
                      <p><span className="font-semibold text-slate-900">Placed:</span> {formatDateTime(order.createdAt)}</p>
                      <p><span className="font-semibold text-slate-900">Updated:</span> {formatDateTime(order.updatedAt)}</p>
                      <p><span className="font-semibold text-slate-900">Promo:</span> {order.promoCode ?? "None"}</p>
                      <p><span className="font-semibold text-slate-900">Discount:</span> {order.discountAmount > 0 ? formatCurrency(order.discountAmount) : "₦0"}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[14rem_auto]">
                    <select
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                      onChange={(event) =>
                        setOrderDrafts((current) => ({
                          ...current,
                          [order.id]: event.target.value as AdminOrderRecord["status"]
                        }))
                      }
                      value={orderDrafts[order.id] ?? order.status}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                    <Button
                      className="justify-center"
                      disabled={savingOrderId === order.id}
                      onClick={() => handleSaveOrderStatus(order.id)}
                      type="button"
                    >
                      {savingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                      Save Status
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {order.items.map((item) => (
                    <div className="rounded-2xl bg-slate-50 p-4" key={item.id}>
                      <p className="text-sm font-semibold text-slate-950">{item.productName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  function renderInventory() {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Inventory catalogue</CardTitle>
            <CardDescription>Review live stock counts, manual availability, and stock-sensitive products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventory.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Inventory will appear here after products are created in the catalogue.
              </div>
            ) : (
              inventory.map((item) => (
                <div className="grid gap-4 rounded-3xl border border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center" key={item.id}>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.category} · {item.sku || "No SKU"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Stock</p>
                    <p className="text-lg font-semibold text-slate-950">{item.stockQuantity}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Value</p>
                    <p className="text-lg font-semibold text-slate-950">{formatCurrency(item.price * item.stockQuantity)}</p>
                  </div>
                  <Badge className={item.isOutOfStock ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"} variant="outline">
                    {item.isOutOfStock ? "Out of stock" : item.trackInventory ? "Tracked" : "Manual"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Attention needed</CardTitle>
              <CardDescription>Products that are already low or have crossed the out-of-stock threshold.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No low-stock warnings right now.
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4" key={product.id}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-950">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.stockQuantity} units remaining</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Latest stock logs</CardTitle>
              <CardDescription>Audit trail for replenishment and customer-purchase deductions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentInventoryLogs.map((log) => (
                <div className="rounded-2xl bg-slate-50 p-4" key={log.id}>
                  <p className="text-sm font-semibold text-slate-950">{log.productName}</p>
                  <p className="mt-1 text-sm text-slate-500">{log.reason}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {log.quantityBefore} → {log.quantityAfter}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Create product</CardTitle>
            <CardDescription>Upload new catalogue items to Neon and Cloudinary with live stock controls.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleCreateProduct}>
              <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
                <div className="space-y-4">
                  <ProductImagePreview
                    alt={createForm.name || "New product"}
                    fallbackSrc="https://placehold.co/800x800/e5edf6/64748b?text=Nakisha+Empire"
                    selectedFile={productImage}
                    sizeClassName="aspect-square h-auto w-full"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="product-image">Product image</Label>
                    <Input accept="image/*" id="product-image" onChange={(event) => setProductImage(event.target.files?.[0] ?? null)} type="file" />
                    <p className="text-xs leading-6 text-slate-500">Square or portrait image recommended. Uploaded files are stored in Cloudinary.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="grid gap-2">
                    <Label>Product name</Label>
                    <Input onChange={(event) => updateCreateField("name", event.target.value)} value={createForm.name} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Slug</Label>
                    <Input onChange={(event) => updateCreateField("slug", event.target.value)} placeholder="auto-generated" value={createForm.slug} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Brand</Label>
                    <Input onChange={(event) => updateCreateField("brand", event.target.value)} value={createForm.brand} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Input onChange={(event) => updateCreateField("category", event.target.value)} value={createForm.category} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Regular price (NGN)</Label>
                    <Input onChange={(event) => updateCreateField("price", event.target.value)} type="number" value={createForm.price} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Promo price (NGN)</Label>
                    <Input onChange={(event) => updateCreateField("salePrice", event.target.value)} placeholder="Optional" type="number" value={createForm.salePrice} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Size</Label>
                    <Input onChange={(event) => updateCreateField("size", event.target.value)} value={createForm.size} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Badge</Label>
                    <Input onChange={(event) => updateCreateField("badge", event.target.value)} value={createForm.badge} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Collection</Label>
                    <Input onChange={(event) => updateCreateField("collection", event.target.value)} value={createForm.collection} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Skin goal</Label>
                    <Input onChange={(event) => updateCreateField("skinGoal", event.target.value)} value={createForm.skinGoal} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Promo start</Label>
                    <Input onChange={(event) => updateCreateField("promoStartsAt", event.target.value)} type="datetime-local" value={createForm.promoStartsAt} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Promo end</Label>
                    <Input onChange={(event) => updateCreateField("promoEndsAt", event.target.value)} type="datetime-local" value={createForm.promoEndsAt} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Short description</Label>
                  <Textarea onChange={(event) => updateCreateField("shortDescription", event.target.value)} value={createForm.shortDescription} />
                </div>
                <div className="grid gap-2">
                  <Label>Full description</Label>
                  <Textarea onChange={(event) => updateCreateField("description", event.target.value)} value={createForm.description} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Highlights</Label>
                  <Textarea onChange={(event) => updateCreateField("highlights", event.target.value)} placeholder="One highlight per line" value={createForm.highlights} />
                </div>
                <div className="grid gap-2">
                  <Label>Ingredients</Label>
                  <Textarea onChange={(event) => updateCreateField("ingredients", event.target.value)} placeholder="One ingredient per line" value={createForm.ingredients} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
                <div className="grid gap-2">
                  <Label>How to use</Label>
                  <Textarea onChange={(event) => updateCreateField("howToUse", event.target.value)} value={createForm.howToUse} />
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>SKU</Label>
                    <Input onChange={(event) => updateCreateField("sku", event.target.value)} value={createForm.sku} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Stock quantity</Label>
                    <Input onChange={(event) => updateCreateField("stockQuantity", event.target.value)} type="number" value={createForm.stockQuantity} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {[
                  { key: "trackInventory", label: "Track inventory" },
                  { key: "isOutOfStock", label: "Mark out of stock" },
                  { key: "isPublished", label: "Publish immediately" }
                ].map((item) => (
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700" key={item.key}>
                    <input
                      checked={createForm[item.key as keyof typeof createForm] as boolean}
                      className="h-4 w-4 accent-blue-600"
                      onChange={(event) =>
                        updateCreateField(item.key as "trackInventory" | "isOutOfStock" | "isPublished", event.target.checked)
                      }
                      type="checkbox"
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              <Button className="justify-center bg-slate-950 hover:bg-slate-800" disabled={creating || !databaseConnected || !cloudinaryConfigured} size="lg" type="submit">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {creating ? "Creating product..." : "Create Product"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Catalogue inventory</CardTitle>
            <CardDescription>Edit products, replace images, and keep published inventory current.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {managedProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                No database-backed products yet. Create the first live product to populate this admin workspace.
              </div>
            ) : (
              managedProducts.map((product) => {
                const productId = product.id as string;
                const draft = drafts[productId] ?? createDraft(product);
                const replacementImage = replacementImages[productId] ?? null;

                return (
                  <div className="rounded-[28px] border border-slate-200 p-5" key={productId}>
                    <div className="grid gap-6 xl:grid-cols-[14rem_minmax(0,1fr)_auto]">
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
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-blue-200 bg-blue-50 text-blue-700" variant="outline">
                            {draft.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge className={draft.isOutOfStock ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"} variant="outline">
                            {draft.isOutOfStock ? "Out of stock" : `${draft.stockQuantity} in stock`}
                          </Badge>
                          {draft.salePrice && draft.salePrice < draft.price ? (
                            <Badge className="border-[#f5afaf] bg-[#fdf3f3] text-[#b46b6b]" variant="outline">
                              Promo configured
                            </Badge>
                          ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input onChange={(event) => updateDraftField(productId, "name", event.target.value)} value={draft.name} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Short description</Label>
                            <Input onChange={(event) => updateDraftField(productId, "shortDescription", event.target.value)} value={draft.shortDescription} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Regular price</Label>
                            <Input onChange={(event) => updateDraftField(productId, "price", Number(event.target.value))} type="number" value={draft.price} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Promo price</Label>
                            <Input
                              onChange={(event) =>
                                updateDraftField(productId, "salePrice", event.target.value ? Number(event.target.value) : null)
                              }
                              placeholder="Optional"
                              type="number"
                              value={draft.salePrice ?? ""}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Stock quantity</Label>
                            <Input onChange={(event) => updateDraftField(productId, "stockQuantity", Number(event.target.value))} type="number" value={draft.stockQuantity} />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="grid gap-2">
                            <Label>Promo start</Label>
                            <Input
                              onChange={(event) => updateDraftField(productId, "promoStartsAt", event.target.value)}
                              type="datetime-local"
                              value={draft.promoStartsAt}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Promo end</Label>
                            <Input
                              onChange={(event) => updateDraftField(productId, "promoEndsAt", event.target.value)}
                              type="datetime-local"
                              value={draft.promoEndsAt}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="grid gap-2">
                            <Label>Brand</Label>
                            <Input onChange={(event) => updateDraftField(productId, "brand", event.target.value)} value={draft.brand} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Category</Label>
                            <Input onChange={(event) => updateDraftField(productId, "category", event.target.value)} value={draft.category} />
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

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Highlights</Label>
                            <Textarea onChange={(event) => updateDraftField(productId, "highlights", event.target.value)} value={draft.highlights} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Ingredients</Label>
                            <Textarea onChange={(event) => updateDraftField(productId, "ingredients", event.target.value)} value={draft.ingredients} />
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea onChange={(event) => updateDraftField(productId, "description", event.target.value)} value={draft.description} />
                          </div>
                          <div className="grid gap-2">
                            <Label>How to use</Label>
                            <Textarea onChange={(event) => updateDraftField(productId, "howToUse", event.target.value)} value={draft.howToUse} />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-4">
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
                          <div className="grid gap-3 md:col-span-1">
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                              <input
                                checked={draft.trackInventory}
                                className="h-4 w-4 accent-blue-600"
                                onChange={(event) => updateDraftField(productId, "trackInventory", event.target.checked)}
                                type="checkbox"
                              />
                              Track inventory
                            </label>
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                              <input
                                checked={draft.isOutOfStock}
                                className="h-4 w-4 accent-blue-600"
                                onChange={(event) => updateDraftField(productId, "isOutOfStock", event.target.checked)}
                                type="checkbox"
                              />
                              Out of stock
                            </label>
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                              <input
                                checked={draft.isPublished}
                                className="h-4 w-4 accent-blue-600"
                                onChange={(event) => updateDraftField(productId, "isPublished", event.target.checked)}
                                type="checkbox"
                              />
                              Published
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex xl:justify-end">
                        <Button className="bg-slate-950 hover:bg-slate-800" disabled={savingId === productId} onClick={() => handleSaveProduct(productId)} type="button">
                          {savingId === productId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderPromotions() {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Create promo campaign</CardTitle>
            <CardDescription>
              Launch timed promo codes customers can apply at checkout, with minimum order thresholds and optional usage caps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreatePromo}>
              <div className="grid gap-2">
                <Label>Promo code</Label>
                <Input
                  onChange={(event) => setPromoForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                  placeholder="GLOW20"
                  value={promoForm.code}
                />
              </div>
              <div className="grid gap-2">
                <Label>Discount type</Label>
                <select
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                  onChange={(event) => setPromoForm((current) => ({ ...current, discountType: event.target.value }))}
                  value={promoForm.discountType}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Description</Label>
                <Input
                  onChange={(event) => setPromoForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="May glow week promotion"
                  value={promoForm.description}
                />
              </div>
              <div className="grid gap-2">
                <Label>{promoForm.discountType === "PERCENTAGE" ? "Discount percentage" : "Discount amount (NGN)"}</Label>
                <Input
                  onChange={(event) => setPromoForm((current) => ({ ...current, amount: event.target.value }))}
                  type="number"
                  value={promoForm.amount}
                />
              </div>
              <div className="grid gap-2">
                <Label>Minimum subtotal (NGN)</Label>
                <Input
                  onChange={(event) => setPromoForm((current) => ({ ...current, minOrderAmount: event.target.value }))}
                  placeholder="Optional"
                  type="number"
                  value={promoForm.minOrderAmount}
                />
              </div>
              <div className="grid gap-2">
                <Label>Promo start</Label>
                <Input
                  onChange={(event) => setPromoForm((current) => ({ ...current, startsAt: event.target.value }))}
                  type="datetime-local"
                  value={promoForm.startsAt}
                />
              </div>
              <div className="grid gap-2">
                <Label>Promo end</Label>
                <Input
                  onChange={(event) => setPromoForm((current) => ({ ...current, endsAt: event.target.value }))}
                  type="datetime-local"
                  value={promoForm.endsAt}
                />
              </div>
              <div className="grid gap-2">
                <Label>Usage limit</Label>
                <Input
                  onChange={(event) => setPromoForm((current) => ({ ...current, usageLimit: event.target.value }))}
                  placeholder="Optional"
                  type="number"
                  value={promoForm.usageLimit}
                />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  checked={promoForm.isActive}
                  className="h-4 w-4 accent-blue-600"
                  onChange={(event) => setPromoForm((current) => ({ ...current, isActive: event.target.checked }))}
                  type="checkbox"
                />
                Activate immediately
              </label>

              <div className="md:col-span-2">
                <Button className="bg-slate-950 hover:bg-slate-800" disabled={creatingPromo} size="lg" type="submit">
                  {creatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />}
                  {creatingPromo ? "Creating promo..." : "Create Promo Code"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Active and scheduled promos</CardTitle>
            <CardDescription>Promo codes customers can use at checkout, with live usage and availability status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {promoCodes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                No promo campaigns yet. Create one here and customers will be able to apply it at checkout.
              </div>
            ) : (
              promoCodes.map((promo) => {
                const amountLabel = promo.discountType === "PERCENTAGE" ? `${promo.amount}% off` : formatCurrency(promo.amount);
                const isWindowed = Boolean(promo.startsAt && promo.endsAt);

                return (
                  <div className="rounded-[28px] border border-slate-200 p-5" key={promo.id}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-slate-950">{promo.code}</p>
                          <Badge
                            className={promo.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700"}
                            variant="outline"
                          >
                            {promo.isActive ? "Active" : "Paused"}
                          </Badge>
                          <Badge className="border-[#f5afaf] bg-[#fdf3f3] text-[#b46b6b]" variant="outline">
                            {amountLabel}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{promo.description || "No description provided."}</p>
                        <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                          <p>Minimum basket: <span className="font-semibold text-slate-900">{promo.minOrderAmount ? formatCurrency(promo.minOrderAmount) : "No minimum"}</span></p>
                          <p>Usage: <span className="font-semibold text-slate-900">{promo.usageCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ""}</span></p>
                          <p>Window: <span className="font-semibold text-slate-900">{isWindowed ? `${formatDateTime(promo.startsAt ?? undefined)} → ${formatDateTime(promo.endsAt ?? undefined)}` : "Always on"}</span></p>
                        </div>
                      </div>
                      <Button
                        disabled={togglingPromoId === promo.id}
                        onClick={() => handleTogglePromo(promo.id, !promo.isActive)}
                        type="button"
                        variant="outline"
                      >
                        {togglingPromoId === promo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                        {promo.isActive ? "Pause" : "Activate"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderCustomers() {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Customer intelligence</CardTitle>
          <CardDescription>See your highest-value customers, repeat buyers, and the latest order activity per account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
              Customer summaries will appear here once orders have been completed.
            </div>
          ) : (
            customers.map((customer) => (
              <div className="grid gap-4 rounded-[28px] border border-slate-200 p-5 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-center" key={customer.email}>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{customer.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
                  {customer.phone ? <p className="mt-1 text-sm text-slate-500">{customer.phone}</p> : null}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Orders</p>
                  <p className="text-lg font-semibold text-slate-950">{customer.ordersCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total spent</p>
                  <p className="text-lg font-semibold text-slate-950">{formatCurrency(customer.totalSpent)}</p>
                </div>
                <div className="space-y-2">
                  <Badge className={customer.latestStatus ? getStatusClassName(customer.latestStatus) : "border-slate-200 bg-slate-50 text-slate-700"} variant="outline">
                    {customer.latestStatus ? getStatusLabel(customer.latestStatus) : "No status"}
                  </Badge>
                  <p className="text-sm text-slate-500">{customer.lastOrderAt ? formatDateTime(customer.lastOrderAt) : "No orders yet"}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  function renderProfit() {
    const calculatorFields: Array<{
      key: keyof typeof profitForm;
      label: string;
      type?: "number";
      helper: string;
    }> = [
      { key: "sellingPrice", label: "Selling price per unit", type: "number", helper: "The amount charged to a customer per product." },
      { key: "unitsSold", label: "Units sold", type: "number", helper: "How many units you expect to sell in the period." },
      { key: "productCost", label: "Cost of goods per unit", type: "number", helper: "Manufacturing or wholesale cost per unit." },
      { key: "packagingCost", label: "Packaging cost per unit", type: "number", helper: "Bottle, carton, label, inserts, and pack-out." },
      { key: "deliveryCost", label: "Delivery cost per unit", type: "number", helper: "Average fulfilment or logistics cost per order unit." },
      { key: "marketingCost", label: "Marketing cost per unit", type: "number", helper: "Average customer acquisition or ad cost allocated per unit." },
      { key: "gatewayFeeRate", label: "Gateway fee rate (%)", type: "number", helper: "Percentage fee taken by the payment processor." },
      { key: "gatewayFeeFlat", label: "Gateway flat fee", type: "number", helper: "Any fixed gateway charge per transaction or order." },
      { key: "otherVariableCost", label: "Other variable cost per unit", type: "number", helper: "Commissions, returns reserve, samples, or misc variable costs." },
      { key: "fixedOperatingCost", label: "Fixed operating cost", type: "number", helper: "Rent, salaries, software, and other period-fixed expenses." }
    ];

    const summaryCards = [
      {
        label: "Revenue",
        value: formatCurrency(profitMetrics.revenue),
        helper: `${profitForm.unitsSold} units × ${formatCurrency(profitForm.sellingPrice)}`
      },
      {
        label: "Gross profit",
        value: formatCurrency(profitMetrics.grossProfit),
        helper: `${profitMetrics.grossMargin.toFixed(1)}% gross margin`
      },
      {
        label: "Net profit",
        value: formatCurrency(profitMetrics.netProfit),
        helper: `${profitMetrics.netMargin.toFixed(1)}% net margin`
      },
      {
        label: "Break-even units",
        value: profitMetrics.breakEvenUnits ? `${profitMetrics.breakEvenUnits}` : "N/A",
        helper: profitMetrics.breakEvenUnits ? "Units required to cover fixed cost" : "Contribution margin must be positive"
      }
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(24rem,1.05fr)]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Profit calculator</CardTitle>
            <CardDescription>
              Input every meaningful commercial variable and review the business like an MBA would: margin, contribution,
              break-even, and return on cost.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {calculatorFields.map((field) => (
              <div className="grid gap-2" key={field.key}>
                <Label>{field.label}</Label>
                <Input
                  onChange={(event) =>
                    setProfitForm((current) => ({
                      ...current,
                      [field.key]: Number(event.target.value || 0)
                    }))
                  }
                  type="number"
                  value={profitForm[field.key]}
                />
                <p className="text-xs leading-5 text-slate-500">{field.helper}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {summaryCards.map((card, index) => {
              const icons = [Wallet, TrendingUp, DollarSign, Calculator];
              const Icon = icons[index];

              return (
                <Card className="border-slate-200 bg-white shadow-sm" key={card.label}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">{card.label}</p>
                    </div>
                    <p className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">{card.value}</p>
                    <p className="text-sm text-slate-500">{card.helper}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Unit economics summary</CardTitle>
              <CardDescription>Use these metrics to judge margin quality, pricing strength, and operational efficiency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Variable cost per unit", value: formatCurrency(profitMetrics.variableCostPerUnit) },
                { label: "Total variable cost", value: formatCurrency(profitMetrics.totalVariableCost) },
                { label: "Contribution per unit", value: formatCurrency(profitMetrics.contributionPerUnit) },
                { label: "Contribution margin", value: `${profitMetrics.contributionMargin.toFixed(1)}%` },
                { label: "Net margin", value: `${profitMetrics.netMargin.toFixed(1)}%` },
                { label: "ROI on deployed cost", value: `${profitMetrics.roi.toFixed(1)}%` }
              ].map((item) => (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3" key={item.label}>
                  <p className="text-sm text-slate-600">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function renderSettings() {
    const envCards = [
      {
        title: "Neon runtime",
        value: databaseConnected ? "Connected" : "Missing DATABASE_URL"
      },
      {
        title: "Prisma direct",
        value: directDatabaseConfigured ? "Connected" : "Add DIRECT_URL"
      },
      {
        title: "Cloudinary",
        value: cloudinaryConfigured ? "Connected" : "Missing Cloudinary keys"
      }
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Security settings</CardTitle>
            <CardDescription>Update the super-admin password from a proper settings workflow instead of raw environment-only access.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleChangePassword}>
              <div className="grid gap-2">
                <Label>Current password</Label>
                <Input
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  type="password"
                  value={passwordForm.currentPassword}
                />
              </div>
              <div className="grid gap-2">
                <Label>New password</Label>
                <Input
                  onChange={(event) => setPasswordForm((current) => ({ ...current, nextPassword: event.target.value }))}
                  type="password"
                  value={passwordForm.nextPassword}
                />
              </div>
              <div className="grid gap-2">
                <Label>Confirm new password</Label>
                <Input
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  type="password"
                  value={passwordForm.confirmPassword}
                />
              </div>

              <Button className="bg-slate-950 hover:bg-slate-800" disabled={changingPassword} type="submit">
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Platform health</CardTitle>
            <CardDescription>Backend service readiness across database, media storage, and schema tooling.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {envCards.map((card) => (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5" key={card.title}>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{card.title}</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{card.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#0b1020] text-slate-900">
      <div className="mx-auto max-w-[1800px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <div className="border-b border-white/10 px-5 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Nakisha Empire</p>
                <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Admin Command</h1>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Inventory, revenue, fulfilment, customer intelligence, and operational controls from one workspace.
                </p>
              </div>

              <nav className="space-y-1 p-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;

                  return (
                    <button
                      className={`flex w-full items-start gap-3 rounded-2xl px-4 py-4 text-left transition-colors ${
                        active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      type="button"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className={`mt-1 text-xs leading-5 ${active ? "text-blue-100" : "text-slate-500"}`}>{item.helper}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 p-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Signed in as</p>
                  <p className="mt-2 text-sm font-semibold">{sessionEmail}</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Operations Workspace</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Global-standard commerce admin</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                    Manage stock, sales, fulfilment, customers, security, and product publishing from a proper admin shell
                    instead of a storefront-styled form page.
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
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                      active ? "bg-blue-600 text-white" : "bg-white text-slate-600"
                    }`}
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {activeSection === "overview" ? renderOverview() : null}
            {activeSection === "orders" ? renderOrders() : null}
            {activeSection === "inventory" ? renderInventory() : null}
            {activeSection === "products" ? renderProducts() : null}
            {activeSection === "promotions" ? renderPromotions() : null}
            {activeSection === "customers" ? renderCustomers() : null}
            {activeSection === "profit" ? renderProfit() : null}
            {activeSection === "settings" ? renderSettings() : null}
          </div>
        </div>
      </div>
    </section>
  );
}
