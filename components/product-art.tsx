import { cn } from "@/lib/utils";
import type { Product } from "@/lib/data";

type ProductArtRatio = "auto" | "portrait" | "square";

interface ProductArtProps {
  product: Product;
  large?: boolean;
  className?: string;
  priority?: boolean;
  ratio?: ProductArtRatio;
}

const ratioStyles: Record<ProductArtRatio, string> = {
  auto: "",
  portrait: "aspect-[4/5]",
  square: "aspect-square"
};

export default function ProductArt({
  product,
  large = false,
  className,
  priority = false,
  ratio = "auto"
}: ProductArtProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] bg-[var(--surface-soft)]",
        ratio === "auto" && (large ? "min-h-[18rem] sm:min-h-[22rem] lg:min-h-[28rem]" : "min-h-[15rem]"),
        ratioStyles[ratio],
        className
      )}
    >
      <img
        alt={product.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        loading={priority ? "eager" : "lazy"}
        src={product.image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/18 to-transparent" />
    </div>
  );
}
