import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { users, otps, licenses } from '../../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, between, lt, ilike, or, count, desc, inArray } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function POST(req: NextRequest) {
const {coach_id, licenseKey}=await req.json();
try{

    const licenseQuery = await db
    .select()
    .from(licenses)
    .where(
        and(
      eq(licenses.licenseKey,licenseKey),
       or(
        eq(licenses.status, 'Free'),
        eq(licenses.status, 'Assigned')
       )
       )
    )
    .execute();
  
if(licenseQuery.length < 1)
{
    return NextResponse.json(
        { message:"Invalid License Key"},
        { status: 500 }
      );
}

const coachUpdate=await db.update(users).set({ status:'Active'}).where(eq(users.id, parseInt(coach_id))).execute();

const updateResult = await db
      .update(licenses)
      .set({ assigned_to: coach_id, status:'Assigned' }) // The new status to set
      .where(eq(licenses.licenseKey, licenseKey)) // Only update records whose ids are in the list
      .execute();
    const coachData=await db.select({
    email:users.email,firstName:users.first_name }).from(users).where(eq(users.id, parseInt(coach_id))).execute();
    const coach = coachData[0];
    if(coach.email)
    {
      const emailResult = await sendEmail({
        to: coach.email,
        subject: "D1 NOTES Player Account Update",
        text: "D1 NOTES Player Account Update",
        html: `<div class="bg-gray-100 p-8">
  <div class="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    <div class="px-8 py-6">
      <h1 class="text-2xl font-semibold text-gray-800 mb-4">D1 NOTES Player Registration</h1>
      <p class="text-lg text-gray-700 mb-4">
        Dear <span class="font-semibold text-gray-800">${coach.firstName}</span>!<br />
        Contgratulation! Your account has been approved.<br />
        Please login and check your account.
      </p>
      
    </div>

    <!-- Footer -->
    <div class="bg-gray-800 text-white text-center py-4 mt-8">
      <p class="text-sm">
        &copy; 2024 D1 NOTES. All rights reserved.
      </p>
    </div>
  </div>
</div>

<!-- Tailwind CSS Mobile Responsive -->
<style>
  @media (max-width: 640px) {
    .max-w-3xl {
      max-width: 100% !important;
    }
    .px-8 {
      padding-left: 1.5rem !important;
      padding-right: 1.5rem !important;
    }
    .py-6 {
      padding-top: 1.5rem !important;
      padding-bottom: 1.5rem !important;
    }
  }
</style>
`,
      });
    }
return NextResponse.json(
    { message:"Account Approved successfully."},
    { status: 200 }
  );

      
}
catch (error)
{
    return NextResponse.json(
        { message:error},
        { status: 500 }
      );
}
 

}