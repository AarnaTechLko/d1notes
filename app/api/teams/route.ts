import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches, users } from "@/lib/schema";
import { eq, and, desc,count,sql, or, ilike} from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { generateRandomPassword } from "@/lib/helpers";
import { hash } from 'bcryptjs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const enterpriseId = url.searchParams.get("enterprise_id");
  const search = url.searchParams.get('search') || '';  // Default to empty string if not provided
  const page = parseInt(url.searchParams.get('page') || '1', 10);  // Default to 1 if not provided
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);  // Default to 10 if not provided

  if (!enterpriseId) {
    return NextResponse.json(
      { error: "Enterprise ID is required" },
      { status: 400 } 
    ); 
  }


  const offset = (page - 1) * limit;

  const whereClause = search
    ? and(
      eq(teams.creator_id, Number(enterpriseId)),
      or(
        eq(teams.status, 'Active'),
        eq(teams.status, 'Inactive')
      ),
      or(
        ilike(teams.team_name, `%${search}%`),
        ilike(teams.manager_email, `%${search}%`),
        ilike(teams.manager_phone, `%${search}%`)
      )
    )
    :and(
      eq(teams.creator_id, Number(enterpriseId)),
      or(
        eq(teams.status, 'Active'),
        eq(teams.status, 'Inactive')
      )
    );

  let query;
  let totalCountQuery;
   query = await db.select(
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
      status: teams.status,
      age_group: teams.age_group
    }
  ).from(teams)
    .leftJoin(coaches, eq(teams.coach_id, coaches.id))
   /// .where(eq(teams.club_id, parseInt(enterpriseId)))
   .where(whereClause)
    ///.where(and(eq(teams.club_id, parseInt(enterpriseId)),eq(teams.status,'Active')))

    .orderBy(desc(teams.id));
  
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
        id: team.id,
        team_name: team.team_name,
        description: team.description,
        logo: team.logo,
        created_by: team.created_by,
        creator_id: team.creator_id,
        slug: team.slug,
        team_type: team.team_type,
        team_year: team.team_year,
        cover_image: team.cover_image,
        coach_id: team.coach_id,
        manager_name: team.manager_name,
        manager_email: team.manager_email,
        manager_phone: team.manager_phone,
        firstName: team.firstName,
        lastName: team.lastName,
        coachSlug: team.coachSlug,
        status: team.status,
        age_group: team.age_group,
        totalPlayers: totalPlayers,
        totalCoaches: totalCoaches,
      };
    })
  );
  


  const teamplayersList = await db.select().from(teamPlayers).where(eq(teamPlayers.enterprise_id, parseInt(enterpriseId)));
  return NextResponse.json({ data, teamplayersList });
}

export async function POST(req: NextRequest) {
  const { team_name, description, logo, created_by, creator_id, team_type, team_year, cover_image, coach_id, manager_name, manager_email, manager_phone, club_id, status,leage,age_group } = await req.json();
  const timestamp = Date.now();
  const rpassword = generateRandomPassword(12);
  const password = await hash(rpassword, 10);
  const slug = `${team_name.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
  const result = await db.insert(teams).values({ team_name, description, logo, created_by, creator_id, slug, team_type, team_year, cover_image, coach_id, manager_name, manager_email, manager_phone, password, club_id, status,leage,age_group }).returning();
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
    const { id, team_name, description, logo, created_by, creator_id, team_type, team_year, cover_image, coach_id, manager_name, manager_email, manager_phone, status,leage,age_group,selectedOption } = await req.json();



    if (!id || !team_name || !created_by || !creator_id) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    let ageGroup;
    let teamYear;
    if(selectedOption=='ageGroup')
    {
      ageGroup=age_group;
      teamYear=null;
    }
    else{
      ageGroup=null;
      teamYear=team_year;
    }
    
    const result = await db
  .update(teams)
  .set({
    team_name,
    description,
    logo,
    created_by,
    creator_id,
    team_type,
    cover_image,
    coach_id,
    status,
    leage,
    age_group:ageGroup,
    team_year: teamYear, // Nullify team_year if age_group is set
  })
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
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Team ID is required' }, { status: 400 });
    }

    // Archive the team instead of deleting
    await db.update(teams).set({ status: 'Archived' }).where(eq(teams.id, id));

    console.log("Teams ID",id);
    // Get the list of coach IDs associated with the team
    const coachesInTeam = await db
      .select({ coachId: teamCoaches.coachId }) // Use correct select syntax
      .from(teamCoaches)
      .where(eq(teamCoaches.teamId, id)); // Changed 'team_id' to 'teamId'

    const coachesIds = coachesInTeam.map((entry) => entry.coachId); 

    console.log("Coaches ID",coachesIds);

    if (coachesIds.length > 0) {
      await db
        .update(coaches)
        .set({ status: 'Archived' } as any)
        .where(sql`${coaches.id} IN (${sql.join(coachesIds)})`);
    }

    // Correct the query to properly select playerIds by teamId
    const playerInTeam = await db
      .select({ playerId: teamPlayers.playerId }) // Ensure correct select syntax
      .from(teamPlayers)
      .where(eq(teamPlayers.teamId, id)); // Fixed issue: filter by teamId, not playerId

    const playersIds = playerInTeam.map((entry) => entry.playerId);

    console.log("Players ID", playersIds);

    if (playersIds.length > 0) {
      await db
        .update(users)
        .set({ status: 'Archived' } as any)
        .where(sql`${users.id} IN (${sql.join(playersIds)})`); // Use proper SQL query
    }

    return NextResponse.json({ success: true, message: 'Team and related players and coaches archived successfully' });
  } catch (error) {
    console.error('Error archiving team:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

