import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, coaches, playerbanner, enterprises, countries,evaluationResults } from '../../../../lib/schema'
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
                countryName:countries.name,
                visibility:users.visibility
        
              })
            .from(users)
            .leftJoin(
                countries, 
                eq(countries.id, sql<number>`CAST(${users.country} AS INTEGER)`) // ✅ Explicit cast using sql
              )
            .where(eq(users.slug, slug))
            .limit(1)
            .execute();

        // console.log("Testing stuff: ", user[0])


        if (user[0].visibility === "off"){
            return NextResponse.json({ error: 'Player is set to private' }, { status: 403 });     
        }

        if (!user.length) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }
    // const playerId = user[0].id;


    //     // Step 2: Fetch average of overallAverage from requestEvaluation
    // const overallAverageData = await db
    //   .select({ overallAverage: evaluationResults.overallAverage })
    //   .from(evaluationResults)
    //   .where(eq(evaluationResults.playerId, playerId))
    //   .execute();

    // const total = overallAverageData.reduce((acc, curr) => acc + (Number(curr.overallAverage) || 0), 0);
    // const averageRating =
    //   overallAverageData.length > 0
    //     ? Number((total / overallAverageData.length).toFixed(2))
    //     : null;

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
 
        // Step 5: Fetch all organizations related to player       
        const allOrgs = await db.selectDistinct({

            organizationId: enterprises.id,
            logo: enterprises.logo,
            organizationName: enterprises.organizationName,
            slug: enterprises.slug,
            country: enterprises.country,
            countryName: countries.name
        })
        .from(enterprises)
        .where(eq(enterprises.id, Number(user[0].enterprise_id)))
        .leftJoin(countries, eq(countries.id, sql<number>`CAST(${enterprises.country} AS INTEGER)`))
        .execute();



            
        return NextResponse.json({
            clubdata: user[0],
            clubname:enterprise[0],
            enterprisesList,
            playerOfTheTeam: teamsOfPlayer,
            teamPlayers: allTeamPlayers,
            playerOrganizations: allOrgs,
            coachesList:coachesList,
            //  averageRating,

        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
    }
}

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const playerIdParam = searchParams.get("playerId");

//   if (!playerIdParam) {
//     return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
//   }

//   // Convert playerId string to number
//   const playerId = Number(playerIdParam);
//   if (isNaN(playerId)) {
//     return NextResponse.json({ error: "Player ID must be a valid number" }, { status: 400 });
//   }

//   // Fetch all overallAverage values for this player
//   const overallAverageData = await db
//     .select({ overallAverage: evaluationResults.overallAverage })
//     .from(evaluationResults)
//     .where(eq(evaluationResults.playerId, playerId)); // now playerId is a number

//   // Calculate total and average
//   const total = overallAverageData.reduce(
//     (acc, curr) => acc + (Number(curr.overallAverage) || 0),
//     0
//   );

//   const averageRating =
//     overallAverageData.length > 0
//       ? Number((total / overallAverageData.length).toFixed(2))
//       : null;

//   return NextResponse.json({
//     playerId,
//     averageRating,
//   });
// }

export async function GET() {
  try {
    // Fetch all evaluations with a valid playerId
    const allEvaluations = await db
      .select({
        playerId: evaluationResults.playerId,
        overallAverage: evaluationResults.overallAverage,
      })
      .from(evaluationResults)
      .where(eq(evaluationResults.playerId, evaluationResults.playerId)); // This is just to show join condition if needed

    // Group by playerId and compute averages in JS
    const grouped: Record<number, number[]> = {};

    allEvaluations.forEach((entry) => {
      const pid = Number(entry.playerId);
      const score = Number(entry.overallAverage);
      if (!grouped[pid]) grouped[pid] = [];
      if (!isNaN(score)) grouped[pid].push(score);
    });

    const results = Object.entries(grouped).map(([playerId, scores]) => {
      const total = scores.reduce((sum, val) => sum + val, 0);
      const avg = Number((total / scores.length).toFixed(2));
      return { playerId: Number(playerId), averageRating: avg };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error computing average ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
