import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--brand-border)] bg-white py-8 text-foreground">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-2xl font-semibold tracking-[0.02em] text-foreground">
              Nakisha <span className="text-[var(--brand-accent-strong)]">Empire</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-7 text-[var(--brand-ink-soft)]">
              Fast shopping for clean, glow-focused skincare with clear pricing, simple checkout, and order tracking.
            </p>
          </div>

          <div>
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-foreground">Shop</h3>
            <div className="mt-4 grid gap-2 text-sm text-[var(--brand-ink-soft)]">
              <Link href="/shop">All Products</Link>
              <Link href="/shop">New Arrivals</Link>
              <Link href="/shop">Best Sellers</Link>
            </div>
          </div>

          <div>
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-foreground">Support</h3>
            <div className="mt-4 grid gap-2 text-sm text-[var(--brand-ink-soft)]">
              <Link href="/cart">Cart</Link>
              <Link href="/track">Track Order</Link>
              <a href="mailto:hello@nakishaempire.com">hello@nakishaempire.com</a>
              <span>Lagos, Nigeria</span>
            </div>
          </div>

          <div>
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-foreground">Info</h3>
            <div className="mt-4 grid gap-2 text-sm text-[var(--brand-ink-soft)]">
              <Link href="/about">About</Link>
              <Link href="/ingredients">Ingredients</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--brand-border)] pt-6 text-xs text-[var(--brand-ink-soft)] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Nakisha Empire. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="rounded-[6px] border border-[var(--brand-border)] bg-[var(--brand-50)] px-3 py-1">Paystack</span>
            <span className="rounded-[6px] border border-[var(--brand-border)] bg-[var(--brand-50)] px-3 py-1">Flutterwave</span>
            <span className="rounded-[6px] border border-[var(--brand-border)] bg-[var(--brand-50)] px-3 py-1">VISA</span>
            <span className="rounded-[6px] border border-[var(--brand-border)] bg-[var(--brand-50)] px-3 py-1">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
