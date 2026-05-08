"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getEffectivePrice, type Product } from "@/lib/data";

interface MarketplaceHomeCatalogProps {
  products: Product[];
}

export default function MarketplaceHomeCatalog({ products }: MarketplaceHomeCatalogProps) {
  const itemsPerPage = 4;
  const categories = [...new Set(products.map((product) => product.category))];
  const brands = [...new Set(products.map((product) => product.brand))];
  const minimumPrice = Math.min(...products.map((product) => getEffectivePrice(product)));
  const absoluteMaximumPrice = Math.max(...products.map((product) => getEffectivePrice(product)));

  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maximumPrice, setMaximumPrice] = useState(absoluteMaximumPrice);
  const [currentPage, setCurrentPage] = useState(1);

  function toggleValue(list: string[], value: string, setter: Dispatch<SetStateAction<string[]>>) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function resetFilters() {
    setQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaximumPrice(absoluteMaximumPrice);
    setCurrentPage(1);
  }

  const visibleProducts = products.filter((product) => {
    const matchesQuery =
      query.trim().length === 0 ||
      `${product.name} ${product.category} ${product.brand} ${product.collection}`
        .toLowerCase()
        .includes(query.toLowerCase());

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const matchesPrice = getEffectivePrice(product) <= maximumPrice;

    return matchesQuery && matchesCategory && matchesBrand && matchesPrice;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [maximumPrice, query, selectedBrands, selectedCategories]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = visibleProducts.slice(pageStart, pageStart + itemsPerPage);

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="space-y-4">
        <Card className="border-[var(--brand-border)] bg-white">
          <CardContent className="space-y-6 p-5">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">Filters</h3>
                <Button onClick={resetFilters} size="sm" type="button" variant="ghost">
                  Reset
                </Button>
              </div>

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-ink-soft)]" />
                <Input
                  className="h-10 border-[var(--brand-border)] bg-[var(--brand-50)] pl-10"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search items..."
                  type="search"
                  value={query}
                />
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Price Range</h4>
                <span className="text-xs text-[var(--brand-ink-soft)]">Up to ₦{maximumPrice.toLocaleString()}</span>
              </div>
              <input
                className="w-full accent-[var(--brand-400)]"
                max={absoluteMaximumPrice}
                min={minimumPrice}
                onChange={(event) => setMaximumPrice(Number(event.target.value))}
                type="range"
                value={maximumPrice}
              />
              <div className="flex items-center justify-between text-xs text-[var(--brand-ink-soft)]">
                <span>₦{minimumPrice.toLocaleString()}</span>
                <span>₦{absoluteMaximumPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label className="flex items-center gap-3 text-sm text-[var(--brand-ink)]" key={category}>
                    <input
                      checked={selectedCategories.includes(category)}
                      className="h-4 w-4 rounded border-[var(--brand-border)] accent-[var(--brand-400)]"
                      onChange={() => toggleValue(selectedCategories, category, setSelectedCategories)}
                      type="checkbox"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Brands</h4>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label className="flex items-center gap-3 text-sm text-[var(--brand-ink)]" key={brand}>
                    <input
                      checked={selectedBrands.includes(brand)}
                      className="h-4 w-4 rounded border-[var(--brand-border)] accent-[var(--brand-400)]"
                      onChange={() => toggleValue(selectedBrands, brand, setSelectedBrands)}
                      type="checkbox"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Shop Products</h3>
            <p className="text-sm text-[var(--brand-ink-soft)]">
              Showing {visibleProducts.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + itemsPerPage, visibleProducts.length)} of{" "}
              {visibleProducts.length} products
            </p>
          </div>
          <div className="rounded-[4px] bg-[var(--brand-100)] px-4 py-2 text-sm text-[var(--brand-ink)]">Fast checkout and nationwide delivery</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {visibleProducts.length > 0 && totalPages > 1 ? (
          <div className="flex flex-col gap-3 rounded-[18px] border border-[var(--brand-border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--brand-ink-soft)]">
              Page {safeCurrentPage} of {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                size="sm"
                type="button"
                variant="outline"
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Button
                  className="min-w-10"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  size="sm"
                  type="button"
                  variant={page === safeCurrentPage ? "default" : "outline"}
                >
                  {page}
                </Button>
              ))}

              <Button
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                size="sm"
                type="button"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}

        {visibleProducts.length === 0 ? (
          <Card className="border-[var(--brand-border)] bg-white">
            <CardContent className="p-8 text-center">
              <h4 className="text-lg font-semibold text-foreground">No products match your filters.</h4>
              <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">Reset the filters or try a different search term.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
