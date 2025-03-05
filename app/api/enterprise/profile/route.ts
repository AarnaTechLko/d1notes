import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { coaches, countries, enterprises, joinRequest, playerEvaluation, teams, users } from '../../../../lib/schema'
import debug from 'debug';
import { eq, and, isNotNull,sql } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { slug, loggeInUser } = await req.json();

    try {
        // Using 'like' with lower case for case-insensitive search
        const Clublist = await db
        .select({
            organizationName: enterprises.organizationName,
            contactPerson: enterprises.contactPerson,
            address: enterprises.address,
            createdAt: enterprises.createdAt,
            slug: enterprises.slug,
            id: enterprises.id,
            country: enterprises.country,
            state: enterprises.state,
            city: enterprises.city,
            logo: enterprises.logo,
            country_name: countries.name,
            instagram: enterprises.instagram,
            facebook: enterprises.facebook,
            linkedin: enterprises.linkedin,
            youtube: enterprises.youtube,
            xlink: enterprises.xlink,
        })
        .from(enterprises)
        .leftJoin(countries, eq(countries.id, sql`CAST(${enterprises.country} AS INTEGER)`))

        .where(eq(enterprises.slug, slug)) // Ensure slug is a string
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
            country_name: club.country_name,
            instagram: club.instagram,
            facebook: club.facebook,
            linkedin: club.linkedin,
            youtube: club.youtube,
            xlink: club.xlink,
            logo: club.logo ? `${club.logo}` : null,
        }));

        const clubTeams = await db.select().from(teams).where(
            and(
                eq(teams.creator_id, Number(payload[0].id)),
                eq(teams.created_by, 'Enterprise'),
            )
        ).execute();


        const clubCoaches = await db.select().from(coaches)
            .where(
                and(
                    eq(coaches.enterprise_id, String(payload[0].id)),
                    isNotNull(coaches.firstName)
                )
            ).execute();

        const requested = await db.select().from(joinRequest).where(
            and(
                eq(joinRequest.player_id, loggeInUser),
                eq(joinRequest.requestToID, payload[0].id),
            )).execute();

        const isRequested = requested.length;

        const clubPlayers = await db.select().from(users).where(
            and(
                eq(users.enterprise_id, String(payload[0].id)),
                isNotNull(users.first_name)
            )
        ).execute();
        return NextResponse.json({ clubdata: payload[0], clubTeams: clubTeams, coachesList: clubCoaches, isRequested: isRequested, clubPlayers: clubPlayers });
    } catch (error) {
        const err = error as any;
        console.error('Error fetching enterprises:', error);
        return NextResponse.json({ message: err }, { status: 500 });
    }
}