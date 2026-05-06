import AdminProductsManager from "@/components/admin/admin-products-manager";
import { getAdminSessionFromCookies, requireAdminSession } from "@/lib/server/admin-auth";
import { isCloudinaryConfigured } from "@/lib/server/cloudinary";
import { getAdminProducts, getRecentInventoryLogs } from "@/lib/server/products";

export const metadata = {
  title: "Admin Products"
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  requireAdminSession();

  const session = getAdminSessionFromCookies();
  const products = await getAdminProducts();
  const recentInventoryLogs = await getRecentInventoryLogs();

  return (
    <section className="bg-[#faf6f1] py-12 sm:py-14 lg:py-16">
      <div className="container">
        <AdminProductsManager
          cloudinaryConfigured={isCloudinaryConfigured()}
          databaseConnected={Boolean(process.env.DATABASE_URL)}
          directDatabaseConfigured={Boolean(process.env.DIRECT_URL)}
          initialProducts={products}
          recentInventoryLogs={recentInventoryLogs}
          sessionEmail={session?.email ?? "super-admin"}
        />
      </div>
    </section>
  );
}
