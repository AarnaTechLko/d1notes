// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { playerEvaluation, users, coaches, payments } from '../../../lib/schema'
import { like } from 'drizzle-orm';
import { eq, sql, desc } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { and } from 'drizzle-orm';
import next from 'next';





export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;

    const playerId = Number(url.searchParams.get('playerId'));

    const search = url.searchParams.get('search') || '';
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const sort = url.searchParams.get('sort') || '';

    if (isNaN(playerId)) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Build the initial query
    let query = db
      .select({
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        review_title: playerEvaluation.review_title,
        amount: payments.amount,
        status: payments.status,
        created_at: payments.created_at,
        currency: payments.currency,
        slug: coaches.slug,
        image: coaches.image

      })
      .from(payments)
      .leftJoin(coaches, eq(
        sql`CAST(${coaches.id} AS TEXT)`, // Cast the integer to text if needed
        sql`CAST(${payments.coach_id} AS TEXT)` // Cast the other field as text
      ))
      .leftJoin(playerEvaluation, eq(playerEvaluation.id, payments.evaluation_id)).orderBy(desc(payments.id));

    const evaluationsData = await query.where(eq(payments.player_id, playerId)).limit(limit).execute();

    let filteredData = evaluationsData;



    return NextResponse.json({
      data: filteredData,
      total: filteredData.length,
    });
  } catch (error) {
    console.error('Error details:', error); // Log the error for debugging
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}