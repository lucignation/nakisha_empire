"use client";

import { useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data";

interface AddToCartButtonProps {
  product: Product;
  compact?: boolean;
  className?: string;
}

export default function AddToCartButton({ product, compact = false, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product);
    setAdded(true);
    toast.success(`${product.name} added to cart`, {
      description: "Your ritual has been updated successfully."
    });
    window.setTimeout(() => setAdded(false), 1600);
  }

  if (compact) {
    return (
      <Button className={className} onClick={handleClick} size="icon" type="button">
        <Plus className="h-4 w-4" />
        <span className="sr-only">Add {product.name} to cart</span>
      </Button>
    );
  }

  return (
    <Button className={className} onClick={handleClick} type="button">
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {added ? "Added" : "Add to cart"}
    </Button>
  );
}
