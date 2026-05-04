import PageHero from "@/components/page-hero";
import SectionHeading from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { brandValues } from "@/lib/data";

export const metadata = {
  title: "About"
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Nakisha Empire"
        title={`A modern skincare brand shaped by <span class="italic text-gold-500">soft power</span>`}
        description="This page gives the storefront a stronger point of view, which helps the brand feel intentional and premium instead of looking like a single isolated landing page."
        chips={["Luxury tone", "Brand values", "Founder story ready", "Trust-building content"]}
      />

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container grid gap-4 lg:grid-cols-2">
          <Card className="bg-white/85">
            <CardContent className="p-6 sm:p-8">
              <SectionHeading
                className="mb-0"
                eyebrow="Our Story"
                title={`Skincare that feels polished, warm, and <span class="italic text-gold-500">grounded</span>`}
                description="Nakisha Empire was imagined as a beauty destination where the routine feels as considered as the result. Soft textures, clean visuals, and confidence-led rituals are the thread through every page."
              />
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardContent className="grid gap-4 p-6 sm:p-8">
              {[
                ["Founded for ritual", "Every product and page is positioned around how people actually care for their skin day to day."],
                ["Built for expansion", "The app structure now supports product growth, bundles, checkout, content, and future integrations."],
                ["Rooted in glow", "The brand language stays feminine, elegant, and premium without losing clarity or usefulness."]
              ].map(([title, copy]) => (
                <Card className="bg-muted/40 shadow-none" key={title}>
                  <CardContent className="space-y-2 p-5">
                    <h3 className="font-display text-3xl leading-none">{title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{copy}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container">
          <SectionHeading
            center
            eyebrow="Brand Values"
            title={`What shapes the <span class="italic text-gold-500">experience</span>`}
            description="These value cards help the About page carry more than aesthetics. They tell visitors how the brand thinks."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {brandValues.map((value) => (
              <Card className="bg-white/85" key={value.title}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl">{value.icon}</div>
                  <div className="space-y-2">
                    <h3 className="font-display text-3xl leading-none">{value.title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{value.copy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blush-100 via-background to-lavender-100 py-12 sm:py-14 lg:py-16">
        <div className="container">
          <Card className="bg-white/85">
            <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)] lg:items-center">
              <div className="space-y-4">
                <Badge className="bg-white/80 text-gold-500" variant="outline">
                  Founder Note
                </Badge>
                <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.03em] sm:text-5xl">
                  “Glow should feel intentional, not overwhelming.”
                </h2>
              </div>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                This multi-page build is positioned to support storytelling, education, product discovery, and conversion
                all within one consistent Next.js experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
