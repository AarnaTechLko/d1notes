import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, coaches, playerbanner } from '../../../../lib/schema'
import debug from 'debug';
import { eq,sql } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { slug } = await req.json();

    try {
        // Step 1: Fetch the user based on slug
        const user = await db
            .select()
            .from(users)
            .where(eq(users.slug, slug))
            .limit(1)
            .execute();

        if (!user.length) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Step 2: Fetch banners associated with the user
        const banners = await db
            .select()
            .from(playerbanner)
            .where(eq(playerbanner.user_id, user[0].id))
            .execute();

        // Step 3: Get teams associated with the main player
        const teamsOfPlayer = await db
            .select({
                teamId: teamPlayers.teamId,
                teamName: teams.team_name,
                teamLogo: teams.logo,
                teamSlug: teams.slug,
            })
            .from(teamPlayers)
            .leftJoin(teams, eq(teamPlayers.teamId, teams.id))
            .where(eq(teamPlayers.playerId, user[0].id))
            .execute();

        // Extract team IDs
        const teamIds = teamsOfPlayer.map((team) => team.teamId);

        if (teamIds.length === 0) {
            return NextResponse.json({
                clubdata: user[0],
                banners,
                playerOfTheTeam: [],
                teamPlayers: [],
            });
        }

        // Step 4: Fetch all players in those teams using SQL `IN` clause
        const placeholders = teamIds.map(() => '?').join(', ');
        const allTeamPlayers = await db
            .select({
                playerId: teamPlayers.playerId ,
                firstName: users.first_name,
                lastName: users.last_name,
                jersey: users.jersey,
                grade_level: users.grade_level,
                height: users.height,
                weight: users.weight,
                playerSlug: users.slug,
                position: users.position,
                slug: users.slug,
                image: users.image,
                teamId: teamPlayers.teamId,
            })
            .from(teamPlayers)
            .leftJoin(users, eq(teamPlayers.playerId, users.id))
        .limit(5)
            .execute();

        return NextResponse.json({
            clubdata: user[0],
            banners,
            playerOfTheTeam: teamsOfPlayer,
            teamPlayers: allTeamPlayers,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
    }
}