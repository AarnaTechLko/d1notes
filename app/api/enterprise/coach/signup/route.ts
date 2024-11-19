import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { coaches, otps, licenses } from '../../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, between, lt, ilike, or, count, desc } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  const enterprise_id = formData.get('enterprise_id') as string;
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
          eq(licenses.enterprise_id,parseInt(enterprise_id)),
         
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
      enterprise_id: enterprise_id || null,
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
      image: imageFile,
      password: hashedPassword
    }).returning();

    const updateLicnes=await db.update(licenses).set({
      status: 'Consumed',
      used_by: updatedUser[0].id.toString(),
      used_for: 'Player',
    }).where(eq(licenses.licenseKey, license));

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
  const enterprise_id = url.searchParams.get('enterprise_id');  
  try{
  if (!enterprise_id) {
    return NextResponse.json(
      { message: 'Enterprise ID not found!' },
      { status: 500 }
    );
  }
  const offset = (page - 1) * limit;

  const whereClause = search
    ? and(
      eq(coaches.enterprise_id, enterprise_id),
      or(
        ilike(coaches.firstName, `%${search}%`),
        ilike(coaches.email, `%${search}%`),
        ilike(coaches.phoneNumber, `%${search}%`)
      )
    )
    : eq(coaches.enterprise_id, enterprise_id);

  const coachesData = await db
    .select()
    .from(coaches)
    .where(whereClause)
    .offset(offset)
    .orderBy(desc(coaches.createdAt))
    .limit(limit);

  // Query to get the total count
  const totalCount = await db
  .select({ count: count() })/// Use raw SQL for COUNT(*) function
  .from(coaches)
  .where(whereClause)
  .then((result) => result[0]?.count || 0);

  const totalPages = Math.ceil(totalCount / limit);
  return NextResponse.json({coaches: coachesData, totalPages});

} catch (error) {
  
  return NextResponse.json(
    { message: 'Failed to fetch coaches' },
    { status: 500 }
  );
}
}
