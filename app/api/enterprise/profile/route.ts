import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coaches, enterprises, joinRequest, playerEvaluation, teams, users, countries } from '@/lib/schema'; 
import { eq, and, isNotNull } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { slug, loggeInUser } = await req.json();

        // Fetch club details
        const Clublist = await db
            .select({
                id: enterprises.id,
                organizationName: enterprises.organizationName,
                contactPerson: enterprises.contactPerson,
                address: enterprises.address,
                createdAt: enterprises.createdAt,
                slug: enterprises.slug,
                country: countries.name, // Get country name
                state: enterprises.state,
                city: enterprises.city,
                logo: enterprises.logo,
            })
            .from(enterprises)
            .leftJoin(
                countries,
                eq(countries.id, isNaN(Number(enterprises.country)) ? 231 : Number(enterprises.country)) // Corrected
            )
            .where(eq(enterprises.slug, slug))
            .limit(1)
            .execute();

        if (Clublist.length === 0) {
            return NextResponse.json({ message: 'Club not found' }, { status: 404 });
        }

        const clubData = Clublist[0];

        // Fetch club teams
        const clubTeams = await db
            .select()
            .from(teams)
            .where(
                and(
                    eq(teams.creator_id, Number(clubData.id)),
                    eq(teams.created_by, 'Enterprise')
                )
            )
            .execute();

        // Fetch club coaches
        const clubCoaches = await db
            .select()
            .from(coaches)
            .where(
                and(
                    eq(coaches.enterprise_id, String(clubData.id)),
                    isNotNull(coaches.firstName)
                )
            )
            .execute();

        // Fetch join requests
        let isRequested = 0;
        if (loggeInUser) {
            const requested = await db
                .select()
                .from(joinRequest)
                .where(
                    and(
                        eq(joinRequest.player_id, loggeInUser),
                        eq(joinRequest.requestToID, clubData.id)
                    )
                )
                .execute();
            isRequested = requested.length > 0 ? 1 : 0;
        }

        // Fetch club players
        const clubPlayers = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.enterprise_id, String(clubData.id)),
                    isNotNull(users.first_name)
                )
            )
            .execute();

        return NextResponse.json({
            clubdata: clubData,
            clubTeams,
            coachesList: clubCoaches,
            isRequested,
            clubPlayers,
        });
    } catch (error) {
        console.error('Error fetching enterprises:', error);
        return NextResponse.json(
            { message: 'Failed to fetch Clubs' },
            { status: 500 }
        );
    }
}
