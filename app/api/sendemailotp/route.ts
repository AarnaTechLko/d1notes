import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/helpers';
import { db } from '../../../lib/db';
import { otps } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    
    // Check if the email already exists in the database
    const existingOtp = await db.select().from(otps).where(eq(otps.email, email)).limit(1).execute();
    
    let otp: string;

    if (existingOtp.length <1) {
        // Generate a new OTP if it doesn't exist
        otp = (Math.floor(100000 + Math.random() * 900000)).toString(); 
        
        // Insert the new OTP into the database
        await db.insert(otps).values({ email: email, otp: otp }).execute();
    } else {
        // Use the existing OTP from the database
        otp = existingOtp[0].otp;
    }

    // Send the email with OTP
    const emailResult = await sendEmail({
        to: email,
        subject: "D1 NOTES Registration OTP",
        text: "D1 NOTES Registration",
        html: `<p>Dear User! Your OTP for registration is ${otp}.</p>`,
    });

    return NextResponse.json({ otp }, { status: 200 });
}
