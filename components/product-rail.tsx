import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/data";

interface ProductRailProps {
  products: Product[];
}

export default function ProductRail({ products }: ProductRailProps) {
  const loopedProducts = [...products, ...products];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />

      <div className="flex w-max gap-4 py-2 motion-safe:animate-product-rail motion-safe:hover:[animation-play-state:paused]">
        {loopedProducts.map((product, index) => (
          <div className="w-[17rem] shrink-0 sm:w-[18rem] xl:w-[19rem]" key={`${product.slug}-${index}`}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
