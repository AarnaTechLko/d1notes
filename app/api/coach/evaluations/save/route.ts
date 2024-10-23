// app/api/evaluation/save/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db'; // Import your Drizzle ORM database instance
import { evaluationResults, playerEvaluation } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server'; // Import NextRequest

export async function POST(req: NextRequest) {
    try {
        const url = req.nextUrl;
  const status = url.searchParams.get('status'); 
        const data = await req.json();
        const { 
            evaluationId, 
            playerId, 
            coachId, 
            technicalScores, 
            tacticalScores, 
            physicalScores, 
            technicalRemarks, 
            tacticalRemarks, 
            physicalRemarks, 
            finalRemarks 
        } = data;

    
        const existingData = await db.select().from(evaluationResults).where(eq(evaluationResults.evaluationId,evaluationId)).limit(1)  // Limit to 1 record
        .execute();
        
        
        if(existingData.length > 0)
        { 
            const insertedData = await db.update(evaluationResults).set({
                evaluationId: evaluationId,
                playerId: playerId,
                coachId: coachId,
                technicalScores: technicalScores,
                tacticalScores: tacticalScores,
                physicalScores: physicalScores,
                technicalRemarks: technicalRemarks,
                tacticalRemarks: tacticalRemarks,
                physicalRemarks: physicalRemarks,
                finalRemarks: finalRemarks,
              }).returning();
        }
        else
        {
            const insertedData = await db.insert(evaluationResults).values({
                evaluationId: evaluationId,
                playerId: playerId,
                coachId: coachId,
                technicalScores: technicalScores,
                tacticalScores: tacticalScores,
                physicalScores: physicalScores,
                technicalRemarks: technicalRemarks,
                tacticalRemarks: tacticalRemarks,
                physicalRemarks: physicalRemarks,
                finalRemarks: finalRemarks,
              }).returning();
        }
        

       if(status)
       {
        const updateEvaluation = await db
            .update(playerEvaluation)
            .set({
                status: 4 // Assuming 2 means "completed" or some status
            })
            .where(eq(playerEvaluation.id, evaluationId)) // Update by evaluation ID
            .returning();
        }
        else{
            const updateEvaluation = await db
            .update(playerEvaluation)
            .set({
                status: 2 // Assuming 2 means "completed" or some status
            })
            .where(eq(playerEvaluation.id, evaluationId)) // Update by evaluation ID
            .returning();
        }
        // Return a success response
        return NextResponse.json({ success: "success"});
    } catch (error) {
        console.error('Error saving evaluation results:', error);
        return NextResponse.json({ success: false, error: "Error in inserting data" }, { status: 500 });
    }
}
