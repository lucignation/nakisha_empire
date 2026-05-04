import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        <Card className="mx-auto max-w-2xl bg-white/85">
          <CardContent className="space-y-5 p-8 text-center sm:p-10">
            <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
              This page slipped out of the routine.
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              The route you opened is not available right now, but the storefront is still here.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/">Back home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/shop">Visit shop</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
