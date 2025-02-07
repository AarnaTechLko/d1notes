import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { users,teamCoaches,teamPlayers } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq,isNotNull,and, between, lt,ilike,inArray,or,count } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';  // Default to empty string if not provided
    const page = parseInt(url.searchParams.get('page') || '1', 10);  // Default to 1 if not provided
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);  // Default to 10 if not provided
    const coachId = url.searchParams.get('coachId');
    const type = url.searchParams.get('type');

    if (!coachId) {
      return NextResponse.json({ error: "Missing coachId" }, { status: 400 });
    }

    const offset = (page - 1) * limit;
    let whereClause;
  
    // Step 1: Get all team IDs for the given coach
    const coachTeams = await db
      .select({ teamId: teamCoaches.teamId })
      .from(teamCoaches)
      .where(eq(teamCoaches.coachId, Number(coachId)));

    if (!coachTeams.length) {
      return NextResponse.json({ error: "Coach not assigned to any team" }, { status: 404 });
    }

    const teamIds = coachTeams.map((team:any) => team.teamId);
  
    // Step 2: Get all player IDs from teamPlayers where team_id is in teamIds
    const playerRecords = await db
      .select({ playerId: teamPlayers.playerId })
      .from(teamPlayers)
      .where(inArray(teamPlayers.teamId, teamIds));

    if (playerRecords.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const playerIds = playerRecords.map((p) => p.playerId);
    whereClause =  and(
        inArray(users.id, playerIds),
      or(
        ilike(users.first_name, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.number, `%${search}%`)
      )
    );
    // Step 3: Get full player details from users table
    const playerData = await db
      .select()
      .from(users)
      .where(whereClause);

      const totalCount = await db
      .select({ count: count() })/// Use raw SQL for COUNT(*) function
      .from(users)
      .where(whereClause)
      .then((result) => result[0]?.count || 0);
      const totalPages = Math.ceil(totalCount / limit);
    return NextResponse.json({ players: playerData, totalPages });
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
