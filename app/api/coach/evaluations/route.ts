// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { playerEvaluation, users, coaches } from '../../../../lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { coachId, status } = await req.json();

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
        evaluationStatus: playerEvaluation.status,
        video_description:playerEvaluation.video_description,
        createdAt: playerEvaluation.created_at,
        updatedAt: playerEvaluation.updated_at,
        primary_video_link:playerEvaluation.primary_video_link,
        video_link_two:playerEvaluation.video_link_two,
        video_link_three:playerEvaluation.video_link_three,
        created_at:playerEvaluation.created_at,
      })
      .from(playerEvaluation)
      .innerJoin(users, eq(playerEvaluation.player_id, users.id)) // Assuming player_id is the foreign key in playerEvaluation
      .innerJoin(coaches, eq(playerEvaluation.coach_id, coaches.id)) // Assuming coach_id is the foreign key in playerEvaluation
      .where(
        and(
          eq(playerEvaluation.coach_id, coachId),
          eq(playerEvaluation.status, status)
        )
      )
      .limit(10) // Limit the number of results to 10
      .execute();

    return NextResponse.json(evaluationsData);

  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { evaluationId, status } = await req.json();
    const parsedEvaluationId = parseInt(evaluationId, 10);

    const result = await db
      .update(playerEvaluation)
      .set({ status: status || undefined }) // Set the new status value
      .where(eq(playerEvaluation.id, parsedEvaluationId)) // Condition for evaluation ID
      .returning();

    return NextResponse.json("Success");

  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const coachId = Number(url.searchParams.get('coachId'));
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search') || '';
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const sort = url.searchParams.get('sort') || '';

    if (isNaN(coachId)) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Define an initial condition with the playerId
    const conditions = [eq(playerEvaluation.coach_id, coachId)];

    // Conditionally add status filter
    if (status) {
      const parsedStatus = parseInt(status, 10); // Convert status to a number
      if (!isNaN(parsedStatus)) {
        conditions.push(eq(playerEvaluation.status, parsedStatus));
      } else {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
    }

    // Combine all conditions using `and()`
    const queryCondition = and(...conditions);

    // Execute the query with the combined condition
    let query = db
      .select({
        firstName: users.first_name,
        lastName: users.last_name,
        evaluationId: playerEvaluation.id, // Select specific columns
        review_title: playerEvaluation.review_title,
        primary_video_link: playerEvaluation.primary_video_link,
        evaluationStatus: playerEvaluation.status,
        created_at: playerEvaluation.created_at,
        video_link_two: playerEvaluation.video_link_two,
        video_link_three: playerEvaluation.video_link_three,
        status: playerEvaluation.status,
        video_description: playerEvaluation.video_description,
      })
      .from(playerEvaluation)
      .innerJoin(users, eq(playerEvaluation.player_id, users.id))
      .where(queryCondition)
      .limit(limit);

    const evaluationsData = await query.execute();
    let filteredData = evaluationsData;

    // Filter data based on search
    if (search) {
      filteredData = filteredData.filter(item =>
        (item.firstName?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
        (item.lastName?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
        (item.review_title?.toLowerCase() ?? '').includes(search.toLowerCase())
      );
    }

    // Sort data
    if (sort) {
      const [key, order] = sort.split(',') as [keyof typeof evaluationsData[0], string];

      // Define a safe sort function
      filteredData.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (order === 'asc') {
          return valA! > valB! ? 1 : -1;
        }
        return valA! < valB! ? 1 : -1;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: paginatedData,
      total: filteredData.length,
    });
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

