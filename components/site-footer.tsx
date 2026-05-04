import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[#2c1f17] py-10 text-white">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-3xl font-semibold tracking-[0.04em] text-white">
              Nakisha <span className="text-gold-300">Empire</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-7 text-white/55">
              Fast shopping for clean, glow-focused skincare with nationwide delivery and simple checkout.
            </p>
          </div>

          <div>
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white">Shop</h3>
            <div className="mt-4 grid gap-2 text-sm text-white/55">
              <Link href="/shop">All Products</Link>
              <Link href="/shop">New Arrivals</Link>
              <Link href="/shop">Best Sellers</Link>
            </div>
          </div>

          <div>
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white">Support</h3>
            <div className="mt-4 grid gap-2 text-sm text-white/55">
              <Link href="/cart">Cart</Link>
              <a href="mailto:hello@nakishaempire.com">hello@nakishaempire.com</a>
              <span>Lagos, Nigeria</span>
            </div>
          </div>

          <div>
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white">Info</h3>
            <div className="mt-4 grid gap-2 text-sm text-white/55">
              <Link href="/about">About</Link>
              <Link href="/ingredients">Ingredients</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Nakisha Empire. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] border border-white/10 px-3 py-1">Paystack</span>
            <span className="rounded-[4px] border border-white/10 px-3 py-1">Flutterwave</span>
            <span className="rounded-[4px] border border-white/10 px-3 py-1">VISA</span>
            <span className="rounded-[4px] border border-white/10 px-3 py-1">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
