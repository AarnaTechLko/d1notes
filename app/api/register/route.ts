// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { users, otps } from '../../../lib/schema'
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
  const { email, password, otp } = body;
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const existingOtp = await db
  .select()
  .from(otps)
  .where(and(
    eq(otps.email, email), 
    eq(otps.otp, otp)
  ))
  .limit(1)
  .execute();

  if(existingOtp.length < 1)
  {
    return NextResponse.json({ message: 'OTP Do not match. Enter valid OTP.' }, { status: 400 });
  }
    
  const hashedPassword = await hash(password, 10);

  try {
    const insertedUser = await db.insert(users).values({
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
      bio:null,
      country:null,
      state:null,
      city:null,
      jersey:null,
      password: hashedPassword, // Store the hashed password
      createdAt: new Date(), // Store the current timestamp as createdAt
    }).returning();

    const emailResult = await sendEmail({
      to: email,
      subject: "D1 NOTES Player Registration",
      text: "D1 NOTES Player Registration",
      html: `<p>Dear Player! Your account creation as a Player on D1 NOTES has been started. </p><p>Please complete your profile in next step to enjoy the evaluation from best coaches.</p>`,
  });


    return NextResponse.json({ id: insertedUser }, { status: 200 });
  } catch (error) {
    logError('Error registering user: %O', error);
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
 

  const imageFile = formData.get('image') as string | null;
  
  const playerIDAsNumber = parseInt(playerID, 10);
  try{
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
      country:country || null,
      state:state || null,
      city:city || null,
      bio:bio || null,
      jersey:jersey||null,
      league:league||null,
      countrycode:league||null,
      image:imageFile

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
  return NextResponse.json({ message:"Profile Completed", image:imageFile }, { status: 200 });
}
catch (error) {
  return NextResponse.json({ message:"Some issue occured"}, { status: 500 });

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

