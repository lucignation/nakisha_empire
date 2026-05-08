import Link from "next/link";
import { Heart } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductArt from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getEffectivePrice, isProductAvailable, isProductOnSale, type Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const available = isProductAvailable(product);
  const effectivePrice = getEffectivePrice(product);
  const onSale = isProductOnSale(product);

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[18px] border-[var(--brand-border)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="block">
          <ProductArt className="rounded-none rounded-t-[18px]" product={product} ratio="portrait" />
        </Link>

        <Badge className="absolute left-3 top-3 border-transparent bg-[var(--brand-400)] text-[var(--brand-ink)]" variant="default">
          {product.badge}
        </Badge>

        <button
          aria-label={`Save ${product.name}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--brand-accent-strong)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform hover:scale-105"
          type="button"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
        <div>
          <Link href={`/shop/${product.slug}`}>
            <h3 className="line-clamp-2 text-[0.92rem] font-semibold leading-6 text-foreground transition-colors hover:text-gold-500">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs font-normal text-[var(--brand-ink-soft)]">
            {product.brand} · {product.size}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[0.72rem] tracking-[1px] text-[var(--brand-accent-strong)]">{product.stars}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-5">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              {onSale ? (
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </p>
              ) : null}
              <div className="font-display text-[1.3rem] font-semibold leading-none text-foreground">
                {formatCurrency(effectivePrice)}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{available ? product.category : "Out of stock"}</span>
          </div>

          <AddToCartButton className="w-full justify-center" product={product} />
        </div>
      </CardContent>
    </Card>
  );
}
