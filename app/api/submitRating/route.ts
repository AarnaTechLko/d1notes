import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { playerEvaluation, coaches, coachearnings, coachaccount } from '../../../lib/schema';
import { eq, avg, sum } from 'drizzle-orm';
import debug from 'debug';


export async function PUT(req: NextRequest) {
  const logError = debug('app:error');

  try {
    // Parse the request body
    const body = await req.json();
    const { evaluationId, rating, remarks } = body;

    const evaluationIdNumber = Number(evaluationId);
    if (isNaN(evaluationIdNumber)) {
      return NextResponse.json({ message: 'Invalid evaluationId' }, { status: 400 });
    }

    // Update the user in the database
    const updatedUser = await db
      .update(playerEvaluation)
      .set({
        rating: rating || undefined,
        remarks: remarks || undefined,
      })
      .where(eq(playerEvaluation.id, evaluationIdNumber))
      .returning({
        coach_id: playerEvaluation.coach_id, // Return the coach_id
      });

    const coach_id = Number(updatedUser[0].coach_id);
    if (isNaN(coach_id)) {
      return NextResponse.json({ message: 'Invalid coach_id' }, { status: 400 });
    }

    const result = await db
      .select({
        averageRating: avg(playerEvaluation.rating),
      })
      .from(playerEvaluation)
      .where(eq(playerEvaluation.coach_id, coach_id));

    const averageRating = result[0]?.averageRating || 0;

    const updateCoaches = await db
    .update(coaches)
    .set({
      rating: parseFloat(Number(averageRating).toFixed()), // Ensure averageRating is a number
    })
    .where(eq(coaches.id, coach_id))
    .returning();


    return NextResponse.json({ message: true }, { status: 200 });

  } catch (error:any) {
    
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

