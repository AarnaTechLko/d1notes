import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { playerEvaluation, users, coaches } from '../../../../../lib/schema';
import { eq, and } from 'drizzle-orm';
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const evaluationId = searchParams.get('evaluationId');
  
      const evaluationsData = await db
        .select({
          first_name: users.first_name,
          last_name: users.last_name,
          position: users.position,
          number: users.number,
          image: users.image,
          team: users.team,
          playerId: users.id, // Select specific columns from users
          coachId: coaches.id,
          coachName: coaches.firstName,
          coachPhoto: coaches.image,
          expectedCharge: coaches.expectedCharge,
          evaluationId: playerEvaluation.id, // Select specific columns from playerEvaluation
          review_title: playerEvaluation.review_title, 
          turnaroundTime: playerEvaluation.turnaroundTime, 
          evaluationStatus: playerEvaluation.status,
          video_description:playerEvaluation.video_description,
          createdAt: playerEvaluation.created_at,
          updatedAt: playerEvaluation.updated_at,
          primary_video_link:playerEvaluation.primary_video_link,
          video_link_two:playerEvaluation.video_link_two,
          video_link_three:playerEvaluation.video_link_three,
          created_at:playerEvaluation.created_at,
          percentage:playerEvaluation.percentage,
          lighttype:playerEvaluation.lighttype,
          evaluationposition:playerEvaluation.position,
          id:playerEvaluation.id
          ,
        })
        .from(playerEvaluation)
        .innerJoin(users, eq(playerEvaluation.player_id, users.id)) // Assuming player_id is the foreign key in playerEvaluation
        .innerJoin(coaches, eq(playerEvaluation.coach_id, coaches.id)) // Assuming coach_id is the foreign key in playerEvaluation
        .where(eq(playerEvaluation.id, Number(evaluationId))
        )
       
        .execute();
  
      return NextResponse.json(evaluationsData[0]);
  
    } catch (error) {
      return NextResponse.json({ message: error }, { status: 500 });
    }
  }