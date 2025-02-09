import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams,teamPlayers, teamCoaches } from "@/lib/schema";
import { eq,and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const enterpriseId = url.searchParams.get("enterprise_id");

    if (!enterpriseId) {
      return NextResponse.json(
        { error: "Coach ID is required" },
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
  .leftJoin(teamCoaches, eq(teamCoaches.teamId, teams.id))
  .where(
    and(
        eq(teamCoaches.coachId,parseInt(enterpriseId))
  ));

  const teamplayersList=await db.select().from(teamPlayers).where(eq(teamPlayers.enterprise_id,parseInt(enterpriseId)));
  return NextResponse.json({data,teamplayersList});
}

export async function POST(req: NextRequest) {
  const { team_name, description, logo, created_by, creator_id, coach_id } = await req.json();

  const timestamp = Date.now(); 
  const slug = `${team_name.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;


  const result = await db.insert(teams).values({coach_id, team_name, description, logo, created_by, creator_id, slug }).returning();
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
    try {
      const { id, team_name, description, logo, created_by, creator_id } = await req.json();
  
      // Log input for debugging
      console.log("Request Body:", { id, team_name, description, created_by, creator_id });
  
      if (!id || !team_name || !description || !created_by || !creator_id) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
      }
  
      const result = await db
        .update(teams)
        .set({ team_name, description, logo, created_by, creator_id })
        .where(eq(teams.id, id))
        .returning();
  
      console.log("Update Result:", result);
  
      if (result.length === 0) {
        return NextResponse.json({ error: "Team not found or no changes made" }, { status: 404 });
      }
  
      return NextResponse.json(result);
    } catch (error) {
      console.error("Error in PUT handler:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(teams).where(eq(teams.id, id));
  return NextResponse.json({ success: true });
}
