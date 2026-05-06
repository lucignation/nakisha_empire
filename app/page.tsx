import Link from "next/link";
import HomeHeroCarousel, { type HomeHeroSlide } from "@/components/home-hero-carousel";
import LogoMarquee from "@/components/logo-marquee";
import NewsletterSignup from "@/components/newsletter-signup";
import ProductCard from "@/components/product-card";
import ProductArt from "@/components/product-art";
import ProductRail from "@/components/product-rail";
import Reveal from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type Product } from "@/lib/data";
import { getFeaturedStorefrontProducts, getStorefrontProducts } from "@/lib/server/products";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

interface SpotlightCard {
  eyebrow: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
  product: Product;
  tags: string[];
  surface: string;
  supportingProducts?: Product[];
}

function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-8 text-center sm:mb-10">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-500">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">{title}</h2>
      {subtitle ? <p className="mx-auto mt-3 max-w-2xl text-sm text-[#8f7767] sm:text-base">{subtitle}</p> : null}
      <div className="mx-auto mt-4 h-px w-12 bg-gold-500" />
    </div>
  );
}

export default async function HomePage() {
  const products = await getStorefrontProducts();
  const featuredProducts = getFeaturedStorefrontProducts(products);
  const pickProduct = (index: number) => products[index % products.length];
  const categories = [...new Set(products.map((product) => product.category))]
    .map((category) => ({
      category,
      product: products.find((item) => item.category === category),
      count: products.filter((item) => item.category === category).length
    }))
    .filter((entry): entry is { category: string; product: Product; count: number } => Boolean(entry.product))
    .slice(0, 6);

  const heroSlides: HomeHeroSlide[] = [
    {
      id: "hero-sale",
      badge: "Limited Offer",
      title: "Glow Skincare Deals\nUp to 20% Off",
      copy:
        "Stock your shelf with fast-moving serums, moisturizers, cleansers, and SPF while the offer is still live. Built for cleaner browsing and quicker checkout.",
      primaryLabel: "Shop Offers",
      primaryHref: "/shop",
      secondaryLabel: "Browse Categories",
      secondaryHref: "/#categories",
      highlights: ["Bestsellers restocked", "Quick add to cart", "Nationwide delivery"],
      product: pickProduct(0),
      secondaryProduct: pickProduct(3),
      statValue: "4.9 / 5",
      statLabel: "average rating across the most-loved shelf",
      supportTitle: "Faster shopping flow",
      supportCopy: "The homepage now pushes discovery first while the full catalogue stays inside the Shop page.",
      tone: "warm"
    },
    {
      id: "hero-fresh",
      badge: "Fresh Drops",
      title: "Calm, Hydrate,\nand Reset Your Routine",
      copy:
        "Explore new arrivals and barrier-friendly essentials grouped around routines that are easier to shop and easier to keep using every day.",
      primaryLabel: "See New Arrivals",
      primaryHref: "/#new-arrivals",
      secondaryLabel: "Explore Brands",
      secondaryHref: "/#brands",
      highlights: ["Routine-led discovery", "Rich product content", "Cleaner hero design"],
      product: pickProduct(1),
      secondaryProduct: pickProduct(2),
      statValue: "₦50,000+",
      statLabel: "orders unlock free delivery automatically",
      supportTitle: "Homepage without the catalogue overload",
      supportCopy: "The heavy product listing has been removed here so the landing page feels more polished and intentional.",
      tone: "rose"
    },
    {
      id: "hero-defense",
      badge: "Daily Defense",
      title: "Protection, Glow,\nand Everyday Comfort",
      copy:
        "Build a daytime shelf around invisible SPF, lightweight hydration, and formulas that sit beautifully on melanin-rich skin.",
      primaryLabel: "Shop Daily Shelf",
      primaryHref: "/shop",
      secondaryLabel: "View Best Sellers",
      secondaryHref: "/#best-sellers",
      highlights: ["No white cast picks", "Soft finish textures", "Responsive shopping layout"],
      product: pickProduct(5),
      secondaryProduct: pickProduct(4),
      statValue: "3 Core Steps",
      statLabel: "cleanse, treat, and protect without clutter",
      supportTitle: "Better section balance",
      supportCopy: "The hero now carries real product imagery without the awkward empty product panel from before.",
      tone: "sage"
    }
  ];

  const spotlightCards: SpotlightCard[] = [
    {
      eyebrow: "Brighten + Even Tone",
      title: "Golden Glow Ritual",
      copy:
        "Start with radiance-first treatment, build in softness, and keep the finish polished from morning through night.",
      href: "/shop/golden-rose-serum",
      cta: "Shop Brightening Edit",
      product: pickProduct(0),
      tags: ["Dark spots", "Daily glow", "Serum-led routine"],
      surface: "bg-[#f6e8de]",
      supportingProducts: [pickProduct(1), pickProduct(2)]
    },
    {
      eyebrow: "Calm + Reset",
      title: "Soft Reset Shelf",
      copy: "Low-stress cleansers and calming layers for shoppers focused on comfort, balance, and better barrier support.",
      href: "/shop/aloe-clarity-cleanser",
      cta: "Build Calm Routine",
      product: pickProduct(3),
      tags: ["Sensitive skin", "Barrier care", "Everyday cleanse"],
      surface: "bg-[#eef4ee]"
    },
    {
      eyebrow: "Protect + Finish",
      title: "Daily Defense Edit",
      copy: "Hydration and SPF picks designed to sit cleanly under makeup or on bare skin without a heavy finish.",
      href: "/shop/dew-shield-spf-50",
      cta: "Shop Daily Defense",
      product: pickProduct(5),
      tags: ["No white cast", "SPF 50", "Daytime shelf"],
      surface: "bg-[#f5eee5]"
    }
  ];

  const featuredSpotlight = spotlightCards[0];
  const supportingProducts = featuredSpotlight.supportingProducts ?? [];
  const secondarySpotlights = spotlightCards.slice(1);
  const newArrivals = products.slice(1, 5);

  return (
    <>
      <section className="border-b border-[#eadfce] bg-[#faf6f1] py-6 sm:py-8">
        <div className="container">
          <Reveal>
            <HomeHeroCarousel slides={heroSlides} />
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10" id="brands">
        <div className="container">
          <Reveal>
            <LogoMarquee />
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14" id="categories">
        <div className="container">
          <Reveal>
            <SectionHeader
              eyebrow="Browse Collection"
              subtitle="Jump into the skincare categories shoppers reach for most, with clearer visual grouping and faster entry points."
              title="Shop by Category"
            />
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {categories.map(({ category, product, count }, index) => (
              <Reveal delay={index * 70} key={category}>
                <Link href="/shop">
                  <Card className="overflow-hidden border-[#eadfce] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(92,61,46,0.12)]">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img alt={category} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]" src={product.image} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <h3 className="text-base font-semibold">{category}</h3>
                        <p className="mt-1 text-xs text-white/75">{count} products</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#faf6f1] py-12 sm:py-16">
        <div className="container">
          <Reveal>
            <SectionHeader
              eyebrow="Curated Shelves"
              subtitle="Start with beautifully grouped shelves instead of a homepage product listing. The full catalogue now lives in Shop where it belongs."
              title="Shop by Skin Goal"
            />
          </Reveal>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <Reveal>
              <Card className={featuredSpotlight.surface + " overflow-hidden border-[#eadfce]"}>
                <div className="grid h-full gap-0 md:grid-cols-[minmax(0,1fr)_20rem]">
                  <CardContent className="flex flex-col justify-between p-6 sm:p-8">
                    <div className="space-y-5">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-500">
                        {featuredSpotlight.eyebrow}
                      </p>
                      <div>
                        <h3 className="font-display text-4xl font-medium leading-[0.95] tracking-[-0.04em] text-foreground sm:text-5xl">
                          {featuredSpotlight.title}
                        </h3>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b4f3a] sm:text-base sm:leading-8">
                          {featuredSpotlight.copy}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {featuredSpotlight.tags.map((tag) => (
                          <span
                            className="rounded-full border border-[#dbc8b2] bg-white/75 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#6d5647]"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {supportingProducts.map((item) => (
                          <div className="rounded-[18px] border border-white/60 bg-white/78 p-4" key={item.slug}>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">
                              Shelf Pick
                            </p>
                            <h4 className="mt-2 text-base font-semibold text-foreground">{item.name}</h4>
                            <p className="mt-1 text-sm text-[#8f7767]">
                              {item.category} · {formatCurrency(item.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-[#6b4f3a]">
                        Starts from {formatCurrency(Math.min(...supportingProducts.map((item) => item.price), featuredSpotlight.product.price))}
                      </span>
                      <Button asChild>
                        <Link href={featuredSpotlight.href}>{featuredSpotlight.cta}</Link>
                      </Button>
                    </div>
                  </CardContent>

                  <ProductArt className="min-h-[18rem] rounded-none md:min-h-full md:rounded-l-none" product={featuredSpotlight.product} />
                </div>
              </Card>
            </Reveal>

            <div className="grid gap-4">
              {secondarySpotlights.map((spotlight, index) => (
                <Reveal delay={index * 90} key={spotlight.title}>
                  <Card className={spotlight.surface + " overflow-hidden border-[#eadfce]"}>
                    <div className="grid gap-0 sm:grid-cols-[12rem_minmax(0,1fr)]">
                      <ProductArt className="min-h-[14rem] rounded-none sm:rounded-r-none" product={spotlight.product} />
                      <CardContent className="flex flex-col justify-between p-5 sm:p-6">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-500">
                            {spotlight.eyebrow}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold leading-tight text-foreground">{spotlight.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-[#6b4f3a]">{spotlight.copy}</p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            {spotlight.tags.map((tag) => (
                              <span className="rounded-full bg-white/75 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#6d5647]" key={tag}>
                                {tag}
                              </span>
                            ))}
                          </div>

                          <Button asChild size="sm">
                            <Link href={spotlight.href}>{spotlight.cta}</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <div className="container">
          <Reveal>
            <div className="grid gap-0 overflow-hidden rounded-[24px] border border-[#eadfce] bg-[linear-gradient(135deg,#f8f1e8_0%,#efe3d6_100%)] lg:grid-cols-[15rem_minmax(0,1fr)_16rem]">
              <div className="min-h-[14rem]">
                <img
                  alt="Skincare promo"
                  className="h-full w-full object-cover"
                  src="https://images.pexels.com/photos/34939732/pexels-photo-34939732.jpeg?cs=srgb&dl=pexels-prolificpeople-34939732.jpg&fm=jpg"
                />
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-500">Store Promo</p>
                <h3 className="mt-3 font-display text-4xl font-medium leading-[0.95] text-foreground sm:text-5xl">
                  Free delivery over ₦50,000
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6b4f3a] sm:text-base sm:leading-8">
                  Stack your skincare essentials in one order and unlock free delivery in major cities. Faster checkout,
                  cleaner shipping rules, and no giant empty banner space.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Lagos, Abuja, Port Harcourt", "Secure checkout ready", "Restocked every week"].map((item) => (
                    <span
                      className="rounded-full border border-white/60 bg-white/72 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#6d5647]"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 bg-[#f3e6d9] p-6 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[18px] border border-white/60 bg-white/70 p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">Delivery Window</p>
                  <p className="mt-2 font-display text-[2rem] leading-none text-foreground">24-72hrs</p>
                </div>
                <Button asChild className="h-auto justify-center py-4">
                  <Link href="/shop">Shop Now</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14" id="best-sellers">
        <div className="container">
          <Reveal>
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-500">Most Loved</p>
                <h2 className="mt-2 font-display text-4xl font-medium text-foreground">Best Sellers</h2>
                <p className="mt-2 text-sm text-[#8f7767]">Top-performing products our shoppers reorder most often.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <ProductRail products={featuredProducts} />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#faf6f1] py-12 sm:py-14" id="new-arrivals">
        <div className="container">
          <Reveal>
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-500">Fresh Picks</p>
                <h2 className="mt-2 font-display text-4xl font-medium text-foreground">New Arrivals</h2>
                <p className="mt-2 text-sm text-[#8f7767]">
                  Recent additions presented with the same consistent product card system used across the store.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/shop">Browse New Products</Link>
              </Button>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {newArrivals.map((product, index) => (
              <Reveal delay={index * 70} key={product.slug}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#5c3d2e] py-12">
        <div className="container">
          <Reveal>
            <Card className="border-[#715040] bg-transparent text-white shadow-none">
              <CardContent className="space-y-5 p-6 text-center sm:p-8">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-300">Join the Community</p>
                <h2 className="font-display text-4xl font-medium text-white sm:text-5xl">Glow Up Your Inbox</h2>
                <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
                  Get skincare offers, product drops, and quick routine tips delivered weekly.
                </p>
                <NewsletterSignup />
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
