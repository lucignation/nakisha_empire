"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/data";
import type { AdminPromoCodeRecord } from "@/lib/server/promos";

interface PromoDraft {
  code: string;
  description: string;
  discountType: AdminPromoCodeRecord["discountType"];
  amount: string;
  minOrderAmount: string;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
  isActive: boolean;
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function createDraft(promo: AdminPromoCodeRecord): PromoDraft {
  return {
    code: promo.code,
    description: promo.description ?? "",
    discountType: promo.discountType,
    amount: String(promo.amount),
    minOrderAmount: promo.minOrderAmount ? String(promo.minOrderAmount) : "",
    startsAt: toDateTimeLocalValue(promo.startsAt),
    endsAt: toDateTimeLocalValue(promo.endsAt),
    usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
    isActive: promo.isActive
  };
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function AdminPromoManager(props: { promo: AdminPromoCodeRecord }) {
  const { promo } = props;
  const router = useRouter();
  const [draft, setDraft] = useState<PromoDraft>(() => createDraft(promo));
  const [saving, setSaving] = useState(false);

  const discountPreview = useMemo(() => {
    const amount = Number(draft.amount || 0);

    if (draft.discountType === "PERCENTAGE") {
      return `${amount}% off`;
    }

    return formatCurrency(amount);
  }, [draft.amount, draft.discountType]);

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/promos/${promo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: draft.code,
          description: draft.description,
          discountType: draft.discountType,
          amount: Number(draft.amount),
          minOrderAmount: draft.minOrderAmount ? Number(draft.minOrderAmount) : undefined,
          startsAt: draft.startsAt || undefined,
          endsAt: draft.endsAt || undefined,
          usageLimit: draft.usageLimit ? Number(draft.usageLimit) : undefined,
          isActive: draft.isActive
        })
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to update promo.");
      }

      toast.success("Promo updated", {
        description: `${draft.code} was saved successfully.`
      });

      startTransition(() => router.refresh());
    } catch (error) {
      toast.error("Promo update failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-2xl">{promo.code}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Manage this promo campaign from one place, including timing, discount logic, minimum basket, and availability.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={draft.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700"} variant="outline">
              {draft.isActive ? "Active" : "Paused"}
            </Badge>
            <Badge className="border-[#f5afaf] bg-[#fdf3f3] text-[#b46b6b]" variant="outline">
              {discountPreview}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Promo details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Promo code</Label>
                <Input onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value.toUpperCase() }))} value={draft.code} />
              </div>
              <div className="grid gap-2">
                <Label>Discount type</Label>
                <select
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      discountType: event.target.value as PromoDraft["discountType"]
                    }))
                  }
                  value={draft.discountType}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  className="min-h-[120px]"
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describe the campaign intent or customer-facing message."
                  value={draft.description}
                />
              </div>
              <div className="grid gap-2">
                <Label>{draft.discountType === "PERCENTAGE" ? "Discount percentage" : "Discount amount (NGN)"}</Label>
                <Input onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} type="number" value={draft.amount} />
              </div>
              <div className="grid gap-2">
                <Label>Minimum subtotal (NGN)</Label>
                <Input
                  onChange={(event) => setDraft((current) => ({ ...current, minOrderAmount: event.target.value }))}
                  placeholder="Optional"
                  type="number"
                  value={draft.minOrderAmount}
                />
              </div>
              <div className="grid gap-2">
                <Label>Promo start</Label>
                <Input onChange={(event) => setDraft((current) => ({ ...current, startsAt: event.target.value }))} type="datetime-local" value={draft.startsAt} />
              </div>
              <div className="grid gap-2">
                <Label>Promo end</Label>
                <Input onChange={(event) => setDraft((current) => ({ ...current, endsAt: event.target.value }))} type="datetime-local" value={draft.endsAt} />
              </div>
              <div className="grid gap-2">
                <Label>Usage limit</Label>
                <Input
                  onChange={(event) => setDraft((current) => ({ ...current, usageLimit: event.target.value }))}
                  placeholder="Optional"
                  type="number"
                  value={draft.usageLimit}
                />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  checked={draft.isActive}
                  className="h-4 w-4 accent-blue-600"
                  onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
                  type="checkbox"
                />
                Promo is active
              </label>
            </div>

            <Button className="bg-slate-950 hover:bg-slate-800" disabled={saving} onClick={handleSave} type="button">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Promo
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Campaign summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Discount preview" value={discountPreview} />
              <DetailRow label="Usage count" value={`${promo.usageCount}`} />
              <DetailRow label="Usage cap" value={promo.usageLimit ? `${promo.usageLimit}` : "Unlimited"} />
              <DetailRow label="Created" value={formatDateTime(promo.createdAt)} />
              <DetailRow label="Updated" value={formatDateTime(promo.updatedAt)} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Customer eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Minimum basket" value={draft.minOrderAmount ? formatCurrency(Number(draft.minOrderAmount)) : "No minimum"} />
              <DetailRow label="Start" value={draft.startsAt ? formatDateTime(draft.startsAt) : "Not scheduled"} />
              <DetailRow label="End" value={draft.endsAt ? formatDateTime(draft.endsAt) : "Not scheduled"} />
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-500">
                Customers can only apply this promo when it is active, inside the valid time window, and within any usage limit you set here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{props.label}</p>
      <p className="mt-2 text-sm font-medium text-slate-950">{props.value}</p>
    </div>
  );
}
