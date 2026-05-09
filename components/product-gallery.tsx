"use client";

import { useState } from "react";
import { getProductImages } from "@/lib/data";
import type { Product } from "@/lib/data";

export default function ProductGallery(props: { product: Product }) {
  const { product } = props;
  const images = getProductImages(product);
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[16px] bg-[var(--surface-soft)]">
        <img
          alt={product.name}
          className="h-full min-h-[18rem] w-full object-cover sm:min-h-[22rem] lg:min-h-[28rem]"
          src={activeImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image) => {
            const active = image === activeImage;

            return (
              <button
                className={`overflow-hidden rounded-[14px] border transition-all ${
                  active ? "border-[var(--brand-400)] shadow-[0_0_0_2px_rgba(184,146,74,0.18)]" : "border-[var(--brand-border)]"
                }`}
                key={image}
                onClick={() => setActiveImage(image)}
                type="button"
              >
                <img alt={`${product.name} gallery`} className="aspect-square h-full w-full object-cover" src={image} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
