// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { playerEvaluation, users, coaches, messages, chats } from '../../../../lib/schema';
import { eq, and,sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  try {
    const { coachId, status } = await req.json();
 
    await db
    .update(playerEvaluation)
    .set({ status: 3 }) // Update status to 3
    .where(
      sql`(EXTRACT(EPOCH FROM (NOW() - ${playerEvaluation.created_at})) / 3600 > CAST(NULLIF(${playerEvaluation.turnaroundTime}, '') AS INTEGER))
          AND (${playerEvaluation.status} = 0 OR ${playerEvaluation.status} = 1)`
    );
  
    const evaluationsData = await db
      .select({
        first_name: users.first_name,
        last_name: users.last_name,

        number: users.number,
        image: users.image,
        team: users.team,
        playerSlug: users.slug,
        playerId: users.id, // Select specific columns from users
        coachId: coaches.id,
        coachName: coaches.firstName,
        coachPhoto: coaches.image,
        expectedCharge: coaches.expectedCharge,
        evaluationId: playerEvaluation.id, // Select specific columns from playerEvaluation
        review_title: playerEvaluation.review_title,
        turnaroundTime: playerEvaluation.turnaroundTime,
        evaluationStatus: playerEvaluation.status,
        video_description: playerEvaluation.video_description,
        video_descriptionTwo: playerEvaluation.video_descriptionTwo,
        video_descriptionThree: playerEvaluation.video_descriptionThree,
        createdAt: playerEvaluation.created_at,
        updatedAt: playerEvaluation.updated_at,
        primary_video_link: playerEvaluation.primary_video_link,
        video_link_two: playerEvaluation.video_link_two,
        video_link_three: playerEvaluation.video_link_three,
        created_at: playerEvaluation.created_at,
        percentage: playerEvaluation.percentage,
        lighttype: playerEvaluation.lighttype,
        evaluationposition: playerEvaluation.position,
        id: playerEvaluation.id,
        videoOneTiming: playerEvaluation.videoOneTiming,
        videoTwoTiming: playerEvaluation.videoTwoTiming,
        videoThreeTiming: playerEvaluation.videoThreeTiming,
        accepted_at: playerEvaluation.accepted_at,
        positionOne: playerEvaluation.positionOne,
        positionTwo: playerEvaluation.positionTwo,
        positionThree: playerEvaluation.positionThree,
        jerseyNumber: playerEvaluation.jerseyNumber,
        jerseyNumberTwo: playerEvaluation.jerseyNumberTwo,
        jerseyNumberThree: playerEvaluation.jerseyNumberThree,
        jerseyColorOne: playerEvaluation.jerseyColorOne,
        jerseyColorTwo: playerEvaluation.jerseyColorTwo,
        jerseyColorThree: playerEvaluation.jerseyColorThree,



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
      .orderBy(playerEvaluation.updated_at)
      .limit(10) // Limit the number of results to 10
      .execute();

    return NextResponse.json(evaluationsData);

  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { evaluationId, status, remark } = await req.json();
    const parsedEvaluationId = parseInt(evaluationId, 10);

    const evaluationData = await db.select().from(playerEvaluation).where(eq(playerEvaluation.id, parsedEvaluationId));
    let playerId = evaluationData[0].player_id;
    let requestToID = evaluationData[0].coach_id;
    const currentDateTime = new Date();
    const result = await db
      .update(playerEvaluation)
      .set({ status: status || undefined, rejectremarks: remark || undefined, accepted_at: currentDateTime }) // Set the new status value
      .where(eq(playerEvaluation.id, parsedEvaluationId)) // Condition for evaluation ID
      .returning();

    let chatFriend: any = {
      playerId: playerId,
      coachId: requestToID,
      club_id: 0
    };

    let message;
    let mailmessage;
    let subject;
    const insertChatfriend = await db.insert(chats).values(chatFriend).returning();

    const coachData = await db.select().from(coaches).where(eq(coaches.id, requestToID));
    const playerData = await db.select().from(users).where(eq(users.id, playerId));

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    if (status === 1) {
      message = "Hi! I have accepted your Evaluation Request!";
      subject = `D1 NOTES Evaluation Request Accepted by ${coachData[0].firstName}`;
      
      mailmessage=`Dear ${playerData[0].first_name}! Your evaluation request was accepted by ${coachData[0].firstName}. <a href="${baseUrl}/login" style="font-weight: bold; color: blue;">Login</a> to your player account and view your Dashboard to track the progress and check any Messages. <p>Regards<br>D1 Notes Team</p>`;
    }
    if (status === 3) {
      subject = `D1 NOTES Evaluation Request Declined by ${coachData[0].firstName}`;
      message = "Sorry! Right now I am unable to accept your evaluation request. Reason :" + remark;
      mailmessage=`Dear ${playerData[0].first_name}! Your evaluation request was declined by ${coachData[0].firstName}. <a href="${baseUrl}/login" style="font-weight: bold; color: blue;">Login</a> to your player account and check for any Messages from Dinesh.
      <p  className="mt-10">Regards<br>D1 Notes Team</p>`;
    }


    let userValues: any = {
      senderId: requestToID,
      chatId: insertChatfriend[0].id,
      message: message,
      club_id: 0
    };

    const insertedUser = await db.insert(messages).values(userValues).returning();


    const emailResultPlayer = await sendEmail({
      to: playerData[0].email,
      subject: "D1 NOTES Evaluation Request Update",
      text: "D1 NOTES Evaluation Request Update",
      html: mailmessage || '',
    });

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
        rejectremarks: playerEvaluation.rejectremarks,
        player_id: playerEvaluation.player_id,
        video_description: playerEvaluation.video_description,
        turnaroundTime: playerEvaluation.turnaroundTime,
        id: playerEvaluation.id,
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

