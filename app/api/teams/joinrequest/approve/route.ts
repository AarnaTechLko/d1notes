import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { coaches, users, enterprises, joinRequest, teams, chats, chatfriend, messages, teamPlayers, teamjoinRequest } from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        // Parse the incoming request body
        const body = await req.json();

        const { playerId,request_id,message,status} = body;

       const updateQuery= await db
            .update(teamjoinRequest)
            .set({ status:status})
            .where(eq(teamjoinRequest.id, request_id),
            ).returning({team_id:teamjoinRequest.team_id});

            await db.insert(teamPlayers).values(
                {
                  teamId: Number(updateQuery[0].team_id),
                  playerId:playerId,
                  enterprise_id:0 ,
                }
                
              ).returning();  

         

        // let chatFriend:any={
        //     playerId: playerId,
        //     coachId: requestToID,
        //     club_id:clubId
             
        // };
        // const insertChatfriend=await db.insert(chats).values(chatFriend).returning();


        // let userValues: any = {
        //     senderId: requestToID,
        //     chatId:insertChatfriend[0].id,
        //     message: message,
        //     club_id:clubId
        // };

        // const insertedUser = await db.insert(messages).values(userValues).returning();

        // Prepare data for response
        return NextResponse.json(
            { message: "Join Request Sent" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing request:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const player_id = searchParams.get('player_id');
    const type = searchParams.get('type');

    if (!type) {
        const queryResult = await db
            .select({
                id: joinRequest.id,
                playerId: joinRequest.player_id,
                coachId: joinRequest.coach_id,
                clubId: joinRequest.club_id,
                message: joinRequest.message,
                type: joinRequest.type,
                status: joinRequest.status,
                requestToID: joinRequest.requestToID,
                requestedToName: sql`
      CASE 
        WHEN ${joinRequest.type} = 'club' THEN ${enterprises.organizationName}
        WHEN ${joinRequest.type} = 'coach' THEN ${coaches.firstName}
        WHEN ${joinRequest.type} = 'team' THEN ${teams.team_name}
      END
    `.as('requestedToName'),
            })
            .from(joinRequest)
            .leftJoin(enterprises, sql`${joinRequest.type} = 'club' AND ${joinRequest.requestToID} = ${enterprises.id}`)
            .leftJoin(coaches, sql`${joinRequest.type} = 'coach' AND ${joinRequest.requestToID} = ${coaches.id}`)
            .leftJoin(teams, sql`${joinRequest.type} = 'team' AND ${joinRequest.requestToID} = ${teams.id}`)
            .where(eq(joinRequest.player_id, Number(player_id)));

        // Convert result to plain JavaScript objects
        const plainResult = queryResult.map(row => ({
            id: row.id,
            playerId: row.playerId,
            coachId: row.coachId,
            clubId: row.clubId,
            type: row.type,
            requestToID: row.requestToID,
            status: row.status,
            message: row.message,
            requestedToName: row.requestedToName,
        }));
        return NextResponse.json({ data: plainResult }, { status: 200 });
    }

    else {
        const queryResult = await db
            .select({
                id: joinRequest.id,
                playerId: joinRequest.player_id,
                coachId: joinRequest.coach_id,
                clubId: joinRequest.club_id,
                message: joinRequest.message,
                type: joinRequest.type,
                status: joinRequest.status,
                requestToID: joinRequest.requestToID,
                first_name: users.first_name,
                last_name: users.last_name,

            })
            .from(joinRequest)
            .innerJoin(users, eq(joinRequest.player_id, users.id))
            .where(
                and(
                    eq(joinRequest.requestToID, Number(player_id)),
                    eq(joinRequest.type, type),
                )
            );

        // Convert result to plain JavaScript objects
        const plainResult = queryResult.map(row => ({
            id: row.id,
            playerId: row.playerId,
            coachId: row.coachId,
            clubId: row.clubId,
            type: row.type,
            requestToID: row.requestToID,
            status: row.status,
            message: row.message,
            first_name: row.first_name,
            last_name: row.last_name,
        }));
        return NextResponse.json({ data: plainResult }, { status: 200 });
    }

}

