import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { coaches, enterprises,joinRequest, playerEvaluation, teams, users } from '../../../../lib/schema'
import debug from 'debug';
import { eq ,and, isNotNull} from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { slug,loggeInUser } = await req.json();

    try {
        // Using 'like' with lower case for case-insensitive search
        const Clublist = await db
            .select()
            .from(enterprises)
            .where(
                eq(enterprises.slug, slug)
            )
            .limit(1)
            .execute();
        const payload = Clublist.map(club => ({
            organizationName: club.organizationName,
            contactPerson: club.contactPerson,
            address: club.address,
            createdAt: club.createdAt,
            slug: club.slug,
            id: club.id,

            country: club.country,
            state: club.state,
            city: club.city,

            logo: club.logo ? `${club.logo}` : null,
        }));

        const clubTeams=await db.select().from(teams).where(
            and(
            eq(teams.creator_id,Number(payload[0].id)),
            eq(teams.created_by,'Enterprise'),
            )
        ).execute();

         
            const clubCoaches=await db.select().from(coaches)
            .where(
                and(
                eq(coaches.enterprise_id, String(payload[0].id)),
                isNotNull(coaches.firstName)
                )
            ).execute();
         
            const requested=await db.select().from(joinRequest).where(
                and(
                  eq(joinRequest.player_id,loggeInUser),
                  eq(joinRequest.requestToID,payload[0].id),
                )).execute();
              
                const isRequested = requested.length;

                const clubPlayers=await db.select().from(users).where(
                    and(
                    eq(users.enterprise_id, String(payload[0].id)),
                    isNotNull(users.first_name)
                    )
                ).execute();
        return NextResponse.json({ clubdata: payload[0], clubTeams:clubTeams, coachesList:clubCoaches,isRequested:isRequested,clubPlayers:clubPlayers });
    } catch (error) {
        const err = error as any;
        console.error('Error fetching enterprises:', error);
        return NextResponse.json({ message: 'Failed to fetch Clubs' }, { status: 500 });
    }
}