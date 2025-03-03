import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { teamPlayers,teams,coaches,teamCoaches, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const teamId = url.searchParams.get("team_id");
    
  try {
    
    if (!teamId) {
      return NextResponse.json(
        { error: "Invalid payload: teamId  is missing or invalid." },
        { status: 400 }
      );
    }
   
    
    const teamData =  await db
    .select().from(teams)
    .where(eq(teams.id,Number(teamId)));

    const playersData = await db
    .select({
        playerId:users.id,
        first_name:users.first_name,
        last_name:users.last_name,
        image:users.image,
        status:users.status,
    })
    .from(teamPlayers)
    .innerJoin(users, eq(teamPlayers.playerId, users.id))
    .innerJoin(teams, eq(teamPlayers.teamId, teams.id))
    .where(eq(teamPlayers.teamId, Number(teamId)))
    .execute();


    const coachesData = await db
    .select({
        coachId:coaches.id,
        first_name:coaches.firstName,
        last_name:coaches.lastName,
        image:coaches.image,
        status:coaches.status,
    })
    .from(teamCoaches)
    .innerJoin(coaches, eq(teamCoaches.coachId, coaches.id))
    .innerJoin(teams, eq(teamCoaches.teamId, teams.id))
    .where(eq(teamCoaches.teamId, Number(teamId)))
    .execute();

    return NextResponse.json(
      {teamData,playersData, coachesData},
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
