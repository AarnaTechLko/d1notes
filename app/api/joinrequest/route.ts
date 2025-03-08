import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { coaches, users, enterprises, joinRequest, teams, invitations } from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    // Parse the incoming request body
    const body = await req.json();

    const { club_id, coach_id, message, playerId, type, requestToID } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: "Invalid payload: teamId is missing or invalid." },
        { status: 400 }
      );
    }

    let userValues: any = {
      club_id: club_id,
      coach_id: coach_id,
      message: message,
      player_id: playerId,
      type: type,
      requestToID: requestToID,
      status: "Requested"
    };

    const insertedUser = await db.insert(joinRequest).values(userValues).returning();

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

  if (type == 'club') {
    const queryResult = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        invitation_for: invitations.invitation_for,
        status: invitations.status,

      })
      .from(invitations)

      .where(eq(invitations.enterprise_id, Number(player_id)));

    // Convert result to plain JavaScript objects
    const plainResult = queryResult.map(row => ({
      invitationId: row.id,
      email: row.email,
      invitation_for: row.invitation_for,
      status: row.status,
    }));


    return NextResponse.json({ data: plainResult }, { status: 200 });
  }
  else if (type == 'team') {
    const queryResult = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      invitation_for: invitations.invitation_for,
      status: invitations.status,

    })
    .from(invitations)

    .where(eq(invitations.team_id, Number(player_id)));

  // Convert result to plain JavaScript objects
  const plainResult = queryResult.map(row => ({
    invitationId: row.id,
    email: row.email,
    invitation_for: row.invitation_for,
    status: row.status,
  }));
    return NextResponse.json({ data: plainResult }, { status: 200 });
  }
  else if(type=='player'){
    const query = await db.select().from(users).where(eq(users.id, Number(player_id))).execute();
    
    const queryResult = await db
    .select({
      invitationId: invitations.id,
      email: invitations.email,
      invitation_for: invitations.invitation_for,
      status: invitations.status,
      createdAt: invitations.createdAt,
      team_name: teams.team_name, // Removed optional chaining
      club_name: enterprises.organizationName, // Ensure correct column name
      clubSlug: enterprises.slug, // Ensure correct column name
      teamSlug: teams.slug, // Ensure correct column name
      clubLogo: enterprises.logo, // Ensure correct column name
      teamLogo: teams.logo, // Ensure correct column name
    })
    .from(invitations)
    .leftJoin(teams, eq(teams.id,invitations.team_id))
    .leftJoin(enterprises, eq(enterprises.id, invitations.enterprise_id))
    .where(
      and(
        eq(invitations.email, String(query[0].email)),
        eq(invitations.invitation_for,type.toString())
      ));

    const plainResult = queryResult.map(row => ({
      invitationId: row.invitationId,
      email: row.email,
      team_name: row.team_name,
      club_name: row.club_name,
      status: row.status,
      clubLogo: row.clubLogo,
      teamLogo: row.teamLogo,
      teamSlug: row.teamSlug,
      clubSlug: row.clubSlug,
      createdAt: row.createdAt,
    }));
    return NextResponse.json({ data: plainResult }, { status: 200 });
  }

}

