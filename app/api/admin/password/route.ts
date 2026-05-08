import { NextResponse } from "next/server";
import { z } from "zod";
import { changeSuperAdminPassword, getAdminSessionFromCookies } from "@/lib/server/admin-auth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    nextPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((value) => value.nextPassword === value.confirmPassword, {
    message: "New password and confirmation do not match.",
    path: ["confirmPassword"]
  });

export async function POST(request: Request) {
  try {
    const session = getAdminSessionFromCookies();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized."
        },
        { status: 401 }
      );
    }

    const body = changePasswordSchema.parse(await request.json());

    await changeSuperAdminPassword({
      email: session.email,
      currentPassword: body.currentPassword,
      nextPassword: body.nextPassword
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Password update payload is invalid.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected password update error."
      },
      { status: 500 }
    );
  }
}
