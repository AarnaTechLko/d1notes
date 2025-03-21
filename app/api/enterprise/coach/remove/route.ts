import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { coaches, otps, licenses, coachaccount, playerEvaluation, teamCoaches } from '../../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, between, lt, ilike, or, count, desc,sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 

  export async function PUT(req: NextRequest) {
    try {
        const { id} = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Coach ID is required' }, { status: 400 });
        }
          await db.update(coaches).set({ enterprise_id: '', team_id: ''}).where(eq(coaches.id, id));
          await db.delete(teamCoaches).where(
            and(
              eq(teamCoaches.coachId,id),
            )
            );

        return NextResponse.json({ success: true, message: 'Coach removed successfully' });



    } catch (error) {
        console.error('Error removing coach:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}


