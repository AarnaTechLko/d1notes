// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { users, otps, licenses, teamPlayers } from '../../../../../lib/schema'
import debug from 'debug';
import { eq, and, gt, or, ilike, count, desc } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

import { SECRET_KEY } from '@/lib/constants';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import next from 'next';



export async function POST(req: NextRequest) {

  const { license, enterprise_id, ownerType, first_name, email, last_name, grade_level, location, birthday, gender, sport, team, position, number, country, state, city, bio, jersey, league, countrycode, imageFile,playingcountries,height,weight, image,teamId, coach_id, graduation,parent_id} = await req.json();
   

  
  const emailCheck=(await db.select().from(users).where(eq(users.email, email))).length;
  if(emailCheck>0){
    return NextResponse.json({ message: "This Email ID is already in use." }, { status: 500 });
  }
   



  const checkLicense = await db
  .select()
  .from(licenses)
  .where(
    and(
        eq(licenses.licenseKey,license),
        or(
          eq(licenses.status,'Free'),
          eq(licenses.status,'Assigned'),
        )
       
  ));
    
  if (ownerType !== 'player' && checkLicense.length < 1) {
    return NextResponse.json({ message: "Invalid License Key Found." }, { status: 500 });
  }
 
  

  const randomPassword = Array(12)
    .fill(null)
    .map(() => Math.random().toString(36).charAt(2)) // Generate random characters
    .join('');
  const hashedPassword = await hash(randomPassword, 10);
  try {
    const timestamp = Date.now();
    const slug = `${first_name.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
    const user = await db
      .insert(users)

      .values({
        first_name: first_name,
        last_name: last_name,
        email: email,
        coach_id: coach_id,
        enterprise_id: enterprise_id,
        grade_level: grade_level,
        location: location,
        birthday: birthday || null,
        gender: gender,
        sport: sport,
        team: team,
        position: position,
        graduation: graduation,
        number: number,
        parent_id: parent_id,
        country: country,
        state: state,
        city: city,
        bio: bio,
        jersey: jersey,
        league: league,
        countrycode: countrycode,
        image: image,
        password: hashedPassword,
        playingcountries: playingcountries,
        height: height,
        weight: weight,
        slug: slug,
        status: 'Active'
      })

      .returning();

      if (teamId) {
        await db.insert(teamPlayers).values(
          {
            teamId: teamId,
            playerId: user[0].id,
            enterprise_id: enterprise_id,
          }
          
        ).returning();
  
      }

    const updateLicnes = await db.update(licenses).set({
      status: 'Consumed',
      used_by: user[0].id.toString(),
      used_for: 'Player',
    }).where(eq(licenses.licenseKey, license));

    const emailResult = await sendEmail({
      to: email,
      subject: "D1 NOTES Player Registration",
      text: "D1 NOTES Player Registration",
      html: `<p>Dear ${first_name}! Your account for  Coach on D1 NOTES has been created. </p><p>Find your Login credentials below.</p><p><b>Email: </b> ${email}</p><p><b>Password: </b>${randomPassword}</p><p>Click <a href="https://d1notes.com/login" target="_blank">Here to Login</a></p>`,
    });
    return NextResponse.json({ message: "Profile Completed" }, { status: 200 });
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

  }

}

export async function GET(req: NextRequest) {

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';  // Default to empty string if not provided
  const page = parseInt(url.searchParams.get('page') || '1', 10);  // Default to 1 if not provided
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);  // Default to 10 if not provided
  const enterprise_id = url.searchParams.get('enterprise_id');
  const type = url.searchParams.get('type');
  try {
    if (!enterprise_id) {
      return NextResponse.json(
        { message: 'Enterprise ID not found!' },
        { status: 500 }
      );
    }
    const offset = (page - 1) * limit;
    let whereClause;
    if(type!='player')
    {
     whereClause = search
      ? and(
        eq(users.coach_id, enterprise_id),
        or(
          ilike(users.first_name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.number, `%${search}%`)
        )
      )
      : eq(users.coach_id, enterprise_id);
    }
    else{
       whereClause = search
      ? and(
        eq(users.parent_id, Number(enterprise_id)),
        or(
          ilike(users.first_name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.number, `%${search}%`)
        )
      )
      : eq(users.parent_id,  Number(enterprise_id));
    }

    const coachesData = await db
      .select()
      .from(users)
      .where(whereClause)
      .offset(offset)
      .orderBy(desc(users.createdAt))
      .limit(limit);

    const totalCount = await db
      .select({ count: count() })/// Use raw SQL for COUNT(*) function
      .from(users)
      .where(whereClause)
      .then((result) => result[0]?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);
    return NextResponse.json({ players: coachesData, totalPages });

  } catch (error) {

    return NextResponse.json(
      { message: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}

