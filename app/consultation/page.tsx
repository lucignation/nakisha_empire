import { CalendarDays, ClipboardList, Sparkles } from "lucide-react";
import ConsultationBookingForm from "@/components/consultation-booking-form";
import PageHero from "@/components/page-hero";
import Reveal from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Consultation"
};

const consultationBenefits = [
  {
    title: "Choose your slot",
    copy: "Book directly from the calendar and only see time slots that are still open for the selected day.",
    icon: CalendarDays
  },
  {
    title: "Share your concerns",
    copy: "Add your skin goals, current issues, and routine notes before the session so the consultation starts focused.",
    icon: ClipboardList
  },
  {
    title: "Get tailored guidance",
    copy: "Each session is structured around your skin priorities and the products or routine changes that make sense for you.",
    icon: Sparkles
  }
];

export default function ConsultationPage() {
  return (
    <>
      <PageHero
        chips={["Calendar booking", "Available time slots", "Instant confirmation"]}
        description="Choose a date from the consultation calendar, pick an available time, and send your details in one clean booking flow."
        eyebrow="Personalized Support"
        title={"Book a Personal<br />Skin Consultation"}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="container space-y-6">
          <Reveal>
            <div className="grid gap-4 lg:grid-cols-3">
              {consultationBenefits.map(({ title, copy, icon: Icon }, index) => (
                <Reveal delay={index * 80} key={title}>
                  <Card className="border-[#eadfce] bg-[#faf6f1]">
                    <CardContent className="flex h-full gap-4 p-5">
                      <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#9c7530] shadow-soft">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                        <p className="text-sm leading-7 text-[#6b4f3a]">{copy}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ConsultationBookingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
