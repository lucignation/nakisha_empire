"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import ProductArt from "@/components/product-art";
import ProductCard from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, type Product } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ShopCatalogueProps {
  products: Product[];
}

export default function ShopCatalogue({ products }: ShopCatalogueProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const minimumPrice = Math.min(...products.map((product) => product.price));
  const maximumPrice = Math.max(...products.map((product) => product.price));

  const visibleProducts = products.filter((product) => {
    const matchesQuery =
      query.trim().length === 0 ||
      `${product.name} ${product.category} ${product.collection} ${product.skinGoal}`
        .toLowerCase()
        .includes(query.toLowerCase());

    const matchesCategory = activeCategory === "All" || product.category === activeCategory;

    return matchesQuery && matchesCategory;
  });

  return (
    <section className="py-12 sm:py-14 lg:py-16">
      <div className="container grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-[124px] xl:self-start">
          <Card className="border-[#dfd0c3] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,239,231,0.86))]">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Price range</p>
                <div className="space-y-2">
                  <div className="relative h-2 rounded-full bg-[#e7ddd3]">
                    <div className="absolute left-0 right-0 top-0 h-2 rounded-full bg-[#8d6a4a]" />
                    <span className="absolute -top-2 left-0 h-6 w-6 rounded-full border-4 border-white bg-[#8d6a4a] shadow-sm" />
                    <span className="absolute -top-2 right-0 h-6 w-6 rounded-full border-4 border-white bg-[#8d6a4a] shadow-sm" />
                  </div>
                  <p className="text-sm text-[#6a5d53]">
                    {formatCurrency(minimumPrice)} — {formatCurrency(maximumPrice)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Shop by category</p>
                <div className="grid gap-2">
                  {categories.map((category) => (
                    <button
                      className={cn(
                        "rounded-[18px] border px-4 py-3 text-left text-sm transition-colors",
                        activeCategory === category
                          ? "border-[#8d6a4a] bg-[#f1e6da] text-[#2b221d]"
                          : "border-[#e5d9ce] bg-white/55 text-[#6a5d53] hover:border-[#c8af97] hover:bg-[#f5ede5]"
                      )}
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      type="button"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 bg-[#271f1a] text-white shadow-none">
            <CardContent className="space-y-5 p-5">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-3">
                <ProductArt className="min-h-[15rem] rounded-[24px] border border-white/10 shadow-none" product={products[0]} />
              </div>
              <div className="space-y-3">
                <p className="text-[0.68rem] uppercase tracking-[0.32em] text-white/45">New arrivals</p>
                <h3 className="font-display text-4xl leading-none text-white">Shop the signature shelf.</h3>
                <p className="text-sm leading-7 text-white/68">
                  Explore the pieces that define the Nakisha Empire mood: radiant skin, polished finish, and zero
                  clutter.
                </p>
              </div>
              <Button asChild className="w-full" variant="soft">
                <Link href="/routines">View routines</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-5">
          <Card className="border-[#dfd0c3] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(246,239,231,0.84))]">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="border-[#dbcfc3] bg-white/78 pl-11"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search products, rituals, collections..."
                    value={query}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/80 text-foreground" variant="outline">
                    {visibleProducts.length} products
                  </Badge>
                  <Badge className="bg-white/80 text-foreground" variant="outline">
                    Responsive catalogue
                  </Badge>
                  <Badge className="bg-white/80 text-foreground" variant="outline">
                    Ritual-first shopping
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    title: "Glow Ritual",
                    copy: "Brightness, polish, and a more even, camera-ready finish."
                  },
                  {
                    title: "Soft Reset",
                    copy: "Comfort-led essentials for calmer skin and better layering."
                  },
                  {
                    title: "Daily Defense",
                    copy: "Hydration and protection that fit naturally into real routines."
                  }
                ].map((item) => (
                  <div
                    className="rounded-[24px] border border-[#e3d8cd] bg-white/62 p-4 shadow-[0_12px_24px_rgba(79,54,37,0.04)]"
                    key={item.title}
                  >
                    <h3 className="font-display text-[1.9rem] leading-none text-[#2b221d]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#6a5d53]">{item.copy}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <div className="animate-fade-slide" key={product.slug}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {visibleProducts.length === 0 ? (
            <Card className="border-[#dfd0c3] bg-white/84">
              <CardContent className="space-y-3 p-8 text-center">
                <h3 className="font-display text-4xl leading-none text-[#2b221d]">Nothing matched that edit.</h3>
                <p className="text-sm leading-7 text-[#6a5d53]">
                  Try a broader search or switch back to another category to see the full assortment again.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}
