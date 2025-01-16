
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { states } from "../../../../lib/schema";
import { eq,asc } from "drizzle-orm";
export async function GET(req: NextRequest) {
    const country = req.nextUrl.searchParams.get("country");
    const query=await db.select().from(states).where(eq(states.country_id, Number(country))).orderBy(asc(states.name));
    
    return NextResponse.json(query, { status: 200 });
    
    
    }