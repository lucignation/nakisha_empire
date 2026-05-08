import { OrderStatus, PaymentGateway, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/data";
import { getAdminProducts, type InventoryActivityRecord } from "@/lib/server/products";

export interface AdminDashboardMetric {
  label: string;
  value: string;
  change: string;
  tone: "blue" | "emerald" | "amber" | "violet";
}

export interface AdminOrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  status: OrderStatus;
  paymentGateway?: PaymentGateway | null;
  paymentReference?: string | null;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  promoCode?: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId?: string | null;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export interface AdminCustomerRecord {
  email: string;
  name: string;
  phone?: string | null;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  latestStatus?: OrderStatus;
}

export interface AdminInventoryRecord {
  id: string;
  name: string;
  sku?: string | null;
  category: string;
  stockQuantity: number;
  trackInventory: boolean;
  isOutOfStock: boolean;
  price: number;
  updatedAt?: string;
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetric[];
  orders: AdminOrderRecord[];
  customers: AdminCustomerRecord[];
  inventory: AdminInventoryRecord[];
  lowStockProducts: AdminInventoryRecord[];
  recentInventoryLogs: InventoryActivityRecord[];
}

function formatCurrencyValue(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

function databaseIsConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

const orderSelect = {
  id: true,
  orderNumber: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  status: true,
  paymentGateway: true,
  paymentReference: true,
  subtotalAmount: true,
  discountAmount: true,
  shippingAmount: true,
  totalAmount: true,
  promoCode: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      productId: true,
      productName: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true
    }
  }
} satisfies Prisma.OrderSelect;

function mapOrder(record: Prisma.OrderGetPayload<{ select: typeof orderSelect }>): AdminOrderRecord {
  return {
    id: record.id,
    orderNumber: record.orderNumber,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    customerPhone: record.customerPhone,
    status: record.status,
    paymentGateway: record.paymentGateway,
    paymentReference: record.paymentReference,
    subtotalAmount: record.subtotalAmount,
    discountAmount: record.discountAmount,
    shippingAmount: record.shippingAmount,
    totalAmount: record.totalAmount,
    promoCode: record.promoCode,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    items: record.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    }))
  };
}

export async function getAdminOrders(limit = 50): Promise<AdminOrderRecord[]> {
  if (!databaseIsConfigured()) {
    return [];
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      select: orderSelect
    });

    return orders.map(mapOrder);
  } catch (error) {
    console.error("Unable to query orders from Prisma/Neon", error);
    return [];
  }
}

export async function getAdminDashboardData(input: {
  recentInventoryLogs: InventoryActivityRecord[];
}): Promise<AdminDashboardData> {
  const [products, orders] = await Promise.all([getAdminProducts(), getAdminOrders()]);

  const inventory = products
    .filter((product) => !String(product.id).startsWith("fallback-"))
    .map((product) => ({
      id: product.id as string,
      name: product.name,
      sku: product.sku,
      category: product.category,
      stockQuantity: product.stockQuantity ?? 0,
      trackInventory: product.trackInventory ?? false,
      isOutOfStock: product.isOutOfStock ?? false,
      price: product.price,
      updatedAt: product.updatedAt
    }));

  const lowStockProducts = inventory.filter((product) => product.trackInventory && product.stockQuantity <= 10);
  const grossRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED");
  const pendingOrders = orders.filter((order) => order.status === "PENDING");
  const inProgressOrders = orders.filter((order) => order.status === "PROCESSING");
  const inTransitOrders = orders.filter((order) => order.status === "SHIPPED");
  const uniqueCustomers = new Map<string, AdminCustomerRecord>();

  for (const order of orders) {
    const existing = uniqueCustomers.get(order.customerEmail);

    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += order.totalAmount;
      if (!existing.lastOrderAt || new Date(order.createdAt) > new Date(existing.lastOrderAt)) {
        existing.lastOrderAt = order.createdAt;
        existing.latestStatus = order.status;
      }
    } else {
      uniqueCustomers.set(order.customerEmail, {
        email: order.customerEmail,
        name: order.customerName,
        phone: order.customerPhone,
        ordersCount: 1,
        totalSpent: order.totalAmount,
        lastOrderAt: order.createdAt,
        latestStatus: order.status
      });
    }
  }

  const customers = [...uniqueCustomers.values()].sort((a, b) => b.totalSpent - a.totalSpent);
  const inventoryValue = inventory.reduce((sum, item) => sum + item.stockQuantity * item.price, 0);

  const metrics: AdminDashboardMetric[] = [
    {
      label: "Gross revenue",
      value: formatCurrencyValue(grossRevenue),
      change: `${orders.length} total orders`,
      tone: "blue"
    },
    {
      label: "Pending fulfilment",
      value: `${pendingOrders.length + inProgressOrders.length + inTransitOrders.length}`,
      change: `${pendingOrders.length} pending, ${inProgressOrders.length} in process`,
      tone: "amber"
    },
    {
      label: "Delivered orders",
      value: `${deliveredOrders.length}`,
      change: `${customers.length} active customers`,
      tone: "emerald"
    },
    {
      label: "Inventory exposure",
      value: formatCurrencyValue(inventoryValue),
      change: `${lowStockProducts.length} low-stock items`,
      tone: "violet"
    }
  ];

  return {
    metrics,
    orders,
    customers,
    inventory,
    lowStockProducts,
    recentInventoryLogs: input.recentInventoryLogs
  };
}
