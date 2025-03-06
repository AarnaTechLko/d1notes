import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, enterprises, coaches, otps, users, teamCoaches, teamPlayers } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, not, between, lt, ilike, sql, ne, isNull, or, desc } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || ''; // Keep the search as a string
    const userId = searchParams.get('userId') || ''; // Keep the search as a string
  

    try {
        let teamQuery: { teamId: number }[] = [];

        if (type === 'coach') {
            teamQuery = await db.select({ teamId: teamCoaches.teamId })
                .from(teamCoaches)
                .where(eq(teamCoaches.coachId, Number(userId)));
        }
        
        if (type === 'player') {
            teamQuery = await db.select({ teamId: teamPlayers.teamId })
                .from(teamPlayers)
                .where(eq(teamPlayers.playerId, Number(userId)));
        }
        
        // Ensure teamQuery is always an array before mapping
        const teamIds = teamQuery ? teamQuery.map((team) => team.teamId) : [];
        
        return NextResponse.json(teamIds);
        

    } catch (error) {
        const err = error as any;
        console.error('Error fetching coaches:', error);

        // Return an error response if fetching fails
        return NextResponse.json(
            { message: 'Failed to fetch coaches' },
            { status: 500 }
        );
    }
}