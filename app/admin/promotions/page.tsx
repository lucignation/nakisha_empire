import AdminWorkspace from "@/components/admin/admin-workspace";
import { getAdminWorkspacePageProps } from "@/lib/server/admin-workspace-page";

export const metadata = {
  title: "Admin Promotions"
};

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const props = await getAdminWorkspacePageProps();

  return <AdminWorkspace {...props} activeSection="promotions" />;
}
