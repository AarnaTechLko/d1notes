import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches, users } from "@/lib/schema";
import { eq, and, desc,count } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { generateRandomPassword } from "@/lib/helpers";
import { hash } from 'bcryptjs';
export async function POST(req: NextRequest) { 
    const { id, type, team_id } = await req.json();
   if(type=='player')
   {
    await db.update(users).set({team_id: '', status:'Archived'}).where(eq(users.id, id));
    await db.delete(teamPlayers).where(
      and(
        eq(teamPlayers.playerId,id),
        eq(teamPlayers.teamId,team_id)
    )
  );

   }
   if(type=='coach')
    {
      console.log("test", team_id)

     await db.update(coaches).set({team_id: '', status:'Archived'}).where(eq(coaches.id, id));

     await db.delete(teamCoaches).where(
      and(
        eq(teamCoaches.coachId,id),
        eq(teamCoaches.teamId,team_id)
    )
  );
    }
    
    return NextResponse.json({ success: true });
  }