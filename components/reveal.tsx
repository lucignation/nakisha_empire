"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const hiddenState = {
  up: "translate-y-8 opacity-0 blur-sm",
  down: "-translate-y-8 opacity-0 blur-sm",
  left: "translate-x-8 opacity-0 blur-sm",
  right: "-translate-x-8 opacity-0 blur-sm"
};

type RevealDirection = keyof typeof hiddenState;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  once?: boolean;
}

export default function Reveal({ children, className, delay = 0, direction = "up", once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);

          if (once) {
            observer.unobserve(entry.target);
          }

          return;
        }

        if (!once) {
          setVisible(false);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      className={cn(
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        visible ? "translate-x-0 translate-y-0 opacity-100 blur-0" : hiddenState[direction] || hiddenState.up,
        className
      )}
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
