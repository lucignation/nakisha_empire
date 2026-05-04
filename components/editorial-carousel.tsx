"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductArt from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type Product } from "@/lib/data";
import { cn } from "@/lib/utils";

interface EditorialCarouselMetric {
  label: string;
  value: string;
}

interface EditorialCarouselDetail {
  title: string;
  copy: string;
}

interface EditorialCarouselSlide {
  id: string;
  award: string;
  label: string;
  kicker: string;
  title: string;
  copy: string;
  cta: {
    href: string;
    label: string;
  };
  secondaryCta: {
    href: string;
    label: string;
  };
  metrics: EditorialCarouselMetric[];
  details: EditorialCarouselDetail[];
  primaryProduct: Product;
  secondaryProducts: Product[];
}

interface EditorialCarouselProps {
  slides: EditorialCarouselSlide[];
}

export default function EditorialCarousel({ slides }: EditorialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  function goToSlide(index: number) {
    setActiveIndex((index + slides.length) % slides.length);
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] xl:gap-10">
      <div
        className="relative overflow-hidden rounded-[38px] border border-[#d7c8b8] bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(245,236,228,0.94))] p-4 shadow-[0_30px_80px_rgba(82,58,39,0.12)] animate-fade-slide sm:p-6"
        key={`${activeSlide.id}-visual`}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/35 to-transparent" />
        <Badge className="absolute left-4 top-4 z-10 bg-white/82 text-foreground sm:left-6 sm:top-6" variant="outline">
          {activeSlide.award}
        </Badge>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="space-y-4">
            <div className="rounded-[32px] border border-white/50 bg-white/30 p-3">
              <ProductArt
                className="min-h-[20rem] rounded-[28px] border border-white/50 shadow-none sm:min-h-[25rem]"
                large
                product={activeSlide.primaryProduct}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {activeSlide.metrics.map((metric) => (
                <Card className="border-[#e5d8cb] bg-white/68 shadow-none" key={metric.label}>
                  <CardContent className="space-y-2 p-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">{metric.label}</p>
                    <p className="font-display text-3xl leading-none text-[#2b221d]">{metric.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {activeSlide.secondaryProducts.map((product) => (
              <Card
                className="overflow-hidden border-[#e2d5c8] bg-white/72 shadow-[0_14px_32px_rgba(82,58,39,0.08)]"
                key={product.slug}
              >
                <CardContent className="space-y-3 p-3">
                  <ProductArt className="min-h-[9rem] rounded-[24px] shadow-none" product={product} />
                  <div className="space-y-2 px-1 pb-1">
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">{product.category}</p>
                    <h3 className="font-display text-[1.8rem] leading-none text-[#2b221d]">{product.name}</h3>
                    <p className="text-sm leading-6 text-[#6f6258]">{formatCurrency(product.price)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex h-full flex-col justify-between rounded-[38px] border border-[#d7c8b8] bg-[#f3eae0] p-6 shadow-[0_22px_52px_rgba(82,58,39,0.09)] animate-fade-slide sm:p-8 lg:p-10"
        key={`${activeSlide.id}-copy`}
      >
        <div className="space-y-6">
          <Badge className="w-fit bg-white/75 text-foreground" variant="outline">
            {activeSlide.label}
          </Badge>

          <div className="space-y-4">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-muted-foreground">{activeSlide.kicker}</p>
            <h1 className="font-display text-5xl font-medium leading-[0.92] tracking-[-0.05em] text-[#2b221d] sm:text-6xl lg:text-7xl">
              {activeSlide.title}
            </h1>
            <p className="max-w-xl text-sm leading-8 text-[#645850] sm:text-base">{activeSlide.copy}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto" size="lg">
              <Link href={activeSlide.cta.href}>{activeSlide.cta.label}</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto border-[#baa28b] bg-white/40" size="lg" variant="outline">
              <Link href={activeSlide.secondaryCta.href}>{activeSlide.secondaryCta.label}</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {activeSlide.details.map((detail) => (
              <div
                className="rounded-[24px] border border-[#e0d2c4] bg-white/55 px-4 py-4 shadow-[0_12px_26px_rgba(82,58,39,0.05)]"
                key={detail.title}
              >
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">{detail.title}</p>
                <p className="mt-2 text-sm leading-7 text-[#66594f]">{detail.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[#ddcfc2] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === activeIndex ? "w-10 bg-[#2b221d]" : "w-2.5 bg-[#c3b09d]"
                )}
                key={slide.id}
                onClick={() => goToSlide(index)}
                type="button"
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={() => goToSlide(activeIndex - 1)} size="icon" type="button" variant="outline">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Previous slide</span>
            </Button>
            <Button onClick={() => goToSlide(activeIndex + 1)} size="icon" type="button" variant="outline">
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
