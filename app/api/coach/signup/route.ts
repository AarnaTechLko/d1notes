import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { coaches, evaluation_charges, invitations, licenses, otps, playerEvaluation, teamCoaches } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq,isNotNull,and, between, lt,ilike,sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  const logError = debug('app:error');
  const logInfo = debug('app:info');

  try {
    logInfo('Starting the registration process');
    
    // Parse the form data
    const body = await req.json();
    const { email, password, otp,sendedBy, enterprise_id , teamId} = body;

    if (!email || !password) 
    {
      logError('Missing required fields');
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

  const checkEmail=await db.select().from(coaches).where(eq(coaches.email,email)).execute(); 
    
  if (checkEmail.length>0) 
    {
       
      return NextResponse.json({ message: 'This email already exists.' }, { status: 400 });
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
  // if(existingOtp.length < 1)
  //   {
  //     return NextResponse.json({ message: 'OTP Do not match. Enter valid OTP.' }, { status: 400 });
  //   }
    const hashedPassword = await hash(password, 10);
    
    let userValues: any = {
      email: email.toLowerCase(),
      password: hashedPassword,
      enterprise_id:enterprise_id,
      createdAt: new Date(),
      visibility: "on",
      team_id:teamId
    };
 
    const insertedUser = await db.insert(coaches).values(userValues).returning();
    
    if(teamId)
    {
      if (teamId) {
        await db.insert(teamCoaches).values(
          {
            teamId: Number(teamId),
            coachId: insertedUser[0].id,
            enterprise_id: Number(enterprise_id),
          }
          
        ).returning();
  
        await db.update(invitations).set({
          status:'Joined'
        }).where(and(
          eq(invitations.team_id, Number(teamId)),
          eq(invitations.email, email),
          eq(invitations.enterprise_id, Number(enterprise_id))
        ));

      }
    }

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    const emailResult = await sendEmail({
      to: email,
      subject: "D1 NOTES Coach Registration Follow Up",
      text: "D1 NOTES Coach Registration Follow Up", 
      html: `<p>Dear Coach! Your D1 Notes <a href="${baseUrl}/login" style="font-weight: bold; color: blue">login</a> account has been created. If you have not done so already, please complete your profile in order to take advantage of all D1 Notes has to offer!</p><p className="mt-10">Regards,<br>
D1 Notes Team</p>`,
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
  const license = formData.get('license') as string | null;
  const cv = formData.get('cv') as string | null;
  const certificate = formData.get('certificate') as string | null;
  const country = formData.get('country') as string | null;
  const state = formData.get('state') as string | null;
  const currency = formData.get('currency') as string | null;
  const city = formData.get('city') as string | null;
  const countrycode = formData.get('countrycode') as string | null;
  const facebook = formData.get('facebook') as string | null;
  const instagram = formData.get('instagram') as string | null;
  const linkedin = formData.get('linkedin') as string | null;
  const xlink = formData.get('xlink') as string | null;
  const youtube = formData.get('youtube') as string | null;
  const license_type = formData.get('license_type') as string | null;
  const coachIdAsNumber = parseInt(coachId, 10);

  const timestamp = Date.now(); 
  const slug = `${firstName.trim().toLowerCase().replace(/\s+/g, '-')}-${lastName.trim().toLowerCase().replace(/\s+/g, '-')}${timestamp}`;

  const updatedUser = await db
  .update(coaches)
  .set({
    firstName: firstName || null,
    facebook: facebook || null,
    instagram: instagram || null,
    linkedin: linkedin || null,
    xlink: xlink || null,
    youtube: youtube || null,
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
    currency: currency || null,
    city: city || null,
    slug: slug || null, 
    countrycode: countrycode || null,  
    license_type: license_type || null,  
    license: license || null,  
    cv: cv || null,  
    image:imageFile,
    status:"Active",
  })
  .where(eq(coaches.id, coachIdAsNumber))
  .execute();

  const data = {
    coach_id: Number(coachIdAsNumber),
    turnaroundtime:'120',
    currency:'$',
    amount: expectedCharge,
    created_at: new Date(),
    updated_at: new Date(),
  };
  
  await db.insert(evaluation_charges).values(data);
  const user = await db
  .select({
    firstName: coaches.firstName,
    lastName: coaches.lastName,
    email: coaches.email // Add email to the selection
  })
  .from(coaches)
  .where(eq(coaches.id, coachIdAsNumber))
  .execute()
  .then(result => result[0]);

   const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host');
      const baseUrl = `${protocol}://${host}`;
  const emailResult = await sendEmail({
    to:  user.email || '',
    subject: `D1 NOTES Registration Completed for ${firstName}`,
    text: `D1 NOTES Registration Completed for ${firstName}`,
    html: `<p>Dear ${firstName}! Congratulations, your D1 Notes profile has been completed and you are now ready to take advantage of all D1 Notes has to offer! <a href="${baseUrl}/login" style="font-weight: bold; color: blue; ">Click here</a>  to get started!
    </p><p className="mt-10">Regards,<br>
D1 Notes Team</p>`,
});
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
    
    conditions.push(eq(coaches.status,'Active'));
    conditions.push(eq(coaches.visibility, 'on'));
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
        conditions.push(between(coaches.rating, '0', '5'));
      }
      else{
        conditions.push(between(coaches.rating, rating, '5'));
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
     


    let query = db
    .select({
      id: coaches.id,
      firstName: coaches.firstName,
      lastName: coaches.lastName,
      image: coaches.image,
      clubName: coaches.clubName,
      slug: coaches.slug,
      rating: coaches.rating,
      city: coaches.city,
      country: coaches.country,
      phoneNumber: coaches.phoneNumber,
      gender: coaches.gender,
      sport: coaches.sport,
      qualifications: coaches.qualifications,
      facebook: coaches.facebook,
      linkedin: coaches.linkedin,
      instagram: coaches.instagram,
      xlink: coaches.xlink,
      youtube: coaches.youtube,
      expectedCharge: coaches.expectedCharge,
      license_type: coaches.license_type,
      evaluationCount: sql<number>`
      SUM(
          CASE 
              WHEN CAST(${playerEvaluation.rating} AS TEXT) <> ''  -- Handle rating as string
              AND ${playerEvaluation.rating} IS NOT NULL -- Ensure it's not NULL
              THEN 1 
              ELSE 0 
          END
      )`.as("evaluationCount"),
    })
    .from(coaches)
    .leftJoin(playerEvaluation, eq(coaches.id, playerEvaluation.coach_id))
    .where(and(...conditions))
    .groupBy(coaches.id);

const coachlist = await query.execute();


  
    

      const formattedCoachList = coachlist.map(coach => ({
        id: coach.id,
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
        facebook:coach.facebook,
        linkedin:coach.linkedin,
        instagram:coach.instagram,
        xlink:coach.xlink,
        youtube:coach.youtube,
        evaluation_rate:coach.expectedCharge,
        license_type:coach.license_type,
        evaluationCount:coach.evaluationCount,
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
