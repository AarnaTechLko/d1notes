import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users } from '../../../../lib/schema'
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
        const teamList = await db
            .select()
            .from(teams)
            .where(
                eq(teams.slug, slug)
            )
            .limit(1)
            .execute();
        const payload = teamList.map(club => ({
            team_name: club.team_name,
            created_by: club.created_by,
            description: club.description,

            createdAt: club.createdAt,
            slug: club.slug,


            logo: club.logo ? `${club.logo}` : null,
        }));

        return NextResponse.json({ clubdata: payload[0] });
    } catch (error) {
        const err = error as any;
        console.error('Error fetching teams:', error);
        return NextResponse.json({ message: 'Failed to fetch Teams' }, { status: 500 });
    }
}