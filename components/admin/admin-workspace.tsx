"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState, useTransition, type ComponentType } from "react";
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
  Menu,
  Package2,
  Pencil,
  Plus,
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { DeliveryRateRecord } from "@/lib/delivery";
import { formatCurrency, type Product } from "@/lib/data";
import { getProductCategoryOptions, getProductCollectionOptions } from "@/lib/product-taxonomy";
import type {
  AdminCustomerRecord,
  AdminDashboardMetric,
  AdminInventoryRecord,
  AdminOrderRecord
} from "@/lib/server/admin-dashboard";
import type { AdminPromoCodeRecord } from "@/lib/server/promos";
import type { InventoryActivityRecord } from "@/lib/server/products";

type AdminSection = "overview" | "orders" | "inventory" | "products" | "promotions" | "customers" | "profit" | "settings";
type DashboardTableKey = "orders" | "inventory" | "products" | "promotions" | "customers" | "deliveryRates";
type FilterableDashboardTableKey = Exclude<DashboardTableKey, "deliveryRates">;
type AdminTableStatusOption = {
  value: string;
  label: string;
};

interface AdminWorkspaceProps {
  activeSection: AdminSection;
  initialProducts: Product[];
  sessionEmail: string;
  databaseConnected: boolean;
  cloudinaryConfigured: boolean;
  directDatabaseConfigured: boolean;
  deliveryRates: DeliveryRateRecord[];
  mailerConfigured: boolean;
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

interface PromoDraft {
  code: string;
  description: string;
  discountType: AdminPromoCodeRecord["discountType"];
  amount: string;
  minOrderAmount: string;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
  isActive: boolean;
}

const orderStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const inventoryStatusOptions: AdminTableStatusOption[] = [
  { value: "ALL", label: "All statuses" },
  { value: "IN_STOCK", label: "In stock" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
  { value: "TRACKED", label: "Tracked" },
  { value: "MANUAL", label: "Manual" }
];
const productStatusOptions: AdminTableStatusOption[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "AVAILABLE", label: "Available" },
  { value: "OUT_OF_STOCK", label: "Out of stock" }
];
const promoStatusOptions: AdminTableStatusOption[] = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" }
];
const orderStatusOptions: AdminTableStatusOption[] = [
  { value: "ALL", label: "All statuses" },
  ...orderStatuses.map((status) => ({
    value: status,
    label: getStatusLabel(status)
  }))
];
const customerStatusOptions: AdminTableStatusOption[] = [
  { value: "ALL", label: "All statuses" },
  { value: "NO_STATUS", label: "No status" },
  ...orderStatuses.map((status) => ({
    value: status,
    label: getStatusLabel(status)
  }))
];
const dashboardTablePageSizes: Record<DashboardTableKey, number> = {
  orders: 8,
  inventory: 8,
  products: 8,
  promotions: 8,
  customers: 8,
  deliveryRates: 12
};

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

function createPromoDraft(promo: AdminPromoCodeRecord): PromoDraft {
  return {
    code: promo.code,
    description: promo.description ?? "",
    discountType: promo.discountType,
    amount: String(promo.amount),
    minOrderAmount: promo.minOrderAmount ? String(promo.minOrderAmount) : "",
    startsAt: toDateTimeLocalValue(promo.startsAt),
    endsAt: toDateTimeLocalValue(promo.endsAt),
    usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
    isActive: promo.isActive
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

function normalizeAdminTableSearch(value: string) {
  return value.trim().toLowerCase();
}

function matchesAdminTableSearch(query: string, values: Array<string | number | null | undefined>) {
  if (!query) {
    return true;
  }

  return values
    .map((value) => (value == null ? "" : String(value).toLowerCase()))
    .join(" ")
    .includes(query);
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

function getVisiblePageNumbers(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

function AdminTablePagination(props: {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { page, pageSize, totalItems, totalPages, onPageChange } = props;

  if (totalItems <= pageSize || totalPages <= 1) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-950">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-950">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-950">{totalItems}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={page === 1} onClick={() => onPageChange(page - 1)} size="sm" type="button" variant="outline">
          Previous
        </Button>

        {getVisiblePageNumbers(page, totalPages).map((pageNumber) => (
          <Button
            className={pageNumber === page ? "bg-slate-950 text-white hover:bg-slate-800" : ""}
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            size="sm"
            type="button"
            variant={pageNumber === page ? "default" : "outline"}
          >
            {pageNumber}
          </Button>
        ))}

        <Button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} size="sm" type="button" variant="outline">
          Next
        </Button>
      </div>
    </div>
  );
}

function AdminTableFilters(props: {
  searchId: string;
  statusId: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  statusOptions: AdminTableStatusOption[];
  helperText: string;
}) {
  const {
    searchId,
    statusId,
    searchLabel,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    statusValue,
    onStatusChange,
    statusOptions,
    helperText
  } = props;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="grid gap-2">
          <Label htmlFor={searchId}>{searchLabel}</Label>
          <Input id={searchId} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} value={searchValue} />
          <p className="text-xs leading-6 text-slate-500">{helperText}</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={statusId}>Status</Label>
          <select
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
            id={statusId}
            onChange={(event) => onStatusChange(event.target.value)}
            value={statusValue}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function useResponsiveSheetSide() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const updateMatches = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateMatches();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatches);

      return () => {
        mediaQuery.removeEventListener("change", updateMatches);
      };
    }

    mediaQuery.addListener(updateMatches);

    return () => {
      mediaQuery.removeListener(updateMatches);
    };
  }, []);

  return isDesktop ? "center" : "bottom";
}

export default function AdminWorkspace(props: AdminWorkspaceProps) {
  const {
    activeSection,
    initialProducts,
    sessionEmail,
    databaseConnected,
    cloudinaryConfigured,
    directDatabaseConfigured,
    deliveryRates,
    mailerConfigured,
    metrics,
    orders,
    promoCodes,
    customers,
    inventory,
    lowStockProducts,
    recentInventoryLogs
  } = props;
  const router = useRouter();
  const sheetSide = useResponsiveSheetSide();
  const [isRefreshing, startRefreshingTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingPromoId, setSavingPromoId] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [togglingPromoId, setTogglingPromoId] = useState<string | null>(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productGalleryImages, setProductGalleryImages] = useState<File[]>([]);
  const [replacementImages, setReplacementImages] = useState<Record<string, File | null>>({});
  const [savingDeliveryRates, setSavingDeliveryRates] = useState(false);
  const [deliveryRateSearch, setDeliveryRateSearch] = useState("");
  const [selectedDeliveryStateCode, setSelectedDeliveryStateCode] = useState<string>(deliveryRates[0]?.stateCode ?? "");
  const [tablePages, setTablePages] = useState<Record<DashboardTableKey, number>>({
    orders: 1,
    inventory: 1,
    products: 1,
    promotions: 1,
    customers: 1,
    deliveryRates: 1
  });
  const [tableSearches, setTableSearches] = useState<Record<FilterableDashboardTableKey, string>>({
    orders: "",
    inventory: "",
    products: "",
    promotions: "",
    customers: ""
  });
  const [tableStatusFilters, setTableStatusFilters] = useState<Record<FilterableDashboardTableKey, string>>({
    orders: "ALL",
    inventory: "ALL",
    products: "ALL",
    promotions: "ALL",
    customers: "ALL"
  });
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
  const [deliveryRateDrafts, setDeliveryRateDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(deliveryRates.map((rate) => [rate.stateCode, String(rate.feeAmount)]))
  );
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
  const [promoDrafts, setPromoDrafts] = useState<Record<string, PromoDraft>>(() =>
    Object.fromEntries(promoCodes.map((promo) => [promo.id, createPromoDraft(promo)]))
  );
  const [profitForm, setProfitForm] = useState({
    sellingPrice: 0,
    unitsSold: 0,
    productCost: 0,
    packagingCost: 0,
    deliveryCost: 0,
    marketingCost: 0,
    gatewayFeeRate: 0,
    gatewayFeeFlat: 0,
    otherVariableCost: 0,
    fixedOperatingCost: 0
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
  const hasFallbackCatalogue = useMemo(
    () => initialProducts.some((product) => String(product.id).startsWith("fallback-")),
    [initialProducts]
  );
  const activeEditingProduct = useMemo(
    () => managedProducts.find((product) => String(product.id) === editingProductId) ?? null,
    [editingProductId, managedProducts]
  );
  const productCategoryOptions = useMemo(
    () => getProductCategoryOptions(managedProducts.map((product) => product.category)),
    [managedProducts]
  );
  const productCollectionOptions = useMemo(
    () => getProductCollectionOptions(managedProducts.map((product) => product.collection)),
    [managedProducts]
  );
  const filteredDeliveryRates = useMemo(() => {
    const query = deliveryRateSearch.trim().toLowerCase();

    if (!query) {
      return deliveryRates;
    }

    return deliveryRates.filter((rate) => {
      const searchable = `${rate.stateName} ${rate.stateCode.replaceAll("_", " ")}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [deliveryRateSearch, deliveryRates]);
  const selectedDeliveryRate = useMemo(
    () =>
      deliveryRates.find((rate) => rate.stateCode === selectedDeliveryStateCode) ??
      filteredDeliveryRates[0] ??
      deliveryRates[0] ??
      null,
    [deliveryRates, filteredDeliveryRates, selectedDeliveryStateCode]
  );
  const activeEditingPromo = useMemo(
    () => promoCodes.find((promo) => promo.id === editingPromoId) ?? null,
    [editingPromoId, promoCodes]
  );
  const adminSheetClassName = sheetSide === "center" ? "max-h-[88vh] overflow-y-auto" : "max-h-[88vh] overflow-y-auto rounded-t-[28px]";
  const filteredOrders = useMemo(() => {
    const query = normalizeAdminTableSearch(tableSearches.orders);
    const statusFilter = tableStatusFilters.orders;

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      const matchesSearch = matchesAdminTableSearch(query, [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.deliveryAddress,
        order.deliveryStateName,
        order.deliveryStateCode.replaceAll("_", " "),
        order.paymentGateway,
        order.paymentReference,
        order.promoCode,
        order.totalAmount,
        order.subtotalAmount,
        order.shippingAmount,
        order.discountAmount,
        order.createdAt,
        order.updatedAt,
        getStatusLabel(order.status),
        order.status,
        order.items.map((item) => item.productName).join(" ")
      ]);

      return matchesStatus && matchesSearch;
    });
  }, [orders, tableSearches.orders, tableStatusFilters.orders]);
  const filteredInventory = useMemo(() => {
    const query = normalizeAdminTableSearch(tableSearches.inventory);
    const statusFilter = tableStatusFilters.inventory;

    return inventory.filter((item) => {
      const itemStatus = item.isOutOfStock ? "OUT_OF_STOCK" : item.trackInventory ? "TRACKED" : "MANUAL";
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "IN_STOCK" ? !item.isOutOfStock : itemStatus === statusFilter);
      const matchesSearch = matchesAdminTableSearch(query, [
        item.name,
        item.category,
        item.sku,
        item.stockQuantity,
        item.price,
        item.updatedAt,
        item.isOutOfStock ? "Out of stock" : "In stock",
        item.isOutOfStock ? "Out of stock" : item.trackInventory ? "Tracked" : "Manual",
        item.isOutOfStock ? "OUT_OF_STOCK" : item.trackInventory ? "TRACKED" : "MANUAL"
      ]);

      return matchesStatus && matchesSearch;
    });
  }, [inventory, tableSearches.inventory, tableStatusFilters.inventory]);
  const filteredProducts = useMemo(() => {
    const query = normalizeAdminTableSearch(tableSearches.products);
    const statusFilter = tableStatusFilters.products;

    return managedProducts.filter((product) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" ? product.isPublished : false) ||
        (statusFilter === "DRAFT" ? !product.isPublished : false) ||
        (statusFilter === "AVAILABLE" ? !product.isOutOfStock : false) ||
        (statusFilter === "OUT_OF_STOCK" ? Boolean(product.isOutOfStock) : false);
      const matchesSearch = matchesAdminTableSearch(query, [
        product.name,
        product.slug,
        product.shortDescription,
        product.brand,
        product.category,
        product.collection,
        product.skinGoal,
        product.badge,
        product.sku,
        product.price,
        product.salePrice,
        product.stockQuantity,
        product.createdAt,
        product.updatedAt,
        product.isPublished ? "Published" : "Draft",
        product.isOutOfStock ? "Out of stock" : "In stock",
        product.isOutOfStock ? "Out of stock" : "Available"
      ]);

      return matchesStatus && matchesSearch;
    });
  }, [managedProducts, tableSearches.products, tableStatusFilters.products]);
  const filteredPromotions = useMemo(() => {
    const query = normalizeAdminTableSearch(tableSearches.promotions);
    const statusFilter = tableStatusFilters.promotions;

    return promoCodes.filter((promo) => {
      const matchesStatus =
        statusFilter === "ALL" || (statusFilter === "ACTIVE" ? promo.isActive : !promo.isActive);
      const matchesSearch = matchesAdminTableSearch(query, [
        promo.code,
        promo.description,
        promo.discountType,
        promo.amount,
        promo.minOrderAmount,
        promo.usageCount,
        promo.usageLimit,
        promo.startsAt,
        promo.endsAt,
        promo.createdAt,
        promo.updatedAt,
        promo.isActive ? "Active" : "Paused"
      ]);

      return matchesStatus && matchesSearch;
    });
  }, [promoCodes, tableSearches.promotions, tableStatusFilters.promotions]);
  const filteredCustomers = useMemo(() => {
    const query = normalizeAdminTableSearch(tableSearches.customers);
    const statusFilter = tableStatusFilters.customers;

    return customers.filter((customer) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "NO_STATUS" ? !customer.latestStatus : customer.latestStatus === statusFilter);
      const matchesSearch = matchesAdminTableSearch(query, [
        customer.name,
        customer.email,
        customer.phone,
        customer.ordersCount,
        customer.totalSpent,
        customer.lastOrderAt,
        customer.latestStatus,
        customer.latestStatus ? getStatusLabel(customer.latestStatus) : "No status"
      ]);

      return matchesStatus && matchesSearch;
    });
  }, [customers, tableSearches.customers, tableStatusFilters.customers]);
  const tablePageCounts = useMemo(
    () => ({
      orders: Math.max(1, Math.ceil(filteredOrders.length / dashboardTablePageSizes.orders)),
      inventory: Math.max(1, Math.ceil(filteredInventory.length / dashboardTablePageSizes.inventory)),
      products: Math.max(1, Math.ceil(filteredProducts.length / dashboardTablePageSizes.products)),
      promotions: Math.max(1, Math.ceil(filteredPromotions.length / dashboardTablePageSizes.promotions)),
      customers: Math.max(1, Math.ceil(filteredCustomers.length / dashboardTablePageSizes.customers)),
      deliveryRates: Math.max(1, Math.ceil(deliveryRates.length / dashboardTablePageSizes.deliveryRates))
    }),
    [deliveryRates.length, filteredCustomers.length, filteredInventory.length, filteredOrders.length, filteredProducts.length, filteredPromotions.length]
  );

  useEffect(() => {
    setTablePages((current) => {
      let changed = false;
      const next = { ...current };

      (Object.keys(tablePageCounts) as DashboardTableKey[]).forEach((tableKey) => {
        const safePage = Math.min(Math.max(current[tableKey], 1), tablePageCounts[tableKey]);

        if (safePage !== current[tableKey]) {
          next[tableKey] = safePage;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [tablePageCounts]);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        initialProducts
          .filter((product) => product.id)
          .map((product) => [product.id as string, createDraft(product)])
      )
    );
  }, [initialProducts]);

  useEffect(() => {
    setOrderDrafts(Object.fromEntries(orders.map((order) => [order.id, order.status])));
  }, [orders]);

  useEffect(() => {
    setPromoDrafts(Object.fromEntries(promoCodes.map((promo) => [promo.id, createPromoDraft(promo)])));
  }, [promoCodes]);

  useEffect(() => {
    setDeliveryRateDrafts(Object.fromEntries(deliveryRates.map((rate) => [rate.stateCode, String(rate.feeAmount)])));
  }, [deliveryRates]);

  useEffect(() => {
    if (!filteredDeliveryRates.length) {
      return;
    }

    const hasSelectedState = filteredDeliveryRates.some((rate) => rate.stateCode === selectedDeliveryStateCode);

    if (!hasSelectedState) {
      setSelectedDeliveryStateCode(filteredDeliveryRates[0].stateCode);
    }
  }, [filteredDeliveryRates, selectedDeliveryStateCode]);

  const navItems: Array<{
    id: AdminSection;
    label: string;
    icon: ComponentType<{ className?: string }>;
    helper: string;
    href: string;
  }> = [
    { id: "overview", label: "Overview", icon: Shield, helper: "Revenue, stock, and fulfilment health", href: "/admin" },
    { id: "orders", label: "Orders", icon: ReceiptText, helper: "Track pending and delivered sales", href: "/admin/orders" },
    { id: "inventory", label: "Inventory", icon: Boxes, helper: "Low stock, quantity, and movement", href: "/admin/inventory" },
    { id: "products", label: "Products", icon: Package2, helper: "Upload, edit, and publish catalogue", href: "/admin/products" },
    { id: "promotions", label: "Promotions", icon: BadgePercent, helper: "Timed promo codes and discount campaigns", href: "/admin/promotions" },
    { id: "customers", label: "Customers", icon: Users, helper: "Best buyers and repeat activity", href: "/admin/customers" },
    { id: "profit", label: "Profit Lab", icon: Calculator, helper: "Unit economics and MBA-style margin checks", href: "/admin/profit" },
    { id: "settings", label: "Settings", icon: Settings2, helper: "Security and environment controls", href: "/admin/settings" }
  ];
  const activeNavItem = navItems.find((item) => item.id === activeSection) ?? navItems[0];

  function refreshWorkspace() {
    startRefreshingTransition(() => {
      router.refresh();
    });
  }

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

  function updatePromoDraftField<Key extends keyof PromoDraft>(promoId: string, key: Key, value: PromoDraft[Key]) {
    setPromoDrafts((current) => ({
      ...current,
      [promoId]: {
        ...current[promoId],
        [key]: value
      }
    }));
  }

  function setTablePage(tableKey: DashboardTableKey, page: number) {
    setTablePages((current) => ({
      ...current,
      [tableKey]: Math.min(Math.max(page, 1), tablePageCounts[tableKey])
    }));
  }

  function updateTableSearch(tableKey: FilterableDashboardTableKey, value: string) {
    setTableSearches((current) => ({
      ...current,
      [tableKey]: value
    }));
    setTablePage(tableKey, 1);
  }

  function updateTableStatusFilter(tableKey: FilterableDashboardTableKey, value: string) {
    setTableStatusFilters((current) => ({
      ...current,
      [tableKey]: value
    }));
    setTablePage(tableKey, 1);
  }

  function getPaginatedRows<T>(tableKey: DashboardTableKey, rows: T[]) {
    const pageSize = dashboardTablePageSizes[tableKey];
    const page = Math.min(tablePages[tableKey], Math.max(1, Math.ceil(rows.length / pageSize)));
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const startIndex = (page - 1) * pageSize;

    return {
      rows: rows.slice(startIndex, startIndex + pageSize),
      page,
      pageSize,
      totalPages,
      totalItems: rows.length
    };
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
      productGalleryImages.forEach((image) => formData.append("galleryImages", image));

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
      setProductGalleryImages([]);
      setIsCreateProductOpen(false);
      refreshWorkspace();
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
      setEditingProductId(null);
      refreshWorkspace();
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

      setIsCreatePromoOpen(false);
      refreshWorkspace();
    } catch (error) {
      toast.error("Promo code creation failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setCreatingPromo(false);
    }
  }

  async function handleSavePromo(promoId: string) {
    const draft = promoDrafts[promoId];

    if (!draft) {
      return;
    }

    setSavingPromoId(promoId);

    try {
      const response = await fetch(`/api/admin/promos/${promoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: draft.code,
          description: draft.description,
          discountType: draft.discountType,
          amount: Number(draft.amount),
          minOrderAmount: draft.minOrderAmount ? Number(draft.minOrderAmount) : undefined,
          startsAt: draft.startsAt || undefined,
          endsAt: draft.endsAt || undefined,
          usageLimit: draft.usageLimit ? Number(draft.usageLimit) : undefined,
          isActive: draft.isActive
        })
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to update promo.");
      }

      toast.success("Promo updated", {
        description: `${draft.code} was saved successfully.`
      });

      setEditingPromoId(null);
      refreshWorkspace();
    } catch (error) {
      toast.error("Promo update failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSavingPromoId(null);
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

      refreshWorkspace();
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

      refreshWorkspace();
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

  async function handleSaveDeliveryRates() {
    setSavingDeliveryRates(true);

    try {
      const response = await fetch("/api/admin/delivery-rates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rates: deliveryRates.map((rate) => ({
            stateCode: rate.stateCode,
            stateName: rate.stateName,
            feeAmount: Number(deliveryRateDrafts[rate.stateCode] || 0)
          }))
        })
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to update delivery rates.");
      }

      toast.success("Delivery rates updated", {
        description: "Checkout will now use the latest state-based delivery pricing."
      });

      refreshWorkspace();
    } catch (error) {
      toast.error("Unable to update delivery rates", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSavingDeliveryRates(false);
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
    const paginatedOrders = getPaginatedRows("orders", filteredOrders);

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
            <>
              <AdminTableFilters
                helperText={`${filteredOrders.length} of ${orders.length} orders matched. Search by order number, customer, product, state, payment reference, year, or status.`}
                onSearchChange={(value) => updateTableSearch("orders", value)}
                onStatusChange={(value) => updateTableStatusFilter("orders", value)}
                searchId="orders-table-search"
                searchLabel="Find orders"
                searchPlaceholder="Search order number, customer, item, state, or year..."
                searchValue={tableSearches.orders}
                statusId="orders-table-status"
                statusOptions={orderStatusOptions}
                statusValue={tableStatusFilters.orders}
              />

              {filteredOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                  No orders matched the current search or status filter.
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-200">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Delivery state</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Placed</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.rows.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link className="font-medium text-slate-950 hover:text-blue-700" href={`/admin/orders/${order.id}`}>
                            {order.orderNumber}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">{order.paymentGateway ?? "Gateway pending"}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-slate-950">{order.customerName}</p>
                          <p className="mt-1 text-xs text-slate-500">{order.customerEmail}</p>
                        </TableCell>
                        <TableCell>{order.deliveryStateName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusClassName(order.status)} variant="outline">
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
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
              )}

              {filteredOrders.length > 0 ? (
                <AdminTablePagination
                  onPageChange={(page) => setTablePage("orders", page)}
                  page={paginatedOrders.page}
                  pageSize={paginatedOrders.pageSize}
                  totalItems={paginatedOrders.totalItems}
                  totalPages={paginatedOrders.totalPages}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  function renderInventory() {
    const paginatedInventory = getPaginatedRows("inventory", filteredInventory);

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
                {hasFallbackCatalogue && databaseConnected ? (
                  <>Live inventory data is still requested from the backend, but the latest product read fell back away from the database.</>
                ) : (
                  <>Inventory will appear here after products are created in the catalogue.</>
                )}
              </div>
            ) : (
              <>
                <AdminTableFilters
                  helperText={`${filteredInventory.length} of ${inventory.length} inventory rows matched. Search by product, category, SKU, year, or stock status.`}
                  onSearchChange={(value) => updateTableSearch("inventory", value)}
                  onStatusChange={(value) => updateTableStatusFilter("inventory", value)}
                  searchId="inventory-table-search"
                  searchLabel="Find stock rows"
                  searchPlaceholder="Search product, category, SKU, stock mode, or year..."
                  searchValue={tableSearches.inventory}
                  statusId="inventory-table-status"
                  statusOptions={inventoryStatusOptions}
                  statusValue={tableStatusFilters.inventory}
                />

                {filteredInventory.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                    No inventory rows matched the current search or status filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-200">
                  <Table className="min-w-[760px]">
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInventory.rows.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Link className="font-medium text-slate-950 hover:text-blue-700" href={`/admin/inventory/${item.id}`}>
                              {item.name}
                            </Link>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.sku || "No SKU"}</TableCell>
                          <TableCell>{item.stockQuantity}</TableCell>
                          <TableCell>{formatCurrency(item.price * item.stockQuantity)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.isOutOfStock
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                              }
                              variant="outline"
                            >
                              {item.isOutOfStock ? "Out of stock" : item.trackInventory ? "Tracked" : "Manual"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/inventory/${item.id}`}>Open</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                )}

                {filteredInventory.length > 0 ? (
                  <AdminTablePagination
                    onPageChange={(page) => setTablePage("inventory", page)}
                    page={paginatedInventory.page}
                    pageSize={paginatedInventory.pageSize}
                    totalItems={paginatedInventory.totalItems}
                    totalPages={paginatedInventory.totalPages}
                  />
                ) : null}
              </>
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
    const paginatedProducts = getPaginatedRows("products", filteredProducts);
    const activeProductId = activeEditingProduct?.id as string | undefined;
    const activeProductDraft = activeProductId ? drafts[activeProductId] : null;
    const spotlightProduct = managedProducts[0];

    return (
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Catalogue inventory</CardTitle>
              <CardDescription>Use the table for browsing, then click edit only when you want the form.</CardDescription>
            </div>
            <Button className="bg-slate-950 hover:bg-slate-800" disabled={!databaseConnected || !cloudinaryConfigured} onClick={() => setIsCreateProductOpen(true)} type="button">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {managedProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                {hasFallbackCatalogue && databaseConnected ? (
                  <>
                    Live product data is still requested from the backend, but the latest read fell back away from the database.
                    Refresh after Prisma/Neon reconnects and the real catalogue rows will return here.
                  </>
                ) : (
                  <>
                    No database-backed products yet. Click <span className="font-semibold text-slate-950">Add Product</span> to create the first live product.
                  </>
                )}
              </div>
            ) : (
              <>
                {spotlightProduct ? (
                  <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
                      <img alt={spotlightProduct.name} className="h-full w-full object-cover" src={spotlightProduct.image} />
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Latest live product</p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{spotlightProduct.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">{spotlightProduct.shortDescription}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={spotlightProduct.isPublished ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"} variant="outline">
                            {spotlightProduct.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge className={spotlightProduct.isOutOfStock ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"} variant="outline">
                            {spotlightProduct.isOutOfStock ? "Out of stock" : `${spotlightProduct.stockQuantity ?? 0} in stock`}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {[
                          { label: "Brand", value: spotlightProduct.brand },
                          { label: "Category", value: spotlightProduct.category },
                          { label: "Collection", value: spotlightProduct.collection },
                          { label: "Price", value: formatCurrency(spotlightProduct.salePrice ?? spotlightProduct.price) },
                          { label: "Updated", value: formatDateTime(spotlightProduct.updatedAt ?? spotlightProduct.createdAt) }
                        ].map((item) => (
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3" key={item.label}>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button onClick={() => setEditingProductId(String(spotlightProduct.id))} size="sm" type="button" variant="outline">
                          <Pencil className="h-4 w-4" />
                          Edit This Product
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/products/${spotlightProduct.id}`}>Open Full Page</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <AdminTableFilters
                  helperText={`${filteredProducts.length} of ${managedProducts.length} products matched. Search by name, brand, category, collection, SKU, year, or publishing status.`}
                  onSearchChange={(value) => updateTableSearch("products", value)}
                  onStatusChange={(value) => updateTableStatusFilter("products", value)}
                  searchId="products-table-search"
                  searchLabel="Find products"
                  searchPlaceholder="Search name, brand, category, collection, SKU, or year..."
                  searchValue={tableSearches.products}
                  statusId="products-table-status"
                  statusOptions={productStatusOptions}
                  statusValue={tableStatusFilters.products}
                />

                {filteredProducts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                    No products matched the current search or status filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-200">
                  <Table className="min-w-[880px]">
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Images</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.rows.map((product) => {
                        const productId = product.id as string;

                        return (
                          <TableRow key={productId}>
                            <TableCell>
                              <Link className="font-medium text-slate-950 hover:text-blue-700" href={`/admin/products/${productId}`}>
                                {product.name}
                              </Link>
                              <p className="mt-1 text-xs text-slate-500">{product.shortDescription}</p>
                            </TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{formatCurrency(product.salePrice ?? product.price)}</TableCell>
                            <TableCell>{product.images?.length ?? 1}</TableCell>
                            <TableCell>{product.stockQuantity ?? 0}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Badge className={product.isPublished ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-700"} variant="outline">
                                  {product.isPublished ? "Published" : "Draft"}
                                </Badge>
                                <Badge className={product.isOutOfStock ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"} variant="outline">
                                  {product.isOutOfStock ? "Out of stock" : "Available"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button onClick={() => setEditingProductId(productId)} size="sm" type="button" variant="outline">
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                )}

                {filteredProducts.length > 0 ? (
                  <AdminTablePagination
                    onPageChange={(page) => setTablePage("products", page)}
                    page={paginatedProducts.page}
                    pageSize={paginatedProducts.pageSize}
                    totalItems={paginatedProducts.totalItems}
                    totalPages={paginatedProducts.totalPages}
                  />
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Sheet onOpenChange={setIsCreateProductOpen} open={isCreateProductOpen}>
          <SheetContent className={adminSheetClassName} side={sheetSide}>
            <SheetHeader className="border-b border-slate-100 pb-4">
              <SheetTitle>Add Product</SheetTitle>
              <SheetDescription>Open the form only when you need to create a new catalogue item.</SheetDescription>
            </SheetHeader>
            <form className="space-y-6 pt-6" onSubmit={handleCreateProduct}>
              <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
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
                  <div className="space-y-2">
                    <Label htmlFor="product-gallery-images">Gallery images</Label>
                    <Input
                      accept="image/*"
                      id="product-gallery-images"
                      multiple
                      onChange={(event) => setProductGalleryImages(Array.from(event.target.files ?? []))}
                      type="file"
                    />
                    <p className="text-xs leading-6 text-slate-500">
                      Add extra images customers can browse on the product page.
                      {productGalleryImages.length > 0 ? ` ${productGalleryImages.length} file(s) selected.` : ""}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                    <select
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                      onChange={(event) => updateCreateField("category", event.target.value)}
                      value={createForm.category}
                    >
                      <option value="">Select category</option>
                      {productCategoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
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
                    <select
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                      onChange={(event) => updateCreateField("collection", event.target.value)}
                      value={createForm.collection}
                    >
                      <option value="">Select collection</option>
                      {productCollectionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
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
          </SheetContent>
        </Sheet>

        {activeEditingProduct && activeProductId && activeProductDraft ? (
          <Sheet
            onOpenChange={(open) => {
              if (!open) {
                setReplacementImage(activeProductId, null);
                setEditingProductId(null);
              }
            }}
            open={Boolean(activeEditingProduct)}
          >
            <SheetContent className={adminSheetClassName} side={sheetSide}>
              <SheetHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <SheetTitle>Edit Product</SheetTitle>
                    <SheetDescription>Quick-edit catalogue details here. Use the full page for gallery and waitlist management.</SheetDescription>
                  </div>
                  <Button asChild size="sm" type="button" variant="outline">
                    <Link href={`/admin/products/${activeProductId}`}>Open Full Page</Link>
                  </Button>
                </div>
              </SheetHeader>
              <form
                className="space-y-6 pt-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveProduct(activeProductId);
                }}
              >
                <div className="grid gap-6 xl:grid-cols-[15rem_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <ProductImagePreview
                      alt={activeEditingProduct.name}
                      fallbackSrc={activeEditingProduct.image}
                      selectedFile={replacementImages[activeProductId] ?? null}
                      sizeClassName="aspect-square h-auto w-full"
                    />
                    <div className="space-y-2">
                      <Label htmlFor={`replacement-image-${activeProductId}`}>Replace cover image</Label>
                      <Input
                        accept="image/*"
                        id={`replacement-image-${activeProductId}`}
                        onChange={(event) => setReplacementImage(activeProductId, event.target.files?.[0] ?? null)}
                        type="file"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>Product name</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "name", event.target.value)} value={activeProductDraft.name} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Brand</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "brand", event.target.value)} value={activeProductDraft.brand} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <select
                        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                        onChange={(event) => updateDraftField(activeProductId, "category", event.target.value)}
                        value={activeProductDraft.category}
                      >
                        {productCategoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Size</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "size", event.target.value)} value={activeProductDraft.size} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Regular price (NGN)</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "price", Number(event.target.value || 0))} type="number" value={activeProductDraft.price} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Promo price (NGN)</Label>
                      <Input
                        onChange={(event) => updateDraftField(activeProductId, "salePrice", event.target.value ? Number(event.target.value) : null)}
                        placeholder="Optional"
                        type="number"
                        value={activeProductDraft.salePrice ?? ""}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Badge</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "badge", event.target.value)} value={activeProductDraft.badge} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Collection</Label>
                      <select
                        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                        onChange={(event) => updateDraftField(activeProductId, "collection", event.target.value)}
                        value={activeProductDraft.collection}
                      >
                        {productCollectionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Skin goal</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "skinGoal", event.target.value)} value={activeProductDraft.skinGoal} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Promo start</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "promoStartsAt", event.target.value)} type="datetime-local" value={activeProductDraft.promoStartsAt} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Promo end</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "promoEndsAt", event.target.value)} type="datetime-local" value={activeProductDraft.promoEndsAt} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Stock quantity</Label>
                      <Input
                        onChange={(event) => updateDraftField(activeProductId, "stockQuantity", Number(event.target.value || 0))}
                        type="number"
                        value={activeProductDraft.stockQuantity}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Short description</Label>
                    <Textarea onChange={(event) => updateDraftField(activeProductId, "shortDescription", event.target.value)} value={activeProductDraft.shortDescription} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Full description</Label>
                    <Textarea onChange={(event) => updateDraftField(activeProductId, "description", event.target.value)} value={activeProductDraft.description} />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Highlights</Label>
                    <Textarea
                      onChange={(event) => updateDraftField(activeProductId, "highlights", event.target.value)}
                      placeholder="One highlight per line"
                      value={activeProductDraft.highlights}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Ingredients</Label>
                    <Textarea
                      onChange={(event) => updateDraftField(activeProductId, "ingredients", event.target.value)}
                      placeholder="One ingredient per line"
                      value={activeProductDraft.ingredients}
                    />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
                  <div className="grid gap-2">
                    <Label>How to use</Label>
                    <Textarea onChange={(event) => updateDraftField(activeProductId, "howToUse", event.target.value)} value={activeProductDraft.howToUse} />
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>SKU</Label>
                      <Input onChange={(event) => updateDraftField(activeProductId, "sku", event.target.value)} value={activeProductDraft.sku} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  {[
                    { key: "trackInventory", label: "Track inventory" },
                    { key: "isOutOfStock", label: "Mark out of stock" },
                    { key: "isPublished", label: "Publish product" }
                  ].map((item) => (
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700" key={item.key}>
                      <input
                        checked={Boolean(activeProductDraft[item.key as keyof ProductDraft])}
                        className="h-4 w-4 accent-blue-600"
                        onChange={(event) =>
                          updateDraftField(activeProductId, item.key as "trackInventory" | "isOutOfStock" | "isPublished", event.target.checked)
                        }
                        type="checkbox"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>

                <Button className="justify-center bg-slate-950 hover:bg-slate-800" disabled={savingId === activeProductId} size="lg" type="submit">
                  {savingId === activeProductId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingId === activeProductId ? "Saving product..." : "Save Product"}
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>
    );
  }

  function renderPromotions() {
    const paginatedPromos = getPaginatedRows("promotions", filteredPromotions);
    const activePromoDraft = activeEditingPromo ? promoDrafts[activeEditingPromo.id] : null;

    return (
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Promo campaigns</CardTitle>
              <CardDescription>Timed campaigns stay out of the way until you choose to add or edit one.</CardDescription>
            </div>
            <Button className="bg-slate-950 hover:bg-slate-800" disabled={!databaseConnected} onClick={() => setIsCreatePromoOpen(true)} type="button">
              <Plus className="h-4 w-4" />
              Add Promo
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {promoCodes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                No promo campaigns yet. Click <span className="font-semibold text-slate-950">Add Promo</span> to launch the first discount campaign.
              </div>
            ) : (
              <>
                <AdminTableFilters
                  helperText={`${filteredPromotions.length} of ${promoCodes.length} promo codes matched. Search by code, description, discount type, year, or active status.`}
                  onSearchChange={(value) => updateTableSearch("promotions", value)}
                  onStatusChange={(value) => updateTableStatusFilter("promotions", value)}
                  searchId="promotions-table-search"
                  searchLabel="Find promotions"
                  searchPlaceholder="Search code, description, discount type, or year..."
                  searchValue={tableSearches.promotions}
                  statusId="promotions-table-status"
                  statusOptions={promoStatusOptions}
                  statusValue={tableStatusFilters.promotions}
                />

                {filteredPromotions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                    No promo campaigns matched the current search or status filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-200">
                  <Table className="min-w-[900px]">
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Promo</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Minimum basket</TableHead>
                        <TableHead>Window</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPromos.rows.map((promo) => {
                        const amountLabel = promo.discountType === "PERCENTAGE" ? `${promo.amount}% off` : formatCurrency(promo.amount);
                        const windowLabel =
                          promo.startsAt && promo.endsAt
                            ? `${formatDateTime(promo.startsAt)} → ${formatDateTime(promo.endsAt)}`
                            : "Always on";

                        return (
                          <TableRow key={promo.id}>
                            <TableCell>
                              <Link className="font-medium text-slate-950 hover:text-blue-700" href={`/admin/promotions/${promo.id}`}>
                                {promo.code}
                              </Link>
                              <p className="mt-1 text-xs text-slate-500">{promo.description || "No description provided."}</p>
                            </TableCell>
                            <TableCell>{amountLabel}</TableCell>
                            <TableCell>{promo.minOrderAmount ? formatCurrency(promo.minOrderAmount) : "No minimum"}</TableCell>
                            <TableCell className="max-w-[16rem] text-sm text-slate-500">{windowLabel}</TableCell>
                            <TableCell>
                              {promo.usageCount}
                              {promo.usageLimit ? ` / ${promo.usageLimit}` : ""}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={promo.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700"}
                                variant="outline"
                              >
                                {promo.isActive ? "Active" : "Paused"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  disabled={togglingPromoId === promo.id}
                                  onClick={() => handleTogglePromo(promo.id, !promo.isActive)}
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                >
                                  {togglingPromoId === promo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                                  {promo.isActive ? "Pause" : "Activate"}
                                </Button>
                                <Button onClick={() => setEditingPromoId(promo.id)} size="sm" type="button" variant="outline">
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                )}

                {filteredPromotions.length > 0 ? (
                  <AdminTablePagination
                    onPageChange={(page) => setTablePage("promotions", page)}
                    page={paginatedPromos.page}
                    pageSize={paginatedPromos.pageSize}
                    totalItems={paginatedPromos.totalItems}
                    totalPages={paginatedPromos.totalPages}
                  />
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Sheet onOpenChange={setIsCreatePromoOpen} open={isCreatePromoOpen}>
          <SheetContent className={adminSheetClassName} side={sheetSide}>
            <SheetHeader className="border-b border-slate-100 pb-4">
              <SheetTitle>Add Promo</SheetTitle>
              <SheetDescription>Create a campaign only when you intentionally open the form.</SheetDescription>
            </SheetHeader>
            <form className="grid gap-4 pt-6 md:grid-cols-2" onSubmit={handleCreatePromo}>
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
          </SheetContent>
        </Sheet>

        {activeEditingPromo && activePromoDraft ? (
          <Sheet onOpenChange={(open) => !open && setEditingPromoId(null)} open={Boolean(activeEditingPromo)}>
            <SheetContent className={adminSheetClassName} side={sheetSide}>
              <SheetHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <SheetTitle>Edit Promo</SheetTitle>
                    <SheetDescription>Adjust discount logic and campaign timing without leaving the table workflow.</SheetDescription>
                  </div>
                  <Button asChild size="sm" type="button" variant="outline">
                    <Link href={`/admin/promotions/${activeEditingPromo.id}`}>Open Full Page</Link>
                  </Button>
                </div>
              </SheetHeader>
              <form
                className="grid gap-4 pt-6 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSavePromo(activeEditingPromo.id);
                }}
              >
                <div className="grid gap-2">
                  <Label>Promo code</Label>
                  <Input
                    onChange={(event) => updatePromoDraftField(activeEditingPromo.id, "code", event.target.value.toUpperCase())}
                    value={activePromoDraft.code}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Discount type</Label>
                  <select
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                    onChange={(event) =>
                      updatePromoDraftField(activeEditingPromo.id, "discountType", event.target.value as PromoDraft["discountType"])
                    }
                    value={activePromoDraft.discountType}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed amount</option>
                  </select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>Description</Label>
                  <Input
                    onChange={(event) => updatePromoDraftField(activeEditingPromo.id, "description", event.target.value)}
                    placeholder="May glow week promotion"
                    value={activePromoDraft.description}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{activePromoDraft.discountType === "PERCENTAGE" ? "Discount percentage" : "Discount amount (NGN)"}</Label>
                  <Input onChange={(event) => updatePromoDraftField(activeEditingPromo.id, "amount", event.target.value)} type="number" value={activePromoDraft.amount} />
                </div>
                <div className="grid gap-2">
                  <Label>Minimum subtotal (NGN)</Label>
                  <Input
                    onChange={(event) => updatePromoDraftField(activeEditingPromo.id, "minOrderAmount", event.target.value)}
                    placeholder="Optional"
                    type="number"
                    value={activePromoDraft.minOrderAmount}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Promo start</Label>
                  <Input
                    onChange={(event) => updatePromoDraftField(activeEditingPromo.id, "startsAt", event.target.value)}
                    type="datetime-local"
                    value={activePromoDraft.startsAt}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Promo end</Label>
                  <Input
                    onChange={(event) => updatePromoDraftField(activeEditingPromo.id, "endsAt", event.target.value)}
                    type="datetime-local"
                    value={activePromoDraft.endsAt}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Usage limit</Label>
                  <Input
                    onChange={(event) => updatePromoDraftField(activeEditingPromo.id, "usageLimit", event.target.value)}
                    placeholder="Optional"
                    type="number"
                    value={activePromoDraft.usageLimit}
                  />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    checked={activePromoDraft.isActive}
                    className="h-4 w-4 accent-blue-600"
                    onChange={(event) => updatePromoDraftField(activeEditingPromo.id, "isActive", event.target.checked)}
                    type="checkbox"
                  />
                  Promo is active
                </label>

                <div className="md:col-span-2">
                  <Button className="bg-slate-950 hover:bg-slate-800" disabled={savingPromoId === activeEditingPromo.id} size="lg" type="submit">
                    {savingPromoId === activeEditingPromo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {savingPromoId === activeEditingPromo.id ? "Saving promo..." : "Save Promo"}
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>
    );
  }

  function renderCustomers() {
    const paginatedCustomers = getPaginatedRows("customers", filteredCustomers);
    const spotlightCustomers = customers.slice(0, 3);

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
            <>
              {spotlightCustomers.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-3">
                  {spotlightCustomers.map((customer) => (
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5" key={`spotlight-${customer.email}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Live customer</p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">{customer.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
                          {customer.phone ? <p className="mt-1 text-sm text-slate-500">{customer.phone}</p> : null}
                        </div>
                        <Badge className={customer.latestStatus ? getStatusClassName(customer.latestStatus) : "border-slate-200 bg-white text-slate-700"} variant="outline">
                          {customer.latestStatus ? getStatusLabel(customer.latestStatus) : "No status"}
                        </Badge>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {[
                          { label: "Orders", value: `${customer.ordersCount}` },
                          { label: "Total spent", value: formatCurrency(customer.totalSpent) },
                          { label: "Last activity", value: customer.lastOrderAt ? formatDateTime(customer.lastOrderAt) : "No orders yet" }
                        ].map((item) => (
                          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3" key={item.label}>
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/customers/${encodeURIComponent(customer.email)}`}>Open Customer</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <AdminTableFilters
                helperText={`${filteredCustomers.length} of ${customers.length} customers matched. Search by name, email, phone, year, or order status.`}
                onSearchChange={(value) => updateTableSearch("customers", value)}
                onStatusChange={(value) => updateTableStatusFilter("customers", value)}
                searchId="customers-table-search"
                searchLabel="Find customers"
                searchPlaceholder="Search name, email, phone, status, or year..."
                searchValue={tableSearches.customers}
                statusId="customers-table-status"
                statusOptions={customerStatusOptions}
                statusValue={tableStatusFilters.customers}
              />

              {filteredCustomers.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                  No customers matched the current search or status filter.
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-200">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total spent</TableHead>
                      <TableHead>Last activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.rows.map((customer) => (
                      <TableRow key={customer.email}>
                        <TableCell>
                          <Link className="font-medium text-slate-950 hover:text-blue-700" href={`/admin/customers/${encodeURIComponent(customer.email)}`}>
                            {customer.name}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">{customer.email}</p>
                          {customer.phone ? <p className="mt-1 text-xs text-slate-500">{customer.phone}</p> : null}
                        </TableCell>
                        <TableCell>{customer.ordersCount}</TableCell>
                        <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                        <TableCell>{customer.lastOrderAt ? formatDateTime(customer.lastOrderAt) : "No orders yet"}</TableCell>
                        <TableCell>
                          <Badge className={customer.latestStatus ? getStatusClassName(customer.latestStatus) : "border-slate-200 bg-slate-50 text-slate-700"} variant="outline">
                            {customer.latestStatus ? getStatusLabel(customer.latestStatus) : "No status"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/customers/${encodeURIComponent(customer.email)}`}>Open</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}

              {filteredCustomers.length > 0 ? (
                <AdminTablePagination
                  onPageChange={(page) => setTablePage("customers", page)}
                  page={paginatedCustomers.page}
                  pageSize={paginatedCustomers.pageSize}
                  totalItems={paginatedCustomers.totalItems}
                  totalPages={paginatedCustomers.totalPages}
                />
              ) : null}
            </>
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
          <CardContent className="grid gap-4 sm:grid-cols-2">
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
          <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" key={item.label}>
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
      },
      {
        title: "Email delivery",
        value: mailerConfigured ? "SMTP configured" : "Missing SMTP config"
      }
    ];

    return (
      <div className="space-y-6">
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

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>State delivery pricing</CardTitle>
              <CardDescription>Search for a Nigerian state, select it from the dropdown, and update the fee in one focused editor.</CardDescription>
            </div>
            <Button className="bg-slate-950 hover:bg-slate-800" disabled={savingDeliveryRates} onClick={handleSaveDeliveryRates} type="button">
              {savingDeliveryRates ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Delivery Rates
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.7fr)_minmax(20rem,1fr)]">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="delivery-rate-search">Find state</Label>
                  <Input
                    id="delivery-rate-search"
                    onChange={(event) => setDeliveryRateSearch(event.target.value)}
                    placeholder="Search Lagos, FCT, Kano..."
                    value={deliveryRateSearch}
                  />
                  <p className="text-xs leading-6 text-slate-500">
                    {filteredDeliveryRates.length} matching state{filteredDeliveryRates.length === 1 ? "" : "s"}.
                    Data is still loaded from the backend on every admin page request.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="delivery-rate-state">Select state</Label>
                  <select
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                    disabled={filteredDeliveryRates.length === 0}
                    id="delivery-rate-state"
                    onChange={(event) => setSelectedDeliveryStateCode(event.target.value)}
                    value={selectedDeliveryRate?.stateCode ?? ""}
                  >
                    {filteredDeliveryRates.length === 0 ? <option value="">No states found</option> : null}
                    {filteredDeliveryRates.map((rate) => (
                      <option key={rate.stateCode} value={rate.stateCode}>
                        {rate.stateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                {selectedDeliveryRate ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Selected state</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{selectedDeliveryRate.stateName}</p>
                      <p className="mt-1 text-sm text-slate-500">{selectedDeliveryRate.stateCode.replaceAll("_", " ")}</p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="delivery-rate-fee">Delivery fee (NGN)</Label>
                      <Input
                        id="delivery-rate-fee"
                        min={0}
                        onChange={(event) =>
                          setDeliveryRateDrafts((current) => ({
                            ...current,
                            [selectedDeliveryRate.stateCode]: event.target.value
                          }))
                        }
                        type="number"
                        value={deliveryRateDrafts[selectedDeliveryRate.stateCode] ?? String(selectedDeliveryRate.feeAmount)}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Updated</p>
                        <p className="mt-2 text-sm font-medium text-slate-950">
                          {selectedDeliveryRate.updatedAt ? formatDateTime(selectedDeliveryRate.updatedAt) : "Default rate"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Current fee</p>
                        <p className="mt-2 text-sm font-medium text-slate-950">
                          {formatCurrency(Number(deliveryRateDrafts[selectedDeliveryRate.stateCode] ?? selectedDeliveryRate.feeAmount))}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm leading-7 text-slate-500">
                    No state matches that search yet. Try a different keyword such as Lagos, Rivers, or FCT.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="min-h-screen overflow-x-clip bg-[#0b1020] text-slate-900">
      <div className="mx-auto w-full max-w-[1800px] px-2 py-2 sm:px-6 sm:py-4 lg:px-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden lg:block lg:sticky lg:top-4 lg:self-start">
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
                    <Link
                      className={`flex w-full items-start gap-3 rounded-2xl px-4 py-4 text-left transition-colors ${
                        active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                      href={item.href}
                      key={item.id}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className={`mt-1 text-xs leading-5 ${active ? "text-blue-100" : "text-slate-500"}`}>{item.helper}</p>
                      </div>
                    </Link>
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

          <div className="min-w-0 space-y-4 sm:space-y-6">
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white px-3 py-4 shadow-sm sm:rounded-[32px] sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Operations Workspace</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">Global-standard commerce admin</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:leading-7">
                    Manage stock, sales, fulfilment, customers, security, and product publishing from a proper admin shell
                    instead of a storefront-styled form page.
                  </p>
                  <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    <span className={`h-2 w-2 rounded-full ${databaseConnected ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {databaseConnected ? "Live backend reads enabled" : "Database connection missing"}
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:hidden">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Signed in</p>
                    <p className="mt-2 break-all text-sm font-semibold text-slate-950">{sessionEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isRefreshing || loggingOut}
                    onClick={refreshWorkspace}
                    type="button"
                    variant="outline"
                  >
                    {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                  <Button className="w-full sm:w-auto" disabled={loggingOut} onClick={handleLogout} type="button" variant="outline">
                    {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    Sign out
                  </Button>
                </div>
              </div>
            </div>

            <div className="sticky top-2 z-20 sm:hidden">
              <div className="rounded-[22px] border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Current section</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <activeNavItem.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{activeNavItem.label}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{activeNavItem.helper}</p>
                      </div>
                    </div>
                  </div>

                  <Button className="shrink-0" onClick={() => setIsMobileNavOpen(true)} size="sm" type="button" variant="outline">
                    <Menu className="h-4 w-4" />
                    Sections
                  </Button>
                </div>
              </div>

              <Sheet onOpenChange={setIsMobileNavOpen} open={isMobileNavOpen}>
                <SheetContent className="max-h-[88vh] overflow-y-auto rounded-t-[30px]" side="bottom">
                  <SheetHeader className="border-b border-slate-100 pb-4">
                    <SheetTitle>Admin Navigation</SheetTitle>
                    <SheetDescription>Jump straight to the section you want without taking over the page on mobile.</SheetDescription>
                  </SheetHeader>

                  <div className="grid gap-3 pt-5">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === item.id;

                      return (
                        <Link
                          className={`rounded-[22px] border px-4 py-4 shadow-sm transition-colors ${
                            active ? "border-blue-200 bg-blue-600 text-white shadow-blue-900/20" : "border-slate-200 bg-white text-slate-800"
                          }`}
                          href={item.href}
                          key={item.id}
                          onClick={() => setIsMobileNavOpen(false)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{item.label}</p>
                              <p className={`mt-1 text-xs leading-5 ${active ? "text-blue-100" : "text-slate-500"}`}>{item.helper}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="-mx-1 hidden gap-2 overflow-x-auto px-1 pb-1 sm:flex lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <Link
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                      active ? "bg-blue-600 text-white" : "bg-white text-slate-600"
                    }`}
                    href={item.href}
                    key={item.id}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
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
