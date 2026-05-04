"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-semibold uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background shadow-soft hover:bg-[#5c3d2e]",
        secondary: "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90",
        outline: "border-[1.5px] border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost: "normal-case tracking-normal hover:bg-accent/60 hover:text-accent-foreground",
        soft: "border border-gold-400/25 bg-white/85 text-foreground shadow-soft hover:bg-white",
        link: "rounded-none p-0 normal-case tracking-normal text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-11 px-5 text-[0.75rem]",
        sm: "h-9 px-4 text-[0.68rem]",
        lg: "h-12 px-6 text-[0.78rem]",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
