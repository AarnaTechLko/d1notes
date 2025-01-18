import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches, licenses, messages } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { generateRandomPassword } from "@/lib/helpers";
import { hash } from 'bcryptjs';

export async function DELETE(req: NextRequest) {
    const { id, type, teamid } = await req.json();

    if (type === 'player') {
        try{
        await db.delete(teamPlayers).where(
            and(
                eq(teamPlayers.teamId, teamid),
                eq(teamPlayers.playerId, id),

            )
        );

        await db.update(licenses)
            .set({ 
                status: 'Free',
                used_for:null,
                used_by:null,

             })
            .where(
                and(
                    eq(licenses.used_for, 'Player'),
                    eq(licenses.used_by, id),
            )
        );
    }
 catch (error) {
    return NextResponse.json({ success: false, messages:error },{status:500});
  }

    }
    else {
        try{
        await db.delete(teamCoaches).where(
            and(
                eq(teamCoaches.teamId, teamid),
                eq(teamCoaches.coachId, id),

            )
        );

        await db.update(licenses)
        .set({ 
            status: 'Free',
            used_for:null,
            used_by:null,

         })
        .where(
            and(
                eq(licenses.used_for, 'Coach'),
                eq(licenses.used_by, id),
        )
    );
}
catch (error) {
   return NextResponse.json({ success: false, messages:error },{status:500});
 }
    }
    return NextResponse.json({ success: true });
}