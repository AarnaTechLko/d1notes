import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamPlayers, users } from "@/lib/schema";
import { eq, and, exists ,desc,count } from "drizzle-orm";

export async function POST(req: NextRequest) { 
    
    //try and catch not working need to fix to help us in future
    try{
    
        const { id, teamId } = await req.json();

        const query = await db.select({player_id: teamPlayers.playerId}).from(teamPlayers).where(eq(teamPlayers.playerId,id));

        // console.log("query: ", query)

        if(query.length === 1){
            await db.update(users).set({status:'Archived'}).where(eq(users.id, id));
        }
        
        
        await db.delete(teamPlayers).where(
        and(
            eq(teamPlayers.playerId,id),
            eq(teamPlayers.teamId,teamId)
        ))
    }
    catch (error){
        console.error("Error processing request: ", error)
        return NextResponse.json({ success: false}, {status: 500})
    }


    return NextResponse.json({ success: true });
  }