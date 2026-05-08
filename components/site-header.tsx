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
  { href: "/track", label: "Track Order" },
  { href: "/consultation", label: "Consultation" },
  { href: "/blog", label: "Blog" }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--brand-border)] bg-[rgba(255,255,255,0.96)] backdrop-blur-xl">
      <div className="container flex min-h-[68px] items-center gap-4">
        <Link className="shrink-0 font-display text-[1.5rem] font-semibold tracking-[0.01em] text-foreground" href="/">
          Nakisha <span className="text-[var(--brand-accent-strong)]">Empire</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                className={cn(
                  "rounded-[10px] px-3 py-2 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand-ink)] transition-colors hover:bg-[var(--brand-100)] hover:text-[var(--brand-accent-strong)]",
                  active && "bg-[var(--brand-100)] text-[var(--brand-accent-strong)]"
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
            className="h-11 rounded-xl border-[var(--brand-border)] bg-[var(--surface-muted)] pl-11 text-foreground placeholder:text-[var(--brand-ink-soft)]"
              placeholder="Search products, categories, brands..."
              type="search"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--brand-ink)] transition-colors hover:bg-[var(--brand-100)] hover:text-[var(--brand-accent-strong)] lg:hidden"
            type="button"
          >
            <Search className="h-4 w-4" />
          </button>

          <Link
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-[var(--brand-ink)] transition-colors hover:bg-[var(--brand-100)] hover:text-[var(--brand-accent-strong)] lg:flex"
            href="/account"
          >
            <User className="h-4 w-4" />
          </Link>

          <Link
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--brand-ink)] transition-colors hover:bg-[var(--brand-100)] hover:text-[var(--brand-accent-strong)]"
            href="/cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-400)] px-1 text-[0.55rem] font-semibold text-[var(--brand-ink)]">
              {itemCount}
            </span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--brand-ink)] transition-colors hover:bg-[var(--brand-100)] hover:text-[var(--brand-accent-strong)] lg:hidden"
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent className="border-l-[var(--brand-border)] bg-[var(--brand-50)]" side="right">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl font-semibold">Nakisha Empire</SheetTitle>
                <SheetDescription>Browse products, categories, and quick links from one menu.</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-ink-soft)]" />
                  <Input className="border-[var(--brand-border)] bg-white pl-11" placeholder="Search products..." type="search" />
                </div>
              </div>
              <Separator className="my-6 bg-[var(--brand-border)]" />
              <div className="grid gap-3">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      className="rounded-[6px] border border-transparent px-4 py-3 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand-ink)] transition-colors hover:border-[var(--brand-border)] hover:bg-white"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <Separator className="my-6 bg-[var(--brand-border)]" />
              <SheetClose asChild>
                <Link
                  className="mb-3 inline-flex items-center justify-center rounded-[4px] border border-[var(--brand-border)] bg-white px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-ink)]"
                  href="/account"
                >
                  Account
                </Link>
              </SheetClose>
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

      <div className="border-t border-[var(--brand-border)] lg:hidden">
        <div className="container py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-ink-soft)]" />
            <Input
              aria-label="Search products"
              className="h-11 rounded-xl border-[var(--brand-border)] bg-[var(--surface-muted)] pl-11 text-foreground placeholder:text-[var(--brand-ink-soft)]"
              placeholder="Search products, categories, brands..."
              type="search"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
