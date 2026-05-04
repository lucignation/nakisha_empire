import Link from "next/link";
import PageHero from "@/components/page-hero";
import ProductCard from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductsBySlugs, routines } from "@/lib/data";

export const metadata = {
  title: "Routines"
};

export default function RoutinesPage() {
  return (
    <>
      <PageHero
        eyebrow="Skincare Routines"
        title={`Simple rituals with a <span class="italic text-gold-500">luxury finish</span>`}
        description="Rather than leaving the shopper to guess how products fit together, this page shows complete routines and the product pairings behind them."
        chips={["Morning reset", "Evening ritual", "Cross-sell ready", "Premium storytelling"]}
      />

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container grid gap-6">
          {routines.map((routine) => {
            const routineProducts = getProductsBySlugs(routine.featuredSlugs);

            return (
              <Card className="bg-white/85" key={routine.slug}>
                <CardContent className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
                  <div className="space-y-5">
                    <Badge className="bg-white/80 text-gold-500" variant="outline">
                      {routine.name}
                    </Badge>
                    <div className="space-y-3">
                      <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.03em] sm:text-5xl">{routine.name}</h2>
                      <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">{routine.description}</p>
                    </div>

                    <div className="grid gap-3">
                      {routine.steps.map((step, index) => (
                        <Card className="bg-muted/40 shadow-none" key={step.title}>
                          <CardContent className="flex gap-4 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                              {index + 1}
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-display text-3xl leading-none">{step.title}</h3>
                              <p className="text-sm leading-7 text-muted-foreground">{step.copy}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[28px] bg-lavender-100/60 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Shop the routine</p>
                        <h3 className="mt-2 font-display text-3xl leading-none">Recommended products</h3>
                      </div>
                      <Button asChild className="w-full sm:w-auto" variant="outline">
                        <Link href="/shop">Full shop</Link>
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {routineProducts.map((product) => (
                        <ProductCard key={product.slug} product={product} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container">
          <Card className="bg-white/85">
            <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)] lg:items-center">
              <div className="space-y-4">
                <Badge className="bg-white/80 text-gold-500" variant="outline">
                  Why this page matters
                </Badge>
                <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.03em] sm:text-5xl">
                  Good ecommerce doesn’t just show products. It shows order.
                </h2>
              </div>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                This route helps shoppers understand how to combine products, gives the brand a more expert voice, and
                opens the door to bundle sales later.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
