"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CheckoutPaymentPanel from "@/components/checkout-payment-panel";
import ProductArt from "@/components/product-art";
import { useCart } from "@/components/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, getEffectivePrice, isProductOnSale } from "@/lib/data";

interface AppliedPromoState {
  code: string;
  description?: string | null;
  discountAmount: number;
}

export default function CartView() {
  const { items, hydrated, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromoState | null>(null);

  const shipping = subtotal >= 60000 ? 0 : 4500;
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const validatePromo = useCallback(async (code: string, showToast = true) => {
    setApplyingPromo(true);

    try {
      const response = await fetch("/api/promos/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          subtotalAmount: subtotal
        })
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        promo?: {
          code: string;
          description?: string | null;
        };
        discountAmount?: number;
      };

      if (!response.ok || !payload.success || !payload.promo || typeof payload.discountAmount !== "number") {
        throw new Error(payload.message ?? "Promo code could not be applied.");
      }

      setAppliedPromo({
        code: payload.promo.code,
        description: payload.promo.description,
        discountAmount: payload.discountAmount
      });
      setPromoCodeInput(payload.promo.code);

      if (showToast) {
        toast.success("Promo applied", {
          description: `${payload.promo.code} is now reducing this order.`
        });
      }
    } catch (error) {
      setAppliedPromo(null);

      if (showToast) {
        toast.error("Promo failed", {
          description: error instanceof Error ? error.message : "Please try another code."
        });
      }
    } finally {
      setApplyingPromo(false);
    }
  }, [subtotal]);

  useEffect(() => {
    if (!hydrated || !items.length || !appliedPromo?.code || subtotal <= 0) {
      return;
    }

    void validatePromo(appliedPromo.code, false);
  }, [appliedPromo?.code, hydrated, items.length, subtotal, validatePromo]);

  if (!hydrated) {
    return (
      <Card className="mx-auto max-w-2xl bg-white/80">
        <CardContent className="space-y-3 p-8 text-center">
          <h2 className="font-display text-4xl">Loading your cart</h2>
          <p className="text-sm leading-7 text-muted-foreground">Restoring the products you added a moment ago.</p>
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className="mx-auto max-w-2xl bg-white/80">
        <CardContent className="space-y-5 p-8 text-center sm:p-10">
          <h2 className="font-display text-4xl sm:text-5xl">Your cart is empty</h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Start with our hero products and build a skincare ritual that feels soft, intentional, and easy to keep.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/shop">Shop the collection</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/routines">Explore routines</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
      <div className="grid content-start gap-4">
        {items.map((item) => (
          <Card className="self-start overflow-hidden bg-white/85" key={item.slug}>
            <CardContent className="grid gap-5 p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:p-5">
              <ProductArt className="sm:max-w-[10rem]" product={item} ratio="square" />

              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <div>
                      <h2 className="font-display text-3xl leading-none tracking-[-0.03em]">{item.name}</h2>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.shortDescription}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    {isProductOnSale(item) ? (
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground line-through">
                        {formatCurrency(item.price)}
                      </p>
                    ) : null}
                    <p className="font-display text-3xl text-gold-500">{formatCurrency(getEffectivePrice(item))}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.size}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="inline-flex w-fit items-center rounded-full border border-border bg-background/90 p-1">
                    <Button
                      className="h-9 w-9 rounded-full"
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-10 px-3 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      className="h-9 w-9 rounded-full"
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button onClick={() => removeItem(item.slug)} type="button" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit bg-white/90 xl:sticky xl:top-32">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <p className="text-sm leading-7 text-muted-foreground">
            Choose Paystack or Flutterwave below, then complete the payment in the provider popup.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <Separator />
            {appliedPromo ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Promo ({appliedPromo.code})</span>
                  <strong className="text-[#c26c6c]">- {formatCurrency(appliedPromo.discountAmount)}</strong>
                </div>
                <Separator />
              </>
            ) : null}
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <strong>{shipping === 0 ? "Free" : formatCurrency(shipping)}</strong>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>

          <div className="space-y-3 rounded-[18px] border border-[#eadfce] bg-white/90 p-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-500">Promo code</p>
              <p className="mt-1 text-sm text-[#6b4f3a]">Apply a timed discount code before you pay.</p>
            </div>
            <div className="flex gap-2">
              <input
                className="h-11 flex-1 rounded-[14px] border border-[#e1d3c1] bg-white px-4 text-sm text-foreground outline-none ring-0"
                onChange={(event) => setPromoCodeInput(event.target.value.toUpperCase())}
                placeholder="Enter promo code"
                value={promoCodeInput}
              />
              <Button
                disabled={applyingPromo || promoCodeInput.trim().length < 3}
                onClick={() => void validatePromo(promoCodeInput.trim())}
                type="button"
                variant="outline"
              >
                {applyingPromo ? "Applying..." : "Apply"}
              </Button>
              {appliedPromo ? (
                <Button
                  onClick={() => {
                    setAppliedPromo(null);
                    setPromoCodeInput("");
                  }}
                  type="button"
                  variant="ghost"
                >
                  Remove
                </Button>
              ) : null}
            </div>
            {appliedPromo?.description ? <p className="text-xs leading-6 text-[#8f7767]">{appliedPromo.description}</p> : null}
          </div>

          <CheckoutPaymentPanel
            discountAmount={discountAmount}
            promoCode={appliedPromo?.code ?? null}
            shipping={shipping}
            subtotal={subtotal}
            total={total}
          />

          <Button className="w-full" onClick={clearCart} type="button" variant="outline">
            Clear cart
          </Button>

          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Free delivery unlocks automatically from ₦60,000.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
