import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { users, otps, licenses, teamPlayers, playerEvaluation } from '../../../../../lib/schema'
import debug from 'debug';
import { eq, and, gt, or, ilike, count, desc,sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

import { SECRET_KEY } from '@/lib/constants';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import next from 'next';
 

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || ''; // Default to empty string if not provided
  const page = parseInt(url.searchParams.get('page') || '1', 10); // Default to 1 if not provided
  const limit = parseInt(url.searchParams.get('limit') || '10', 10); // Default to 10 if not provided
  const enterprise_id = url.searchParams.get('enterprise_id');
  const teamId = url.searchParams.get('teamId');

  try {
    if (!enterprise_id) {
      return NextResponse.json(
        { message: 'Enterprise ID not found!' },
        { status: 500 }
      );
    }

    const offset = (page - 1) * limit;

    const whereClause = search
      ? and(
        eq(users.enterprise_id, enterprise_id),
        eq(users.status, 'Archived'), // Filter only archived coaches
        or(
          ilike(users.first_name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.number, `%${search}%`)
        )
      )
      : and(
        eq(users.enterprise_id, enterprise_id),
        eq(users.status, 'Archived'),// Filter only archived coaches
                );

    let query;
    let totalCountQuery;

    if (teamId) {
      query = db
        .select({
          id: users.id,
          first_name: users.first_name,
          last_name: users.last_name,
          grade_level: users.grade_level,
          location: users.location,
          birthday: users.birthday,
          gender: users.gender,
          sport: users.sport,
          team: users.team,
          jersey: users.jersey,
          position: users.position,
          number: users.number,
          email: users.email,
          image: users.image,
          bio: users.bio,
          country: users.country,
          state: users.state,
          city: users.city,
          league: users.league,
          countrycode: users.countrycode,
          password: users.password,
          enterprise_id: users.enterprise_id,
          coach_id: users.coach_id,
          slug: users.slug,
          playingcountries: users.playingcountries,
          height: users.height,
          weight: users.weight,
          status: users.status,
          createdAt: users.createdAt,
          totalEvaluations: sql<number>`COUNT(CASE WHEN player_evaluation.status = 2 THEN player_evaluation.id END)`
        })
        .from(users)
        .innerJoin(teamPlayers, eq(teamPlayers.playerId, users.id))
        .where(eq(teamPlayers.teamId, Number(teamId)))
        .offset(offset)
        .orderBy(desc(users.createdAt))
        .limit(limit);

      totalCountQuery = db
        .select({ count: count() })
        .from(users)
        .innerJoin(teamPlayers, eq(teamPlayers.playerId, users.id))
        .where(eq(teamPlayers.teamId, Number(teamId)))
    } else {
      query = db
        .select({
          id: users.id,
          first_name: users.first_name,
          last_name: users.last_name,
          grade_level: users.grade_level,
          location: users.location,
          birthday: users.birthday,
          gender: users.gender,
          sport: users.sport,
          team: users.team,
          jersey: users.jersey,
          position: users.position,
          number: users.number,
          email: users.email,
          image: users.image,
          bio: users.bio,
          country: users.country,
          state: users.state,
          city: users.city,
          league: users.league,
          countrycode: users.countrycode,
          password: users.password,
          enterprise_id: users.enterprise_id,
          coach_id: users.coach_id,
          slug: users.slug,
          playingcountries: users.playingcountries,
          height: users.height,
          weight: users.weight,
          status: users.status,
          createdAt: users.createdAt,
           totalEvaluations: sql<number>`COUNT(CASE WHEN player_evaluation.status = 2 THEN player_evaluation.id END)`
        })
        .from(users)
        .leftJoin(playerEvaluation, sql`${playerEvaluation.player_id} = ${users.id}`) 
        .where(whereClause)
        .groupBy(
          users.id, users.first_name, users.last_name, users.grade_level, users.location, 
          users.birthday, users.gender, users.sport, users.team, users.jersey, users.position, 
          users.number, users.email, users.image, users.bio, users.country, users.state, 
          users.city, users.league, users.countrycode, users.password, users.enterprise_id, 
          users.coach_id, users.slug, users.playingcountries, users.height, users.weight, 
          users.status, users.createdAt
        )
        .offset(offset)
        .orderBy(desc(users.createdAt))
        .limit(limit);

      totalCountQuery = db
        .select({ count: count() })
        .from(users)
        .where(whereClause);
    }

    const coachesData = await query;
    const totalCount = await totalCountQuery.then((result) => result[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ players: coachesData, totalPages });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch coaches', error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
  /* restore */
  export async function PUT(req: NextRequest) {
    try {
        const { id } = await req.json(); // Getting the player ID from the request body

        if (!id) {
            return NextResponse.json({ success: false, message: 'Player ID is required' }, { status: 400 });
        }

        // Update the player's status to 'Active' to restore the player
        await db.update(users)
            .set({ status: 'Active' }) // Restoring the player
            .where(eq(users.id, id));

        return NextResponse.json({ success: true, message: 'Player restored successfully' });
    } catch (error) {
        console.error('Error restoring player:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}


  
  
  // ---------------------- PERMANENT DELETE TEAM ----------------------
  export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json(); // Getting the player ID from the request body

        if (!id) {
            return NextResponse.json({ success: false, message: 'Player ID is required' }, { status: 400 });
        }

        // Permanently delete the player from the 'users' table
        await db.delete(users)
            .where(eq(users.id, id));

        return NextResponse.json({ success: true, message: 'Player removed successfully' });
    } catch (error) {
        console.error('Error removing player:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}



