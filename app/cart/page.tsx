import CartView from "@/components/cart-view";
import PageHero from "@/components/page-hero";

export const metadata = {
  title: "Cart"
};

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Your Cart"
        title={`Review your <span class="italic text-gold-500">ritual</span>`}
        description="Review your products, adjust quantities, and choose Paystack or Flutterwave directly from the checkout summary."
        chips={["Cart persistence", "Quantity controls", "Paystack", "Flutterwave"]}
      />

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container">
          <CartView />
        </div>
      </section>
    </>
  );
}
