import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { enterprises, playerEvaluation, users } from '../../../../lib/schema'
import debug from 'debug';
import { eq } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { slug } = await req.json();

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

            country: club.country,
            state: club.state,
            city: club.city,

            logo: club.logo ? `${club.logo}` : null,
        }));

        return NextResponse.json({ clubdata: payload[0] });
    } catch (error) {
        const err = error as any;
        console.error('Error fetching enterprises:', error);
        return NextResponse.json({ message: 'Failed to fetch Clubs' }, { status: 500 });
    }
}