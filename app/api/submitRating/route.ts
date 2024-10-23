import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { playerEvaluation, coaches } from '../../../lib/schema';
import { eq,avg } from 'drizzle-orm';
import debug from 'debug';
 

export async function PUT(req: NextRequest) {
  const logError = debug('app:error');

  try {
    // Parse the request body
    const body = await req.json();

    
    const {
      evaluationId,
      rating,
      remarks
    } = body;

    // Update the user in the database
    const updatedUser = await db
      .update(playerEvaluation)
      .set({
        rating: rating || undefined,
        remarks: remarks || undefined,
         
      })
      .where(eq(playerEvaluation.id,evaluationId))  
      .returning({
        coach_id: playerEvaluation.coach_id, // Return the coach_id
      });

      const coach_id=updatedUser[0].coach_id;
 
      const result = await db
      .select({
        averageRating: avg(playerEvaluation.rating),  
      })
      .from(playerEvaluation)  
      .where(eq(playerEvaluation.coach_id, coach_id));
  
    const averageRating= result[0]?.averageRating || 0;  
 

    const updateCoaches = await db
      .update(coaches)
      .set({
        rating: Number(averageRating),
      })
      .where(eq(coaches.id,coach_id))  
      .returning();

    return NextResponse.json({ message:true}, { status: 200 });

  } catch (error) {
    logError('Error updating user: %O', error);
    return NextResponse.json({ message: 'Error updating' }, { status: 500 });
  }
}
