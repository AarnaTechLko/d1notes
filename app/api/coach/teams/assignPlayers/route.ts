import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { teamPlayers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    // Parse the incoming request body
    const body = await req.json();

    const { teamId, playerIds, enterprise_id } = body;

    if (!teamId || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload: teamId or playerIds is missing or invalid." },
        { status: 400 }
      );
    }
    await db
    .delete(teamPlayers)
    .where(eq(teamPlayers.enterprise_id,Number(enterprise_id)));
    // Prepare data for batch insertion
    const recordsToInsert = playerIds.map((playerId) => ({
      teamId,
      playerId,
      enterprise_id
    }));

    // Insert data into the database
    await db.insert(teamPlayers).values(recordsToInsert);

    return NextResponse.json(
      { message: "Players successfully assigned to the team." },
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
