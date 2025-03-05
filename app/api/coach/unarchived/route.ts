import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches, users } from "@/lib/schema";
import { eq, and, desc,count } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { generateRandomPassword } from "@/lib/helpers";
import { hash } from 'bcryptjs';
export async function POST(req: NextRequest) { 
    const { coachId, type, teamId, club_id } = await req.json();
   if(type=='player')
   {
    await db.update(users).set({status:'Active'}).where(eq(users.id, coachId));
    await db.insert(teamPlayers).values(
        { 
            playerId: coachId,
            enterprise_id: club_id,
            teamId: teamId,

         }
    );
    
   }
   if(type=='coach')
    {
        await db.update(coaches).set({status:'Active'}).where(eq(coaches.id, coachId));
        await db.insert(teamCoaches).values(
            { 
                coachId: coachId,
                enterprise_id: club_id,
                teamId: teamId,
    
             }
        );
    }
    
    return NextResponse.json({ success: true });
  }