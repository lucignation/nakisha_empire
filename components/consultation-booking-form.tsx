"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nakisha-empire-consultations";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" });
const DATE_FORMATTER = new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const consultationSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(10, "Enter a valid phone number."),
  skinFocus: z.string().min(3, "Tell us your main skin concern."),
  consultationDate: z.string().min(1, "Choose an appointment date."),
  timeSlot: z.string().min(1, "Choose an available time slot."),
  notes: z.string().max(500, "Keep your notes under 500 characters.").optional()
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

interface StoredConsultation {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  skinFocus: string;
  consultationDate: string;
  timeSlot: string;
  notes?: string;
}

function formatDateLabel(dateValue: string) {
  const date = parseISODate(dateValue);
  return date ? DATE_FORMATTER.format(date) : "Choose a date";
}

function parseISODate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, 12);
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getNextAvailableDate() {
  const cursor = getStartOfDay(new Date());

  for (let index = 0; index < 60; index += 1) {
    const nextDate = new Date(cursor);
    nextDate.setDate(cursor.getDate() + index);

    if (nextDate.getDay() !== 0) {
      return toISODate(nextDate);
    }
  }

  return toISODate(cursor);
}

function buildCalendarDays(monthDate: Date) {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));
  const calendarDays: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    calendarDays.push({
      date: new Date(cursor),
      isCurrentMonth: cursor.getMonth() === monthDate.getMonth()
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return calendarDays;
}

function getBaseTimeSlots(date: Date) {
  const weekday = date.getDay();

  if (weekday === 0) return [];
  if (weekday === 6) return ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM"];

  return ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM"];
}

function getAvailableSlots(dateValue: string, consultations: StoredConsultation[]) {
  const selectedDate = parseISODate(dateValue);

  if (!selectedDate) return [];

  const bookedSlots = new Set(
    consultations.filter((consultation) => consultation.consultationDate === dateValue).map((consultation) => consultation.timeSlot)
  );

  return getBaseTimeSlots(selectedDate).filter((slot) => !bookedSlots.has(slot));
}

export default function ConsultationBookingForm() {
  const defaultDate = getNextAvailableDate();
  const defaultMonth = parseISODate(defaultDate) ?? new Date();
  const [viewMonth, setViewMonth] = useState(new Date(defaultMonth.getFullYear(), defaultMonth.getMonth(), 1));
  const [consultations, setConsultations] = useState<StoredConsultation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<StoredConsultation | null>(null);

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      skinFocus: "",
      consultationDate: defaultDate,
      timeSlot: "",
      notes: ""
    }
  });

  const selectedDate = form.watch("consultationDate");
  const selectedTimeSlot = form.watch("timeSlot");
  const calendarDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
  const availableSlots = useMemo(() => getAvailableSlots(selectedDate, consultations), [consultations, selectedDate]);
  const today = useMemo(() => getStartOfDay(new Date()), []);
  const currentMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const selectedDateObject = parseISODate(selectedDate);
  const canGoBackMonth = viewMonth > currentMonth;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedConsultations = window.localStorage.getItem(STORAGE_KEY);

    if (!savedConsultations) return;

    try {
      const parsed = JSON.parse(savedConsultations) as StoredConsultation[];
      setConsultations(Array.isArray(parsed) ? parsed : []);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!selectedDateObject) return;
    setViewMonth(new Date(selectedDateObject.getFullYear(), selectedDateObject.getMonth(), 1));
  }, [selectedDateObject]);

  useEffect(() => {
    if (selectedTimeSlot && !availableSlots.includes(selectedTimeSlot)) {
      form.setValue("timeSlot", "", { shouldValidate: true });
    }
  }, [availableSlots, form, selectedTimeSlot]);

  async function onSubmit(values: ConsultationFormValues) {
    const appointmentDate = parseISODate(values.consultationDate);

    if (!appointmentDate) {
      toast.error("Choose a valid consultation date.");
      return;
    }

    if (getStartOfDay(appointmentDate) < today) {
      toast.error("Choose a future consultation date.");
      return;
    }

    if (appointmentDate.getDay() === 0) {
      toast.error("Consultations are unavailable on Sundays.");
      return;
    }

    if (!availableSlots.includes(values.timeSlot)) {
      toast.error("That time slot is no longer available. Please pick another one.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as {
        success?: boolean;
        booking?: { reference: string };
        message?: string;
      };

      if (!response.ok || !payload.success || !payload.booking) {
        throw new Error(payload.message ?? "We could not save your consultation right now.");
      }

      const nextConsultation: StoredConsultation = {
        reference: payload.booking.reference,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        skinFocus: values.skinFocus,
        consultationDate: values.consultationDate,
        timeSlot: values.timeSlot,
        notes: values.notes?.trim() || undefined
      };

      const updatedConsultations = [...consultations, nextConsultation];
      setConsultations(updatedConsultations);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConsultations));
      setConfirmation(nextConsultation);

      toast.success("Consultation booked successfully", {
        description: `${formatDateLabel(values.consultationDate)} at ${values.timeSlot} has been reserved for ${values.fullName}.`
      });

      const nextDate = getNextAvailableDate();
      form.reset({
        fullName: "",
        email: "",
        phone: "",
        skinFocus: "",
        consultationDate: nextDate,
        timeSlot: "",
        notes: ""
      });
    } catch (error) {
      toast.error("Booking failed", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="border-[#eadfce] bg-[#fffdf9]">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfce] bg-[#faf6f1] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9c7530]">
            <CalendarDays className="h-3.5 w-3.5" />
            Consultation booking
          </div>
          <div className="space-y-2">
            <CardTitle>Reserve your skincare consultation</CardTitle>
            <CardDescription>
              Choose an available date from the calendar, pick an open time slot, and tell us what you want help with.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input placeholder="+234 801 234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skinFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main skin concern</FormLabel>
                      <FormControl>
                        <Input placeholder="Acne, dryness, dark spots..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="consultationDate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <FormLabel>Choose your date</FormLabel>
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4d8c8] bg-white text-[#6b4f3a] transition-colors hover:border-[#c9a84c] hover:text-[#9c7530] disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={!canGoBackMonth}
                          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                          type="button"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <p className="min-w-[11rem] text-center text-sm font-semibold text-foreground">
                          {MONTH_FORMATTER.format(viewMonth)}
                        </p>
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4d8c8] bg-white text-[#6b4f3a] transition-colors hover:border-[#c9a84c] hover:text-[#9c7530]"
                          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                          type="button"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-[#eadfce] bg-[#fcf8f3] p-4">
                      <div className="grid grid-cols-7 gap-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9c7f6e]">
                        {DAY_NAMES.map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>

                      <div className="mt-3 grid grid-cols-7 gap-2">
                        {calendarDays.map(({ date, isCurrentMonth }) => {
                          const isoDate = toISODate(date);
                          const isPast = getStartOfDay(date) < today;
                          const isSunday = date.getDay() === 0;
                          const isSelected = field.value === isoDate;
                          const disabled = !isCurrentMonth || isPast || isSunday;

                          return (
                            <button
                              className={cn(
                                "flex h-11 flex-col items-center justify-center rounded-xl border text-sm font-medium transition-all",
                                disabled
                                  ? "cursor-not-allowed border-transparent bg-transparent text-[#ccb9a7] opacity-55"
                                  : "border-[#e2d5c6] bg-white text-[#2c1f17] hover:border-[#c9a84c] hover:bg-[#fffaf1]",
                                isSelected && "border-[#9c7530] bg-[#2c1f17] text-white shadow-soft"
                              )}
                              disabled={disabled}
                              key={`${isoDate}-${isCurrentMonth ? "current" : "other"}`}
                              onClick={() => {
                                field.onChange(isoDate);
                                form.setValue("timeSlot", "", { shouldValidate: true });
                              }}
                              type="button"
                            >
                              <span>{date.getDate()}</span>
                              {isoDate === toISODate(today) ? <span className="text-[0.55rem] uppercase">Today</span> : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <FormDescription>Appointments run Monday to Saturday. Sundays are unavailable.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available time slots</FormLabel>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {availableSlots.length ? (
                        availableSlots.map((slot) => (
                          <button
                            className={cn(
                              "inline-flex h-11 items-center justify-center rounded-[12px] border px-4 text-sm font-semibold transition-all",
                              field.value === slot
                                ? "border-[#9c7530] bg-[#2c1f17] text-white shadow-soft"
                                : "border-[#e2d5c6] bg-white text-[#6b4f3a] hover:border-[#c9a84c] hover:text-[#2c1f17]"
                            )}
                            key={slot}
                            onClick={() => field.onChange(slot)}
                            type="button"
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <div className="rounded-[14px] border border-dashed border-[#e2d5c6] bg-[#faf6f1] px-4 py-5 text-sm text-[#8f7767] sm:col-span-2 lg:col-span-3">
                          No open slots for this date yet. Choose another day from the calendar above.
                        </div>
                      )}
                    </div>
                    <FormDescription>All consultations are scheduled in West Africa Time (WAT).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes for the consultation</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your current routine, sensitivities, products you already use, or questions you want answered."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional, but helpful for a more tailored session.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 border-t border-[#f0e6d8] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[#8f7767]">
                  Selected slot:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedDate ? `${formatDateLabel(selectedDate)}${selectedTimeSlot ? ` at ${selectedTimeSlot}` : ""}` : "Choose a date and time"}
                  </span>
                </div>
                <Button disabled={isSubmitting} size="lg" type="submit">
                  {isSubmitting ? "Booking..." : "Book Consultation"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-[#eadfce] bg-[#faf6f1]">
          <CardHeader className="pb-4">
            <CardTitle className="text-[1.65rem]">Session snapshot</CardTitle>
            <CardDescription>Your selection updates live as you build the appointment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#6b4f3a]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-white p-2 text-[#9c7530]">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Appointment date</p>
                <p>{selectedDateObject ? formatDateLabel(selectedDate) : "Choose a date from the calendar."}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-white p-2 text-[#9c7530]">
                <Clock3 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Open time slot</p>
                <p>{selectedTimeSlot || "Pick one of the available consultation windows."}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-white p-2 text-[#9c7530]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">What to expect</p>
                <p>Skin assessment, routine guidance, and a focused product recommendation plan.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#eadfce] bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-[1.65rem]">Before your session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-[#6b4f3a]">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-4 w-4 text-[#9c7530]" />
              <p>Come with your current routine, skin history, and any product reactions you have noticed.</p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-4 w-4 text-[#9c7530]" />
              <p>Choose a time slot early if you want the widest availability during the week.</p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-4 w-4 text-[#9c7530]" />
              <p>After booking, we hold that selected slot in your browser so it stops showing as available.</p>
            </div>
          </CardContent>
        </Card>

        {confirmation ? (
          <Card className="border-[#e5d1ba] bg-[linear-gradient(135deg,#fffdf8_0%,#f7efe4_100%)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-[1.65rem]">Booking confirmed</CardTitle>
              <CardDescription>Your consultation details are now saved in this browser session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-7 text-[#6b4f3a]">
              <p>
                <span className="font-semibold text-foreground">Reference:</span> {confirmation.reference}
              </p>
              <p>
                <span className="font-semibold text-foreground">Date:</span> {formatDateLabel(confirmation.consultationDate)}
              </p>
              <p>
                <span className="font-semibold text-foreground">Time:</span> {confirmation.timeSlot}
              </p>
              <p>
                <span className="font-semibold text-foreground">Concern:</span> {confirmation.skinFocus}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
