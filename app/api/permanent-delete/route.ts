// app/api/banners/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the path as per your setup
import { coaches, enterprises, playerbanner, teamCoaches, teamPlayers, teams, users } from '@/lib/schema'; // Import the playerbanner schema
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { type, email } = await req.json();
        if (type == 'player') {
            await db.update(users).set({ email: email+'-Deactivated' }).where(eq(users.email,email));
        }
        if (type == 'coach') {
            await db.update(coaches).set({ email: email+'-Deactivated' }).where(eq(coaches.email,email));
        }
        if (type == 'team') {
            await db.update(teams).set({ manager_email: email+'-Deactivated' }).where(eq(teams.manager_email,email));
        }
        if (type == 'enterprise') {
            await db.update(enterprises).set({ email: email+'-Deactivated' }).where(eq(enterprises.email,email));
        }


        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
    }
}
