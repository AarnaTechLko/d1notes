import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db'; // Adjust the import based on your file structure
import { playerEvaluation } from '../../../lib/schema'; // Adjust if necessary
import { eq, or } from 'drizzle-orm';
import { and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log('Request body:', body); // Log the incoming request body

    try {
        const { reviewTitle, primaryVideoUrl, videoUrl2, videoUrl3, videoDescription, coachId, playerId, turnaroundTime, status, child, videoOneTiming,
            videoTwoTiming,
            videoThreeTiming,
            position,
            lighttype } = body;
        let player_id;
        let parent_id;
        if (child) {
            player_id = child;
            parent_id = playerId;
        }
        else {
            player_id = playerId;
            parent_id = null
        }
        const checkRejection = await db.select().from(playerEvaluation).where(
            and(
                or(
                    eq(playerEvaluation.player_id, player_id),
                    eq(playerEvaluation.parent_id, player_id)
                ),
                eq(playerEvaluation.status, 3),
                eq(playerEvaluation.coach_id, coachId)
            )
        );

        if (checkRejection.length > 0) {
            return NextResponse.json({ message: "You can not send Evaluation Request to this coach as this coach has rejected your request 3 Times." }, { status: 500 });
        }

        const result = await db.insert(playerEvaluation).values({
            player_id: player_id,
            parent_id: parent_id,
            review_title: reviewTitle,
            primary_video_link: primaryVideoUrl,
            video_link_two: videoUrl2,
            video_link_three: videoUrl3,
            video_description: videoDescription, 
            turnaroundTime: turnaroundTime,
            coach_id: coachId,
            status: 0, 
            payment_status: status,
            videoOneTiming:videoOneTiming,
            videoTwoTiming:videoTwoTiming,
            videoThreeTiming:videoThreeTiming,
            position:position,
            lighttype:lighttype,
            created_at: new Date(),
            updated_at: new Date(),
        }).returning();

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error('Error during insertion:', error); // Log the error for debugging
        return NextResponse.json({ message: body }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const playerId = url.searchParams.get('playerId')?.trim();
    const status = url.searchParams.get('status')?.trim();

    try {
        // Ensure playerId is a number
        const numericPlayerId = playerId ? parseInt(playerId, 10) : null;

        // Ensure status is a number
        const numericStatus = status ? parseInt(status, 10) : null;

        // Check if playerId is valid
        if (numericPlayerId === null || isNaN(numericPlayerId)) {
            return NextResponse.json({ message: 'Invalid player ID' }, { status: 400 });
        }

        // Create an array to hold the conditions
        const conditions = [eq(playerEvaluation.player_id, numericPlayerId)];

        // Add evaluation status condition if it is defined and valid
        if (numericStatus !== null && !isNaN(numericStatus)) {
            conditions.push(eq(playerEvaluation.status, numericStatus));
        }

        const result = await db
            .select({
                id: playerEvaluation.id,
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
            }) // Explicitly select the fields
            .from(playerEvaluation)
            .where(and(...conditions)) // Spread the conditions array
            .execute();

        return NextResponse.json({ message: result, status: numericStatus }, { status: 200 });
    } catch (error) {
        console.error('Error during fetching evaluations:', error); // Log the error for debugging
        return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
    }
}

