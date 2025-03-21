import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { coaches, otps, licenses, coachaccount, playerEvaluation, teamCoaches, teamPlayers, users } from '../../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, between, lt, ilike, or, count, desc,sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 

  export async function PUT(req: NextRequest) {
    try {
        const { id} = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Player ID is required' }, { status: 400 });
        }
          await db.update(users).set({ enterprise_id: '', team_id: ''}).where(eq(users.id, id));
          await db.delete(teamPlayers).where(
              eq(teamPlayers.playerId,id)
            );

        return NextResponse.json({ success: true, message: 'Player removed successfully' });



    } catch (error) {
        console.error('Error removing player:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}


