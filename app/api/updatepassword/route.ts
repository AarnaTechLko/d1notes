import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../../../lib/db';
import { coaches, users, enterprises, forgetPassword, teams } from '../../../lib/schema';
import debug from 'debug';
import { eq, and, gt } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';



export async function POST(req: NextRequest) {
    const { password, token } = await req.json();
    const hashedPassword = await hash(password, 10);
    let tokenExists = false;


    // Check if email exists in users ORM
    const tokens = await db
        .select()
        .from(forgetPassword)
        .where(eq(forgetPassword.token, token))
        .limit(1);
    if (tokens.length >= 1) {
        if (tokens[0].role == 'coach') {
            const user = await db.update(coaches).set({
                password: hashedPassword,
            }).where(eq(coaches.email, tokens[0].email));
        }
        if (tokens[0].role == 'player') {
           
            const user = await db.update(users).set({
                password: hashedPassword,
            }).where(eq(users.email, tokens[0].email));
        }
        if (tokens[0].role == 'enterprise') {
            
            const user = await db.update(enterprises).set({
                password: hashedPassword,
            }).where(eq(enterprises.email, tokens[0].email));
        }
        if (tokens[0].role == 'team') {
            
            const user = await db.update(teams).set({
                password: hashedPassword,
            }).where(eq(teams.manager_email, tokens[0].email));
        }
        await db.delete(forgetPassword).where(eq(forgetPassword.token, token));
        const emailResult = await sendEmail({
            to: tokens[0].email,
            subject: "D1 NOTES Reset Password.",
            text: "D1 NOTES Reset Password.",
            html: `
                <p>Your Password has been reset successfully.</p>
                <p>Your new Password: ${password}.</p>
                <p><b>Click <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login">Here</a> to Login.</b></p>
            `,
        });
    }
    else{
        return NextResponse.json({ message: "Invalid Token!" }, { status: 500 });
    }
   




  


    return NextResponse.json({ message: "Email exists" }, { status: 200 });

}