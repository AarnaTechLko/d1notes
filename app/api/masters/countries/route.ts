
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import {countries} from "../../../../lib/schema";
import { eq,asc,sql } from "drizzle-orm";


export async function GET(req: NextRequest) {
    const query = await db
      .select()
      .from(countries)
      .orderBy(
        sql`CASE WHEN ${countries.name} = 'United States' THEN 0 ELSE 1 END`,
        asc(countries.name)
      );
  
    return NextResponse.json(query, { status: 200 });
  }