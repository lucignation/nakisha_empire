"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import WhatsAppChatFab from "@/components/whatsapp-chat-fab";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen overflow-x-clip bg-[#0b1020]">{children}</main>;
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="pt-[128px] lg:pt-[72px]">{children}</main>
      <WhatsAppChatFab />
      <SiteFooter />
    </div>
  );
}
