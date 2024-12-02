import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { teamPlayers,users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
      // Parse the incoming request body
      const body = await req.json();
  
      const { teamId } = body;
  
      if (!teamId) {
        return NextResponse.json(
          { error: "Invalid payload: teamId is missing or invalid." },
          { status: 400 }
        );
      }
  
      // Use the correct column name, which should be teamId based on the error message
      const teamPlayersList = await db
      .select({
        id: users.id,
        first_name: users.first_name,
        last_name: users.last_name,
        position: users.position,
        location: users.location,
        height: users.height,
        weight: users.weight,
        team: users.team,
        grade_level: users.grade_level,
        image: users.image})
      .from(teamPlayers)
      .innerJoin(users, eq(teamPlayers.playerId, users.id)) // Join the users table
      .where(eq(teamPlayers.teamId, teamId));
  
      // Prepare data for response
      return NextResponse.json(
        teamPlayersList,
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
  
