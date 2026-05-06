import { redirect } from "next/navigation";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";

export default function AdminIndexPage() {
  const session = getAdminSessionFromCookies();
  redirect(session ? "/admin/products" : "/admin/login");
}
