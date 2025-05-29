import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { playerEvaluation, coaches, payments } from '../../../lib/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;

    const playerId = Number(url.searchParams.get('playerId'));
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    if (isNaN(playerId)) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Query with is_deleted = 1 filter
    const evaluationsData = await db
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
        sql`CAST(${coaches.id} AS TEXT)`,
        sql`CAST(${payments.coach_id} AS TEXT)`
      ))
      .leftJoin(playerEvaluation, eq(playerEvaluation.id, payments.evaluation_id))
      .where(
        and(
          eq(payments.player_id, playerId),
          eq(payments.is_deleted, 1) // Show only deleted coaches
        )
      )
      .orderBy(desc(payments.id))
      .limit(limit)
      .execute();

    return NextResponse.json({
      data: evaluationsData,
      total: evaluationsData.length,
    });
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}
