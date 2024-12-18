import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams,teamPlayers,coaches } from "@/lib/schema";
import { eq,and,desc } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { generateRandomPassword } from "@/lib/helpers";
import { hash } from 'bcryptjs';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const enterpriseId = url.searchParams.get("enterprise_id");

    if (!enterpriseId) {
      return NextResponse.json(
        { error: "Enterprise ID is required" },
        { status: 400 }
      );
    }
  const data = await db.select(
    {
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
    }
  ).from(teams)
  .leftJoin(coaches, eq(teams.coach_id, coaches.id))
  .where(eq(teams.club_id,parseInt(enterpriseId))).orderBy(desc(teams.id));

  const teamplayersList=await db.select().from(teamPlayers).where(eq(teamPlayers.enterprise_id,parseInt(enterpriseId)));
  return NextResponse.json({data,teamplayersList});
}

export async function POST(req: NextRequest) {
  const {team_name, description, logo, created_by, creator_id, team_type, team_year, cover_image, coach_id, manager_name, manager_email,manager_phone,club_id } = await req.json();
  const timestamp = Date.now(); 
  const rpassword=generateRandomPassword(12);
  const password = await hash(rpassword, 10);
  const slug = `${team_name.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
  const result = await db.insert(teams).values({ team_name, description, logo, created_by, creator_id,slug,team_type,team_year,cover_image,coach_id,manager_name, manager_email,manager_phone,password,club_id }).returning();
  if (manager_name && manager_email && manager_phone) {
    const emailResult = await sendEmail({
      to: manager_email,
      subject: "D1 NOTES Team Created",
      text: "D1 NOTES Team Created",
      html: `<p>Dear ${manager_name}, Your team ${team_name} has been Created on D1 NOTES. </p><p>Your Login Credentials are as given below:</p><p><b>Email:</b> ${manager_email}<br/><b>Password:</b>${rpassword}</p>`,
    });
  }
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
    try {
      const { id, team_name, description, logo, created_by, creator_id, team_type, team_year, cover_image, coach_id, manager_name, manager_email,manager_phone } = await req.json();
  
   
  
      if (!id || !team_name || !description || !created_by || !creator_id) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
      }
     
      const result = await db
        .update(teams)
        .set({ team_name, description, logo, created_by, creator_id,team_type,team_year,cover_image,coach_id })
        .where(eq(teams.id, id))
        .returning();
  
    
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
