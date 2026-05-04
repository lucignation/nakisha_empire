import { NextResponse } from "next/server";
import { z } from "zod";

const consultationRequestSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  skinFocus: z.string().min(3),
  consultationDate: z.string().min(10),
  timeSlot: z.string().min(3),
  notes: z.string().max(500).optional()
});

function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, 12);
}

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function POST(request: Request) {
  try {
    const body = consultationRequestSchema.parse(await request.json());
    const appointmentDate = parseISODate(body.consultationDate);

    if (!appointmentDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Choose a valid consultation date."
        },
        { status: 400 }
      );
    }

    if (getStartOfDay(appointmentDate) < getStartOfDay(new Date())) {
      return NextResponse.json(
        {
          success: false,
          message: "Consultation dates must be today or later."
        },
        { status: 400 }
      );
    }

    if (appointmentDate.getDay() === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Consultations are unavailable on Sundays."
        },
        { status: 400 }
      );
    }

    const reference = `NE-CONS-${Date.now().toString().slice(-8)}`;

    return NextResponse.json({
      success: true,
      booking: {
        reference,
        ...body
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid consultation booking details.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected consultation booking error."
      },
      { status: 500 }
    );
  }
}
