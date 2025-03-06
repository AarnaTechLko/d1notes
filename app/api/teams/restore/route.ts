import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches, users } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { generateRandomPassword } from "@/lib/helpers";
import { hash } from 'bcryptjs';


// ---------------------- RESTORE TEAM ----------------------
export async function PUT(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, message: 'Team ID is required' }, { status: 400 });
        }

        // Archive the team instead of deleting
        await db.update(teams).set({ status: 'Active' }).where(eq(teams.id, id));

        // Get the list of coach IDs associated with the team
        const coachesInTeam = await db
            .select({ coachId: teamCoaches.coachId }) // Use correct select syntax
            .from(teamCoaches)
            .where(eq(teamCoaches.teamId, id)); // Changed 'team_id' to 'teamId'

        const coachesIds = coachesInTeam.map((entry) => entry.coachId);

        if (coachesIds.length > 0) {
            await db
                .update(coaches)
                .set({ status: 'Active' } as any)
                .where(sql`${coaches.id} IN (${sql.join(coachesIds)})`);
        }

        // Get the list of player IDs associated with the team
        const playersInTeam = await db
            .select({ playerId: teamPlayers.playerId }) // Use correct select syntax
            .from(teamPlayers)
            .where(eq(teamPlayers.teamId, id)); // Corrected to filter by 'teamId' instead of 'playerId'

        const playersIds = playersInTeam.map((entry) => entry.playerId);

        if (playersIds.length > 0) {
            await db
                .update(users)
                .set({ status: 'Active' } as any)
                .where(sql`${users.id} IN (${sql.join(playersIds)})`);
        }

        return NextResponse.json({ success: true, message: 'Team and related players and coaches archived successfully' });
    } catch (error) {
        console.error('Error archiving team:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}


// ---------------------- PERMANENT DELETE TEAM ----------------------
export async function DELETE(req: NextRequest) {

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, message: 'Team ID is required' }, { status: 400 });
        }

        const coachesInTeam = await db
            .select({ coachId: teamCoaches.coachId }) // Use correct select syntax
            .from(teamCoaches)
            .where(eq(teamCoaches.teamId, id)); // Changed 'team_id' to 'teamId'

        const coachesIds = coachesInTeam.map((entry) => entry.coachId);

        if (coachesIds.length > 0) {
            await db
                .delete(coaches)
                .where(sql`${coaches.id} IN (${sql.join(coachesIds)})`);
        }

        // Get the list of player IDs associated with the team (corrected filtering by teamId)
        const playerInTeam = await db
            .select({ playerId: teamPlayers.playerId }) // Selecting playerId
            .from(teamPlayers)
            .where(eq(teamPlayers.teamId, id)); // Filtering by teamId

        const playersIds = playerInTeam.map((entry) => entry.playerId);

        if (playersIds.length > 0) {
            await db
                .delete(users)
                .where(sql`${users.id} IN (${sql.join(playersIds)})`); // Corrected delete query for users
        }


        await db.delete(teams).where(eq(teams.id, id));

        return NextResponse.json({ success: true, message: 'Team and related players and coaches archived successfully' });
    } catch (error) {
        console.error('Error archiving team:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
