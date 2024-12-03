import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, coaches, playerbanner } from '../../../../lib/schema'
import debug from 'debug';
import { eq } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { slug } = await req.json();

    try {
        // Using 'like' with lower case for case-insensitive search
        const user = await db
            .select()
            .from(users)
            .where(
                eq(users.slug, slug)
            )
           
            .limit(1)
            .execute();

    const banners=await db.select().from(playerbanner).where(eq(playerbanner.user_id,user[0].id)).execute();

    const playerOfTheTeam = await db
    .select(
        {
          teamId: teamPlayers.teamId,
          teamName: teams.team_name,
          teamLogo: teams.logo,
          teamSlug: teams.slug,
        }
    )
    .from(teamPlayers)
    .leftJoin(teams, eq(teamPlayers.teamId, teams.id))
    .where(eq(teamPlayers.playerId, user[0].id))
    .execute();

        return NextResponse.json({ clubdata: user[0],banners, playerOfTheTeam});
    } catch (error) {
        const err = error as any;
        console.error('Error fetching teams:', error);
        return NextResponse.json({ message: 'Failed to fetch Teams' }, { status: 500 });
    }
}