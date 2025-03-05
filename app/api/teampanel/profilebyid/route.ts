import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { coaches, teams, joinRequest, playerEvaluation, users, states, countries } from '../../../../lib/schema'
import debug from 'debug';
import { eq, and, isNotNull } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { clubid } = await req.json();

    try {
        const clubDetails = await db.select({
            id: teams.id,
            team_name: teams.team_name,
            manager_name: teams.manager_name,
            manager_email: teams.manager_email,
            manager_phone: teams.manager_phone,
            countryCodes: teams.countryCodes,
            logo: teams.logo,
            description: teams.description,
            created_by: teams.created_by,
            club_id: teams.club_id,
            cover_image: teams.cover_image,
            status: teams.status,
            country: teams.country,
            countryName: countries.name,
            state: teams.state,
            stateName: states.name,
            address: teams.address,
            city: teams.city,
            facebook: teams.facebook,
            instagram: teams.instagram,
            linkedin: teams.linkedin,
            xlink: teams.xlink,
            youtube: teams.youtube,

        }).from(teams).leftJoin(
            countries,
            eq(countries.id, isNaN(Number(teams.country)) ? 231 : Number(teams.country))
        ).leftJoin(
            states,
            eq(states.id, isNaN(Number(teams.state)) ? 231 : Number(teams.state))
        )


            .where(eq(teams.id, clubid));
        if (clubDetails.length > 0) {
            return NextResponse.json(clubDetails);
        }
        else {

        }

    } catch (error) {
        const err = error as any;
        console.error('Error fetching teams:', error);
        return NextResponse.json({ message: 'Failed to fetch Clubs' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { organizationName, id, contactPerson, owner_name, address, affiliationDocs, city, country, countryCodes, email, logo, mobileNumber } = await req.json();

    try {
        await db.update(teams).set(
            {
                team_name: organizationName,
                manager_name: contactPerson,

                address: address,

                city: city,
                country: country,
                countryCodes: countryCodes,
                manager_email: email,
                logo: logo,
                manager_phone: mobileNumber,

            }).where(eq(teams.id, id));
        return NextResponse.json({ message: 'Club updated' }, { status: 200 });
    } catch (error) {

        return NextResponse.json({ message: 'Failed to Update Clubs' }, { status: 500 });
    }

}