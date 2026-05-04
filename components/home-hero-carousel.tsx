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
    shell: "bg-[radial-gradient(circle_at_top_left,#fff8ef_0%,#f7eee4_40%,#efdfd0_100%)]",
    accent: "bg-[#b8924a]",
    softPanel: "bg-white/72",
    dot: "bg-[#6d513c]"
  },
  rose: {
    shell: "bg-[radial-gradient(circle_at_top_left,#fff7f4_0%,#f7ebe6_40%,#f1ddd6_100%)]",
    accent: "bg-[#b9816d]",
    softPanel: "bg-white/76",
    dot: "bg-[#775648]"
  },
  sage: {
    shell: "bg-[radial-gradient(circle_at_top_left,#f9fbf6_0%,#edf2e7_38%,#dde8d8_100%)]",
    accent: "bg-[#8ea06f]",
    softPanel: "bg-white/74",
    dot: "bg-[#4f6546]"
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
    <div className="relative overflow-hidden rounded-[28px] border border-[#eadfce] bg-white shadow-[0_22px_60px_rgba(77,55,38,0.08)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#b8924a] via-[#ead7ad] to-[#b8924a]" />

      <div className="relative h-[56rem] sm:h-[60rem] lg:h-[38rem] xl:h-[40rem]">
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
              <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-white/45 blur-3xl" />
              <div className="absolute bottom-6 right-12 h-48 w-48 rounded-full bg-white/35 blur-3xl" />
              <div className="absolute inset-y-0 right-0 hidden w-[34%] border-l border-white/30 bg-white/10 lg:block" />

              <div className="relative z-10 grid h-full gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.98fr)] lg:gap-8 lg:p-8">
                <div className="flex flex-col justify-center">
                  <Badge className={cn("w-fit border-transparent text-white", tone.accent)} variant="default">
                    {slide.badge}
                  </Badge>

                  <h1 className="mt-5 max-w-[10ch] whitespace-pre-line font-display text-[clamp(2.8rem,7vw,5.4rem)] leading-[0.92] tracking-[-0.05em] text-foreground">
                    {slide.title}
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#6b4f3a] sm:text-base sm:leading-8">
                    {slide.copy}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg">
                      <Link href={slide.primaryHref}>{slide.primaryLabel}</Link>
                    </Button>
                    <Button asChild className="border-[#7a614f] text-[#4c372c] hover:bg-white" size="lg" variant="outline">
                      <Link href={slide.secondaryHref}>{slide.secondaryLabel}</Link>
                    </Button>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {slide.highlights.map((item) => (
                      <span
                        className="rounded-full border border-white/60 bg-white/55 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#6d5647]"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Card className="border-white/60 bg-white/78 shadow-none">
                      <CardContent className="space-y-2 p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">
                          Store Signal
                        </p>
                        <p className="font-display text-[2rem] leading-none text-foreground">{slide.statValue}</p>
                        <p className="text-sm leading-6 text-[#6b4f3a]">{slide.statLabel}</p>
                      </CardContent>
                    </Card>

                    <div className={cn("rounded-[22px] border border-white/60 p-4", tone.softPanel)}>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">
                        Why This Slide Works
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-foreground">{slide.supportTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-[#6b4f3a]">{slide.supportCopy}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
                  <Card className="overflow-hidden border-white/60 bg-white/86 shadow-[0_18px_50px_rgba(77,55,38,0.12)]">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#9c7f6e]">
                            Featured Product
                          </p>
                          <h2 className="mt-2 text-lg font-semibold text-foreground">{slide.product.name}</h2>
                        </div>
                        <Badge className={cn("border-transparent text-white", tone.accent)} variant="default">
                          {slide.product.badge}
                        </Badge>
                      </div>

                      <ProductArt
                        className="min-h-[16rem] rounded-[20px] sm:min-h-[20rem] lg:min-h-[22rem]"
                        priority={isActive}
                        product={slide.product}
                      />

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#8f7767]">{slide.product.brand}</p>
                          <p className="mt-1 font-display text-[1.65rem] font-semibold text-foreground">
                            {formatCurrency(slide.product.price)}
                          </p>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/shop/${slide.product.slug}`}>Shop Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <Card className="overflow-hidden border-white/60 bg-white/80 shadow-none">
                      <CardContent className="space-y-3 p-3">
                        <ProductArt className="min-h-[9rem] rounded-[18px]" product={slide.secondaryProduct} />
                        <div className="space-y-1 px-1 pb-1">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">
                            Also Trending
                          </p>
                          <h3 className="text-sm font-semibold text-foreground">{slide.secondaryProduct.name}</h3>
                          <p className="text-xs text-[#8f7767]">
                            {formatCurrency(slide.secondaryProduct.price)} · {slide.secondaryProduct.category}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className={cn("rounded-[20px] border border-white/60 p-4", tone.softPanel)}>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">
                        Shopping Perk
                      </p>
                      <p className="mt-2 font-display text-[1.85rem] leading-none text-foreground">Free Delivery</p>
                      <p className="mt-2 text-sm leading-6 text-[#6b4f3a]">
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
              index === activeIndex ? "w-10 bg-[#4c372c]" : "w-2.5 bg-[#bca892]"
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
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#cdbba7] bg-white/84 text-[#4c372c] backdrop-blur-sm transition-colors hover:bg-white"
          onClick={() => goToSlide(activeIndex - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Next slide"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#cdbba7] bg-white/84 text-[#4c372c] backdrop-blur-sm transition-colors hover:bg-white"
          onClick={() => goToSlide(activeIndex + 1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
