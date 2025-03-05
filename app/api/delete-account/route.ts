// app/api/banners/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the path as per your setup
import { coaches, enterprises, playerbanner, teamCoaches, teamPlayers, teams, users } from '@/lib/schema'; // Import the playerbanner schema
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { type, userId } = await req.json();
        if (type == 'player') {
            await db.update(users).set({ status: 'Deactivated' }).where(eq(users.id,Number(userId)));
        }
        if (type == 'coach') {
            await db.update(coaches).set({ status: 'Deactivated' }).where(eq(coaches.id,Number(userId)));
        }
        if (type == 'team') {
            await db.update(teams).set({ status: 'Deactivated' }).where(eq(teams.id,Number(userId)));
        }
        if (type == 'enterprise') {
            await db.update(enterprises).set({ status: 'Deactivated' }).where(eq(enterprises.id,Number(userId)));
        }


        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
    }
}
