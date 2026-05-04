import Link from "next/link";
import LogoMarquee from "@/components/logo-marquee";
import MarketplaceHomeCatalog from "@/components/marketplace-home-catalog";
import ProductArt from "@/components/product-art";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, products } from "@/lib/data";

export const metadata = {
  title: "Shop"
};

export default function ShopPage() {
  const shopHighlights = [products[0], products[5]];

  return (
    <>
      <section className="border-b border-[#eadfce] bg-[#faf6f1] py-8 sm:py-10">
        <div className="container">
          <Card className="overflow-hidden border-[#eadfce] bg-[linear-gradient(135deg,#faf6f1_0%,#f1e6da_58%,#fff6ef_100%)]">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.98fr)]">
              <CardContent className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-500">Storefront</p>
                <h1 className="font-display text-4xl font-medium leading-[0.95] text-foreground sm:text-5xl">
                  Shop All Products
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[#6b4f3a] sm:text-base sm:leading-8">
                  Browse the full Nakisha Empire collection with category filters, brand filters, price control, and
                  pagination that keeps the catalogue easier to scan.
                </p>

                <div className="flex flex-wrap gap-2">
                  {["Category filters", "Brand filters", "Paginated results", "Fast add to cart"].map((item) => (
                    <span
                      className="rounded-full border border-white/65 bg-white/78 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#6d5647]"
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

              <div className="grid gap-4 border-t border-[#eadfce] p-4 lg:grid-cols-2 lg:border-l lg:border-t-0 lg:p-6">
                {shopHighlights.map((product) => (
                  <Card className="overflow-hidden border-white/60 bg-white/82 shadow-none" key={product.slug}>
                    <CardContent className="space-y-3 p-3">
                      <ProductArt className="min-h-[12rem] rounded-[18px]" product={product} />
                      <div className="space-y-1 px-1 pb-1">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">
                          Highlight
                        </p>
                        <h2 className="text-base font-semibold text-foreground">{product.name}</h2>
                        <p className="text-sm text-[#8f7767]">
                          {product.category} · {formatCurrency(product.price)}
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

      <section className="bg-[#faf6f1] py-12 sm:py-14">
        <div className="container">
          <MarketplaceHomeCatalog products={products} />
        </div>
      </section>
    </>
  );
}
