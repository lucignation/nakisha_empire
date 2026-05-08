"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { CreditCard, Landmark, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEffectivePrice } from "@/lib/data";
import { cn } from "@/lib/utils";

type PaymentGateway = "paystack" | "flutterwave";

interface CheckoutPaymentPanelProps {
  subtotal: number;
  shipping: number;
  discountAmount: number;
  total: number;
  promoCode?: string | null;
}

const gatewayCopy: Record<
  PaymentGateway,
  {
    label: string;
    detail: string;
    icon: typeof CreditCard;
  }
> = {
  paystack: {
    label: "Paystack",
    detail: "Cards, bank transfer, and USSD checkout for NGN payments.",
    icon: CreditCard
  },
  flutterwave: {
    label: "Flutterwave",
    detail: "Cards, transfers, and local rails with Flutterwave checkout.",
    icon: Landmark
  }
};

function getPaystackClient() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.Paystack ?? window.PaystackPop;
}

export default function CheckoutPaymentPanel({
  subtotal,
  shipping,
  discountAmount,
  total,
  promoCode
}: CheckoutPaymentPanelProps) {
  const { items, clearCart } = useCart();
  const [gateway, setGateway] = useState<PaymentGateway>("paystack");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(() => Boolean(getPaystackClient()));
  const [flutterwaveLoaded, setFlutterwaveLoaded] = useState(() =>
    typeof window !== "undefined" ? Boolean(window.FlutterwaveCheckout) : false
  );
  const [paystackError, setPaystackError] = useState(false);
  const [flutterwaveError, setFlutterwaveError] = useState(false);
  const paymentHandledRef = useRef(false);

  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
  const flutterwavePublicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "";
  const gatewayAvailability: Record<PaymentGateway, boolean> = {
    paystack: Boolean(paystackPublicKey),
    flutterwave: Boolean(flutterwavePublicKey)
  };

  const orderItemsLabel = useMemo(
    () => items.map((item) => `${item.name} x${item.quantity}`).join(", "),
    [items]
  );
  const gatewayLoaded: Record<PaymentGateway, boolean> = {
    paystack: paystackLoaded,
    flutterwave: flutterwaveLoaded
  };
  const gatewayErrored: Record<PaymentGateway, boolean> = {
    paystack: paystackError,
    flutterwave: flutterwaveError
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (getPaystackClient()) {
      setPaystackLoaded(true);
    }

    if (window.FlutterwaveCheckout) {
      setFlutterwaveLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !paystackPublicKey || paystackLoaded || paystackError) {
      return;
    }

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      if (getPaystackClient()) {
        setPaystackLoaded(true);
        setPaystackError(false);
        window.clearInterval(intervalId);
        return;
      }

      attempts += 1;

      if (attempts >= 40) {
        setPaystackError(true);
        window.clearInterval(intervalId);
      }
    }, 300);

    return () => window.clearInterval(intervalId);
  }, [paystackError, paystackLoaded, paystackPublicKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !flutterwavePublicKey || flutterwaveLoaded || flutterwaveError) {
      return;
    }

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      if (window.FlutterwaveCheckout) {
        setFlutterwaveLoaded(true);
        setFlutterwaveError(false);
        window.clearInterval(intervalId);
        return;
      }

      attempts += 1;

      if (attempts >= 40) {
        setFlutterwaveError(true);
        window.clearInterval(intervalId);
      }
    }, 300);

    return () => window.clearInterval(intervalId);
  }, [flutterwaveError, flutterwaveLoaded, flutterwavePublicKey]);

  function parseName(fullName: string) {
    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" ") || undefined
    };
  }

  function validatePaymentDetails() {
    if (!customerName.trim()) {
      toast.error("Enter your full name before paying.");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
      toast.error("Enter a valid email address before paying.");
      return false;
    }

    if (!gatewayAvailability[gateway]) {
      return false;
    }

    if (!gatewayLoaded[gateway]) {
      toast.error(
        gatewayErrored[gateway]
          ? `${selectedGatewayLabel(gateway)} could not load in this browser.`
          : `${selectedGatewayLabel(gateway)} is still loading. Try again in a moment.`
      );
      return false;
    }

    return true;
  }

  async function verifyPaystack(reference: string) {
    const response = await fetch("/api/payments/paystack/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reference,
        expectedAmount: total * 100,
        currency: "NGN"
      })
    });

    const payload = (await response.json()) as { verified?: boolean; message?: string };

    if (!response.ok || !payload.verified) {
      throw new Error(payload.message ?? "Unable to verify the Paystack payment.");
    }
  }

  async function verifyFlutterwave(transactionId: number, txRef: string) {
    const response = await fetch("/api/payments/flutterwave/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transactionId,
        txRef,
        expectedAmount: total,
        currency: "NGN"
      })
    });

    const payload = (await response.json()) as { verified?: boolean; message?: string };

    if (!response.ok || !payload.verified) {
      throw new Error(payload.message ?? "Unable to verify the Flutterwave payment.");
    }
  }

  async function createOrder(input: {
    gateway: "PAYSTACK" | "FLUTTERWAVE";
    paymentReference: string;
    transactionId?: number;
  }) {
    const response = await fetch("/api/orders/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        gateway: input.gateway,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: phoneNumber.trim() || null,
        paymentReference: input.paymentReference,
        transactionId: input.transactionId,
        subtotalAmount: subtotal,
        discountAmount,
        shippingAmount: shipping,
        totalAmount: total,
        promoCode,
        items: items.map((item) => ({
          productId: item.id ?? null,
          slug: item.slug,
          name: item.name,
          quantity: item.quantity,
          price: getEffectivePrice(item)
        }))
      })
    });

    const payload = (await response.json()) as {
      success?: boolean;
      message?: string;
      orderNumber?: string;
    };

    if (!response.ok || !payload.success || !payload.orderNumber) {
      throw new Error(payload.message ?? "Unable to store the order after payment.");
    }

    return payload.orderNumber;
  }

  async function handlePaystackCheckout() {
    if (!validatePaymentDetails()) {
      return;
    }

    const PaystackClient = getPaystackClient();

    if (!paystackLoaded || !PaystackClient) {
      toast.error("Paystack is still loading. Try again in a moment.");
      return;
    }

    const { firstName, lastName } = parseName(customerName);
    const reference = `NKE-PS-${crypto.randomUUID()}`;

    paymentHandledRef.current = false;
    setIsProcessing(true);

    try {
      const popup = new PaystackClient();
      const launchCheckout = popup.newTransaction ?? popup.checkout;

      await Promise.resolve(
        launchCheckout.call(popup, {
        key: paystackPublicKey,
        email: customerEmail.trim(),
        amount: total * 100,
        currency: "NGN",
        reference,
        firstName,
        lastName,
        phone: phoneNumber.trim() || undefined,
        channels: ["card", "bank", "ussd", "bank_transfer"],
        metadata: {
          customer_name: customerName.trim(),
          phone_number: phoneNumber.trim(),
          cart_items: orderItemsLabel
        },
        onSuccess: async (transaction) => {
          const verifiedReference = transaction.reference ?? transaction.trxref ?? reference;

          try {
            await verifyPaystack(verifiedReference);
            const orderNumber = await createOrder({
              gateway: "PAYSTACK",
              paymentReference: verifiedReference
            });
            paymentHandledRef.current = true;
            clearCart();
            toast.success("Paystack payment verified", {
              description: `Order ${orderNumber} was created. Use it on the Track Order page to follow fulfilment.`
            });
          } catch (error) {
            toast.error("Paystack payment needs attention", {
              description: error instanceof Error ? error.message : "Verification failed."
            });
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: () => {
          if (!paymentHandledRef.current) {
            toast.message("Paystack checkout closed before payment.");
            setIsProcessing(false);
          }
        },
        onError: (error) => {
          toast.error("Paystack checkout failed", {
            description: error.message ?? "The payment modal could not be completed."
          });
          setIsProcessing(false);
        }
        })
      );
    } catch (error) {
      toast.error("Unable to start Paystack checkout", {
        description: error instanceof Error ? error.message : "Please try again."
      });
      setIsProcessing(false);
    }
  }

  async function handleFlutterwaveCheckout() {
    if (!validatePaymentDetails()) {
      return;
    }

    if (!flutterwaveLoaded || !window.FlutterwaveCheckout) {
      toast.error("Flutterwave is still loading. Try again in a moment.");
      return;
    }

    const txRef = `NKE-FLW-${crypto.randomUUID()}`;

    paymentHandledRef.current = false;
    setIsProcessing(true);

    try {
      window.FlutterwaveCheckout({
        public_key: flutterwavePublicKey,
        tx_ref: txRef,
        amount: total,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        customer: {
          email: customerEmail.trim(),
          name: customerName.trim(),
          phone_number: phoneNumber.trim() || undefined
        },
        meta: {
          cart_items: orderItemsLabel
        },
        customizations: {
          title: "Nakisha Empire",
          description: "Payment for skincare order"
        },
        callback: async (payment) => {
          try {
            if (!payment.transaction_id) {
              throw new Error("Flutterwave did not return a transaction id.");
            }

            await verifyFlutterwave(Number(payment.transaction_id), txRef);
            const orderNumber = await createOrder({
              gateway: "FLUTTERWAVE",
              paymentReference: txRef,
              transactionId: Number(payment.transaction_id)
            });
            paymentHandledRef.current = true;
            clearCart();
            toast.success("Flutterwave payment verified", {
              description: `Order ${orderNumber} was created. Use it on the Track Order page to follow fulfilment.`
            });
          } catch (error) {
            toast.error("Flutterwave payment needs attention", {
              description: error instanceof Error ? error.message : "Verification failed."
            });
          } finally {
            setIsProcessing(false);
          }
        },
        onclose: () => {
          if (!paymentHandledRef.current) {
            toast.message("Flutterwave checkout closed before payment.");
            setIsProcessing(false);
          }
        }
      });
    } catch (error) {
      toast.error("Unable to start Flutterwave checkout", {
        description: error instanceof Error ? error.message : "Please try again."
      });
      setIsProcessing(false);
    }
  }

  const selectedGateway = gatewayCopy[gateway];
  const SelectedGatewayIcon = selectedGateway.icon;
  const selectedGatewayConfigured = gatewayAvailability[gateway];
  const selectedGatewayLoaded = gatewayLoaded[gateway];
  const selectedGatewayErrored = gatewayErrored[gateway];

  function selectedGatewayLabel(option: PaymentGateway) {
    return gatewayCopy[option].label;
  }

  function getGatewayStatus(option: PaymentGateway) {
    if (!gatewayAvailability[option]) {
      return {
        label: "Preview only",
        className: "bg-[#f6efe7] text-[#9c7f6e]"
      };
    }

    if (gatewayErrored[option]) {
      return {
        label: "Blocked",
        className: "bg-[#fbebeb] text-[#b55b5b]"
      };
    }

    if (gatewayLoaded[option]) {
      return {
        label: "Live",
        className: "bg-[#eef4ee] text-[#50705c]"
      };
    }

    return {
      label: "Connecting",
      className: "bg-[#f4efe7] text-[#8c745f]"
    };
  }

  return (
    <>
      <Script
        id="paystack-inline"
        onError={() => {
          setPaystackError(true);
          setPaystackLoaded(false);
        }}
        onLoad={() => {
          setPaystackError(false);
          setPaystackLoaded(Boolean(getPaystackClient()));
        }}
        onReady={() => {
          setPaystackError(false);
          setPaystackLoaded(Boolean(getPaystackClient()));
        }}
        src="https://js.paystack.co/v2/inline.js"
        strategy="afterInteractive"
      />
      <Script
        id="flutterwave-inline"
        onError={() => {
          setFlutterwaveError(true);
          setFlutterwaveLoaded(false);
        }}
        onLoad={() => {
          setFlutterwaveError(false);
          setFlutterwaveLoaded(true);
        }}
        onReady={() => {
          setFlutterwaveError(false);
          setFlutterwaveLoaded(Boolean(window.FlutterwaveCheckout));
        }}
        src="https://checkout.flutterwave.com/v3.js"
        strategy="afterInteractive"
      />

      <div className="space-y-4 rounded-[18px] border border-[#eadfce] bg-[#faf6f1] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-500">Choose Gateway</p>
            <p className="mt-1 text-sm text-[#6b4f3a]">Pick your preferred payment provider and complete checkout.</p>
          </div>
          <Badge variant="outline">NGN payment</Badge>
        </div>

        <div className="grid gap-3">
          {(Object.keys(gatewayCopy) as PaymentGateway[]).map((option) => {
            const GatewayIcon = gatewayCopy[option].icon;
            const active = option === gateway;
            const status = getGatewayStatus(option);

            return (
              <button
                className={cn(
                  "rounded-[18px] border p-4 text-left transition-all",
                  active
                    ? "border-[#b8924a] bg-white shadow-[0_12px_24px_rgba(79,54,37,0.06)]"
                    : "border-[#e6d8c8] bg-white/70 hover:border-[#cdb79c]"
                )}
                key={option}
                onClick={() => setGateway(option)}
                type="button"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("rounded-full p-2", active ? "bg-[#f2e4c6]" : "bg-[#f4ede4]")}>
                    <GatewayIcon className="h-4 w-4 text-[#6b4f3a]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{gatewayCopy[option].label}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em]", status.className)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[#8f7767]">{gatewayCopy[option].detail}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!selectedGatewayConfigured ? (
          <div className="rounded-[16px] border border-[#eadfce] bg-white/80 p-4 text-sm leading-6 text-[#6b4f3a]">
            {selectedGateway.label} checkout is unavailable in this preview until its payment keys are connected.
          </div>
        ) : null}

        {selectedGatewayConfigured && !selectedGatewayLoaded ? (
          <div className="rounded-[16px] border border-[#eadfce] bg-white/80 p-4 text-sm leading-6 text-[#6b4f3a]">
            {selectedGatewayErrored
              ? `${selectedGateway.label} could not load in this browser. Check your internet connection, disable content blockers for this site, and refresh the page.`
              : `Connecting to ${selectedGateway.label}. The payment button will unlock as soon as the provider script finishes loading.`}
          </div>
        ) : null}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="checkout-name">Full name</Label>
            <Input
              id="checkout-name"
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Adaeze Okonkwo"
              value={customerName}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-email">Email address</Label>
            <Input
              id="checkout-email"
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={customerEmail}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-phone">Phone number</Label>
            <Input
              id="checkout-phone"
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+234 801 234 5678"
              type="tel"
              value={phoneNumber}
            />
          </div>
        </div>

        <Card className="border-[#eadfce] bg-white shadow-none">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-[#f4ede4] p-2">
              <SelectedGatewayIcon className="h-4 w-4 text-[#6b4f3a]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Pay with {selectedGateway.label}</p>
              <p className="text-sm leading-6 text-[#8f7767]">{selectedGateway.detail}</p>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full justify-center"
          disabled={isProcessing || !selectedGatewayConfigured || !selectedGatewayLoaded}
          onClick={gateway === "paystack" ? handlePaystackCheckout : handleFlutterwaveCheckout}
          type="button"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : selectedGatewayLoaded ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <ShieldAlert className="h-4 w-4" />
          )}
          {isProcessing
            ? "Processing..."
            : selectedGatewayConfigured && selectedGatewayLoaded
              ? `Pay ${total.toLocaleString("en-NG")} NGN with ${selectedGateway.label}`
              : selectedGatewayConfigured
                ? `Waiting for ${selectedGateway.label}`
                : `${selectedGateway.label} unavailable in preview`}
        </Button>

        <p className="text-xs leading-6 text-[#8f7767]">
          Payment is launched in the provider’s secure popup, then verified on the server before the cart is cleared.
        </p>
      </div>
    </>
  );
}
