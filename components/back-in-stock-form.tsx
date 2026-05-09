"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BackInStockForm(props: {
  productId: string;
  productName: string;
}) {
  const { productId, productName } = props;
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/back-in-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId,
          email
        })
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to save your request.");
      }

      toast.success("We'll let you know", {
        description: `You’ll get an email when ${productName} is back in stock.`
      });
      setEmail("");
    } catch (error) {
      toast.error("Unable to save your request", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-3 rounded-[18px] border border-[var(--brand-border)] bg-white/80 p-4" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-semibold text-foreground">Notify me when it is back</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Leave your email and we’ll send you a restock alert as soon as this product is available again.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <Button disabled={submitting || email.trim().length < 5} type="submit">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Notify Me
        </Button>
      </div>
    </form>
  );
}
