"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import CheckoutPaymentPanel from "@/components/checkout-payment-panel";
import ProductArt from "@/components/product-art";
import { useCart } from "@/components/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/data";

export default function CartView() {
  const { items, hydrated, subtotal, updateQuantity, removeItem, clearCart } = useCart();

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

  const shipping = subtotal >= 60000 ? 0 : 4500;
  const total = subtotal + shipping;

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
                    <p className="font-display text-3xl text-gold-500">{formatCurrency(item.price)}</p>
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

          <CheckoutPaymentPanel total={total} />

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
