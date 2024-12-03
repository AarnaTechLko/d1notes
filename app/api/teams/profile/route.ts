import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, coaches } from '../../../../lib/schema'
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
            .select({
                team_name: teams.team_name,
                id: teams.id,
                created_by: teams.created_by,
                description: teams.description,
                createdAt: teams.createdAt,
                cover_image: teams.cover_image,
                slug: teams.slug,
                logo: teams.logo,
                coach_id: teams.coach_id,
                firstName: coaches.firstName,
                lastName: coaches.lastName,
                team_type: teams.team_type,
                team_year: teams.team_year,
                


                clubName: coaches.clubName,
                qualifications: coaches.qualifications,

                coachimage: coaches.image,
                coachSlug: coaches.slug,

            })
            .from(teams)
            .where(
                eq(teams.slug, slug)
            )
            .innerJoin(coaches, eq(teams.coach_id, coaches.id))
            .limit(1)
            .execute();



        const payload = teamList.map(club => ({
            team_name: club.team_name,
            id: club.id,
            created_by: club.created_by,
            description: club.description,
            createdAt: club.createdAt,
            cover_image: club.cover_image,
            slug: club.slug,
            firstName: club.firstName,
            lastName: club.lastName,
            clubName: club.clubName,
            team_type: club.team_type,
            team_year: club.team_year,
            qualifications: club.qualifications,
            coachimage: club.coachimage,
            coachSlug: club.coachSlug,
            logo: club.logo ? `${club.logo}` : null,
        }));

        const teamplayersList = await db
            .select({
                firstName: users.first_name,
                lastName: users.last_name,
                slug: users.slug,
                image: users.image,
                position: users.position,
                grade_level: users.grade_level,
                location: users.location,
                height: users.height,
                weight: users.weight,
                player_id: teamPlayers.playerId,
                jersey: users.jersey,
            })
            .from(teamPlayers)
            .innerJoin(users, eq(users.id, teamPlayers.playerId))
            .where(eq(teamPlayers.teamId, payload[0].id));


        return NextResponse.json({ clubdata: payload[0], teamplayersList: teamplayersList });
    } catch (error) {
        const err = error as any;
        console.error('Error fetching teams:', error);
        return NextResponse.json({ message: 'Failed to fetch Teams' }, { status: 500 });
    }
}