import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/app-shell";
import { CartProvider } from "@/components/cart-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Nakisha Empire | Luxury Skincare",
    template: "%s | Nakisha Empire"
  },
  description:
    "Nakisha Empire is a luxurious multi-page skincare storefront with glow-focused routines, ingredient education, and a simple shopping flow."
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="font-sans">
        <CartProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
