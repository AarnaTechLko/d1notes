import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../../../lib/db';
import { coaches, users, enterprises, forgetPassword, teams } from '../../../lib/schema';
import debug from 'debug';
import { eq, and, gt } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

function generateResetToken() {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes token (64 characters)
}

export async function POST(req: NextRequest) {
    const { email, role } = await req.json();
    const token = generateResetToken();
    let userExists = false;

    if (role === 'player') {
        // Check if email exists in users ORM
        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        userExists = user.length > 0;
    } 
    else if (role === 'coach') {
        // Check if email exists in coaches ORM
        const coach = await db
            .select()
            .from(coaches)
            .where(eq(coaches.email, email))
            .limit(1);
        userExists = coach.length > 0;
    } 
    else if (role === 'enterprise') {
        // Check if email exists in enterprises ORM
        const enterprise = await db
            .select()
            .from(enterprises)
            .where(eq(enterprises.email, email))
            .limit(1);
        userExists = enterprise.length > 0;
    }
    else if (role === 'team') {
        // Check if email exists in enterprises ORM
        const enterprise = await db
            .select()
            .from(teams)
            .where(eq(teams.manager_email, email))
            .limit(1);
        userExists = enterprise.length > 0;
    }

    if (!userExists) {
        return NextResponse.json({ message: "Email not exists." }, { status: 500 });
    }

    await db.insert(forgetPassword).values({ email:email, token:token, role:role });

    const emailResult = await sendEmail({
        to: email,
        subject: "D1 NOTES Reset Password.",
        text: "D1 NOTES Reset Password.",
        html: `
            <p>Dear ${role},</p>
            <p>Click on the following link to reset your password:</p>
            <p><b>Reset password Link: </b><a href="https://d1notesupdated-five.vercel.app/reset-password?token=${token}">Reset your password</a></p>
        `,
    });


    return NextResponse.json({ message: "Email exists"}, { status: 200 });

}