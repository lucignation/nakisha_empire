import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductArt from "@/components/product-art";
import ProductCard from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, isProductAvailable } from "@/lib/data";
import { getStorefrontProductBySlug, getStorefrontProducts } from "@/lib/server/products";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getStorefrontProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product not found"
    };
  }

  return {
    title: product.name,
    description: product.description
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getStorefrontProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const products = await getStorefrontProducts();
  const relatedProducts = products
    .filter((item) => item.slug !== product.slug)
    .sort((left, right) => Number(right.collection === product.collection) - Number(left.collection === product.collection))
    .slice(0, 3);
  const available = isProductAvailable(product);

  return (
    <>
      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container space-y-6">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <Link className="hover:text-foreground" href="/shop">
              Shop
            </Link>{" "}
            / {product.name}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
            <ProductArt large product={product} />

            <Card className="bg-white/85">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="flex flex-wrap gap-3">
                  <Badge>{product.collection}</Badge>
                  <Badge variant="outline">{product.category}</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="font-display text-5xl font-medium leading-[0.92] tracking-[-0.035em] sm:text-6xl">
                      {product.name}
                    </h1>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                      {product.description}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Card className="bg-muted/40 shadow-none">
                      <CardContent className="space-y-1 p-4">
                        <p className="font-medium text-foreground">{product.size}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Product size</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/40 shadow-none">
                      <CardContent className="space-y-1 p-4">
                        <p className="font-medium text-foreground">{product.skinGoal}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Primary skin goal</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/40 shadow-none">
                      <CardContent className="space-y-1 p-4">
                        <p className="font-medium text-foreground">{product.reviewCount} reviews</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{product.stars}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <p className="font-display text-4xl font-medium text-gold-500 sm:text-5xl">{formatCurrency(product.price)}</p>
                <p className="text-sm font-medium text-[#8f7767]">{available ? "In stock" : "Currently out of stock"}</p>

                <div className="space-y-3">
                  {product.highlights.map((highlight) => (
                    <div className="flex gap-3" key={highlight}>
                      <span className="mt-2 h-2 w-2 rounded-full bg-gold-400" />
                      <p className="text-sm leading-7 text-muted-foreground">{highlight}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <AddToCartButton className="w-full sm:w-auto" product={product} />
                  <Button asChild className="w-full sm:w-auto" variant="outline">
                    <Link href="/cart">View cart</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container grid gap-4 md:grid-cols-2">
          <Card className="bg-white/85">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-3xl">Key ingredients</h2>
              <Separator />
              <div className="space-y-3">
                {product.ingredients.map((ingredient) => (
                  <div className="flex gap-3" key={ingredient}>
                    <span className="mt-2 h-2 w-2 rounded-full bg-gold-400" />
                    <p className="text-sm leading-7 text-muted-foreground">{ingredient}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-3xl">How to use</h2>
              <Separator />
              <p className="text-sm leading-7 text-muted-foreground">{product.howToUse}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-3xl">Why it belongs in the routine</h2>
              <Separator />
              <p className="text-sm leading-7 text-muted-foreground">
                This product was placed into the site architecture as part of a broader ritual, which helps the shop feel
                more premium and increases cross-sell opportunities.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-3xl">Pairs beautifully with</h2>
              <Separator />
              <p className="text-sm leading-7 text-muted-foreground">
                Layer with products from the {product.collection} edit to keep the same finish, tone, and sensorial
                experience across the routine.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blush-100 via-background to-lavender-100 py-12 sm:py-14 lg:py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="bg-white/80 text-gold-500" variant="outline">
                You may also like
              </Badge>
              <h2 className="font-display text-4xl font-medium leading-[0.95] tracking-[-0.03em] sm:text-5xl">
                Continue the ritual
              </h2>
            </div>

            <Button asChild className="w-full sm:w-auto" variant="outline">
              <Link href="/shop">Back to shop</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
