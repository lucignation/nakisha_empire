export interface SiteNavigationItem {
  href: string;
  label: string;
}

export interface Benefit {
  title: string;
  copy: string;
  icon: string;
  tone: string;
}

export interface Product {
  id?: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  brand: string;
  size: string;
  price: number;
  salePrice?: number | null;
  promoStartsAt?: string | null;
  promoEndsAt?: string | null;
  rating: number;
  reviewCount: string;
  badge: string;
  emoji: string;
  accent: string;
  image: string;
  images?: string[];
  cloudinaryPublicId?: string | null;
  skinGoal: string;
  collection: string;
  stars: string;
  highlights: string[];
  ingredients: string[];
  howToUse: string;
  sku?: string | null;
  isPublished?: boolean;
  trackInventory?: boolean;
  stockQuantity?: number;
  isOutOfStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  name: string;
  location: string;
  quote: string;
  initial: string;
}

export interface RoutineStep {
  title: string;
  copy: string;
}

export interface Routine {
  slug: string;
  name: string;
  description: string;
  featuredSlugs: string[];
  steps: RoutineStep[];
}

export interface IngredientHighlight {
  name: string;
  copy: string;
  icon: string;
  tone: string;
}

export interface BrandValue {
  title: string;
  copy: string;
  icon: string;
}

export function getProductImages(product: Product) {
  if (product.images?.length) {
    return product.images;
  }

  return [product.image];
}

export const siteNavigation: SiteNavigationItem[] = [
  { href: "/shop", label: "Shop" },
  { href: "/routines", label: "Routines" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/about", label: "About" }
];

export const marqueeItems: string[] = [
  "Free delivery on orders over ₦25,000",
  "Formulated for melanin-rich and sensitive skin",
  "Cruelty-free, glow-first skincare",
  "Luxury routines with everyday ease"
];

export const benefits: Benefit[] = [
  {
    title: "Radiant Glow",
    copy:
      "Vitamin-rich formulas support brightness, smooth texture, and the soft lit-from-within finish Nakisha Empire is built around.",
    icon: "✨",
    tone: "pink"
  },
  {
    title: "Balanced Skin",
    copy:
      "Hydrating botanicals and barrier-loving actives help calm stressed skin without that stripped or tight feeling.",
    icon: "🌿",
    tone: "lavender"
  },
  {
    title: "Daily Confidence",
    copy:
      "Each ritual is designed to feel premium, simple, and consistent so taking care of your skin fits real life.",
    icon: "💎",
    tone: "gold"
  }
];

export const products: Product[] = [
  {
    slug: "golden-rose-serum",
    name: "Golden Rose Serum",
    shortDescription: "Brightening treatment for dull, uneven skin.",
    description:
      "A silky daily serum that layers niacinamide, rose water, and licorice root to help restore glow while keeping your skin soft and comfortable.",
    category: "Serum",
    brand: "Nakisha Signature",
    size: "30ml",
    price: 28500,
    salePrice: 24500,
    promoStartsAt: "2026-05-01T00:00:00.000Z",
    promoEndsAt: "2026-05-31T23:59:59.000Z",
    rating: 4.9,
    reviewCount: "1.2k",
    badge: "Bestseller",
    emoji: "🌸",
    accent: "pink",
    image: "https://images.pexels.com/photos/29977128/pexels-photo-29977128.jpeg?cs=srgb&dl=pexels-pexels-user-2148216861-29977128.jpg&fm=jpg",
    skinGoal: "Tone + radiance",
    collection: "Golden Ritual",
    stars: "★★★★★",
    highlights: [
      "Supports a brighter, more even-looking complexion",
      "Lightweight slip that wears beautifully under moisturizer",
      "Designed for morning and evening use"
    ],
    ingredients: ["Rose water", "Niacinamide", "Licorice root", "Squalane"],
    howToUse:
      "Press 3 to 4 drops into freshly toned skin, then seal with your moisturizer."
  },
  {
    slug: "velvet-bloom-toner",
    name: "Velvet Bloom Toner",
    shortDescription: "A soothing toner for calm, balanced skin.",
    description:
      "This cloud-light toner refreshes the skin with lavender water, panthenol, and green tea so every layer after it sinks in more smoothly.",
    category: "Toner",
    brand: "Soft Reset",
    size: "150ml",
    price: 18000,
    rating: 4.8,
    reviewCount: "860",
    badge: "New",
    emoji: "🪷",
    accent: "lavender",
    image: "https://images.pexels.com/photos/34939732/pexels-photo-34939732.jpeg?cs=srgb&dl=pexels-prolificpeople-34939732.jpg&fm=jpg",
    skinGoal: "Calm + prep",
    collection: "Soft Reset",
    stars: "★★★★★",
    highlights: [
      "Helps reduce the look of redness",
      "Preps skin for serum without feeling sticky",
      "Alcohol-free and comfortable for daily use"
    ],
    ingredients: ["Lavender water", "Panthenol", "Green tea", "Betaine"],
    howToUse:
      "Sweep across clean skin with your palms or a cotton pad before serum."
  },
  {
    slug: "honey-glow-moisturizer",
    name: "Honey Glow Moisturizer",
    shortDescription: "A cushiony cream that seals in hydration.",
    description:
      "Whipped but never heavy, this moisturizer pairs honey extract, ceramides, and shea lipids to leave skin plush, dewy, and comfortable.",
    category: "Moisturizer",
    brand: "Nakisha Signature",
    size: "50ml",
    price: 22000,
    rating: 4.7,
    reviewCount: "940",
    badge: "Fan Fave",
    emoji: "🍯",
    accent: "gold",
    image: "https://images.pexels.com/photos/34939748/pexels-photo-34939748.jpeg?cs=srgb&dl=pexels-prolificpeople-34939748.jpg&fm=jpg",
    skinGoal: "Hydration + barrier care",
    collection: "Golden Ritual",
    stars: "★★★★☆",
    highlights: [
      "Locks in hydration without a greasy finish",
      "Supports a stronger-feeling skin barrier",
      "Creates a soft, plush glow by morning"
    ],
    ingredients: ["Honey extract", "Ceramides", "Shea lipids", "Glycerin"],
    howToUse:
      "Massage a small amount over serum as the last hydrating step in your routine."
  },
  {
    slug: "aloe-clarity-cleanser",
    name: "Aloe Clarity Cleanser",
    shortDescription: "A gentle gel cleanser for fresh, comfortable skin.",
    description:
      "Built for a clean rinse without the squeak, this cleanser uses aloe, oat milk, and amino acids to lift the day while respecting your barrier.",
    category: "Cleanser",
    brand: "Soft Reset",
    size: "100ml",
    price: 14500,
    rating: 4.9,
    reviewCount: "730",
    badge: "Everyday",
    emoji: "🌿",
    accent: "sage",
    image: "https://images.pexels.com/photos/15569182/pexels-photo-15569182.jpeg?cs=srgb&dl=pexels-mearlywan-307951439-15569182.jpg&fm=jpg",
    skinGoal: "Cleanse + reset",
    collection: "Soft Reset",
    stars: "★★★★★",
    highlights: [
      "Removes excess oil and sunscreen with ease",
      "Leaves skin soft instead of tight",
      "Amino-acid base supports daily use"
    ],
    ingredients: ["Aloe vera", "Oat milk", "Amino acids", "Allantoin"],
    howToUse:
      "Massage onto damp skin for 30 seconds, then rinse with lukewarm water."
  },
  {
    slug: "shea-silk-body-creme",
    name: "Shea Silk Body Creme",
    shortDescription: "A rich body cream for satin-soft glow.",
    description:
      "A decadent body cream that wraps the skin in shea butter, cocoa seed oil, and vanilla blossom for a luminous finish.",
    category: "Body Care",
    brand: "Velvet Body",
    size: "200ml",
    price: 24500,
    rating: 4.8,
    reviewCount: "520",
    badge: "Luxury",
    emoji: "🧈",
    accent: "sunset",
    image: "https://images.pexels.com/photos/16378446/pexels-photo-16378446.jpeg?cs=srgb&dl=pexels-mearlywan-307951439-16378446.jpg&fm=jpg",
    skinGoal: "Body nourishment",
    collection: "Velvet Body",
    stars: "★★★★★",
    highlights: [
      "Softens dry areas like knees and elbows",
      "Leaves a healthy sheen on deeper skin tones",
      "Comforting finish for evening care"
    ],
    ingredients: ["Shea butter", "Cocoa seed oil", "Vitamin E", "Vanilla blossom"],
    howToUse:
      "Massage generously into damp skin after bathing, focusing on dry areas."
  },
  {
    slug: "dew-shield-spf-50",
    name: "Dew Shield SPF 50",
    shortDescription: "A dewy sunscreen that leaves no grey cast behind.",
    description:
      "A lightweight SPF veil with aloe and hyaluronic support that protects while keeping the skin fresh, hydrated, and camera-ready.",
    category: "Sun Care",
    brand: "Daily Defense",
    size: "50ml",
    price: 19500,
    salePrice: 16500,
    promoStartsAt: "2026-05-01T00:00:00.000Z",
    promoEndsAt: "2026-05-31T23:59:59.000Z",
    rating: 4.8,
    reviewCount: "680",
    badge: "Editor Pick",
    emoji: "☀️",
    accent: "mist",
    image: "https://images.pexels.com/photos/34939748/pexels-photo-34939748.jpeg?cs=srgb&dl=pexels-prolificpeople-34939748.jpg&fm=jpg",
    skinGoal: "Protect + glow",
    collection: "Daily Defense",
    stars: "★★★★★",
    highlights: [
      "Sheer finish with no visible cast",
      "Plays well under makeup and on bare skin",
      "Comfortable hydration throughout the day"
    ],
    ingredients: ["UV filters", "Aloe vera", "Hyaluronic complex", "Vitamin E"],
    howToUse:
      "Apply generously as the last step in your morning routine and reapply as needed."
  }
];

export const testimonials: Testimonial[] = [
  {
    name: "Adaeze O.",
    location: "Lagos, Nigeria",
    quote:
      "The Golden Rose Serum gave me that smooth, clear, polished glow I was chasing. My skin looks brighter without feeling overworked.",
    initial: "A"
  },
  {
    name: "Fatimah K.",
    location: "Abuja, Nigeria",
    quote:
      "Nakisha Empire feels premium from the first touch. The toner and moisturizer together made my routine feel intentional again.",
    initial: "F"
  },
  {
    name: "Chidera M.",
    location: "Port Harcourt, Nigeria",
    quote:
      "I needed skincare that respected my skin barrier and still delivered results. This brand finally feels built for that balance.",
    initial: "C"
  }
];

export const routines: Routine[] = [
  {
    slug: "morning-reset",
    name: "Morning Reset",
    description:
      "A simple daytime ritual for fresh, balanced, protected skin before makeup or a bare-face day.",
    featuredSlugs: ["aloe-clarity-cleanser", "golden-rose-serum", "dew-shield-spf-50"],
    steps: [
      {
        title: "Cleanse softly",
        copy: "Begin with Aloe Clarity Cleanser to clear overnight oil without disrupting comfort."
      },
      {
        title: "Brighten and prep",
        copy: "Apply Golden Rose Serum to wake up tone, support glow, and keep the skin looking even."
      },
      {
        title: "Protect the glow",
        copy: "Finish with Dew Shield SPF 50 for lightweight protection with a dewy finish."
      }
    ]
  },
  {
    slug: "evening-ritual",
    name: "Evening Ritual",
    description:
      "A richer nighttime edit focused on cleansing, calming, and sealing in overnight nourishment.",
    featuredSlugs: ["aloe-clarity-cleanser", "velvet-bloom-toner", "golden-rose-serum", "honey-glow-moisturizer"],
    steps: [
      {
        title: "Melt the day away",
        copy: "Use Aloe Clarity Cleanser to remove the day without leaving the skin dry or stripped."
      },
      {
        title: "Tone and settle",
        copy: "Pat in Velvet Bloom Toner to calm the skin and create a softer, more hydrated canvas."
      },
      {
        title: "Layer your serum",
        copy: "Press Golden Rose Serum into the face and neck for a polished, luminous finish."
      },
      {
        title: "Seal in comfort",
        copy: "Finish with Honey Glow Moisturizer so you wake up plush, rested, and radiant."
      }
    ]
  }
];

export const ingredientHighlights: IngredientHighlight[] = [
  {
    name: "Rose Water",
    copy: "Chosen for softness, hydration, and the sensorial touch that makes the routine feel elevated.",
    icon: "🌹",
    tone: "pink"
  },
  {
    name: "Niacinamide",
    copy: "A staple for smoothing the look of texture and supporting a more even, balanced complexion.",
    icon: "✨",
    tone: "gold"
  },
  {
    name: "Aloe Vera",
    copy: "A calming classic that helps keep cleansers and sunscreens comfortable on the skin.",
    icon: "🌿",
    tone: "sage"
  },
  {
    name: "Ceramides",
    copy: "Used to help support the barrier so skin feels stronger, cushioned, and less reactive over time.",
    icon: "🫧",
    tone: "lavender"
  }
];

export const brandValues: BrandValue[] = [
  {
    title: "Clean but comforting",
    copy: "Every formula is designed to feel luxurious and easy to use, without the harshness that often comes with trend-led skincare.",
    icon: "🤍"
  },
  {
    title: "Glow with structure",
    copy: "Nakisha Empire focuses on routines that are simple enough to stay consistent with, because consistency is where the magic happens.",
    icon: "🪞"
  },
  {
    title: "Made for real life",
    copy: "From texture to finish to pricing tiers, the line is designed for women who want high-touch skincare that still feels practical.",
    icon: "👑"
  }
];

export const featuredProducts: Product[] = products.slice(0, 4);

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  return slugs
    .map((slug) => getProductBySlug(slug))
    .filter((product): product is Product => Boolean(product));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

function isWithinPromoWindow(product: Product, now = new Date()) {
  const startsAt = product.promoStartsAt ? new Date(product.promoStartsAt) : null;
  const endsAt = product.promoEndsAt ? new Date(product.promoEndsAt) : null;

  if (startsAt && Number.isNaN(startsAt.getTime())) {
    return false;
  }

  if (endsAt && Number.isNaN(endsAt.getTime())) {
    return false;
  }

  if (startsAt && now < startsAt) {
    return false;
  }

  if (endsAt && now > endsAt) {
    return false;
  }

  return true;
}

export function isProductOnSale(product: Product, now = new Date()): boolean {
  if (typeof product.salePrice !== "number") {
    return false;
  }

  if (product.salePrice <= 0 || product.salePrice >= product.price) {
    return false;
  }

  return isWithinPromoWindow(product, now);
}

export function getEffectivePrice(product: Product, now = new Date()): number {
  return isProductOnSale(product, now) && typeof product.salePrice === "number" ? product.salePrice : product.price;
}

export function getDiscountAmount(product: Product, now = new Date()): number {
  return isProductOnSale(product, now) ? product.price - getEffectivePrice(product, now) : 0;
}

export function isProductAvailable(product: Product): boolean {
  if (product.isOutOfStock) {
    return false;
  }

  if (product.trackInventory) {
    return (product.stockQuantity ?? 0) > 0;
  }

  return true;
}
