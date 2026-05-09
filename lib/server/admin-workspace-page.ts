import { unstable_noStore as noStore } from "next/cache";
import { requireAdminSession } from "@/lib/server/admin-auth";
import { getAdminDashboardData } from "@/lib/server/admin-dashboard";
import { isCloudinaryConfigured } from "@/lib/server/cloudinary";
import { getDeliveryRates } from "@/lib/server/delivery-rates";
import { isMailerConfigured } from "@/lib/server/mailer";
import { getAdminPromoCodes } from "@/lib/server/promos";
import { getAdminProducts, getRecentInventoryLogs } from "@/lib/server/products";

export async function getAdminWorkspacePageProps() {
  noStore();
  const session = requireAdminSession();
  const [products, recentInventoryLogs, promoCodes, deliveryRates] = await Promise.all([
    getAdminProducts(),
    getRecentInventoryLogs(),
    getAdminPromoCodes(),
    getDeliveryRates()
  ]);
  const dashboard = await getAdminDashboardData({
    recentInventoryLogs
  });

  return {
    cloudinaryConfigured: isCloudinaryConfigured(),
    customers: dashboard.customers,
    databaseConnected: Boolean(process.env.DATABASE_URL),
    directDatabaseConfigured: Boolean(process.env.DIRECT_URL),
    deliveryRates,
    initialProducts: products,
    inventory: dashboard.inventory,
    lowStockProducts: dashboard.lowStockProducts,
    mailerConfigured: isMailerConfigured(),
    metrics: dashboard.metrics,
    orders: dashboard.orders,
    promoCodes,
    recentInventoryLogs: dashboard.recentInventoryLogs,
    sessionEmail: session.email
  };
}
