import Link from "next/link";
import { Heart } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductArt from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, isProductAvailable, type Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const available = isProductAvailable(product);

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[22px] border-[#eadfce] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(92,61,46,0.12)]">
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="block">
          <ProductArt className="rounded-none rounded-t-[22px]" product={product} ratio="portrait" />
        </Link>

        <Badge className="absolute left-3 top-3 border-transparent bg-primary text-white" variant="default">
          {product.badge}
        </Badge>

        <button
          aria-label={`Save ${product.name}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gold-500 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform hover:scale-105"
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
          <p className="mt-1 text-xs font-normal text-[#9c7f6e]">
            {product.brand} · {product.size}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[0.72rem] tracking-[1px] text-gold-500">{product.stars}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-5">
          <div className="flex items-end justify-between gap-3">
            <div className="font-display text-[1.45rem] font-semibold leading-none text-foreground">
              {formatCurrency(product.price)}
            </div>
            <span className="text-xs text-muted-foreground">{available ? product.category : "Out of stock"}</span>
          </div>

          <AddToCartButton className="w-full justify-center" product={product} />
        </div>
      </CardContent>
    </Card>
  );
}
