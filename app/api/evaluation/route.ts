import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db'; // Adjust the import based on your file structure
import { licenses, playerEvaluation, users,coaches, chats, messages } from '../../../lib/schema'; // Adjust if necessary
import { eq, or } from 'drizzle-orm';
import { and } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log('Request body:', body); // Log the incoming request body

    try {
        const { reviewTitle, primaryVideoUrl, videoUrl2, videoUrl3, videoDescription, coachId, playerId, turnaroundTime, status, child, videoOneTiming,
            videoTwoTiming,
            videoThreeTiming,
            position,
            lighttype, percentage, enterprise_id } = body;
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

        if (checkRejection.length > 3) {
            return NextResponse.json({ message: "You can not send Evaluation Request to this coach as this coach has rejected your request 3 Times." }, { status: 500 });
        }

        const result = await db.insert(playerEvaluation).values({
            player_id: player_id,
            parent_id: parent_id,
            club_id:enterprise_id,
            review_title: reviewTitle,
            primary_video_link: primaryVideoUrl,
            video_link_two: videoUrl2,
            video_link_three: videoUrl3,
            video_description: videoDescription, 
            turnaroundTime: turnaroundTime,
            coach_id: coachId,
            percentage: percentage,
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
        
        const coachData=await db.select().from(coaches).where(eq(coaches.id,coachId));
        const playerData=await db.select().from(users).where(eq(users.id,player_id));

        let chatFriend:any={
            playerId: playerId,
            coachId: coachId,
            club_id:0        
        };
    
        let message=`Dear ${coachData[0].firstName}! You have recieved an Evaluation Request from ${playerData[0].first_name}`;
        const insertChatfriend=await db.insert(chats).values(chatFriend).returning();

        let userValues: any = {
            senderId: playerId,
            chatId:insertChatfriend[0].id,
            message: message,
            club_id:0
        };
    
        const insertedUser = await db.insert(messages).values(userValues).returning();

        const emailResult = await sendEmail({
            to: coachData[0].email || '',
            subject: "D1 NOTES Evaluation Request",
            text: "D1 NOTES Evaluation Request",
            html: `<p>Dear ${coachData[0].firstName}! You have recieved an Evaluation Request from ${playerData[0].first_name}.</p><p>Please login to your coach account to start Evaluation.</p>`,
        });

        const emailResultPlayer = await sendEmail({
            to: playerData[0].email,
            subject: "D1 NOTES Evaluation Request Sent",
            text: "D1 NOTES Evaluation Request Sent",
            html: `<p>Dear ${playerData[0].first_name}! You have successfully requested the  Evaluation to ${coachData[0].firstName}.</p><p>Please login to your player account to see the progress.</p>`,
        });

        // const updateLicnes=await db.update(licenses).set({
        //     status: 'Consumed',
        //     used_by: coachId,
        //     used_for: 'Coach',
        //   }).where(eq(licenses.status, 'Free'));

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

