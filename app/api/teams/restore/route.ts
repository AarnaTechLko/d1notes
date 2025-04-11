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
                .where(sql`${coaches.id} IN (${sql.join(coachesIds, sql`, `)})`);

                // .where(sql`${coaches.id} IN (${sql.join(coachesIds)})`);
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

    // Attempt to delete the team
    try {
        await db.delete(teams).where(eq(teams.id, id));
    } catch (err) {
        if (err instanceof Error) {
            console.error("Error deleting team:", err.message);
            return NextResponse.json({ success: false, message: `Error deleting team: ${err.message}` }, { status: 500 });
        } else {
            console.error("Unknown error deleting team:", err);
            return NextResponse.json({ success: false, message: 'Unknown error occurred while deleting team' }, { status: 500 });
        }
    }

    // Check if there are records in the teamCoaches table for the given team ID
    let coachesExist;
    try {
        coachesExist = await db.select().from(teamCoaches).where(eq(teamCoaches.teamId, id)).limit(1);
    } catch (err) {
          if (err instanceof Error) {
            console.error("Error fetching coaches:", err.message);
            return NextResponse.json({ success: false, message: `Error fetching coaches: ${err.message}` }, { status: 500 });
        } else {
            console.error("Unknown error fetching coaches:", err);
            return NextResponse.json({ success: false, message: 'Unknown error occurred while fetching coaches' }, { status: 500 });
        }
    }

    console.log(coachesExist);

    // Check if there are records in the teamPlayers table for the given team ID
    let playersExist;
    try {
        playersExist = await db.select().from(teamPlayers).where(eq(teamPlayers.teamId, id)).limit(1);
    } catch (err) {
       if (err instanceof Error) {
            console.error("Error fetching players:", err.message);
            return NextResponse.json({ success: false, message: `Error fetching players: ${err.message}` }, { status: 500 });
        } else {
            console.error("Unknown error fetching players:", err);
            return NextResponse.json({ success: false, message: 'Unknown error occurred while fetching players' }, { status: 500 });
        }
    }

    console.log(playersExist);

    // Perform deletions only if records exist
    if (coachesExist.length > 0) {
        try {
            await db.delete(teamCoaches).where(eq(teamCoaches.teamId, id));
        } catch (err) {
           if (err instanceof Error) {
                console.error("Error deleting coaches:", err.message);
                return NextResponse.json({ success: false, message: `Error deleting coaches: ${err.message}` }, { status: 500 });
            } else {
                console.error("Unknown error deleting coaches:", err);
                return NextResponse.json({ success: false, message: 'Unknown error occurred while deleting coaches' }, { status: 500 });
            }
        }
    }

    if (playersExist.length > 0) {
        try {
            await db.delete(teamPlayers).where(eq(teamPlayers.teamId, id));
        } catch (err) {
            if (err instanceof Error) {
                console.error("Error deleting players:", err.message);
                return NextResponse.json({ success: false, message: `Error deleting players: ${err.message}` }, { status: 500 });
            } else {
                console.error("Unknown error deleting players:", err);
                return NextResponse.json({ success: false, message: 'Unknown error occurred while deleting players' }, { status: 500 });
            }
        }
    } else {
        console.log("No records found for deletion.");
    }

    return NextResponse.json({ success: true, message: 'Team has been removed successfully' });
} catch (err) {
    if (err instanceof Error) {
        console.error('Unexpected error:', err.message);
        return NextResponse.json({ success: false, message: `Unexpected error: ${err.message}` }, { status: 500 });
    } else {
        console.error('Unknown unexpected error:', err);
        return NextResponse.json({ success: false, message: 'An unknown error occurred' }, { status: 500 });
    }
}
}
