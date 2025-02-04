import { NextRequest, NextResponse } from 'next/server';
import { getSession } from "next-auth/react";
import { db } from '../../../lib/db';
import { users, coaches, teams } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest) {
    try {
        const session = await getSession({ req: req as any });
        const body = await req.json();
        const playerId = body.playerId;
        const state = body.state;
        const type = body.type;

        let updateData: any = {
            id: playerId || null,
            visibility: state || null,
        };

        if (type === 'Player') {
            await db.update(users).set(updateData).where(eq(users.id, playerId)).execute();
        }

        if (type === 'Coach') {
            await db.update(coaches).set(updateData).where(eq(coaches.id, playerId)).execute();
        }
        if (type === 'Team') {
            await db.update(teams).set(updateData).where(eq(teams.id, playerId));
        }

        if (session?.user) {
            // Update session visibility manually
            session.user.visibility = state || session.user.visibility;
            // You can manually update session using `next-auth`'s `updateSession` function.
            await fetch('/api/auth/session', { method: 'GET' });
        }

        return NextResponse.json({ success: true, message: 'Visibility Status Updated' }, { status: 200 });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ success: false, message: 'Failed to update profile.' }, { status: 500 });
    }
}
