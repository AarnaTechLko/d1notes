import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/db";
import { ip_logs } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = Number(session.user.id); // or use as string if it's UUID
  const logoutTime = new Date();

  const existing = await db
    .select()
    .from(ip_logs)
    .where(and(eq(ip_logs.userId, userId), isNull(ip_logs.logout_time)));

  if (existing.length === 0) {
    return NextResponse.json({ error: "No active login found." }, { status: 404 });
  }

  // ✅ Update logout_time and nullify login_time
  await db
    .update(ip_logs)
    .set({
      logout_time: logoutTime,
    })
    .where(and(eq(ip_logs.userId, userId), isNull(ip_logs.logout_time)));

  return NextResponse.json({ success: true });
}
