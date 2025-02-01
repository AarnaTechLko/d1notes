import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { coaches,users, enterprises, joinRequest, teams, teamjoinRequest } from "@/lib/schema";
import { eq,sql,and } from "drizzle-orm";

export async function POST(req: Request) {
    try {
      // Parse the incoming request body
      const body = await req.json();
  
      const {team_id,message, playerId } = body;
  
      if (!playerId) {
        return NextResponse.json(
          { error: "Invalid payload: teamId is missing or invalid." },
          { status: 400 }
        );
      }
  
      let userValues: any = {
        team_id:team_id,
        message:message,
        player_id:playerId,
        status:"Requested"
      };
  
      const insertedUser = await db.insert(teamjoinRequest).values(userValues).returning();
    
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
    const team_id = searchParams.get('team_id');
    const player_id = searchParams.get('player_id');
    const type = searchParams.get('type');
    if(team_id && type=='team')
    {
        const requestData=await db.select(
            {
                first_name:users.first_name,
                last_name:users.last_name,
                slug:users.slug,
                image:users.image,
                message:teamjoinRequest.message,
                status:teamjoinRequest.status,
                id:teamjoinRequest.id,
            }
           ).from(teamjoinRequest)
            .innerJoin(users, eq(teamjoinRequest.player_id, users.id)) .where(eq(teamjoinRequest.team_id,Number(team_id)));
            return NextResponse.json({ data: requestData }, { status: 200 });
    }
    else{
        const requestData=await db.select(
            {
                team_name:teams.team_name,
                
                slug:teams.slug,
                image:teams.logo,
                message:teamjoinRequest.message,
                status:teamjoinRequest.status,
                id:teamjoinRequest.id,
            }
           ).from(teamjoinRequest)
            .innerJoin(teams, eq(teamjoinRequest.team_id, teams.id)) .where(eq(teamjoinRequest.player_id,Number(player_id)));
            return NextResponse.json({ data: requestData }, { status: 200 });
    }
   
    
  }
  
