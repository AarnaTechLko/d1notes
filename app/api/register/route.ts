// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { users, otps, teams, teamPlayers, coaches, licenses } from '../../../lib/schema'
import debug from 'debug';
import { eq, and, gt } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

import { SECRET_KEY } from '@/lib/constants';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import next from 'next';



export async function POST(req: NextRequest) {

  const logError = debug('app:error');
  const body = await req.json();
  const { email, password, otp, sendedBy, referenceId, team,teamId } = body;
let enterprise_id;
let team_id;
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 500 });
  }

  const checkEmail = await db.select().from(users).where(eq(users.email, email)).execute();

  if (checkEmail.length > 0) {

    return NextResponse.json({ message: 'This email already exists.' }, { status: 500 });
  }
if(sendedBy=='Club')
{
  enterprise_id=referenceId;
  team_id=teamId;
}

  // const existingOtp = await db
  //   .select()
  //   .from(otps)
  //   .where(and(
  //     eq(otps.email, email), 
  //     eq(otps.otp, otp)
  //   ))
  //   .limit(1)
  //   .execute();

 
  const hashedPassword = await hash(password, 10);

  try {
    let userValues: any = {
      first_name: null,
      last_name: null,
      grade_level: null,
      location: null,
      birthday: null,
      gender: null,
      sport: null,
      team: null,
      position: null,
      number: null,
      email: email,
      image: null,
      bio: null,
      country: null,
      state: null,
      city: null,
      enterprise_id: enterprise_id,
      team_id: team_id,
      jersey: null,
      slug: null,
      visibility: "off",
      password: hashedPassword,
      createdAt: new Date(),
    };

    
    const insertedUser = await db.insert(users).values(userValues).returning();
    // Conditionally add coach_id or enterprise_id based on sendedBy and referenceId
    if (sendedBy && referenceId) {
      // if (sendedBy === 'coach') {
      //   userValues.coach_id = referenceId;
      //   const coachQuery = await db.select().from(coaches).where(eq(coaches.id, Number(referenceId)));
      //   userValues.enterprise_id = coachQuery[0].enterprise_id;

      //   const targetLicense = await db.select().from(licenses)
      //   .where(
      //     and(
      //       eq(licenses.assigned_to, Number(referenceId)),
      //       eq(licenses.status, 'Assigned')
      //     )
      //   )
      //   .limit(1);
      
      // if (targetLicense.length > 0) {
      //   await db.update(licenses)
      //     .set({ used_by: String(insertedUser[0].id), used_for: 'Player', status:'Consumed' })
      //     .where(eq(licenses.id, targetLicense[0].id));
      // }
      // }
      // else if (sendedBy === 'Club') {
      //   userValues.enterprise_id = referenceId; 
        
      
      //     const targetLicense = await db.select().from(licenses)
      //     .where(
      //       and(
      //         eq(licenses.enterprise_id, Number(referenceId)),
      //         eq(licenses.status, 'Free')
      //       )
      //     )
      //     .limit(1);
        
      //   if (targetLicense.length > 0) {
      //     await db.update(licenses)
      //       .set({ used_by: String(insertedUser[0].id), used_for: 'Player', status:'Consumed' })
      //       .where(eq(licenses.id, targetLicense[0].id));
      //   }


      // }
      // else if (sendedBy === 'Team') {
      //   const TeamQuery = await db.select().from(teams).where(eq(teams.id, referenceId)).execute();
      //   userValues.enterprise_id = TeamQuery[0].creator_id; // Insert referenceId into enterprise_id
      // }


      
       
    }
if(teamId)
{
  try {
    await db.insert(teamPlayers).values(
      {
        teamId: Number(teamId),
        playerId: Number(insertedUser[0].id),
        enterprise_id: Number(userValues.enterprise_id),
      }

    );
  }
  catch (error) {

    const err = error as any;

    return NextResponse.json({ message: err }, { status: 500 });

  }
}
    
    const emailResult = await sendEmail({
      to: email,
      subject: "D1 NOTES Player Registration",
      text: "D1 NOTES Player Registration",
      html: `<p>Dear Player! Your account creation as a Player on D1 NOTES has been started. </p><p>Please complete your profile in the next step to enjoy the evaluation from the best coaches.</p>`,
    });

    return NextResponse.json({ id: insertedUser }, { status: 200 });

  } catch (error) {

    const err = error as any;
    if (err.constraint == 'users_email_unique') {
      return NextResponse.json({ message: "This Email ID is already in use." }, { status: 500 });
    }
  }
}


export async function PUT(req: NextRequest) {
  const logError = debug('app:error');
  const formData = await req.formData();
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const gradeLevel = formData.get('grade_level') as string;
  const location = formData.get('location') as string;
  const birthday = formData.get('birthday') as string;
  const gender = formData.get('gender') as string;
  const sport = formData.get('sport') as string;
  const team = formData.get('team') as string;
  const position = formData.get('position') as string;
  const number = formData.get('number') as string;
  const playerID = formData.get('playerID') as string;
  const country = formData.get('country') as string;
  const state = formData.get('state') as string;
  const city = formData.get('city') as string;
  const bio = formData.get('bio') as string;
  const jersey = formData.get('jersey') as string;
  const league = formData.get('league') as string;
  const countrycode = formData.get('countrycode') as string;
  const playingcountries = formData.get('playingcountries') as string;
  const height = formData.get('height') as string;
  const weight = formData.get('weight') as string;
  const graduation = formData.get('graduation') as string;
  const imageFile = formData.get('image') as string | null;
  const school_name = formData.get('school_name') as string | null;
  const gpa = formData.get('gpa') as number | null;

  const playerIDAsNumber = parseInt(playerID, 10);
  try {
    const timestamp = Date.now();
    const slug = `${firstName.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

    const updatedUser = await db
      .update(users)
      .set({
        first_name: firstName || null,
        last_name: lastName || null,
        grade_level: gradeLevel || null,
        location: location || null,
        birthday: birthday || null,
        gender: gender || null,
        sport: sport || null,
        team: team || null,
        position: position || null,
        number: number || null,
        country: country || null,
        state: state || null,
        city: city || null,
        bio: bio || null,
        jersey: jersey || null,
        league: league || null,
        countrycode: league || null,
        image: imageFile,
        slug: slug,
        playingcountries: playingcountries || null,
        height: height || null,
        weight: weight || null,
        graduation: graduation || null,
        school_name: school_name || null,
        gpa: gpa || null,
        status: "Active",
      

      })
      .where(eq(users.id, playerIDAsNumber))

      .execute();

    const user = await db
      .select({
        firstName: users.first_name,
        lastName: users.last_name,
        email: users.email // Add email to the selection
      })
      .from(users)
      .where(eq(users.id, playerIDAsNumber))
      .execute()
      .then(result => result[0]);

    const emailResult = await sendEmail({
      to: user.email,
      subject: "D1 NOTES Player Registration",
      text: "D1 NOTES Player Registration",
      html: `<p>Dear ${user.firstName} ${user.lastName || ''}! Your account creation as a Player on D1 NOTES has been started. </p><p>Please complete your profile in next step to enjoy the evaluation from best coaches.</p>`,
    });
    return NextResponse.json({ message: "Profile Completed", image: imageFile }, { status: 200 });
  }
  catch (error) {
    return NextResponse.json({ message: "Some issue occured" }, { status: 500 });

  }

}


export async function GET(req: NextRequest) {
  const logError = debug('app:error');
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'No token provided.' }, { status: 401 });
  }
  const decoded = jwt.verify(token, SECRET_KEY); // No type assertion here initially

  // Type guard to check if decoded is JwtPayload
  if (typeof decoded === 'string') {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
  }

  // Safely get userId from decoded, defaulting to null if not found
  const userId = decoded.id || null;


  return NextResponse.json({ userId }, { status: 200 });
}

