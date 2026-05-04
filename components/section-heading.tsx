import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
  className?: string;
  light?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  className,
  light = false
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-8 space-y-4 sm:mb-10", center && "text-center", className)}>
      <Badge
        className={cn("w-fit", !light && "bg-white/80 text-gold-500", light && "text-white", center && "mx-auto")}
        variant={light ? "soft" : "outline"}
      >
        {eyebrow}
      </Badge>
      <div className={cn("space-y-3", center && "mx-auto max-w-3xl")}>
        <h2
          className={cn(
            "font-display text-4xl font-medium leading-[0.95] tracking-[-0.03em] sm:text-5xl lg:text-6xl",
            light ? "text-white" : "text-foreground"
          )}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {description ? (
          <p
            className={cn(
              "max-w-2xl text-sm leading-7 sm:text-base sm:leading-8",
              light ? "text-white/70" : "text-muted-foreground",
              center && "mx-auto"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
