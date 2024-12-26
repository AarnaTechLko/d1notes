// app/api/evaluation/save/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db'; // Import your Drizzle ORM database instance
import { coachaccount, coachearnings, evaluationResults, playerEvaluation } from '@/lib/schema';
import { eq,sum } from 'drizzle-orm';
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
            finalRemarks, 
            document 
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
                document: document,
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
                document: document,
              }).returning();
        }
        
        let totalAmount;
       if(status)
       {
       
        const updateEvaluation = await db
            .update(playerEvaluation)
            .set({
                status: 4  
            })
            .where(eq(playerEvaluation.id, evaluationId))  
            .returning();
       

        }
        else{
            const updateEvaluation = await db
            .update(playerEvaluation)
            .set({
                status: 2  
            })
            .where(eq(playerEvaluation.id, evaluationId))  
            .returning();

            await db
                .update(coachearnings)
                .set({
                    status: 'Completed'
                })
                .where(eq(coachearnings.evaluation_id, evaluationId))
                .returning();
        }
        
        return NextResponse.json({ success: "success"});
    } catch (error) {
        console.error('Error saving evaluation results:', error);
        return NextResponse.json({ success: false, error: "Error in inserting data" }, { status: 500 });
    }
}
