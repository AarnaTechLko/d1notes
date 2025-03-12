import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, joinRequest, coaches, teamCoaches, evaluation_charges } from '../../../../lib/schema'
import debug from 'debug';
import { desc, eq, asc, and, ne } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { slug, loggeInUser } = await req.json();

    let coach;
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
                leage: teams.leage,
                coach_id: teams.coach_id,
                firstName: coaches.firstName,
                lastName: coaches.lastName,
                team_type: teams.team_type,
                team_year: teams.team_year,
                clubName: coaches.clubName,
                qualifications: coaches.qualifications,
                coachimage: coaches.image,
                coachSlug: coaches.slug,
                age_group: teams.age_group,

            })
            .from(teams)
            .where(
                eq(teams.slug, slug)
            )
            .leftJoin(coaches, eq(teams.coach_id, coaches.id))
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
            coach_id: club.coach_id,
            clubName: club.clubName,
            team_type: club.team_type,
            team_year: club.team_year,
            qualifications: club.qualifications,
            coachimage: club.coachimage,
            age_group: club.age_group,
            coachSlug: club.coachSlug,
            leage: club.leage,
            logo: club.logo ? `${club.logo}` : null,
        }));

        const teamplayersList = await db
            .selectDistinct({
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
                birthdate: users.birthday,
                graduation: users.graduation,
                facebook: users.facebook,
                instagram: users.instagram,
                linkedin: users.linkedin,
                youtube: users.youtube,
                xlink: users.xlink,
                id: users.id,
            })
            .from(teamPlayers)
            .innerJoin(users, eq(users.id, teamPlayers.playerId))
            .orderBy(asc(users.jersey))
            .where(and(eq(teamPlayers.teamId, payload[0].id), ne(users.first_name, '')))



        const coachesData = await db
            .selectDistinct({
                coachId: coaches.id,
                firstName: coaches.firstName,
                lastName: coaches.lastName,
                image: coaches.image,
                slug: coaches.slug,
                expectedCharge: coaches.expectedCharge
            })
            .from(teamCoaches)
            .innerJoin(coaches, eq(teamCoaches.coachId, coaches.id))
            .innerJoin(teams, eq(teamCoaches.teamId, teams.id))
            .where(and(eq(teamCoaches.teamId, payload[0].id), ne(coaches.firstName, '')))
            .execute();




        const requested = await db.select().from(joinRequest).where(
            and(
                eq(joinRequest.player_id, loggeInUser),
                eq(joinRequest.requestToID, payload[0].id),
            )).execute();

        const isRequested = requested.length;


        return NextResponse.json({ clubdata: payload[0], teamplayersList: teamplayersList, coach: coachesData, isRequested: isRequested });
    } catch (error) {
        const err = error as any;
        console.error('Error fetching teams:', error);
        return NextResponse.json({ message: err }, { status: 500 });
    }
}