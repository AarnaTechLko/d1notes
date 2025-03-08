import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { coaches, otps, licenses, coachaccount, playerEvaluation, teamCoaches } from '../../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, between, lt, ilike, or, count, desc,sql,ne } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  const team_id = formData.get('team_id') as string;
  const license = formData.get('license') as string;
  const randomPassword = Array(12)
    .fill(null)
    .map(() => Math.random().toString(36).charAt(2)) // Generate random characters
    .join('');


  
    const checkLicense = await db
    .select()
    .from(licenses)
    .where(
      and(
          eq(licenses.licenseKey,license),
          eq(licenses.status,'Free'),
         /// eq(licenses.team_id,parseInt(team_id)),
         
    ));
    if(checkLicense.length < 1)
    {
      return NextResponse.json({ message:checkLicense.length}, { status: 500 });
    }

  const hashedPassword = await hash(randomPassword, 10);
  // Extract form fields
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const email = formData.get('email') as string;
 
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
  const teamId = formData.get('teamId') as string | null;
  const coachIdAsNumber = parseInt(coachId, 10);

  const timestamp = Date.now();
  const slug = `${firstName.trim().toLowerCase().replace(/\s+/g, '-')}-${lastName.trim().toLowerCase().replace(/\s+/g, '-')}${timestamp}`;

  const updatedUser = await db
    .insert(coaches)
    .values({
      firstName: firstName || null,
      email: email || null,
      lastName: lastName || null,
      phoneNumber: phoneNumber || null,
      enterprise_id: team_id || null,
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
      status:'Active',
      countrycode: countrycode || null,
      image: imageFile,
      password: hashedPassword
    }).returning();

    const updateLicnes=await db.update(licenses).set({
      status: 'Consumed',
      used_by: updatedUser[0].id.toString(),
      used_for: 'Coach',
    }).where(eq(licenses.licenseKey, license));
    if (teamId) {
      await db.insert(teamCoaches).values(
        {
          teamId: Number(teamId),
          coachId: updatedUser[0].id,
          enterprise_id: Number(team_id),
        }
        
      ).returning();

    }
  const emailResult = await sendEmail({
    to: email,
    subject: "D1 NOTES Coach Registration",
    text: "D1 NOTES Coach Registration",
    html: `<p>Dear ${firstName}! Your account for  Coach on D1 NOTES has been created. </p><p>Find your Login credentials below.</p><p><b>Email: </b> ${email}</p><p><b>Password: </b>${randomPassword}</p><p>Click <a href="https://d1notes.com/login" target="_blank">Here to Login</a></p>`,
  });

  return NextResponse.json({ message: "Profile Completed" }, { status: 200 });

}
export async function GET(req: NextRequest) {

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';  // Default to empty string if not provided
  const page = parseInt(url.searchParams.get('page') || '1', 10);  // Default to 1 if not provided
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);  // Default to 10 if not provided
  const team_id = url.searchParams.get('team_id');  
  try{
  if (!team_id) {
    return NextResponse.json(
      { message: 'Enterprise ID not found!' },
      { status: 500 }
    );
  }
  const offset = (page - 1) * limit;

  const whereClause = search
  ? and(
      eq(coaches.team_id, team_id),
      or(
        ilike(coaches.firstName, `%${search}%`),
        ilike(coaches.email, `%${search}%`),
        ilike(coaches.phoneNumber, `%${search}%`)
      ),
      ne(coaches.status, "Archived")  // Ensure that we are only getting active coaches
    )
  : and(
      eq(coaches.team_id, team_id),
      ne(coaches.status, "Archived")  // If no search term, still filter by active coaches
    );


    const coachesData = await db
    .select(
      {
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        gender: coaches.gender,
        image: coaches.image,
        id: coaches.id,
        email: coaches.email,
        phoneNumber: coaches.phoneNumber,
        slug: coaches.slug,
        sport: coaches.sport,
        qualifications: coaches.qualifications,
        status: coaches.status,
        consumeLicenseCount: sql<number>`COUNT(CASE WHEN licenses.status = 'Consumed' THEN 1 END)`,
        assignedLicenseCount: sql<number>`COUNT(CASE WHEN licenses.status = 'Assigned' THEN 1 END)`,
        earnings: sql<number>`SUM(CASE WHEN coachaccount.coach_id = coaches.id THEN coachaccount.amount ELSE 0 END)`, // Sum of earnings
        totalEvaluations: sql<number>`COUNT(CASE WHEN player_evaluation.status = 2 THEN player_evaluation.id END)` // Total evaluations with status = 2
      }
    )
    .from(coaches)
    .leftJoin(licenses, sql`${licenses.assigned_to} = ${coaches.id}`)
    .leftJoin(coachaccount, sql`${coachaccount.coach_id} = ${coaches.id}`) // Join coachaccount table
    .leftJoin(playerEvaluation, sql`${playerEvaluation.coach_id} = ${coaches.id}`) // Join player_evaluation table
    .where(whereClause)
    .groupBy(
      coaches.id,
      coaches.firstName,
      coaches.lastName,
      coaches.gender,
      coaches.image,
      coaches.email,
      coaches.phoneNumber,
      coaches.slug,
      coaches.sport,
      coaches.qualifications,
      coaches.status
    )
    .offset(offset)
    .orderBy(desc(coaches.createdAt))
    .limit(limit);
  

  // Query to get the total count
  const totalCount = await db
  .select({ count: count() })/// Use raw SQL for COUNT(*) function
  .from(coaches)
  .where(whereClause)
  .then((result) => result[0]?.count || 0);

  const totalLicensesCount = await db
    .select({
      count: sql<number>`COUNT(*)`
    })
    .from(licenses)
    .where(
      and(
        eq(licenses.status, 'Free'),
       // eq(licenses.team_id, Number(team_id)) // Replace `enterprise_id` with the desired variable or value
      )
    );

  const totalPages = Math.ceil(totalCount / limit);
  return NextResponse.json({coaches: coachesData, totalLicensesCount:totalLicensesCount, totalPages});

} catch (error) {
  
  return NextResponse.json(
    { 
      message: 'Failed to fetch coaches', 
      error: error instanceof Error ? error.message : String(error) // Include the error message in the response
    },
    { status: 500 }
  );
}
}
