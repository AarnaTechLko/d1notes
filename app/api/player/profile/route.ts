import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, coaches, playerbanner, enterprises, countries } from '../../../../lib/schema'
import debug from 'debug';
import { eq, sql,inArray,and,ne } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { slug } = await req.json();

    try {
        // Step 1: Fetch the user based on slug
        const user = await db
            .select({
                first_name: users.first_name,
                last_name: users.last_name,
                grade_level: users.grade_level,
                location: users.location,
                birthday: users.birthday,
                gender: users.gender,
                sport: users.sport,
                team: users.team,
                position: users.position,
                age_group: users.age_group,
                birth_year: users.birth_year,
                number: users.number,
                email: users.email,
                image: users.image,
                bio: users.bio,
                country: users.country,
                state: users.state,
                city: users.city,
                jersey: users.jersey,
                countrycode: users.countrycode,
                height: users.height,
                weight: users.weight,
                playingcountries: users.playingcountries,
                id: users.id,
                enterprise_id: users.enterprise_id,
                league: users.league,
                graduation: users.graduation,
                school_name: users.school_name,
    
                gpa: users.gpa,
               countryName:countries.name
        
              })
            .from(users)
            .leftJoin(
                countries, 
                eq(countries.id, sql<number>`CAST(${users.country} AS INTEGER)`) // ✅ Explicit cast using sql
              )
            .where(eq(users.slug, slug))
            .limit(1)
            .execute();

        if (!user.length) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Step 2: Fetch banners associated with the user
        const enterprisesList = await db
            .select()
            .from(enterprises)
            .where(eq(enterprises.id, Number(user[0].enterprise_id)))
            .execute();

        // Step 3: Get teams associated with the main player
        const teamsOfPlayer = await db
            .selectDistinct({
                teamId: teamPlayers.teamId,
                teamName: teams.team_name,
                teamLogo: teams.logo,
                teamSlug: teams.slug,
            })
            .from(teamPlayers)
            .leftJoin(teams, eq(teamPlayers.teamId, teams.id))
            .where(eq(teamPlayers.playerId, user[0].id))
            .execute();
            const enterprise=await db.select({clubname:enterprises.organizationName}).from(enterprises).where(eq(enterprises.id,Number(user[0].enterprise_id)))
        // Extract team IDs
        const teamIds = teamsOfPlayer.map((team) => team.teamId);

        if (teamIds.length === 0) {
            return NextResponse.json({
                clubdata: user[0],
                enterprisesList,
                clubname:enterprise[0],
                playerOfTheTeam: [],
                teamPlayers: [],
            });
        }
        const coachesList = await db
        .select({
            teamId: teams.id,
            coachId: teams.coach_id,
            coachFirstName: coaches.firstName,
            coachImage: coaches.image,
            coachLastName: coaches.lastName,
            rating: coaches.rating,
            slug: coaches.slug,
        })
        .from(teams)
        .leftJoin(coaches, eq(teams.coach_id, coaches.id))
        .where(inArray(teams.id, teamIds))
        .execute();


        // Step 4: Fetch all players in those teams using SQL `IN` clause
        const placeholders = teamIds.map(() => '?').join(',');
        const allTeamPlayers = await db
            .select({
                playerId: teamPlayers.playerId,
                firstName: users.first_name,
                lastName: users.last_name,
                jersey: users.jersey,
                grade_level: users.grade_level,
                height: users.height,
                weight: users.weight,
                playerSlug: users.slug,
                position: users.position,
                slug: users.slug,
                image: users.image,
                teamId: teamPlayers.teamId,
            })
            .from(teamPlayers)
            .leftJoin(users, eq(teamPlayers.playerId, users.id))
            .where(
                and(
                    inArray(teamPlayers.teamId, teamIds),
                    ne(teamPlayers.playerId,  user[0].id),
                )
            ) 
            
            .execute();
 
        return NextResponse.json({
            clubdata: user[0],
            clubname:enterprise[0],
            enterprisesList,
            playerOfTheTeam: teamsOfPlayer,
            teamPlayers: allTeamPlayers,
            coachesList:coachesList
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
    }
}