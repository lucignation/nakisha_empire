"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const payload = (await response.json()) as { success?: boolean; message?: string };

    if (!response.ok || !payload.success) {
      toast.error("Unable to sign in", {
        description: payload.message ?? "Check your super-admin credentials and try again."
      });
      return;
    }

    toast.success("Welcome back", {
      description: "You can now upload products and manage stock."
    });

    startTransition(() => {
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <Card className="border-[#eadfce] bg-white/90">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfce] bg-[#faf6f1] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9c7530]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Super admin access
        </div>
        <div>
          <CardTitle>Sign in to manage the catalogue</CardTitle>
          <CardDescription>
            Use the configured super-admin email and password to upload products, publish them, and control stock.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="admin-email">Email address</Label>
            <Input
              id="admin-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              type="email"
              value={email}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your admin password"
              type="password"
              value={password}
            />
          </div>

          <Button className="w-full justify-center" disabled={isPending} size="lg" type="submit">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {isPending ? "Signing in..." : "Open Product Dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
