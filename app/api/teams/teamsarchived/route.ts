import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches } from "@/lib/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const enterpriseId = url.searchParams.get("enterprise_id");
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    if (!enterpriseId) {
      return NextResponse.json(
        { error: "Enterprise ID is required" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    const query = await db
      .select({
        id: teams.id,
        team_name: teams.team_name,
        description: teams.description,
        logo: teams.logo,
        created_by: teams.created_by,
        creator_id: teams.creator_id,
        slug: teams.slug,
        team_type: teams.team_type,
        team_year: teams.team_year,
        cover_image: teams.cover_image,
        coach_id: teams.coach_id,
        manager_name: teams.manager_name,
        manager_email: teams.manager_email,
        manager_phone: teams.manager_phone,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        coachSlug: coaches.slug,
        status: teams.status,
        age_group: teams.age_group,
      })
      .from(teams)
      .leftJoin(coaches, eq(teams.coach_id, coaches.id))
      .where(
        and(eq(teams.status, "Archived"), eq(teams.club_id, parseInt(enterpriseId)))
      )
      .orderBy(desc(teams.id))
      .limit(limit)
      .offset(offset);

    const data = await Promise.all(
      query.map(async (team) => {
        const totalCoachesResult = await db
          .select({ count: count() })
          .from(teamCoaches)
          .where(eq(teamCoaches.teamId, team.id));

        const totalCoaches = totalCoachesResult[0]?.count || 0;

        const totalPlayersResult = await db
          .select({ count: count() })
          .from(teamPlayers)
          .where(eq(teamPlayers.teamId, team.id));

        const totalPlayers = totalPlayersResult[0]?.count || 0;

        return {
          ...team,
          totalPlayers,
          totalCoaches,
        };
      })
    );

    // Fetch team players list separately
    const teamplayersList = await db
      .select()
      .from(teamPlayers)
      .where(eq(teamPlayers.enterprise_id, parseInt(enterpriseId)));

    return NextResponse.json({ data, teamplayersList });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching teams." },
      { status: 500 }
    );
  }
}
