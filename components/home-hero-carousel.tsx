"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductArt from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type Product } from "@/lib/data";
import { cn } from "@/lib/utils";

type SlideTone = "warm" | "rose" | "sage";

export interface HomeHeroSlide {
  id: string;
  badge: string;
  title: string;
  copy: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  highlights: string[];
  product: Product;
  secondaryProduct: Product;
  statValue: string;
  statLabel: string;
  supportTitle: string;
  supportCopy: string;
  tone: SlideTone;
}

interface HomeHeroCarouselProps {
  slides: HomeHeroSlide[];
}

const toneStyles: Record<
  SlideTone,
  {
    shell: string;
    accent: string;
    softPanel: string;
    dot: string;
  }
> = {
  warm: {
    shell: "bg-[radial-gradient(circle_at_top_left,#fbf7ff_0%,#f1e7fb_42%,#e8d8f8_100%)]",
    accent: "bg-[var(--brand-400)]",
    softPanel: "bg-white/78",
    dot: "bg-[var(--brand-ink)]"
  },
  rose: {
    shell: "bg-[radial-gradient(circle_at_top_left,#fff7fc_0%,#f8e5f3_42%,#f4d0ea_100%)]",
    accent: "bg-[var(--brand-300)]",
    softPanel: "bg-white/80",
    dot: "bg-[var(--brand-500)]"
  },
  sage: {
    shell: "bg-[radial-gradient(circle_at_top_left,#f7f3fe_0%,#ebddfa_38%,#dbc5f2_100%)]",
    accent: "bg-[var(--brand-500)]",
    softPanel: "bg-white/78",
    dot: "bg-[var(--brand-ink)]"
  }
};

export default function HomeHeroCarousel({ slides }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  function goToSlide(index: number) {
    setActiveIndex((index + slides.length) % slides.length);
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[var(--brand-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-600)] via-[var(--brand-400)] to-[var(--brand-300)]" />

      <div className="relative h-[40rem] sm:h-[42rem] lg:h-[29rem] xl:h-[31rem]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const tone = toneStyles[slide.tone];

          return (
            <div
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-out",
                isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              )}
              key={slide.id}
            >
              <div className={cn("absolute inset-0", tone.shell)} />
              <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-white/40 blur-3xl" />
              <div className="absolute bottom-6 right-12 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute inset-y-0 right-0 hidden w-[35%] border-l border-white/30 bg-white/10 lg:block" />

              <div className="relative z-10 grid h-full gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.92fr)] lg:gap-6 lg:p-6">
                <div className="flex flex-col justify-center">
                  <Badge className={cn("w-fit border-transparent text-white", tone.accent)} variant="default">
                    {slide.badge}
                  </Badge>

                  <h1 className="mt-4 max-w-[11ch] whitespace-pre-line font-display text-[clamp(2rem,5vw,3.35rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--brand-ink)]">
                    {slide.title}
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--brand-ink-soft)] sm:text-[0.95rem] sm:leading-7">
                    {slide.copy}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg">
                      <Link href={slide.primaryHref}>{slide.primaryLabel}</Link>
                    </Button>
                    <Button
                      asChild
                      className="border-[var(--brand-border)] bg-white/70 text-[var(--brand-ink)] hover:bg-white"
                      size="lg"
                      variant="outline"
                    >
                      <Link href={slide.secondaryHref}>{slide.secondaryLabel}</Link>
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {slide.highlights.map((item) => (
                      <span
                        className="rounded-full border border-white/60 bg-white/65 px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--brand-ink-soft)]"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Card className="border-white/60 bg-white/78 shadow-none">
                      <CardContent className="space-y-2 p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-ink-soft)]">
                          Store Signal
                        </p>
                        <p className="font-display text-[1.7rem] font-semibold leading-none text-[var(--brand-ink)]">
                          {slide.statValue}
                        </p>
                        <p className="text-sm leading-6 text-[var(--brand-ink-soft)]">{slide.statLabel}</p>
                      </CardContent>
                    </Card>

                    <div className={cn("rounded-[22px] border border-white/60 p-4", tone.softPanel)}>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-ink-soft)]">
                        Why This Slide Works
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-[var(--brand-ink)]">{slide.supportTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">{slide.supportCopy}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem]">
                  <Card className="overflow-hidden border-white/60 bg-white/86 shadow-[0_18px_36px_rgba(70,44,125,0.10)]">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand-ink-soft)]">
                            Featured Product
                          </p>
                          <h2 className="mt-2 text-lg font-semibold text-[var(--brand-ink)]">{slide.product.name}</h2>
                        </div>
                        <Badge className={cn("border-transparent text-white", tone.accent)} variant="default">
                          {slide.product.badge}
                        </Badge>
                      </div>

                      <ProductArt
                        className="min-h-[13rem] rounded-[20px] sm:min-h-[16rem] lg:min-h-[17rem]"
                        priority={isActive}
                        product={slide.product}
                      />

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-[var(--brand-ink-soft)]">{slide.product.brand}</p>
                          <p className="mt-1 font-display text-[1.45rem] font-semibold text-[var(--brand-ink)]">
                            {formatCurrency(slide.product.price)}
                          </p>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/shop/${slide.product.slug}`}>Shop Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="hidden gap-4 lg:grid">
                    <Card className="overflow-hidden border-white/60 bg-white/80 shadow-none">
                      <CardContent className="space-y-3 p-3">
                        <ProductArt className="min-h-[9rem] rounded-[18px]" product={slide.secondaryProduct} />
                        <div className="space-y-1 px-1 pb-1">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-ink-soft)]">
                            Also Trending
                          </p>
                          <h3 className="text-sm font-semibold text-[var(--brand-ink)]">{slide.secondaryProduct.name}</h3>
                          <p className="text-xs text-[var(--brand-ink-soft)]">
                            {formatCurrency(slide.secondaryProduct.price)} · {slide.secondaryProduct.category}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className={cn("rounded-[20px] border border-white/60 p-4", tone.softPanel)}>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-ink-soft)]">
                        Shopping Perk
                      </p>
                      <p className="mt-2 font-display text-[1.55rem] font-semibold leading-none text-[var(--brand-ink)]">
                        Free Delivery
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--brand-ink-soft)]">
                        Orders over ₦50,000 unlock delivery automatically during checkout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "h-2.5 rounded-full transition-all",
              index === activeIndex ? "w-10 bg-[var(--brand-500)]" : "w-2.5 bg-[var(--brand-200)]"
            )}
            key={slide.id}
            onClick={() => goToSlide(index)}
            type="button"
          />
        ))}
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          aria-label="Previous slide"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-border)] bg-white/84 text-[var(--brand-ink)] backdrop-blur-sm transition-colors hover:bg-white"
          onClick={() => goToSlide(activeIndex - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Next slide"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-border)] bg-white/84 text-[var(--brand-ink)] backdrop-blur-sm transition-colors hover:bg-white"
          onClick={() => goToSlide(activeIndex + 1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
