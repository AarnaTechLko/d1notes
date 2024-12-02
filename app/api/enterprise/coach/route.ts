import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq,and,not, isNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const enterpriseId = url.searchParams.get("enterprise_id");

    if (!enterpriseId) {
      return NextResponse.json(
        { error: "Coach ID is required" },
        { status: 400 }
      );
    }
  const data = await db.select().from(coaches)
  .where(
    and(
        eq(coaches.enterprise_id,enterpriseId),
        not(isNull(coaches.firstName)) 
  ));

  return NextResponse.json(data);
}