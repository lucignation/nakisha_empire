import { Badge } from "@/components/ui/badge";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  chips?: string[];
}

export default function PageHero({ eyebrow, title, description, chips = [] }: PageHeroProps) {
  return (
    <section className="border-b border-border/60 bg-hero-glow">
      <div className="container py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
          <div className="space-y-5">
            <Badge className="bg-white/80 text-gold-500" variant="outline">
              {eyebrow}
            </Badge>
            <div className="space-y-4">
              <h1
                className="max-w-4xl font-display text-5xl font-medium leading-[0.92] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-7xl"
                dangerouslySetInnerHTML={{ __html: title }}
              />
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">{description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            {chips.map((chip) => (
              <Badge className="bg-white/70 text-foreground" key={chip} variant="outline">
                {chip}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
