import { NextRequest, NextResponse } from 'next/server';
import { getServerSession} from "next-auth";
import { getSession } from "next-auth/react";

import { db } from '../../../lib/db';
import { users, coaches, teams } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest) {
    try {

        //issue with getSession
        // const session = await getSession({ req: req as any });

        // console.log("req: ", req)

        // const session = await getServerSession({ req });
        const body = await req.json();
        const playerId = body.playerId;
        const state = body.state;
        const type = body.type;

        // console.log("session: ", session)

        // console.log("body: ", body)

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

        // if (type === 'Player') {
        //     await db.update(users).set(state).where(eq(users.id, playerId)).execute();
        // }

        // if (type === 'Coach') {
        //     await db.update(coaches).set(state).where(eq(coaches.id, playerId)).execute();
        // }
        // if (type === 'Team') {
        //     await db.update(teams).set(state).where(eq(teams.id, playerId));
        // }


        // await fetch(process.env.NEXTAUTH_URL + '/api/auth/session', { method: 'GET' });

        // if (session?.user) {

            // console.log("I'm heres")

            // Update session visibility manually
            // session.user.visibility = state || session.user.visibility;
            // You can manually update session using `next-auth`'s `updateSession` function.
            // const response = await fetch('/api/auth/session', { method: 'GET' });
            // const data = await response.json()
            // console.log("data: ", data)
        // }

        return NextResponse.json({ success: true, message: 'Visibility Status Updated', state: state }, { status: 200 });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ success: false, message: 'Failed to update profile.' }, { status: 500 });
    }
}
