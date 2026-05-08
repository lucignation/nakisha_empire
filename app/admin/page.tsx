import AdminWorkspace from "@/components/admin/admin-workspace";
import { requireAdminSession } from "@/lib/server/admin-auth";
import { getAdminDashboardData } from "@/lib/server/admin-dashboard";
import { isCloudinaryConfigured } from "@/lib/server/cloudinary";
import { getAdminPromoCodes } from "@/lib/server/promos";
import { getAdminProducts, getRecentInventoryLogs } from "@/lib/server/products";

export const metadata = {
  title: "Admin Workspace"
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = requireAdminSession();
  const [products, recentInventoryLogs, promoCodes] = await Promise.all([
    getAdminProducts(),
    getRecentInventoryLogs(),
    getAdminPromoCodes()
  ]);
  const dashboard = await getAdminDashboardData({
    recentInventoryLogs
  });

  return (
    <AdminWorkspace
      cloudinaryConfigured={isCloudinaryConfigured()}
      customers={dashboard.customers}
      databaseConnected={Boolean(process.env.DATABASE_URL)}
      directDatabaseConfigured={Boolean(process.env.DIRECT_URL)}
      initialProducts={products}
      inventory={dashboard.inventory}
      lowStockProducts={dashboard.lowStockProducts}
      metrics={dashboard.metrics}
      orders={dashboard.orders}
      promoCodes={promoCodes}
      recentInventoryLogs={dashboard.recentInventoryLogs}
      sessionEmail={session.email}
    />
  );
}
