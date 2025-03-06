// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { users, otps, licenses, teamPlayers, playerEvaluation } from '../../../../lib/schema'
import { eq, and, or, ilike, count, desc, sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
import jwt from 'jsonwebtoken';



export async function POST(req: NextRequest) {
    try {
      const { playerID, license } = await req.json();
  
      if (!playerID) {
        return NextResponse.json({ message: "Player ID is required" }, { status: 400 });
      }
  
      const playerIdNumber = Number(playerID);
      if (isNaN(playerIdNumber)) {
        return NextResponse.json({ message: "Invalid Player ID" }, { status: 400 });
      }

      // Restore player by updating status to 'Active'
      const updatedPlayer = await db
        .update(users)
        .set({ status: 'Active' })
        .where(eq(users.id, playerIdNumber))
        .returning();
  
      if (!updatedPlayer.length) {
        return NextResponse.json({ message: "Player not found or already active" }, { status: 404 });
      }
  
      // Mark license as consumed
      await db
        .update(licenses)
        .set({
          status: 'Consumed',
          used_by: playerIdNumber.toString(), 
          used_for: 'Player',
        })
        .where(eq(licenses.licenseKey, license));
  
      return NextResponse.json({ message: "Player restored successfully" }, { status: 200 });
  
    } catch (error: unknown) {
      if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
    }
  }

  export async function DELETE(req: NextRequest) {
    try {
        const { playerID } = await req.json();

        if (!playerID) {
            return NextResponse.json({ message: "Player ID is required" }, { status: 400 });
        }

        const playerIdNumber = Number(playerID);
        if (isNaN(playerIdNumber)) {
            return NextResponse.json({ message: "Invalid Player ID" }, { status: 400 });
        }

        // **OPTION 2: Remove from Team Players (If Required)**
        await db
            .delete(users)
            .where(eq(users.id, playerIdNumber));

        return NextResponse.json({ message: "Player deleted successfully" }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
    }
}