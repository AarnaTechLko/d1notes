import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches, users } from "@/lib/schema";
import { eq, and, desc,count } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { generateRandomPassword } from "@/lib/helpers";
import { hash } from 'bcryptjs';
export async function POST(req: NextRequest) {
    const { id, type } = await req.json();
   if(type=='player')
   {
    await db.update(users).set({status:'Active', enterprise_id:null}).where(eq(users.id, id));
   }
   if(type=='coach')
    {
     await db.update(coaches).set({status:'Archived'}).where(eq(coaches.id, id));
    }
    
    return NextResponse.json({ success: true });
  }