// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { playerEvaluation, users, coaches, evaluationResults } from '../../../lib/schema'
import { like } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { and } from 'drizzle-orm';
import next from 'next';


 

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;

    const evaluationId = Number(url.searchParams.get('evaluationId'));
    const result = await db
    .select({
        finalRemarks: evaluationResults.finalRemarks,
        physicalRemarks: evaluationResults.physicalRemarks,
        tacticalRemarks: evaluationResults.tacticalRemarks,
        technicalRemarks: evaluationResults.technicalRemarks,
        physicalScores: evaluationResults.physicalScores,
        tacticalScores: evaluationResults.tacticalScores,
        technicalScores: evaluationResults.technicalScores,
        sport: evaluationResults.sport,
        position: evaluationResults.position,
 

        organizationScores: evaluationResults.organizationScores,
        distributionScores: evaluationResults.distributionScores,
        organizationalRemarks: evaluationResults.organizationalRemarks,
        distributionRemarks: evaluationResults.distributionRemarks,
        document: evaluationResults.document,
        thingsToWork: evaluationResults.thingsToWork,
       
        evaluationId: playerEvaluation.id,
        playerId: playerEvaluation.player_id,
        reviewTitle: playerEvaluation.review_title,
        primaryVideoLink: playerEvaluation.primary_video_link,
        videoLinkTwo: playerEvaluation.video_link_two,
        videoLinkThree: playerEvaluation.video_link_three,
        videoDescription: playerEvaluation.video_description,
        coachId: playerEvaluation.coach_id,
        status: playerEvaluation.status,
        paymentStatus: playerEvaluation.payment_status,
        createdAt: playerEvaluation.created_at,
        updatedAt: playerEvaluation.updated_at,
        first_name:users.first_name,
        last_name:users.last_name,
        image:users.image,
        coachimage:coaches.image,
       
        team:users.team,
        number:users.number,
        primary_video_link:playerEvaluation.primary_video_link,
        video_link_two:playerEvaluation.video_link_two,
        video_link_three:playerEvaluation.video_link_three,
        video_description:playerEvaluation.video_description,
        video_descriptionTwo:playerEvaluation.video_descriptionTwo,
        video_descriptionThree:playerEvaluation.video_descriptionThree,
        rating:playerEvaluation.rating,
        evaluationposition:playerEvaluation.position, 
        videoOneTiming: playerEvaluation.videoOneTiming,
        videoTwoTiming: playerEvaluation.videoTwoTiming,
        videoThreeTiming: playerEvaluation.videoThreeTiming,
        coachFirstName:coaches.firstName,
        coachLastName:coaches.lastName,
        coachSlug:coaches.slug,
        playerSlug:users.slug,
        updated_at:playerEvaluation.updated_at,
        positionOne: playerEvaluation.positionOne,
        positionTwo: playerEvaluation.positionTwo,
        positionThree: playerEvaluation.positionThree,
        jerseyNumber: playerEvaluation.jerseyNumber,
        jerseyNumberTwo: playerEvaluation.jerseyNumberTwo,
        jerseyNumberThree: playerEvaluation.jerseyNumberThree,
        jerseyColorOne: playerEvaluation.jerseyColorOne,
        jerseyColorTwo: playerEvaluation.jerseyColorTwo,
        jerseyColorThree: playerEvaluation.jerseyColorThree,
    }) // Explicitly select the fields
    .from(evaluationResults)
    .innerJoin(playerEvaluation, eq(playerEvaluation.id, evaluationResults.evaluationId))
    .innerJoin(users, eq(users.id, evaluationResults.playerId))
    .innerJoin(coaches, eq(coaches.id, evaluationResults.coachId))
    .where(eq(evaluationResults.evaluationId,evaluationId)) // Spread the conditions array
    .limit(1)
    .execute();

    return NextResponse.json({
      result: result[0],
       
    });
  } catch (error) {
    console.error('Error details:', error); // Log the error for debugging
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}