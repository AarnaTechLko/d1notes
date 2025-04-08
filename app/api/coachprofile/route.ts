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
  const { slug, loggeInUser } = await req.json();
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


    // const playersEnterpriseId = await db //get player's enterprise id (might not need to do this anymore if i'm pulling from teamPlayers and teamCoaches)
    //   .select({ enterprise_id: users.enterprise_id })
    //   .from(users)
    //   .where(eq(users.id, loggeInUser))
    //   .execute()

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
    
    let totalLicneses;
    const isRequested = requested.length;
    
    //checks whether 
    if (playersTeamAndEnterpriseId.length > 0 && coachesTeamAndEnterpriseId.length>0) {//if player is in an organization
      const playersEnterpriseId = playersTeamAndEnterpriseId[0].enterprise_id
      const playersTeamId = playersTeamAndEnterpriseId[0].team_id
      const coachesEnterpriseId = coachesTeamAndEnterpriseId[0].enterprise_id
      const coachesTeamId = coachesTeamAndEnterpriseId[0].team_id

      let availableLicenses;
      if (coachesEnterpriseId === playersEnterpriseId && coachesTeamId === playersTeamId) { //coach and player are part of the same org and team
        availableLicenses = await db.select().from(licenses).where(
          and(
            eq(licenses.enterprise_id, Number(coachesEnterpriseId)),
            ne(licenses.status, 'Consumed')
          )
        );
        console.log("available Licenses:", availableLicenses)
        if (availableLicenses.length <= 0) {
          totalLicneses = "outOfLicense";
        }
      }
      else {// coach is in enterprise but is not in players team
        totalLicneses = "notAvailable";
      }

    }
    // else if (playersTeamAndEnterpriseId.length <= 0 && coachesTeamAndEnterpriseId.length > 0) {//if player isn't in organization but coach is
    //   totalLicneses = "available"
    // }
    else if (playersTeamAndEnterpriseId.length > 0 && coachesTeamAndEnterpriseId.length <= 0) {//if player is in org but coach isn't
      totalLicneses = "notAvailable"
    }

    const evaluationCharges = await db.select().from(evaluation_charges).where(eq(evaluation_charges.coach_id, Number(coachlist[0].id)));
    return NextResponse.json({ coachdata: payload[0], evaluationlist: evaluationlist, isRequested: isRequested, totalLicneses: totalLicneses, evaluationCharges: evaluationCharges });
  } catch (error) {
    const err = error as any;
    console.error('Error fetching coaches:', error);
    return NextResponse.json({ message: 'Failed to fetch coaches', error }, { status: 500 });
  }
}