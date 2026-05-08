import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";

const updatePromoSchema = z.object({
  isActive: z.boolean()
});

interface RouteContext {
  params: {
    id: string;
  };
}

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    if (!getAdminSessionFromCookies()) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, message: "DATABASE_URL is missing. Connect Neon before updating promo codes." },
        { status: 500 }
      );
    }

    const body = updatePromoSchema.parse(await request.json());

    await prisma.promoCode.update({
      where: { id: context.params.id },
      data: {
        isActive: body.isActive
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Promo update payload is invalid.", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unexpected promo update error." },
      { status: 500 }
    );
  }
}
