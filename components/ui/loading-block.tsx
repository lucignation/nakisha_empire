import { cn } from "@/lib/utils";

export default function LoadingBlock(props: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-[20px] bg-slate-200/80", props.className)} />;
}
