import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamPlayers, users, teams } from "@/lib/schema";
import { eq, and, exists ,desc,count } from "drizzle-orm";

export async function POST(req: NextRequest) { 
    
    //try and catch not working need to fix to help us in future
    try{
    
        const { id, teamId, enterprise_id } = await req.json();

        // const query = await db.select({team_id: teamPlayers.teamId}).from(teamPlayers).where(eq(teamPlayers.enterprise_id,enterprise_id));

        const query = await db.select({team_id: teamPlayers.teamId}).from(teamPlayers).where(eq(teamPlayers.playerId,id));

        const activeTeams = query.map(async (p) => {
            //check to see if teams are active, if not then don't append
            await db.select().from(teams).where(and(eq(teams.id,p.team_id),eq(teams.status, "Active")))

        });

        // console.log("query: ", query)

        if(activeTeams.length === 1){
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