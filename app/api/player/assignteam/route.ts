// app/api/banners/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the path as per your setup
import { invitations, playerbanner, teamCoaches, teamPlayers } from '@/lib/schema'; // Import the playerbanner schema
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { playerId, teamId,type,enterpriseId,email } = await req.json();
    
        if (!playerId || !teamId) {
          return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }
        let data;
        if(type=='player')
        {
            const result = await db.insert(teamPlayers).values({
                teamId: teamId,
                playerId: playerId,
                enterprise_id:enterpriseId
                
              }).returning();

            await db.update(invitations).set(
                {
                    status:'Joined'
                }
            ).where(
                and(
                    eq(invitations.enterprise_id,enterpriseId),
                    eq(invitations.invitation_for,'player'),
                    eq(invitations.team_id,teamId),
                    eq(invitations.email,email),
                )
            );
        }

        if(type=='coach')
            {
                const result = await db.insert(teamCoaches).values({
                    teamId: teamId,
                    coachId: playerId,
                    enterprise_id:enterpriseId
                    
                  }).returning();
                  await db.update(invitations).set(
                    {
                        status:'Joined'
                    }
                ).where(
                    and(
                        eq(invitations.enterprise_id,enterpriseId),
                        eq(invitations.invitation_for,'coach'),
                        eq(invitations.team_id,teamId),
                        eq(invitations.email,email),
                    )
                );
            }
        
    
        return NextResponse.json({ success: true, data }, { status: 200 });
      } catch (error:any) {
        return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
      }
}
