import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches, users } from "@/lib/schema";
import { eq, and, desc,count } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { generateRandomPassword } from "@/lib/helpers";
import { hash } from 'bcryptjs';
export async function POST(req: NextRequest) { 
    const { id, type, club_id } = await req.json();
   if(type=='player')
   {
    await db.update(users).set({status:'Archived'}).where(eq(users.id, id));
    await db.delete(teamPlayers).where(
      and(
        eq(teamPlayers.playerId,id),
        eq(teamPlayers.enterprise_id,club_id)
    )
  );

   }
   if(type=='coach')
    {
     await db.update(coaches).set({status:'Archived'}).where(eq(coaches.id, id));

     await db.delete(teamCoaches).where(
      and(
        eq(teamCoaches.coachId,id),
        eq(teamCoaches.enterprise_id,club_id)
    )
  );
    }
    
    return NextResponse.json({ success: true });
  }