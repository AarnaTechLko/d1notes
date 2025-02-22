// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { playerEvaluation, users, coaches } from '../../../lib/schema'
import { like } from 'drizzle-orm';
import { eq,or,desc } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { and } from 'drizzle-orm';
import next from 'next';
import { turnAroundTime } from '@/lib/constants';




export async function POST(req: NextRequest) {
  try {
    const { userId, status } = await req.json();

    const evaluationsData = await db
      .select({
        evaluationId:playerEvaluation.id,
        first_name: coaches.firstName,
        last_name: coaches.lastName,
        image: coaches.image,
        review_title: playerEvaluation.review_title,
        primary_video_link: playerEvaluation.primary_video_link,
        video_link_two: playerEvaluation.video_link_two,
        video_link_three: playerEvaluation.video_link_three,
        video_description: playerEvaluation.video_description,
        status: playerEvaluation.status,
        payment_status: playerEvaluation.payment_status,
        turnaroundTime: playerEvaluation.turnaroundTime,
        created_at: playerEvaluation.created_at,
        createdAt: playerEvaluation.created_at,
        updated_at: playerEvaluation.updated_at,
        videoOneTiming: playerEvaluation.videoOneTiming,
        videoTwoTiming: playerEvaluation.videoTwoTiming,
        videoThreeTiming: playerEvaluation.videoThreeTiming,
        accepted_at: playerEvaluation.accepted_at,
        slug: coaches.slug,
      })
      .from(playerEvaluation)  // This selects from the `playerEvaluation` table
      .innerJoin(coaches, eq(playerEvaluation.coach_id, coaches.id)) // Inner join with the `users` table
      .where(
        or(
          and(
            eq(playerEvaluation.player_id, userId),   // First condition
            eq(playerEvaluation.status, status)       // Second condition
          ),
          and(
            eq(playerEvaluation.parent_id, userId),   // First condition
            eq(playerEvaluation.status, status)       // Second condition
          )     // OR condition
        )
      )
      .orderBy(desc(playerEvaluation.id))
      .execute();

    return NextResponse.json(evaluationsData);
  } catch (error) {
    return NextResponse.json(
      { message: "Error in fecthing data" },
      { status: 500 }
    );
  }
}


 

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;

    const playerId = Number(url.searchParams.get('playerId'));
    const status = url.searchParams.get('status'); // status may or may not be present
    const search = url.searchParams.get('search') || '';
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const sort = url.searchParams.get('sort') || '';

    if (isNaN(playerId)) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

     
    const conditions = [
      or(
        eq(playerEvaluation.player_id, playerId),
        eq(playerEvaluation.parent_id, playerId)
      ),
    ];

     
    if (status) {
      conditions.push(eq(playerEvaluation.status, Number(status)));
    }

    
    const query = db
      .select({
        id:playerEvaluation.id,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        review_title: playerEvaluation.review_title,
        primary_video_link: playerEvaluation.primary_video_link,
        video_link_two: playerEvaluation.video_link_two,
        video_link_three: playerEvaluation.video_link_three,
        video_description: playerEvaluation.video_description,
        turnaroundTime: playerEvaluation.turnaroundTime,
        status: playerEvaluation.status,
        payment_status: playerEvaluation.payment_status,
        created_at: playerEvaluation.created_at,
        updated_at: playerEvaluation.updated_at,
        videoOneTiming: playerEvaluation.videoOneTiming,
        videoTwoTiming: playerEvaluation.videoTwoTiming,
        videoThreeTiming: playerEvaluation.videoThreeTiming,
      })
      .from(playerEvaluation)
      .innerJoin(coaches, eq(playerEvaluation.coach_id, coaches.id))
      .where(and(...conditions)) // Apply the conditions array
      .limit(limit);

    const evaluationsData = await query.execute();

    let filteredData = evaluationsData;

    // Additional filtering and sorting logic can go here...

    return NextResponse.json({
      data: filteredData,
      total: filteredData.length,
    });
  } catch (error) {
    console.error('Error details:', error); // Log the error for debugging
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
