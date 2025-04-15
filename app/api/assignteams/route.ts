// app/api/banners/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the path as per your setup
import { playerbanner, teamCoaches, teamPlayers } from '@/lib/schema'; // Import the playerbanner schema
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { playerId, teamIds,type,enterpriseId } = await req.json();
    
        // console.log("In the API, playerId: ", playerId, " next is the teamIds: ", teamIds, " now the type: ", type, " and finally the: ", enterpriseId)


        if (!playerId || !Array.isArray(teamIds)) {
          return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }
        let data;
        if(type=='player')
        {
              data = await Promise.all(teamIds.map(async (teamId) => {

                const alreadyExist = await db.select().from(teamPlayers).where(and(eq(teamPlayers.teamId,teamId),eq(teamPlayers.playerId, playerId), eq(teamPlayers.enterprise_id, enterpriseId)));

                // console.log(alreadyExist)

                if(alreadyExist.length > 0){
                  return null;
                }


                const result = await db.insert(teamPlayers).values({
                  teamId: teamId,
                  playerId: playerId,
                  enterprise_id:enterpriseId
                  
                }).returning();
                return result[0];
              }));
        }

        if(type=='coach')
            {
                  data = await Promise.all(teamIds.map(async (teamId) => {


                    const alreadyExist = await db.select().from(teamCoaches).where(and(eq(teamCoaches.teamId,teamId),eq(teamCoaches.coachId, playerId), eq(teamCoaches.enterprise_id, enterpriseId)));

                    console.log(alreadyExist)
    
                    if(alreadyExist.length > 0){
                      return null;
                    }


                    const result = await db.insert(teamCoaches).values({
                      teamId: teamId,
                      coachId: playerId,
                      enterprise_id:enterpriseId
                      
                    }).returning();
                    return result[0];
                  }));
            }
        
    
        return NextResponse.json({ success: true, data }, { status: 200 });
      } catch (error:any) {
        return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
      }
}
