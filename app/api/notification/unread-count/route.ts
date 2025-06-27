import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin_message } from "@/lib/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const unreadCountResult = await db
      .select({ count: count() })
      .from(admin_message)
      .where(and(
        eq(admin_message.receiver_id, Number(userId)),
        eq(admin_message.read, 0)
      ));

    const unreadCount = unreadCountResult[0]?.count ?? 0;

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
