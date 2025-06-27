import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin_message } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    await db
      .update(admin_message)
      .set({ read: 1 })
      .where(eq(admin_message.receiver_id, Number(user_id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
