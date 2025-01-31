import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, coaches, playerbanner } from '../../../../lib/schema'
import debug from 'debug';
import { eq, sql,inArray,and,ne } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { userId } = await req.json();
    const teamsOfPlayer = await db
    .select({
        teamId: teamPlayers.teamId,
        teamName: teams.team_name,
        teamLogo: teams.logo,
        teamSlug: teams.slug,
    })
    .from(teamPlayers)
    .leftJoin(teams, eq(teamPlayers.teamId, teams.id))
    .where(eq(teamPlayers.playerId,userId))
    .execute();
    return NextResponse.json(teamsOfPlayer, { status: 200 });
}