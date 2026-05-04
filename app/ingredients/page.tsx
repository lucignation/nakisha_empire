import Link from "next/link";
import PageHero from "@/components/page-hero";
import SectionHeading from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ingredientHighlights, products } from "@/lib/data";

export const metadata = {
  title: "Ingredients"
};

export default function IngredientsPage() {
  return (
    <>
      <PageHero
        eyebrow="Ingredient Library"
        title={`Education wrapped in a <span class="italic text-gold-500">soft luxury</span> look`}
        description="An ingredient page makes the brand feel more complete and gives shoppers a place to build trust before they buy."
        chips={["Rose water", "Niacinamide", "Aloe vera", "Ceramide care"]}
      />

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container">
          <SectionHeading
            eyebrow="What We Use"
            title={`Hero ingredients with a <span class="italic text-gold-500">clear role</span>`}
            description="Each ingredient card explains not just what is in the formula, but why it belongs in the routine."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ingredientHighlights.map((ingredient) => (
              <Card className="bg-white/85" key={ingredient.name}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl">{ingredient.icon}</div>
                  <div className="space-y-2">
                    <h3 className="font-display text-3xl leading-none">{ingredient.name}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{ingredient.copy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container">
          <Card className="bg-white/85">
            <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                <Badge className="bg-white/80 text-gold-500" variant="outline">
                  Formulation Philosophy
                </Badge>
                <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.03em] sm:text-5xl">
                  Comfort first. Results in rhythm.
                </h2>
              </div>

              <div className="grid gap-4">
                {[
                  ["Barrier-aware", "Textures are designed to support everyday use rather than forcing aggressive routines."],
                  ["Layer-friendly", "Each product is easy to combine, helping the customer build confidence step by step."],
                  ["Sensory luxury", "Finish, glide, and softness are treated as part of the product experience, not extras."]
                ].map(([title, copy]) => (
                  <Card className="bg-muted/40 shadow-none" key={title}>
                    <CardContent className="space-y-2 p-5">
                      <h3 className="font-display text-3xl leading-none">{title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">{copy}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blush-100 via-background to-lavender-100 py-12 sm:py-14 lg:py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              className="mb-0"
              eyebrow="Products Using These Ingredients"
              title={`See the formulas in the <span class="italic text-gold-500">shop</span>`}
              description="Education converts better when it sits close to products, so this route also pushes people back into the buying journey."
            />
            <Button asChild className="w-full sm:w-auto" variant="secondary">
              <Link href="/shop">Shop now</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <Card className="bg-white/85" key={product.slug}>
                <CardContent className="space-y-4 p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {product.category} · {product.size}
                  </p>
                  <div className="space-y-2">
                    <h3 className="font-display text-3xl leading-none">{product.name}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{product.description}</p>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/shop/${product.slug}`}>View details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
