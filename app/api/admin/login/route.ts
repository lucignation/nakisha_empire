import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  markAdminLogin,
  validateSuperAdminCredentials
} from "@/lib/server/admin-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());

    if (!(await validateSuperAdminCredentials(body.email, body.password))) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid super-admin credentials."
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true
    });

    await markAdminLogin(body.email);

    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(body.email), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected admin login error."
      },
      { status: 500 }
    );
  }
}
