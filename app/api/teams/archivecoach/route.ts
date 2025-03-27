import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamCoaches, coaches } from "@/lib/schema";
import { eq, and, desc,count } from "drizzle-orm";

export async function POST(req: NextRequest) { 
    
    //try and catch not working need to fix to help us in future
    try{
    
        const { id, teamId } = await req.json();

        const query = await db.select({player_id: teamCoaches.coachId}).from(teamCoaches).where(eq(teamCoaches.coachId,id));

        // console.log("query: ", query)

        if(query.length === 1){
            await db.update(coaches).set({status:'Archived'}).where(eq(coaches.id, id));
        }


        await db.delete(teamCoaches).where(
        and(
            eq(teamCoaches.coachId,id),
            eq(teamCoaches.teamId,teamId)
        ))
    }
    catch (error){
        console.error("Error processing request: ", error)
    }


    return NextResponse.json({ success: true });
  }