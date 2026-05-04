import { cn } from "@/lib/utils";

export interface LogoMarqueeItem {
  name: string;
  className: string;
}

const defaultItems: LogoMarqueeItem[] = [
  { name: "celimax", className: "font-sans tracking-[-0.04em] text-[#202020]" },
  { name: "Purito", className: "font-display tracking-[-0.05em] text-[#284738]" },
  { name: "numbuz:n", className: "font-sans tracking-[-0.06em] text-[#1f1f1f]" },
  { name: "Abib", className: "font-sans tracking-[-0.05em] text-[#111111]" },
  { name: "Biodance", className: "font-display tracking-[-0.05em] text-[#222222]" },
  { name: "CeraVe", className: "font-sans tracking-[-0.07em] text-[#2f5fae]" },
  { name: "Anua", className: "font-sans tracking-[-0.06em] text-[#232323]" },
  { name: "SKIN1004", className: "font-display tracking-[-0.05em] text-[#203224]" }
];

interface LogoMarqueeProps {
  className?: string;
  items?: LogoMarqueeItem[];
  label?: string;
}

export default function LogoMarquee({ className, items = defaultItems, label = "Featured Brands" }: LogoMarqueeProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8f7767]">{label}</p>
      <div className="overflow-hidden rounded-[12px]  bg-white">
        <div className="flex w-max animate-logo-marquee gap-4 py-5 pr-4 [animation-duration:28s] sm:gap-6 sm:py-6">
          {[...items, ...items].map((item, index) => (
            <div
              className="flex min-w-[10rem] items-center justify-center rounded-[10px] border border-[#f0e6d8] bg-[#faf6f1] px-6 py-4 shadow-[0_8px_20px_rgba(79,54,37,0.04)] sm:min-w-[12rem]"
              key={`${item.name}-${index}`}
            >
              <span className={cn("text-2xl leading-none sm:text-[2.1rem]", item.className)}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
