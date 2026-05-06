import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/admin-login-form";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminSessionFromCookies, isSuperAdminConfigured } from "@/lib/server/admin-auth";

export const metadata = {
  title: "Admin Login"
};

export default function AdminLoginPage() {
  if (getAdminSessionFromCookies()) {
    redirect("/admin/products");
  }

  const configured = isSuperAdminConfigured();

  return (
    <section className="bg-[#faf6f1] py-14 sm:py-16 lg:py-20">
      <div className="container grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.85fr)]">
        <Card className="border-[#eadfce] bg-[linear-gradient(135deg,#fffdf8_0%,#f4ecdf_100%)]">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9c7530]">Admin Portal</p>
            <h1 className="font-display text-5xl font-medium leading-[0.92] tracking-[-0.04em] text-foreground sm:text-6xl">
              Upload products to the live storefront
            </h1>
            <p className="max-w-xl text-sm leading-7 text-[#6b4f3a] sm:text-base sm:leading-8">
              This dashboard is the first backend phase: create products, upload media to Cloudinary, publish or hide
              items, and control stock levels from a super-admin session.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Cloudinary image upload",
                "Published vs draft products",
                "Track stock and out-of-stock state"
              ].map((item) => (
                <div className="rounded-[18px] border border-white/60 bg-white/72 px-4 py-4 text-sm text-[#6d5647]" key={item}>
                  {item}
                </div>
              ))}
            </div>

            {!configured ? (
              <div className="rounded-[18px] border border-[#eadfce] bg-white/80 px-4 py-4 text-sm leading-6 text-[#6b4f3a]">
                Super-admin credentials are not configured yet. Add `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, and
                `ADMIN_SESSION_SECRET` to `.env.local` before signing in.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <AdminLoginForm />
      </div>
    </section>
  );
}
