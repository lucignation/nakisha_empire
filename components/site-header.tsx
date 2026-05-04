"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/consultation", label: "Consultation" },
  { href: "/blog", label: "Blog" }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#eadfce] bg-[rgba(250,246,241,0.96)] backdrop-blur-xl">
      <div className="container flex min-h-[72px] items-center gap-4">
        <Link className="shrink-0 font-display text-[1.65rem] font-semibold tracking-[0.04em] text-foreground" href="/">
          Nakisha <span className="text-gold-500">Empire</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                className={cn(
                  "rounded-[4px] px-3 py-2 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[#6b4f3a] transition-colors hover:bg-[#f0e2c8] hover:text-gold-500",
                  active && "bg-[#f0e2c8] text-gold-500"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden flex-1 lg:block">
          <div className="relative mx-auto max-w-[28rem]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7767]" />
            <Input
              aria-label="Search products"
              className="h-11 border-[#e1d3c1] bg-white pl-11 text-[#2c1f17] placeholder:text-[#9c7f6e]"
              placeholder="Search products, categories, brands..."
              type="search"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6b4f3a] transition-colors hover:bg-[#f2ebe0] hover:text-gold-500 lg:hidden"
            type="button"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#6b4f3a] transition-colors hover:bg-[#f2ebe0] hover:text-gold-500 lg:flex"
            type="button"
          >
            <User className="h-4 w-4" />
          </button>

          <Link
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#6b4f3a] transition-colors hover:bg-[#f2ebe0] hover:text-gold-500"
            href="/cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.55rem] font-semibold text-white">
              {itemCount}
            </span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#6b4f3a] transition-colors hover:bg-[#f2ebe0] hover:text-gold-500 lg:hidden"
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent className="border-l-[#eadfce] bg-[#faf6f1]" side="right">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl font-semibold">Nakisha Empire</SheetTitle>
                <SheetDescription>Browse products, categories, and quick links from one menu.</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7767]" />
                  <Input className="border-[#e1d3c1] bg-white pl-11" placeholder="Search products..." type="search" />
                </div>
              </div>
              <Separator className="my-6 bg-[#eadfce]" />
              <div className="grid gap-3">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      className="rounded-[6px] border border-transparent px-4 py-3 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[#6b4f3a] transition-colors hover:border-[#e1d3c1] hover:bg-white"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <Separator className="my-6 bg-[#eadfce]" />
              <SheetClose asChild>
                <Link
                  className="inline-flex items-center justify-center rounded-[4px] bg-foreground px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-background"
                  href="/cart"
                >
                  View Cart ({itemCount})
                </Link>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="border-t border-[#f0e8dc] lg:hidden">
        <div className="container py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7767]" />
            <Input
              aria-label="Search products"
              className="h-11 border-[#e1d3c1] bg-white pl-11 text-[#2c1f17] placeholder:text-[#9c7f6e]"
              placeholder="Search products, categories, brands..."
              type="search"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
