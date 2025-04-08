import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamCoaches, coaches, teams } from "@/lib/schema";
import { eq, and, desc,count } from "drizzle-orm";

export async function POST(req: NextRequest) { 
    
    //try and catch not working need to fix to help us in future
    try{
    
        const { id, teamId, enterprise_id } = await req.json();

        // console.log("enterprise_id: ", enterprise_id)

        //need to come back and implement another part of where clause that checks organization id once we have 
        //userOrgStatus set up

        const query = await db.select({team_id: teamCoaches.teamId}).from(teamCoaches).where(and(eq(teamCoaches.coachId,id),eq(teamCoaches.enterprise_id,enterprise_id)));

        // console.log("query: ", query)

        const activeTeams = query.map(async (c) => {
            //check to see if teams are active, if not then don't append
            await db.select().from(teams).where(and(eq(teams.id,c.team_id),eq(teams.status, "Active")))

        });
        if(activeTeams.length === 1){
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