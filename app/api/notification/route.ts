import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // adjust as per your setup
import { admin_message } from '../../../lib/schema';
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const messages = await db
      .select()
      .from(admin_message)
      .where(eq(admin_message.receiver_id, Number(userId)))
      .orderBy(desc(admin_message.created_at));

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching admin messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
