import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { coaches, otps } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq,isNotNull,and, between, lt,ilike } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  const logError = debug('app:error');
  const logInfo = debug('app:info');

  try {
    logInfo('Starting the registration process');
    
    // Parse the form data
    const body = await req.json();
    const { email, password, otp } = body;

    if (!email || !password) {
      logError('Missing required fields');
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
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
    
    const insertedUser = await db.insert(coaches).values({
       
      email: email,
      
      password: hashedPassword,
      
    }).returning();
    
    const emailResult = await sendEmail({
      to: email,
      subject: "D1 NOTES Coach Registration",
      text: "D1 NOTES Coach Registration",
      html: `<p>Dear Coach! Your account creation as a Coach on D1 NOTES has been started. </p><p>Please complete your profile in next step to enjoy the evaluation from best coaches.</p>`,
  });
    // Return the response with the generated token
    return NextResponse.json({ message:"Profile Completed"}, { status: 200 });

  } catch (error) {
    const err = error as any;
     
    if (err.constraint === 'users_email_unique') {
      logError('Email already in use');
      return NextResponse.json({ message: "This Email ID is already in use." }, { status: 500 });
    }

     logError('Error during registration:', error);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const formData = await req.formData();
 

  // Extract form fields
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const gender = formData.get('gender') as string;
  const location = formData.get('location') as string;
  const sport = formData.get('sport') as string;
  const clubName = formData.get('clubName') as string;
  const qualifications = formData.get('qualifications') as string;
  const expectedCharge = formData.get('expectedCharge') as string;
  const coachId = formData.get('coachId') as string;
  const imageFile = formData.get('image') as string | null;
  const certificate = formData.get('certificate') as string | null;
  const country = formData.get('country') as string | null;
  const state = formData.get('state') as string | null;
  const city = formData.get('city') as string | null;
  const countrycode = formData.get('countrycode') as string | null;
  const coachIdAsNumber = parseInt(coachId, 10);

  const timestamp = Date.now(); 
  const slug = `${firstName.trim().toLowerCase().replace(/\s+/g, '-')}-${lastName.trim().toLowerCase().replace(/\s+/g, '-')}${timestamp}`;

  const updatedUser = await db
  .update(coaches)
  .set({
    firstName: firstName || null,
    lastName: lastName || null,
    phoneNumber: phoneNumber || null,
    location: location || null,
    clubName: clubName || null,
    gender: gender || null,
    sport: sport || null,
    qualifications: qualifications || null,
    expectedCharge: expectedCharge || null,
    certificate: certificate || null,
    country: country || null,
    state: state || null,
    city: city || null,
    slug: slug || null, 
    countrycode: countrycode || null, 
    image:imageFile
  })
  .where(eq(coaches.id, coachIdAsNumber))
  .execute();

  return NextResponse.json({ message:"Profile Completed", image:imageFile }, { status: 200 });

}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || ''; // Keep the search as a string
  const state = searchParams.get('state') || '';  
  const city = searchParams.get('city') || '';  
  const amount = searchParams.get('amount') || '';  
  const rating = searchParams.get('rating') || '';  

  try {
    const conditions = [isNotNull(coaches.firstName)];
    
    
    if (country) {
      conditions.push(eq(coaches.country, country));
    }
    if (state) {
      conditions.push(eq(coaches.state, state));
    }
    if (city) {
      conditions.push(ilike(coaches.city, city));
    }
 
    if (rating) {
      if(rating=='0')
      {
        
        conditions.push(between(coaches.rating, 0, 5));
      }
      else{
        conditions.push(eq(coaches.rating, Number(rating)));
      }
      
    }
      
    if (amount) {
      if (amount=='0') {
      conditions.push(between(coaches.expectedCharge, "0", "1000"));
      }
      else{
        conditions.push(lt(coaches.expectedCharge, amount));
      }
    }
     


    let query =  db
      .select({
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        image: coaches.image,
        clubName:coaches.clubName,
        slug:coaches.slug,
        rating:coaches.rating,
        city:coaches.city,
        country:coaches.country,
        phoneNumber:coaches.phoneNumber,
        gender:coaches.gender,
        sport:coaches.sport,
        qualifications:coaches.qualifications,
      })
      .from(coaches)
      .where(and(...conditions))
      const coachlist =await query.execute();

      const formattedCoachList = coachlist.map(coach => ({
        firstName: coach.firstName,
        lastName: coach.lastName,
        clubName:coach.clubName,
        slug:coach.slug,
        rating:coach.rating,
        city:coach.city,
        country:coach.country,
        phoneNumber:coach.phoneNumber,
        gender:coach.gender,
        sport:coach.sport,
        qualifications:coach.qualifications,
        image: coach.image ? `${coach.image}` : null,
      }));
    // Return the coach list as a JSON response
    return NextResponse.json(formattedCoachList);

  } catch (error) {
    const err = error as any;
    console.error('Error fetching coaches:', error);

    // Return an error response if fetching fails
    return NextResponse.json(
      { message: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}
