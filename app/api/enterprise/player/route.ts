import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { teams } from '../../../../lib/schema';
import { sql,eq} from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const { enterprise_id, teamId } = await req.json();
    if (!enterprise_id || !teamId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch team data
    const teamData = await db.select({team_name:teams.team_name,team_type:teams.team_type}).from(teams).where(eq(teams.id, teamId)).limit(1);
    const teamType = teamData[0].team_type;
    const gender = teamType === 'Men' ? 'Male' : teamType === 'Women' ? 'Female' : null;

    // Fetch players not in the team with the same gender
    const players = await db.execute(
      sql`SELECT id, first_name, last_name, position, location, height, weight, team, grade_level, image 
          FROM users 
          WHERE id NOT IN (SELECT player_id FROM "teamPlayers" WHERE team_id = ${teamId}) 
          AND status = 'Active' 
          AND enterprise_id = ${enterprise_id}
          AND gender = ${gender}` // Add the gender condition here
    );

    // Return response
    return NextResponse.json({ players: players.rows,team: teamData[0] }, { status: 200 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
