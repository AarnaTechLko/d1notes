import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams,teamPlayers, teamCoaches } from "@/lib/schema";
import { eq,and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const enterpriseId = url.searchParams.get("enterprise_id");

    if (!enterpriseId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }
  const data = await db.selectDistinct(
    {
      team_name:teams.team_name,
      team_year:teams.team_year,
      age_group:teams.age_group,
      logo:teams.logo,
      team_type:teams.team_type,
      leage:teams.leage,
      slug:teams.slug,
    }
  ).from(teams)
  .leftJoin(teamPlayers, eq(teamPlayers.teamId, teams.id))
  .where(
    and(
        eq(teamPlayers.playerId,parseInt(enterpriseId))
  ));

  const teamplayersList=await db.select().from(teamPlayers).where(eq(teamPlayers.enterprise_id,parseInt(enterpriseId)));
  return NextResponse.json({data,teamplayersList});
}