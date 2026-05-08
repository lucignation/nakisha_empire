import Link from "next/link";
import LogoMarquee from "@/components/logo-marquee";
import MarketplaceHomeCatalog from "@/components/marketplace-home-catalog";
import ProductArt from "@/components/product-art";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getEffectivePrice, isProductOnSale } from "@/lib/data";
import { getStorefrontProducts } from "@/lib/server/products";

export const metadata = {
  title: "Shop"
};

export default async function ShopPage() {
  const products = await getStorefrontProducts();
  const shopHighlights = [products[0], products[products.length > 1 ? Math.min(5, products.length - 1) : 0]];

  return (
    <>
      <section className="border-b border-[var(--brand-border)] bg-[var(--brand-50)] py-6 sm:py-8">
        <div className="container">
          <Card className="overflow-hidden rounded-[28px] border-[var(--brand-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.98fr)]">
              <CardContent className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-9">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent-strong)]">Storefront</p>
                <h1 className="font-display text-3xl font-semibold leading-[1.02] text-foreground sm:text-[2.8rem]">
                  Shop All Products
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--brand-ink-soft)] sm:text-base sm:leading-8">
                  Browse the full Nakisha Empire collection with category filters, brand filters, price control, and
                  pagination that keeps the catalogue easier to scan.
                </p>

                <div className="flex flex-wrap gap-2">
                  {["Category filters", "Brand filters", "Paginated results", "Fast add to cart"].map((item) => (
                    <span
                      className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-50)] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--brand-ink-soft)]"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/cart">Go to Cart</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/">Back to Homepage</Link>
                  </Button>
                </div>
              </CardContent>

              <div className="grid gap-4 border-t border-[var(--brand-border)] bg-[var(--brand-50)] p-4 lg:grid-cols-2 lg:border-l lg:border-t-0 lg:p-5">
                {shopHighlights.map((product) => (
                  <Card className="overflow-hidden rounded-[20px] border-[var(--brand-border)] bg-white shadow-none" key={product.slug}>
                    <CardContent className="space-y-3 p-3">
                      <ProductArt className="min-h-[12rem] rounded-[18px]" product={product} />
                      <div className="space-y-1 px-1 pb-1">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-ink-soft)]">
                          Highlight
                        </p>
                        <h2 className="text-base font-semibold text-foreground">{product.name}</h2>
                        <p className="text-sm text-[var(--brand-ink-soft)]">
                          {product.category} · {formatCurrency(getEffectivePrice(product))}
                          {isProductOnSale(product) ? ` · was ${formatCurrency(product.price)}` : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <div className="container">
          <LogoMarquee />
        </div>
      </section>

      <section className="bg-[var(--brand-50)] py-12 sm:py-14">
        <div className="container">
          <MarketplaceHomeCatalog products={products} />
        </div>
      </section>
    </>
  );
}
