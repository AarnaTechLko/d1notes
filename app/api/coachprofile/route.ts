import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { coaches, joinRequest, playerEvaluation, users, countries, licenses, evaluation_charges, teamPlayers, teamCoaches } from '../../../lib/schema'
import debug from 'debug';
import { eq, and, ne } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
  const { slug, loggeInUser, userType } = await req.json();
  if (!loggeInUser) {
    return NextResponse.json({message: "session not found"},{status: 400})
  }
  try {

    // Using 'like' with lower case for case-insensitive search
    const coachlist = await db //get information about the coach
      .select({
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        id: coaches.id,
        expectedCharge: coaches.expectedCharge,
        createdAt: coaches.createdAt,
        slug: coaches.slug,
        rating: coaches.rating,
        gender: coaches.gender,
        location: coaches.location,
        sport: coaches.sport,
        clubName: coaches.clubName,
        currency: coaches.currency,
        qualifications: coaches.qualifications,
        certificate: coaches.certificate,
        country: countries.name,
        state: coaches.state,
        city: coaches.city,
        enterprise_id: coaches.enterprise_id,
        image: coaches.image,
        facebook: coaches.facebook,
        linkedin: coaches.linkedin,
        instagram: coaches.instagram,
        xlink: coaches.xlink,
        youtube: coaches.youtube,
        license: coaches.license,
        cv: coaches.cv,
        licenseType: coaches.license_type,
      })
      .from(coaches)
      .leftJoin(
        countries,
        eq(countries.id, isNaN(Number(coaches.country)) ? 231 : Number(coaches.country)) // Prevent NaN error
      )
      .where(
        eq(coaches.slug, slug)
      )
      .limit(1)
      .execute();
    const payload = coachlist.map(coach => ({
      firstName: coach.firstName,
      lastName: coach.lastName,
      id: coach.id,
      expectedCharge: coach.expectedCharge,
      createdAt: coach.createdAt,
      slug: coach.slug,
      rating: coach.rating,
      gender: coach.gender,
      location: coach.location,
      sport: coach.sport,
      clubName: coach.clubName,
      currency: coach.currency,
      qualifications: coach.qualifications,
      certificate: coach.certificate,
      country: coach.country,
      state: coach.state,
      city: coach.city,
      enterprise_id: coach.enterprise_id,
      facebook: coach.facebook,
      linkedin: coach.linkedin,
      instagram: coach.instagram,
      xlink: coach.xlink,
      youtube: coach.youtube,
      license: coach.license,
      cv: coach.cv,
      licenseType: coach.licenseType,
      image: coach.image ? `${coach.image}` : null,
    }));


    const evaluationlist = await db
      .select({
        id: playerEvaluation.id,
        review_title: playerEvaluation.review_title,
        rating: playerEvaluation.rating,
        first_name: users.first_name, // Assuming the users table has a `name` field
        last_name: users.last_name, // Assuming the users table has an `image` field
        image: users.image,
        remarks: playerEvaluation.remarks,
      })
      .from(playerEvaluation)
      .innerJoin(users, eq(playerEvaluation.player_id, users.id)) // Join condition
      .where(
        and(
          eq(playerEvaluation.coach_id, coachlist[0].id),
          eq(playerEvaluation.status, 2))
      )
      .execute();

    const requested = await db.select().from(joinRequest).where(
      and(
        eq(joinRequest.player_id, loggeInUser),
        eq(joinRequest.requestToID, coachlist[0].id),
      )).execute();

    
    let totalLicense = "available";
    const isRequested = requested.length;

    if (userType === "player") {
      //See if player is part of an organization by retrieving info from users table
      const playersEnterpriseId = await db
        .select({ enterprise_id: users.enterprise_id })
        .from(users)
        .where(eq(users.id, loggeInUser))
        .execute()
      const playerIsPartOfEnterprise = !!playersEnterpriseId[0].enterprise_id

      if (playerIsPartOfEnterprise) {//if a player is part of an organization

        // get players team id and enterprise id
        const playersTeamAndEnterpriseId = await db
          .select({ team_id: teamPlayers.teamId, enterprise_id: teamPlayers?.enterprise_id })
          .from(teamPlayers)
          .where(eq(teamPlayers.playerId, loggeInUser))
          .execute()

        // get coaches team id and enterprise id
        const coachesTeamAndEnterpriseId = await db
          .select({ team_id: teamCoaches.teamId, enterprise_id: teamCoaches?.enterprise_id })
          .from(teamCoaches)
          .where(eq(teamCoaches.coachId, coachlist[0].id))
          .execute()

        if (playerIsPartOfEnterprise && playersTeamAndEnterpriseId.length > 0) {//first checks if they are part of an enterprise, then check if they are part of a team/teams
          //looks for intersections to see if player and coach are on the same team and org
          const isSameEnterpriseAndTeam = playersTeamAndEnterpriseId.filter(item1 =>
            coachesTeamAndEnterpriseId.some(item2 =>
              item1.team_id === item2.team_id && item1.enterprise_id === item2.enterprise_id
            )
          )
          let availableLicenses;
          if (isSameEnterpriseAndTeam.length > 0) { //if coach and player are part of the same org and team
            availableLicenses = await db.select().from(licenses).where(
              and(
                eq(licenses.enterprise_id, Number(coachlist[0].enterprise_id)),
                ne(licenses.status, 'Consumed')
              )
            );
            if (availableLicenses.length <= 0) {//if we are out of evaluations
              totalLicense = "outOfLicense";
            }//otherwise we do not assign totalLicense and leave it as "available"
          }
          else {// otherwise coach and player are not part of the same org or team or both
            totalLicense = "notAvailable";
          }

        }
        else {//otherwise player has not been assigned a team just yet and should not be able to request evaluations from any coach
          totalLicense = "notAvailable";
        }
      }
    }
    
    const evaluationCharges = await db.select().from(evaluation_charges).where(eq(evaluation_charges.coach_id, Number(coachlist[0].id)));
    return NextResponse.json({ coachdata: payload[0], evaluationlist: evaluationlist, isRequested: isRequested, totalLicneses: totalLicense, evaluationCharges: evaluationCharges });
  } catch (error) {
    const err = error as any;
    console.error('Error fetching coaches:', error);
    return NextResponse.json({ message: 'Failed to fetch coaches', error }, { status: 500 });
  }
}