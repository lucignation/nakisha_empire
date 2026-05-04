"use client";

import type * as React from "react";
import { Toaster as Sonner } from "sonner";

export function Toaster(props: React.ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      closeButton
      expand={false}
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "!w-[min(26rem,calc(100vw-1.5rem))] !rounded-[20px] !border !border-gold-400/20 !bg-white !text-foreground !shadow-[0_18px_50px_rgba(72,48,58,0.14)]",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-secondary !text-secondary-foreground"
        }
      }}
      {...props}
    />
  );
}
