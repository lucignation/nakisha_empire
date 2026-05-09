import AdminWorkspace from "@/components/admin/admin-workspace";
import { getAdminWorkspacePageProps } from "@/lib/server/admin-workspace-page";

export const metadata = {
  title: "Admin Products"
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const props = await getAdminWorkspacePageProps();

  return <AdminWorkspace {...props} activeSection="products" />;
}
